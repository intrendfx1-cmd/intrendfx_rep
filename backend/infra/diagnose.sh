#!/usr/bin/env bash
# inTrendFX server diagnostic — health, API speed, load & spread in one shot.
# Run on the server (where docker compose lives):
#   bash backend/infra/diagnose.sh
# Optional: pass symbols to spot-check spread (default: EURUSD GBPUSD XAUUSD)
#   bash backend/infra/diagnose.sh EURUSD USDJPY BTCUSD

set -uo pipefail

GATEWAY="${GATEWAY_URL:-http://localhost:8000}"
SYMBOLS=("${@:-EURUSD GBPUSD XAUUSD}")
# Split a single quoted arg ("EURUSD GBPUSD") into words too
SYMBOLS=($(echo "${SYMBOLS[@]}"))

line() { printf '%.0s─' {1..60}; echo; }
hdr()  { echo; line; echo "  $1"; line; }

# ─────────────────────────────────────────────────────────
hdr "1) CONTAINERS — up? how long?"
docker compose ps

# ─────────────────────────────────────────────────────────
hdr "2) LOAD — live CPU / RAM per service"
docker stats --no-stream --format \
  "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

# ─────────────────────────────────────────────────────────
hdr "3) API SPEED — gateway response times"
check() {
  local name="$1" url="$2"
  local out
  out=$(curl -s -o /dev/null -w "%{http_code} %{time_total}s" "$url" 2>/dev/null) \
    || { echo "  $name -> UNREACHABLE"; return; }
  echo "  $name -> HTTP ${out%% *}  in  ${out##* }"
}
check "health        " "$GATEWAY/health"
check "instruments   " "$GATEWAY/api/v1/instruments"
check "trading-catalog" "$GATEWAY/api/v1/trading-catalog"

# ─────────────────────────────────────────────────────────
hdr "4) SPREAD — live bid/ask from Redis (tick:<SYMBOL>)"
# market-data writes JSON {symbol,bid,ask,spread} to key tick:<SYMBOL> on db 0
for raw in "${SYMBOLS[@]}"; do
  sym=$(echo "$raw" | tr '[:lower:]' '[:upper:]' | xargs)
  [ -z "$sym" ] && continue
  json=$(docker compose exec -T redis redis-cli GET "tick:$sym" 2>/dev/null)
  if [ -z "$json" ] || [ "$json" = "(nil)" ]; then
    echo "  $sym -> NO TICK (symbol inactive or feed down)"
  else
    echo "  $sym -> $json"
  fi
done

echo
echo "  Spread params last reloaded by market-data:"
docker compose logs --tail=200 market-data 2>/dev/null \
  | grep -i "Reloaded stream spread" | tail -n 1 | sed 's/^/    /'

# ─────────────────────────────────────────────────────────
hdr "5) RECENT ERRORS — last 20 across gateway & market-data"
docker compose logs --tail=300 gateway market-data 2>/dev/null \
  | grep -iE "error|exception|traceback|failed|timeout" | tail -n 20 | sed 's/^/  /' \
  || echo "  (none)"

echo; line; echo "  Done."; line
