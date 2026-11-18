"""PRIMARY feed: real-time bid/ask from official Infoway.io WebSocket (depth). No simulation."""

from __future__ import annotations

import asyncio
import contextlib
import json
import logging
import secrets
import time
import urllib.parse
from typing import Dict, List, Optional

import websockets

from .infoway_config import (
    BACKOFF_MAX_SEC,
    BACKOFF_START_SEC,
    WATCHDOG_SILENCE_SEC,
    forex_market_open,
    ms_to_iso,
    valid_quote,
)

logger = logging.getLogger("market-data.infoway")

INFOWAY_WS_BASE = "wss://data.infoway.io/ws"

# Platform symbol -> Infoway product code (crypto uses *USDT on Infoway).
CRYPTO_INFOWAY_CODES: Dict[str, str] = {
    "BTCUSD": "BTCUSDT",
    "ETHUSD": "ETHUSDT",
    "LTCUSD": "LTCUSDT",
    "XRPUSD": "XRPUSDT",
    "SOLUSD": "SOLUSDT",
}

# Infoway may use alternate product codes vs our DB symbols.
INFOWAY_SYMBOL_ALIASES: Dict[str, str] = {
    # WTI / crude aliases → our USOIL instrument
    "XTIUSD": "USOIL",
    "WTIUSD": "USOIL",
    "CLUSD": "USOIL",
}


# Infoway push symbol -> platform symbol (handles USDT pairs and aliases).
def _build_infoway_to_platform(instruments: Dict[str, dict]) -> Dict[str, str]:
    m: Dict[str, str] = {}
    for plat, _info in instruments.items():
        code = CRYPTO_INFOWAY_CODES.get(plat, plat)
        m[code.upper()] = plat
        m[plat.upper()] = plat
    for infoway_sym, plat in INFOWAY_SYMBOL_ALIASES.items():
        if plat in instruments:
            m[infoway_sym.upper()] = plat
    return m


def _trace() -> str:
    return secrets.token_hex(16)


