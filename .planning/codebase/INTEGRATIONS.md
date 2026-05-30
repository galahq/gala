# External Integrations

**Analysis Date:** 2026-05-30

## APIs & External Services

**AWS Cloud:**
- AWS ECS Fargate - runs `GalaWeb` Puma service and `GalaWorker` Sidekiq service from the built Docker image.
  - SDK/Client: SST AWS provider and AWS CLI in `infra/sst.config.ts`, `.github/workflows/deploy.yml`, and `scripts/deploy-sst.sh`.
  - Auth: GitHub OIDC role in `.github/workflows/deploy.yml`, task IAM policies in `infra/sst.config.ts`, and optional `AWS_PROFILE` for operator runs in `scripts/deploy-sst.sh`.
- AWS RDS PostgreSQL 16 - production-stage relational database.
  - SDK/Client: SST `Postgres` resource and Rails `pg` adapter in `infra/sst.config.ts`, `Gemfile.lock`, and `config/database.yml`.
  - Auth: generated `DATABASE_URL` from `infra/sst.config.ts`.
- AWS ElastiCache/Valkey-compatible Redis - cache, Action Cable, and Sidekiq broker.
  - SDK/Client: SST `Redis` resource and Rails Redis adapters in `infra/sst.config.ts`, `config/cable.yml`, `config/environments/production.rb`, and `config/initializers/sidekiq.rb`.
  - Auth: generated `REDIS_URL` from `infra/sst.config.ts`.
- AWS S3 media bucket - Active Storage production object storage, with retained bucket name referenced by infrastructure.
  - SDK/Client: `aws-sdk-s3` and Rails Active Storage in `Gemfile.lock`, `config/storage.yml`, `config/environments/production.rb`, and `infra/sst.config.ts`.
  - Auth: ECS task role/IAM policy from `infra/sst.config.ts`; bucket selected by `S3_BUCKET`.
- AWS S3 static asset bucket - immutable Rails/Shakapacker release assets.
  - SDK/Client: AWS CLI and CloudFront origin configuration in `scripts/deploy-sst.sh` and `infra/sst.config.ts`.
  - Auth: deploy role from `.github/workflows/deploy.yml`; bucket selected by `GALA_STATIC_ASSETS_BUCKET`.
- AWS CloudFront - app CDN and static asset CDN.
  - SDK/Client: SST CDN/CloudFront resources and AWS CLI invalidation/pruning in `infra/sst.config.ts` and `scripts/deploy-sst.sh`.
  - Auth: deploy role from `.github/workflows/deploy.yml`.
- AWS SES SMTP - outbound production mail.
  - SDK/Client: Rails Action Mailer SMTP settings in `config/environments/production.rb`.
  - Auth: `SES_SMTP_USERNAME` and `SES_SMTP_PASSWORD`.
- AWS Action Mailbox ingress - incoming mail processing path configured for production.
  - SDK/Client: Rails Action Mailbox in `config/environments/production.rb`.
  - Auth: Rails/AWS ingress configuration; secret values are not stored in code.
- AWS EventBridge/SST Cron - scheduled refresh and weekly report tasks.
  - SDK/Client: SST Cron resources in `infra/sst.config.ts`.
  - Auth: task role from `infra/sst.config.ts`.

