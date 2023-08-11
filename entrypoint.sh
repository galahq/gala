#!/bin/bash

set -e

# Check for pending migrations
echo "Checking for pending migrations..."
# TODO should we run migrations in the container?

if [ -f tmp/pids/server.pid ]; then
  rm tmp/pids/server.pid
fi

exec bundle exec "$@"