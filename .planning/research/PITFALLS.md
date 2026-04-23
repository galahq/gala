# Domain Pitfalls: Gala SST Infrastructure Migration

**Domain:** Brownfield Rails 7 migration from Heroku-style runtime to AWS/SST v4
**Researched:** 2026-04-23
**Overall confidence:** HIGH for repo-derived risks, MEDIUM for AWS/SST behavior not validated live

## Scope

This document focuses on mistakes that could break the migration, make staging validation misleading, or make production cutover unsafe. The local repo and migration plan are the primary evidence sources. Network research was not used.

Suggested roadmap phases referenced below:

| Phase | Purpose |
|-------|---------|
| Phase 1: Infra safety baseline | Health endpoint, deploy workflow guardrails, secret inventory, stage isolation, IAM/storage wiring |
| Phase 2: Staging runtime validation | Deploy staging and validate web, worker, assets, Redis, Action Cable, uploads, mail, logs, and diagnostics |
| Phase 3: Data migration rehearsal | Restore Heroku data into RDS, run migrations/tasks, compare data, refresh search, rehearse rollback |
| Phase 4: Production cutover | Freeze/drain old runtime, migrate final data, switch DNS/callbacks, monitor, execute rollback if needed |
| Phase 5: Post-cutover hardening | Cost review, observability tuning, Redis/TLS hardening, optional architecture simplification research |

## Critical Pitfalls

### Pitfall 1: Treating `/` as a Safe ECS/ALB Health Check

**What goes wrong:** ECS and ALB health checks currently hit `/`, and the container health check runs `curl -f http://localhost:3000/`. The home page is not a dedicated liveness endpoint. It can depend on routing, redirects, cookies, assets, database/cache behavior, or future application changes. This creates two failure modes: healthy tasks are killed during deploys, or unhealthy tasks remain in service because the root path is not testing the right dependency.

**Why it happens:** `infra/sst.config.ts` includes comments saying to switch health checks to `/up` once the app exposes one. `config/routes.rb` has `/runtime/stats` but no lightweight health endpoint.

**Consequences:** Rolling deploys can flap, ECS can restart good containers, ALB can send user traffic to partially booted containers, and staging can look unstable for the wrong reason.

**Warning signs:**
- ECS service events show repeated health-check failures while manual page loads sometimes work.
- ALB target health alternates between healthy and unhealthy during deploys.
- Health-check responses include redirects, full HTML, slow database work, or application errors unrelated to process liveness.

**Prevention strategy:**
- Add a dedicated unauthenticated endpoint such as `/up` before relying on ECS/ALB health.
- Keep the ALB liveness check lightweight and deterministic. Use a separate readiness or diagnostics endpoint for deeper database/Redis checks if needed.
- Update both `loadBalancer.health` and container `health.command` in `infra/sst.config.ts` in the same phase.
- Verify health behavior in a production-built image, not only in local Rails dev mode.

**Detection:**
- `curl -i https://staging.learngala.com/up` returns a fast 200 without redirects.
- ECS target health remains stable during a staging deploy.
- A deliberately broken database connection does not masquerade as a healthy fully ready app unless readiness explicitly includes DB.

**Phase mapping:** Phase 1 blocker. Do not promote staging validation or cutover planning until health checks are dedicated and exercised.

### Pitfall 2: Active Storage Fails Because S3 Auth Still Assumes Static Keys

**What goes wrong:** Production Active Storage uses the `amazon` service, but `config/storage.yml` still declares `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`. The SST config grants S3 permissions to ECS task roles, yet the Rails config may still be depending on static credential environment variables or may pass blank credentials instead of using the AWS SDK provider chain. Direct uploads, blob reads, purge jobs, and Active Storage analysis can fail with 403s.

**Why it happens:** The migration plan says to rely on IAM task roles, while the app config still reflects an older static-key setup. The infra policy grants object access to the shared `msc-gala` bucket, but the Rails storage config has not been proven against role-based credentials in ECS.

**Consequences:** Users cannot upload media, existing media can fail to render, comment attachments can fail, purge jobs can error, and staging may accidentally test against the production media bucket without clear isolation.

