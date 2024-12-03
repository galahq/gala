#!/bin/bash

RAILS_ENV="${RAILS_ENV:-development}"
echo "********** RAILS_ENV=$RAILS_ENV"

# Enable jemalloc for reduced memory usage and latency.
if [ -f /usr/lib/*/libjemalloc.so.2 ]; then
  export LD_PRELOAD="$(echo /usr/lib/*/libjemalloc.so.2) $LD_PRELOAD"
fi


if [ "$RAILS_ENV" = "development" ] && [ -z "$SIDEKIQ_CONCURRENCY" ]; then
  count=$(bundle exec rails runner "puts Case.count")
  if [ "${count//$'\n'/}" -eq 0 ]; then
    bundle exec rails db:environment:set RAILS_ENV=development
    bundle exec rails db:seed
    bundle exec rails db:test:prepare
  fi
fi

rm -f /app/tmp/pids/server.pid

# Write the version to a file
echo "${VERSION:-unknown}" > /app/tmp/version

exec "$@"