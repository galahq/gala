# Roadmap: Gala

## Milestones

- Shipped: **v1.0 Upgrade Stabilization** — route-driven Ruby, Node.js, Shakapacker/Webpacker, and BlueprintJS upgrade stabilization. See `.planning/milestones/v1.0-ROADMAP.md`.
- Active: **v1.1 Dependency Modernization, Test Coverage, and AWS Deployment** — pnpm migration, compatible dependency modernization, Flow removal, Vitest/Vite evaluation, frontend test repair, Playwright visual regression coverage, and non-disruptive AWS deployment through SST.

## Active Work

### Phase 10: Dependency Target Baseline

- [x] Phase 10: Complete (2026-05-12)

**Goal:** Establish exact dependency targets, compatibility holds, and verification policy before changing lockfiles.

**Requirements:** DEPS-01, DEPS-02, DEPS-03, DEPS-04

**Success Criteria:**
1. Current official registry/doc checks are captured for Ruby, Rails, pnpm, TypeScript, Vitest/Vite, Playwright, Shakapacker/Webpack, and key runtime gems.
2. React 16.8 and BlueprintJS 4.x holds are explicitly documented as v1.1 constraints.
3. Dependency holdbacks below latest are recorded with compatibility reasons.
4. The phase produces a target matrix that later phases can execute against.

### Phase 11: pnpm Package Manager Migration

- [x] Phase 11: Complete (2026-05-12)

**Goal:** Replace Yarn 1 with pnpm while preserving install, build, and test parity.

**Requirements:** PNPM-01, PNPM-02, PNPM-03, PNPM-04, PNPM-05

**Success Criteria:**
1. `package.json` declares a pinned pnpm package manager compatible with Node 24.
2. `pnpm-lock.yaml` is generated and committed only after install/build/test parity is proven.
3. Yarn-specific scripts, docs, and lockfile assumptions are removed or replaced.
4. Existing JavaScript build and test commands run through pnpm.

**Plans:** 2 plans

Plans:
**Wave 1**
- [x] 11-01-PLAN.md — Pin pnpm metadata, generate `pnpm-lock.yaml`, and prove install/build/test parity before removing `yarn.lock`.

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 11-02-PLAN.md — Replace Docker, Semaphore, README/docs, bin, and asset-comment Yarn assumptions with pnpm equivalents.

### Phase 12: Vitest and Vite Feasibility

- [x] Phase 12: Complete (2026-05-12)

**Goal:** Decide how far v1.1 should move toward Vitest and Vite before committing to implementation.

**Requirements:** VITE-01, VITE-04, VITE-05, VITE-06

**Success Criteria:**
1. A focused Vitest spike proves whether representative existing tests can run without excessive compatibility shims.
2. A focused Vite build spike tests Rails entrypoints, CSS imports, static assets, and Blueprint compatibility layers.
3. The roadmap decision is documented: Vitest path, Jest fallback, Vite build replacement, or Shakapacker/Webpack retention.
4. Vite production build replacement proceeds only if route, build, and asset compatibility evidence is strong.

**Plans:** 1 plan

Plans:
**Wave 1**
- [x] 12-01-PLAN.md — Run bounded Vitest and Vite feasibility spikes, document blockers, and preserve Shakapacker/Webpack as the production bundler for v1.1.

### Phase 13: Flow Removal and TypeScript/JSDoc Foundation

- [x] Phase 13: Complete (2026-05-12)

**Goal:** Remove Flow from the active frontend toolchain and establish the modern typing path.

**Requirements:** TYPE-01, TYPE-02, TYPE-03, TYPE-04, TYPE-05, TYPE-06

**Success Criteria:**
1. Flow-specific dependencies and config are removed after source parsing no longer needs Flow.
2. `@flow`, `@noflow`, Flow annotations, and `$FlowFixMe` usage are removed or converted.
3. TypeScript is configured as the forward type-system target.
4. JSDoc is used where plain JavaScript is the lower-risk migration path.
5. Broad replacement ignores are avoided or documented with a specific migration reason.

**Plans:** 1 plan

