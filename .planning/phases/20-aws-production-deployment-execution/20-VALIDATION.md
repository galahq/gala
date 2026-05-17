---
phase: 20
validation: 1
type: validation
status: planned
wave: 1
depends_on: [19]
title: Validate production AWS deployment execution
---

# Validation 20-01: Execute AWS production deployment safely

## 0) Preflight

- `AWS_PROFILE=gala AWS_REGION=us-west-2 bash -n scripts/deploy-gala-aws-production.sh`
- `AWS_PROFILE=gala AWS_REGION=us-west-2 scripts/deploy-gala-aws-production.sh --help`
- `AWS_PROFILE=gala AWS_REGION=us-west-2 scripts/deploy-gala-aws-production.sh --dry-run --skip-heroku-secret-check --seed-database --database-url "$DATABASE_URL"`

## 1) Artifact and command gating

- Confirm script flags are present:
  - `--seed-database`
  - `--data-dump`
  - `--asset-bucket`
  - `--source-bucket`
  - `--target-media-bucket`
  - `--skip-asset-import`
  - `--skip-secret-sync`
- Confirm the script never calls any of:
  - `heroku create`
  - `heroku git:remote`
  - `heroku releases`
  - `heroku apps:destroy`

## 2) Read/write safety gates

- Verify bucket behavior is additive:
  - `TARGET_MEDIA_BUCKET=msc-gala` should keep ActiveStorage source bucket unchanged.
  - If `TARGET_MEDIA_BUCKET` differs, confirm one-way `s3 sync` is used and no `--delete`.
  - Confirm static sync only uploads `public/assets`, `public/packs`, `public/webpack`, `public/fonts`, `public/images`, `public/javascripts`, `public/stylesheets`.
- Confirm seed file resolver:
  - `db/sqldump/seed.dump` exists in repo.
  - fallback search under `db/**/*` is in place for `*.dump` and `*.sql`.

## 3) Secrets and runtime config

- Run with Heroku fallback enabled for a read check:
  - `HEROKU_APP_NAME=msc-gala AWS_PROFILE=gala AWS_REGION=us-west-2 scripts/deploy-gala-aws-production.sh --dry-run --skip-asset-import`
- Ensure required keys are written to Secrets Manager (real values or placeholder if missing):
  - `RAILS_MASTER_KEY`
  - `SECRET_KEY_BASE`
  - `SES_SMTP_USERNAME`
  - `SES_SMTP_PASSWORD`
  - `MAPBOX_ACCESS_TOKEN`
  - `LTI_KEY`
  - `LTI_SECRET`
- Confirm all secret IDs live under `gala/production/<KEY>` by default.

## 4) Rollout/verification

- Execute real deploy once credentials are confirmed and required buckets exist:
  - `AWS_PROFILE=gala AWS_REGION=us-west-2 HEROKU_APP_NAME=msc-gala \
    AWS_SECRET_PREFIX=gala/production scripts/deploy-gala-aws-production.sh \
    --asset-bucket gala-static-assets --source-bucket msc-gala --create-asset-bucket \
    --reuse-source-bucket --seed-database --database-url "$DATABASE_URL"`
- Record ALB DNS from stack output.
- Validate route health:
  - `curl -I "https://<ALB_DNS>/up"` returns `200`.
  - `curl -I "https://<ALB_DNS>/cases"` returns `200/302` expected by app auth state.
- Validate CloudFront paths for static and media:
  - request static font/js/css asset using CloudFront domain; confirm cache headers.
  - request sample ActiveStorage URL through media CloudFront domain.

## 5) Rollback readiness

- Confirm previous ECS deployment can be selected:
  - save prior task definition revision before rollout,
  - ECS console/CLI can roll back by switching service to previous revision or previous image tag.
- Confirm previous image remains in ECR (`deploy-<previous-sha>` and `latest`).

## 6) Post-change evidence

- Keep deploy run command with:
  - resolved image tag,
  - media bucket,
  - asset bucket,
  - data dump path,
  - seed toggle,
  - secret sync mode,
  in run logs or release notes for auditability.
