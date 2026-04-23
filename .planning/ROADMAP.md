# Roadmap: Gala SST Infrastructure Migration

## Overview

This roadmap moves Gala from its Heroku-style runtime to AWS/SST by proving the infrastructure in dependency order: safety baseline first, staging runtime parity second, data migration rehearsal third, production cutover fourth, and post-cutover hardening last. The milestone intentionally preserves the current Rails/Puma/Sidekiq/Postgres/Redis/S3/SES behavior and defers app architecture simplification until AWS production behavior and cost are known.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Infra Safety Baseline** - Make AWS deploys, health checks, secrets, app image builds, and storage identity safe enough for staging. (completed 2026-04-23)
- [ ] **Phase 2: Staging Runtime Parity** - Prove the current Gala runtime behavior on AWS staging across web, worker, Redis, uploads, mail, scheduled tasks, and diagnostics.
- [ ] **Phase 3: Data Migration Rehearsal** - Rehearse Heroku Postgres to RDS migration and validate data, schema, search, and rollback assumptions before production pressure.
- [ ] **Phase 4: Production Cutover** - Move production data and traffic to AWS with freeze/drain, DNS/TLS, callback, smoke-test, schedule handoff, and rollback controls.
- [ ] **Phase 5: Post-Cutover Hardening** - Monitor AWS production, verify cost, tune operations, and decide which deferred simplifications are worth planning next.

## Phase Details