Plans:
**Wave 1**
- [x] 13-01-PLAN.md — Remove Flow tooling and source annotations, then add TypeScript/JSDoc baseline.

### Phase 14: Ruby Dependency Modernization

- [x] Phase 14: Complete (2026-05-12)

**Goal:** Modernize compatible Ruby gems in small, verified groups.

**Requirements:** RUBY-01, RUBY-02, RUBY-03, RUBY-04, QA-03

**Success Criteria:**
1. Gem constraints are audited against current stable compatible releases.
2. Runtime gem updates are applied in small groups with boot and targeted test gates.
3. Development/test gem updates run targeted RSpec or unit gates.
4. Major runtime jumps, such as Puma or Sidekiq, receive separate verification notes.

**Plans:** 2 plans

Plans:
**Wave 1**
- [x] 14-01-PLAN.md — Update compatible runtime Ruby gems.

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 14-02-PLAN.md — Update compatible development and test Ruby gems.

### Phase 15: JavaScript Dependency and Build Modernization

- [x] Phase 15: Complete (2026-05-30)

**Goal:** Modernize compatible JavaScript dependencies while preserving React, BlueprintJS, Shakapacker, and route behavior constraints.

**Requirements:** JS-01, JS-02, JS-03, JS-04

**Success Criteria:**
1. JavaScript dependencies are audited against current stable compatible releases.
2. Shakapacker Ruby and npm package versions remain aligned.
3. Webpack/Shakapacker production behavior is preserved unless Phase 12 explicitly approved Vite replacement.
4. v1.0 Blueprint compatibility layers remain intact and verified after dependency changes.

**Plans:** 1 plan

Plans:
**Wave 1**
- [x] 15-01-PLAN.md — Apply one conservative JavaScript dependency batch and verify install, frontend tests, and Docker asset precompile.

### Phase 16: Frontend Test Runner Modernization

- [x] Phase 16: Complete (2026-06-01)

**Goal:** Restore a reliable pnpm-backed frontend test command, preferably with Vitest.

**Requirements:** VITE-02, VITE-03, TEST-01, TEST-02, TEST-03, TEST-04, QA-04

**Success Criteria:**
1. The selected frontend test runner has a single pnpm-backed command.
2. If Phase 12 proved Vitest feasible, the frontend test scripts use Vitest.
3. If Vitest was not feasible, the Jest fallback path is documented and implemented.
4. Representative existing frontend tests pass under the selected runner.
5. React 16 test environment and modern package transforms are covered by runner config.

### Phase 17: Playwright Visual Regression Coverage

- [x] Phase 17: Complete (baseline harness, 2026-06-01)

**Goal:** Add durable Playwright visual regression coverage for high-value deterministic routes.

**Requirements:** VIS-01, VIS-02, VIS-03, VIS-04, VIS-05, VIS-06, QA-01, QA-02

**Success Criteria:**
1. Playwright Test is configured as the visual regression runner with pnpm-backed commands.
2. Initial visual specs cover high-value routes derived from `config/routes.rb`.
3. Screenshot baselines are committed and updated only through an explicit update command.
4. Volatile rendering is stabilized with viewports, masks, disabled animations, or style overrides.
5. Browser console and network errors are classified before route-facing visual coverage is accepted.

### Phase 18: Final Verification and Cleanup

- [x] Phase 18: Complete (2026-06-01)

**Goal:** Prove v1.1 is coherent end to end and remove leftover Yarn/Flow/test-runner assumptions.

**Requirements:** QA-05

**Success Criteria:**
1. Final Ruby boot/test checks pass or have documented, scoped exceptions.
2. Final JavaScript install/build/test checks pass through pnpm.
3. Selected visual regression checks pass against committed baselines.
4. Documentation and scripts no longer point developers to Yarn or Flow workflows.

### Phase 19: Production Deployment to AWS (no-vpc first)

- [x] Phase 19: Superseded by Phase 20 audit

**Goal:** Preserve the earlier AWS deployment planning context while treating Phase 20 as the current executable deployment plan. The previous local script-first deployment route is superseded by SST IaC through `.github/workflows/deploy.yml`.

