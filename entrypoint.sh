#!/bin/bash

# jemalloc is enabled via LD_PRELOAD/MALLOC_CONF in the Dockerfile.

if [ "$RAILS_ENV" = "development" ]; then
  count=$(bundle exec rails runner "puts \"CASE_COUNT:#{Case.count}\"" | grep '^CASE_COUNT:' | cut -d: -f2)
  echo "CASE_COUNT_BEFORE_SEED: $count"

  bundle exec rails db:environment:set
  bundle exec rails db:seed

  refreshed_count=$(bundle exec rails runner "puts \"CASE_COUNT:#{Case.count}\"" | grep '^CASE_COUNT:' | cut -d: -f2)
  echo "CASE_COUNT_AFTER_SEED: $refreshed_count"

  if [ "$count" -eq "0" ]; then
    bundle exec rake indices:refresh
  fi
fi

rm -f tmp/pids/server.pid

exec "$@"
