#!/bin/bash

if [ "$RAILS_ENV" = "development" ]; then
  if [ ! -f /tmp/seeded.txt ] && [ "$1" = "foreman" ]; then
    touch /tmp/seeded.txt
    bundle exec rails db:seed > /dev/null 2>&1
  fi
fi

if [ -f tmp/pids/server.pid ]; then
  rm -f tmp/pids/server.pid
fi

exec bundle exec "$@"