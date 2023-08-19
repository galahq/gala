#!/usr/bin/env bash

if [ "$1" = "docker" ]; then
docker-compose run -e "RAILS_ENV=test" web /bin/bash -c "
  bundle exec rails db:reset
  bundle exec rails db:test:prepare
  bundle exec rspec spec/features
"
else
  export RAILS_ENV="test"
  bundle exec rails db:reset
  bundle exec rails db:test:prepare
  bundle exec rspec spec/features
fi

