"""BACKUP feed: Infoway Stream Hub (private gateway) — real bid/ask, no simulation.

Protocol (verified 2026-11-12/18):
  connect  {INFOWAY_HUB_WS_URL}?apiKey=<key>   → {"code":200,"type":"connected",...}
  send     {"action":"subscribe","symbols":[...]} → {"type":"subscribed","symbols":[...]}
  stream   {"type":"PRICE_UPDATE","symbol":"US30","data":{"bid":..,"ask":..,"timestamp":<unix ms>}}
  any message with code >= 400 is an error.
"""

from __future__ import annotations

import asyncio
import contextlib
import json
import logging
import time
import urllib.parse
from typing import Dict, Optional

import websockets

from .infoway_config import (
    BACKOFF_MAX_SEC,
    BACKOFF_START_SEC,
    WATCHDOG_SILENCE_SEC,
    forex_market_open,
    ms_to_iso,
    valid_quote,
)

logger = logging.getLogger("market-data.hub")

# Platform symbols NOT available on the hub (probed 2026-11-18, incl. aliases
# US100/USTEC/NDX, FTSE100/UKX, DAX40/DE40/GER30). These stay primary-only.
HUB_UNSUPPORTED = {"USDHKD", "NAS100", "UK100", "GER40"}

# Platform symbol -> hub symbol. The ONE place to change names if the hub differs.
HUB_SYMBOL_OVERRIDES: Dict[str, str] = {}


def hub_symbols(instruments: Dict[str, dict]) -> Dict[str, str]:
    """Platform -> hub symbol for every instrument the hub carries."""
    return {
        plat: HUB_SYMBOL_OVERRIDES.get(plat, plat)
        for plat in instruments
        if plat not in HUB_UNSUPPORTED
    }


