# Technology Stack Research: Gala SST Infrastructure Migration

**Project:** Gala SST Infrastructure Migration
**Dimension:** Stack
**Researched:** 2026-04-23
**Overall confidence:** HIGH for repo-derived constraints; MEDIUM for SST/AWS service behavior not revalidated against network docs in this pass.

## Recommendation

Finish the migration as an ECS/Fargate lift-and-shift managed by the existing SST v4 package in `infra/`. Do not use this milestone to modernize the Rails app, replace Redis, switch frontend tooling, or move regions. The governing stack should be:

- **Infrastructure IaC:** SST `4.7.1`, TypeScript, Node `>=20`, npm, `infra/package-lock.json`.
- **AWS runtime:** `us-west-2`, ECS Fargate services/tasks, ALB, Route 53, ACM, ECR, RDS PostgreSQL `16.4`, ElastiCache Valkey `7.2`, S3, SES SMTP, EventBridge Scheduler, CloudWatch Logs, IAM task roles, GitHub OIDC deploys.
- **Application runtime inside ECS:** existing Dockerfile with Ruby `3.2.9`, Bundler `2.4.19`, Node `12.5.0`, Yarn `1.x`, Rails `7.0.8.7`, Puma `7.1.0`, Sidekiq `7.3.6`.
- **Data/service compatibility:** keep PostgreSQL, Redis protocol compatibility, Active Storage S3, Action Cable Redis adapter, Sidekiq Redis queues, Rails Redis cache store, and scheduled rake tasks.

This is a compatibility-first migration. The app already assumes Heroku-style long-running web and worker processes, precompiled Rails assets, Redis-backed Sidekiq/cache/Action Cable, S3 Active Storage, SES SMTP, and scheduled rake jobs. SST should codify those assumptions rather than forcing an app rewrite before production cutover.

## Hard Constraints

| Constraint | Required Choice | Confidence | Repo Evidence |
|------------|-----------------|------------|---------------|
| Root app runtime | Ruby `3.2.9`, Bundler `2.4.19`, Node `12.5.0`, Yarn `1.x` | HIGH | `.ruby-version`, `Gemfile.lock`, `Dockerfile`, `package.json`, `AGENTS.md` |
| Infra runtime | Node `>=20`, npm, `package-lock.json` | HIGH | `infra/package.json`, `.github/workflows/deploy.yml`, `AGENTS.md` |
| IaC framework | SST v4, pinned to `sst` `4.7.1` until deliberately upgraded | HIGH | `infra/package.json`, `infra/package-lock.json`, `infra/sst.config.ts` |
| AWS region | `us-west-2` | HIGH | `infra/sst.config.ts`, `config/storage.yml`, `config/environments/production.rb`, `docs/aws-sst-migration-plan.md` |
| App hosting | ECS Fargate, not Lambda, App Runner, or ECS on EC2 | HIGH | `docs/aws-sst-migration-plan.md`, `.planning/PROJECT.md`, `infra/sst.config.ts` |
| Process model | Puma web service plus Sidekiq worker service plus one-off/scheduled ECS tasks | HIGH | `Procfile`, `config/puma.rb`, `config/sidekiq.yml`, `infra/sst.config.ts` |
| Database | RDS PostgreSQL `16.4` via `sst.aws.Postgres` | HIGH | `infra/sst.config.ts`, `docker-compose.yml`, `.planning/codebase/STACK.md` |
| Redis-compatible service | Valkey `7.2` via `sst.aws.Redis`, Redis protocol URL exposed as `REDIS_URL` | HIGH | `infra/sst.config.ts`, `config/cable.yml`, `config/initializers/sidekiq.rb`, `config/environments/production.rb` |
| Media storage | Existing S3 bucket `msc-gala`, region `us-west-2` | HIGH | `config/storage.yml`, `infra/sst.config.ts`, migration plan |
| Mail | SES SMTP in `us-west-2`; Action Mailbox Amazon ingress remains app-level assumption | HIGH | `config/environments/production.rb`, migration plan |
| Deploy auth | GitHub Actions OIDC role, not long-lived AWS access keys | HIGH | `.github/workflows/deploy.yml`, `.planning/PROJECT.md` |
| Production teardown | CI must block production remove; SST production removal must retain resources | HIGH | `.github/workflows/deploy.yml`, `infra/sst.config.ts`, `AGENTS.md` |

## Recommended Stack