**Requirements:** deployment-only planning requirements for migration safety, rollout, and rollback readiness

**Success Criteria:**
1. Earlier deployment research remains available as context for Phase 20.
2. Local script-first deployment is not accepted as the Phase 20 production deploy boundary.
3. SST, GitHub Actions, generated ALB URL testing, fresh AWS database/cache ownership, and non-destructive resource import are handled in Phase 20.

**Plans:** 1 plan

Plans:
**Wave 1**
- [x] 19-01-PLAN.md — Superseded planning context; do not execute ahead of Phase 20 without reconciling against the SST/deploy.yml deployment boundary.

### Phase 20: Production Deployment Execution (AWS)

- [x] Phase 20: Complete (2026-05-23)

**Goal:** Execute and verify the AWS production deployment path through SST IaC in `.github/workflows/deploy.yml` without mutating current Heroku production at `https://www.learngala.com`, using the generated AWS ALB URL as the test entrypoint, freshly provisioned AWS database/cache connections, database initialization from `db/sqldump/seed.dump`, and non-destructive reuse/import of existing AWS resources.

**Requirements:** DPLY-01, DPLY-02, DPLY-03, DPLY-04, DPLY-05, DPLY-06, DPLY-07, DPLY-08, DPLY-09

**Success Criteria:**
1. `.github/workflows/deploy.yml` runs the approved SST deploy path for the target stage and refuses destructive production actions.
2. SST imports or references existing AWS resources where required, including S3/ActiveStorage, SES/Gmail-related credentials, and any pre-existing resource that must be retained.
3. The AWS runtime uses SST-provisioned `DATABASE_URL` and `REDIS_URL`/cache output, never Heroku production `DATABASE_URL` or Redis connection strings.
4. The AWS database is initialized from `db/sqldump/seed.dump`.
5. The deployed app is validated through the generated AWS ALB URL; `https://www.learngala.com` remains hosted on Heroku until a separate DNS cutover is approved.
6. Heroku `msc-gala` secrets are read only through Heroku CLI, copied only for retained non-database/non-Redis keys, and never used for destructive Heroku commands.
7. ActiveStorage S3 objects remain intact; any bucket import/sync is additive and avoids delete, overwrite, lifecycle, or public-access mutations unless separately approved.
8. Rollback procedure is documented and verified using prior ECS/SST deployment state without changing Heroku production.
9. All AWS/SST execution commands use `AWS_PROFILE=gala AWS_REGION=us-west-2 SST_STAGE=production`; all read-only Heroku commands use `heroku --app msc-gala`.

**Plans:** 1 plan

Plans:
**Wave 1**
- [x] 20-01-PLAN.md — Execute AWS deployment through SST/deploy.yml: resource import safety, ALB URL validation, database initialization from `db/sqldump/seed.dump`, Heroku read-only secret sync excluding database/cache strings, and rollback.

### Phase 21: AWS Performance and Edge Cache Optimization

- [x] Phase 21: Complete (2026-05-30)

**Goal:** Reduce AWS catalog load latency without changing Heroku production, SES, or the retained `msc-gala` media bucket by adding safe CloudFront behavior for anonymous public catalog JSON, improving static asset cache headers, and giving the SST web runtime enough CPU and memory headroom for Puma concurrency.

**Requirements:** AWSPERF-01, AWSPERF-02, AWSPERF-03, AWSPERF-04, AWSPERF-05, AWSPERF-06

**Success Criteria:**
1. AWS IaC changes are isolated to `infra/sst.config.ts` and avoid S3 media bucket, SES, Heroku, and production DNS mutation.
2. CloudFront default app behavior remains pass-through/no-cache, with short TTL caching only for known anonymous public catalog JSON routes.
3. Static `/assets/*` and `/packs/*` upload and CloudFront responses set immutable browser cache headers for fingerprinted assets.
4. Public catalog JSON endpoints emit short public cache headers only for anonymous JSON requests and keep signed-in responses private.
5. The SST web service has higher production CPU/memory, and Puma is configured for multiple threads and production workers.
6. The rollout is verified with read-only `AWS_PROFILE=gala AWS_REGION=us-west-2` SST preview and targeted local syntax/test gates.

