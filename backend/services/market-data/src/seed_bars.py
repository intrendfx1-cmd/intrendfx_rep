"""Seed historical OHLCV bars into Redis for all active instruments.

Run once (or on demand) to backfill chart history so the TradingView
Advanced Chart has candles to display immediately.

Usage (inside the market-data container):
    python -m services.market_data.src.seed_bars            # seed empty symbols
    python -m services.market_data.src.seed_bars --force     # overwrite existing

Source of truth is InfoWay's REST klines — the SAME provider as the live
WebSocket feed. History and live therefore share one price source, so the
chart has NO basis seam and needs NO anchoring hack (the old Yahoo/TwelveData
seed came from a different source and sat a few dollars off). Crypto falls
back to Binance if InfoWay has no klines; anything with no real source at all
falls back to a simulated walk so the chart is never blank.
"""
import asyncio
import json
import logging
import math
import random
import sys
import time

import httpx

from packages.common.src.config import get_settings
from packages.common.src.infoway_rest import fetch_klines as _infoway_klines
from packages.common.src.redis_client import redis_client

logger = logging.getLogger("seed-bars")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)-5s %(message)s")

TIMEFRAMES = {
    "1m": 60,
    "5m": 300,
    "15m": 900,
    "30m": 1800,
    "1h": 3600,
    "4h": 14400,
    "1d": 86400,
}

# Binance kline interval names (crypto fallback only)
_TF_TO_BINANCE_INTERVAL: dict[str, str] = {
    "1m": "1m", "5m": "5m", "15m": "15m", "30m": "30m",
    "1h": "1h", "4h": "4h", "1d": "1d",
}

# Platform symbol → Binance REST pair
BINANCE_PAIRS: dict[str, str] = {
    "BTCUSD": "BTCUSDT", "ETHUSD": "ETHUSDT", "LTCUSD": "LTCUSDT",
    "XRPUSD": "XRPUSDT", "SOLUSD": "SOLUSDT", "BNBUSD": "BNBUSDT",
    "DOGEUSD": "DOGEUSDT", "ADAUSD": "ADAUSDT",
}

BARS_COUNT = 500
SPACING = 0.3  # seconds between REST calls — gentle on the InfoWay rate budget

VOLATILITY = {
    "forex": 0.0001,
    "crypto": 0.003,
    "indices": 0.001,
    "commodities": 0.0015,
    "stocks": 0.002,
}


def _guess_segment(symbol: str) -> str:
    s = symbol.upper()
    if s in BINANCE_PAIRS:
        return "crypto"
    if s in ("XAUUSD", "XAGUSD", "USOIL"):
        return "commodities"
    if s in ("US30", "US500", "NAS100", "UK100", "GER40"):
        return "indices"
    return "forex"


async def _fetch_binance_klines(symbol: str, tf_name: str, count: int = 500) -> list[dict]:
    """Fetch real historical klines from Binance public REST API (crypto fallback)."""
    pair = BINANCE_PAIRS.get(symbol.upper())
    if not pair:
        return []

    interval = _TF_TO_BINANCE_INTERVAL.get(tf_name, "5m")
    params = {"symbol": pair, "interval": interval, "limit": min(count, 1000)}

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get("https://api.binance.com/api/v3/klines", params=params)
            if resp.status_code != 200:
                logger.warning("Binance HTTP %s for %s %s", resp.status_code, symbol, tf_name)
                return []
            data = resp.json()
    except Exception as exc:
        logger.warning("Binance fetch failed for %s %s: %s", symbol, tf_name, exc)
        return []

    bars = []
    for k in data:
        bars.append({
            "time": int(k[0]) // 1000,  # open_time ms → epoch seconds
            "open": float(k[1]),
            "high": float(k[2]),
            "low": float(k[3]),
            "close": float(k[4]),
            "volume": float(k[5]),
        })
    return bars


