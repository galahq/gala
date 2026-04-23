# Gala SST Infrastructure Migration

## What This Is

Gala SST Infrastructure Migration is a brownfield infrastructure project for moving the existing Gala Rails 7 monolith from its Heroku-style production shape to AWS using SST v4. The project focuses on making the existing `infra/` package, GitHub Actions deployment workflow, and required Rails production changes ready for staging validation and eventual production cutover at `www.learngala.com`.

## Core Value

Gala can run on AWS through SST with the same production behavior users rely on today, at lower recurring cost and without adding unnecessary operational complexity.

## Requirements

### Validated

- ✓ Gala is an existing Rails 7 monolith with Puma web, Sidekiq worker, PostgreSQL, Redis, Active Storage, Action Cable, Action Mailer, Action Mailbox, and Webpacker/Sprockets assets — existing
- ✓ Local development and app runtime are process-based through `Procfile.dev`, `Procfile`, Docker, Rails, Webpack dev server, and Sidekiq — existing
- ✓ The repo contains a separate `infra/` Node >=20 SST v4 package with TypeScript infrastructure code and npm lockfile ownership — existing
- ✓ The current SST configuration provisions ECS Fargate web and worker services, RDS PostgreSQL, Valkey/Redis, ALB routing, scheduled tasks, IAM media access, and stage-specific domains in `us-west-2` — existing
- ✓ GitHub Actions has a manual AWS deployment workflow using OIDC, Node 20, `npm ci`, `npx sst install`, and `npx sst deploy/remove` for `staging` and `production` — existing
- ✓ The migration target and tradeoffs are documented in `docs/aws-sst-migration-plan.md`, including the preference for Fargate, RDS, Valkey, ALB, EventBridge Scheduler, S3, SES, CloudWatch, Route 53, and ACM — existing

### Active

- [ ] Add or finalize a dedicated lightweight health endpoint and wire ECS/ALB health checks to it instead of using `/`.
- [ ] Ensure Active Storage S3 access works in ECS through IAM task roles and does not require static AWS access keys in production runtime.
- [ ] Validate that SST-managed web, worker, migration, index refresh, and weekly report tasks preserve Heroku production behavior.
- [ ] Establish a repeatable staging deployment and validation checklist for uploads, outbound mail, inbound mail assumptions, Action Cable, background jobs, scheduled jobs, assets, and runtime diagnostics.
- [ ] Define the Heroku-to-RDS data migration and production DNS cutover procedure with rollback and verification steps.
- [ ] Carry required secrets into SST per stage and verify GitHub OIDC permissions are scoped to the intended AWS account, region, and stages.
- [ ] Add post-cutover monitoring and cost checks before deciding whether to simplify Redis-dependent app architecture later.

### Out of Scope

- Replacing Sidekiq, Redis-backed Action Cable, or Redis caching with Solid Queue, Solid Cable, or database-backed alternatives — defer until AWS production is stable and real cost/operational data exists.
- Frontend modernization, Webpacker replacement, Node 12 removal, or React/Flow upgrades — important but independent from the hosting migration.
- Multi-AZ production database/cache architecture — phase 1 intentionally favors cost and simplicity over high-availability parity with larger AWS designs.
- Rewriting the Rails app for Lambda or serverless request handling — the migration plan explicitly prefers ECS Fargate for current app compatibility.
- Introducing NAT Gateways as a default architecture dependency — the current cost model keeps ECS tasks in public subnets and stateful services private to avoid NAT cost.

## Context

Gala is a production Rails application used for case content, catalog browsing, LTI/OAuth authentication, deployments, comments, analytics, search indexing, uploads, email, and real-time updates. The current runtime shape is Heroku-compatible: Puma handles web requests, Sidekiq handles background jobs, PostgreSQL stores relational data and materialized search indexes, Redis backs queues/cache/Action Cable, S3 stores Active Storage media, and SES SMTP handles outbound email.

The infrastructure migration target is documented in `docs/aws-sst-migration-plan.md`: phase 1 is a lift-and-shift to AWS in `us-west-2` using ECS Fargate, RDS PostgreSQL, Valkey, ALB, ECR, EventBridge Scheduler, S3, SES, CloudWatch Logs, Route 53, and ACM. The target production domain is `https://www.learngala.com`; staging uses `staging.learngala.com`.

The `infra/` directory is intentionally a separate Node project from the Rails app root. Root app tooling must stay on Ruby 3.2.9, Bundler 2.4.19, Node 12.5.0, and Yarn 1.x. Infrastructure tooling uses Node >=20, npm, SST 4.7.1, and TypeScript.

Known migration-sensitive behaviors include Active Storage direct uploads, Action Cable on `/cable`, Redis-backed Sidekiq and cache, Action Mailbox Amazon ingress, SES SMTP, scheduled `indices:refresh`, scheduled weekly report email, Rails assets in production, and environment-derived URLs through `BASE_URL`.

## Constraints

- **Runtime compatibility**: Preserve existing Rails/Puma/Sidekiq behavior during phase 1 — the migration should not require app architecture rewrites before cutover.
- **Region**: Use `us-west-2` for phase 1 — the existing media bucket and SES setup are already aligned there.
- **Cost**: Avoid NAT Gateways and always-on staging by default — recurring cost reduction is one of the main reasons for leaving Heroku.
- **Operational simplicity**: Prefer ECS Fargate over ECS on EC2 — no AMI lifecycle, host patching, or capacity provider tuning in the first cut.
- **Tooling boundary**: Keep `infra/` on Node >=20/npm and the app root on Node 12.5/Yarn 1 — mixing the toolchains risks breaking the legacy Rails frontend build.
- **Production safety**: Production removal must remain blocked in CI and SST production removal must retain resources — accidental production teardown is not acceptable.
- **Security**: Prefer IAM task roles for AWS resource access and GitHub OIDC for deployment — avoid new long-lived AWS keys where the platform can provide scoped identity.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use SST v4 with ECS Fargate for phase 1 hosting | Preserves the current Rails process model while reducing host management burden | - Pending |
| Keep Redis/Valkey for phase 1 | Sidekiq, Action Cable, and cache depend on Redis-compatible behavior today | - Pending |
| Use single-AZ RDS/Valkey initially | Matches the migration plan's cost and simplicity goal | - Pending |
| Keep `us-west-2` as the AWS region | Existing S3 and SES assumptions already point there | - Pending |
| Defer Rails queue/cable/cache simplification until after cutover | Coupling app architecture changes to hosting migration increases risk | - Pending |
| Treat `infra/` as a separate Node 20/npm package | The app root is pinned to legacy Node/Yarn tooling | - Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check -> still the right priority?
3. Audit Out of Scope -> reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-23 after initialization*
