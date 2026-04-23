# Architecture Research: Gala SST Infrastructure Migration

**Domain:** Brownfield Rails monolith migration from Heroku-style runtime to AWS/SST
**Researched:** 2026-04-23
**Overall confidence:** HIGH for local architecture and dependency ordering; MEDIUM for AWS operational details not fully represented in local code

## Executive Summary

Gala should be migrated as a behavior-preserving ECS Fargate architecture, not as an application rewrite. The Rails app already has two production process types in `Procfile`: Puma web and Sidekiq worker. The current `infra/sst.config.ts` correctly mirrors that shape with `GalaWeb`, `GalaWorker`, and one-off ECS tasks that reuse the same Docker image and shared runtime environment.

The architectural center is a single Rails container image connected to four stateful or external dependencies: RDS PostgreSQL for application data and materialized search indexes, Valkey/Redis for Sidekiq, Rails cache, and Action Cable, S3 for Active Storage media, and SES for outbound mail plus Action Mailbox Amazon ingress assumptions. This preserves the existing production behavior documented in the app configs and avoids coupling the hosting migration to later Rails modernization.

Build order should follow dependency direction. First stabilize deployment identity, secrets, region, and image build; then provision network and stateful services; then make web health checks reliable; then validate Redis-backed worker/Cable/cache behavior; then wire scheduled ECS tasks; then validate S3 and SES behavior; only after staging passes should data migration and DNS cutover proceed. The roadmap should treat the health endpoint, S3 IAM credential behavior, scheduled task parity, and Action Mailbox ingress as explicit validation gates.

No network research was used because the user constrained this pass to local repo evidence.

## Recommended Architecture

```text
GitHub Actions workflow_dispatch
  -> OIDC role in AWS account
  -> infra/ Node 20 npm package
  -> npx sst install
  -> npx sst deploy --stage staging|production

Internet
  -> Route 53 / ACM
  -> SST-managed ALB
  -> GalaWeb ECS Fargate service
       command: bundle exec puma -C config/puma.rb
       env: BASE_URL, DATABASE_URL, REDIS_URL, S3_BUCKET, SES creds, Rails secrets
       talks to: RDS PostgreSQL, Valkey, S3, SES SMTP, external OAuth/LTI/Mapbox/Sentry/OEmbed services

GalaWorker ECS Fargate service
  command: bundle exec sidekiq -C config/sidekiq.yml
  env: same shared runtime env
  talks to: RDS PostgreSQL, Valkey, S3, SES SMTP

One-off ECS tasks
  GalaMigrate: bundle exec rails db:migrate
  GalaRefreshIndices: bundle exec rake indices:refresh
  GalaWeeklyReport: bundle exec rake emails:send_weekly_report
  env: same shared runtime env
  IAM: same S3 media access policy

Private stateful services
  RDS PostgreSQL 16.4 single-AZ
  ElastiCache Valkey 7.2 single node

External/pre-existing platform dependencies
  S3 bucket msc-gala in us-west-2
  SES SMTP in us-west-2
  Action Mailbox Amazon ingress configuration
```

### Opinionated Recommendation

Use the existing SST design as the phase 1 target: ECS Fargate web and worker services in public subnets, RDS and Valkey private, a public ALB for HTTP/WebSocket traffic, EventBridge/SST Cron for recurring tasks, and the pre-existing `msc-gala` bucket for media. Do not introduce Lambda, NAT Gateways, ECS-on-EC2, CloudFront, Solid Queue, Solid Cable, or Redis removal into this migration milestone. Those are later optimization topics after AWS production behavior is proven.

## Component Boundaries