class InfowayFeed:
    """Streams depth (best bid/ask) from Infoway `common` + `crypto` sockets."""

    name = "infoway"

    def __init__(self, api_key: str, instruments: Dict[str, dict]):
        self._api_key = api_key.strip()
        self._instruments = instruments
        self._infoway_to_platform = _build_infoway_to_platform(instruments)

        self._tick_queue: asyncio.Queue = asyncio.Queue(maxsize=50_000)
        self._running = False
        self._tasks: List[asyncio.Task] = []
        self._last_tick_mono: Dict[str, float] = {}

    @property
    def current_prices(self) -> Dict[str, float]:
        return {}

    async def start(self) -> None:
        self._running = True
        common_codes = [
            CRYPTO_INFOWAY_CODES.get(s, s)
            for s, info in self._instruments.items()
            if info["category"] != "crypto"
        ]
        crypto_codes = [
            CRYPTO_INFOWAY_CODES[s]
            for s in self._instruments
            if self._instruments[s]["category"] == "crypto"
        ]
        logger.info(
            "Infoway feed starting — common=%d symbols, crypto=%d symbols",
            len(common_codes),
            len(crypto_codes),
        )

        if common_codes:
            self._tasks.append(
                asyncio.create_task(
                    self._run_socket("common", common_codes),
                    name="infoway-common",
                )
            )
        if crypto_codes:
            self._tasks.append(
                asyncio.create_task(
                    self._run_socket("crypto", crypto_codes),
                    name="infoway-crypto",
                )
            )

        if not self._tasks:
            logger.error("No instruments configured for Infoway")
            return

        await asyncio.gather(*self._tasks, return_exceptions=True)

    async def stop(self) -> None:
        self._running = False
        for t in self._tasks:
            t.cancel()
        if self._tasks:
            await asyncio.gather(*self._tasks, return_exceptions=True)
        self._tasks.clear()
        logger.info("Infoway feed stopped")

    async def get_tick(self) -> Optional[dict]:
        try:
            return self._tick_queue.get_nowait()
        except asyncio.QueueEmpty:
            return None

    def _ws_url(self, business: str) -> str:
        q = urllib.parse.urlencode({"business": business, "apikey": self._api_key})
        return f"{INFOWAY_WS_BASE}?{q}"

    def _redact(self, text: object) -> str:
        return str(text).replace(self._api_key, "***") if self._api_key else str(text)

    def _enqueue(self, tick: dict) -> None:
        try:
            self._tick_queue.put_nowait(tick)
        except asyncio.QueueFull:
            try:
                self._tick_queue.get_nowait()
            except asyncio.QueueEmpty:
                pass
            self._tick_queue.put_nowait(tick)

    def _platform_symbol(self, raw: str) -> Optional[str]:
        if not raw:
            return None
        key = raw.strip().upper()
        return self._infoway_to_platform.get(key)

    def _emit_depth(self, data: dict) -> bool:
        raw_sym = data.get("s") or ""
        symbol = self._platform_symbol(str(raw_sym))
        if not symbol or symbol not in self._instruments:
            return False

        b = data.get("b") or []
        a = data.get("a") or []
        try:
            bid = b[0][0]
            ask = a[0][0]
        except (TypeError, IndexError):
            return False
        if not valid_quote(bid, ask):
            return False

        # Real best bid/ask from the book. Admin spread (if configured) is applied
        # around the mid when publishing — see MarketDataService._process_ticks.
        decimals = int(self._instruments[symbol]["decimals"])
        vol_b = b[1] if len(b) > 1 and b[1] else []
        vol_a = a[1] if len(a) > 1 and a[1] else []
        try:
            volume = int(float(vol_b[0]) + float(vol_a[0])) if vol_b and vol_a else 0
        except (TypeError, ValueError, IndexError):
            volume = 0

        self._enqueue({
            "symbol": symbol,
            "bid": round(float(bid), decimals),
            "ask": round(float(ask), decimals),
            "timestamp": ms_to_iso(data.get("t")),
            "volume": max(volume, 1),
        })
        return True

    async def _heartbeat_loop(self, ws) -> None:
        while self._running:
            await asyncio.sleep(20.0)
            if not self._running:
                break
            try:
                await ws.send(json.dumps({"code": 10010, "trace": _trace()}))
            except Exception as exc:
                logger.debug("Infoway heartbeat send failed: %s", self._redact(exc))
                break

    async def _watchdog(self, ws, business: str) -> None:
        """Connection open but silent for 60s during market hours → force a reconnect."""
        while self._running:
            await asyncio.sleep(5.0)
            silent = time.monotonic() - self._last_tick_mono.get(business, time.monotonic())
            market_open = business == "crypto" or forex_market_open()
            if silent >= WATCHDOG_SILENCE_SEC and market_open:
                logger.error(
                    "Infoway [%s] no depth tick for %.0fs while market open — reconnecting",
                    business, silent,
                )
                await ws.close()
                return

    async def _run_socket(self, business: str, codes: List[str]) -> None:
        if not codes:
            return
        # One depth subscription per connection; comma-separated codes.
        codes_str = ",".join(sorted(set(codes)))
        url = self._ws_url(business)
        delay = BACKOFF_START_SEC

        while self._running:
            helpers: List[asyncio.Task] = []
            got_ticks = False
            try:
                logger.info("Infoway [%s] connecting to %s", business, INFOWAY_WS_BASE)
                async with websockets.connect(
                    url,
                    ping_interval=20,
                    ping_timeout=25,
                    close_timeout=10,
                ) as ws:
                    await ws.send(json.dumps(
                        {"code": 10003, "trace": _trace(), "data": {"codes": codes_str}}
                    ))
                    logger.info(
                        "Infoway [%s] subscribed depth for %d codes", business, len(set(codes))
                    )
                    self._last_tick_mono[business] = time.monotonic()
                    helpers = [
                        asyncio.create_task(self._heartbeat_loop(ws)),
                        asyncio.create_task(self._watchdog(ws, business)),
                    ]

                    async for raw in ws:
                        if not self._running:
                            break
                        try:
                            msg = json.loads(raw)
                        except json.JSONDecodeError:
                            continue
                        code = msg.get("code")
                        if code == 10005:
                            if self._emit_depth(msg.get("data") or {}):
                                self._last_tick_mono[business] = time.monotonic()
                                got_ticks = True
                        elif code in (10004, 10001):
                            logger.debug("Infoway [%s] ack: %s", business, msg.get("msg"))
                        elif isinstance(code, int) and code >= 400:
                            logger.error(
                                "Infoway [%s] error (check API key / plan / symbol limits): %s",
                                business, self._redact(msg),
                            )
                    logger.warning("Infoway [%s] connection closed", business)
            except asyncio.CancelledError:
                break
            except Exception as exc:
                logger.warning("Infoway [%s] WebSocket error: %s", business, self._redact(exc))
            finally:
                for t in helpers:
                    t.cancel()
                    with contextlib.suppress(asyncio.CancelledError, Exception):
                        await t

            if not self._running:
                break
            if got_ticks:
                delay = BACKOFF_START_SEC
            logger.info("Infoway [%s] reconnecting in %.0fs", business, delay)
            await asyncio.sleep(delay)
            delay = min(delay * 2, BACKOFF_MAX_SEC)

        logger.info("Infoway [%s] task ended", business)
