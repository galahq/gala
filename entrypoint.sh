#!/bin/bash
set -euo pipefail

export LD_PRELOAD="${LD_PRELOAD:-}"
export MALLOC_CONF="${MALLOC_CONF:-}"

# enable jemalloc for reduced memory usage and latency.
if ls /usr/lib/*/libjemalloc.so.2 >/dev/null 2>&1; then
  export LD_PRELOAD="$(echo /usr/lib/*/libjemalloc.so.2) $LD_PRELOAD"
  export MALLOC_CONF="dirty_decay_ms:1000,narenas:2,background_thread:true,stats_print:false"
fi

if [ "$RAILS_ENV" = "development" ]; then
  count=$(bundle exec rails runner "puts \"CASE_COUNT:#{Case.count}\"" | grep '^CASE_COUNT:' | cut -d: -f2)
  echo "CASE_COUNT: $count"
  if [ "$count" -eq "0" ]; then
    bundle exec rails db:environment:set
    bundle exec rails db:seed
    bundle exec rails db:test:prepare
    bundle exec rake indices:refresh
  fi
fi

rm -f tmp/pids/server.pid

exec "$@"