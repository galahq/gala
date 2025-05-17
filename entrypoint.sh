#!/bin/bash

# enable jemalloc for reduced memory usage and latency.
for jemalloc in /usr/lib/*/libjemalloc.so.2; do
  if [ -f "$jemalloc" ]; then
    export LD_PRELOAD="$jemalloc $LD_PRELOAD"
    export MALLOC_CONF="dirty_decay_ms:1000,narenas:2,background_thread:true,stats_print:false"
  fi
done

if [ "$RAILS_ENV" = "development" ]; then
  if [ ! -f /tmp/.seeded ]; then
    touch /tmp/.seeded
    count=$(bundle exec rails runner "puts Case.count" | tail -n 1)
    if [ "$count" -eq "0" ]; then
      bundle exec rails db:environment:set
      bundle exec rails db:seed
      bundle exec rails db:test:prepare
      bundle exec rake indices:refresh
    fi
  fi
fi

rm -f tmp/pids/server.pid

exec "$@"