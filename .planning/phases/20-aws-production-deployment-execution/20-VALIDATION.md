---
phase: 20
validation: 1
type: validation
status: planned
wave: 1
depends_on: [19]
title: Validate SST production AWS deployment execution
---

# Validation 20-01: Execute AWS production deployment through SST safely

## 0) Preflight

- `bash -n scripts/deploy-sst.sh`
- `scripts/deploy-sst.sh --help`
- `AWS_PROFILE=gala AWS_REGION=us-west-2 SST_STAGE=production sh -lc 'cd infra && npm ci && npx sst install'`
- `AWS_PROFILE=gala AWS_REGION=us-west-2 SST_STAGE=production sh -lc 'cd infra && npx sst diff --stage "$SST_STAGE"'`
- Confirm `db/sqldump/seed.dump` exists.
- Confirm `https://www.learngala.com` remains the current Heroku production URL before deployment.
- Confirm no AWS CLI or SST execution command in phase docs/scripts omits `AWS_PROFILE=gala AWS_REGION=us-west-2 SST_STAGE=production`.

## 1) GitHub Actions and SST gating

- Confirm `.github/workflows/deploy.yml`:
  - runs on `workflow_dispatch`,
  - accepts or derives `SST_STAGE=production`,
  - refuses destructive removal of `SST_STAGE=production`,
  - configures AWS credentials through OIDC,
  - calls `scripts/deploy-sst.sh`,
  - runs `npx sst install` before deploy.
- Confirm `scripts/deploy-sst.sh`:
  - builds and pushes an immutable ECR image tag,
  - passes `GALA_WEB_IMAGE_URI` to `npx sst deploy`,
  - deploys with `--stage "$SST_STAGE"` where `SST_STAGE=production`,
  - does not call destructive Heroku commands.
- Confirm no deployment artifact calls:
  - `heroku create`
  - `heroku git:remote`
  - `heroku releases`
  - `heroku apps:destroy`
  - `heroku config:set`
  - `heroku restart`

## 2) Runtime ownership checks

- Confirm `infra/sst.config.ts` assigns:
  - `DATABASE_URL` from SST `Postgres`,
  - `REDIS_URL` from SST `Redis`/Valkey,
  - `S3_BUCKET` to retained ActiveStorage bucket `msc-gala`,
  - `BASE_URL` from ALB output or explicit `ALB_BASE_URL` for production testing.
- Confirm Heroku-derived secret sync excludes:
  - `DATABASE_URL`
  - `REDIS_HOST`
  - `REDIS_URL`
  - any equivalent PostgreSQL, Redis, or cache connection string.
- Confirm generated AWS `DATABASE_URL` is the only value used for restore, migration, web, worker, and scheduled tasks.

## 3) Existing AWS resource import/reference safety

- Confirm SST production removal policy is `retain`.
- Confirm existing resource handling imports or references retained resources instead of destroying/recreating them:
  - `msc-gala` ActiveStorage bucket,
  - `gala-static-assets-353760060567` static asset bucket by default, or an explicitly supplied accessible/imported `GALA_STATIC_ASSETS_BUCKET`,
  - SES/Gmail-related credentials/config,
  - S3 IAM access needed by ECS task roles.
- Confirm S3 operations do not use:
  - `aws s3 rm`
  - `aws s3 rb`
  - `--delete`
  - lifecycle expiration changes
  - broad public-access mutations on ActiveStorage media.

## 4) Secrets and Heroku read-only config

- Run Heroku read checks only against `msc-gala`:
  - `heroku config:get RAILS_MASTER_KEY --app msc-gala`
  - `heroku config:get SECRET_KEY_BASE --app msc-gala` or record that the key is absent and generated fresh for AWS
  - additional retained keys as needed.
- Ensure retained non-database keys are present in AWS Secrets Manager/SST secrets:
  - `RAILS_MASTER_KEY`
  - `SECRET_KEY_BASE`
  - `SES_SMTP_USERNAME`
  - `SES_SMTP_PASSWORD`
  - `MAPBOX_ACCESS_TOKEN`
  - `LTI_KEY`
  - `LTI_SECRET`
- OAuth, Gmail, Sentry, and other production keys required by runtime parity.
- Confirm no secret values are written to repo files, workflow logs, or planning artifacts.

## 5) Database initialization and migration validation

- Verify `db/sqldump/seed.dump` is the selected initialization source.
- Verify restore command receives only the SST-provisioned AWS `DATABASE_URL`.
- Verify Rails migrations run only against the AWS database after restore.
- Verify restore logs do not include a Heroku `postgres://` or Heroku Redis/cache URL.

## 6) Deploy and ALB URL verification

- Run `.github/workflows/deploy.yml` manually with:
  - selected branch,
  - `SST_STAGE=production`,
  - `action=deploy`.
- Capture SST outputs:
  - app/ALB URL,
  - image tag,
  - migration task definition,
  - cluster/service identifiers.
- Validate the AWS app through the generated ALB URL:
  - `curl -I "http://<ALB_DNS>/up"` or `curl -I "https://<ALB_DNS>/up"` returns expected health status.
  - one representative app route returns expected `200` or auth redirect.
- Validate current Heroku production is untouched:
  - `curl -I "https://www.learngala.com/up"` or an equivalent public health/page check still responds as before.
  - no Heroku release, restart, config mutation, or DNS cutover occurred.
  - any Heroku evidence command is app-scoped to `msc-gala` with `--app msc-gala`.

## 7) Rollback readiness

- Confirm previous ECS deployment can be selected:
  - save prior task definition revision before rollout,
  - ECS console/CLI can roll back by switching service to previous revision or previous image tag.
- Confirm previous image remains in ECR (`deploy-<previous-sha>` and `latest`).
- Confirm rollback does not mutate Heroku production or existing ActiveStorage objects.

## 8) Post-change evidence

- Keep deploy run command with:
  - resolved image tag,
  - ALB URL,
  - `db/sqldump/seed.dump` initialization source,
  - AWS database/cache source confirmation,
  - Heroku excluded-key confirmation,
  - retained AWS resource/import confirmation,
  in run logs or release notes for auditability.