**Warning signs:**
- Browser direct-upload requests fail during presign or PUT with `AccessDenied`, signature, or CORS errors.
- Rails logs show missing AWS credentials despite ECS task role policies existing.
- Active Storage purge/analyze queues back up in Sidekiq.
- Staging uploads appear in the production `msc-gala` bucket without a stage prefix or policy.

**Prevention strategy:**
- Change the storage configuration so ECS uses IAM task-role credentials intentionally, then test it in ECS.
- Confirm the task role covers every Active Storage path used by Gala: read, write, delete, and any direct-upload requirements.
- Validate bucket CORS for browser direct uploads from `staging.learngala.com` and `www.learngala.com`.
- Decide whether staging may write to `msc-gala`; if it may, use a stage prefix and cleanup policy. If not, provision a separate staging bucket.

**Detection:**
- In staging, upload an edgenote attachment, direct-upload a file, render it, delete it, and confirm the backing object lifecycle.
- Trigger Active Storage analysis/purge jobs and confirm Sidekiq succeeds.
- Check CloudTrail/S3 access logs or Rails logs to confirm access uses the ECS task role, not long-lived access keys.

**Phase mapping:** Phase 1 for config/IAM, Phase 2 for staging upload/read/delete validation, Phase 4 for production media cutover acceptance.

### Pitfall 3: Secret Parity Gaps Break Auth, Mail, Maps, or Observability

**What goes wrong:** The SST config declares and injects `RAILS_MASTER_KEY`, `SECRET_KEY_BASE`, `LTI_KEY`, `LTI_SECRET`, `MAPBOX_ACCESS_TOKEN`, `SES_SMTP_USERNAME`, and `SES_SMTP_PASSWORD`. The app also references Google OAuth, Facebook OAuth, Sentry, Mapbox style/data options, and other runtime env values. Missing secrets can produce hard boot failures, silent feature degradation, or auth callbacks that fail only after cutover.

**Why it happens:** Heroku config vars are often treated as runtime ambient state. SST secrets must be explicitly declared, set per stage, and injected into each service/task.

**Consequences:** Google sign-in can fail, LTI launches can fail, Sentry can go dark, outbound mail can silently stop raising delivery errors when SES credentials are missing, Mapbox can use fallback tokens/styles, and staging can pass because only one auth path was tested.

**Warning signs:**
- `omniauth` callbacks fail for Google or LTI in staging.
- Sentry receives no server or browser events from AWS.
- Mailer logs show delivery skipped or `raise_delivery_errors = false` paths.
- Browser console shows `MAPBOX_TOKEN_REMOVED`, missing map style, or failed Mapbox requests.

**Prevention strategy:**
- Build a Heroku-to-SST secret parity checklist before the first serious staging deploy.
- Classify secrets as boot-critical, feature-critical, or optional diagnostics.
- Declare and inject all feature-critical secrets in SST, not only the currently listed platform secrets.
- Add a production-mode boot check or release checklist that fails loudly for missing LTI, OAuth, S3, SES, and Sentry config where the feature is expected.

**Detection:**
- Run staged smoke tests for LTI callback, Google OAuth, outbound mail, Mapbox pages, and Sentry test event.
- Compare Heroku config var names to SST secret/env names one by one.
- Confirm every scheduled task receives the same required env as web and worker.

**Phase mapping:** Phase 1 blocker for secret inventory and injection; Phase 2 validates staging behavior; Phase 4 rechecks production values before DNS.

### Pitfall 4: Data Migration and Cutover Lose Writes or Leave Jobs Behind

**What goes wrong:** A Heroku-to-RDS cutover can lose writes if users, Sidekiq, scheduled jobs, or Action Mailbox continue writing to the old Heroku database/Redis while the final dump is taken. Jobs can also be stranded in the old Redis, duplicated in the new Redis, or executed against the wrong database after DNS changes.

**Why it happens:** Gala has a web service, worker service, Redis-backed Sidekiq, scheduled search refreshes, scheduled weekly mail, inbound mail, Active Storage, Ahoy events, and materialized search indexes. Heroku `postdeploy`/Scheduler behavior is being replaced by explicit SST tasks and EventBridge schedules.

