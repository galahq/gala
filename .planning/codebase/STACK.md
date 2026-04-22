# Technology Stack

**Analysis Date:** 2026-04-22

## Languages

**Primary:**
- Ruby 3.2.9 - Rails application code, background jobs, mailers, rake tasks, and server runtime. Version is pinned in `.ruby-version`, `Gemfile`, `Gemfile.lock`, and `Dockerfile`.
- JavaScript with Flow - React, Stimulus, Redux, Webpacker packs, and Sprockets assets under `app/javascript/` and `app/assets/javascripts/`. Flow 0.87.0 is configured in `.flowconfig` and `package.json`.

**Secondary:**
- TypeScript - SST infrastructure code in `infra/sst.config.ts`; this is a separate Node project with its own `infra/package.json` and `infra/package-lock.json`.
- SQL - Database schema is committed as PostgreSQL SQL in `db/structure.sql`; Rails uses `config.active_record.schema_format = :sql` in `config/application.rb`.
- Haml/ERB/Jbuilder/Markdown - Server-rendered views and serializers use gems declared in `Gemfile` (`haml`, `jbuilder`, `markerb`, `redcarpet`) and files under `app/views/`.

## Runtime

**Environment:**
- Ruby 3.2.9 - root app runtime, pinned by `.ruby-version` and `Dockerfile`.
- Bundler 2.4.19 - lockfile bundler version in `Gemfile.lock`; Docker installs `bundler:2.4.19`.
- Node 12.5.0 - root frontend build/runtime tooling, pinned by `.node-version`, `package.json`, and `Dockerfile`.
- Yarn 1.x - root JavaScript package manager, declared in `package.json`; lockfile is `yarn.lock`.
- Node >=20 - infrastructure runtime for `infra/`, declared in `infra/package.json`; CI deploy workflow uses `actions/setup-node@v4` with Node 20 in `.github/workflows/deploy.yml`.

**Package Manager:**
- Ruby: Bundler 2.4.19.
- Root JavaScript: Yarn 1.x.
- Infrastructure JavaScript: npm with `infra/package-lock.json`.
- Lockfiles: `Gemfile.lock`, `yarn.lock`, and `infra/package-lock.json` are present.

## Frameworks

**Core:**
- Rails 7.0.8.7 - monolith framework, locked in `Gemfile.lock`; app loads Rails 7 defaults in `config/application.rb`.
- Puma 7.1.0 - web server, configured by `Procfile`, `Procfile.dev`, and `config/puma.rb`.
- Sidekiq 7.3.6 - background job processor, configured by `Procfile`, `Procfile.dev`, `config/sidekiq.yml`, and `config/initializers/sidekiq.rb`.
- Action Cable - WebSocket updates over Redis in non-test environments via `config/cable.yml`; stats updates are implemented in `app/channels/stats_channel.rb`.
- Active Storage - file uploads and variants, configured in `config/storage.yml` and environment files; direct-upload JavaScript starts from `app/javascript/packs/file_upload.js`.
- Action Mailer and Action Mailbox - outbound mail is configured in `config/environments/production.rb`; inbound reply processing lives in `app/mailboxes/replies_mailbox.rb`.
- Webpacker 5.4.4 gem with Webpack 4 - modern asset pipeline rooted at `app/javascript`, configured by `config/webpacker.yml` and `config/webpack/environment.js`.
- Sprockets Rails 3.5.2 - legacy asset pipeline with `app/assets/javascripts/application.js` and `config/initializers/assets.rb`.
- React 16.8.6 - primary Webpacker UI library in `app/javascript/`; package is declared in `package.json` and locked in `yarn.lock`.
- Stimulus 1.1.0 - JavaScript controllers loaded through `app/javascript/packs/controllers.js`.

