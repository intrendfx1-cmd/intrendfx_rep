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
back to Binance if InfoWay has no klines. Symbols with no real source are
SKIPPED — charts never show fake/simulated bars.
"""
import asyncio
import json
import logging
import sys

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


async def seed(force: bool = False):
    """Backfill historical bars into Redis from InfoWay (same source as live).

    Preference per (symbol, tf): InfoWay REST → Binance (crypto only) →
    skip (never simulated). No anchoring — InfoWay history already sits on the live
    price level.
    """
    token = (getattr(get_settings(), "INFOWAY_API_KEY", "") or "").strip()
    if not token:
        logger.warning("INFOWAY_API_KEY not set — InfoWay history unavailable, "
                       "crypto will use Binance and the rest will be skipped.")

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
        is_crypto = sym in BINANCE_PAIRS
        logger.info("Seeding %s", sym)

        for tf_name in TIMEFRAMES:
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

            # 3. No real history → leave it empty (live bars build from real ticks).
            if not bars:
                logger.warning("  %s:%s no real history available — skipped", sym, tf_name)
                continue

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


if __name__ == "__main__":
    # --force overwrites existing bars (needed to replace old seed data).
    asyncio.run(seed(force="--force" in sys.argv))
