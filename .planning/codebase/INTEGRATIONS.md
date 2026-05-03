# External Integrations

**Analysis Date:** 2026-05-03

## APIs & External Services

**Maps & Geodata:**
- Mapbox - Interactive map views and stats map rendering in `app/javascript/map_view/index.jsx`, `app/javascript/stats/map/config.js`, and `app/javascript/stats/map/MapView.jsx`.
  - SDK/Client: `react-map-gl` 4.1.1, Mapbox GL CSS imported by `app/javascript/map_view/index.jsx` and `app/javascript/stats/map/MapView.jsx`.
  - Auth: `MAPBOX_ACCESS_TOKEN` / `MapboxAccessToken`; optional styles from `MAPBOX_STYLE` and `MAPBOX_STYLE_STATS`.
- Wikidata SPARQL - Entity lookup and canned metadata queries for case Wikidata links in `app/controllers/sparql_controller.rb` and `app/services/wikidata.rb`.
  - SDK/Client: `sparql-client` 3.3.0.
  - Auth: Not required.

**Embeds & External Media:**
- oEmbed providers - Rich external embeds registered in `config/initializers/oembed.rb`; browser rendering uses `react-oembed-container` in `app/javascript/edgenotes/expansion/index.jsx`.
  - SDK/Client: `ruby-oembed`, `react-oembed-container`.
  - Auth: Not detected.
- Registered oEmbed providers include amCharts, Knight Lab StoryMap, Knight Lab Juxtapose, Knight Lab Timeline, Social Explorer, Sketchfab, Google Data Studio, Observable, Crowdsignal, Matterport, and optional custom provider from Rails credentials in `config/initializers/oembed.rb`.
- YouTube/Vimeo embeds - Expansion layout recognizes video domains in `app/javascript/edgenotes/expansion/index.jsx`; YouTube player dependency is `react-youtube-player` in `package.json`.
  - SDK/Client: `react-youtube-player`, browser iframe/oEmbed rendering.
  - Auth: Not detected.
- Open Graph previews - Link preview dependency is `opengraph_parser` in `Gemfile`.
  - SDK/Client: `opengraph_parser`.
  - Auth: Not detected.

**Email:**
- Amazon SES SMTP - Production outbound email when `SES_SMTP_USERNAME` and `SES_SMTP_PASSWORD` are present in `config/environments/production.rb`.
  - SDK/Client: Rails Action Mailer SMTP.
  - Auth: `SES_SMTP_USERNAME`, `SES_SMTP_PASSWORD`.
- Amazon Action Mailbox ingress - Production inbound mail ingress is configured as `:amazon` in `config/environments/production.rb`; reply parsing lives in `app/mailboxes/replies_mailbox.rb`.
  - SDK/Client: Rails Action Mailbox.
  - Auth: AWS platform/IAM configuration.
- Letter Opener - Development mail preview in `config/environments/development.rb`.
  - SDK/Client: `letter_opener`.
  - Auth: Not applicable.

**Analytics & Telemetry:**
- Ahoy - First-party event tracking and visit stats in `config/initializers/ahoy.rb`, `app/models/ahoy/event.rb`, `app/models/visit.rb`, and `app/javascript/utility/Tracker.jsx`.
  - SDK/Client: `ahoy_matey`; API mode enabled.
  - Auth: Application session/current reader.
- Sentry - Error monitoring, structured logs, traces, and profiling for Rails and Sidekiq in `config/initializers/sentry.rb`, `app/controllers/application_controller.rb`, and `app/controllers/errors_controller.rb`.
  - SDK/Client: `sentry-ruby`, `sentry-rails`, `sentry-sidekiq`, `vernier`.
  - Auth: `SENTRY_DSN`; optional `SENTRY_ENVIRONMENT`, `SENTRY_TRACES_SAMPLE_RATE`, `SENTRY_PROFILES_SAMPLE_RATE`, `RELEASE`.

## Data Storage

**Databases:**
- PostgreSQL - Primary relational database configured by `config/database.yml`.
  - Connection: `DATABASE_URL`.
  - Client: Active Record with `pg` 1.5.9.
- AWS RDS PostgreSQL - SST-managed production/staging database in `infra/sst.config.ts`.
  - Connection: SST-generated `DATABASE_URL`.
  - Client: Active Record with `pg`.
