# Project Research Summary

**Project:** Gala SST Infrastructure Migration
**Domain:** Brownfield Rails monolith migration from Heroku-style runtime to AWS/SST
**Researched:** 2026-04-23
**Confidence:** HIGH for repo-derived migration requirements; MEDIUM for AWS/SST behavior that still needs live staging validation

## Executive Summary

Gala should move to AWS as a behavior-preserving SST v4/ECS Fargate migration, not as an app rewrite. The existing Rails production shape is Puma web, Sidekiq worker, PostgreSQL, Redis, S3 Active Storage, SES SMTP, Action Cable, scheduled rake tasks, and production asset serving. The current `infra/` package already mirrors that architecture with ECS services, RDS PostgreSQL, Valkey, ALB, scheduled ECS tasks, IAM media policies, stage domains, and a GitHub OIDC deploy workflow.

The roadmap should harden what already exists before touching production data: health checks, stage secrets, deploy guardrails, image build parity, IAM-based S3 behavior, Redis-backed worker and Cable behavior, scheduled task parity, and staging validation. Only after staging proves those behaviors should the project rehearse Heroku-to-RDS data migration and production DNS cutover.

The highest-risk failure modes are using `/` as an infrastructure health check, assuming Active Storage will use ECS task-role credentials without proving it, missing Heroku-to-SST secret parity, losing writes during data cutover, and treating an SST deploy as equivalent to app-level migration success. The migration succeeds when real Gala workflows work on AWS, not when resources merely provision.

## Key Findings

### Recommended Stack

Keep the migration as an SST v4/ECS Fargate lift-and-shift. `infra/` should remain a separate Node >=20/npm project using SST `4.7.1` and TypeScript. The Rails root must keep Ruby `3.2.9`, Bundler `2.4.19`, Node `12.5.0`, Yarn `1.x`, Rails `7.0.8.7`, Puma `7.1.0`, Sidekiq `7.3.6`, Webpacker/Sprockets, and the current Docker image path.

AWS phase 1 should stay in `us-west-2` with ECS Fargate web and worker services, explicit ECS tasks for migrations/search refresh/weekly report, RDS PostgreSQL `16.4`, Valkey `7.2`, ALB/Route 53/ACM, S3 media bucket `msc-gala`, SES SMTP, CloudWatch Logs, IAM task roles, and GitHub Actions OIDC deploys.

**Core technologies:**
- SST `4.7.1`: infrastructure definition and deploys — already owns the AWS topology in `infra/sst.config.ts`.
- ECS Fargate: Rails web, worker, and one-off task runtime — preserves the Heroku-style process model without host management.
- RDS PostgreSQL `16.4`: primary database — matches the app's ActiveRecord/Postgres architecture and local Docker version.
- Valkey `7.2`: Redis-compatible backend — preserves Sidekiq, Action Cable, cache, and Rack::Attack behavior for phase 1.
- S3 + IAM task roles: Active Storage media — should replace static AWS runtime keys in ECS.
- SES SMTP: outbound mail — already reflected in Rails production config and migration plan.

### Expected Features

The migration's "features" are operational capabilities needed for safe staging validation and production cutover.

**Must have (table stakes):**
- Dedicated lightweight health endpoint with ALB and ECS health checks wired to it.
- Stage-scoped SST secrets inventory and setup for Rails keys, LTI, Mapbox, SES, OAuth/Sentry if used, and deploy-time identity.
- IAM task-role based S3 access for Active Storage in ECS.
- Repeatable staging deploy/remove workflow through GitHub Actions and SST.
- Web service parity for Rails HTML, JSON, CSV, static assets, OAuth/LTI callbacks, direct uploads, and `/cable`.
- Worker service parity for Sidekiq queues, mailers, broadcasts, Active Storage jobs, reports, and search work.
- Scheduled task parity for `indices:refresh` and `emails:send_weekly_report`.
- Heroku-to-RDS data migration rehearsal, production cutover runbook, DNS/TLS cutover procedure, and rollback decision points.
- Behavior-based smoke checks for uploads, mail, inbound mail assumptions, Action Cable, jobs, assets, auth/LTI, search, diagnostics, and cost.

**Should have (safety differentiators):**
- Automated or documented staging validation checklist.
- Deployment outputs captured as artifacts or runbook inputs.
- Guardrails for missing SST secrets before deploy.
- Data migration rehearsal against staging with production-like data.
- WebSocket broadcast validation and runtime diagnostics hardening.
- Cost inventory after staging removal and production stabilization.

