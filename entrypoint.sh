#!/bin/bash

set -e

if db_version=$(bundle exec rails db:version 2>/dev/null)
then
    if [ "$db_version" = "Current version: 0" ]; then
        echo "DB is empty"
    else
        echo "DB exists"
    fi
else
    echo "DB does not exist"
    bundle exec rails db:prepare
fi

if [ -f tmp/pids/server.pid ]; then
  rm tmp/pids/server.pid
fi

exec bundle exec "$@"