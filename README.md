# Gala

[![GitHub release badge.](https://img.shields.io/github/release/galahq/gala.svg)](https://github.com/galahq/gala/releases)
![Github commits (since latest release)](https://img.shields.io/github/commits-since/galahq/gala/latest.svg)
[![CircleCI badge.](https://img.shields.io/circleci/project/github/galahq/gala.svg)](https://circleci.com/gh/galahq/gala)
[![Greenkeeper badge.](https://badges.greenkeeper.io/galahq/gala.svg)](https://greenkeeper.io/)
[![license](https://img.shields.io/github/license/galahq/gala.svg)](https://github.com/galahq/gala/blob/master/LICENSE)
[![View performance data on Skylight](https://badges.skylight.io/status/6Lds8pYSmCCl.svg?token=iomUc36sW5dvvuE2S9OWuezy1Svv-0WsgxAAVzY1PTA)](https://www.skylight.io/app/applications/6Lds8pYSmCCl)

Gala is a platform for authoring, teaching, and sharing media-rich teaching cases and modules.  

Gala is free to use at www.learngala.com and we encourage you to join the community there. A guide getting started with Gala as a user and more information about features can be found at [docs.learngala.com/docs](https://docs.learngala.com/docs).

## Dependencies

- Docker
- Ruby 3.2.6
- Node 12.5.0

#### Using rbenv

1. `rbenv install 3.2.6`
2. `rbenv shell 3.2.6`
3. `gem install bundler -v 2.4.19`
4. `bundle install --jobs 4`

#### Using nodenv

1. `nodenv install 12.5.0`
2. `nodenv shell 12.5.0`
3. `npm install yarn`
4. `yarn`

#### Using direnv

1. `direnv allow` to install the direnv hooks (sources env variables from .envrc)

## Getting started

- `docker compose up` to start the app
- `docker compose down` to stop the app
- `bundle exec rspec` to run the Ruby tests
- `yarn test` to run the Javascript tests

### Updating dependencies

When you update dependencies be sure to run these commands locally first
- `bundle install --jobs 4` to install Ruby dependencies
- `yarn` to install Javascript dependencies

Then you can run `docker compose up --build` to rebuild the containers with the new dependencies.

If you update Javascript dependencies, you'll need to additionally run `docker compose run web yarn` to install them in the web container since the node_modules directory is mounted as an anonymous volume (for performance).


#### Other useful commands

- `docker system prune -a --volumes -f` to delete all containers, images, and volumes for a fresh start
- `docker compose up --build` to rebuild the containers
- `docker compose run web yarn` to install new JS dependencies in the web container
- `docker compose run web bash` to get a shell inside the web container
- `docker volume rm gala_db_data` to delete the database volume

## Cron jobs via Heroku Scheduler

The full-text case search is powered by a Postgres materialized view so it’s
really fast. The consequence is that changes don’t appear in search results
until the view is refreshed. Set a cron job or use Heroku Scheduler or the
equivalent to run `bundle exec rake indices:refresh` as frequently as makes sense.

To send a weekly report of usage data, run `bundle exec rake emails:send_weekly_report` once
per week.

## Gala external infra
| Service | Purpose |
|---------|---------|
| [Postgres 16](https://www.postgresql.org/) | Database |
| [Redis OSS 7](https://redis.io/) | Caching and background jobs |
| [Sidekiq](https://sidekiq.org/) | Background jobs |
| [AWS S3](https://aws.amazon.com/s3/) | File storage |
| [Heroku](https://www.heroku.com/) | Production and staging environments |
| [Docker](https://www.docker.com/) | Local development environment only |
| [Sentry](https://sentry.io/) | Error monitoring |
| [Semaphore CI](https://semaphoreci.com/) | Continuous integration |
| [Github](https://github.com/) | Open source code management |