**Defer (v2+):**
- Solid Queue, Solid Cable, Redis removal, CloudFront, multi-AZ RDS/Valkey, frontend modernization, root Node upgrades, Lambda/serverless hosting, ECS-on-EC2, NAT Gateways, and broad security hardening unrelated to migration acceptance.

### Architecture Approach

The architecture should use one shared Rails container image with multiple commands: Puma for web, Sidekiq for worker, and ECS tasks for migrations and scheduled rake tasks. The web service receives traffic through Route 53, ACM, and ALB; both web and worker talk to RDS, Valkey, S3, and SES. EventBridge/SST Cron replaces Heroku Scheduler. GitHub Actions dispatches deploy/remove actions using OIDC and the isolated `infra/` npm package.

**Major components:**
1. GitHub Actions deploy workflow — manual stage deploy/remove, AWS OIDC, Node 20, npm, SST.
2. SST infrastructure package — VPC, ECS, RDS, Valkey, ALB/domain, tasks, schedules, secrets, IAM.
3. Shared Rails Docker image — production app image for web, worker, migrations, and scheduled tasks.
4. ECS web service — Puma, Rails routes, static assets, direct uploads, Action Cable, auth callbacks.
5. ECS worker service — Sidekiq queues, mailers, broadcasts, analysis/purge jobs, reports.
6. ECS one-off/scheduled tasks — `db:migrate`, `indices:refresh`, `emails:send_weekly_report`.
7. RDS PostgreSQL and Valkey — stateful data, queues, cache, and pub/sub.
8. S3 and SES — media storage and mail, with inbound Action Mailbox requiring explicit validation.

### Critical Pitfalls

1. **Root path health checks** — add a dedicated `/up`-style endpoint and switch both ALB and container health checks to it before staging validation.
2. **S3 IAM mismatch** — update or prove Active Storage production config uses ECS task-role credentials, not static AWS key env vars.
3. **Secret parity gaps** — compare Heroku config vars to SST secrets per stage and test each feature path that depends on them.
4. **Unsafe data cutover** — rehearse data migration, pause/drain writers and schedulers, inspect queues, refresh search, and define rollback rules before DNS.
5. **Redis/Valkey coupling** — validate Sidekiq, Action Cable, Rails cache, and Rack::Attack separately because one bad `REDIS_URL` breaks multiple systems.
6. **Scheduler non-equivalence** — manually validate ECS tasks and production schedules before disabling Heroku Scheduler or relying on search/report parity.
7. **Production image fragility** — keep root app tooling pinned and verify production asset precompile before treating SST deploy as a reliable build signal.

## Implications for Roadmap

### Phase 1: Infra Safety Baseline

**Rationale:** Every later step depends on predictable deploys, stable health checks, correct secrets, and safe AWS identity.
**Delivers:** Dedicated health endpoint, SST health-check wiring, secret inventory, GitHub OIDC/stage guardrail review, production removal guard confirmation, S3 IAM credential path design.
**Addresses:** Health checks, secret parity, deploy guardrails, IAM media access.
**Avoids:** Root-path health flapping, missing secrets, accidental production removal, static AWS key dependence.

### Phase 2: Staging Runtime Parity

**Rationale:** The AWS stack must prove the current app behavior before production data or DNS changes.
**Delivers:** Repeatable staging deploy, image/asset validation, web and worker smoke checks, Redis/Valkey validation, Action Cable checks, upload/read/delete checks, outbound mail checks, scheduled task manual runs, runtime diagnostics/log checks.
**Uses:** ECS Fargate, RDS, Valkey, S3, SES, ALB, CloudWatch, shared Rails image.
**Implements:** The full behavior-preserving staging runtime.

### Phase 3: Data Migration Rehearsal

**Rationale:** Data movement and queues are the riskiest production-specific part and need rehearsal before cutover pressure.
**Delivers:** Heroku Postgres export/restore rehearsal into RDS, migration task runbook, table count/checksum comparisons, materialized search refresh validation, Sidekiq queue inspection plan, rollback rules for write divergence.
**Addresses:** RDS migration, scheduled/search parity, data integrity, rollback feasibility.

### Phase 4: Production Cutover

**Rationale:** Cutover should only happen after infrastructure and data rehearsals pass.
**Delivers:** Final freeze/drain steps, final data migration, AWS migration task run, search refresh, DNS/TLS switch for `www.learngala.com`, provider/callback checks, production smoke test, rollback decision window.
**Avoids:** Lost writes, duplicated scheduled work, callback drift, unsafe rollback.

