# Feature Landscape

**Project:** Gala SST Infrastructure Migration
**Domain:** Brownfield Rails-to-AWS/SST infrastructure migration
**Researched:** 2026-04-23
**Research mode:** Features dimension
**Overall confidence:** HIGH for repo-derived requirements; MEDIUM for broader ecosystem norms because network search was not used.

## Research Basis

This research uses the local project plan, codebase maps, SST config, deploy workflow, and repo guidance as primary evidence. Network search was not used per constraints. Findings should be treated as migration requirements, not product feature recommendations.

Key local evidence:

- `.planning/PROJECT.md` defines the active migration requirements and out-of-scope boundaries.
- `docs/aws-sst-migration-plan.md` defines the target AWS/SST shape, phase plan, cost goals, and required application changes.
- `infra/sst.config.ts` shows the current SST implementation for ECS Fargate, RDS Postgres, Valkey, ALB, tasks, schedules, secrets, and media IAM policies.
- `.github/workflows/deploy.yml` shows the manual GitHub Actions deployment path with OIDC and production removal guard.
- `.planning/codebase/*.md` identifies migration-sensitive app behaviors: Active Storage, Action Cable, Sidekiq, Redis cache, Action Mailer/Mailbox, materialized search, runtime diagnostics, and legacy asset build constraints.

## Table Stakes

Features users and operators should expect before a safe staging validation or production cutover. Missing table stakes mean the AWS migration is incomplete or unsafe.

