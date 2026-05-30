# Technology Stack

**Analysis Date:** 2026-05-30

## Languages

**Primary:**
- Ruby 4.0.3 - Rails application code, models, controllers, jobs, mailers, policies, serializers, tasks, and RSpec tests in `app/`, `config/`, `lib/`, `spec/`, `Gemfile`, `.ruby-version`, and `Gemfile.lock`.
- JavaScript and JSX - React application islands, Redux modules, Stimulus controllers, Shakapacker packs, Jest tests, and browser route logic in `app/javascript/`, `app/javascript/packs/`, `spec/support/jest-setup.js`, `jest.config.js`, and `package.json`.

**Secondary:**
- TypeScript 6.0.x - SST infrastructure definitions and local TypeScript checking in `infra/sst.config.ts`, `infra/sst-env.d.ts`, `infra/package.json`, and `tsconfig.json`.
- CSS, SCSS, Sass, Haml, ERB, Jbuilder, and Markerb - Rails and frontend presentation in `app/assets/stylesheets/`, `app/javascript/packs/styles.js`, `app/views/`, `app/views/layouts/application.html.erb`, and `Gemfile`.
- SQL - PostgreSQL schema, migrations, materialized views, and full-text search structures in `db/structure.sql`, `db/migrate/`, and `app/services/find_cases.rb`.
- YAML - Rails, Shakapacker, database, storage, cable, Sidekiq, and deployment configuration in `config/database.yml`, `config/storage.yml`, `config/cable.yml`, `config/shakapacker.yml`, `config/sidekiq.yml`, and `.github/workflows/deploy.yml`.
- Shell - guarded AWS/SST deployment automation and local scripts in `scripts/deploy-sst.sh`, `entrypoint.sh`, `bin/`, `Procfile`, and `Procfile.dev`.

## Runtime

**Environment:**
- Rails 8.1.3 runs on Ruby 4.0.3 with `config.load_defaults 7.0`; use `Gemfile`, `.ruby-version`, `Gemfile.lock`, and `config/application.rb` as the source of truth.
- Puma 7.2.0 serves the Rails app; process and thread settings come from `config/puma.rb`, `Procfile`, `Procfile.dev`, and environment variables such as `PORT`, `RAILS_MAX_THREADS`, and `WEB_CONCURRENCY`.
- Sidekiq 7.3.10 runs background jobs with queue configuration in `config/sidekiq.yml`, runtime setup in `config/initializers/sidekiq.rb`, and process entries in `Procfile` and `Procfile.dev`.
- Node.js 24.15.0 is required for frontend builds, Jest, Playwright, Vitest spike tooling, and SST tooling; use `.node-version`, `package.json`, `Dockerfile`, and `.github/workflows/deploy.yml`.
- PostgreSQL is the relational database runtime; Rails connects through `config/database.yml`, the `pg` gem in `Gemfile.lock`, and production database provisioning in `infra/sst.config.ts`.
- Redis or Redis-compatible Valkey backs Sidekiq, Action Cable, and Rails cache; configure through `config/cable.yml`, `config/environments/development.rb`, `config/environments/production.rb`, `config/sidekiq.yml`, and `infra/sst.config.ts`.
- Docker is the production image build target and the local container path; use `Dockerfile`, `entrypoint.sh`, `Aptfile`, `README.md`, and `docker-compose.yml` by name only when checking local service topology.

**Package Manager:**
- Bundler 2.4.19 - Ruby dependency resolution through `Gemfile` and `Gemfile.lock`.
- pnpm 11.1.0 - root JavaScript dependency resolution through `package.json` and `pnpm-lock.yaml`.
- npm - isolated infrastructure dependency install through `infra/package.json`, `infra/package-lock.json`, and `.github/workflows/deploy.yml`.
- Lockfiles: `Gemfile.lock`, `pnpm-lock.yaml`, and `infra/package-lock.json` are present and should be updated with their matching package manager.

## Frameworks

**Core:**
- Ruby on Rails 8.1.3 - MVC app, Active Record, Active Storage, Action Cable, Action Mailer, Action Mailbox, Active Job, routing, and assets in `Gemfile.lock`, `config/application.rb`, `config/routes.rb`, and `config/environments/`.
- Shakapacker 10.0.0 - Rails-to-Webpack bridge in `Gemfile.lock`, `package.json`, `config/shakapacker.yml`, `config/webpack/environment.js`, and `app/javascript/packs/`.
- Webpack 5.107.2 with Babel 7 - JavaScript bundling and transpilation in `package.json`, `config/webpack/environment.js`, `config/webpack/webpack.config.js`, and `.babelrc.js`.
- React 16.12.0 lock / React 16.8 package range - UI islands in `app/javascript/`, root dependencies in `package.json`, and resolved versions in `pnpm-lock.yaml`.
- Redux 4, React Router 4, Stimulus 1, styled-components 4, and BlueprintJS 4 - client-side state, routing, controllers, styling, and UI components in `package.json`, `app/javascript/`, and `app/javascript/shared/blueprintLegacyNamespace.js`.
- Sprockets 4 plus Sass pipelines - global Rails asset handling and Blueprint CSS loading in `Gemfile.lock`, `config/initializers/assets.rb`, `app/assets/config/manifest.js`, `app/assets/stylesheets/application.css`, and `app/javascript/packs/styles.js`.
- Devise, OmniAuth, Pundit, and Rolify - authentication and authorization in `Gemfile.lock`, `config/initializers/devise.rb`, `app/models/reader.rb`, `app/models/authentication_strategy.rb`, and `app/controllers/application_controller.rb`.
- Active Model Serializers, Jbuilder, Draper, Mobility, FriendlyId, Administrate, Ahoy, and Groupdate - API shaping, presentation, translation, slugs, admin UI, and analytics in `Gemfile.lock`, `app/serializers/`, `app/views/`, `app/decorators/`, `app/dashboards/`, and `config/initializers/ahoy.rb`.