**DNS & Edge:**
- Cloudflare DNS - owns `learngala.dev` and preview subdomain DNS for AWS deployments.
  - SDK/Client: SST Cloudflare provider in `infra/sst.config.ts` and workflow-provided credentials in `.github/workflows/deploy.yml`.
  - Auth: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_DEFAULT_ACCOUNT_ID`, and `CLOUDFLARE_ZONE_ID`.

**Authentication & OAuth Services:**
- Google OAuth2 - reader authentication strategy.
  - SDK/Client: `omniauth-google-oauth2` in `Gemfile.lock`, provider configuration in `config/initializers/devise.rb`, and callbacks in `app/controllers/authentication_strategies/omniauth_callbacks_controller.rb`.
  - Auth: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
- Facebook OAuth - Devise OmniAuth provider configuration.
  - SDK/Client: `omniauth-facebook` in `Gemfile.lock` and provider configuration in `config/initializers/devise.rb`.
  - Auth: `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET`.
- LTI/Canvas LMS - external learning tool launch and content item selection.
  - SDK/Client: `ims-lti` and `omniauth-lti` in `Gemfile.lock`, LTI validation in `app/controllers/application_controller.rb`, callbacks in `app/controllers/authentication_strategies/omniauth_callbacks_controller.rb`, launch/config routes in `config/routes.rb`, and XML config in `app/views/authentication_strategies/config/lti.xml.erb`.
  - Auth: `LTI_KEY` and `LTI_SECRET`.

**Maps & Media Metadata:**
- Mapbox - map views and stats map rendering in the browser.
  - SDK/Client: `mapbox-gl`, `react-map-gl`, `app/javascript/map_view/`, `app/javascript/stats/map/config.js`, and `app/views/layouts/application.html.erb`.
  - Auth: `MAPBOX_ACCESS_TOKEN` and legacy browser alias `MapboxAccessToken`.
- Wikidata SPARQL - linked data lookup and metadata enrichment.
  - SDK/Client: `sparql-client` in `Gemfile.lock`, service code in `app/services/wikidata.rb`, and routes/controllers in `config/routes.rb` and `app/controllers/sparql_controller.rb`.
  - Auth: Not detected.
- oEmbed providers and Open Graph - rich link preview and embed expansion.
  - SDK/Client: `ruby-oembed`, `opengraph_parser`, `config/initializers/oembed.rb`, `app/models/link_expansion.rb`, `app/models/link_expansion/preview.rb`, `app/models/link_expansion/embed.rb`, and `app/controllers/edgenotes/link_expansions_controller.rb`.
  - Auth: provider-specific values can come from Rails credentials; do not copy values from `config/credentials.yml.enc`.
- Browser CDNs and fonts - polyfill, browser-side Sentry, and Typekit assets.
  - SDK/Client: external script/font references in `app/views/layouts/application.html.erb` and `app/views/application/_fonts.html.erb`.
  - Auth: Not detected in repo-visible code.

**Observability & Repository Services:**
- Sentry - Rails, Sidekiq, browser error reporting, traces, profiles, and release tagging.
  - SDK/Client: `sentry-ruby`, `sentry-rails`, `sentry-sidekiq`, `config/initializers/sentry.rb`, and `app/views/layouts/application.html.erb`.
  - Auth: `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_TRACES_SAMPLE_RATE`, and `SENTRY_PROFILES_SAMPLE_RATE`.
- GitHub - source hosting, workflow dispatch, OIDC deployment, PR preview comments, and production release creation.
  - SDK/Client: GitHub Actions and `gh` usage in `.github/workflows/deploy.yml`.
  - Auth: GitHub Actions token and repository/environment secrets managed by GitHub.
- Heroku - declared legacy/current compatibility for app runtime, review apps, PostgreSQL, Redis, and scheduler-style tasks.
  - SDK/Client: `app.json`, `Procfile`, `README.md`, and Heroku references in `scripts/deploy-sst.sh`.
  - Auth: Heroku config vars and operator credentials outside repo; do not copy Heroku database/cache URLs into AWS config.

## Data Storage

**Databases:**
- PostgreSQL - primary relational datastore for Rails.
  - Connection: `DATABASE_URL` in `config/database.yml`, generated AWS value in `infra/sst.config.ts`, and Heroku add-on declaration in `app.json`.
  - Client: `pg` gem in `Gemfile.lock`, Active Record in `config/application.rb`, schema in `db/structure.sql`, and migrations in `db/migrate/`.
- PostgreSQL full-text/materialized search - case search index and search functions.
  - Connection: same `DATABASE_URL` in `config/database.yml`.
  - Client: Active Record SQL and PostgreSQL features in `db/structure.sql`, `db/migrate/20241011080359_update_case_search_index_for_postgres16.rb`, `app/services/find_cases.rb`, and `lib/tasks/indices.rake`.
- Redis/Valkey - job queue, cable pubsub, and Rails cache store.
  - Connection: `REDIS_URL` in `config/cable.yml`, `config/environments/development.rb`, `config/environments/production.rb`, and generated AWS value in `infra/sst.config.ts`.
  - Client: `redis` gem, Sidekiq, Rails Redis cache store, and Action Cable in `Gemfile.lock`, `config/initializers/sidekiq.rb`, `config/sidekiq.yml`, and `config/cable.yml`.

**File Storage:**
- Local disk - development and test file storage in `config/storage.yml` and `config/environments/development.rb`.
- AWS S3 Active Storage - production file/media storage in `config/storage.yml`, `config/environments/production.rb`, and `infra/sst.config.ts`.
- AWS S3 static asset releases - immutable asset storage under release prefixes managed by `scripts/deploy-sst.sh` and exposed through `infra/sst.config.ts`.
- AWS S3 seed dump import - optional deployment seed dump source referenced by `SEED_DUMP_S3_URI` in `.github/workflows/deploy.yml` and `scripts/deploy-sst.sh`.

**Caching:**
- Redis cache store - Rails development and production cache via `config/environments/development.rb` and `config/environments/production.rb`.
- CloudFront edge caching - static asset CDN and selected public catalog cache behavior in `infra/sst.config.ts`.
- Rails asset cache headers - production static file and asset host behavior in `config/environments/production.rb`.

## Authentication & Identity

**Auth Provider:**
- Devise database authentication - local reader accounts, confirmation, password recovery, rememberable sessions, tracking, and validation in `app/models/reader.rb`, `config/initializers/devise.rb`, and `config/routes.rb`.
  - Implementation: Rails sessions plus Devise controllers/routes in `config/routes.rb`.
- OmniAuth Google - account linking and sign-in through `app/models/authentication_strategy.rb`, `config/initializers/devise.rb`, and `app/controllers/authentication_strategies/omniauth_callbacks_controller.rb`.
  - Implementation: `omniauth-google-oauth2` with `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
