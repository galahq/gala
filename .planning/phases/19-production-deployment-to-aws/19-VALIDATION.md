# Phase 19 Validation Plan

## Scope

Plan artifacts only in this phase; no production deployment execution is required to complete planning.

## Read-only prechecks

- `bash -n scripts/deploy-gala-aws-production.sh`
- `bash scripts/deploy-gala-aws-production.sh --help`
- `rg -n "heroku config:get|deploy|ecs|ecr|s3 sync|ALB|BASE_URL|rollback|db.dump|db/sqldump" .planning/phases/19-production-deployment-to-aws/*.md scripts/deploy-gala-aws-production.sh`
- `aws --version` (if available)

## ECR/AWS dry checks

- `aws sts get-caller-identity --profile "$AWS_PROFILE"`
- `aws ecr describe-repositories --region us-west-2 --profile "$AWS_PROFILE" --repository-names gala`
- `aws s3 ls --region us-west-2 --profile "$AWS_PROFILE"`
- If these checks fail in non-production machine, rerun after AWS credentials/egress are configured.

### Dry-run behavior note

- `scripts/deploy-gala-aws-production.sh --dry-run ...` should be used for CI/local review and must not emit AWS network errors when AWS is unreachable.

## Asset sync check list

- Validate source manifest directories after precompile:
  - `public/assets`
  - `public/packs`
- Validate target bucket variable:
  - `gala-static-assets`
  - optional import source `msc-gala`

## DB dump check list

- `find db -maxdepth 4 -type f \( -name "*.dump" -o -name "*.sql" \)`
- Confirm selected file path is logged in deploy script output.

## Mutation-gating checks

- Confirm no command in phase artifacts performs `heroku create|git:remote|apps:destroy|releases`.
- Confirm Heroku calls in script and docs are `config:get`-style read-only calls only.
- Confirm migration steps call out that production bucket writes are only import/sync and never bucket delete/destroy.

## Deployment outcome checks

- Confirm `curl -I https://<alb-dns>/up` returns `200` after ECS service is updated.
- Confirm a browser can load at least one app route through ALB hostname.
- Confirm the runbook is available in operator docs and updated for rollback.