| Feature / Capability | Why Expected | Complexity | Dependencies | Notes |
|----------------------|--------------|------------|--------------|-------|
| Dedicated lightweight health endpoint | ECS container health checks and ALB target checks should not depend on the catalog root page, database-heavy app behavior, redirects, or user-facing rendering. | Low | Rails route/controller, SST ALB health config, ECS container health command | `infra/sst.config.ts` currently checks `/` and has comments to switch to `/up`. This should become a release gate. |
| ALB and ECS health checks wired to the dedicated endpoint | A health endpoint only reduces risk if both load balancer and container checks use it. | Low | Dedicated endpoint, SST service config | Use the same path for ALB target health and container self-check unless there is a reason to separate shallow and deeper checks. |
| IAM task-role access for Active Storage S3 | Production ECS tasks should access the `msc-gala` media bucket without static AWS access keys. | Medium | Rails Active Storage S3 config, ECS task roles, SST IAM media policy, `S3_BUCKET` | SST already grants task-role S3 permissions to web, worker, migration, index, and report tasks. Rails config must actually work without `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in ECS. |
| Stage-scoped secrets inventory and setup procedure | SST deploys depend on per-stage secrets for Rails, LTI, Mapbox, SES, and optional integrations. | Medium | SST secrets, GitHub Actions deploy, Rails production env | Required secrets are declared in local plans. Roadmap should include a validation step that proves missing secrets fail early and do not produce half-working deployments. |
| GitHub OIDC deployment with scoped AWS role | Deploys should not depend on long-lived AWS keys in CI. | Medium | GitHub Actions workflow, AWS IAM role trust policy, `infra/` npm package | Workflow already uses OIDC and `us-west-2`; requirements should verify the role is scoped to expected account, repo, stages, and region. |
| Manual staging deploy and removal workflow | Staging is intended to be on-demand to reduce cost, not always-on. | Low | `.github/workflows/deploy.yml`, SST stage removal behavior, staging DNS | Workflow already supports `staging` deploy/remove. Requirements should include a human-readable staging lifecycle checklist. |
| Production removal guard | Accidental production teardown must be blocked both in CI and by SST removal policy. | Low | GitHub workflow guard, SST `removal: retain` for production | Already present in both workflow and SST config. Keep as non-negotiable. |
| Rails production image build compatibility | AWS services run the existing Dockerfile, so the legacy Rails/Webpacker build must compile reliably in production mode. | Medium | Ruby 3.2.9, Bundler 2.4.19, Node 12.5, Yarn 1, Webpacker/Sprockets, Dockerfile | This is a migration requirement because Fargate deploys build from repo root. Do not mix root Node 12/Yarn with infra Node 20/npm. |
| ECS web service parity with Heroku web dyno | Users need the same Puma-backed Rails behavior after cutover. | Medium | Docker image, Puma config, ECS service env, ALB, `BASE_URL`, static asset serving | Web service should serve HTML, JSON, CSV, static assets, Action Cable upgrade traffic, and Rails error pages. |
| ECS worker service parity with Heroku worker dyno | Background jobs are core app behavior, including broadcasts, clone jobs, mailers, reports, and index work. | Medium | Sidekiq, Redis/Valkey, RDS, ECS service env, shared image | Worker health currently checks for a Ruby process. Staging validation should prove real Sidekiq queue processing, not just process liveness. |
| Redis/Valkey preservation for phase 1 | Sidekiq, Action Cable, Rails cache, Rack::Attack, and stats caching depend on Redis-compatible behavior today. | Medium | SST Valkey, `REDIS_URL`, TLS handling, Sidekiq, Action Cable | Keeping Redis is table stakes for migration safety. Removing it is explicitly phase 2+ exploration. |
| RDS Postgres parity and migration procedure | Production data must move from Heroku Postgres to RDS with verified schema, extensions, materialized views, and app compatibility. | High | Heroku Postgres export, RDS Postgres 16.4, Rails DB config, SSL mode, migration task, rollback plan | SST provisions Postgres, but data migration and cutover steps remain a major requirements area. |
| Explicit database migration task | Heroku postdeploy behavior must become an explicit ECS/SST task. | Medium | `GalaMigrate` task, deploy runbook, Rails `db:migrate`, image/env parity | SST defines `GalaMigrate`. Requirements should specify when it runs and how operators verify success before traffic shift. |
| Scheduled search index refresh | Heroku Scheduler ran `bundle exec rake indices:refresh`; AWS must preserve this materialized-view refresh behavior. | Medium | EventBridge/SST Cron, `GalaRefreshIndices`, Postgres, Sidekiq/search code | Current SST schedules this every 15 minutes only in production. Staging may need manual task execution for validation. |
| Scheduled weekly report email | Heroku Scheduler ran `bundle exec rake emails:send_weekly_report`; AWS must preserve the report job. | Medium | EventBridge/SST Cron, `GalaWeeklyReport`, SES SMTP secrets, mailer config | Current SST schedules weekly production report. Staging validation should avoid sending real user mail unless intentionally scoped. |
| Active Storage direct-upload validation | Uploads are a core app behavior and depend on browser-to-S3 direct upload plus Rails blob records. | Medium | S3 bucket, IAM auth, Active Storage config, ALB, CORS if applicable, Rails routes | Validate create, read, variant/preview behavior, delete/purge paths, and comment/case/media upload paths separately. |
| Outbound email via SES SMTP | Account, report, reply notification, library request, and other mailers must continue after cutover. | Medium | SES SMTP credentials, Rails production mail config, domain verification, `BASE_URL` | SES is retained by plan. Validate both background-job mail and synchronous mail paths if any exist. |
| Inbound Action Mailbox assumptions documented and tested | Production config uses Amazon ingress and reply processing matters for comment/reply workflows. | High | Amazon inbound mail setup outside app code, DNS/MX/routing, Rails Action Mailbox, `reply+...` addresses | Local code shows the Rails side, but AWS-side ingress setup is not fully represented in SST. This needs explicit requirements or a documented out-of-band setup. |
| Action Cable over ALB on `/cable` | Real-time editing, forums, notifications, and stats updates depend on WebSockets. | Medium | ALB listener/target behavior, Rails Action Cable, Redis/Valkey, session cookies, SSL, `BASE_URL` | Staging checklist should include authenticated WebSocket subscription and broadcast verification. |
| Runtime diagnostics access after deploy | Operators need to inspect app, Redis, Postgres, Sidekiq, cache, and Action Cable from AWS without leaking secrets. | Medium | `/runtime/stats`, editor authorization, ECS logs, CloudWatch, Redis/Postgres connectivity | Existing endpoint is editor-only but has test gaps. Use it as a validation aid, not a public health check. |
| CloudWatch logs for web, worker, and tasks | Migration requires a basic operational feedback loop for deploy validation and post-cutover support. | Low | SST/ECS service logs, task logs, GitHub deploy output | Logs are implied by ECS/SST/CloudWatch. Requirements should specify where to look and what successful boot/job logs look like. |
| Stage-specific `BASE_URL` and domain correctness | Rails mailers, OAuth/LTI flows, redirects, and asset URLs depend on correct host configuration. | Medium | SST domain selection, `BASE_URL`, Route 53, ACM, OAuth/LTI allowed URLs | `infra/sst.config.ts` sets production and staging domains. Validate all externally visible callbacks and generated URLs. |
| DNS and TLS cutover procedure | Production users should reach `www.learngala.com` with valid TLS and a rollback option. | High | Route 53, ACM, ALB, DNS TTL plan, Heroku fallback, smoke tests | The plan identifies DNS cutover but not the full procedure. This is a core migration capability. |
| Production rollback plan | A failed AWS cutover must have a fast, rehearsed path back to Heroku or prior known-good state. | High | DNS TTL, Heroku app/database state, RDS snapshot/export timing, deploy version tracking | Rollback gets harder after writes begin on RDS. Roadmap needs explicit decision points for read-only window or final sync strategy. |
| Post-cutover smoke and validation checklist | Migration is successful only if real app behaviors work, not merely if infrastructure deploys. | Medium | Staging checklist, production smoke tests, editor/test accounts, upload/email/LTI fixtures | Checklist should cover uploads, mail, inbound mail, Action Cable, background jobs, scheduled tasks, assets, OAuth/LTI, search, and diagnostics. |
| Cost checks before and after staging/production | Cost reduction is a core value and staging is intended to be removable. | Medium | AWS billing/cost explorer, SST stage removal, resource inventory, ECR/log retention awareness | Validate that staging removal actually removes high-cost resources and production matches the expected cost envelope. |

## Differentiators

Capabilities that are not required for a basic lift-and-shift, but materially improve safety, operator confidence, or cost control for this specific migration.

| Feature / Capability | Value Proposition | Complexity | Dependencies | Notes |
|----------------------|-------------------|------------|--------------|-------|
| One-command or documented task-run procedure for migrations and rake tasks | Reduces operator error during staging validation, production migration, and emergency maintenance. | Medium | SST task outputs, AWS ECS run-task syntax, GitHub workflow or runbook | SST returns migration task ARNs/subnets/security groups. Turn those into a tested runbook or workflow step. |
| Automated staging validation script/checklist | Makes repeated staging deploys comparable and catches regressions before production. | Medium | Test accounts, curl/browser checks, Rails runner or rake probes, CloudWatch logs | Should include HTTP, WebSocket, Redis, DB, Sidekiq, upload, email, and search checks. |
| Deployment outputs captured as an artifact | Gives operators a stable record of ALB URL, task ARNs, cluster info, and stage metadata for validation and rollback. | Low | GitHub Actions artifact upload, SST outputs | Useful because the workflow is manual and the project has discrete staging/production stages. |
| Guardrail for missing SST secrets before deploy | Fails deployment earlier with a clear operator error instead of booting broken ECS tasks. | Medium | SST secret declarations, deploy workflow validation, documented secret list | Especially valuable for optional-but-production-used integrations such as Google OAuth, Facebook OAuth, and Sentry. |
| Release identity propagation | Ties Sentry, logs, and runtime diagnostics to the Git SHA deployed by GitHub Actions. | Low | `COMMIT_SHA`, `RELEASE`, Sentry config, GitHub SHA | SST already injects `COMMIT_SHA`; adding/validating release identity improves post-cutover debugging. |
| Post-deploy canary/smoke step in GitHub Actions | Gives immediate feedback that the deployed stage is responding and configured. | Medium | Public stage URL, health endpoint, auth-free smoke endpoints, deploy workflow | Keep it shallow in CI; deeper validation can remain manual to avoid secret/test-account complexity. |
| Staging mail safety controls | Prevents accidental real-user weekly reports or notifications during staging validation. | Medium | Rails mail config, SES sandbox/verified identities, stage env flags, test recipient policy | Existing SST schedules weekly reports only in production, but manual task validation still needs guardrails. |
| Runtime diagnostics hardening | Makes `/runtime/stats` safer as a migration support tool under partial outages. | Medium | Authorization tests, serializer failure shaping, secret filtering | Codebase concerns flag missing tests for diagnostics authorization and failure shaping. |
| Cost inventory after `sst remove --stage staging` | Confirms on-demand staging does not leave high-cost resources behind. | Low | AWS resource listing, SST state, CloudWatch/ECR/log retention knowledge | Differentiates this migration from a naive always-on staging clone. |
| Data migration rehearsal on staging | Finds dump/restore, extension, collation, sequence, materialized view, and SSL issues before production. | High | Sanitized or production-like dump, RDS staging, Rails smoke tests, rollback rehearsal | This should be a phase gate before production DNS cutover. |
| Search freshness verification | Proves materialized index refresh behavior after AWS migration and avoids catalog/search confusion. | Low | `indices:refresh`, known searchable case fixture, DB materialized view | Search indexing is explicitly not immediate, so requirements should set expected freshness windows. |
| WebSocket broadcast validation harness | Proves Action Cable, Redis pub/sub, ALB, cookies, and frontend subscription behavior together. | Medium | Test editor account, browser or Rails console stimulus, Action Cable channels | More valuable than checking only that `/cable` accepts a socket. |
| Runbook for operational incidents during cutover | Reduces decision latency when upload, mail, DB, worker, or WebSocket failures appear. | Medium | CloudWatch, Sentry, runtime diagnostics, AWS console links, rollback plan | Can be lightweight but should map symptom to first checks. |

## Anti-Features

Features to explicitly avoid during this milestone because they increase migration risk, obscure infrastructure validation, or conflict with documented project boundaries.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Rewrite the Rails app for Lambda/serverless request handling | The monolith depends on Puma, Sidekiq, WebSockets, legacy assets, and process-compatible runtime behavior. Rewriting request handling couples architecture risk to hosting migration. | Use ECS Fargate for web and worker services. Revisit serverless only as a separate future architecture decision if there is a clear product reason. |
| Replace Sidekiq during phase 1 | Background jobs are core migration behavior. Queue replacement would change failure modes, retries, scheduling, and operational semantics. | Keep Sidekiq on Valkey/Redis for phase 1. Evaluate Solid Queue only after AWS production is stable. |
| Replace Redis-backed Action Cable during phase 1 | WebSocket behavior is already migration-sensitive through ALB, cookies, Redis pub/sub, and frontend subscriptions. | Keep Redis-backed Action Cable. Evaluate Solid Cable later with dedicated tests. |
| Remove Redis/cache dependency before cutover | Redis also backs cache, Rack::Attack, Sidekiq, and Action Cable. Removing it to save a small monthly amount risks broad behavior changes. | Preserve Valkey in phase 1 and measure real AWS cost before deciding whether simplification is worth it. |
| Introduce NAT Gateways as a default requirement | The migration's cost model intentionally keeps ECS tasks in public subnets and stateful services private to avoid NAT costs. | Keep the current no-NAT design unless a concrete outbound networking requirement cannot be met safely. |
| Move AWS region away from `us-west-2` in phase 1 | S3 media and SES assumptions already align with `us-west-2`; changing region adds cross-region latency/cost and operational complexity. | Keep compute, data, storage, and mail in `us-west-2` for phase 1. |
| Make multi-AZ RDS/Valkey a phase 1 blocker | The plan intentionally accepts single-AZ for cost and simplicity, comparable to a small Heroku setup rather than an enterprise HA design. | Use single-AZ initially. Document RPO/RTO tradeoffs and revisit HA after cost and production load are measured. |
| Add CloudFront as a launch blocker | CDN support can improve assets/media later but is not required to prove core Rails hosting parity. | Serve through ALB/S3 initially. Add CloudFront after production behavior and cache headers are understood. |
| Modernize Webpacker, Node, React, or Flow inside the migration | The root app is pinned to Node 12/Yarn 1 and has fragile legacy frontend dependencies. Tooling upgrades can break asset builds independently of AWS. | Keep app toolchain unchanged. Use Docker/asset precompile validation to prove the existing build works in AWS image builds. |
| Collapse `infra/` tooling into root app tooling | `infra/` uses Node >=20/npm while the root app uses Node 12/Yarn 1. Mixing them risks breaking either deploy or asset build workflows. | Keep `infra/` as a separate npm project and root app as the legacy Rails/Yarn project. |
| Use static AWS keys for ECS runtime S3 access | Long-lived credentials in app runtime are less secure and unnecessary when ECS task roles can provide scoped identity. | Use IAM task roles and bucket-scoped policies for ECS services and tasks. |
| Build a custom Postfix/mail container | SES already handles outbound mail cheaply and reliably. A mail container adds patching, deliverability, queueing, and reputation burden. | Keep SES SMTP for outbound mail and document Amazon Action Mailbox ingress separately. |
| Make staging always-on by default | Always-on staging erodes the cost reduction goal. | Keep staging on-demand with manual deploy/remove and cost verification after removal. |
| Treat infrastructure deploy success as migration success | SST can deploy resources while uploads, mail, LTI callbacks, WebSockets, jobs, or search are broken. | Require behavior-based validation gates for staging and production. |
| Expose runtime diagnostics as public health | Diagnostics can be expensive, partial-failure-prone, and secret-adjacent. | Keep diagnostics editor-only. Use a shallow dedicated health endpoint for infrastructure liveness. |

## Feature Dependencies

```text
Dedicated health endpoint
  -> ALB health check switch
  -> ECS container health check switch
  -> Post-deploy smoke check

