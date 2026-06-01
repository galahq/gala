# operator-guardrails(7)

## NAME
operator-guardrails - CODEOWNER safety contract for Gala AWS operations

## SYNOPSIS
Audit Docker, ECS, SST, and GitHub Actions changes against this contract before
running or editing operator workflows.

## INPUTS
Read `.github/workflows/deploy.yml`, `.github/workflows/preview.yml`,
`scripts/deploy-sst.sh`, `infra/sst.config.ts`, `Dockerfile.production`,
`Dockerfile.production-base`, `CODEOWNERS`, `docs/aws-sst-secret-inventory.md`,
and `docs/aws-production-operator-runbook.md`. Do not copy secret values.

## DRY RUN
Every operator workflow must support `dry_run` that writes planned side effects,
target stage, release/artifact ID, AWS identity, and validation output to
`GITHUB_STEP_SUMMARY` before mutation.

## SIDE EFFECTS
Allowed side-effect classes: AWS ECS service/task changes, S3 static asset release
prefixes, GitHub releases/comments, RDS migrations/snapshots, Redis/Rails cache,
CloudFront invalidations, Cloudflare DNS, and explicit Heroku `.com` non-mutation.

## Side-Effect Classes
Same as above; every workflow must print its class, target, and rollback limits.

## VERIFY
Operators verify stage, AWS account, task definitions, preview URL or `/up`, PR
comment when created, release metadata, CloudFront distribution IDs, and logs.

## ROLLBACK
Immediate recovery uses ECS task-definition rollback. Reproducible recovery or
drift repair redeploys a selected release/image/artifact. Neither path reverses
database migrations, Rails cache, CloudFront cache, or static asset prefixes.
Task-definition rollback targets must be ACTIVE; if a captured prior revision is
inactive, re-register an equivalent copy first and then roll back to that new
ACTIVE revision.

## EXAMPLES
Use dev deploy for feature branches, promote-production for production release,
rollback for ECS/release recovery, and maintenance for migrations, one-off tasks,
Rails cache clear, or CloudFront invalidation.

## Current Surfaces
- `.github/workflows/deploy.yml`: manual SST deploy for `dev` or `production`.
- `.github/workflows/preview.yml`: PR/manual dev preview deploy and PR comment.
- `scripts/deploy-sst.sh`: image build, assets, SST deploy, hooks, invalidation.
- `infra/sst.config.ts`: web/worker services, `GalaMigrate`,
  `GalaSeedDatabase`, `GalaRefreshIndices`, `GalaWeeklyReport`, outputs.
- `Dockerfile.production` and `Dockerfile.production-base`: runtime image chain.
- `CODEOWNERS`: workflow, infra, deploy script, and planning review ownership.
- `docs/aws-sst-secret-inventory.md`: secret inventory, names only.

## Locked Operator Model
Operator actions are manual `workflow_dispatch` jobs. Use separate deploy,
promote, and rollback workflows plus one maintenance workflow. PR merge-to-base
is a protected branch process, not a mutating dispatch job. Production mutations
require CODEOWNER/environment approval and exact typed confirmation.

## Required Workflow Set
- `preview.yml`: manual feature-branch dev deploy; PR comment if preview exists.
- `promote-production.yml`: production promotion from reviewed ref/artifact.
- `rollback.yml`: ECS task-definition rollback and release/image redeploy lanes.
- `maintenance.yml`: migration, allowlisted one-off, `rails_cache_clear`,
  `cloudfront_invalidate`, and `both`.
- `pr-merge-to-base.md`: protected merge procedure.

## Docker And ECS Task Alignment
`webImage` feeds web, worker, `GalaMigrate`, `GalaSeedDatabase`,
`GalaRefreshIndices`, and `GalaWeeklyReport`; migrations and one-off scripts must
run as ECS tasks using that production app image and shared AWS environment.
`Dockerfile.production` builds the app image from `Dockerfile.production-base`.
Existing outputs and AWS discovery cover migration task execution, web/worker
services, task-definition rollback targets, and CloudFront distribution IDs.
`GALA_CONTAINER_ARCHITECTURE` is the shared architecture knob for Docker image
platform and SST task definitions. The current default remains `x86_64`.
`GALA_ECS_ONLY_DEPLOY=true` is an image-only path: if web or worker task
definitions do not already match the requested architecture, use the full SST
task-definition deployment path for the first transition before resuming
ECS-only image promotion.
Phase 28 proved dev ARM64 runtime but kept the production default at `x86_64`
because direct rollback to captured X86_64 task definitions failed after those
revisions became inactive.

## Known Gaps
- `25-02`: preview trigger boundary and dry-run summary hardening.
- `25-02`: production typed confirmation and environment/CODEOWNER gate.
- `25-02`: rollback workflow with ECS task-definition and release lanes.
- `25-02`: maintenance modes for migrations, allowlisted one-offs,
  `rails_cache_clear`, `cloudfront_invalidate`, and `both`.
- `25-02`: Rails cache clear through ECS task, never runner Rails shell.
- `25-02`: CloudFront invalidation scope and distribution output use.
- `25-03`: PR merge-to-base process doc.
- `25-03`: one-page manpage workflow docs and validation.
- `25-03`: CODEOWNERS coverage for docs and ops helpers.

## Validation Contract
Parse workflow YAML, lint shell helpers, check `workflow_dispatch`, dry-run,
confirmation, `GITHUB_STEP_SUMMARY`, ECS `run-task`, ECS `update-service`, and
CloudFront invalidation evidence. Reject arbitrary shell one-offs and direct
production Rails commands from GitHub runners.