**Plans:** 1 plan

Plans:
**Wave 1**
- [x] 21-01-PLAN.md — Add safe app-edge CloudFront caching, static asset cache metadata, public catalog JSON cache headers, and Puma/SST runtime tuning.

### Phase 22: AWS Edge Cache Validation and Catalog Load Optimization

- [x] Phase 22: Complete (2026-05-30)

**Goal:** Validate the Phase 21 app CloudFront rollout in the live AWS environment, then make the smallest safe follow-up changes that improve anonymous root catalog load performance without moving production DNS, altering Heroku, changing SES, or changing the retained `msc-gala` ActiveStorage media bucket.

**Requirements:** AWSPERF-07, AWSPERF-08, AWSPERF-09, AWSPERF-10, AWSPERF-11

**Depends on:** Phase 21

**Success Criteria:**
1. The existing Phase 21 app CloudFront distribution is deployed and validated before adding broader edge changes.
2. Root and catalog cache behavior remains anonymous-only, with signed-in, cookie-bearing, query-specific, or personalized responses kept private or uncached.
3. Anonymous catalog JSON TTLs are increased only after confirming CloudFront cache hits and no personalized cache leakage.
4. Anonymous root catalog JavaScript avoids unnecessary private endpoint fetches that return 401s and add network/app load.
5. SST Router and CloudFront bucket routing are documented as viable for managed static assets but out of scope for the retained `msc-gala` ActiveStorage bucket in this phase.
6. All AWS validation commands use `AWS_PROFILE=gala AWS_REGION=us-west-2`, and the rollout remains deployable through the existing SST GitHub Action.

**Plans:** 1 plan

Plans:
**Wave 1**
- [x] 22-01-PLAN.md — Validate the live app CloudFront path, tune safe anonymous catalog cache TTLs, and remove anonymous private catalog fetch noise.

### Phase 23: Immutable Cloudflare DNS and preview deployment pipeline

- [x] Phase 23: Complete (validated by later Phase 30 guardrail checks, 2026-06-01)

**Goal:** Move the AWS deployment pipeline from generated ALB/CloudFront URL validation to SST-owned Cloudflare DNS for `learngala.dev` and preview subdomains, while making deploys release-ID based, S3 asset namespaces immutable, production releases transparent, and rollback/promotion idempotent.

**Requirements:** DPLYIMM-01, DPLYIMM-02, DPLYIMM-03, DPLYIMM-04, DPLYIMM-05, DPLYIMM-06, DPLYIMM-07, DPLYIMM-08, DPLYIMM-09

**Depends on:** Phase 22

**Success Criteria:**
1. `infra/sst.config.ts` defines the `learngala.dev` app CDN domain through the SST Cloudflare DNS adapter, with production owning the apex and wildcard alias and preview stages using exact branch subdomains.
2. `.github/workflows/deploy.yml` exposes only the approved five dispatch inputs and refuses non-contributor execution before secrets or AWS credentials are used.
3. Deploys derive `github_run_id.YYYYMMDDHHMMSS.shortsha` release IDs, upload assets under `releases/<stage>/<release_id>/`, retain only 10 release namespaces per stage, and inject release metadata into Rails.
4. Production deploys reuse the stage-specific app CDN and keep at most one active stage distribution by default; dormant app distributions are retained only as needed for rollback and cleaned according to the configured retention rules.
5. Preview deploys publish the live branch subdomain in a PR comment when possible, and production deploys create GitHub releases whose notes are commit lists.
6. `user_data` supports only explicitly hard-coded operations and rejects secret-looking values.
7. Cloudflare DNS, release, rollback, and secret expectations are reflected in `.planning/codebase/`, `docs/aws-sst-secret-inventory.md`, and repository safety files.

**Plans:** 1 plan

