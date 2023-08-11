#!/usr/bin/env bash

docker-compose run -e "RAILS_ENV=test" web /bin/bash -c "
bundle exec rails db:reset
bundle exec rails db:test:prepare
bundle exec rails spec spec/features
"