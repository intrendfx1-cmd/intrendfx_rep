"""Self-check for feed helpers + failover. Run: python -m services.market_data.src.feed_selfcheck"""
import asyncio
from datetime import datetime, timezone

from .feed_handler import INSTRUMENTS
from .hub_feed import FailoverFeed, HubFeed
from .infoway_config import forex_market_open, valid_quote


class _Q:
    def __init__(self, ticks):
        self.ticks = list(ticks)

    async def get_tick(self):
        return self.ticks.pop(0) if self.ticks else None


def _utc(*a):
    return datetime(*a, tzinfo=timezone.utc)


async def _check_failover():
    t = lambda s: {"symbol": s, "bid": 1.0, "ask": 1.1}  # noqa: E731
    group = lambda s: "crypto" if s == "BTCUSD" else "common"  # noqa: E731
    f = FailoverFeed(_Q([t("EURUSD"), t("XAUUSD")]), _Q([t("EURUSD"), t("XAUUSD"), t("BTCUSD")]), group)
    assert (await f.get_tick())["symbol"] == "EURUSD"  # primary first
    assert (await f.get_tick())["symbol"] == "XAUUSD"
    # common group just ticked → backup EURUSD + XAUUSD dropped; crypto group never ticked → BTCUSD passes
    tick = await f.get_tick()
    assert tick["symbol"] == "BTCUSD" and tick["source"] == "backup", tick
    assert await f.get_tick() is None
    # one quiet pair inside a ticking group: no flip before 60s …
    f._primary_seen["EURUSD"] -= 30
    f.backup.ticks.append(t("EURUSD"))
    assert await f.get_tick() is None
    # … but after 60s silent the backup serves it
    f._primary_seen["EURUSD"] -= 31
    f.backup.ticks.append(t("EURUSD"))
    assert (await f.get_tick())["source"] == "backup"
    # whole common socket silent ≥5s → backup immediately for any common symbol
    f._group_seen["common"] -= FailoverFeed.FAILOVER_SEC
    f.backup.ticks.append(t("XAUUSD"))
    assert (await f.get_tick())["symbol"] == "XAUUSD"
    assert "common" in f._on_backup


def main():
    # 2026-11-20 is a Friday
    assert forex_market_open(_utc(2026, 11, 20, 21, 59))
    assert not forex_market_open(_utc(2026, 11, 20, 22, 0))
    assert not forex_market_open(_utc(2026, 11, 21, 12, 0))  # Saturday
    assert not forex_market_open(_utc(2026, 11, 22, 21, 59))  # Sunday pre-open
    assert forex_market_open(_utc(2026, 11, 22, 22, 0))
    assert valid_quote(1.1, 1.2) and valid_quote(1.1, 1.1)
    for bad in [(None, 1), (0, 1), (-1, 1), (1.2, 1.1), ("x", 1)]:
        assert not valid_quote(*bad), bad
    hub = HubFeed("k", "wss://h/ws/stream?apiKey=SECRET", INSTRUMENTS)
    assert "SECRET" not in hub._ws_url and "NAS100" not in hub._to_hub
    ok = hub._parse_price({"type": "PRICE_UPDATE", "symbol": "US30",
                           "data": {"bid": 52556.5, "ask": 52558.5, "timestamp": 1794481507080}})
    assert ok["bid"] == 52556.5 and ok["ask"] == 52558.5 and ok["timestamp"].startswith("2026-")
    assert hub._parse_price({"symbol": "US30", "data": {"bid": 5, "ask": 4}}) is None  # crossed
    assert hub._parse_price({"symbol": "NAS100", "data": {"bid": 5, "ask": 6}}) is None  # not on hub
    asyncio.run(_check_failover())
    print("feed self-check OK")


if __name__ == "__main__":
    main()
