# External Integrations

**Analysis Date:** 2026-04-22

## APIs & External Services

**AWS Platform:**
- AWS ECS/Fargate - production/staging web and worker hosting.
  - SDK/Client: SST 4.7.1 with AWS provider in `infra/sst.config.ts`.
  - Auth: GitHub OIDC role in `.github/workflows/deploy.yml`; SST secrets from `infra/sst.config.ts`.
- AWS RDS/Postgres - production/staging primary database.
  - SDK/Client: `sst.aws.Postgres` in `infra/sst.config.ts`; Rails `pg` adapter from `Gemfile.lock`.
  - Auth: generated `DATABASE_URL` injected by `infra/sst.config.ts`.
- AWS Redis-compatible cache - production/staging Valkey 7.2 for Redis protocol use.
  - SDK/Client: `sst.aws.Redis` in `infra/sst.config.ts`; Rails `redis` gem and Sidekiq.
  - Auth: generated `REDIS_URL` injected by `infra/sst.config.ts`.
- AWS S3 - production media storage for Active Storage.
  - SDK/Client: `aws-sdk-s3`; Active Storage config in `config/storage.yml`.
  - Auth: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` for Rails storage config, plus ECS task role media policy in `infra/sst.config.ts`.
- AWS SES SMTP - outbound production email when SMTP credentials are present.
  - SDK/Client: Rails Action Mailer SMTP settings in `config/environments/production.rb`.
  - Auth: `SES_SMTP_USERNAME`, `SES_SMTP_PASSWORD`.
- AWS Action Mailbox ingress - inbound email ingress is set to `:amazon` in `config/environments/production.rb`.
  - SDK/Client: Rails Action Mailbox.
  - Auth: AWS platform/mailbox configuration outside this repo; inbound processing class is `app/mailboxes/replies_mailbox.rb`.

**Authentication & Learning Tools:**
- LTI 1.x tool launch and content-item selection - LMS integrations such as Canvas launch users into Gala and assign cases.
  - SDK/Client: `ims-lti`, `omniauth-lti`, Devise OmniAuth setup in `config/initializers/devise.rb`.
  - Auth: `LTI_KEY`, `LTI_SECRET`.
  - Endpoints: `/authentication_strategies/auth/lti/callback` handled by `app/controllers/authentication_strategies/omniauth_callbacks_controller.rb`; `/catalog/content_items` handled by `app/controllers/catalog/content_items_controller.rb`; LTI XML config route in `app/controllers/authentication_strategies/config_controller.rb`.
- Google OAuth - reader sign-in through Google.
  - SDK/Client: `omniauth-google-oauth2` configured in `config/initializers/devise.rb`.
  - Auth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- Facebook OAuth - configured in Devise but not exposed in `AuthenticationStrategy.omniauth_providers`.
  - SDK/Client: `omniauth-facebook` configured in `config/initializers/devise.rb`.
  - Auth: `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`.

**Maps & Geospatial UI:**
- Mapbox - interactive maps for case locations and stats maps.
  - SDK/Client: `react-map-gl` and transitive `mapbox-gl`; JS code in `app/javascript/map_view/index.jsx` and `app/javascript/stats/map/MapView.jsx`.
  - Auth: `MAPBOX_ACCESS_TOKEN` or `MapboxAccessToken`, injected in `app/views/layouts/application.html.erb`; optional `MAPBOX_STYLE`, `MAPBOX_STYLE_STATS`, `MAPBOX_DATA`, `MAPBOX_DEFAULT_COLOR`.

**Observability:**
- Sentry - server, Sidekiq, and browser error tracking, plus optional tracing/profiling.
  - SDK/Client: `sentry-ruby`, `sentry-rails`, `sentry-sidekiq` in `Gemfile`; browser script loaded in `app/views/layouts/application.html.erb`; JS init in `app/assets/javascripts/sentry.js.erb`.
  - Auth: `SENTRY_DSN` optional override; fallback DSN exists in code but should be treated as configuration, not copied into new docs or logs.
  - Sampling/env: `SENTRY_TRACES_SAMPLE_RATE`, `SENTRY_PROFILES_SAMPLE_RATE`, `SENTRY_ENVIRONMENT`.
- Lograge - structured request logs.
  - SDK/Client: `lograge` configured in `config/initializers/lograge.rb`.
  - Auth: Not applicable.
- Barnes/Vernier/rack-mini-profiler/stackprof/memory_profiler/flamegraph - runtime metrics/profiling dependencies.
  - SDK/Client: `Gemfile`; Sentry profiling uses `vernier` in `config/initializers/sentry.rb`.
  - Auth: Not applicable.

**Content Embeds & Metadata:**
- OEmbed providers - rich embeds for third-party content.
  - SDK/Client: `ruby-oembed`; provider registration is in `config/initializers/oembed.rb`.
  - Auth: `Rails.application.credentials[:naive_oembed_url]` optionally adds a custom provider.
  - Providers explicitly registered: amCharts, Knight Lab StoryMap/Juxtapose/Timeline, Social Explorer, Sketchfab, Google Data Studio, Observable, Crowdsignal, Matterport, and optional naive provider patterns for ArcGIS, Plotly, and Shinyapps.
- OpenGraph metadata - default previews for links.
  - SDK/Client: `opengraph_parser`; implementation under `app/models/link_expansion/`.
  - Auth: Not applicable.
- Wikidata SPARQL - researcher/software/hardware/grants/works metadata lookup.
  - SDK/Client: `sparql-client`; service class is `app/services/wikidata.rb`.
  - Auth: Not applicable.
  - Endpoint: `https://query.wikidata.org/sparql`.