**Testing:**
- RSpec Rails 7.1.0 - Rails test framework, declared in `Gemfile` and locked in `Gemfile.lock`.
- Jest 24.x - JavaScript test runner; command is `yarn test` from `package.json`, config is `jest.config.js`.
- React Testing Library 6.x and Jest DOM 3.x - frontend component tests, declared in `package.json`.
- Capybara, Selenium WebDriver, Webdrivers, Database Cleaner, Shoulda Matchers, FactoryBot - Rails and feature test support declared in `Gemfile`.

**Build/Dev:**
- Docker - primary local/runtime container defined by `Dockerfile`; repo guidance uses `docker compose up`.
- Foreman-style process files - `Procfile.dev` starts Rails, Webpacker dev server, and Sidekiq; `Procfile` starts Puma and Sidekiq.
- Webpack Dev Server 3.x - development pack server on port 3035 via `config/webpacker.yml`.
- Babel 7 - Flow/React/modern JavaScript transpilation through dependencies in `package.json`.
- ESLint 5, Prettier 1, Flow - JS quality tooling configured by `.eslintrc.json`, `.prettierrc.json`, and `.flowconfig`.
- RuboCop 1.69.2 - Ruby linting dependency in `Gemfile.lock`.
- SST 4.7.1 - AWS infrastructure/deploy framework in `infra/package.json` and `infra/sst.config.ts`.

## Key Dependencies

**Critical:**
- `rails` 7.0.8.7 - application framework; app config is in `config/application.rb` and `config/environments/*.rb`.
- `pg` 1.5.9 - PostgreSQL adapter; database URLs are configured in `config/database.yml`.
- `puma` 7.1.0 - web runtime; production command is `bundle exec puma -C config/puma.rb` in `Procfile`.
- `sidekiq` 7.3.6 and `redis` 5.3.0 - Active Job backend, mail delivery jobs, analytics jobs, and queues; configured in `config/sidekiq.yml` and `config/initializers/sidekiq.rb`.
- `webpacker` 5.4.4 and `@rails/webpacker` 4.2.0 - Rails pack integration; config is split across `config/webpacker.yml`, `config/webpack/environment.js`, and `app/javascript/packs/`.
- `react` 16.8.6 and `react-dom` 16.8.6 - core UI runtime for Webpacker packs.
- `redux`, `react-redux`, `redux-thunk`, `immer`, `use-immer` - frontend state management dependencies used in `app/javascript/redux/` and feature modules.
- `devise` 4.9.4 - authentication foundation, configured in `config/initializers/devise.rb`.
- `pundit` and `rolify` - authorization and roles used by controllers/policies and mounted admin access, for example `config/routes.rb`.
- `active_storage_validations`, `image_processing`, `ruby-vips` - file upload validation and variant processing; storage is in `config/storage.yml`.
- `ahoy_matey` 3.0.1 - first-party analytics/event tracking; configured in `config/initializers/ahoy.rb`, with model extensions in `app/models/ahoy/event.rb`.
- `sentry-ruby`, `sentry-rails`, `sentry-sidekiq` 5.28.1 - server and worker error tracking; configured in `config/initializers/sentry.rb`.
- `aws-sdk-s3` 1.177.0 - Active Storage S3 access and AWS media bucket interactions; storage config is `config/storage.yml`.
- `ims-lti`, `omniauth-lti`, `omniauth-google-oauth2`, `omniauth-facebook` - LTI/OAuth login and launch integrations configured in `config/initializers/devise.rb`.
- `sparql-client` - Wikidata SPARQL integration in `app/services/wikidata.rb`.
- `ruby-oembed` and `opengraph_parser` - link expansion and embeds configured by `config/initializers/oembed.rb` and models under `app/models/link_expansion/`.
- `pdfkit`, `wkhtmltopdf`, `libvips`, `jemalloc` - PDF/image/runtime native dependencies installed by `Dockerfile` and Heroku buildpacks in `app.json`.