### Phase 1: Infra Safety Baseline
**Goal**: Gala has a safe AWS/SST deployment baseline: lightweight health checks, deploy guardrails, secret inventory, isolated tooling, production image validation, and IAM-first S3 design are ready before staging runtime testing.
**Depends on**: Nothing (first phase)
**Requirements**: HLTH-01, HLTH-02, HLTH-03, DPLY-01, DPLY-02, DPLY-03, DPLY-04, SECR-01, SECR-02, SECR-03, SECR-04, STOR-01, STOR-02
**Canonical refs**:
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/research/SUMMARY.md`
- `docs/aws-sst-migration-plan.md`
- `infra/sst.config.ts`
- `.github/workflows/deploy.yml`
- `config/storage.yml`
**Success Criteria** (what must be TRUE):
  1. `GET /up` or equivalent returns a fast 200 without rendering the catalog root.
  2. ALB and ECS health checks in SST point at the dedicated health endpoint.
  3. Required SST stage secrets and runtime env values are documented and injected consistently across web, worker, and tasks.
  4. The infra/tooling boundary is preserved: Node 20/npm in `infra/`, pinned root Ruby/Node/Yarn for the Rails app.
  5. Active Storage's AWS credential path is designed or patched so ECS can use task-role credentials without static AWS runtime keys.
**Plans**: 3 plans

Plans:
- [x] 01-01: Add dedicated health endpoint and wire SST health checks
- [x] 01-02: Inventory secrets, stage environment, and deploy guardrails
- [x] 01-03: Validate image build/tooling boundary and IAM-based S3 credential path

### Phase 2: Staging Runtime Parity
**Goal**: AWS staging proves the existing Gala application behavior across web, worker, Redis/Valkey, uploads, mail, scheduled tasks, Action Cable, logs, and diagnostics.
**Depends on**: Phase 1
**Requirements**: STOR-03, STOR-04, STAG-01, STAG-02, STAG-03, STAG-04, STAG-05, STAG-06, STAG-07, STAG-08, TASK-01, TASK-02, TASK-03, TASK-05
**Canonical refs**:
- `.planning/research/ARCHITECTURE.md`
- `.planning/research/FEATURES.md`
- `.planning/research/PITFALLS.md`
- `infra/sst.config.ts`
- `config/environments/production.rb`
- `config/cable.yml`
- `config/initializers/sidekiq.rb`
- `config/storage.yml`
**Success Criteria** (what must be TRUE):
  1. Staging can be deployed and removed repeatably without touching production removal paths.
  2. The AWS web service serves Rails pages, JSON/CSV endpoints, static assets, direct-upload endpoints, auth callbacks, and `/cable`.
  3. The AWS worker processes representative Sidekiq jobs and Redis-backed features work for jobs, Cable, cache, and Rack::Attack/cache-backed paths.
  4. Upload/read/delete/purge behavior and outbound SES mail are validated in staging with clear stage media/mail boundaries.
  5. Migration, search refresh, and weekly report tasks can be invoked and their logs/results inspected.
**Plans**: 3 plans

Plans:
- [ ] 02-01: Deploy/remove staging and validate web/runtime diagnostics
- [ ] 02-02: Validate worker, Redis/Valkey, Action Cable, and background jobs
- [ ] 02-03: Validate S3 uploads, SES mail, scheduled tasks, and search freshness

### Phase 3: Data Migration Rehearsal
**Goal**: The Heroku Postgres to RDS migration path is rehearsed against staging with data integrity, schema compatibility, search refresh, queue ownership, and rollback assumptions proven before production cutover.
**Depends on**: Phase 2
**Requirements**: DATA-01, DATA-02
**Canonical refs**:
- `.planning/research/SUMMARY.md`
- `.planning/research/PITFALLS.md`
- `docs/aws-sst-migration-plan.md`
- `db/structure.sql`
- `lib/tasks/indices.rake`
- `app/jobs/refresh_indices_job.rb`
**Success Criteria** (what must be TRUE):
  1. A production-like Heroku Postgres dump or representative dataset restores successfully into RDS.
  2. Schema, extensions, selected table counts/checksums, migrations, and materialized search refresh are verified after restore.
  3. Queue ownership, scheduler ownership, and rollback assumptions are documented from the rehearsal.
  4. Known high-risk tables and workflows such as comments, Active Storage blobs, Ahoy events, visits, inbound mail, and search are inspected.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Rehearse Heroku Postgres restore into RDS and verify schema/data
- [ ] 03-02: Validate post-restore migrations, search refresh, queue state, and rollback assumptions

### Phase 4: Production Cutover
**Goal**: Production traffic and data move to AWS with controlled freeze/drain, final migration, DNS/TLS switch, callback checks, smoke tests, scheduler handoff, monitoring, and rollback decision points.
**Depends on**: Phase 3
**Requirements**: TASK-04, DATA-03, DATA-04, DATA-05, PROD-01
**Canonical refs**:
- `.planning/REQUIREMENTS.md`
- `.planning/research/PITFALLS.md`
- `docs/aws-sst-migration-plan.md`
- `.github/workflows/deploy.yml`
- `infra/sst.config.ts`
**Success Criteria** (what must be TRUE):
  1. A cutover runbook freezes/drains Heroku and AWS writers, workers, schedulers, queues, and inbound mail ownership before final data movement.
  2. Final dump/restore, migrations, search refresh, and data checks complete before DNS traffic shifts.
  3. DNS/TLS, `BASE_URL`, OAuth/LTI callbacks, mail links, and Action Cable origin behavior are validated on `www.learngala.com`.
  4. Production smoke checks pass for auth/LTI, catalog/case browsing, uploads, mail, Cable, background jobs, search, and diagnostics.
  5. Rollback rules are explicit about when rollback is DNS-only versus data reconciliation.
**Plans**: 3 plans

Plans:
- [ ] 04-01: Finalize production cutover, freeze/drain, and rollback runbook
- [ ] 04-02: Execute final data migration, tasks, DNS/TLS, and schedule handoff
- [ ] 04-03: Run production smoke checks and rollback decision window

### Phase 5: Post-Cutover Hardening
**Goal**: AWS production is observed long enough to tune operations, check cost, resolve immediate risks, and decide whether deferred simplifications belong in a future milestone.
**Depends on**: Phase 4
**Requirements**: PROD-02, PROD-03, PROD-04
**Canonical refs**:
- `.planning/research/SUMMARY.md`
- `.planning/research/PITFALLS.md`
- `.planning/codebase/CONCERNS.md`
- `infra/sst.config.ts`
**Success Criteria** (what must be TRUE):
  1. CloudWatch, Sentry if configured, Sidekiq, RDS, Valkey, ALB health, and user-facing error indicators are reviewed after cutover.
  2. Staging removal and production resource costs are checked against the migration plan's cost assumptions.
  3. Immediate operational follow-ups are captured without expanding the migration milestone beyond acceptance criteria.
  4. A decision record documents whether Redis removal, Solid Queue, Solid Cable, CloudFront, multi-AZ, or frontend modernization should be planned next.
**Plans**: 2 plans

Plans:
- [ ] 05-01: Monitor production health, logs, queues, database, cache, and user-facing errors
- [ ] 05-02: Review cost and capture post-cutover architecture decisions

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Infra Safety Baseline | 3/3 | Complete    | 2026-04-23 |
| 2. Staging Runtime Parity | 0/3 | Not started | - |
| 3. Data Migration Rehearsal | 0/2 | Not started | - |
| 4. Production Cutover | 0/3 | Not started | - |
| 5. Post-Cutover Hardening | 0/2 | Not started | - |

## Backlog

No backlog items yet.
