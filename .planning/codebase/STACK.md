# Technology Stack

**Analysis Date:** 2026-04-22

## Languages

**Primary:**
- Ruby 3.2.9 - Rails application code, models, controllers, mailers, jobs, rake tasks, and runtime configuration. Pinned in `.ruby-version`, `Gemfile`, `Gemfile.lock`, and `Dockerfile`.
- JavaScript with Flow - React, Stimulus, Redux, Webpacker packs, and legacy Sprockets JavaScript. Source lives under `app/javascript/` and `app/assets/javascripts/`; Flow 0.87.0 is declared in `package.json` and locked in `yarn.lock`.

**Secondary:**
- TypeScript - AWS infrastructure code in `infra/sst.config.ts`; `infra/` is a separate npm project with `infra/package.json`, `infra/package-lock.json`, and `infra/tsconfig.json`.
- SQL - PostgreSQL schema is committed as SQL in `db/structure.sql`; Rails sets `config.active_record.schema_format = :sql` in `config/application.rb`.
- Haml, ERB, Jbuilder, Markdown - Server-rendered views, mailer templates, JSON serializers, and rich text templates under `app/views/`, backed by `haml`, `jbuilder`, `markerb`, and `redcarpet` in `Gemfile`.
- Sass/SCSS/CSS - Legacy and Webpacker styles under `app/assets/stylesheets/` and `app/javascript/`.

## Runtime

**Environment:**
- Ruby 3.2.9 - Main app runtime; `.ruby-version` and `Dockerfile` both pin 3.2.9.
- Bundler 2.4.19 - Lockfile bundler version in `Gemfile.lock`; installed explicitly in `Dockerfile`.
- Node 12.5.0 - Root app JavaScript tooling; pinned in `.node-version`, `package.json`, and `Dockerfile`.
- Yarn 1.x - Root JavaScript package manager; declared in `package.json` with `yarn.lock` present.
- Node >=20 - Infrastructure-only runtime; declared in `infra/package.json` and used by `.github/workflows/deploy.yml`.

**Package Manager:**
- Ruby: Bundler 2.4.19 with `Gemfile.lock`.
- Root JavaScript: Yarn 1.x with `yarn.lock`.
- Infrastructure JavaScript: npm with `infra/package-lock.json`.
- Lockfile: present for all three dependency sets: `Gemfile.lock`, `yarn.lock`, and `infra/package-lock.json`.

## Frameworks

**Core:**
- Rails 7.0.8.7 - Monolith framework; locked in `Gemfile.lock`, configured by `config/application.rb` and `config/environments/*.rb`.
- Puma 7.1.0 - Web server; production command is in `Procfile`, development command is in `Procfile.dev`, and runtime tuning is in `config/puma.rb`.
- Sidekiq 7.3.6 - Background job processor and Active Job adapter; configured by `config/sidekiq.yml`, `config/initializers/sidekiq.rb`, `Procfile`, and `Procfile.dev`.
- Action Cable - Redis-backed WebSocket layer in development/production via `config/cable.yml`; stats broadcasts are implemented by `app/channels/stats_channel.rb`.
- Active Storage - File uploads and variants; services are defined in `config/storage.yml`, environments select services in `config/environments/development.rb`, `config/environments/test.rb`, and `config/environments/production.rb`, and direct-upload JS starts in `app/javascript/packs/file_upload.js`.
- Action Mailer and Action Mailbox - Outbound email and inbound replies; mailers are under `app/mailers/`, mailbox routing is in `app/mailboxes/application_mailbox.rb`, reply processing is in `app/mailboxes/replies_mailbox.rb`, and production mail config is in `config/environments/production.rb`.
- Webpacker 5.4.4 gem with `@rails/webpacker` 4.2.0 and Webpack 4.41.2 - Modern asset pipeline rooted at `app/javascript`; configured by `config/webpacker.yml` and `config/webpack/environment.js`.
- Sprockets Rails 3.5.2 - Legacy asset pipeline; entry file is `app/assets/javascripts/application.js`, with precompile config in `config/initializers/assets.rb`.
- React 16.12.0 - Main Webpacker UI runtime, locked in `yarn.lock`; source modules live in `app/javascript/`.
- Stimulus 1.1.1 - JavaScript controller layer loaded through `app/javascript/packs/controllers.js`.