- Heroku PostgreSQL - Legacy/review app database add-on declared in `app.json`.
  - Connection: Heroku-provided `DATABASE_URL`.
  - Client: Active Record with `pg`.
- Local PostgreSQL 16.8 - Docker Compose service in `docker-compose.yml`.
  - Connection: Compose-provided `DATABASE_URL`.
  - Client: Active Record with `pg`.

**File Storage:**
- Rails Active Storage local disk - Development/test storage in `config/storage.yml` and `config/environments/development.rb`.
- AWS S3 - Production media storage through Active Storage `:amazon` in `config/storage.yml` and `config/environments/production.rb`.
  - Connection: `AWS_REGION`, `S3_BUCKET`; AWS SDK task-role/default provider chain.
  - Client: `aws-sdk-s3`, Rails Active Storage, `activestorage`, and `react-activestorage-provider`.
- SST S3 IAM access - Task roles for web, worker, migration, index refresh, and weekly report are granted bucket/object permissions in `infra/sst.config.ts`.

**Caching:**
- Redis-compatible cache - Rails cache store uses `:redis_cache_store` in `config/environments/development.rb` and `config/environments/production.rb`.
  - Connection: `REDIS_URL`.
  - Client: `redis` gem.
- AWS Valkey/Redis 7.2 - SST-managed cache in `infra/sst.config.ts`.
  - Connection: SST-generated `REDIS_URL`.
  - Client: `redis`, Sidekiq, Rails cache, Action Cable.
- Heroku Redis - Legacy/review app add-on declared in `app.json`.
  - Connection: Heroku-provided `REDIS_URL`.
  - Client: `redis`, Sidekiq, Rails cache, Action Cable.
- Local Redis 7 - Docker Compose service in `docker-compose.yml`.
  - Connection: Compose-provided `REDIS_URL`.
  - Client: `redis`, Sidekiq, Rails cache, Action Cable.

## Authentication & Identity

**Auth Provider:**
- Devise - Primary reader authentication in `config/initializers/devise.rb`, routes in `config/routes.rb`, controllers under `app/controllers/readers/`, and model integration in `app/models/reader.rb`.
  - Implementation: Rails sessions, Devise controllers, and `Reader` model.
- Google OAuth - Reader sign-in via OmniAuth in `config/initializers/devise.rb` and `app/controllers/authentication_strategies/omniauth_callbacks_controller.rb`.
  - Implementation: `omniauth-google-oauth2` with provider name `google`.
  - Auth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- Facebook OAuth - Reader sign-in via OmniAuth in `config/initializers/devise.rb`.
  - Implementation: `omniauth-facebook`.
  - Auth: `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`.
- LTI OAuth - Learning Tools Interoperability launch/authentication in `config/initializers/devise.rb`, `app/controllers/application_controller.rb`, and `app/models/authentication_strategy.rb`.
  - Implementation: `omniauth-lti`, `ims-lti`, `Omniauth::Lti::Context`.
  - Auth: `LTI_KEY`, `LTI_SECRET`.
- Pundit / Rolify - Authorization policies and role checks in `app/policies/`, `config/routes.rb`, and `app/models/role.rb`.
  - Implementation: Policy classes, `reader.has_role?`, and controller authorization.

## Monitoring & Observability

**Error Tracking:**
- Sentry - Enabled for `production` and `staging` in `config/initializers/sentry.rb`; controller context is attached in `app/controllers/application_controller.rb`; report dialog options are exposed by `app/controllers/errors_controller.rb`.

**Logs:**
- Rails logs to STDOUT in production when `RAILS_LOG_TO_STDOUT` is present in `config/environments/production.rb`.
- Lograge dependency is present in `Gemfile`; detailed configuration was not detected in the files read.
- Sentry structured logs are enabled by `config.enable_logs = true` in `config/initializers/sentry.rb`.
- Runtime stats endpoint includes Redis and Sidekiq stats in `app/controllers/runtime_controller.rb` and `config/routes.rb`.

## CI/CD & Deployment

**Hosting:**
- AWS via SST - `infra/sst.config.ts` provisions VPC, ECS cluster, web and worker services, RDS PostgreSQL, Valkey/Redis cache, scheduled tasks, ALB domains, and S3 media access.
- Heroku - `app.json` declares stack `heroku-22`, Heroku PostgreSQL, Heroku Redis, buildpacks, review app env, and postdeploy script.
- Docker - `Dockerfile` builds development and production images; `docker-compose.yml` runs local web, PostgreSQL, and Redis services.