### Infrastructure Tooling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| SST | `4.7.1` | AWS infrastructure definition and deployment | Already pinned and used for VPC, ECS services, RDS, Redis/Valkey, tasks, cron, IAM, and domain outputs. Keep pinned until a dedicated upgrade phase can run `sst diff` and staging deploy validation. |
| TypeScript | `^6.0.2` in `infra/package.json`; resolved by `package-lock.json` | Infra authoring language | Matches current SST package. Do not introduce a separate Pulumi/CDK app while SST owns the stack. |
| Node | `>=20`; GitHub Actions uses Node `20` | Infra CLI runtime | Required by `infra/package.json` and CI. Keep isolated from the Rails root Node `12.5.0`. |
| npm | Lockfile v3, `npm ci` | Infra dependency installation | CI already uses `npm ci` with `infra/package-lock.json`. Do not use Yarn or pnpm in `infra/`. |
| GitHub Actions | `workflow_dispatch`, `actions/setup-node@v4`, `aws-actions/configure-aws-credentials@v4` | Manual deploy/remove control | Existing deploy flow is correctly separate from test/build workflows and uses OIDC. Harden it rather than replacing it. |

### AWS Platform

| Service | Version/Shape | Purpose | Why |
|---------|---------------|---------|-----|
| AWS Region | `us-west-2` | Single phase-1 region | Existing S3 bucket and SES SMTP endpoint are already in `us-west-2`; moving compute elsewhere would add latency and transfer complexity. |
| VPC | SST `sst.aws.Vpc`, `az: 2` | Network boundary | Current config supports public ECS tasks plus private stateful services, matching the cost goal of avoiding NAT gateways. |
| ECS/Fargate Cluster | SST `sst.aws.Cluster` | Web, worker, and task execution | Best fit for the existing Rails/Puma/Sidekiq process model with minimal app change. |
| Fargate Web Service | `0.5 vCPU`, `2 GB`, `x86_64`, min `1`, max production `3` | Rails/Puma HTTP and WebSocket traffic | Mirrors `Procfile` web process and gives more memory headroom than small Heroku dynos. Keep `x86_64` because the Dockerfile installs native libraries and local compose declares `linux/amd64`. |
| Fargate Worker Service | `0.25 vCPU`, `1 GB`, `x86_64`, min `1`, max production `2` | Sidekiq jobs | Mirrors `Procfile` worker process and keeps background work separate from web capacity. |
| Fargate Tasks | `0.25 vCPU`, `1 GB`, `x86_64` | `db:migrate`, `indices:refresh`, `emails:send_weekly_report` | Replaces Heroku postdeploy/scheduler behaviors with explicit ECS tasks. |
| RDS PostgreSQL | PostgreSQL `16.4`; production `t4g.small`, staging `t4g.micro`; single-AZ | Primary relational store and materialized search indexes | Aligns AWS with local Docker `postgres:16.4`; supports existing `pg` gem and SQL schema. |
| ElastiCache Valkey | Valkey `7.2`, `t4g.micro`, single node | Redis protocol backend for Sidekiq, Action Cable, and Rails cache | Required for phase 1 because Sidekiq, Action Cable, and cache all read `REDIS_URL`. |
| ALB + ACM + Route 53 | Stage domains `www.learngala.com` and `staging.learngala.com` | HTTP/TLS ingress | Required for Rails routes, `/cable`, force SSL, and stable `BASE_URL`-derived URLs. |
| ECR | SST-managed image publishing | Container image registry | SST services/tasks build from repo-root `Dockerfile`; keep image build centralized through SST deploy. |
| EventBridge Scheduler/SST Cron | Production schedules only | Index refresh and weekly report | Matches current Heroku Scheduler responsibilities and avoids always-on scheduler code in the app. |
| S3 | Existing bucket `msc-gala` | Active Storage media | Preserve existing bucket/region for direct uploads and stored objects. |
| SES SMTP | `email-smtp.us-west-2.amazonaws.com:587` | Outbound mail | Already configured in production Rails. Keep SMTP credentials as SST secrets. |
| IAM Task Roles | Per-service/task S3 policies | AWS resource access from ECS | Prefer IAM task roles over static `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` in production. Current SST already attaches S3 policies to web, worker, and tasks. |
| CloudWatch Logs | SST/ECS default logging | Runtime logs | Required as the Heroku log stream replacement. Add alarms/retention later, but do not add a separate log vendor for phase 1. |