**Consequences:** Recent comments, LTI launches, analytics events, uploads metadata, mailbox replies, or queued mail can disappear. Search can be stale. Weekly reports can send twice or not at all. Rollback becomes unsafe if old and new systems both accepted writes.

**Warning signs:**
- Heroku workers or schedulers still running during final dump.
- Sidekiq queues non-empty on Heroku Redis at cutover time.
- RDS row counts differ from Heroku after restore, especially for comments, blobs, Ahoy events, visits, and inbound emails.
- New AWS app writes to RDS before final migration is declared complete.

**Prevention strategy:**
- Write a cutover runbook with freeze/drain steps, final backup, restore, migration, search refresh, DNS, validation, and rollback decision points.
- Rehearse the full restore into staging using production-like data before production cutover.
- Explicitly pause Heroku Scheduler, Heroku worker dynos, AWS EventBridge schedules, and AWS workers during the final data move until ownership is clear.
- Capture queue depth and failed-job state on both Redis instances before and after cutover.
- Define rollback rules that account for write divergence. If AWS has accepted writes, rollback requires a data decision, not just DNS.

**Detection:**
- Compare table counts and selected checksums between source and target.
- Run `db:migrate`, `indices:refresh`, and representative app smoke tests against RDS.
- Verify Sidekiq queue depth, scheduled/retry/dead sets, and recent job execution logs.

**Phase mapping:** Phase 3 is dedicated to rehearsal; Phase 4 must follow the runbook exactly.

### Pitfall 5: Redis/Valkey Differences Break Sidekiq, Cable, or Cache

**What goes wrong:** AWS Valkey is the single Redis-compatible backend for Sidekiq, Rails cache, Rack::Attack throttling, and Action Cable. If `REDIS_URL`, TLS, credentials, network access, or connection limits behave differently from Heroku Redis, multiple user-facing systems fail at once.

**Why it happens:** The app centralizes Redis through `REDIS_URL`, and SST builds a `rediss://` URL for Valkey. `config/initializers/sidekiq.rb`, `config/cable.yml`, and production cache config all disable TLS certificate verification for `rediss://` connections. Valkey is configured as a single node for phase 1.

**Consequences:** Jobs stop processing, WebSockets stop broadcasting, cache/rate-limit behavior changes, collaborative editing/statistics updates become unreliable, and a Redis outage can degrade several app paths at once.

**Warning signs:**
- Sidekiq logs show reconnects, network timeouts, authentication errors, or queue latency.
- WebSocket connects to `/cable` but subscriptions do not receive broadcasts.
- Rails cache errors appear on normal requests.
- Redis connection count or memory climbs after autoscaling web/worker tasks.

**Prevention strategy:**
- In staging, test all Redis roles separately: enqueue/process jobs, Action Cable subscriptions, cache read/write, and Rack::Attack behavior.
- Set explicit expectations for single-node Redis availability in phase 1; do not imply multi-AZ reliability.
- Review TLS verification after basic cutover stability. Removing `VERIFY_NONE` is security hardening, but changing it during cutover can create avoidable connection surprises unless validated.
- Tune Sidekiq concurrency and web worker/thread counts against Valkey connection limits.

**Detection:**
- Sidekiq Web/CloudWatch shows stable processed jobs and low queue latency.
- A live Cable-driven feature updates across two browser sessions behind the ALB.
- Cache read/write and Redis INFO checks pass from the runtime diagnostics endpoint or a one-off ECS task.

**Phase mapping:** Phase 2 validation blocker; Phase 5 hardening for TLS verification and possible Redis simplification research.

### Pitfall 6: Scheduled Tasks Are Not Equivalent to Heroku Scheduler

**What goes wrong:** Heroku Scheduler currently runs `indices:refresh` and `emails:send_weekly_report`. SST defines tasks and production crons, but staging has no scheduled crons and deploys do not automatically run migrations. If schedules, task roles, env, or timing differ, search freshness and weekly reports break.

