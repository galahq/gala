# Phase 19 Validation Plan

## Scope

Plan artifacts only in this phase; no production deployment execution is required to complete planning.

## Read-only prechecks

- `bash -n scripts/deploy-gala-aws-production.sh`
- `bash scripts/deploy-gala-aws-production.sh --help`
- `rg -n "heroku config|deploy|ecs|ecr|s3 sync|ALB|BASE_URL|rollback|db.dump|db/sqldump" .planning/phases/19-production-deployment-to-aws/*.md scripts/deploy-gala-aws-production.sh`
- `aws --version` (if available)

## ECR/AWS dry checks

- `AWS_PROFILE=gala AWS_REGION=us-west-2 aws sts get-caller-identity --profile "$AWS_PROFILE"`
- `AWS_PROFILE=gala AWS_REGION=us-west-2 aws ecr describe-repositories --region "$AWS_REGION" --profile "$AWS_PROFILE" --repository-names gala`
- `AWS_PROFILE=gala AWS_REGION=us-west-2 aws s3 ls --region "$AWS_REGION" --profile "$AWS_PROFILE"`
- If these checks fail in non-production machine, rerun after AWS credentials/egress are configured.

### Dry-run behavior note

- `scripts/deploy-gala-aws-production.sh --dry-run ...` should be used for CI/local review and must not emit AWS network errors when AWS is unreachable.

## Asset sync check list

- Validate source manifest directories after precompile:
  - `public/assets`
  - `public/packs`
- Validate target bucket variables:
  - `TARGET_ASSET_BUCKET` (default `gala-static-assets`)
  - `TARGET_MEDIA_BUCKET` (default `msc-gala` unless explicitly switched to a new bucket)
  - optional import source `msc-gala`
- Confirm static and media syncs are one-way only; runbook does not include destructive deletes.

## Secret sync check list

- Confirm required keys are present in AWS Secrets Manager under `gala/production/<KEY>`:
  - `RAILS_MASTER_KEY`
  - `SECRET_KEY_BASE`
  - `SES_SMTP_USERNAME`
  - `SES_SMTP_PASSWORD`
  - `MAPBOX_ACCESS_TOKEN`
  - `LTI_KEY`
  - `LTI_SECRET`

## DB dump check list

- `test -f db/sqldump/seed.dump`
- `find db -maxdepth 4 -type f \( -name "*.dump" -o -name "*.sql" \)`
- Confirm selected file path is logged in deploy script output.
- Confirm script is able to run restore path when `--seed-database` is set and `DATABASE_URL` is provided.

## CloudFront check list

- Confirm CloudFront distribution exists for:
  - static assets (`gala-static-assets`)
  - ActiveStorage media (`msc-gala` or new `TARGET_MEDIA_BUCKET`)
- Confirm cache/control headers are attached for static content and mutable URLs bypass aggressive cache if required.

## Mutation-gating checks

- Confirm no command in phase artifacts performs `heroku create|git:remote|apps:destroy|releases`.
- Confirm Heroku calls in script and docs are read-only `config` calls only.
- Confirm migration steps call out that production bucket writes are only import/sync and never bucket delete/destroy.

## Deployment outcome checks

- Confirm `curl -I https://<alb-dns>/up` returns `200` after ECS service is updated.
- Confirm a browser can load at least one app route through ALB hostname.
- Confirm at least one request resolves through CloudFront distributions for static/media assets.
- Confirm the runbook is available in operator docs and updated for rollback.
