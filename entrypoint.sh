#!/bin/bash

set -e

if [ "$RAILS_ENV" = "development" ]; then
  if [ ! -f /tmp/seeded.txt ] && [ "$1" = "foreman" ]; then
    touch /tmp/seeded.txt
    bundle exec rails db:seed
  fi
fi

if [ -f tmp/pids/server.pid ]; then
  rm -f tmp/pids/server.pid
fi

exec bundle exec "$@"