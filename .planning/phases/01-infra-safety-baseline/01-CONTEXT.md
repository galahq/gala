# Phase 1: Infra Safety Baseline - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 makes the AWS/SST deployment baseline safe enough for staging runtime testing. It covers the lightweight health endpoint, SST health-check wiring, deploy workflow guardrails, required secret and environment inventory, root-vs-infra tooling boundaries, production image build validation, and IAM-first S3 credential design.

This phase does not deploy or validate full staging runtime parity. It prepares the app and infrastructure so Phase 2 can run meaningful staging checks without being blocked by health flapping, missing secrets, mixed toolchains, broken production image builds, or ambiguous S3 credentials.

</domain>

<decisions>
## Implementation Decisions

### Health Endpoint And Health Checks
- **D-01:** Use a shallow, unauthenticated Rails health endpoint such as `GET /up` for infrastructure liveness. It should return a fast 200 response without rendering the catalog root, requiring authentication, hitting Redis, sending external requests, or depending on expensive app workflows.
- **D-02:** Wire both ALB target health and ECS container health to the same dedicated health endpoint in `infra/sst.config.ts`. The current `/` health check is explicitly temporary and should be removed in this phase.
- **D-03:** Keep deeper diagnostics separate from liveness. Existing `GET /runtime/stats` remains editor-only operational diagnostics and must not become the ALB/ECS health check.
- **D-04:** Prefer a small dedicated controller/action or route-level response that follows existing Rails conventions. Avoid introducing a new health-check gem unless the planner finds a compelling reason.

### Secrets And Runtime Environment
- **D-05:** Treat Heroku production config vars as the source inventory to compare against SST secrets, but do not write secret values into planning docs or commits.
- **D-06:** Classify secrets as boot-critical, feature-critical, or optional diagnostics. Boot-critical and feature-critical values needed for Phase 2 staging parity should be declared and injected through SST before staging validation.
- **D-07:** Keep one shared runtime environment shape for web, worker, migration, search refresh, and weekly report tasks unless a difference is intentionally documented. This matches the current `sharedEnvironment` pattern in `infra/sst.config.ts`.
- **D-08:** Include currently declared SST secrets (`RAILS_MASTER_KEY`, `SECRET_KEY_BASE`, `LTI_KEY`, `LTI_SECRET`, `MAPBOX_ACCESS_TOKEN`, `SES_SMTP_USERNAME`, `SES_SMTP_PASSWORD`) and verify whether production-used OAuth/Sentry values also need SST declarations before Phase 2.

### S3 Identity And Media Boundary
- **D-09:** Prefer ECS task-role credentials for Active Storage S3 access in AWS. Static `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` should not be required in ECS runtime for the `amazon` storage service.
- **D-10:** Planner should explicitly investigate the safest Rails `config/storage.yml` shape for allowing the AWS SDK credential provider chain to use ECS task roles. The current config hardcodes `access_key_id` and `secret_access_key` from env vars, which may pass blank credentials instead of using role credentials.
- **D-11:** Keep the phase focused on credential-path design and S3 IAM policy correctness. Full upload/read/delete/purge validation belongs to Phase 2.
- **D-12:** Document, but do not necessarily solve in Phase 1, the staging media boundary: whether staging writes to `msc-gala`, uses a stage prefix, or later gets a separate staging bucket.

### Deploy And Build Guardrails
- **D-13:** Preserve the current GitHub Actions deployment controls: explicit `staging`/`production` stage selection, deploy/remove action selection, AWS OIDC, and production removal refusal.
- **D-14:** Preserve SST production resource retention through `removal: input?.stage === "production" ? "retain" : "remove"`.
- **D-15:** Keep `infra/` isolated on Node >=20, npm, SST, TypeScript, and `infra/package-lock.json`. Do not mix root Yarn/Node 12 workflows into `infra/`.
- **D-16:** Keep the Rails app root pinned to Ruby 3.2.9, Bundler 2.4.19, Node 12.5.0, and Yarn 1.x for this phase. Do not fold frontend/toolchain modernization into the infra baseline.
- **D-17:** Validate the production Docker image and asset precompile path using the existing Dockerfile behavior. This phase may add documentation or a focused preflight command, but it should not refactor the Dockerfile beyond what is needed for the health/storage/deploy guardrails.

### the agent's Discretion
- The planner may choose exact health controller naming, route syntax, test placement, and response body as long as the endpoint is shallow, unauthenticated, fast, and stable.
- The planner may decide whether secret parity is best captured as a markdown checklist, a script/check, or both, as long as no secret values are committed.
- The planner may choose the narrowest verification commands for Phase 1; full AWS staging behavior validation is intentionally Phase 2.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Scope And Requirements
- `.planning/PROJECT.md` — Core value, constraints, active requirements, and out-of-scope decisions for the migration.
- `.planning/REQUIREMENTS.md` — Phase 1 requirements: health/deploy guardrails, secrets/environment, and S3/AWS identity.
- `.planning/ROADMAP.md` — Phase boundary, success criteria, planned Phase 1 plan split, and canonical refs.
- `.planning/STATE.md` — Current project position and active blockers/concerns.

