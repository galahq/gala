#!/bin/bash

if [ "$RAILS_ENV" = "development" ]; then
  if [ ! -f /tmp/seeded.txt ] && [ "$1" = "foreman" ]; then
    touch /tmp/seeded.txt
    bundle exec rails db:environment:set RAILS_ENV=development
    bundle exec rails db:seed
    bundle exec rails db:test:prepare
  fi
fi

if [ -f tmp/pids/server.pid ]; then
  rm -f tmp/pids/server.pid
fi

exec bundle exec "$@"