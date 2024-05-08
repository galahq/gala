#!/bin/bash

if [[ "$RAILS_ENV" == "development" || "$RAILS_ENV" == "test" ]] && [[ -z "$SIDEKIQ_CONCURRENCY" ]]; then
  count=$(bundle exec rails runner "puts Case.count")
  if [ "${count//$'\n'/}" -eq 0 ]; then
    bundle exec rails db:environment:set RAILS_ENV=development
    bundle exec rails db:seed
    bundle exec rails db:test:prepare
  fi
fi

if [ -f tmp/pids/server.pid ]; then
  rm -f tmp/pids/server.pid
fi

exec bundle exec "$@"