### Research
- `.planning/research/SUMMARY.md` — Roadmap implications, recommended stack, table-stakes capabilities, and top risks.
- `.planning/research/STACK.md` — Version/tooling constraints and stack decisions.
- `.planning/research/FEATURES.md` — Table-stakes migration capabilities and deferred anti-features.
- `.planning/research/ARCHITECTURE.md` — Deployment architecture, component boundaries, and dependency-driven build order.
- `.planning/research/PITFALLS.md` — Health-check, S3 credential, secret parity, cutover, Redis, scheduler, and image-build risks.

### Existing Repo And Infra
- `docs/aws-sst-migration-plan.md` — Migration goal, target AWS architecture, cost assumptions, required app changes, and phase plan.
- `infra/sst.config.ts` — Existing SST resources, health checks, secrets, shared env, ECS services/tasks, schedules, and S3 IAM policies.
- `.github/workflows/deploy.yml` — Manual AWS deploy/remove workflow, OIDC role, stage/action inputs, and production removal guard.
- `config/routes.rb` — Current Rails route map, root route, `runtime/stats`, Sidekiq mount, and absence of a dedicated health endpoint.
- `config/storage.yml` — Active Storage S3 service currently reading static AWS credential env vars.
- `config/environments/production.rb` — Production `BASE_URL`, Action Cable, Active Storage, Redis cache, SES SMTP, Action Mailbox, SSL, and asset behavior.
- `config/cable.yml` — Redis-backed Action Cable configuration.
- `config/initializers/sidekiq.rb` — Redis URL and TLS settings used by Sidekiq client/server.
- `Dockerfile` — Production image build, pinned Ruby/Node/Yarn/Bundler tooling, and asset precompile behavior.
- `AGENTS.md` — Repo-specific stack boundaries, version pins, commands, verification order, and infra deploy guidance.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/controllers/runtime_controller.rb`: Existing editor-only diagnostics endpoint for process, cache, Redis, Postgres, Sidekiq, and Action Cable data. Useful for Phase 2 staging diagnostics, but too heavy and authenticated for health checks.
- `config/routes.rb`: Central place to add the shallow health route. Current routes include `root to: 'catalog#home'` and `get 'runtime/stats'`, but no dedicated `/up`.
- `infra/sst.config.ts`: Existing SST service definitions already have comments marking `/` health checks as temporary and share environment across web, worker, and tasks.
- `.github/workflows/deploy.yml`: Existing workflow already has stage/action inputs, OIDC, Node 20 setup, `npm ci`, `npx sst install`, production remove refusal, and deploy/remove commands.
- `Dockerfile`: Existing production image path already installs root app dependencies and runs `rails assets:precompile` when `RAILS_ENV != development`.

### Established Patterns
- Rails routes and controllers use snake_case files, frozen string literal comments, and conventional controller actions.
- Production runtime behavior is environment-driven through `BASE_URL`, `DATABASE_URL`, `REDIS_URL`, Rails secrets, S3 bucket/env, SES credentials, concurrency values, and static asset flags.
- SST infrastructure centralizes shared runtime env in `sharedEnvironment` and reuses the same Docker image for web, worker, migration, search refresh, and weekly report tasks.
- The repo deliberately separates root app tooling from `infra/` tooling: root uses Yarn 1 and Node 12.5.0; `infra/` uses npm and Node >=20.

### Integration Points
- Health route integrates through `config/routes.rb` and `infra/sst.config.ts` web service `loadBalancer.health` plus container `health.command`.
- Secret parity integrates through SST `new sst.Secret(...)` declarations, `sharedEnvironment`, GitHub deploy docs/checks, and deployment runbooks.
- S3 IAM work integrates through `config/storage.yml`, `config/environments/production.rb`, SST task roles, and the `Gala*MediaAccess` policies.
- Image-build guardrails integrate through `Dockerfile`, root package/gem lockfiles, and `infra/` deploy commands.

</code_context>

<specifics>
## Specific Ideas

- Health endpoint should be boring: a stable 200 for process liveness, not a replacement for `/runtime/stats`.
- Secret parity should record names, classification, source, and stage readiness without values.
- S3 credential work should explicitly prove or patch Rails behavior around missing `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`.
- Phase 1 should leave staging end-to-end behavior checks for Phase 2 and avoid turning the safety baseline into a full staging migration.

</specifics>

<deferred>
## Deferred Ideas

- Full staging deploy, upload, mail, Action Cable, Sidekiq, scheduled task, and search validation — Phase 2.
- Heroku-to-RDS data migration rehearsal and rollback proof — Phase 3.
- Production DNS/callback cutover and smoke tests — Phase 4.
- Redis removal, Solid Queue, Solid Cable, CloudFront, multi-AZ, root Node/Webpacker modernization, and broader operational optimization — Phase 5 or later milestones.

</deferred>

---

*Phase: 01-infra-safety-baseline*
*Context gathered: 2026-04-23*