class HubFeed:
    name = "hub"

    def __init__(self, api_key: str, ws_url: str, instruments: Dict[str, dict]):
        self._api_key = api_key.strip()
        self._ws_url = ws_url.strip().split("?")[0]  # log-safe base URL, never the key
        self._instruments = instruments
        self._to_hub = hub_symbols(instruments)
        self._to_platform = {hub.upper(): plat for plat, hub in self._to_hub.items()}
        self._has_crypto = any(instruments[p]["category"] == "crypto" for p in self._to_hub)

        self._tick_queue: asyncio.Queue = asyncio.Queue(maxsize=50_000)
        self._running = False
        self._task: Optional[asyncio.Task] = None
        self._last_tick_mono = 0.0

    async def start(self) -> None:
        self._running = True
        logger.info("Hub feed starting — %d symbols via %s", len(self._to_hub), self._ws_url)
        self._task = asyncio.create_task(self._run(), name="hub-feed")
        with contextlib.suppress(asyncio.CancelledError):
            await self._task

    async def stop(self) -> None:
        self._running = False
        if self._task:
            self._task.cancel()
            with contextlib.suppress(asyncio.CancelledError, Exception):
                await self._task
        logger.info("Hub feed stopped")

    async def get_tick(self) -> Optional[dict]:
        try:
            return self._tick_queue.get_nowait()
        except asyncio.QueueEmpty:
            return None

    def _redact(self, text: object) -> str:
        return str(text).replace(self._api_key, "***") if self._api_key else str(text)

    def _enqueue(self, tick: dict) -> None:
        try:
            self._tick_queue.put_nowait(tick)
        except asyncio.QueueFull:
            with contextlib.suppress(asyncio.QueueEmpty):
                self._tick_queue.get_nowait()
            self._tick_queue.put_nowait(tick)

    def _parse_price(self, msg: dict) -> Optional[dict]:
        data = msg.get("data") or {}
        plat = self._to_platform.get(str(msg.get("symbol") or data.get("symbol") or "").upper())
        if not plat:
            return None
        bid, ask = data.get("bid"), data.get("ask")
        if not valid_quote(bid, ask):
            return None
        decimals = int(self._instruments[plat]["decimals"])
        return {
            "symbol": plat,
            "bid": round(float(bid), decimals),
            "ask": round(float(ask), decimals),
            "timestamp": ms_to_iso(data.get("timestamp")),
            "volume": 1,
        }

    async def _watchdog(self, ws) -> None:
        while self._running:
            await asyncio.sleep(5.0)
            silent = time.monotonic() - self._last_tick_mono
            if silent >= WATCHDOG_SILENCE_SEC and (self._has_crypto or forex_market_open()):
                logger.error("Hub: no PRICE_UPDATE for %.0fs while market open — reconnecting", silent)
                await ws.close()
                return

    async def _run(self) -> None:
        url = f"{self._ws_url}?{urllib.parse.urlencode({'apiKey': self._api_key})}"
        delay = BACKOFF_START_SEC
        while self._running:
            watchdog: Optional[asyncio.Task] = None
            got_ticks = False
            try:
                logger.info("Hub connecting to %s", self._ws_url)
                async with websockets.connect(
                    url, ping_interval=20, ping_timeout=25, close_timeout=10
                ) as ws:
                    await ws.send(json.dumps(
                        {"action": "subscribe", "symbols": sorted(self._to_hub.values())}
                    ))
                    self._last_tick_mono = time.monotonic()
                    watchdog = asyncio.create_task(self._watchdog(ws))
                    async for raw in ws:
                        if not self._running:
                            break
                        try:
                            msg = json.loads(raw)
                        except json.JSONDecodeError:
                            continue
                        mtype = msg.get("type")
                        code = msg.get("code")
                        if mtype == "PRICE_UPDATE":
                            tick = self._parse_price(msg)
                            if tick:
                                self._enqueue(tick)
                                self._last_tick_mono = time.monotonic()
                                got_ticks = True
                        elif isinstance(code, int) and code >= 400:
                            logger.error("Hub error: %s", self._redact(msg))
                        elif mtype == "subscribed":
                            logger.info("Hub subscribed %d symbols", len(msg.get("symbols") or []))
                        elif mtype == "connected":
                            logger.info("Hub connected: %s", msg.get("message"))
                    logger.warning("Hub connection closed")
            except asyncio.CancelledError:
                break
            except Exception as exc:
                logger.warning("Hub WebSocket error: %s", self._redact(exc))
            finally:
                if watchdog:
                    watchdog.cancel()
                    with contextlib.suppress(asyncio.CancelledError, Exception):
                        await watchdog

            if not self._running:
                break
            if got_ticks:
                delay = BACKOFF_START_SEC
            logger.info("Hub reconnecting in %.0fs", delay)
            await asyncio.sleep(delay)
            delay = min(delay * 2, BACKOFF_MAX_SEC)


class FailoverFeed:
    """Primary (official Infoway) first; per symbol, backup (hub) ticks are used
    only while the primary has been silent for that symbol ≥ FAILOVER_SEC.
    Both sources are real prices — when the primary resumes it takes over again."""

    FAILOVER_SEC = 5.0

    def __init__(self, primary, backup):
        self.primary = primary
        self.backup = backup
        self._primary_seen: Dict[str, float] = {}
        self._primary_any = 0.0
        self._on_backup = False

    async def start(self) -> None:
        await asyncio.gather(self.primary.start(), self.backup.start(), return_exceptions=True)

    async def stop(self) -> None:
        await asyncio.gather(self.primary.stop(), self.backup.stop(), return_exceptions=True)

    async def get_tick(self) -> Optional[dict]:
        tick = await self.primary.get_tick()
        if tick:
            now = time.monotonic()
            self._primary_seen[tick["symbol"]] = now
            self._primary_any = now
            if self._on_backup:
                self._on_backup = False
                logger.info("Failover: primary (Infoway) ticking again — primary active")
            return tick
        while True:
            tick = await self.backup.get_tick()
            if tick is None:
                return None
            now = time.monotonic()
            if now - self._primary_seen.get(tick["symbol"], 0.0) >= self.FAILOVER_SEC:
                if not self._on_backup and now - self._primary_any >= self.FAILOVER_SEC:
                    self._on_backup = True
                    logger.warning("Failover: primary (Infoway) silent — serving backup (hub) prices")
                tick["source"] = "backup"
                return tick
            # primary is fresh for this symbol → drop the backup tick
