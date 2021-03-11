# Gala

[![GitHub release badge.](https://img.shields.io/github/release/galahq/gala.svg)](https://github.com/galahq/gala/releases)
![Github commits (since latest release)](https://img.shields.io/github/commits-since/galahq/gala/latest.svg)
[![CircleCI badge.](https://img.shields.io/circleci/project/github/galahq/gala.svg)](https://circleci.com/gh/galahq/gala)
[![Greenkeeper badge.](https://badges.greenkeeper.io/galahq/gala.svg)](https://greenkeeper.io/)
[![license](https://img.shields.io/github/license/galahq/gala.svg)](https://github.com/galahq/gala/blob/master/LICENSE)
[![View performance data on Skylight](https://badges.skylight.io/status/6Lds8pYSmCCl.svg?token=iomUc36sW5dvvuE2S9OWuezy1Svv-0WsgxAAVzY1PTA)](https://www.skylight.io/app/applications/6Lds8pYSmCCl)

Gala is a platform for the collaborative study of media-rich teaching cases.

## Install and Setup

You will need to have the following prerequisites installed locally in order to run Gala:

 - Ruby 2.6.6
 - Rails v6.0.2.2
 - PostgreSQL >= v9.6.17 ([Postgres.app](https://postgresapp.com/) is recommended as a one-click install for MacOS)
 - Redis

If you do not yet have Redis installed, follow instructions for your local platform to install Redis and be sure that Redis is up and running locally.

Clone the Gala codebase to your local machine:

    git clone git@github.com:galahq/gala.git

Install the required Ruby gems:

    bundle install

Install the required node packages:

    yarn install

Create and seed your development and test databases:

    rails db:setup
    rails db:test:prepare

## Cron jobs

The full-text case search is powered by a Postgres materialized view so it’s
really fast. The consequence is that changes don’t appear in search results
until the view is refreshed. Set a cron job or use Heroku Scheduler or the
equivalent to run `rake indices:refresh` as frequently as makes sense.

To send a weekly report of usage data, run `rake emails:send_weekly_report` once
per week.