**Testing:**
- RSpec Rails 7.1.0 - Rails test framework; dependencies are in `Gemfile` and `Gemfile.lock`.
- Jest 24.9.0 - JavaScript test runner; command is `yarn test` from `package.json`, with config in `jest.config.js`.
- React Testing Library 6.x and Jest DOM 3.x - Frontend test support declared in `package.json`.
- Capybara, Selenium WebDriver, Webdrivers, Database Cleaner, Shoulda Matchers, FactoryBot, Faker - Rails test and fixture support declared in `Gemfile`.

**Build/Dev:**
- Docker - Primary local and deploy container image defined by `Dockerfile`; local orchestration is in `docker-compose.yml`.
- Foreman process layout - `Procfile.dev` runs Rails, Webpack dev server, and Sidekiq; `Procfile` runs Puma and Sidekiq.
- Webpack Dev Server 3.x - Development pack server on port 3035 via `config/webpacker.yml`.
- Babel 7 - Flow, React, and modern JavaScript transpilation via dependencies in `package.json`.
- ESLint 5, Prettier 1, Flow 0.87 - JavaScript quality tooling configured by `.eslintrc.json`, `.prettierrc.json`, and `.flowconfig`.
- RuboCop - Ruby linting dependency declared in `Gemfile`.
- SST 4.7.1 - AWS infrastructure and deployment framework in `infra/package.json` and `infra/sst.config.ts`.

## Key Dependencies

**Critical:**
- `rails` 7.0.8.7 - Application framework; app config lives in `config/application.rb` and `config/environments/*.rb`.
- `pg` 1.5.9 - PostgreSQL adapter; connection pooling and URLs are configured in `config/database.yml`.
- `puma` 7.1.0 - Web runtime; process command is in `Procfile` and threading/worker settings are in `config/puma.rb`.
- `sidekiq` 7.3.6 and `redis` 5.3.0 - Background jobs, mailer jobs, Active Storage queues, Ahoy queues, cache, and Redis-backed Action Cable; configured in `config/sidekiq.yml`, `config/initializers/sidekiq.rb`, `config/cable.yml`, and environment configs.
- `webpacker` 5.4.4, `@rails/webpacker` 4.2.0, and `webpack` 4.41.2 - Rails pack integration and frontend bundling; config is split across `config/webpacker.yml`, `config/webpack/environment.js`, and `app/javascript/packs/`.
- `react` 16.12.0 and `react-dom` 16.12.0 - Core UI runtime locked in `yarn.lock`.
- `redux`, `react-redux`, `redux-thunk`, `immer`, `use-immer` - Frontend state management patterns used under `app/javascript/redux/` and feature modules.
- `devise` 4.9.4 - Authentication foundation; configured in `config/initializers/devise.rb` with routes in `config/routes.rb`.
- `pundit` 2.1.0 and `rolify` 6.0.1 - Authorization and role management used by controllers, policies, and editor-only mounts such as Sidekiq Web in `config/routes.rb`.
- `active_storage_validations`, `image_processing`, `aws-sdk-s3` 1.177.0 - Upload validation, variants, and S3 storage via `config/storage.yml`.
- `ahoy_matey` 3.0.1 - First-party analytics/event tracking; configured in `config/initializers/ahoy.rb`, with models in `app/models/ahoy/event.rb` and `app/models/visit.rb`.
- `sentry-ruby`, `sentry-rails`, `sentry-sidekiq` 5.28.1 - Server and worker error tracking; configured in `config/initializers/sentry.rb`.
- `ims-lti`, `omniauth-lti`, `omniauth-google-oauth2`, `omniauth-facebook` - LTI/OAuth login and launch support configured in `config/initializers/devise.rb`.
- `sparql-client` 3.3.0 - Wikidata SPARQL integration in `app/services/wikidata.rb`.
- `ruby-oembed` 0.16.1 and `opengraph_parser` 0.2.5 - Link expansion and embed metadata via `config/initializers/oembed.rb` and `app/models/link_expansion/`.
- `pdfkit` 0.8.7.3, wkhtmltopdf, libvips, jemalloc, PostgreSQL client libraries - Native runtime/build dependencies installed by `Dockerfile` and represented in Heroku buildpacks in `app.json`.

**Infrastructure:**
- PostgreSQL - Primary relational database; Rails connects via `DATABASE_URL` in `config/database.yml`, Docker uses PostgreSQL 16.4 in `docker-compose.yml`, and AWS deploy creates Postgres 16.4 in `infra/sst.config.ts`.
- Redis/Valkey - Queue, cache, and Action Cable backend through `REDIS_URL`; Docker uses Redis 7 in `docker-compose.yml`, and AWS deploy creates Valkey 7.2 through `infra/sst.config.ts`.
- AWS ECS/Fargate, VPC, Postgres, Redis/Valkey, S3, IAM, load balancer, and scheduled tasks - Provisioned by `infra/sst.config.ts`.
- Heroku-compatible metadata - `app.json` declares Heroku stack, addons, buildpacks, and review-app environment expectations.
- GitHub Actions - `.github/workflows/deploy.yml` runs manual SST deploy/remove for `staging` and `production`.

