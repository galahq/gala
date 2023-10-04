# Gala

[![GitHub release badge.](https://img.shields.io/github/release/galahq/gala.svg)](https://github.com/galahq/gala/releases)
![Github commits (since latest release)](https://img.shields.io/github/commits-since/galahq/gala/latest.svg)
[![CircleCI badge.](https://img.shields.io/circleci/project/github/galahq/gala.svg)](https://circleci.com/gh/galahq/gala)
[![Greenkeeper badge.](https://badges.greenkeeper.io/galahq/gala.svg)](https://greenkeeper.io/)
[![license](https://img.shields.io/github/license/galahq/gala.svg)](https://github.com/galahq/gala/blob/master/LICENSE)
[![View performance data on Skylight](https://badges.skylight.io/status/6Lds8pYSmCCl.svg?token=iomUc36sW5dvvuE2S9OWuezy1Svv-0WsgxAAVzY1PTA)](https://www.skylight.io/app/applications/6Lds8pYSmCCl)

Gala is a platform for the collaborative study of media-rich teaching cases.

## Dependencies

- Docker
- Ruby 2.7.6
- Node 12.5.0

#### Using rbenv

1. `rbenv install 2.7.6`
2. `rbenv shell 2.7.6`
3. `gem install bundler`
4. `bundle install`

#### Using nodenv

1. `nodenv install 12.5.0`
2. `nodenv shell 12.5.0`
3. `npm install yarn`
4. `yarn`


## Getting started

- `docker compose up` to start the app
- `bundle exec rspec` to run the Ruby tests
- `yarn test` to run the Javascript tests

#### Other useful commands

- `docker-compose run web bash` to get a shell inside the web container
- `docker volume rm gala_db_data` to delete the database volume
- `docker compose up --build` to rebuild the containers

## Cron jobs

The full-text case search is powered by a Postgres materialized view so it’s
really fast. The consequence is that changes don’t appear in search results
until the view is refreshed. Set a cron job or use Heroku Scheduler or the
equivalent to run `rake indices:refresh` as frequently as makes sense.

To send a weekly report of usage data, run `rake emails:send_weekly_report` once
per week.

Run `rake locks:enqueue_cleanup` hourly to delete locks older than 8 hours.