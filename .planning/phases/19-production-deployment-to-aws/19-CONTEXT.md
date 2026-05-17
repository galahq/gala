# Phase 19: Production Deployment to AWS (Planning Context)

**Gathered:** 2026-05-16
**Status:** Planned

## Objective

Plan and prepare a production-safe AWS cutover flow that avoids changing existing Heroku production resources at `https://www.learngala.com` while enabling a new or migrated AWS deployment path.

The phase will produce a local deploy script and explicit infrastructure execution plan for:

- Building and pushing Docker images to ECR
- Syncing static assets (JS/CSS/typography) to the configured S3 assets target
- Loading database bootstrap dumps from `db/**/*`
- Defining a rollback-ready ECS task-definition strategy

## Why this phase exists now

The repository already includes SST-era infrastructure code and assets docs, but there is no explicit production deployment script that addresses all of:

- local dump-driven DB bootstrap workflow,
- deterministic ECR image tagging/rollback,
- non-disruptive asset bucket transition from existing Gala media resources,
- strict separation of AWS deployment flow from current Heroku resource mutation.

This phase establishes the plan and script contract before any cloud-mutating deploy execution.

## Scope Boundaries

- Plan and document AWS architecture and operations only; do not perform destructive cloud operations in this phase.
- Keep the Heroku runtime untouched for the production site.
- Avoid adding broad redesign work (UI, JS, Ruby, Postgres major architecture changes).
- Preserve current application behavior and keep the rollout reversible.

## Non-goals

- Upgrading application architecture beyond existing Ruby/Rails runtime and current ECS baseline.
- Enabling multi-VPC topology in this phase.
- Adding new frontend migration tooling beyond the requested `db/**/*` dump path.

## Reference set

- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `infra/sst.config.ts`
- `docs/aws-sst-migration-plan.md`
- `docs/aws-sst-secret-inventory.md`
- `docs/aws-sst-phase-1-preflight.md`
- `db`
- `scripts/docker/db-init-restore.sh`