**CI Pipeline:**
- Semaphore CI - Badge and project reference in `README.md`.
- GitHub - Source hosting referenced in `package.json`, `README.md`, and docs; SST uses `GITHUB_SHA` as optional `COMMIT_SHA` in `infra/sst.config.ts`.

## Environment Configuration

**Required env vars:**
- Core runtime: `RAILS_ENV`, `NODE_ENV`, `BASE_URL`, `RAILS_MASTER_KEY`, `SECRET_KEY_BASE`, `RAILS_MAX_THREADS`, `WEB_CONCURRENCY`, `SIDEKIQ_CONCURRENCY`, `RAILS_SERVE_STATIC_FILES`.
- Data: `DATABASE_URL`, `REDIS_URL`.
- Storage/AWS: `AWS_REGION`, `S3_BUCKET`.
- Auth: `LTI_KEY`, `LTI_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`.
- Maps: `MAPBOX_ACCESS_TOKEN`, `MapboxAccessToken`, optional `MAPBOX_STYLE`, optional `MAPBOX_STYLE_STATS`.
- Email: `SES_SMTP_USERNAME`, `SES_SMTP_PASSWORD`.
- Monitoring: `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_TRACES_SAMPLE_RATE`, `SENTRY_PROFILES_SAMPLE_RATE`, `RELEASE`.
- Feature flags/compatibility: `MOCK_OMNIAUTH`, `STAGING`, `TEMPORARY_UNCONFIRMED_ACCESS`, `DOCKER_DEV`, `LOCALHOST_SSL`, `COMMIT_SHA`.

**Secrets location:**
- Local environment files are present as `.env`, `.env.dev`, and `.envrc`; contents are not read or documented.
- SST secrets are declared in `infra/sst.config.ts` for `RAILS_MASTER_KEY`, `SECRET_KEY_BASE`, `LTI_KEY`, `LTI_SECRET`, `MAPBOX_ACCESS_TOKEN`, `SES_SMTP_USERNAME`, and `SES_SMTP_PASSWORD`.
- Rails encrypted credentials are referenced by `RAILS_MASTER_KEY` and `Rails.application.credentials` usage in `config/initializers/oembed.rb`.
- Heroku review/app env requirements are declared in `app.json`.

## Webhooks & Callbacks

**Incoming:**
- OAuth callbacks - Devise/OmniAuth callback routes for authentication strategies are defined in `config/routes.rb` and handled by `app/controllers/authentication_strategies/omniauth_callbacks_controller.rb`.
- LTI launches - LTI validation uses request parameters in `app/controllers/application_controller.rb`; OmniAuth LTI is configured in `config/initializers/devise.rb`.
- Active Storage direct uploads - Browser uploads start in `app/javascript/packs/file_upload.js` and React upload components use `react-activestorage-provider` in files such as `app/javascript/conversation/FirstPostForm.jsx` and `app/javascript/utility/FileUploadWidget.jsx`.
- Action Mailbox inbound replies - Reply processing is implemented by `app/mailboxes/replies_mailbox.rb`; production ingress is `:amazon` in `config/environments/production.rb`.
- Ahoy events - API tracking is enabled in `config/initializers/ahoy.rb` and client events are sent from `app/javascript/utility/Tracker.jsx`.
- Runtime health/stats - `/up` and `/runtime/stats` are defined in `config/routes.rb`.

**Outgoing:**
- S3 object operations - Active Storage uploads/downloads/deletes media through AWS S3 using `config/storage.yml` and `infra/sst.config.ts`.
- SES SMTP - Production mail delivery to `email-smtp.us-west-2.amazonaws.com` in `config/environments/production.rb`.
- Sentry events/logs/traces/profiles - Sent by `config/initializers/sentry.rb`.
- Wikidata SPARQL requests - Sent to `https://query.wikidata.org/sparql` by `app/services/wikidata.rb`.
- oEmbed requests - Sent to registered providers in `config/initializers/oembed.rb`.
- Mapbox tile/style/data requests - Sent by browser map clients configured in `app/views/layouts/application.html.erb`, `app/javascript/map_view/index.jsx`, and `app/javascript/stats/map/config.js`.
- Scheduled task executions - SST production cron runs `indices:refresh` every 15 minutes and `emails:send_weekly_report` weekly in `infra/sst.config.ts`.

---

*Integration audit: 2026-05-03*
