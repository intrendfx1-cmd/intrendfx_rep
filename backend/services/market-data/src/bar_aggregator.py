"""Bar Aggregator — Aggregates ticks into OHLCV bars for multiple timeframes."""
import asyncio
import logging
from datetime import datetime, timezone
from collections import defaultdict

from packages.common.src.redis_client import redis_client

logger = logging.getLogger("market-data.aggregator")

TIMEFRAMES = {
    "1m": 60,
    "5m": 300,
    "15m": 900,
    "30m": 1800,
    "1h": 3600,
    "4h": 14400,
    "1d": 86400,
}


class BarData:
    __slots__ = ("open", "high", "low", "close", "volume", "tick_count", "timestamp")

    def __init__(self, price: float, timestamp: str):
        self.open = price
        self.high = price
        self.low = price
        self.close = price
        self.volume = 0.0
        self.tick_count = 1
        self.timestamp = timestamp

    def update(self, price: float):
        self.high = max(self.high, price)
        self.low = min(self.low, price)
        self.close = price
        self.tick_count += 1


class BarAggregator:
    def __init__(self):
        self._bars: dict[str, dict[str, BarData]] = defaultdict(dict)
        self._bar_timestamps: dict[str, dict[str, int]] = defaultdict(dict)
        # STRONG references to in-flight _store_bar tasks. asyncio only keeps
        # WEAK references to tasks, so a bare asyncio.create_task(...) whose
        # result nobody holds can be garbage-collected mid-await — silently,
        # with no exception. Under load that dropped closed bars = chart gaps
        # (ticks healthy, bars missing, logs clean). Hold every task until it
        # finishes; discard on completion.
        self._store_tasks: set = set()

    def _spawn_store(self, symbol: str, tf_name: str, bar: "BarData", bar_start: int) -> None:
        """Persist a closed bar while holding a STRONG reference to the task
        (see _store_tasks). Failures are logged instead of vanishing."""
        task = asyncio.create_task(self._store_bar(symbol, tf_name, bar, bar_start))
        self._store_tasks.add(task)

        def _done(t: "asyncio.Task") -> None:
            self._store_tasks.discard(t)
            if t.cancelled():
                logger.warning("bar store CANCELLED %s %s @%s", symbol, tf_name, bar_start)
                return
            exc = t.exception()
            if exc is not None:
                logger.error("bar store FAILED %s %s @%s: %r", symbol, tf_name, bar_start, exc)

        task.add_done_callback(_done)

    def update(self, symbol: str, bid: float, ask: float, timestamp: str):
        mid = (bid + ask) / 2
        now = datetime.fromisoformat(timestamp).replace(tzinfo=timezone.utc)
        epoch = int(now.timestamp())

        for tf_name, tf_seconds in TIMEFRAMES.items():
            bar_start = (epoch // tf_seconds) * tf_seconds

            current_start = self._bar_timestamps.get(symbol, {}).get(tf_name)

            if current_start != bar_start:
                # Persist the bar that just closed. The guard MUST use tf_name:
                # self._bars[symbol] is keyed by timeframe ("1m"), not by
                # "SYMBOL:1m". It used to check a `key = f"{symbol}:{tf_name}"`
                # which never matched the nested dict — so this branch never ran,
                # _store_bar was never called from update(), and the line below
                # overwrote the finished candle. Closed bars only survived when
                # the 1s loop happened to fire before the next tick.
                if current_start is not None and tf_name in self._bars.get(symbol, {}):
                    old_bar = self._bars[symbol].pop(tf_name, None)
                    if old_bar:
                        self._spawn_store(symbol, tf_name, old_bar, current_start)

                if symbol not in self._bars:
                    self._bars[symbol] = {}
                self._bars[symbol][tf_name] = BarData(mid, timestamp)

                if symbol not in self._bar_timestamps:
                    self._bar_timestamps[symbol] = {}
                self._bar_timestamps[symbol][tf_name] = bar_start
            else:
                if symbol in self._bars and tf_name in self._bars[symbol]:
                    self._bars[symbol][tf_name].update(mid)

    async def _store_bar(self, symbol: str, timeframe: str, bar: BarData, bar_start: int):
        import json
        bar_data = {
            "symbol": symbol,
            "timeframe": timeframe,
            "time": bar_start,
            "open": bar.open,
            "high": bar.high,
            "low": bar.low,
            "close": bar.close,
            "volume": bar.volume,
            "tick_count": bar.tick_count,
        }

        bar_key = f"bar:{symbol}:{timeframe}"
        await redis_client.set(bar_key, json.dumps(bar_data))

        list_key = f"bars:{symbol}:{timeframe}"
        await redis_client.lpush(list_key, json.dumps(bar_data))
        await redis_client.ltrim(list_key, 0, 999)

    async def run_aggregation_loop(self):
        """Periodically publish current bar state to Redis for chart consumers."""
        import json
        while True:
            for symbol, timeframes in list(self._bars.items()):
                for tf_name, bar in list(timeframes.items()):
                    bar_data = {
                        "symbol": symbol,
                        "timeframe": tf_name,
                        "open": bar.open,
                        "high": bar.high,
                        "low": bar.low,
                        "close": bar.close,
                        "volume": bar.volume,
                        "tick_count": bar.tick_count,
                    }
                    bar_key = f"bar:current:{symbol}:{tf_name}"
                    await redis_client.set(bar_key, json.dumps(bar_data))

            await asyncio.sleep(1)