SST secrets inventory
  -> Stage deploy readiness
  -> Rails boot success
  -> LTI/OAuth/Mapbox/SES validation

IAM task-role S3 access
  -> Active Storage production config update
  -> Upload/read/delete validation
  -> Production cutover readiness

RDS staging deploy
  -> Data migration rehearsal
  -> Search index refresh validation
  -> Production data migration runbook

Valkey/Redis deploy
  -> Sidekiq validation
  -> Action Cable validation
  -> Rails cache/Rack::Attack validation

Migration task runbook
  -> Staging schema setup
  -> Production deploy sequence
  -> Rollback decision points

Scheduled task parity
  -> Search freshness verification
  -> Weekly report mail safety checks
  -> Post-cutover operational validation

Stage domain and BASE_URL correctness
  -> OAuth/LTI callback validation
  -> Mail link validation
  -> TLS/DNS cutover

Data migration rehearsal
  -> Production data migration
  -> DNS cutover
  -> Rollback plan finalization

Post-cutover smoke checklist
  -> Production monitoring
  -> Cost checks
  -> Later Redis simplification decision
```

## MVP Recommendation

Prioritize these capabilities for the first migration-ready milestone:

1. Dedicated `/up`-style health endpoint and SST health-check wiring.
2. IAM-based Active Storage S3 access in ECS with upload/read/delete validation.
3. Stage secrets inventory and deploy readiness checks for required Rails/SST secrets.
4. Repeatable staging deploy/remove workflow with validation checklist.
5. ECS web and worker parity validation: Puma, Sidekiq, assets, logs, Redis, and `BASE_URL`.
6. Scheduled task parity for `indices:refresh` and `emails:send_weekly_report`.
7. Heroku Postgres to RDS migration rehearsal and production cutover/rollback runbook.
8. DNS/TLS cutover procedure for `www.learngala.com`.
9. Post-cutover monitoring and cost verification.

Defer these until after AWS production is stable:

- Solid Queue, Solid Cable, or Redis removal.
- CloudFront/CDN optimization.
- Multi-AZ RDS/Valkey.
- Webpacker, Node, React, Flow, or frontend asset modernization.
- Lambda/serverless request handling.
- Major security hardening unrelated to migration acceptance unless it blocks safe deploy validation.

## Roadmap Implications

Suggested feature grouping for requirements definition:

| Phase Theme | Capabilities Included | Why This Order |
|-------------|-----------------------|----------------|
| Health, secrets, and deploy guardrails | Health endpoint, SST health wiring, secrets inventory, OIDC scope verification, production removal guard confirmation | Establishes whether AWS services can deploy, boot, and fail clearly. |
| Runtime parity on staging | Web service, worker service, assets, Redis/Valkey, Sidekiq, Action Cable, uploads, outbound mail, diagnostics | Proves the existing app behavior survives the infrastructure move before touching production data. |
| Scheduled tasks and operational runbooks | Migration task usage, search refresh, weekly reports, task execution procedure, CloudWatch/Sentry/log validation | Replaces Heroku Scheduler/postdeploy behavior with AWS-native operations. |
| Data migration and cutover rehearsal | Heroku-to-RDS rehearsal, schema/materialized view verification, DNS/TLS staging checks, rollback plan | Data movement and DNS shift carry the highest production risk and should follow runtime parity. |
| Production cutover and stabilization | Final data migration, DNS cutover, production smoke tests, monitoring, cost review | Confirms users are served from AWS and captures real operational/cost evidence. |
| Post-stability simplification | Redis removal analysis, CloudFront, multi-AZ, app/runtime modernization | These are optimization decisions, not blockers for migration safety. |

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Table stakes | HIGH | Directly supported by project requirements, migration plan, SST config, deploy workflow, and codebase maps. |
| Differentiators | MEDIUM | Mostly inferred from current deploy shape and migration risk, with strong local evidence but no external ecosystem search. |
| Anti-features | HIGH | Explicitly supported by project out-of-scope items and migration plan avoid-list. |
| Dependencies | HIGH | Derived from concrete app integrations and SST resource relationships in local files. |

## Sources

- `.planning/PROJECT.md` - project scope, active requirements, out-of-scope decisions, and constraints.
- `.planning/codebase/STACK.md` - runtime/tooling boundaries and production platform dependencies.
- `.planning/codebase/ARCHITECTURE.md` - process model, layers, diagnostics, background work, search, and infrastructure entry points.
- `.planning/codebase/INTEGRATIONS.md` - AWS, S3, SES, Action Mailbox, OAuth/LTI, Action Cable, Sentry, and CI/CD integrations.
- `.planning/codebase/CONCERNS.md` - fragile areas, diagnostics test gaps, runtime risks, scaling concerns, and migration-relevant gotchas.
- `docs/aws-sst-migration-plan.md` - AWS target architecture, phase plan, required app changes, cost goals, and anti-features.
- `infra/sst.config.ts` - current SST implementation for services, tasks, secrets, schedules, IAM, domains, and removal behavior.
- `.github/workflows/deploy.yml` - manual deploy/remove workflow, OIDC, stage inputs, and production removal guard.
- `AGENTS.md` - repo-specific stack boundaries, tool versions, verification guidance, and infra deploy commands.