**Testing:**
- RSpec Rails 7.1.0 - Ruby specs in `spec/`, shared setup in `spec/rails_helper.rb` and `spec/spec_helper.rb`, and dependencies in `Gemfile.lock`.
- Capybara, Selenium WebDriver, Webdrivers, Database Cleaner, Shoulda Matchers, FactoryBot, Faker, and RSpec Retry - Rails integration and model testing support in `Gemfile.lock`, `spec/rails_helper.rb`, `spec/support/`, and `spec/factories/`.
- Jest 24 - current frontend unit test runner in `package.json`, `jest.config.js`, `spec/support/jest-setup.js`, and co-located `app/javascript/**/__tests__/` files.
- Playwright 1.60 - visual route QA in `package.json`, `playwright.config.mjs`, and `tests/visual/`.
- Vitest 4 and Vite 8 - spike or migration tooling in `package.json`, `vitest.config.*` if present, and `tsconfig.json`.

**Build/Dev:**
- Docker multi-stage build - Ruby, Node, Corepack/pnpm, Bundler, native libraries, assets, and Puma startup in `Dockerfile`.
- SST 4.7.1 - AWS infrastructure-as-code in `infra/package.json`, `infra/package-lock.json`, and `infra/sst.config.ts`.
- Corepack/pnpm - root JavaScript install in `Dockerfile`, `README.md`, and `package.json`.
- Dart Sass and `sass-loader` - stylesheet build in `package.json`, `config/webpack/environment.js`, and `app/javascript/packs/styles.js`.
- Rails asset precompile - production build path in `Dockerfile`, `config/environments/production.rb`, `config/initializers/assets.rb`, and `scripts/deploy-sst.sh`.

## Key Dependencies

**Critical:**
- `rails` 8.1.3 - application framework in `Gemfile.lock`, `config/application.rb`, and `config/routes.rb`.
- `pg` 1.6.3 - PostgreSQL adapter in `Gemfile.lock` and `config/database.yml`.
- `puma` 7.2.0 - web server in `Gemfile.lock`, `config/puma.rb`, and `Procfile`.
- `sidekiq` 7.3.10 and `redis` 5.4.1 - background processing and Redis connectivity in `Gemfile.lock`, `config/sidekiq.yml`, `config/initializers/sidekiq.rb`, and `Procfile`.
- `shakapacker` 10.0.0, `webpack` 5.107.2, and `babel-loader` - Rails frontend build chain in `Gemfile.lock`, `package.json`, `config/shakapacker.yml`, and `config/webpack/environment.js`.
- `react`, `react-dom`, `redux`, `react-redux`, and `react-router-dom` - main client-side app stack in `package.json`, `pnpm-lock.yaml`, and `app/javascript/`.
- `@blueprintjs/core`, `@blueprintjs/icons`, `@blueprintjs/datetime`, `@blueprintjs/select`, and `@blueprintjs/popover2` - global UI system in `package.json`, `app/assets/stylesheets/application.css`, `app/javascript/shared/blueprint.js`, and `app/javascript/shared/blueprintLegacyNamespace.js`.
- `devise`, `omniauth-google-oauth2`, `omniauth-facebook`, `omniauth-lti`, `ims-lti`, `pundit`, and `rolify` - account, OAuth, LTI, and authorization stack in `Gemfile.lock`, `config/initializers/devise.rb`, `app/models/reader.rb`, and `app/controllers/authentication_strategies/`.
- `aws-sdk-s3` 1.221.0 - Active Storage S3 integration in `Gemfile.lock`, `config/storage.yml`, and `config/environments/production.rb`.
- `sentry-ruby`, `sentry-rails`, and `sentry-sidekiq` 5.28.1 - error and trace reporting in `Gemfile.lock`, `config/initializers/sentry.rb`, and `app/views/layouts/application.html.erb`.
- `mapbox-gl` and `react-map-gl` - map rendering in `package.json`, `app/javascript/map_view/`, `app/javascript/stats/map/config.js`, and `app/views/layouts/application.html.erb`.
- `sparql-client`, `ruby-oembed`, and `opengraph_parser` - external metadata enrichment in `Gemfile.lock`, `app/services/wikidata.rb`, `config/initializers/oembed.rb`, and `app/models/link_expansion/`.