- OmniAuth LTI - LMS launch/authentication through `app/models/authentication_strategy.rb`, `config/initializers/devise.rb`, `app/controllers/application_controller.rb`, and `app/controllers/authentication_strategies/omniauth_callbacks_controller.rb`.
  - Implementation: `ims-lti` and `omniauth-lti` with `LTI_KEY` and `LTI_SECRET`.
- OmniAuth Facebook - provider is configured in `config/initializers/devise.rb`.
  - Implementation: `omniauth-facebook` with `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET`.
- Mock OmniAuth - development/test bypass path for local flows in `config/initializers/mock_omniauth.rb`.
  - Implementation: controlled by `MOCK_OMNIAUTH` and local development settings.
- Authorization - Pundit policies and Rolify roles.
  - Implementation: `app/controllers/application_controller.rb`, `app/policies/`, `app/models/reader.rb`, and role data in the database.

## Monitoring & Observability

**Error Tracking:**
- Sentry - Rails, Sidekiq, browser reporting, traces, profiles, environment, release, and user context in `config/initializers/sentry.rb`, `Gemfile.lock`, and `app/views/layouts/application.html.erb`.

**Logs:**
- Rails logs to STDOUT in production with Lograge formatting through `config/environments/production.rb` and `Gemfile.lock`.
- Puma worker/runtime metrics use Barnes hooks in `config/puma.rb` and `Gemfile.lock`.
- AWS ECS and task logs are produced by services and tasks defined in `infra/sst.config.ts`.
- Sidekiq operational visibility is mounted behind editor authentication at `/sidekiq` in `config/routes.rb`.
- Runtime stats endpoint is exposed through `config/routes.rb` and `app/controllers/runtime/stats_controller.rb`.
- Ahoy first-party analytics writes to application storage through `Gemfile.lock`, `config/initializers/ahoy.rb`, and related models/migrations.

## CI/CD & Deployment