**Why it happens:** Moving from Heroku Scheduler/postdeploy conventions to EventBridge Scheduler and ECS tasks changes how tasks are invoked, logged, retried, and permissioned.

**Consequences:** Catalog search becomes stale, reports fail silently, reports send twice during overlap, migrations are forgotten during deploys, or scheduled tasks run with missing secrets.

**Warning signs:**
- New case metadata does not appear in search until manual refresh.
- No CloudWatch logs for `GalaRefreshIndices` or `GalaWeeklyReport`.
- Weekly report recipients receive duplicate emails during migration week.
- Deployed code expects migrations that have not run.

**Prevention strategy:**
- Treat migrations as an explicit release step in the deploy/cutover checklist or workflow.
- Before production, invoke each ECS task manually in staging with the same env and IAM path as production.
- Disable overlapping Heroku Scheduler jobs before enabling AWS production schedules.
- Make the weekly report idempotency/recipient behavior explicit during cutover week.

**Detection:**
- Manual staging runs of `GalaMigrate`, `GalaRefreshIndices`, and `GalaWeeklyReport` produce expected CloudWatch logs and exit codes.
- Search result freshness is verified after a metadata update.
- Production EventBridge schedules are enabled only after Heroku schedules are disabled.

**Phase mapping:** Phase 1 for deploy task wiring; Phase 2 for manual task validation; Phase 4 for schedule handoff.

### Pitfall 7: Production Image Builds Pass Locally but Fail in AWS Deploys

**What goes wrong:** The production Docker image installs Node 12.5 through nvm, Yarn 1 dependencies, Ruby gems, and precompiles assets with placeholder `DATABASE_URL` and `SECRET_KEY_BASE`. The infra package uses Node 20/npm separately. A small tooling or dependency change can make `sst deploy` fail during image build or produce an image with missing assets.

**Why it happens:** The Rails app has a legacy frontend toolchain with Webpacker, Sprockets, Flow-era packages, and `node-sass`. The repo explicitly warns not to mix root Node/Yarn tooling with the `infra/` Node 20/npm package.

**Consequences:** Deploys fail after infra has begun changing resources, assets 404 because `config.assets.compile = false`, browser packs are missing, or staging differs from production because the wrong Node/Yarn path was used.

**Warning signs:**
- Docker build fails during nvm install, `yarn install`, native Sass compilation, or `rails assets:precompile`.
- Runtime pages show missing pack or asset digests.
- Someone runs root package management with Node 20/npm while working in `infra/`.

**Prevention strategy:**
- Verify production image build and `rails assets:precompile` before relying on `sst deploy` as the first build signal.
- Keep `infra/` dependency changes isolated to npm/package-lock and root app changes isolated to Node 12/Yarn 1.
- Add an explicit deploy preflight that builds the Docker image or runs the same asset precompile path used in the image.
- Avoid frontend/toolchain upgrades inside the infrastructure migration unless a build blocker forces a narrow fix.

**Detection:**
- A clean Docker build completes with `RAILS_ENV=production`.
- Staging page loads have no missing Sprockets or Webpacker assets.
- CI/deploy logs show `infra` npm commands only inside `infra/`, and app JS commands use the pinned root toolchain.

**Phase mapping:** Phase 1 deploy preflight; Phase 2 staging browser validation; defer broader frontend modernization outside this milestone.

## Moderate Pitfalls

### Pitfall 8: DNS, Host, Cookie, OAuth, and LTI Callback Drift

**What goes wrong:** `BASE_URL` drives Rails default URL options, mailer links, Action Cable URL/origins, cover URLs, and staging detection. External providers also need callback URLs and launch URLs. If `BASE_URL`, DNS, OAuth callback settings, LTI tool configuration, and canonical host do not move together, users see auth failures or mixed old/new links.

**Warning signs:**
- Cable requests return 403 due to origin mismatch.
- Google OAuth or LTI callbacks return invalid redirect/callback errors.
- Emails from AWS contain Heroku or staging links.
- Cookies or redirects bounce between `learngala.com`, `www.learngala.com`, Heroku, and staging.