**Infrastructure:**
- PostgreSQL - primary relational database; Rails uses `DATABASE_URL` in `config/database.yml`, and AWS deploy creates Postgres 16.4 in `infra/sst.config.ts`.
- Redis/Valkey - queue, cache, and Action Cable backend through `REDIS_URL`; AWS deploy creates Redis-compatible Valkey 7.2 in `infra/sst.config.ts`.
- AWS ECS/Fargate, VPC, Postgres, Redis, S3, IAM, Cron - provisioned by `infra/sst.config.ts`.
- Heroku-compatible app metadata - `app.json` declares review app/env/addon/buildpack expectations.
- GitHub Actions - `.github/workflows/deploy.yml` runs manual SST deploy/remove for `staging` and `production`.

## Configuration

**Environment:**
- Runtime env is driven by `DATABASE_URL`, `REDIS_URL`, `BASE_URL`, `RAILS_ENV`, `NODE_ENV`, `PORT`, `RAILS_MAX_THREADS`, `WEB_CONCURRENCY`, `SIDEKIQ_CONCURRENCY`, `RAILS_SERVE_STATIC_FILES`, and `SECRET_KEY_BASE`.
- Credentials and external service env names include `RAILS_MASTER_KEY`, `LTI_KEY`, `LTI_SECRET`, `MAPBOX_ACCESS_TOKEN`, `MapboxAccessToken`, `SES_SMTP_USERNAME`, `SES_SMTP_PASSWORD`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET`.
- `.env`, `.env.dev`, `.env.ignore`, and `.envrc` are present but were not read; they should be treated as local environment configuration.
- `infra/sst.config.ts` stores production/staging secrets as SST secrets and injects shared environment into ECS services and tasks.
- `app.json` declares Heroku-style env requirements for review apps and older deploy flows.

**Build:**
- Ruby dependencies: `Gemfile` and `Gemfile.lock`.
- JavaScript dependencies: `package.json` and `yarn.lock`.
- Infra dependencies: `infra/package.json`, `infra/package-lock.json`, and `infra/tsconfig.json`.
- Rails boot/config: `config/application.rb`, `config/environments/development.rb`, `config/environments/test.rb`, `config/environments/production.rb`, `config.ru`.
- Database: `config/database.yml`, `db/structure.sql`.
- Assets: `config/webpacker.yml`, `config/webpack/environment.js`, `config/initializers/assets.rb`, `app/assets/javascripts/application.js`.
- Quality/test configs: `jest.config.js`, `.eslintrc.json`, `.prettierrc.json`, `.flowconfig`, `stylelint.config.js`.
- Runtime process configs: `Procfile`, `Procfile.dev`, `config/puma.rb`, `config/sidekiq.yml`, `Dockerfile`.

## Platform Requirements

**Development:**
- Use the root Rails app with Ruby 3.2.9, Bundler 2.4.19, Node 12.5.0, Yarn 1.x, PostgreSQL, and Redis.
- Preferred local command is `docker compose up`; process layout is visible in `Procfile.dev`.
- Run JavaScript tests with `yarn test` or `yarn test -- app/javascript/path/to/test.js`.
- Run focused Rails tests with `bundle exec rspec path/to/spec.rb`.
- Root JS dependencies live in the app environment; after changing `package.json`, refresh root dependencies with `docker compose run web yarn`.
- Do not use Node 20 for the root app; Node >=20 applies only to `infra/`.

**Production:**
- Current AWS path is SST v4 in `infra/sst.config.ts`: ECS services for web and worker, Postgres 16.4, Valkey 7.2, S3 media bucket policy, scheduled rake tasks, and stage-specific domains.
- Legacy/Heroku-compatible runtime is documented by `app.json`, `Procfile`, and Heroku-oriented comments/config in `config/puma.rb` and `config/environments/production.rb`.
- Production Rails uses precompiled assets, S3 Active Storage (`:amazon`), Redis cache/Action Cable/Sidekiq, SES SMTP when configured, SSL by default, and stdout logging.

---

*Stack analysis: 2026-04-22*