Plans:
**Wave 1**
- [x] 23-01-PLAN.md — Add SST Cloudflare DNS, immutable release asset namespaces, minimal deploy workflow inputs, release metadata, preview comments, and safety docs.

## Completed Milestones

<details>
<summary>v1.0 Upgrade Stabilization — shipped 2026-05-12</summary>

- Phase 1: Baseline Asset Gate — 3/3 plans complete
- Phase 2: Public and Utility Routes — 1/1 plan complete
- Phase 3: Catalog Routes — 1/1 plan complete
- Phase 4: Core Case Shell — 1/1 plan complete
- Phase 5: Nested Case Interactions — 4/4 plans complete
- Phase 6: Reader, Library, and Reading Lists — 3/3 plans complete
- Phase 7: Deployments and Integrations — 1/1 plan complete
- Phase 8: Admin and Operations — 2/2 plans complete
- Phase 9: Deslopification and Final Regression — 1/1 plan complete
- Phase 999.8: Follow-up — Phase 8 incomplete plans — 1/1 plan complete

Archive:
- `.planning/milestones/v1.0-ROADMAP.md`
- `.planning/milestones/v1.0-REQUIREMENTS.md`
- `.planning/milestones/v1.0-MILESTONE-AUDIT.md`
- `.planning/milestones/v1.0-phases/`

</details>

## Backlog

- **v1.2+**: React major upgrade.
- **v1.2+**: BlueprintJS major upgrade.
- **v1.2+**: Full Vite production build replacement if v1.1 only proves feasibility.
- **v1.2+**: Expand Playwright visual coverage to all v1.0 route groups.

## Coverage

- v1.1 requirements: 75
- Requirements mapped to phases: 75
- Unmapped requirements: 0

### Phase 24: Cut Gala production Docker image size with reusable base image and slimmer production Dockerfiles

- [x] Phase 24: Complete (closed by Phase 30 validation, 2026-06-01)

**Goal:** Reduce the AWS production/runtime Docker image footprint and deploy latency by separating development-only build needs from production runtime needs, introducing a reusable production base image, and ensuring web, worker, migration, and maintenance tasks reuse one app image instead of triggering duplicate SST Docker asset builds.

**Requirements:** IMG-01, IMG-02, IMG-03, IMG-04, IMG-05, IMG-06, IMG-07

**Depends on:** Phase 23

**Success Criteria:**
1. Production image design is split from development ergonomics: development images may keep broad tooling, but production images include only runtime libraries, app code, compiled assets, and gems required at runtime.
2. A reusable production base image strategy is documented and implemented so Ruby, system packages, runtime libraries, and stable toolchain layers stay cached across follow-up app image builds.
3. The production app image target is <= 1.5 GB in ECR/compressed registry size, with measured before/after evidence captured from local Docker and AWS ECR.
4. SST deploys build or reference one production app image per release and reuse it for web, worker, migration, and maintenance tasks rather than producing duplicated `sst-asset` images per task.
5. The Docker build context is reduced with a tighter `.dockerignore` and/or dedicated production Dockerfile context so `.git`, local build outputs, caches, and development-only artifacts do not enter production builds.
6. The Dockerfile follows current Rails/37signals-style production conventions where appropriate: multi-stage build, build-only Node/package tooling, `SECRET_KEY_BASE_DUMMY` asset compilation, Bootsnap precompile, jemalloc where useful, non-root runtime user, and optional Thruster evaluation without adding unnecessary runtime weight.
7. Validation is safe and non-destructive: no Heroku production mutation, no Heroku database/Redis reuse, no SES mutation, no retained `msc-gala` S3 media bucket mutation, and all AWS checks use `AWS_PROFILE=gala AWS_REGION=us-west-2` with `SST_STAGE=dev` unless a separate production deploy gate is explicitly approved.

**Plans:** 3/3 plans complete

Plans:
**Wave 1**
- [x] 24-01-PLAN.md — Production image size reduction and reusable base image.
- [x] 24-02-PLAN.md — Single app image reuse for SST web, worker, migration, and maintenance tasks.
- [x] 24-03-SUMMARY.md — Test-harness and request-cache follow-up handoff for `/cases/:slug`, deterministic test DB targeting, and continuation after Phase 24.