| Component | Responsibility | Communicates With | Validation Implication |
|-----------|----------------|-------------------|------------------------|
| GitHub deploy workflow | Manual deploy/remove entrypoint for `staging` and `production`; assumes AWS role through OIDC; installs and runs SST from `infra/` | AWS STS, SST, AWS APIs | Validate OIDC account/role before trusting deploys; preserve production remove guard |
| `infra/` SST package | Owns AWS topology and stage-specific config; separate Node >=20/npm project | ECS, RDS, Valkey, ALB, IAM, Route 53, ACM, EventBridge | Do not run root Node 12/Yarn assumptions inside `infra/`; validate with `npm ci`, `npx sst install`, `npx sst deploy` |
| Docker image | Builds the Rails app once for web, worker, and tasks; precompiles assets in production image builds | Ruby 3.2.9, Bundler 2.4.19, Node 12.5.0, Yarn 1 | Asset and Node compatibility failures block every runtime component, so image build must precede infra validation |
| `GalaWeb` ECS service | Runs Puma and serves HTTP, WebSocket upgrade requests, Rails static assets, direct upload endpoints, OAuth/LTI callbacks, and app UI | ALB, RDS, Valkey, S3, SES SMTP, external APIs | Needs dedicated lightweight health endpoint; `/` is too behavior-heavy for ECS/ALB health |
| ALB and domain | Terminates public HTTP/HTTPS and forwards to port 3000 | Route 53, ACM, `GalaWeb` | Must support `/cable` WebSocket upgrades and stable `BASE_URL` host/origin behavior |
| `GalaWorker` ECS service | Runs Sidekiq queues for background jobs, mailers, broadcasts, Active Storage analysis/purge, Ahoy jobs | Valkey, RDS, S3, SES SMTP | Validate queue processing, retry behavior, and Redis TLS URL before user traffic cutover |
| One-off ECS tasks | Replace Heroku postdeploy and scheduler commands: migrations, search refresh, weekly report | RDS, Valkey, S3, SES SMTP | Migrations must be manually controlled; recurring tasks need parity checks against Heroku Scheduler |
| RDS PostgreSQL | Primary relational store, Active Storage metadata, Action Mailbox records, Ahoy data, materialized search index | Web, worker, tasks | Data migration and PostgreSQL version compatibility are production cutover gates |
| Valkey/Redis | Shared queue backend, Rails cache store, Action Cable pub/sub | Web, worker, tasks | A single bad `REDIS_URL` breaks cache, jobs, and real-time updates together |
| S3 media bucket | Active Storage object storage and direct upload target | Browser direct uploads, web, worker, tasks | Task roles already get media policy, but Rails storage config currently references static key env vars |
| SES mail | Outbound Action Mailer SMTP; Amazon ingress for Action Mailbox replies | Web, worker, tasks, AWS mail receiving setup | Outbound and inbound mail are separate validation paths; inbound ingress is not fully described by current SST config |
| Runtime diagnostics | `/runtime/stats` reports process, cache, Sidekiq, and Action Cable details | Web, Rails internals, Sidekiq stats | Useful after deploy, but should not be the ALB health check |

## Data Flow

### Deploy Flow

1. Operator dispatches `.github/workflows/deploy.yml` with `stage` and `action`.
2. GitHub assumes `arn:aws:iam::353760060567:role/gala_oidc_service_role` in `us-west-2`.
3. Workflow installs `infra/` dependencies with Node 20 and `npm ci`.
4. Workflow runs `npx sst install`.
5. Workflow runs `npx sst deploy --stage <stage>` or `npx sst remove --stage <stage>`.
6. Production removal is blocked in GitHub Actions and SST production removal is configured as `retain`.

### Web Request Flow

1. Browser connects to `https://www.learngala.com` or `https://staging.learngala.com`.
2. Route 53 and ACM route TLS traffic to the ALB.
3. ALB forwards HTTP to `GalaWeb` on port 3000.
4. Puma handles Rails routes, serves precompiled/static assets when `RAILS_SERVE_STATIC_FILES=true`, and uses `BASE_URL` for URL generation.
5. Rails reads and writes PostgreSQL through `DATABASE_URL`.
6. Rails uses `REDIS_URL` for cache and Action Cable pub/sub.
7. Active Storage direct upload endpoints issue S3 upload instructions for browser-to-S3 media writes.

### WebSocket Flow

