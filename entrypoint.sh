#!/bin/bash

# enable jemalloc for reduced memory usage and latency.
if [ -f "/usr/lib/*/libjemalloc.so.2" ]; then
  LD_PRELOAD="$(echo /usr/lib/*/libjemalloc.so.2) $LD_PRELOAD"
  if [ -z "$LD_PRELOAD" ]; then
    echo "exporting LD_PRELOAD -> $LD_PRELOAD"
    export LD_PRELOAD="$LD_PRELOAD"
  fi
  MALLOC_CONF="dirty_decay_ms:1000,narenas:2,background_thread:true,stats_print:false"
  if [ -z "$MALLOC_CONF" ]; then
    MALLOC_CONF="dirty_decay_ms:1000,narenas:2,background_thread:true,stats_print:false"
    echo "exporting MALLOC_CONF -> $MALLOC_CONF"
    export MALLOC_CONF="$MALLOC_CONF"
  fi
fi


if [ "$RAILS_ENV" = "development" ]; then
  count=$(bundle exec rails runner "puts Case.count" | tail -n 1)
  if [ "$count" -eq "0" ]; then
    bundle exec rails db:environment:set
    bundle exec rails db:seed
    bundle exec rails db:test:prepare
    bundle exec rake indices:refresh
  fi
fi

rm -f tmp/pids/server.pid

exec "$@"