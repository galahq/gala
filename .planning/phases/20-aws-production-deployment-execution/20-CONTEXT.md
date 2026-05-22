# Phase 20: AWS Production Deployment Execution - Context

**Gathered:** 2026-05-22
**Status:** Ready for replanning

<domain>
## Phase Boundary

Phase 20 prepares and verifies an isolated AWS runtime for Gala through SST and the GitHub Actions deploy workflow. The goal is to prove the maintained and upgraded app can boot and run in AWS after security patches, library upgrades, and maintenance work. This is prep work for a later cutover test, not a DNS cutover or mutation of current Heroku production.

</domain>

<decisions>
## Implementation Decisions

### Deployment Intent
- **D-01:** The AWS environment is an isolated cutover-prep environment. It must get the app up and running for validation after maintenance work, not replace current production yet.
- **D-02:** `https://www.learngala.com` remains hosted by the current Heroku app throughout this phase. No Heroku release, config mutation, restart, DNS change, or destructive Heroku action is in scope.
- **D-03:** The AWS app is tested through the generated AWS ALB URL. Any DNS cutover or production hostname move belongs to a later phase.

### Database Initialization
- **D-04:** The new AWS environment must initialize its database from `db/sqldump/seed.dump`.
- **D-05:** `db/sqldump/seed.dump` is the corrected and authoritative pg dump path for this phase.
- **D-06:** Database initialization must target only the freshly provisioned SST/AWS database connection. Heroku `DATABASE_URL` must not be copied, reused, or placed into AWS runtime config.

### Runtime Isolation
- **D-07:** AWS `DATABASE_URL` and Redis/cache connection strings must come from SST-provisioned AWS resources.
- **D-08:** Heroku database/cache values, including `DATABASE_URL`, `REDIS_HOST`, `REDIS_URL`, and equivalent connection strings, are explicitly excluded from secret sync.
- **D-09:** Existing ActiveStorage S3 objects should remain intact. S3 handling must be read/reference/additive only unless a separate destructive action is explicitly approved.

### Secret Reuse
- **D-10:** Heroku CLI may be used only as a read-only source against `heroku --app msc-gala` for retained non-database/non-cache secrets.
- **D-11:** Reusable secrets/config include AWS SES, Gmail/OAuth-related settings, S3-related credentials/config, Mapbox, LTI, Rails boot secrets, and observability keys when required for AWS runtime parity.
- **D-12:** Secret values must not be written into planning docs, repo files, or logs.

### Command Discipline
- **D-13:** Every AWS CLI or SST execution command in this phase must be prefixed with `AWS_PROFILE=gala AWS_REGION=us-west-2 SST_STAGE=production`.
- **D-14:** Every read-only Heroku CLI command must use the exact app-scoped command form `heroku --app msc-gala ...`.
- **D-15:** `production` is the locked SST stage value for Phase 20. Do not rename the execution stage.

### the agent's Discretion
- The planner may choose the exact implementation shape for running the restore, as long as downstream deploy commands clearly use `db/sqldump/seed.dump` and do not risk restoring into Heroku.
- The planner may decide how to pass `SST_STAGE=production` through GitHub Actions and local scripts, but the final execution commands must expose that stage explicitly.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Artifacts
- `.planning/ROADMAP.md` — Phase 20 is current; Phase 19 local script-first deployment is superseded context.
- `.planning/REQUIREMENTS.md` — DPLY-01 through DPLY-08 define AWS deployment safety requirements.
- `.planning/STATE.md` — Current state and active rules for Phase 20.
- `.planning/phases/20-aws-production-deployment-execution/20-AUDIT.md` — Audit findings and non-negotiable safety gates.
- `.planning/phases/20-aws-production-deployment-execution/20-01-PLAN.md` — Existing plan to be revised after this context.
- `.planning/phases/20-aws-production-deployment-execution/20-VALIDATION.md` — Validation gates to update and execute after replanning.