**Browser/CDN Assets:**
- Sentry browser CDN - loaded by `app/views/layouts/application.html.erb`.
  - SDK/Client: `https://browser.sentry-cdn.com/4.2.2/bundle.min.js`.
  - Auth: Sentry DSN configured by JS init.
- Polyfill.io - browser polyfills loaded by `app/views/layouts/application.html.erb`.
  - SDK/Client: `https://cdnjs.cloudflare.com/polyfill/v3/polyfill.min.js`.
  - Auth: Not applicable.

## Data Storage

**Databases:**
- PostgreSQL - primary relational store.
  - Connection: `DATABASE_URL` in `config/database.yml`; AWS deploy builds it in `infra/sst.config.ts`.
  - Client: Rails Active Record with `pg` gem.
  - Schema: `db/structure.sql`; app uses SQL schema format in `config/application.rb`.
  - Notable DB features: `pg_stat_statements`, `pgcrypto`, Active Storage tables, Action Mailbox inbound email table, Ahoy event/visit tables, and `cases_search_index` materialized view in `db/structure.sql`.
- Redis/Valkey - cache, Sidekiq queue backend, and Action Cable pub/sub.
  - Connection: `REDIS_URL` in `config/initializers/sidekiq.rb`, `config/cable.yml`, and `config/environments/production.rb`.
  - Client: `redis` gem, Sidekiq, Rails cache store, Action Cable Redis adapter.

**File Storage:**
- Active Storage local disk in development/test.
  - Config: `config/storage.yml`, `config/environments/development.rb`, `config/environments/test.rb`.
  - Direct upload client: `app/javascript/packs/file_upload.js`, `react-activestorage-provider` usages in `app/javascript/`.
- Active Storage S3 in production.
  - Config: `config/storage.yml` service `amazon`; `config/environments/production.rb` sets `config.active_storage.service = :amazon`.
  - Bucket: `msc-gala` in `config/storage.yml` and `infra/sst.config.ts`.
  - Auth: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, or ECS task role policy from `infra/sst.config.ts`.

**Caching:**
- Rails Redis cache store in development and production.
  - Config: `config/environments/development.rb` and `config/environments/production.rb`.
  - Namespace: `cache`.
- Application-level stats caching.
  - Examples: `app/services/case_stats_service.rb`, `app/controllers/cases/stats_controller.rb`, and cache key logic in `app/models/ahoy/event.rb`.
- Rack::Attack uses Rails cache for throttling.
  - Config: `config/initializers/rack_attack.rb`.

## Authentication & Identity

**Auth Provider:**
- Custom Rails/Devise authentication backed by local `readers` and `authentication_strategies`.
  - Implementation: Devise setup in `config/initializers/devise.rb`; routes in `config/routes.rb`; model providers in `app/models/authentication_strategy.rb`.
  - Password/account mailer: `app/mailers/authentication_mailer.rb`.
- OAuth/LTI identities are normalized through `AuthenticationStrategy.from_omniauth`.
  - Implementation: `app/controllers/authentication_strategies/omniauth_callbacks_controller.rb`, `app/models/authentication_strategy.rb`, `app/models/auth.rb`, and `app/models/reader.rb`.