**Prevention strategy:**
- Lock the production canonical hostname as `https://www.learngala.com`.
- Update OAuth/LTI provider settings and any LMS launch/config docs as part of cutover, not after.
- Smoke test login, LTI launch, content item selection, email links, and `/cable` with the final hostnames.

**Phase mapping:** Phase 2 for staging host validation; Phase 4 for provider/DNS cutover.

### Pitfall 9: NAT-Free Public ECS Design Is Misunderstood

**What goes wrong:** The migration intentionally avoids NAT Gateways by placing ECS tasks in public subnets while RDS/cache stay private. If teams later assume tasks are private without public IPs, outbound calls to S3, SES SMTP, Sentry, OEmbed, Wikidata, Mapbox-related APIs, or package/runtime endpoints can fail. If security groups are too broad, the public-subnet design can also expose more than intended.

**Warning signs:**
- ECS tasks cannot reach outbound services after a networking tweak.
- Security group rules allow broad inbound access to app tasks instead of ALB-only traffic.
- A change disables public IP assignment without adding NAT or VPC endpoints.

**Prevention strategy:**
- Document the phase 1 network model explicitly: public ECS tasks for egress, private database/cache, ALB as the only intended inbound path.
- Verify security groups restrict inbound app traffic to the ALB and database/cache traffic to ECS roles/security groups.
- Add egress smoke tests for S3, SES SMTP, Sentry, OEmbed/OpenGraph, and Wikidata before cutover.

**Phase mapping:** Phase 1 network review; Phase 2 egress validation; Phase 5 revisit NAT/VPC endpoints only if operational data justifies it.

### Pitfall 10: Action Mailbox Inbound Replies Are Treated as Already Solved

**What goes wrong:** Production sets `config.action_mailbox.ingress = :amazon`, and replies are parsed through `reply+thread-key@mailbox.learngala.com`. The app-side mailbox exists, but AWS SES receipt rules, domain/MX setup, ingress authentication, and end-to-end delivery must be validated outside the Rails code.

**Warning signs:**
- Reply emails never create comments.
- SES receives mail but Rails does not create `action_mailbox_inbound_emails`.
- Mailbox routes process messages from unexpected domains or fail on address parsing.

**Prevention strategy:**
- Include inbound mail in staging/cutover validation, not only outbound SES SMTP.
- Confirm DNS/MX, SES receipt rules, and Rails Action Mailbox ingress settings for the final domain.
- Test reply-to-comment end to end with a real email message and confirm the resulting comment/thread.

**Phase mapping:** Phase 2 staging validation if a staging mailbox is available; Phase 4 production cutover checklist if only production domain can fully validate it.

### Pitfall 11: Shared Media Bucket Causes Stage Contamination

**What goes wrong:** SST uses `msc-gala` for both staging and production by default. If staging writes to the same bucket and object namespace as production, test uploads and destructive validation can pollute or delete production media.

**Warning signs:**
- Staging-created blobs are visible in the production bucket with no obvious stage prefix.
- Cleanup scripts or purge jobs cannot distinguish staging objects.
- Testers are told to delete uploaded objects manually from the shared bucket.

**Prevention strategy:**
- Prefer a separate staging bucket or a stage-scoped prefix with policy and cleanup rules.
- Do not run destructive upload/delete tests against production media without explicit acceptance.
- Include blob/object mapping checks in the staging validation checklist.

**Phase mapping:** Phase 1 stage isolation decision; Phase 2 upload validation; Phase 4 production media safety check.

### Pitfall 12: Observability Is Not Ready Before Traffic Moves

**What goes wrong:** CloudWatch logs exist by virtue of ECS, but Sentry is not currently declared in SST secrets, production logging is debug-level, and the runtime diagnostics endpoint is editor-only and expensive. Without a cutover dashboard and alert thresholds, failures can be discovered by users first.

**Warning signs:**
- No Sentry events from staging/AWS after deliberate test errors.
- CloudWatch logs are noisy but do not answer whether web, worker, Redis, RDS, uploads, and mail are healthy.
- No agreed rollback thresholds for 5xx rate, health failures, queue latency, or login/upload errors.

