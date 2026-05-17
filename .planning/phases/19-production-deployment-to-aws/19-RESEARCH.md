# Phase 19: Production Deployment to AWS - Research

**Gathered:** 2026-05-16
**Status:** Ready for planning

## Current signals

- `infra/sst.config.ts` already defines ECS web/worker services, RDS PostgreSQL, Valkey, ALB, scheduled tasks, ECR-backed Docker build path, and Secrets Manager references.
- Existing defaults already use `us-west-2` and `www.learngala.com`/`staging.learngala.com` for domain handling in stage mode.
- Active storage config references `S3` as `amazon` and currently points to `msc-gala` in existing docs/config patterns.
- `db/sqldump/seed.dump` exists and `scripts/docker/db-init-restore.sh` already supports restore for both `.dump` and `.sql` snapshots.
- There is no existing deploy script in this repo that performs a full `ECR build+push + assets sync` flow with Heroku-safe secret fallback and no production-affecting Heroku actions.

## Safety and constraint findings

- The Heroku production site (`https://www.learngala.com`) must not be changed or redeployed by this phase.
- Existing migration notes already caution against using non-read-only Heroku calls for deployment workflow actions.
- Any migration plan must treat S3 assets conservatively: reuse the current production media bucket if possible; otherwise copy from source to new bucket only.

## Open design questions

1. Whether the first AWS production URL uses the ALB DNS name or custom DNS immediately.
2. Whether to keep Redis (`valkey`) in phase 1 due to Sidekiq/ActionCable compatibility requirements.
3. Whether to import or skip existing media bucket contents before production cutover.

## Candidate plan direction

- Keep architecture small at first: ECS web + one Sidekiq worker, one ALB, one small Postgres instance, and one certificate in ACM.
- Preserve existing `scripts/docker/db-init-restore.sh` dump pattern while documenting any deploy-time variant needed for ECS.
- Put rollback in image tags and ECS task-definition history; include a documented rollback command path in the phase output.
- Keep Heroku usage to read-only `config:get`-style calls only for fallback secret values.