- Authorization uses Pundit policies and Rolify roles.
  - Implementation: `app/policies/`, roles in models, and editor-only Sidekiq Web mount in `config/routes.rb`.
- Development OmniAuth mocking is available.
  - Config: `config/initializers/mock_omniauth.rb`.
  - Env flags: `MOCK_OMNIAUTH`, `LOCALHOST_SSL`.

## Monitoring & Observability

**Error Tracking:**
- Sentry for Rails, Sidekiq, browser errors, and optional profiling.
  - Config: `config/initializers/sentry.rb`, `app/assets/javascripts/sentry.js.erb`, `app/controllers/application_controller.rb`, `app/controllers/errors_controller.rb`, `app/javascript/utility/ErrorBoundary.jsx`.
  - Env: `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_TRACES_SAMPLE_RATE`, `SENTRY_PROFILES_SAMPLE_RATE`, `RELEASE`.

**Logs:**
- Rails logs to stdout in production when `RAILS_LOG_TO_STDOUT` is present.
  - Config: `config/environments/production.rb`.
- Lograge formats request payloads.
  - Config: `config/initializers/lograge.rb`.
- Sidekiq queue verbosity and timeout settings are in `config/sidekiq.yml`.
- Runtime stats endpoint exposes operational data at `/runtime/stats`.
  - Route: `config/routes.rb`.
  - Controller: `app/controllers/runtime_controller.rb`.

**Product Analytics:**
- Ahoy event tracking persists to PostgreSQL and masks IPs/cookies.
  - Config: `config/initializers/ahoy.rb`.
  - Models: `app/models/ahoy/event.rb`, `app/models/visit.rb`.
  - Browser tracker: `app/javascript/utility/Tracker.jsx`.
  - Stats broadcast: `app/channels/stats_channel.rb`.

## CI/CD & Deployment

**Hosting:**
- AWS is the active SST target.
  - Infrastructure: `infra/sst.config.ts`.
  - Web service: `GalaWeb` runs `bundle exec puma -C config/puma.rb`.
  - Worker service: `GalaWorker` runs `bundle exec sidekiq -C config/sidekiq.yml`.
  - Tasks: `GalaMigrate`, `GalaRefreshIndices`, `GalaWeeklyReport`.
  - Scheduled production tasks: refresh indices every 15 minutes and weekly usage report email.
  - Domains: `www.learngala.com` for production and `staging.learngala.com` for staging.
- Heroku-compatible deployment metadata remains in `app.json`.
  - Addons: Heroku Postgres and Heroku Redis.
  - Buildpacks: Heroku metrics, apt, wkhtmltopdf, vips, nodejs, ruby.
  - Stack: `heroku-22`.

**CI Pipeline:**
- GitHub Actions deploy workflow is `.github/workflows/deploy.yml`.
  - Manual `workflow_dispatch` accepts `stage` (`staging`, `production`) and `action` (`deploy`, `remove`).
  - Uses AWS OIDC, Node 20, `npm ci`, `npx sst install`, and `npx sst deploy/remove`.
  - Production removal is blocked by the workflow.
- Test/CI commands are not fully represented by a workflow file in the inspected paths, but repo guidance uses RSpec, Jest, asset precompile, schema load, and FactoryBot lint.

## Environment Configuration

