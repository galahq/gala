---
phase: 20
type: audit
status: complete
date: 2026-05-22
title: Audit documented AWS deployment phase against SST deploy target
---

# Phase 20 Audit: SST AWS Deployment Safety

## Audit Scope

This audit checked the documented Phase 20 deployment plan against the current deployment goal:

- deploy through SST IaC from `.github/workflows/deploy.yml`,
- do not break current Heroku production at `https://www.learngala.com`,
- test the new AWS environment through the generated AWS ALB URL,
- use freshly provisioned AWS database/cache connection strings,
- initialize the AWS database from `db/sqldump/seed.dump`,
- keep existing ActiveStorage S3 objects intact,
- read retained secrets from `heroku --app msc-gala` while excluding Heroku database/cache connection strings,
- run AWS/SST commands with `AWS_PROFILE=gala AWS_REGION=us-west-2 SST_STAGE=production`,
- reuse/import existing AWS resources without destructive actions.

## Files Reviewed

- `.github/workflows/deploy.yml`
- `scripts/deploy-sst.sh`
- `infra/sst.config.ts`
- `docs/aws-sst-secret-inventory.md`
- `.planning/phases/20-aws-production-deployment-execution/20-01-PLAN.md`
- `.planning/phases/20-aws-production-deployment-execution/20-VALIDATION.md`
- `db/sqldump/seed.dump`

## Findings

| ID | Severity | Finding | Required Follow-Up |
| --- | --- | --- | --- |
| AUDIT-20-01 | High | Phase 20 described a local script-first deployment path instead of the GitHub Actions SST deployment path. | Use `.github/workflows/deploy.yml` and `scripts/deploy-sst.sh` as the deployment boundary. |
| AUDIT-20-02 | High | Production URL handling must avoid `https://www.learngala.com` until DNS cutover is separately approved. | Validate only through the generated AWS ALB URL and keep Heroku production unchanged. |
| AUDIT-20-03 | High | Heroku secret retention must exclude Heroku database/cache connection strings. | Do not copy `DATABASE_URL`, `REDIS_HOST`, `REDIS_URL`, or equivalent connection strings from Heroku into AWS. |
| AUDIT-20-04 | High | Database restore must target the fresh AWS database. | Initialize from `db/sqldump/seed.dump` only into the SST-provisioned `DATABASE_URL`. |
| AUDIT-20-05 | Medium | SST must import or reference existing AWS resources that should remain intact. | Retain/import `msc-gala`, static asset bucket state, SES/Gmail-related credentials, and S3 access policies without destructive actions. |
| AUDIT-20-06 | Medium | ActiveStorage object safety needs an explicit validation gate. | Confirm no delete, lifecycle, bucket removal, or destructive sync happens against existing S3 objects. |

## Current Phase Decision

Phase 20 is now the current phase because the user explicitly redirected the milestone goal to successful AWS deployment through SST and GitHub Actions. Phase 19 remains prerequisite planning context, but Phase 20 owns execution readiness and validation.

## Non-Negotiable Safety Gates

1. Heroku production at `https://www.learngala.com` remains unchanged.
2. AWS deployment uses the generated ALB URL for testing.
3. AWS runtime database/cache values come from SST resources.
4. Heroku `DATABASE_URL`, `REDIS_HOST`, `REDIS_URL`, and equivalent connection strings are excluded from secret sync.
5. `db/sqldump/seed.dump` data is restored only into the fresh AWS database.
6. Existing ActiveStorage S3 objects remain intact.
7. SST production resources use retain/import behavior where existing AWS resources must survive.
8. AWS/SST commands use `AWS_PROFILE=gala AWS_REGION=us-west-2 SST_STAGE=production`; Heroku read-only commands use `heroku --app msc-gala`.

## Outcome

The Phase 20 plan and validation artifacts were updated to make SST/GitHub Actions the deployment boundary and to add explicit guards for ALB-only testing, fresh AWS database/cache ownership, Heroku read-only secret handling, non-destructive ActiveStorage reuse, existing AWS resource import, and rollback.