### Phase 25: Audit Docker architecture and GitHub Actions operator guardrails for secure reliable platform operations

- [x] Phase 25: Complete (2026-06-01)

**Goal:** Research and audit whether the production Dockerfile/image architecture, SST task model, and GitHub Actions workflows align with the repository's safety guardrails, then define a secure, reliable operator-run platform workflow manual for CODEOWNER-held operations.
**Requirements**: TBD
**Depends on:** Phase 24
**Success Criteria:**
1. The Dockerfile, reusable base image, app image, migration task, worker task, and one-off maintenance task architecture are audited against the intended safety guardrails: least privilege, reproducibility, no accidental Heroku production mutation, explicit AWS stage/profile targeting, deterministic artifact selection, and rollback readiness.
2. Core GitHub Actions workflows are documented and/or specified as `workflow_dispatch` operator jobs with explicit dry-run-first behavior, verification gates, validation outputs, and side-effect summaries before any mutating production action.
3. The operator workflow set covers feature-branch dev deploys, PR merge-to-base behavior, production promotion, migrations, one-off scripts in AWS, rollback to a prior task/image/artifact, `Rails.cache` invalidation, CloudFront invalidation, and preview-environment PR comments when a preview is created.
4. Each workflow has high-rigor validation expectations: preflight checks, required inputs, permission boundaries, stage/environment confirmation, artifact provenance, post-run health checks, log links, and an operator-visible failure/rollback path.
5. Operator documentation is written in terse manpage(7)-style pages, with one page per core workflow and no page exceeding one printed page.
6. The phase produces clear recommendations for any required Dockerfile, workflow, CODEOWNERS, or operations documentation changes without broad unrelated dependency upgrades.

**Plans:** 3/3 plans complete

Plans:
**Wave 1**
- [x] 25-01-PLAN.md — Operator Surface Audit and Guardrail Contract

**Wave 2**
- [x] 25-02-PLAN.md — Manual Operator Workflows and Guarded Maintenance Actions

**Wave 3**
- [x] 25-03-PLAN.md — One-Page Operator Manpages and Static Validation