1. Browser opens `wss://<BASE_URL_HOST>/cable`.
2. ALB forwards the WebSocket upgrade to `GalaWeb`.
3. Action Cable authenticates with the Rails session/current reader flow.
4. Action Cable uses the Redis adapter and `REDIS_URL`.
5. Worker jobs or web requests broadcast to Redis-backed channels.
6. Connected browsers receive edits, stats invalidation, forum, and notification events.

### Background Job Flow

1. Web requests, models, or services enqueue Active Job/Sidekiq work into Redis.
2. `GalaWorker` consumes queues from `config/sidekiq.yml`.
3. Worker jobs read/write PostgreSQL and may touch S3, send SES mail, or broadcast Action Cable events.
4. Sidekiq client/server Redis config uses `rediss://` safely with SSL verification disabled as currently configured.

### Scheduled Task Flow

1. SST defines `GalaRefreshIndices` and `GalaWeeklyReport` as ECS tasks.
2. Production creates Cron schedules for refresh every 15 minutes and weekly report on Monday at 15:00 UTC.
3. `GalaRefreshIndices` runs `bundle exec rake indices:refresh`, which executes `RefreshIndicesJob.perform_now`.
4. `GalaWeeklyReport` runs `bundle exec rake emails:send_weekly_report`, which calls `ReportMailer.weekly_report.deliver`.
5. Staging does not currently create schedules, so staging validation needs manual task execution or a temporary schedule.

### Storage Flow

