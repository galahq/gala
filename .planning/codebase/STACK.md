# Technology Stack

**Analysis Date:** 2026-05-03

## Languages

**Primary:**
- Ruby 4.0.3 - Rails application code in `app/`, `config/`, `lib/`, version pinned by `.ruby-version`, `Gemfile`, and `Dockerfile`.
- JavaScript with Flow annotations - React, Redux, Stimulus, and browser packs in `app/javascript/`, built by Shakapacker and webpack.

**Secondary:**
- TypeScript 6.0.2 - SST infrastructure definitions in `infra/sst.config.ts`, configured by `infra/tsconfig.json`.
- SCSS/Sass/CSS - Application styling and package styles compiled through Shakapacker/webpack; Sass tooling is configured in `package.json` and `config/webpack/environment.js`.
- Haml/ERB/Jbuilder/Markerb - Rails views and response templates under `app/views/`, with view interpreter gems declared in `Gemfile`.
- SQL - PostgreSQL schema format is `:sql` in `config/application.rb`, with database config in `config/database.yml`.
- Dockerfile / YAML - Container, compose, Shakapacker, database, storage, cable, and CI/deployment descriptors in `Dockerfile`, `docker-compose.yml`, `config/*.yml`, and `app.json`.

## Runtime

**Environment:**
- Ruby 4.0.3, pinned by `.ruby-version` and `Dockerfile`.
- Node 24.15.0, pinned by `.node-version` and `Dockerfile`; `package.json` engines require `>=24 <25`.
- Rails 8.1.3 from `Gemfile.lock`, with `config.load_defaults 7.0` in `config/application.rb`.
- Puma 7.1.0 serves web requests via `Procfile`, `Dockerfile`, and `infra/sst.config.ts`.
- Sidekiq 7.3.6 runs background jobs via `Procfile`, `Procfile.dev`, `config/sidekiq.yml`, and `infra/sst.config.ts`.

**Package Manager:**
- Bundler 2.4.19 - Installed in `Dockerfile`; Ruby dependencies are declared in `Gemfile` and locked in `Gemfile.lock`.
- Yarn 1.22.22 - Declared by `package.json` `packageManager`, installed in `Dockerfile`, and locked by `yarn.lock`.
- npm - Used only for `infra/` package management; `infra/package-lock.json` is present for `infra/package.json`.
- Lockfile: present for Ruby (`Gemfile.lock`), root JavaScript (`yarn.lock`), and infra JavaScript (`infra/package-lock.json`).

## Frameworks

**Core:**
- Rails 8.1.3 - MVC web framework, Active Record, Active Storage, Action Cable, Action Mailer, and Action Mailbox in `app/` and `config/`.
- React 16.8.6 - Browser UI components in `app/javascript/`.
- Redux 4.0.0 with redux-thunk and redux-batched-actions - Client state management in `app/javascript/redux/`.
- Stimulus 1.1.0 - DOM controllers in `app/javascript/controllers/`.
- Shakapacker 10.0.0 - Rails JavaScript integration configured in `config/shakapacker.yml`.
- Webpack 5.106.1 - Asset bundling configured in `config/webpack/`.
- SST 4.7.1 - AWS infrastructure as code in `infra/sst.config.ts`.

**Testing:**
- RSpec / rspec-rails - Ruby tests under `spec/`, dependencies declared in `Gemfile`.
- Jest 24.5.0 - JavaScript tests under `app/javascript/**/__tests__/`, configured by `jest.config.js`.
- React Testing Library 6.0.0 and jest-dom 3.0.0 - React component testing support in `package.json` and `spec/support/jest-setup.js`.
- Capybara, Selenium WebDriver, webdrivers, database_cleaner-active_record, shoulda-matchers, rspec-retry - Rails feature/model test support in `Gemfile`.

**Build/Dev:**
- Docker / Docker Compose - Local and production container images defined in `Dockerfile`; local stack service wiring in `docker-compose.yml`.
- Shakapacker dev server - Started by `bin/shakapacker-dev-server` and `Procfile.dev`.
- Babel 7 - JavaScript transpilation via `@babel/*`, `babel-loader`, and `babel-jest` in `package.json`.
- Dart Sass 1.92.1 and `sass-loader` - SCSS pipeline configured in `config/webpack/environment.js`.
- Sprockets 4.2 and `sprockets-rails` - Rails asset pipeline support from `Gemfile`.
- Stylelint 9.10.1 - Style lint rules in `stylelint.config.js`.
- ESLint 5.10.0, Flow 0.87.0, Prettier 1.15.3 - JavaScript quality tooling declared in `package.json`.

## Key Dependencies

