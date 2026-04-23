# Requirements: Gala SST Infrastructure Migration

**Defined:** 2026-04-23
**Core Value:** Gala can run on AWS through SST with the same production behavior users rely on today, at lower recurring cost and without adding unnecessary operational complexity.

## v1 Requirements

Requirements for the first AWS/SST migration milestone. Each requirement must be mapped to exactly one roadmap phase.

### Health And Deploy Guardrails

- [x] **HLTH-01**: An unauthenticated lightweight health endpoint returns a fast successful response without depending on the catalog root page or user-facing rendering.
- [x] **HLTH-02**: SST ALB target health checks use the dedicated health endpoint instead of `/`.
- [x] **HLTH-03**: ECS container health checks use the dedicated health endpoint instead of `/`.
- [x] **DPLY-01**: The GitHub Actions AWS deploy workflow keeps `staging` and `production` stage selection explicit.
- [x] **DPLY-02**: Production removal remains blocked in GitHub Actions and retained by SST production removal policy.
- [x] **DPLY-03**: The `infra/` package remains isolated on Node >=20, npm, SST v4, and `package-lock.json`, while the Rails app root remains on its pinned Ruby/Node/Yarn toolchain.
- [x] **DPLY-04**: The production Docker image build path is validated with the existing Rails/Webpacker/Sprockets asset precompile behavior.

### Secrets And Environment

- [x] **SECR-01**: Required Heroku production config vars are inventoried and classified as boot-critical, feature-critical, or optional for SST stages.
- [x] **SECR-02**: SST secrets are declared, set, and injected for Rails keys, LTI, Mapbox, SES SMTP, and any production-used OAuth/Sentry integrations.
- [x] **SECR-03**: Web, worker, migration, search refresh, and weekly report tasks receive the same required runtime environment values unless a difference is explicitly documented.
- [x] **SECR-04**: Stage-specific `BASE_URL`, domains, Rails environment, Redis URL, database URL, S3 bucket, and concurrency values are verified for staging and production.

### Storage And AWS Identity

- [x] **STOR-01**: Active Storage production S3 configuration works in ECS using IAM task-role credentials without requiring static AWS access keys.
- [x] **STOR-02**: ECS web, worker, migration, search refresh, and weekly report task roles have only the S3 bucket permissions they need for `msc-gala`.
- [ ] **STOR-03**: Staging validates Active Storage direct upload, object read, object delete/purge, and background analysis/purge behavior.
- [ ] **STOR-04**: The project documents whether staging writes to `msc-gala`, uses a stage prefix, or uses a separate staging bucket.

### Staging Runtime Parity

- [ ] **STAG-01**: A repeatable staging deploy and removal workflow is documented and validated through GitHub Actions or equivalent SST commands.
- [ ] **STAG-02**: The AWS web service serves Rails HTML, JSON, CSV, static assets, OAuth/LTI callback routes, Active Storage direct-upload endpoints, and Action Cable upgrade traffic.
- [ ] **STAG-03**: The AWS worker service processes Sidekiq queues for representative app jobs, mailers, broadcasts, Active Storage jobs, and reports.
- [ ] **STAG-04**: Redis/Valkey behavior is validated separately for Sidekiq, Action Cable, Rails cache, and Rack::Attack/cache-backed paths.
- [ ] **STAG-05**: Action Cable is validated through an authenticated browser workflow that proves broadcasts reach connected clients through the ALB.
- [ ] **STAG-06**: Outbound email through SES SMTP is validated from the Rails runtime and worker/job paths.
- [ ] **STAG-07**: Action Mailbox Amazon inbound reply assumptions are documented and either validated in staging or explicitly reserved for the production cutover checklist.
- [ ] **STAG-08**: Runtime diagnostics, CloudWatch logs, and deployment outputs are sufficient to debug staging boot, web, worker, task, Redis, database, and mail failures.

### Scheduled Tasks And Search

- [ ] **TASK-01**: The migration task can run `bundle exec rails db:migrate` intentionally against the deployed AWS environment.
- [ ] **TASK-02**: The search refresh task can run `bundle exec rake indices:refresh` and refresh the materialized search index in AWS.
- [ ] **TASK-03**: The weekly report task can run `bundle exec rake emails:send_weekly_report` with safe recipient behavior for staging and production.
- [ ] **TASK-04**: Production EventBridge/SST schedules replace Heroku Scheduler jobs without overlap or duplication.
- [ ] **TASK-05**: Search freshness is validated after a case metadata/content change and a refresh task run.

### Data Migration And Cutover

- [ ] **DATA-01**: A Heroku Postgres to RDS migration rehearsal runs against staging with production-like data or a documented representative dump.
- [ ] **DATA-02**: The rehearsal verifies schema compatibility, extensions, row counts, selected checksums, materialized views, and post-restore migrations.
- [ ] **DATA-03**: A production cutover runbook defines freeze/drain steps for Heroku web, worker, scheduler, Sidekiq queues, inbound mail, AWS workers, and AWS schedules.
- [ ] **DATA-04**: The production cutover runbook defines final dump/restore, migration, search refresh, smoke checks, DNS/TLS switch, callback checks, and rollback decision points.
- [ ] **DATA-05**: Rollback rules distinguish DNS-only rollback from data reconciliation scenarios after AWS accepts writes.