**Hosting:**
- AWS/SST - primary AWS deployment path in `infra/sst.config.ts`, `.github/workflows/deploy.yml`, and `scripts/deploy-sst.sh`.
- Heroku - declared compatibility/current production boundary in `app.json`, `Procfile`, and `README.md`.
- Cloudflare - DNS management for AWS custom domains through `infra/sst.config.ts`.
- CloudFront - app and static edge distributions in `infra/sst.config.ts`.

**CI Pipeline:**
- GitHub Actions deploy workflow - manual deployment pipeline in `.github/workflows/deploy.yml`.
- Deploy helper script - image build, ECR push, immutable asset sync, SST deploy, approved hooks, CloudFront invalidation, release pruning, and guardrails in `scripts/deploy-sst.sh`.
- Infrastructure package install - `npm ci` for `infra/package-lock.json` in `.github/workflows/deploy.yml`.
- Root app build - Docker build from `Dockerfile`, Ruby install from `Gemfile.lock`, and pnpm install from `pnpm-lock.yaml`.
- Production release metadata - GitHub release and preview PR comments in `.github/workflows/deploy.yml`.
- Semaphore - referenced as a repository CI service in `README.md`; no `.github/workflows` test workflow is present besides `.github/workflows/deploy.yml`.

## Environment Configuration