def _generate_bars(base_price: float, segment: str, tf_seconds: int, count: int) -> list[dict]:
    """Last-resort simulated OHLCV walk anchored to current price (used only
    when neither InfoWay nor Binance has data for a symbol)."""
    vol = VOLATILITY.get(segment, 0.001)
    bar_vol = vol * math.sqrt(tf_seconds / 60)

    now = int(time.time())
    bar_start = (now // tf_seconds) * tf_seconds

    bars = []
    price = base_price

    for i in range(count, 0, -1):
        t = bar_start - i * tf_seconds
        change = random.gauss(0, bar_vol) * price
        open_p = price
        moves = [open_p]
        for _ in range(4):
            moves.append(moves[-1] + random.gauss(0, bar_vol * 0.5) * price)
        close_p = moves[-1]
        high_p = max(moves) + abs(random.gauss(0, bar_vol * 0.2) * price)
        low_p = min(moves) - abs(random.gauss(0, bar_vol * 0.2) * price)

        high_p = max(high_p, open_p, close_p)
        low_p = min(low_p, open_p, close_p)

        bars.append({
            "time": t,
            "open": round(open_p, 6),
            "high": round(high_p, 6),
            "low": round(low_p, 6),
            "close": round(close_p, 6),
            "volume": round(random.uniform(10, 1000), 2),
        })
        price = close_p + change * 0.3

    return bars


async def _current_mid(symbol: str) -> float:
    """Live mid for a symbol from Redis (only needed for the simulated fallback)."""
    raw = await redis_client.get(f"tick:{symbol}")
    if raw:
        try:
            d = json.loads(raw)
            mid = (float(d.get("bid", 0)) + float(d.get("ask", 0))) / 2
            if mid > 0:
                return mid
        except Exception:
            pass
    raw = await redis_client.get(f"bar:current:{symbol}:1m")
    if raw:
        try:
            d = json.loads(raw)
            return (float(d.get("open", 0)) + float(d.get("close", 0))) / 2
        except Exception:
            pass
    return 0.0


async def seed(force: bool = False):
    """Backfill historical bars into Redis from InfoWay (same source as live).

    Preference per (symbol, tf): InfoWay REST → Binance (crypto only) →
    simulated walk. No anchoring — InfoWay history already sits on the live
    price level.
    """
    token = (getattr(get_settings(), "INFOWAY_API_KEY", "") or "").strip()
    if not token:
        logger.warning("INFOWAY_API_KEY not set — InfoWay history unavailable, "
                       "crypto will use Binance and the rest will be simulated.")

    # Discover symbols from Redis (bar:current first, then tick:*).
    symbols: set[str] = set()
    cursor = 0
    while True:
        cursor, keys = await redis_client.scan(cursor, match="bar:current:*:1m", count=200)
        for k in keys:
            parts = k.split(":")
            if len(parts) >= 3:
                symbols.add(parts[2])
        if cursor == 0:
            break
    cursor = 0
    while True:
        cursor, keys = await redis_client.scan(cursor, match="tick:*", count=200)
        for k in keys:
            parts = k.split(":")
            if len(parts) >= 2:
                sym = parts[1].upper()
                if sym and len(sym) <= 10:
                    symbols.add(sym)
        if cursor == 0:
            break

    if not symbols:
        logger.warning("No symbols found in Redis. Is market-data running?")
        return

    logger.info("Found %d symbols: %s", len(symbols), ", ".join(sorted(symbols)))

    for sym in sorted(symbols):
        segment = _guess_segment(sym)
        is_crypto = sym in BINANCE_PAIRS
        logger.info("Seeding %s (segment=%s)", sym, segment)

        for tf_name, tf_seconds in TIMEFRAMES.items():
            list_key = f"bars:{sym}:{tf_name}"

            if not force:
                existing = await redis_client.llen(list_key)
                if existing >= 100:
                    logger.info("  %s:%s already has %d bars, skipping", sym, tf_name, existing)
                    continue

            # 1. InfoWay REST — same provider as the live feed (no basis seam).
            bars = await _infoway_klines(sym, tf_name, count=BARS_COUNT, token=token) if token else []
            src = "infoway"
            called_remote = bool(bars)

            # 2. Crypto fallback → Binance (real klines).
            if not bars and is_crypto:
                bars = await _fetch_binance_klines(sym, tf_name, BARS_COUNT)
                src = "binance"
                called_remote = called_remote or bool(bars)

            # 3. Last resort → simulated walk anchored to the live price.
            if not bars:
                mid = await _current_mid(sym)
                if mid <= 0:
                    logger.info("  %s:%s no source and no live price — skipped", sym, tf_name)
                    continue
                bars = _generate_bars(mid, segment, tf_seconds, BARS_COUNT)
                src = "simulated"

            # Overwrite the list with the fresh bars (newest at index 0).
            pipe = redis_client.pipeline()
            pipe.delete(list_key)
            for bar in bars:
                bar["symbol"] = sym
                bar["timeframe"] = tf_name
                pipe.lpush(list_key, json.dumps(bar))
            pipe.ltrim(list_key, 0, 999)
            await pipe.execute()
            logger.info("  %s:%s → %d bars seeded (%s)", sym, tf_name, len(bars), src)

            if called_remote:
                await asyncio.sleep(SPACING)

    logger.info("Done seeding all symbols.")


def _selftest() -> None:
    # _generate_bars: OHLC invariants hold (high is the max, low is the min).
    bars = _generate_bars(4500.0, "commodities", 300, 50)
    assert len(bars) == 50
    for b in bars:
        assert b["high"] >= max(b["open"], b["close"])
        assert b["low"] <= min(b["open"], b["close"])
        assert b["high"] >= b["low"]
    # times strictly increasing on the tf grid
    times = [b["time"] for b in bars]
    assert times == sorted(times) and len(set(times)) == len(times)
    print("seed_bars self-check OK")


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        _selftest()
    else:
        # --force overwrites existing bars (needed to replace old seed data).
        asyncio.run(seed(force="--force" in sys.argv))