1. Rails uses `config.active_storage.service = :amazon` in production.
2. `config/storage.yml` points the `amazon` service to bucket `msc-gala` in `us-west-2`.
3. SST attaches S3 list/get/put/delete permissions for `msc-gala` to web, worker, migration, refresh, and weekly report task roles.
4. The app must be adjusted or validated so the AWS SDK uses ECS task role credentials instead of requiring `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

### Mail Flow

1. Rails configures Action Mailer SMTP when `SES_SMTP_USERNAME` and `SES_SMTP_PASSWORD` are present.
2. Web, worker, and weekly report task can send through `email-smtp.us-west-2.amazonaws.com`.
3. Action Mailbox ingress is set to `:amazon`; inbound reply handling depends on AWS mail receiving resources and routing outside the inspected SST config.

## Build Order

Roadmap phases should be ordered by dependency, not by AWS service category.

1. **Deployment and Toolchain Guardrails**
   - Confirm `infra/` stays isolated on Node 20/npm while the app root remains Ruby 3.2.9, Bundler 2.4.19, Node 12.5.0, and Yarn 1.
   - Validate GitHub OIDC identity, stage inputs, production removal guard, and SST `retain` behavior.
   - Reason: every later phase depends on repeatable deploy/remove behavior.

2. **Secrets, Stage Naming, and Runtime Environment**
   - Set required SST secrets per stage: Rails keys, LTI keys, Mapbox token, SES SMTP credentials, plus any OAuth/Sentry secrets actually used in production.
   - Normalize `BASE_URL`, `RAILS_ENV`, `NODE_ENV`, `PORT`, thread/process counts, `S3_BUCKET`, `DATABASE_URL`, and `REDIS_URL`.
   - Reason: Rails production behavior is environment-driven, and wrong `BASE_URL` breaks URL helpers, Action Cable origins, OAuth/LTI callbacks, and mail links.

3. **Container Build and Asset Precompile**
   - Verify the Dockerfile builds with Ruby 3.2.9 and Node 12.5.0 and can precompile Webpacker/Sprockets assets with placeholder DB and secret values.
   - Reason: web, worker, migration, refresh, and report tasks all share this image.

4. **Network and Stateful Foundation**
   - Provision VPC, ECS cluster, RDS PostgreSQL, and Valkey/Redis in `us-west-2`.
   - Keep RDS and Valkey private; keep ECS services in public subnets to preserve the no-NAT cost model.
   - Reason: web and worker cannot be meaningfully validated until database and Redis URLs exist.

5. **Web Service, ALB, and Health**
   - Add/finalize a lightweight health endpoint such as `/up`.
   - Change ALB target health and container health from `/` to the health endpoint.
   - Validate HTTPS, host redirects, static assets, login pages, OAuth/LTI callback reachability, direct upload endpoint reachability, and `/runtime/stats`.
   - Reason: using `/` for health couples deploy stability to catalog rendering, DB/cache behavior, auth redirects, and asset issues.

6. **Worker and Redis-Dependent Behavior**
   - Deploy `GalaWorker` after Redis connectivity is proven.
   - Validate Sidekiq queue consumption, mailer queues, Active Storage analysis/purge queues, Ahoy jobs, and broadcast jobs.
   - Reason: Redis is shared across cache, Sidekiq, and Cable; validating one use is insufficient.

7. **One-off Tasks and Scheduler Parity**
   - Validate `GalaMigrate` can be run intentionally, not automatically hidden inside deploy.
   - Validate `GalaRefreshIndices` and `GalaWeeklyReport` manually in staging.
   - Enable or verify production schedules only after staging task behavior is clean.
   - Reason: Heroku Scheduler behavior must be replaced explicitly, and search freshness depends on `indices:refresh`.

8. **S3 Media and IAM Credential Behavior**
   - Confirm all ECS task roles can list/read/write/delete the media bucket as needed.
   - Update or validate Active Storage S3 config so IAM task role credentials are used in ECS rather than static AWS key env vars.
   - Validate direct uploads, attachment reads, clone/copy flows involving attachments, purge/analyze jobs, and signed URL behavior.
   - Reason: current SST grants IAM correctly, but Rails config still names static key env vars.

9. **Mail and Inbound Reply Handling**
   - Validate SES SMTP from web/worker/tasks.
   - Separately validate Action Mailbox Amazon ingress resources, DNS/MX assumptions, routing, and `reply+thread-key@mailbox.learngala.com`.
   - Reason: outbound SMTP credentials in SST do not prove inbound mail receiving is wired.

10. **Staging End-to-End Validation**
    - Run a staged checklist for uploads, outbound mail, inbound mail, Action Cable, Sidekiq, scheduled jobs, assets, OAuth/LTI callbacks, runtime diagnostics, and search index freshness.
    - Reason: this is the first point where all runtime dependencies interact like production.

11. **Data Migration and Production Cutover**
    - Plan Heroku Postgres export/import or replication approach, migration task timing, search refresh after import, S3 continuity checks, DNS TTL/cutover, and rollback.
    - Reason: production cutover is a data and DNS operation after infrastructure is already proven.

12. **Post-Cutover Monitoring and Optimization**
    - Watch CloudWatch logs, Sentry, Sidekiq stats, RDS/Valkey metrics, ALB health, cost, and user workflows.
    - Defer Redis removal, CloudFront, Solid Queue/Cable, and multi-AZ changes until stable AWS production data exists.

## Patterns to Follow

### Pattern 1: One Image, Multiple Commands

**What:** Build one production Rails image and run different commands for web, worker, migrations, and scheduled tasks.

**Why:** This matches the existing Heroku process model while preventing drift between app code, gems, assets, and runtime config.

**Example:**

```text
web:     bundle exec puma -C config/puma.rb
worker:  bundle exec sidekiq -C config/sidekiq.yml
migrate: bundle exec rails db:migrate
search:  bundle exec rake indices:refresh
report:  bundle exec rake emails:send_weekly_report
```

### Pattern 2: Shared Runtime Environment With Stage-Specific Values

**What:** Keep `sharedEnvironment` as the source of truth for web, worker, and tasks, with stage-specific domain, capacity, and sizing.

**Why:** Gala's production config reads environment variables for database, Redis, static files, URL generation, mail, Action Cable, storage, and concurrency. Divergent env between services would create hard-to-debug behavior differences.

### Pattern 3: Explicit Operational Tasks

**What:** Treat migrations and Heroku Scheduler replacements as named ECS tasks with manual validation.

**Why:** Rails database migrations, materialized search index refreshes, and weekly reports have side effects. They should be visible operational units in the roadmap and runbook.

### Pattern 4: IAM Role Access for AWS Resources

**What:** Use ECS task roles for S3 media access and GitHub OIDC for deploy access.

**Why:** This avoids new long-lived AWS keys. The current SST config already attaches media policies to all relevant task roles; the Rails S3 config needs to align with that credential model.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Rewriting Runtime Architecture During Hosting Migration

**What:** Replacing Sidekiq, Redis-backed Action Cable, or Redis cache while also moving infrastructure.

**Why bad:** Redis is currently used by three production paths: queues, cache, and Cable. Removing it changes app behavior and infrastructure at the same time.

**Instead:** Keep Valkey/Redis for phase 1; evaluate Solid Queue/Solid Cable/cache changes only after AWS production is stable.

### Anti-Pattern 2: Using `/` as Long-Term Health Check

**What:** ALB and ECS currently check `/`.

**Why bad:** The root route can depend on catalog rendering, database, cache, redirects, assets, and user-facing behavior. That makes deploy health noisy and can mask the actual failure domain.

**Instead:** Add a lightweight endpoint that verifies the process can serve requests and, if desired, a separate deeper diagnostic endpoint such as `/runtime/stats` for manual checks.

### Anti-Pattern 3: Treating S3 IAM Policy as Sufficient by Itself

**What:** Assuming task role media permissions prove Active Storage works.

**Why bad:** `config/storage.yml` currently declares `access_key_id` and `secret_access_key` from env vars. Blank or missing static credential fields can prevent the AWS SDK from falling through to ECS task credentials depending on Rails/AWS SDK behavior.

**Instead:** Validate or change the storage config to rely on the default AWS credential provider chain in ECS.

### Anti-Pattern 4: Validating Only the Web Service

**What:** Declaring migration readiness after the ALB serves pages.

**Why bad:** Gala's behavior depends on Sidekiq, Redis cache, Action Cable, scheduled search refresh, mail, uploads, and inbound reply routing.

**Instead:** Use a staging checklist that exercises each integration before any production data or DNS move.

## Scalability Considerations

| Concern | Phase 1 Approach | When to Revisit |
|---------|------------------|-----------------|
| Web capacity | Fargate `0.5 vCPU / 2 GB`, production min 1 max 3 | Increase after ALB/RDS/CPU/memory metrics justify it |
| Worker capacity | Fargate `0.25 vCPU / 1 GB`, production min 1 max 2 | Tune based on queue latency and memory |
| Database | Single-AZ RDS PostgreSQL 16.4, t4g sizing | Revisit after cutover metrics or if import/version compatibility requires it |
| Redis/Valkey | Single node Valkey 7.2 | Revisit only after production stability and real cache/queue/Cable data |
| Staging cost | Deploy on demand with spot capacity; remove when finished | Revisit if staging becomes continuously used |
| Static assets/media performance | Rails serves static assets; S3 handles media | Add CloudFront later if metrics show need |
| Availability | Single-AZ stateful services | Add multi-AZ when reliability requirements outweigh cost goal |

## Validation Matrix

| Architecture Area | Validation Required | Evidence Source |
|-------------------|---------------------|-----------------|
| Deploy identity | `aws sts get-caller-identity` in workflow shows intended AWS account/role | `.github/workflows/deploy.yml` |
| Stage safety | Production remove refused in CI and SST production removal retained | `.github/workflows/deploy.yml`, `infra/sst.config.ts` |
| Image build | Production Docker build completes assets precompile with Node 12.5/Yarn | `Dockerfile`, `AGENTS.md` |
| Web health | `/up` or equivalent passes ALB and ECS health without rendering app UI | `.planning/PROJECT.md`, `infra/sst.config.ts` |
| URL generation | `BASE_URL` produces correct host for routes, mail, and Action Cable | `config/environments/production.rb`, `infra/sst.config.ts` |
| WebSockets | `/cable` connects over `wss://<host>/cable` and broadcasts through Redis | `config/environments/production.rb`, `config/cable.yml` |
| Redis TLS | Sidekiq, Rails cache, and Cable work with `rediss://` and SSL params | `config/initializers/sidekiq.rb`, `config/cable.yml`, `config/environments/production.rb` |
| Background jobs | All Sidekiq queues process work and can access DB/S3/SES | `config/sidekiq.yml`, `infra/sst.config.ts` |
| Search freshness | `indices:refresh` runs on schedule and after data import | `lib/tasks/indices.rake`, `infra/sst.config.ts`, `AGENTS.md` |
| Weekly report | `emails:send_weekly_report` sends through SES SMTP | `lib/tasks/emails.rake`, `config/environments/production.rb` |
| Active Storage | Direct upload, read, purge, and analyze paths work through S3 and IAM task roles | `config/storage.yml`, `config/environments/production.rb`, `infra/sst.config.ts` |
| Outbound mail | SES SMTP credentials work in web, worker, and scheduled tasks | `config/environments/production.rb`, `infra/sst.config.ts` |
| Inbound mail | Amazon Action Mailbox ingress and reply routing work end to end | `config/environments/production.rb`, `.planning/codebase/INTEGRATIONS.md` |
| Data cutover | RDS contains imported data, migrations are current, search index refreshed | `infra/sst.config.ts`, `docs/aws-sst-migration-plan.md` |