**Prevention strategy:**
- Inject Sentry DSN/environment/release if Sentry is part of production operations.
- Define CloudWatch log queries or dashboards for web 5xx, ECS task restarts, Sidekiq errors, queue latency, mail errors, and Redis/Postgres connection failures.
- Use `/runtime/stats` as a manual diagnostic, not the only monitoring plan.

**Phase mapping:** Phase 2 before staging signoff; Phase 4 before production DNS switch; Phase 5 for tuning noise and retention.

### Pitfall 13: RDS/Postgres Restore Differences Are Underestimated

**What goes wrong:** The target RDS database is PostgreSQL 16.4. The app uses `db/structure.sql`, materialized views, Ahoy event tables, Active Storage tables, Action Mailbox tables, and full-text search refreshes. A dump/restore can succeed superficially while extensions, ownership, sequences, indexes, or materialized views are wrong.

**Warning signs:**
- `rails db:migrate` passes but search queries fail or return stale results.
- Sequence values lag restored table IDs.
- Restore logs contain ignored owner/privilege/extension errors.
- Aggregate/statistics pages are slow or inconsistent after restore.

**Prevention strategy:**
- Rehearse `pg_dump`/restore into RDS with production-like data.
- Run migrations, `indices:refresh`, and representative search/statistics queries after restore.
- Compare counts for high-risk tables: readers, cases, deployments, comments, blobs, attachments, Ahoy events/visits, inbound emails, and Sidekiq-related records where applicable.
- Capture restore commands and version assumptions in the cutover runbook.

**Phase mapping:** Phase 3 blocker; Phase 4 repeats the rehearsed procedure.

### Pitfall 14: WebSockets Work Locally but Not Behind ALB

**What goes wrong:** Action Cable runs on `/cable` with allowed origins derived from `BASE_URL`, and Redis backs pub/sub across web tasks. ALB, HTTPS, hostnames, and origin settings must all line up. If they do not, collaborative editing locks and live statistics can partially fail.

**Warning signs:**
- Browser console shows failed WebSocket upgrade or 403 origin errors.
- Cable connects but broadcasts do not reach another browser/session.
- Failures only appear when more than one web task is running.

**Prevention strategy:**
- Test `/cable` through the staging ALB using the real staging domain and HTTPS.
- Validate a real feature that depends on Cable, not just the WebSocket handshake.
- Test with production-like `WEB_CONCURRENCY` and more than one web task if autoscaling is expected.

**Phase mapping:** Phase 2 runtime validation; Phase 4 production smoke test immediately after DNS.

## Minor Pitfalls

### Pitfall 15: Staging Is Left Running or Removed Carelessly

**What goes wrong:** Staging is intended to be deployed only when needed and removed after validation. If it remains running, costs drift upward. If it is removed without understanding retained/shared resources, useful logs or validation data disappear while shared resources may remain.

**Warning signs:**
- Staging ECS/RDS/Valkey resources remain active after validation windows.
- Team members are unsure whether `sst remove --stage staging` deletes data they still need.
- Cost reports show non-production spend that no one owns.

**Prevention strategy:**
- Add a staging teardown step and ownership rule to every validation phase.
- Export or snapshot anything needed before removal.
- Add simple cost checks after staging and production deploys.

**Phase mapping:** Phase 2 and Phase 5.

### Pitfall 16: Single-AZ Reliability Is Sold as an Upgrade

**What goes wrong:** The phase 1 plan intentionally uses single-AZ RDS and single-node Valkey for cost and simplicity. That can be acceptable, but it is not equivalent to a high-availability AWS architecture.

**Warning signs:**
- Stakeholders expect AWS migration to improve availability by default.
- Roadmap language omits the single-AZ tradeoff.
- No follow-up decision point exists for multi-AZ after real production data.

**Prevention strategy:**
- Document the accepted reliability tradeoff in the roadmap and cutover notes.
- Monitor real production incidents/costs before considering multi-AZ upgrades.
- Keep rollback and backup/restore procedures clear because phase 1 is not HA-first.

**Phase mapping:** Phase 1 decision record; Phase 5 revisit with production data.

### Pitfall 17: Production Removal Guardrails Are Weakened During Cleanup