### Rails Runtime Compatibility

| Technology | Version | Migration Constraint |
|------------|---------|----------------------|
| Rails | `7.0.8.7` | Keep as-is for this milestone. Rails upgrade belongs after AWS stability. |
| Ruby | `3.2.9` | Must match `.ruby-version`, `Gemfile.lock`, and `Dockerfile`. |
| Bundler | `2.4.19` | Must match `Gemfile.lock` and Dockerfile install. |
| Puma | `7.1.0` | ECS web command should remain `bundle exec puma -C config/puma.rb`. |
| Sidekiq | `7.3.6` | ECS worker command should remain `bundle exec sidekiq -C config/sidekiq.yml`. |
| Redis gem | `5.3.0` | Keep `REDIS_URL` compatible with Sidekiq, Rails cache, and Action Cable. |
| pg | `1.5.9` | RDS connection remains through `DATABASE_URL`; SST currently uses `sslmode=require`. |
| aws-sdk-s3 | `1.177.0` | Active Storage S3 access must work through the ECS task role in production. |
| Webpacker | gem `5.4.4`, npm `@rails/webpacker` `4.x`, Webpack `4.x` | Keep root Node `12.5.0` in the Docker image so asset precompile continues to work. |
| Sprockets | `sprockets-rails` `3.5.2` | Keep `RAILS_SERVE_STATIC_FILES=true` in ECS until CloudFront/static asset hosting is a separate phase. |
| Sentry | `5.28.1` gems | Carry `SENTRY_DSN`/environment secrets if production uses Sentry today. |

## Version Governance

1. **Pin SST intentionally.** Keep `sst` exactly `4.7.1` in `infra/package.json`. Do not change it with broad dependency updates. SST upgrades should be their own phase with `npm ci`, `npx sst install`, `npx sst diff`, staging deploy, migration task validation, and rollback notes.
2. **Let the infra lockfile govern transitive versions.** Use `npm ci`, not `npm install`, in CI and local validation for deploy parity.
3. **Keep root and infra Node worlds separate.** Root app uses Node `12.5.0` and Yarn `1.x`; infra uses Node `>=20` and npm. Do not run root Yarn commands from `infra/`, and do not introduce npm lockfiles at the repo root.
4. **Do not upgrade Rails, Webpacker, React, Flow, or root Node during migration hardening.** Those changes alter the asset build and frontend runtime. Treat them as post-cutover modernization work.
5. **Do not change database major versions casually.** PostgreSQL `16.4` is used by Docker and SST. Any RDS major/minor change should include structure load, migration, search index refresh, and app smoke tests.
6. **Keep Redis protocol compatibility.** Valkey is acceptable only because it is Redis-protocol compatible for the current usage. Do not remove Redis/Valkey until Solid Queue/Solid Cable/cache alternatives are separately designed and measured.

## Secrets And Environment

### Required SST Secrets

Keep these as per-stage SST secrets:

| Secret | Required For | Evidence |
|--------|--------------|----------|
| `RAILS_MASTER_KEY` | Rails encrypted credentials | `infra/sst.config.ts`, `app.json` |
| `SECRET_KEY_BASE` | Rails production boot/session signing | `infra/sst.config.ts`, `app.json` |
| `LTI_KEY` | LTI launches | `infra/sst.config.ts`, `app.json` |
| `LTI_SECRET` | LTI launches | `infra/sst.config.ts`, `app.json` |
| `MAPBOX_ACCESS_TOKEN` | Map UI and stats maps | `infra/sst.config.ts`, `.planning/codebase/INTEGRATIONS.md` |
| `SES_SMTP_USERNAME` | SES SMTP outbound mail | `infra/sst.config.ts`, `config/environments/production.rb` |
| `SES_SMTP_PASSWORD` | SES SMTP outbound mail | `infra/sst.config.ts`, `config/environments/production.rb` |

### Add Before Full Production Parity If Used

The migration plan and codebase map identify these as production integration secrets, but the current SST config does not declare them. Add only if the current Heroku production app relies on them:

| Secret | Why |
|--------|-----|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth provider configured in Devise. |
| `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` | Facebook OmniAuth config exists, though current strategy exposure may be limited. |
| `SENTRY_DSN` | Rails, Sidekiq, and browser error reporting. |
| `SENTRY_ENVIRONMENT`, `SENTRY_TRACES_SAMPLE_RATE`, `SENTRY_PROFILES_SAMPLE_RATE` | Optional Sentry environment and sampling controls. |