### Production Validation And Post-Cutover

- [ ] **PROD-01**: Production smoke checks cover login/auth, LTI or content-item flows, catalog/case browsing, uploads, outbound mail, inbound mail if applicable, Action Cable, background jobs, search, and runtime diagnostics.
- [ ] **PROD-02**: Post-cutover monitoring checks CloudWatch logs, Sentry if configured, Sidekiq queue health, RDS health, Valkey health, ALB target health, and user-facing error rates.
- [ ] **PROD-03**: AWS cost is checked after staging removal and after production stabilization against the migration plan's cost assumptions.
- [ ] **PROD-04**: A post-cutover decision record captures whether Redis removal, Solid Queue, Solid Cable, CloudFront, multi-AZ, or other architecture changes are worth pursuing later.

## v2 Requirements

Deferred until AWS production is stable and real operational data exists.

### Architecture Simplification

- **ARCH-01**: Evaluate replacing Sidekiq with Solid Queue.
- **ARCH-02**: Evaluate replacing Redis-backed Action Cable with Solid Cable.
- **ARCH-03**: Evaluate removing Redis-backed cache paths or moving low-value cache behavior to PostgreSQL.
- **ARCH-04**: Evaluate CloudFront for static assets and public media.
- **ARCH-05**: Evaluate multi-AZ database/cache topology after production cost and reliability needs are measured.

### Tooling Modernization

- **TOOL-01**: Modernize the root JavaScript toolchain away from Node 12, Yarn 1, Webpacker-era dependencies, and legacy Sass.
- **TOOL-02**: Upgrade frontend dependencies such as React, Flow, Jest, and Webpacker-adjacent packages in dedicated phases.

## Out of Scope

Explicitly excluded from the v1 migration milestone.

| Feature | Reason |
|---------|--------|
| Lambda/serverless Rails hosting | The current app is a long-running Rails monolith with Puma, Sidekiq, WebSockets, assets, and native dependencies. |
| ECS on EC2 | Fargate keeps host management out of scope for the first migration. |
| NAT Gateways by default | The migration's cost model intentionally avoids NAT costs unless a concrete need appears. |
| Redis removal before cutover | Sidekiq, Action Cable, Rails cache, and Rack::Attack depend on Redis-compatible behavior today. |
| Solid Queue or Solid Cable before cutover | Queue/cable replacement changes app behavior and should not be coupled to hosting migration. |
| CloudFront as a launch blocker | Core Rails hosting parity should be proven before CDN optimization. |
| Multi-AZ as a launch blocker | Phase 1 intentionally accepts single-AZ for cost and simplicity. |
| Root Node/Webpacker/frontend modernization | Tooling upgrades risk breaking asset builds independently of the infrastructure migration. |
| Static AWS runtime keys in ECS | ECS task roles should provide scoped AWS identity for app runtime access. |
| Custom Postfix/mail container | SES SMTP is already the simpler managed outbound mail path. |

## Traceability

Roadmap creation maps every v1 requirement to exactly one phase.

| Requirement | Phase | Status |
|-------------|-------|--------|
| HLTH-01 | Phase 1 | Complete |
| HLTH-02 | Phase 1 | Complete |
| HLTH-03 | Phase 1 | Complete |
| DPLY-01 | Phase 1 | Complete |
| DPLY-02 | Phase 1 | Complete |
| DPLY-03 | Phase 1 | Complete |
| DPLY-04 | Phase 1 | Complete |
| SECR-01 | Phase 1 | Complete |
| SECR-02 | Phase 1 | Complete |
| SECR-03 | Phase 1 | Complete |
| SECR-04 | Phase 1 | Complete |
| STOR-01 | Phase 1 | Complete |
| STOR-02 | Phase 1 | Complete |
| STOR-03 | Phase 2 | Pending |
| STOR-04 | Phase 2 | Pending |
| STAG-01 | Phase 2 | Pending |
| STAG-02 | Phase 2 | Pending |
| STAG-03 | Phase 2 | Pending |
| STAG-04 | Phase 2 | Pending |
| STAG-05 | Phase 2 | Pending |
| STAG-06 | Phase 2 | Pending |
| STAG-07 | Phase 2 | Pending |
| STAG-08 | Phase 2 | Pending |
| TASK-01 | Phase 2 | Pending |
| TASK-02 | Phase 2 | Pending |
| TASK-03 | Phase 2 | Pending |
| TASK-04 | Phase 4 | Pending |
| TASK-05 | Phase 2 | Pending |
| DATA-01 | Phase 3 | Pending |
| DATA-02 | Phase 3 | Pending |
| DATA-03 | Phase 4 | Pending |
| DATA-04 | Phase 4 | Pending |
| DATA-05 | Phase 4 | Pending |
| PROD-01 | Phase 4 | Pending |
| PROD-02 | Phase 5 | Pending |
| PROD-03 | Phase 5 | Pending |
| PROD-04 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 37 total
- Mapped to phases: 37
- Unmapped: 0

---
*Requirements defined: 2026-04-23*
*Last updated: 2026-04-23 after roadmap creation*