**Infrastructure:**
- `sst` 4.7.1 - AWS and Cloudflare infrastructure deployment in `infra/package.json` and `infra/sst.config.ts`.
- `typescript` 6.0.x - infrastructure and JS checking support in `package.json`, `infra/package.json`, and `tsconfig.json`.
- `aws-actions/configure-aws-credentials@v4`, GitHub Actions, AWS CLI, Docker, and SST CLI - deployment chain in `.github/workflows/deploy.yml` and `scripts/deploy-sst.sh`.
- `rack-attack`, `rack-canonical-host`, and `rack-timeout` - Rack security and runtime controls in `Gemfile.lock`, `config/application.rb`, and `config/initializers/`.
- `lograge`, `barnes`, and `vernier` - production log and runtime diagnostics in `Gemfile.lock`, `config/environments/production.rb`, `config/puma.rb`, and `config/initializers/`.
- `image_processing`, `libvips`, `pdfkit`, and `wkhtmltopdf` - media and PDF support in `Gemfile.lock`, `Dockerfile`, and `Aptfile`.

## Configuration

**Environment:**
- Rails environment variables are consumed by `config/application.rb`, `config/database.yml`, `config/storage.yml`, `config/cable.yml`, `config/puma.rb`, `config/environments/production.rb`, `config/initializers/devise.rb`, `config/initializers/sentry.rb`, and `app/views/layouts/application.html.erb`.
- Local environment files `.env`, `.env.dev`, and `.envrc` are present and should be treated as secret-bearing configuration; record names only, never values.
- Rails encrypted credentials are present at `config/credentials.yml.enc`; use Rails credentials APIs rather than copying values into docs or code.
- AWS/SST runtime values are defined by `infra/sst.config.ts`, `.github/workflows/deploy.yml`, and `scripts/deploy-sst.sh`.
- Heroku-style app configuration names remain declared in `app.json` for Heroku/review app compatibility.

**Build:**
- Ruby dependency configuration: `Gemfile`, `Gemfile.lock`, `.ruby-version`, and `Dockerfile`.
- JavaScript dependency configuration: `package.json`, `pnpm-lock.yaml`, `.node-version`, and `Dockerfile`.
- Infrastructure dependency configuration: `infra/package.json`, `infra/package-lock.json`, and `infra/sst.config.ts`.
- Webpack/Shakapacker configuration: `config/shakapacker.yml`, `config/webpack/environment.js`, `config/webpack/webpack.config.js`, `.babelrc.js`, and `tsconfig.json`.
- Rails asset configuration: `config/initializers/assets.rb`, `app/assets/config/manifest.js`, `app/assets/stylesheets/application.css`, `app/javascript/packs/styles.js`, and `config/environments/production.rb`.
- Test configuration: `spec/rails_helper.rb`, `spec/spec_helper.rb`, `jest.config.js`, `playwright.config.mjs`, and `package.json`.
- Deployment configuration: `Dockerfile`, `entrypoint.sh`, `Procfile`, `Procfile.dev`, `.github/workflows/deploy.yml`, `scripts/deploy-sst.sh`, and `infra/sst.config.ts`.

## Platform Requirements

**Development:**
- Use Ruby 4.0.3 from `.ruby-version`, Bundler 2.4.19 from `Gemfile.lock`, Node 24.15.0 from `.node-version`, and pnpm 11.1.0 from `package.json`.
- Use PostgreSQL and Redis-compatible services for local Rails behavior through `config/database.yml`, `config/cable.yml`, `config/environments/development.rb`, and `README.md`.
- Run Rails, Shakapacker dev server, and Sidekiq using `Procfile.dev`, `bin/rails`, `bin/shakapacker-dev-server`, and `config/sidekiq.yml`.
- Use `localhost:3000` for route-facing browser QA per `AGENTS.md`, `README.md`, and `playwright.config.mjs`.

**Production:**
- AWS/SST deployment target is ECS Fargate for Rails and Sidekiq, RDS PostgreSQL 16, Redis-compatible Valkey 7.2, S3 media/static buckets, CloudFront, Cloudflare DNS, and SST-managed tasks in `infra/sst.config.ts`.
- Docker image runtime includes Debian Bookworm slim, PostgreSQL 17 client packages, jemalloc, libvips, wkhtmltopdf, font packages, Ruby 4.0.3, Node 24.15.0, Bundler 2.4.19, and pnpm 11.1.0 in `Dockerfile` and `Aptfile`.
- The current repository still declares Heroku compatibility through `app.json`, `Procfile`, and `README.md`; AWS deployment logic in `.github/workflows/deploy.yml` and `scripts/deploy-sst.sh` guards against copying Heroku database/cache URLs.

---

*Stack analysis: 2026-05-30*