### Environment Values To Preserve

| Env Var | Recommended Value/Source |
|---------|--------------------------|
| `RAILS_ENV` | `production` in ECS services/tasks |
| `NODE_ENV` | `production` in ECS image/runtime |
| `PORT` | `3000` |
| `BASE_URL` | `https://www.learngala.com` for production, `https://staging.learngala.com` for staging |
| `DATABASE_URL` | SST-generated RDS URL with SSL required |
| `REDIS_URL` | SST-generated `rediss://...` Valkey URL |
| `RAILS_LOG_TO_STDOUT` | `true` |
| `RAILS_SERVE_STATIC_FILES` | `true` until static asset serving is redesigned |
| `RAILS_MAX_THREADS` | current SST value `3` |
| `WEB_CONCURRENCY` | production `2`, staging `1` |
| `SIDEKIQ_CONCURRENCY` | production `5`, staging `3` |
| `S3_BUCKET` | `msc-gala` |
| `AWS_REGION` | `us-west-2` |
| `COMMIT_SHA` | GitHub SHA when deploying from Actions |

## Immediate Stack Hardening Priorities

1. **Health checks:** add/finalize a lightweight Rails health endpoint and switch ALB and container health checks from `/` to that path. Current `infra/sst.config.ts` explicitly notes this is still pending.
2. **S3 credentials:** update Active Storage production config so ECS can use task role credentials. `config/storage.yml` currently names `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`; the stack direction should be IAM task roles in ECS, not static AWS keys.
3. **Secret parity:** compare Heroku config vars to SST secrets per stage and add missing OAuth/Sentry/feature secrets before staging parity testing.
4. **Scheduled task parity:** keep `GalaRefreshIndices` and `GalaWeeklyReport` as ECS tasks. Production schedules should stay production-only unless staging validation needs temporary manual runs.
5. **Migration execution:** use the SST `GalaMigrate` task for schema migrations. Do not keep Heroku `postdeploy` semantics as the AWS deployment model.
6. **Observability basics:** rely on CloudWatch Logs plus existing Sentry first. Add log retention, alarms, and cost checks as hardening, not a new observability platform.
7. **DNS/cutover safety:** keep `staging.learngala.com` and `www.learngala.com` as the stage domains encoded in SST. Production removal must remain blocked in CI and retained in SST.

## Alternatives Rejected

| Category | Recommended | Do Not Use For Phase 1 | Why Not |
|----------|-------------|------------------------|---------|
| Web hosting | ECS Fargate | Lambda/Rails serverless | The app is a long-running Rails monolith with Puma, WebSockets, native dependencies, assets, and Sidekiq. Lambda would force architectural changes. |
| Compute management | Fargate | ECS on EC2 | EC2 may save some compute cost later, but adds AMI, host patching, scaling, and capacity-provider ownership before cutover. |
| Queue/cache/cable | Valkey/Redis protocol | Solid Queue/Solid Cable/Postgres cache replacement | Worth evaluating after AWS production is stable, but coupling it to hosting migration increases risk. |
| Database | RDS PostgreSQL `16.4` | Aurora, DynamoDB, non-Postgres stores | Existing app is ActiveRecord/Postgres with SQL schema and materialized search indexes. |
| Network cost model | Public ECS tasks, private RDS/cache, no NAT gateway by default | NAT Gateway as a default dependency | The migration goal emphasizes lower recurring cost; NAT can dominate small-stack cost. Add only when a concrete private-egress need exists. |
| Infra tooling | SST v4 package in `infra/` | Terraform/CDK/Pulumi parallel stack | The repo already has SST resources and GitHub deployment workflow. A second IaC system would duplicate ownership. |
| Package manager | npm in `infra/` | Yarn/pnpm in `infra/` | CI and lockfile are npm-based. Root Yarn is for the Rails frontend only. |
| Root JS | Node `12.5.0`, Yarn `1.x` | Node 20 root upgrade | Root Node upgrade touches Webpacker, Babel, Flow, node-sass, Jest, and asset precompile risk. |
| Region | `us-west-2` | `us-east-1` or multi-region | S3 and SES assumptions are already `us-west-2`; cross-region media/mail adds complexity. |
| Mail | SES SMTP | Postfix container | SES is already configured and managed. Running mail infrastructure adds avoidable operational burden. |