**Cross-cutting constraints:**
- D-17: Operator docs live under docs/ops/workflows/*.md.

### Phase 26: Simplify ECS task definitions and add CI validation status reporting

- [x] Phase 26: Complete (2026-06-01)

**Goal:** Reduce ECS task-definition complexity and establish an operator-driven CI validation workflow that automatically reports high-signal verification status to GitHub without coupling deploy execution to CI pass/fail state.

**Requirements**: CI-01, CI-02, CI-03, CI-04, CI-05, CI-06, CI-07, CI-08
**Depends on:** Phase 25

**Success Criteria:**
1. ECS/SST task-definition configuration is simplified without weakening the existing Heroku-safety, fresh AWS database/cache, shared SES, and retained S3 boundaries.
2. CI runs automatically for commits pushed to `main` and for every PR commit regardless of PR state.
3. Deploy remains operator-driven; CI results inform operator judgment but do not automatically deploy or block manual deploy intent.
4. CI collects unit, integration, and system test results into a standardized terse report that links CODEOWNER-facing failures to the failing test or artifact.
5. CI runs and reports `sst refresh` and `sst diff` evidence without mutating Heroku or production DNS.
6. The report detects potentially destructive infrastructure keywords, includes an 80-character single-line truncated commit/change summary, and avoids dumping low-signal log noise.
7. The report includes tests summary, changeset, contributors, commit count, infra changes, release gates, destructive-action warnings, and confidence score in an ANSI matrix format.
8. GitHub commit status is updated through the GitHub REST API with links to the standardized validation report.

**Plans:** 2/2 plans complete

Plans:
- [x] TBD (run /gsd-plan-phase 26 to break down) (completed 2026-06-01)

### Phase 27: spot and remove ambiguous environment variables like the GIT_* ones defined in the task definitions if the value is empty or blank then it shall be removed

- [x] Phase 27: Complete (2026-06-01)

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 26
**Plans:** 1/1 plans complete

Plans:
- [x] TBD (run /gsd-plan-phase 27 to break down) (completed 2026-06-01)

### Phase 28: Verify ARM ECS Fargate runtime architecture and resolve Thruster AWS fit

- [x] Phase 28: Complete (2026-06-01)

**Goal:** Determine whether Gala's AWS/SST production image and ECS Fargate web, worker, migration, and one-off task definitions can safely run on ARM64, then close the prior Thruster research by deciding whether Thruster adds real value in the current CloudFront/S3 static asset plus ECS Puma compute architecture or should be retired as a self-hosted-server-oriented experiment.

**Requirements**: TBD
**Depends on:** Phase 27

**Success Criteria:**
1. Current Dockerfile, SST task definitions, GitHub Actions build path, ECR image publishing, and ECS Fargate runtime settings are audited for explicit x86_64/amd64 assumptions and ARM64 compatibility.
2. A low-risk validation path proves or disproves ARM64 image builds and ECS Fargate task runtime for web, worker, migration, and one-off maintenance tasks without mutating Heroku production or `.com` DNS.
3. Cost, performance, operational simplicity, and long-term maintenance tradeoffs are documented for ARM64 versus the current architecture, including rollback to x86_64/amd64.
4. Thruster research is reconciled against Gala's actual AWS edge model: CloudFront and S3 serve fingerprinted/static assets with caching while ECS Puma handles dynamic Rails compute.
5. If Thruster mainly benefits a self-hosted single-server asset-serving model and does not improve Gala's CloudFront/S3/ECS design, the spike is closed with a clear no-adopt decision and any stale references removed or documented.
6. Any accepted architecture change includes targeted local checks, read-only AWS/SST inspection where possible, and explicit operator validation steps before production adoption.

**Plans:** 4/4 plans complete

Plans:
- [x] 28-01: Add explicit container architecture controls (completed 2026-06-01)
- [x] 28-02: Prove ARM64 image build and read-only dev rendering (completed 2026-06-01)
- [x] 28-03: Validate ARM64 in dev ECS and prove rollback (completed 2026-06-01)
- [x] 28-04: Finalize ARM64 and Thruster architecture decisions (completed 2026-06-01)

**Cross-cutting constraints:**
- D-08: Evidence includes task definition architecture, image architecture, rollback path, and operator notes.
- D-04: Production defaults may flip to ARM64 only after dev ARM64 proof passes.
- D-20: ARM64 production default requires task-definition rollback proof.
- D-23: Incomplete rollback proof blocks the ARM64 production default flip.

### Phase 29: Produce SPEND.md report for SST-tracked AWS infrastructure capex/opex migration decisioning

- [x] Phase 29: Complete (2026-06-01)

**Goal:** Produce a CODEOWNER-facing `SPEND.md` report that inventories the AWS platform described by `infra/sst.config.ts` and the live SST-tracked AWS resources, frames current and projected cost in capex/opex dimensions, and supports an informed Heroku-to-AWS migration decision with clear cost growth and cost-cut recommendations.

**Success Criteria:**
1. `infra/sst.config.ts`, SST outputs/state where available, GitHub workflow deploy behavior, and live AWS resources are reconciled into a concrete platform inventory covering ECS/Fargate, ECR images, ALB, CloudFront distributions, S3 asset/media buckets, database/cache resources, logs, DNS, secrets, and operational workflows.
2. `SPEND.md` separates capex-style one-time engineering/migration costs from opex-style recurring cloud/runtime/operator costs, with assumptions stated tersely and evidence linked to repository files or read-only AWS CLI observations.
3. Current AWS spend drivers are estimated with enough rigor for a migration decision: compute sizing, always-on versus burst workloads, data transfer, cache/CDN effects, storage retention, logs, image/build artifacts, NAT/networking exposure if present, and GitHub Actions/operator workload costs where relevant.
4. The report models how cost grows under at least low, expected, and high usage scenarios, including catalog traffic, authenticated case activity, background jobs, preview environments, release asset retention, CloudFront cache hit ratio, database/storage growth, and log volume.
5. The report identifies the highest-leverage cost-cut opportunities and safety tradeoffs, including rightsizing ECS tasks, ARM64 adoption if Phase 28 proves it, preview lifecycle/TTL, image and asset retention, log retention, cache policy tuning, database/cache sizing, and removing unused distributions or duplicated infrastructure.
6. The report compares AWS migration economics against the current Heroku posture without requiring destructive Heroku changes, and calls out migration risks, unknowns, validation gaps, and decision thresholds for staying on Heroku, hybrid operation, or moving fully to AWS.
7. Validation uses read-only AWS commands with `AWS_PROFILE=gala AWS_REGION=us-west-2`, avoids production mutation, and documents any pricing assumptions that cannot be verified directly from tracked infra.

**Requirements**: TBD
**Depends on:** Phase 28
**Plans:** 3/3 plans complete

Plans:
**Wave 1**
- [x] 29-01-PLAN.md - Build AWS spend inventory and pricing evidence.

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 29-02-PLAN.md - Model capex opex growth and cost-cut decisions.

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 29-03-PLAN.md - Validate SPEND.md and harden decision quality.

### Phase 30: Close dirty cache/deploy artifacts and validate guardrails

- [x] Phase 30: Complete (2026-06-01)

**Goal:** Audit and commit the remaining dirty GSD/cache/deploy artifacts, close stale phase status, and validate the GitHub/AWS/SST guardrails without touching Heroku production or changing deferred ARM64/Thruster decisions.

**Requirements:** QA-05, DPLY-01, DPLY-03, DPLY-05, DPLYIMM-01, CI-08

**Depends on:** Phase 29

**Success Criteria:**
1. Dirty files are classified before commit, and unrelated app behavior changes are avoided.
2. Cache work from the previous request-cache workflows is incorporated into `.planning` state and validated with focused request specs.
3. GitHub workflow definitions, operator scripts, and CI reporting are checked locally without broad unrelated rewrites.
4. GitHub CLI validation inspects workflow runs and validation artifacts rather than trusting a green workflow conclusion alone.
5. AWS CLI validation is read-only and confirms SST-managed CloudFront/ECS health under `AWS_PROFILE=gala AWS_REGION=us-west-2`.
6. Heroku production remains untouched, SST in `infra/sst.config.ts` remains the infrastructure authority, ARM64 production adoption remains deferred, and Thruster remains deferred/no-adopt.
7. Remaining CI validation debt is recorded as milestone audit debt before any milestone archive.

**Plans:** 1/1 plans complete

Plans:
**Wave 1**
- [x] 30-01-PLAN.md — Audit dirty cache/deploy artifacts, validate focused gates, record CI/AWS evidence, and commit closeout state.

### Phase 31: Fix SST dev sign-in CSRF origin

- [ ] Phase 31: In progress (2026-06-02)

**Goal:** Fix the SST preview sign-in workflow by keeping Rails HTTPS request semantics aligned with the public `BASE_URL` for Devise CSRF origin checks, while preserving production guardrails and avoiding Heroku mutation.

**Requirements:** DPLY-01, DPLY-03, DPLYIMM-01, QA-03, CI-08

**Depends on:** Phase 30

**Success Criteria:**
1. CloudWatch and ECS task-definition evidence classify the sign-in 4XX before code changes.
2. SST-managed runtime config derives `FORCE_SSL=true` for HTTPS dev preview and production base URLs.
3. `/readers/sign_in` has request coverage with CSRF origin checking enabled.
4. Deploy guard tests preserve dev HTTPS, dev HTTP, and production HTTPS `FORCE_SSL` behavior.
5. GitHub/AWS validation uses the preview deployment workflow on `x86_64` before any production mutation.
6. Heroku remains untouched, ARM64 production adoption remains deferred, and Thruster remains deferred/no-adopt.

**Plans:** 1 plan

Plans:
**Wave 1**
- [ ] 31-01-PLAN.md — Fix SST HTTPS runtime env for Devise sign-in and validate with AWS/GitHub gates.
