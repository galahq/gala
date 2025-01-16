#!/bin/bash

# enable jemalloc and yjit for reduced memory usage and latency.
if [ -f /usr/lib/*/libjemalloc.so.2 ]; then
  export LD_PRELOAD="$(echo /usr/lib/*/libjemalloc.so.2) $LD_PRELOAD"
  export MALLOC_CONF="dirty_decay_ms:1000,narenas:2,background_thread:true,stats_print:true"
  export RUBY_YJIT_ENABLE="1"
  export JEMALLOC=1
fi

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
