# AWS SST Secret And Runtime Config Inventory

This inventory records configuration names and ownership only. Do not add secret
values, tokens, passwords, key material, database URLs, Redis URLs, or derived
credentials to this file.

## Sources Checked

- `infra/sst.config.ts`
- `.github/workflows/deploy.yml`
- `config/environments/production.rb`
- `config/initializers/devise.rb`
- `config/initializers/sentry.rb`
- `config/storage.yml`
- `config/database.yml`
- `config/cable.yml`
- `config/sidekiq.yml`
- `app/views/layouts/application.html.erb`
- `app/controllers/application_controller.rb`

## Stage Ownership

| Name | Class | Source | Web | Worker | Tasks | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `RAILS_MASTER_KEY` | boot-critical secret | SST secret | yes | yes | yes | Required to decrypt Rails credentials in production. |
| `SECRET_KEY_BASE` | boot-critical secret | SST secret | yes | yes | yes | Required by Rails production secret handling and sessions. |
| `DATABASE_URL` | generated-by-SST | SST Postgres | yes | yes | yes | Built from the SST Postgres resource; do not store manually unless overriding for a migration rehearsal. |
| `REDIS_URL` | generated-by-SST | SST Redis/Valkey | yes | yes | yes | Used by Sidekiq, Action Cable, and cache configuration. |
| `BASE_URL` | generated-by-SST/workflow | SST stage or `ALB_BASE_URL` workflow input | yes | yes | yes | Production validation must use the generated AWS ALB URL, not `https://www.learngala.com`. First deploys may use a pending placeholder until the ALB URL is captured and redeployed. |
| `AWS_REGION` | generated-by-SST | SST config | yes | yes | yes | Fixed to `us-west-2` for Phase 1. |
| `S3_BUCKET` | generated-by-SST | SST config | yes | yes | yes | Current media bucket name is `msc-gala`; object access is granted through task roles. |
| `GALA_STATIC_ASSETS_BUCKET` | generated-by-SST | SST config | yes | yes | yes | Defaults to account-scoped `gala-static-assets-353760060567`; override only for a bucket this AWS account can create or import. |
| `LTI_KEY` | feature-critical secret | SST secret | yes | yes | yes | Used by LTI launch handling and Devise LTI strategy. |
| `LTI_SECRET` | feature-critical secret | SST secret | yes | yes | yes | Pair for `LTI_KEY`. |
| `MAPBOX_ACCESS_TOKEN` | feature-critical secret | SST secret | yes | yes | yes | Used by server-rendered layout and client-side map features. |
| `MapboxAccessToken` | compatibility alias | SST environment | yes | yes | yes | Legacy casing used by the layout; sourced from the same SST secret as `MAPBOX_ACCESS_TOKEN`. |
| `SES_SMTP_USERNAME` | feature-critical secret | SST secret | yes | yes | yes | Enables production SMTP delivery through SES. |
| `SES_SMTP_PASSWORD` | feature-critical secret | SST secret | yes | yes | yes | Pair for `SES_SMTP_USERNAME`. |
| `RAILS_ENV` | generated-by-SST | SST environment | yes | yes | yes | Set to `production`. |
| `NODE_ENV` | generated-by-SST | SST environment | yes | yes | yes | Set to `production`. |
| `PORT` | generated-by-SST | SST environment | yes | yes | yes | Set to `3000` for Puma and health checks. |
| `RAILS_LOG_TO_STDOUT` | generated-by-SST | SST environment | yes | yes | yes | Enables container log streaming. |
| `RAILS_MAX_THREADS` | generated-by-SST | SST environment | yes | yes | yes | Used by Puma and database pool sizing. |
| `RAILS_SERVE_STATIC_FILES` | generated-by-SST | SST environment | yes | yes | yes | Keeps static asset serving enabled in the container. |
| `SIDEKIQ_CONCURRENCY` | generated-by-SST | SST environment | yes | yes | yes | Worker-focused setting; shared for parity with tasks. |
| `WEB_CONCURRENCY` | generated-by-SST | SST environment | yes | yes | yes | Used by Puma worker count and database pool sizing. |
| `COMMIT_SHA` | generated-by-CI | GitHub Actions/SST | yes | yes | yes | Optional deploy identity; empty outside CI. |

## Candidate Production Config Not Yet Declared In SST

| Name | Class | Source | Web | Worker | Tasks | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `GOOGLE_CLIENT_ID` | feature-critical secret if Google login is enabled | Devise initializer | yes | no | no | Required only if Google OAuth must work after cutover. |
| `GOOGLE_CLIENT_SECRET` | feature-critical secret if Google login is enabled | Devise initializer | yes | no | no | Pair for `GOOGLE_CLIENT_ID`. |
| `FACEBOOK_CLIENT_ID` | feature-critical secret if Facebook login is enabled | Devise initializer | yes | no | no | Required only if Facebook OAuth remains enabled. |
| `FACEBOOK_CLIENT_SECRET` | feature-critical secret if Facebook login is enabled | Devise initializer | yes | no | no | Pair for `FACEBOOK_CLIENT_ID`. |
| `SENTRY_DSN` | optional diagnostics secret | Sentry initializer | yes | yes | yes | Rails can boot without it; include if production error reporting must continue. |
| `SENTRY_TRACES_SAMPLE_RATE` | optional diagnostics config | Sentry initializer | yes | yes | yes | Numeric sample rate; no secret value. |
| `SENTRY_PROFILES_SAMPLE_RATE` | optional diagnostics config | Sentry initializer | yes | yes | yes | Numeric sample rate; no secret value. |
| `SENTRY_ENVIRONMENT` | optional diagnostics config | Sentry initializer | yes | yes | yes | Defaults to Rails environment if unset. |
| `MAPBOX_STYLE` | optional feature config | layout | yes | no | no | Defaults to the current Mapbox style if unset. |
| `TEMPORARY_UNCONFIRMED_ACCESS` | optional behavior flag | `config/application.rb` | yes | yes | yes | Confirm desired staging value before Phase 2. |
| `STAGING` | optional behavior flag | `config/application.rb` | yes | yes | yes | Currently inferred from `BASE_URL` when unset. |
| `RELEASE` | optional release metadata | `config/application.rb` | yes | yes | yes | Currently hard-coded in application config, with runtime display support. |

## Readiness Checklist

- Set SST secrets separately for `staging` and `production`; never copy secret values into docs or planning artifacts.
- Confirm whether Google and Facebook OAuth are required at AWS cutover. If yes, add them to SST before Phase 2 staging parity tests.
- Confirm whether Sentry should be active in staging and production. If yes, add `SENTRY_DSN` and sample-rate config before Phase 2.
- Keep `DATABASE_URL`, `REDIS_URL`, `AWS_REGION`, and `S3_BUCKET` generated by SST. Keep production `BASE_URL` tied to the generated ALB URL through `ALB_BASE_URL` before accepting route validation.
- Do not include `DATABASE_URL`, `REDIS_HOST`, `REDIS_URL`, `CACHE_URL`, or Heroku PostgreSQL URL keys in retained secret sync lists.
- `SECRET_KEY_BASE` is generated fresh for the isolated AWS environment when the Heroku app does not expose one.
- Keep web, worker, and task environments aligned unless a later phase documents a narrower runtime contract.