## Roadmap Implications

The roadmap should not start with production cutover work. It should start with deployability and health because those are prerequisites for every runtime validation. The most defensible phase structure is:

1. **Infra deploy baseline and secrets** - establish trusted stage deploys, OIDC, SST secrets, and toolchain separation.
2. **Runtime image and health checks** - make the shared Docker image and lightweight health endpoint reliable.
3. **Stateful service connectivity** - prove RDS and Valkey work from web, worker, and tasks.
4. **Behavior parity services** - validate Sidekiq, Action Cable, cache, scheduled tasks, S3, and SES.
5. **Staging acceptance checklist** - run end-to-end user and operator workflows on AWS staging.
6. **Data migration and DNS cutover** - migrate Heroku data, refresh indexes, cut DNS, and verify rollback path.
7. **Post-cutover monitoring and simplification candidates** - observe production before changing queue/cable/cache architecture.

Research flags for later phases:

- **Active Storage IAM:** Needs implementation-specific validation because the Rails storage config currently names static AWS credential env vars while the target architecture prefers ECS task roles.
- **Action Mailbox Amazon ingress:** Needs deeper AWS resource mapping; the Rails app enables Amazon ingress, but the current SST file does not show SES receipt rules, SNS/S3/Lambda routing, MX records, or related secrets.
- **Database migration:** Needs a phase-specific runbook for Heroku Postgres export/import, PostgreSQL version compatibility, downtime window, migrations, and rollback.
- **Scheduled staging validation:** Current SST schedules only production cron jobs; staging needs manual task execution or temporary schedule support for parity testing.

