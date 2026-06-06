# Gala

[![ci](https://github.com/galahq/gala/actions/workflows/ci.yml/badge.svg)](https://github.com/galahq/gala/actions/workflows/ci.yml)
[![license](https://img.shields.io/github/license/galahq/gala.svg)](https://github.com/galahq/gala/blob/main/LICENSE)
[![Greenkeeper badge.](https://badges.greenkeeper.io/galahq/gala.svg)](https://greenkeeper.io/)

Gala is a platform for authoring, teaching, and sharing media-rich teaching cases and modules.

Gala is free to use at www.learngala.com and we encourage you to join the community there. A guide getting started with Gala as a user and more information about features can be found at [docs.learngala.com/docs](https://docs.learngala.com/docs).

## v2.9.9 release candidate

PR #785 occupies the remaining slot in the v2 release space and is explicitly
versioned as `v2.9.9`. This release candidate is scoped to the AWS/SST
infrastructure described in `infra/sst.config.ts` for `learngala.dev`,
`dev.learngala.dev`, and `*.dev.learngala.dev`.

The current `learngala.com` production domain must remain preserved. The v3
release line is reserved for a future DNS cutover, and that cutover is deferred.

## Dependencies

Docker is required for local app startup.

- Docker
- Ruby 4.0.3
- Node 24.15.0
- pnpm 11.1.0
- jemalloc (via `Aptfile` + Docker, preloaded in `entrypoint.sh`)

Deployments target the `heroku-22` stack in `app.json`. Local Docker mirrors that stack behavior for libc/jemalloc.

#### Recommended toolchain with mise

1. Install `mise` (once).
2. `cd gala && mise install` (reads `.mise.toml` for Ruby/Node versions).
3. `direnv allow` (optional; activates `.envrc`).
4. Verify: `ruby -v`, `node -v`, `pnpm -v`.

## Getting started

Docker is required and is the canonical local run path.

### Local development workflow

The trusted local developer environment is Ghostty, tmux, Codex, and Neovim.
Use `bin/dev` when you want the repo-owned tmux session manager:

```bash
EDITOR=nvim bin/dev
```

Useful commands:

- `bin/dev` opens the interactive tmux session menu
- `bin/dev new [SESSION]` creates or attaches to a dedicated Gala tmux session
- `bin/dev stack [SESSION]` opens the Docker Compose stack window
- `bin/dev list` lists sessions on the project tmux server

### Copy-and-run example (minimal)

```bash
git clone https://github.com/galahq/gala.git
cd gala
cp .env.example .env
docker compose up --build
```

Then open `http://localhost:3000`.

- `docker compose up` to start or `docker compose up --build` after dependency/env changes
- `docker compose down` to stop
- `bundle exec rake test:unit` to run the Ruby tests
- `pnpm test` to run the Javascript tests

### Running two local stacks

To run two Gala clones side by side, give each clone its own `COMPOSE_PROJECT_NAME`
and host ports in `.env`:

- `APP_HOST_PORT` controls Rails on the host, default `3000`
- `ANYCABLE_HOST_PORT` controls AnyCable-Go on the host, default `3002`
- `REDIS_HOST_PORT` controls Valkey on the host, default `6379`

Example for a second clone:

```dotenv
COMPOSE_PROJECT_NAME=gala_main
APP_HOST_PORT=3001
ANYCABLE_HOST_PORT=3003
REDIS_HOST_PORT=6380
BASE_URL=http://localhost:3001
```

If you use host-side Rails or Redis commands with `.env.dev`, update
`DATABASE_URL` and `REDIS_URL` there to match the published host ports.

### Updating dependencies

When you update dependencies run:
- `bundle install --jobs 4`
- `pnpm install --frozen-lockfile`

Then you can run `docker compose up --build` to rebuild the containers with the new dependencies.

If you update Javascript dependencies, run `docker compose run web pnpm install --frozen-lockfile` after `up` because `node_modules` is mounted as a container volume.

The JavaScript build now runs through Vite/Rollup via `pnpm run build:js:watch`.
The CSS build runs through Dart Sass via `pnpm run build:css -- --watch`.
Blueprint styles now import the package CSS artifacts from `@blueprintjs/*`
instead of the unpublished source SCSS paths.

#### Other useful commands

- `docker system prune -a --volumes -f` to delete all containers, images, and volumes for a fresh start
- `docker compose up --build` to rebuild the containers
- `docker compose run web pnpm install --frozen-lockfile` to install new JS dependencies in the web container
- `docker compose run web bash` to get a shell inside the web container
- `docker volume rm gala_db_data` to delete the database volume
- `./run-rspec.sh` to run the Rails spec suite with a dedicated test database URL and `RAILS_ENV=test`
- `./run-rspec.sh spec/requests/catalog_routes_spec.rb` to run a focused RSpec file

Conventional DB setup for local test runs:

- Container path (recommended when host Ruby/DB tooling is out of sync):

```bash
docker compose run --rm \
  -e RAILS_ENV=test \
  -e DATABASE_URL=postgres://gala:alpine@db:5432/gala_test \
  web bundle exec rspec spec/requests/catalog_routes_spec.rb
```

- Host path (when local Ruby/Postgres matches project requirements):

```bash
RAILS_ENV=test \
DATABASE_URL=postgres://gala:alpine@localhost:5432/gala_test \
bundle exec rails db:prepare && \
bundle exec rspec spec/requests/catalog_routes_spec.rb
```

If you are still seeing `PG::ConnectionNotEstablished` or connection refused errors:

- confirm PostgreSQL is running at the host URL in `DATABASE_URL`
- confirm the host/db command uses the `gala_test` database name
- prefer `./run-rspec.sh` so test DB URL and schema preparation are explicit

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
| [GitHub Actions](https://github.com/features/actions/) | Continuous integration |
| [Github](https://github.com/) | Open source code management |