**Critical:**
- `rails` 8.1.3 - Application framework and core request lifecycle (`Gemfile`, `Gemfile.lock`).
- `pg` 1.5.9 - PostgreSQL adapter (`Gemfile`, `config/database.yml`).
- `redis` 5.3.0 - Redis client used by cache, Action Cable, runtime stats, and Sidekiq (`Gemfile`, `config/initializers/sidekiq.rb`).
- `sidekiq` 7.3.6 - Background jobs (`Gemfile`, `config/sidekiq.yml`, `Procfile`).
- `aws-sdk-s3` 1.177.0 - Active Storage S3 integration (`Gemfile`, `config/storage.yml`).
- `shakapacker` 10.0.0 - Rails-to-webpack bridge (`Gemfile`, `package.json`, `config/shakapacker.yml`).
- `react` / `react-dom` 16.8.6 - Client UI runtime (`package.json`).
- `@blueprintjs/core`, `@blueprintjs/datetime`, `@blueprintjs/select` - Component library used by the UI (`package.json`).

**Infrastructure:**
- `puma` 7.1.0 - Rack web server (`Gemfile`, `config/puma.rb`).
- `rack-attack`, `rack-canonical-host`, `rack-timeout` - Rack request protection and request timeout controls (`Gemfile`).
- `devise`, `pundit`, `rolify` - Authentication, authorization, and roles (`Gemfile`, `config/initializers/devise.rb`, `app/policies/`).
- `omniauth-facebook`, `omniauth-google-oauth2`, `omniauth-lti`, `ims-lti` - OAuth/LTI authentication (`Gemfile`, `config/initializers/devise.rb`, `app/controllers/application_controller.rb`).
- `sentry-ruby`, `sentry-rails`, `sentry-sidekiq`, `vernier` - Error monitoring, logs, traces, and profiling (`Gemfile`, `config/initializers/sentry.rb`).
- `ahoy_matey`, `groupdate` - Analytics/event tracking and grouped reporting (`Gemfile`, `config/initializers/ahoy.rb`).
- `administrate`, `administrate-field-active_storage` - Admin dashboards in `app/dashboards/`.
- `active_model_serializers`, `jbuilder`, `multi_json`, `oj`, `oj_mimic_json` - JSON serialization (`Gemfile`, `app/serializers/`).
- `ruby-oembed`, `opengraph_parser`, `sparql-client` - External content expansion and Wikidata integration (`Gemfile`, `config/initializers/oembed.rb`, `app/services/wikidata.rb`).
- `pdfkit`, `image_processing`, `libvips`, `wkhtmltopdf` - PDF/image processing through Ruby gems and Docker system packages (`Gemfile`, `Dockerfile`).

## Configuration

**Environment:**
- Rails environment is controlled by `RAILS_ENV`, `NODE_ENV`, and `BASE_URL`; production derives default URL options and Action Cable URL from `BASE_URL` in `config/environments/production.rb`.
- Database configuration uses `DATABASE_URL` with PostgreSQL defaults in `config/database.yml`.
- Redis configuration uses `REDIS_URL` in `config/initializers/sidekiq.rb`, `config/cable.yml`, `config/environments/development.rb`, and `config/environments/production.rb`.
- Storage configuration uses local disk in development/test and S3 in production through `config/storage.yml` and `config/environments/production.rb`.
- `.env`, `.env.dev`, and `.envrc` files are present and contain environment configuration; contents are not read or documented.
- Heroku review/app configuration is in `app.json`; AWS/SST environment and secrets are declared in `infra/sst.config.ts`.

**Build:**
- Ruby and Node container build is defined in `Dockerfile`.
- Local compose stack is defined in `docker-compose.yml`.
- JavaScript package manifest is `package.json`; infra package manifest is `infra/package.json`.
- Shakapacker configuration is `config/shakapacker.yml`.
- Webpack configuration is `config/webpack/webpack.config.js`, `config/webpack/environment.js`, `config/webpack/development.js`, `config/webpack/test.js`, and `config/webpack/production.js`.
- Jest configuration is `jest.config.js`.
- Stylelint configuration is `stylelint.config.js`.
- SST deployment configuration is `infra/sst.config.ts`.

## Platform Requirements

**Development:**
- Docker Compose is the primary local workflow via `docker compose up` from `README.md`.
- Host development expects Ruby 4.0.3, Bundler 2.4.19, Node 24.15.0, Yarn 1.x, Docker, and jemalloc as documented in `README.md`.
- Local services are PostgreSQL 16.8 and Redis 7 from `docker-compose.yml`.
- Local Rails app binds to port 3000, Shakapacker dev server to 3035, and Redis to 6379 by default; host ports are configurable via `.env`.

**Production:**
- Current infrastructure code targets AWS via SST: ECS services for web and worker, RDS PostgreSQL 16.4, Valkey/Redis 7.2, S3 media bucket, ALB, and scheduled ECS tasks in `infra/sst.config.ts`.
- Legacy/alternate deployment target is Heroku `heroku-22` with Heroku PostgreSQL and Heroku Redis declared in `app.json`.
- Production processes are `web: bundle exec puma -C config/puma.rb` and `worker: bundle exec sidekiq -C config/sidekiq.yml` from `Procfile`.
- Production domains are `www.learngala.com` and `staging.learngala.com` in `infra/sst.config.ts`.

---

*Stack analysis: 2026-05-03*