## Sources

- `.planning/PROJECT.md` - project requirements, constraints, and active migration risks.
- `.planning/codebase/ARCHITECTURE.md` - Rails monolith layers, runtime processes, background jobs, Cable, persistence, and infra boundary.
- `.planning/codebase/INTEGRATIONS.md` - AWS, Redis, S3, SES, Action Mailbox, OAuth/LTI, observability, and webhook inventory.
- `docs/aws-sst-migration-plan.md` - target architecture, region, service choices, cost tradeoffs, and required app changes.
- `infra/sst.config.ts` - actual SST v4 resources, environment, ECS services, tasks, schedules, IAM media policy, and outputs.
- `.github/workflows/deploy.yml` - manual deployment workflow, OIDC, production removal guard, Node 20/npm infra execution.
- `config/storage.yml` - Active Storage S3 bucket, region, and current static credential env references.
- `config/environments/production.rb` - production URL, static files, Action Cable, Redis cache, Active Job, SES SMTP, and Action Mailbox settings.
- `config/cable.yml` - Redis-backed Action Cable configuration.
- `config/initializers/sidekiq.rb` - Redis URL handling and `rediss://` SSL behavior for Sidekiq.
- `AGENTS.md` - repo-specific stack, tooling, verification, infra deploy, and search-indexing guidance.
- `Procfile`, `Dockerfile`, `config/puma.rb`, `config/sidekiq.yml`, `lib/tasks/indices.rake`, `lib/tasks/emails.rake` - local evidence for runtime commands and scheduled task behavior.