**Required env vars:**
- Core runtime: `RAILS_ENV`, `NODE_ENV`, `PORT`, `BASE_URL`, `DATABASE_URL`, `REDIS_URL`, `SECRET_KEY_BASE`, `RAILS_MASTER_KEY`.
- Concurrency/runtime: `RAILS_MAX_THREADS`, `WEB_CONCURRENCY`, `SIDEKIQ_CONCURRENCY`, `RAILS_SERVE_STATIC_FILES`, `RAILS_LOG_TO_STDOUT`.
- LTI/OAuth: `LTI_KEY`, `LTI_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`.
- Mapbox: `MAPBOX_ACCESS_TOKEN`, `MapboxAccessToken`, optional `MAPBOX_STYLE`, `MAPBOX_STYLE_STATS`, `MAPBOX_DATA`, `MAPBOX_DEFAULT_COLOR`.
- AWS storage/mail: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`, `SES_SMTP_USERNAME`, `SES_SMTP_PASSWORD`.
- Sentry: `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_TRACES_SAMPLE_RATE`, `SENTRY_PROFILES_SAMPLE_RATE`.
- Feature flags/config: `STAGING`, `TEMPORARY_UNCONFIRMED_ACCESS`, `DOCKER_DEV`, `MOCK_OMNIAUTH`, `LOCALHOST_SSL`, `COMMIT_SHA`.

**Secrets location:**
- Local env files exist at `.env`, `.env.dev`, `.env.ignore`, and `.envrc`; contents were not read.
- Rails encrypted credentials are referenced by `config/initializers/oembed.rb` and production config; credential files were not read.
- SST secrets are declared in `infra/sst.config.ts`: `RAILS_MASTER_KEY`, `SECRET_KEY_BASE`, `LTI_KEY`, `LTI_SECRET`, `MAPBOX_ACCESS_TOKEN`, `SES_SMTP_USERNAME`, and `SES_SMTP_PASSWORD`.
- Heroku/review app env requirements are declared in `app.json`.

## Webhooks & Callbacks

**Incoming:**
- Devise/OmniAuth Google callback: `/authentication_strategies/auth/google/callback`.
  - Handler: `app/controllers/authentication_strategies/omniauth_callbacks_controller.rb`.
  - Routes: `config/routes.rb`.
- Devise/OmniAuth LTI callback: `/authentication_strategies/auth/lti/callback`.
  - Handler: `app/controllers/authentication_strategies/omniauth_callbacks_controller.rb`.
  - Routes: `config/routes.rb`.
- LTI ContentItemSelection POST: `/catalog/content_items`.
  - Handler: `app/controllers/catalog/content_items_controller.rb`.
  - Routes: `config/routes.rb`.
- LTI tool configuration XML: `/authentication_strategies/config/lti`.
  - Handler: `app/controllers/authentication_strategies/config_controller.rb`.
  - View: `app/views/authentication_strategies/config/lti.xml.erb`.
- Rails Active Storage direct uploads: `/rails/active_storage/direct_uploads`.
  - Client examples: `app/javascript/edgenotes/editor/Attachment.js`, `app/javascript/packs/file_upload.js`.
- Action Cable WebSocket: `/cable`.
  - Config: `config/cable.yml`, `config/environments/production.rb`.
  - Stats channel: `app/channels/stats_channel.rb`.
- Action Mailbox inbound replies: `reply+thread-key@mailbox.learngala.com`.
  - Handler: `app/mailboxes/replies_mailbox.rb`.
  - Ingress: `config/environments/production.rb` sets `config.action_mailbox.ingress = :amazon`.
- Sentry user feedback/report dialog is rendered on error pages.
  - Handlers/views: `app/controllers/errors_controller.rb`, `app/views/errors/internal_server_error.html.haml`, `app/views/errors/unprocessable_entity.html.haml`.

**Outgoing:**
- LTI content-item response posts selected case data back to the LMS `content_item_return_url`.
  - Implementation: `app/javascript/deployment/index.jsx`, `app/javascript/shared/lti.js`, `app/controllers/catalog/content_items_controller.rb`, `app/views/deployments/edit.json.jbuilder`.
- Outbound email via Action Mailer/SES SMTP.
  - Config: `config/environments/production.rb`.
  - Mailers: `app/mailers/application_mailer.rb`, `app/mailers/reply_notification_mailer.rb`, `app/mailers/library_request_mailer.rb`, `app/mailers/report_mailer.rb`, `app/mailers/authentication_mailer.rb`.
- Sentry events and browser error reports.
  - Config: `config/initializers/sentry.rb`, `app/assets/javascripts/sentry.js.erb`, `app/javascript/utility/ErrorBoundary.jsx`.
- OEmbed/OpenGraph fetches for link expansion.
  - Config/models: `config/initializers/oembed.rb`, `app/models/link_expansion/embed.rb`, `app/models/link_expansion/preview.rb`.
- Wikidata SPARQL requests.
  - Service: `app/services/wikidata.rb`.
- Mapbox tile/style/data requests from browser clients.
  - Clients: `app/javascript/map_view/index.jsx`, `app/javascript/stats/map/MapView.jsx`, `app/javascript/stats/map/config.js`.
- AWS S3 object reads/writes/deletes for Active Storage files.
  - Config: `config/storage.yml`, `infra/sst.config.ts`.

---

*Integration audit: 2026-04-22*