## Configuration

**Environment:**
- Core runtime env is driven by `RAILS_ENV`, `NODE_ENV`, `PORT`, `BASE_URL`, `DATABASE_URL`, `REDIS_URL`, `SECRET_KEY_BASE`, `RAILS_MASTER_KEY`, `RAILS_MAX_THREADS`, `WEB_CONCURRENCY`, `SIDEKIQ_CONCURRENCY`, `RAILS_SERVE_STATIC_FILES`, and `RAILS_LOG_TO_STDOUT`.
- Integration env names include `LTI_KEY`, `LTI_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`, `MAPBOX_ACCESS_TOKEN`, `MapboxAccessToken`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `SES_SMTP_USERNAME`, `SES_SMTP_PASSWORD`, `SENTRY_DSN`, and `SENTRY_ENVIRONMENT`.
- Feature/config flags include `STAGING`, `TEMPORARY_UNCONFIRMED_ACCESS`, `DOCKER_DEV`, `MOCK_OMNIAUTH`, `LOCALHOST_SSL`, `COMMIT_SHA`, and `RELEASE`.
- `.env`, `.env.dev`, `.env.ignore`, and `.envrc` exist and should be treated as local environment configuration; contents were not read.
- `config/credentials.yml.enc` exists as Rails encrypted credentials and should be treated as secret-bearing; contents were not read for this mapping.
- `infra/sst.config.ts` declares SST secrets and injects shared environment into ECS services and tasks.
- `app.json` declares Heroku-style env requirements for review apps and older deploy flows.

**Build:**
- Ruby dependencies: `Gemfile` and `Gemfile.lock`.
- Root JavaScript dependencies: `package.json` and `yarn.lock`.
- Infrastructure dependencies: `infra/package.json`, `infra/package-lock.json`, and `infra/tsconfig.json`.
- Rails boot/config: `config/application.rb`, `config/boot.rb`, `config.ru`, and `config/environments/*.rb`.
- Database: `config/database.yml` and `db/structure.sql`.
- Assets: `config/webpacker.yml`, `config/webpack/environment.js`, `config/webpack/development.js`, `config/webpack/test.js`, `config/webpack/production.js`, `config/initializers/assets.rb`, and `app/assets/javascripts/application.js`.
- Quality/test configs: `jest.config.js`, `.eslintrc.json`, `.prettierrc.json`, `.flowconfig`, and `stylelint.config.js`.
- Runtime process configs: `Procfile`, `Procfile.dev`, `config/puma.rb`, `config/sidekiq.yml`, `Dockerfile`, and `docker-compose.yml`.

## Platform Requirements

**Development:**
- Use Ruby 3.2.9, Bundler 2.4.19, Node 12.5.0, Yarn 1.x, PostgreSQL, and Redis for the root app.
- Preferred local start is `docker compose up`; process layout is defined in `Procfile.dev`.
- After changing root JavaScript dependencies in `package.json`, refresh container dependencies with `docker compose run web yarn` because root `node_modules` are volume-backed.
- Run JavaScript tests with `yarn test` or `yarn test -- app/javascript/path/to/test.js`.
- Run focused Rails specs with `bundle exec rspec path/to/spec.rb`; CI-style Rails suite excludes feature specs with `bundle exec rspec --exclude-pattern "spec/features/**/*_spec.rb"`.
- Do not use Node 20 for root app tooling; Node >=20 applies only to `infra/`.

**Production:**
- Active AWS deployment path is SST v4 in `infra/sst.config.ts`: ECS services for web and worker, Postgres 16.4, Valkey 7.2, S3 media access policy, scheduled rake tasks, and stage-specific domains.
- Production Rails uses precompiled assets, Puma, Sidekiq, S3 Active Storage, Redis cache/Action Cable/queues, SES SMTP when configured, forced SSL unless `DOCKER_DEV` is present, stdout logging, and `BASE_URL` for default URLs.
- Heroku-compatible runtime remains documented by `app.json`, `Procfile`, Heroku-oriented comments in `config/puma.rb`, and Heroku-style buildpacks/addons in `app.json`.

---

*Stack analysis: 2026-04-22*