## Installation And Operations Commands

Use these as the canonical infra commands:

```bash
cd infra
npm ci
npx sst install
npx sst diff --stage staging
npx sst deploy --stage staging
npx sst deploy --stage production
npx sst remove --stage staging
```

Use GitHub Actions as the production deployment interface where possible:

```text
.github/workflows/deploy.yml
workflow_dispatch:
  stage: staging | production
  action: deploy | remove
```

Do not run `sst remove --stage production` from CI. The workflow blocks it, and `infra/sst.config.ts` sets production removal to `retain`.

## Roadmap Implications

Recommended stack-related phase order:

1. **Health and IAM parity** - add the dedicated health endpoint, switch SST health checks, and remove production dependence on static S3 access keys.
2. **Secret and deploy hardening** - complete per-stage SST secrets, verify GitHub OIDC account/role/region, keep production removal retained, and document manual task execution.
3. **Staging validation** - deploy staging with the current stack, run migrations, uploads, Action Cable, Sidekiq, scheduled tasks, mail, assets, and diagnostics checks.
4. **Data migration and cutover** - perform Heroku Postgres to RDS migration, refresh indexes, validate production tasks, then move DNS.
5. **Post-cutover simplification research** - only after stable AWS operation, evaluate Solid Queue/Solid Cable/cache simplification, Redis removal, CloudFront, multi-AZ, and root Node/frontend modernization.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Tooling boundaries | HIGH | Directly evidenced by `AGENTS.md`, `infra/package.json`, root `package.json`, Dockerfile, and CI. |
| AWS service selection | HIGH | Current SST config and migration plan agree on Fargate, RDS, Valkey, ALB, S3, SES, EventBridge, Route 53, ACM, and CloudWatch. |
| Version constraints | HIGH | Versions are pinned in lockfiles/config and already reflected in the codebase stack map. |
| Runtime sizing | MEDIUM | Current CPU/memory choices are encoded in SST and cost plan, but production behavior still needs staging/load validation. |
| Valkey compatibility | MEDIUM | App usage is Redis-protocol based and likely compatible, but staging must validate Sidekiq, Action Cable, cache, TLS, reconnect behavior, and failure modes. |
| S3 IAM-only Active Storage | MEDIUM | SST attaches task role policies, but Rails storage config still references static AWS env vars. Requires app/config validation. |
| Missing secret list | MEDIUM | Repo identifies likely OAuth/Sentry env vars; final list must be compared against current Heroku config. |

## Sources

- `.planning/PROJECT.md` - milestone scope, active requirements, constraints, and out-of-scope modernization work.
- `.planning/codebase/STACK.md` - existing app/runtime/framework/dependency inventory.
- `.planning/codebase/ARCHITECTURE.md` - process model, infra layer, background jobs, Action Cable, and data flow.
- `.planning/codebase/INTEGRATIONS.md` - AWS, S3, SES, OAuth, Sentry, Redis, and deployment integration map.
- `docs/aws-sst-migration-plan.md` - target AWS architecture, tradeoffs, cost model, and required pre-cutover changes.
- `infra/package.json` and `infra/package-lock.json` - SST, TypeScript, Node, npm, and lockfile constraints.
- `infra/sst.config.ts` - live SST resource definitions, environment, secrets, domain names, schedules, IAM media access, and production retention.
- `.github/workflows/deploy.yml` - GitHub OIDC deploy flow, Node 20 setup, npm install, SST install/deploy/remove, and production removal guard.
- `AGENTS.md` - repo-specific tooling boundaries and deployment instructions.
- `Dockerfile`, `Procfile`, `docker-compose.yml`, `config/storage.yml`, `config/environments/production.rb`, `config/database.yml`, `config/cable.yml`, `config/initializers/sidekiq.rb`, `config/puma.rb`, `app.json`, `package.json`, `Gemfile.lock` - runtime evidence for the recommendations above.

## Research Gaps

- Network documentation lookup was not used in this pass because the user constrained research to local repo evidence and noted that search may be unavailable. Before changing SST component APIs or upgrading SST, validate against current SST v4 docs.
- Current Heroku production config vars were not available locally. Secret parity must be verified against Heroku before cutover.
- AWS account-level state was not inspected. OIDC trust policy, Route 53 hosted zone, ACM validation, SES identity/mailbox setup, S3 bucket policy/CORS, and RDS/Valkey deployed state need environment validation.