### Deployment and Infrastructure
- `.github/workflows/deploy.yml` — GitHub Actions entrypoint for SST deployment.
- `scripts/deploy-sst.sh` — Build, ECR push, and `npx sst deploy` helper used by the workflow.
- `infra/sst.config.ts` — SST resources, ECS services, ALB, RDS/Postgres, Redis/Valkey, S3, secrets, and outputs.
- `infra/package.json` — SST and infra npm commands.
- `docs/aws-sst-secret-inventory.md` — Value-free secret ownership inventory and generated-versus-copied config rules.
- `docs/aws-sst-migration-plan.md` — Earlier AWS migration context; use only where it does not conflict with Phase 20.
- `docs/aws-production-operator-runbook.md` — Earlier operator runbook; reconcile with Phase 20 before execution.

### Data and Runtime Config
- `db/sqldump/seed.dump` — Corrected authoritative pg dump path for AWS database initialization.
- `config/database.yml` — `DATABASE_URL` consumption by Rails.
- `config/cable.yml` — Redis/Action Cable runtime connection behavior.
- `config/initializers/sidekiq.rb` — Sidekiq Redis URL behavior.
- `config/storage.yml` — ActiveStorage S3 service configuration.
- `config/environments/production.rb` — production runtime behavior for URLs, storage, mail, cache, and static files.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.github/workflows/deploy.yml`: manual workflow dispatch already selects branch, stage, and action; it refuses production removal and configures AWS OIDC.
- `scripts/deploy-sst.sh`: existing helper builds the Docker image, pushes immutable and `latest` tags to ECR, and runs `npx sst deploy`.
- `infra/sst.config.ts`: already provisions ECS web/worker, SST Postgres, SST Redis/Valkey, ALB health checks, S3 buckets, Secrets Manager references, scheduled tasks, and production removal retention.
- `docs/aws-sst-secret-inventory.md`: already distinguishes generated SST values from copied secrets and warns not to manually store `DATABASE_URL` or `REDIS_URL`.

### Established Patterns
- Rails production reads `DATABASE_URL` and `REDIS_URL` from environment, so isolation depends on SST runtime env ownership rather than code-level database branching.
- ActiveStorage production storage is S3-backed through `S3_BUCKET`; retained bucket access should be controlled by task role policy and non-destructive S3 behavior.
- The app has `/up` health checks wired into routes and SST service health checks.
- Infrastructure dependencies live under `infra/` with npm, while root application JavaScript uses pnpm after v1.1 package-manager work.

### Integration Points
- GitHub Actions deploy path: `.github/workflows/deploy.yml` -> `scripts/deploy-sst.sh` -> `infra/sst.config.ts`.
- Database initialization must be added to the SST deployment/runbook path without exposing or reusing Heroku database URLs.
- ALB output handling in `infra/sst.config.ts` currently needs attention because production fallback still points to `https://localhost:3000`; replanning should make generated ALB URL validation first-class.
- Secret hydration must be filtered before AWS runtime config is written so Heroku database/cache values cannot enter AWS.
- The current GitHub workflow and deploy helper use `production` as an SST stage option; Phase 20 execution should keep `SST_STAGE=production`.

</code_context>

<specifics>
## Specific Ideas

- The user specifically described this as prep work to test a future cutover, not the cutover itself.
- The AWS environment should demonstrate that the app still runs after security patches, library upgrades, and maintenance work.
- The database initialization source should be `db/sqldump/seed.dump`.
- Command examples and scripts must show AWS/SST execution under `AWS_PROFILE=gala AWS_REGION=us-west-2 SST_STAGE=production`.
- Read-only Heroku examples must use `heroku --app msc-gala`.

</specifics>

<deferred>
## Deferred Ideas

- DNS cutover from Heroku production to AWS is deferred to a later explicitly approved phase.
- Any destructive S3 migration, Heroku production mutation, or production hostname move is deferred.

</deferred>

---

*Phase: 20-aws-production-deployment-execution*
*Context gathered: 2026-05-22*
