"""Infoway feed helpers shared by the primary (official) and backup (Stream Hub) feeds."""
from datetime import datetime, timezone

# Reconnect backoff and silence watchdog (both feeds).
BACKOFF_START_SEC = 2.0
BACKOFF_MAX_SEC = 30.0
WATCHDOG_SILENCE_SEC = 60.0


def forex_market_open(now: datetime | None = None) -> bool:
    """FX/metals/indices trade Sun 22:00 UTC → Fri 22:00 UTC. Silence outside that is normal."""
    now = now or datetime.now(timezone.utc)
    wd, h = now.weekday(), now.hour  # Mon=0 … Sun=6
    if wd == 5:  # Saturday
        return False
    if wd == 4 and h >= 22:  # Friday after close
        return False
    if wd == 6 and h < 22:  # Sunday before open
        return False
    return True


def ms_to_iso(ts_ms) -> str:
    """Unix ms → '2026-11-18T06:47:00.123Z' (falls back to now)."""
    if isinstance(ts_ms, (int, float)) and ts_ms > 0:
        dt = datetime.fromtimestamp(ts_ms / 1000, tz=timezone.utc)
    else:
        dt = datetime.now(timezone.utc)
    return dt.strftime("%Y-%m-%dT%H:%M:%S.") + f"{dt.microsecond // 1000:03d}Z"


def valid_quote(bid, ask) -> bool:
    """Drop missing / zero / negative prices and crossed books (ask < bid)."""
    try:
        b, a = float(bid), float(ask)
    except (TypeError, ValueError):
        return False
    return b > 0 and a > 0 and a >= b


def usable_infoway_api_key(key: str | None) -> bool:
    """True if key looks like a real Infoway credential (not empty / tutorial text)."""
    if key is None:
        return False
    k = str(key).strip()
    if len(k) < 12:
        return False
    low = k.lower()
    for bad in (
        "placeholder",
        "your-infoway",
        "your_infoway",
        "example",
        "changeme",
        "change_me",
        "xxx",
        "todo",
        "dev-placeholder",
    ):
        if bad in low:
            return False
    if low in ("test", "none", "null", "false"):
        return False
    return True