### Phase 5: Post-Cutover Hardening

**Rationale:** Cost, observability, and simplification decisions need real AWS production data.
**Delivers:** Cost review, CloudWatch/Sentry/log retention tuning, Redis TLS verification follow-up, staging removal cost check, production stability review, decision record for Redis removal/Solid Queue/Solid Cable/CloudFront/multi-AZ.
**Defers:** App modernization and infrastructure optimization until AWS production behavior is stable.

### Phase Ordering Rationale

- Deploy identity, health checks, and secrets come before staging because broken boot/health behavior makes every other validation noisy.
- Staging runtime parity comes before data migration because production data should not be moved into an unproven runtime.
- Data migration rehearsal comes before cutover because rollback and write ownership decisions must be made calmly.
- Production cutover is separate from post-cutover hardening so optimization does not mask migration acceptance.
- Redis removal, frontend modernization, CDN, multi-AZ, and queue/cable replacement are explicitly deferred because they alter app behavior beyond hosting migration.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Active Storage IAM credential behavior in Rails/S3 config, because the infra grants task-role permissions while `config/storage.yml` still names static key env vars.
- **Phase 2:** Action Mailbox Amazon ingress, because app-side Rails config exists but AWS receipt/DNS resources are not fully represented in SST.
- **Phase 3:** Heroku-to-RDS migration mechanics, because the exact dump/restore, freeze, queue-drain, and rollback approach must match production realities.
- **Phase 4:** OAuth/LTI/DNS callback cutover, because external provider configuration can break independently of AWS deploy success.

Phases with standard patterns:
- **Phase 5:** Cost review and post-cutover decision logging can follow standard AWS/SST operational review patterns once production metrics exist.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Directly supported by `infra/package.json`, `infra/sst.config.ts`, repo runtime pins, codebase map, and migration plan. |
| Features | HIGH | Capabilities are derived from existing app behavior, deploy workflow, SST config, and documented migration goals. |
| Architecture | HIGH | Current SST implementation already mirrors the recommended web/worker/task architecture. |
| Pitfalls | HIGH for repo risks, MEDIUM for live AWS behavior | Risks are visible in local config, but some AWS behavior needs staging validation. |

**Overall confidence:** HIGH for roadmap direction; MEDIUM for final cutover mechanics until staging and data migration rehearsals run.

### Gaps to Address

- **Active Storage task-role credentials:** Verify whether Rails/S3 config works without static AWS keys in ECS; patch config if needed.
- **Action Mailbox Amazon ingress:** Identify and validate the AWS SES receipt/DNS setup, or document it as an out-of-band production dependency.
- **Secret parity:** Compare current Heroku config to SST secrets before any serious staging test.
- **Data migration mechanics:** Choose and rehearse the Heroku-to-RDS migration method before production cutover.
- **Rollback after writes:** Define when rollback is DNS-only versus a data reconciliation decision.
- **Cost reality:** Validate staging removal and production monthly cost after real resources exist.

## Sources

### Primary (HIGH confidence)

- `.planning/PROJECT.md` — project scope, active requirements, constraints, out-of-scope decisions.
- `.planning/codebase/STACK.md` — app runtime, infra runtime, dependency versions, platform requirements.
- `.planning/codebase/ARCHITECTURE.md` — Rails process model, layers, data flow, infra layer.
- `.planning/codebase/INTEGRATIONS.md` — AWS, S3, SES, LTI/OAuth, Mapbox, Sentry, Action Mailbox, deploy flow.
- `.planning/codebase/CONCERNS.md` — risks around Redis TLS, diagnostics, legacy assets, stats/search, fragile areas.
- `docs/aws-sst-migration-plan.md` — target AWS architecture, phase plan, cost model, tradeoffs, required app changes.
- `infra/sst.config.ts` — actual SST implementation and current health/task/secret/IAM design.
- `.github/workflows/deploy.yml` — GitHub OIDC deploy/remove workflow and production removal guard.
- `AGENTS.md` — repo-specific runtime and tooling boundaries.

### Secondary (MEDIUM confidence)

- Local research artifacts in `.planning/research/STACK.md`, `FEATURES.md`, `ARCHITECTURE.md`, and `PITFALLS.md` — synthesized findings from repo evidence.

### Tertiary (LOW confidence)

- None. Network research was not used in this pass.

---
*Research completed: 2026-04-23*
*Ready for roadmap: yes*