**Required env vars:**
- Rails/runtime: `RAILS_ENV`, `NODE_ENV`, `BASE_URL`, `FORCE_SSL`, `PORT`, `RAILS_LOG_TO_STDOUT`, `RAILS_SERVE_STATIC_FILES`, `RAILS_MAX_THREADS`, `WEB_CONCURRENCY`, `SIDEKIQ_CONCURRENCY`, `RAILS_MASTER_KEY`, `SECRET_KEY_BASE`, `RELEASE`, `RELEASE_URL`, and `COMMIT_SHA` in `config/application.rb`, `config/environments/production.rb`, `config/puma.rb`, `config/sidekiq.yml`, and `infra/sst.config.ts`.
- Data/storage: `DATABASE_URL`, `REDIS_URL`, `S3_BUCKET`, `AWS_REGION`, and `ASSET_HOST` in `config/database.yml`, `config/cable.yml`, `config/storage.yml`, `config/environments/production.rb`, and `infra/sst.config.ts`.
- Authentication/external services: `LTI_KEY`, `LTI_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`, `MAPBOX_ACCESS_TOKEN`, `MapboxAccessToken`, `MAPBOX_STYLE`, `MAPBOX_DATA`, `MAPBOX_STYLE_STATS`, `MAPBOX_DEFAULT_COLOR`, `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_TRACES_SAMPLE_RATE`, `SENTRY_PROFILES_SAMPLE_RATE`, `SES_SMTP_USERNAME`, and `SES_SMTP_PASSWORD` in `config/initializers/devise.rb`, `app/controllers/application_controller.rb`, `app/javascript/stats/map/config.js`, `config/initializers/sentry.rb`, `config/environments/production.rb`, and `infra/sst.config.ts`.
- Deploy/SST/Cloudflare: `AWS_PROFILE`, `AWS_DEFAULT_REGION`, `AWS_REGION`, `SST_STAGE`, `GALA_DOMAIN_NAME`, `GALA_PREVIEW_HOST`, `GALA_BASE_URL`, `GALA_RELEASE_ID`, `GALA_ASSET_PREFIX`, `GALA_STATIC_ASSETS_BUCKET`, `GALA_RELEASE_RETAIN_COUNT`, `GALA_ENABLE_CUSTOM_DOMAIN`, `GALA_CLOUDFLARE_PROXY`, `GALA_IMMUTABLE_CLOUDFRONT`, `GALA_WEB_IMAGE_URI`, `GALA_IMPORT_STATIC_ASSETS_BUCKET`, `GALA_RELEASE_URL`, `SEED_DUMP_S3_URI`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_DEFAULT_ACCOUNT_ID`, `CLOUDFLARE_ZONE_ID`, `GITHUB_RUN_ID`, `GITHUB_SHA`, `GITHUB_REPOSITORY`, `USER_DATA`, and `RETAINED_SECRET_KEYS` in `infra/sst.config.ts`, `.github/workflows/deploy.yml`, and `scripts/deploy-sst.sh`.
- Local/test toggles: `MOCK_OMNIAUTH`, `LOCALHOST_SSL`, `DOCKER_DEV`, `STAGING`, `TEMPORARY_UNCONFIRMED_ACCESS`, `APP_HOST_PORT`, `WEBPACK_HOST_PORT`, `REDIS_HOST_PORT`, and `COMPOSE_PROJECT_NAME` in `config/initializers/mock_omniauth.rb`, `config/application.rb`, `README.md`, and `docker-compose.yml` by name only.

**Secrets location:**
- SST secrets are declared in `infra/sst.config.ts` for Rails boot, LTI, Mapbox, SES SMTP, and Cloudflare credential names; values are not stored in source.
- GitHub repository/environment secrets are referenced by `.github/workflows/deploy.yml`; values are not stored in source.
- Rails encrypted credentials are stored in `config/credentials.yml.enc`; use only Rails APIs and never quote encrypted contents.
- Local environment files `.env`, `.env.dev`, and `.envrc` exist and must be treated as secret-bearing local configuration.
- `config/secrets.yml`, `docs/aws-sst-secret-inventory.md`, and `tmp/local_secret.txt` exist by name and must not be quoted or copied into docs.
- Heroku config var names are declared in `app.json`; Heroku values and database/cache URLs must not be copied into AWS deploy configuration.

## Webhooks & Callbacks

**Incoming:**
- Devise and OmniAuth callbacks - reader and authentication strategy callbacks are routed through `config/routes.rb` and handled in `app/controllers/authentication_strategies/omniauth_callbacks_controller.rb`.
- LTI launch and config callbacks - LTI request validation runs in `app/controllers/application_controller.rb`, callback handling lives in `app/controllers/authentication_strategies/omniauth_callbacks_controller.rb`, and XML configuration renders from `app/views/authentication_strategies/config/lti.xml.erb`.
- LTI content item selection - POST handling for `/catalog/content_items` is defined in `config/routes.rb` and implemented in `app/controllers/catalog/content_items_controller.rb`.
- Action Mailbox Amazon ingress - production ingress is configured in `config/environments/production.rb`.
- Action Cable WebSocket endpoint - `/cable` is configured through `config/cable.yml`, `config/environments/production.rb`, and `config/routes.rb`.
- Sidekiq Web UI - `/sidekiq` is mounted only for authenticated editors in `config/routes.rb`.
- Health check endpoint - `/up` is used by AWS load balancer health checks through `config/routes.rb` and `infra/sst.config.ts`.

**Outgoing:**
- LTI content item return - content item selection stores and returns LMS callback data through `app/controllers/catalog/content_items_controller.rb`.
- SES SMTP mail - outbound mail is sent through `config/environments/production.rb`.
- AWS S3 media and static asset operations - Active Storage and deploy asset sync run through `config/storage.yml`, `config/environments/production.rb`, `infra/sst.config.ts`, and `scripts/deploy-sst.sh`.
- CloudFront invalidations and distribution pruning - deploy-time operations run from `scripts/deploy-sst.sh`.
- ECS deployment tasks - migration, seed restore, index refresh, and weekly report tasks are defined in `infra/sst.config.ts` and executed by `scripts/deploy-sst.sh`.
- Wikidata SPARQL requests - outbound queries run from `app/services/wikidata.rb`.
- oEmbed/Open Graph fetches - outbound preview/embed fetches run through `config/initializers/oembed.rb` and `app/models/link_expansion/`.
- Mapbox tile/style/data requests - browser-side map requests originate from `app/javascript/map_view/`, `app/javascript/stats/map/config.js`, and `app/views/layouts/application.html.erb`.
- GitHub release and PR comment operations - workflow operations run through `.github/workflows/deploy.yml`.

---

*Integration audit: 2026-05-30*