**What goes wrong:** CI currently refuses production removal, and SST production removal is set to `retain`. If future cleanup work weakens either guardrail, a manual workflow dispatch or mistaken command could damage production infrastructure.

**Warning signs:**
- `production` removal settings are edited while simplifying stage logic.
- Deploy workflow action choices expand without equivalent production guardrails.
- Manual `sst remove --stage production` is suggested as a cleanup step.

**Prevention strategy:**
- Keep both guardrails: workflow-level refusal and SST `retain` for production.
- Treat any production removal change as a separate reviewed phase.
- Prefer resource-specific cleanup plans over broad stack removal.

**Phase mapping:** Phase 1 guardrail review; all later infra phases must preserve it.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| Health and deploy baseline | `/` health check creates false failures or false confidence | Add `/up`, update ALB and container health checks, verify in ECS |
| Secrets and env | Heroku config vars are not fully carried to SST | Build parity checklist, declare/inject missing secrets, smoke test features |
| Storage | IAM role access is configured in infra but Rails still expects static keys | Update `storage.yml`, test ECS role-based direct upload/read/delete |
| Stage isolation | Staging writes into production media namespace | Use staging bucket or prefix, define cleanup policy |
| Staging validation | Only homepage is tested | Validate uploads, auth, LTI, Action Cable, Sidekiq, mail, scheduled tasks, assets, diagnostics |
| Data migration rehearsal | Restore works superficially but search/queues/sequences are wrong | Compare counts, run migrations, refresh search, inspect queues, test core workflows |
| Cutover | Both Heroku and AWS accept writes | Freeze/drain, disable old schedules/workers, move data once, define rollback point |
| DNS/provider switch | `BASE_URL` and external callbacks drift | Update DNS, OAuth, LTI, mail links, and Cable origins together |
| Post-cutover | Observability and cost are checked too late | Add dashboards/log queries, queue checks, Sentry, cost review |

## Roadmap Implications

1. **Do not start with production DNS.** The first roadmap phase should close health, secrets, IAM/storage, and guardrail gaps because those determine whether later validation means anything.
2. **Make staging validation broad and behavior-based.** A successful deploy is not sufficient. The validation checklist must include uploads, Action Cable, Sidekiq, Redis cache, outbound mail, inbound mail assumptions, OAuth/LTI, scheduled tasks, assets, logs, and diagnostics.
3. **Separate data migration rehearsal from cutover.** The highest-risk production failure is write divergence between Heroku and AWS. Rehearsal should produce a command-level runbook before the production window.
4. **Keep architecture simplification out of phase 1.** Redis, Sidekiq, Action Cable, and Webpacker are fragile enough that replacing them during the hosting move would multiply failure modes.
5. **Treat single-AZ and shared-bucket decisions as explicit tradeoffs.** They may be acceptable for cost, but they need visible acceptance and follow-up checks.

## Sources

- `.planning/PROJECT.md` - migration requirements, active items, constraints, decisions
- `.planning/codebase/CONCERNS.md` - fragile areas, scaling limits, Redis TLS concern, asset/tooling risk
- `.planning/codebase/INTEGRATIONS.md` - external services, storage, queues, webhooks, env requirements
- `docs/aws-sst-migration-plan.md` - target architecture, phase 1/2 boundaries, cutover-required changes
- `infra/sst.config.ts` - ECS, RDS, Valkey, tasks, crons, domains, health checks, env injection, IAM media policy
- `.github/workflows/deploy.yml` - manual SST deploy/remove workflow and production removal guard
- `config/storage.yml` - Active Storage S3 config and static credential assumptions
- `config/environments/production.rb` - `BASE_URL`, assets, Action Cable, Redis cache, mail, Action Mailbox
- `config/cable.yml` - Redis Action Cable config and TLS verification setting
- `config/initializers/sidekiq.rb` - Redis Sidekiq config and TLS verification setting
- `Dockerfile`, `Procfile`, `config/puma.rb`, `config/sidekiq.yml`, `lib/tasks/indices.rake`, `lib/tasks/emails.rake`, `config/routes.rb` - adjacent runtime evidence
