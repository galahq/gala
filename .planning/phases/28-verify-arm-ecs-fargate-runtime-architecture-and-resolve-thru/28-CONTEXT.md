# Phase 28: Verify ARM ECS Fargate runtime architecture and resolve Thruster AWS fit - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Determine whether Gala should move its AWS/SST ECS Fargate runtime from the current `x86_64` / `linux/amd64` assumptions to ARM64, and resolve whether Thruster belongs in the current architecture where CloudFront and S3 serve static assets while ECS Puma handles dynamic Rails compute.

</domain>

<decisions>
## Implementation Decisions

### ARM Validation Boundary
- **D-01:** Phase 28 should make ARM64 production-capable if validation passes, not merely theoretical.
- **D-02:** First real ARM64 validation must happen in dev or preview-style AWS infrastructure, using the established non-production AWS/SST path.
- **D-03:** ARM64 proof must cover the full shared runtime model: web service, worker service, migration task, and one-off maintenance task paths.
- **D-04:** If dev ARM64 proof passes, source may flip production defaults to ARM64 in this phase.
- **D-05:** The minimum proof before flipping production defaults is healthy dev ECS task surfaces on ARM64: web `/up`, worker boot/log evidence, migration task safe command, and one-off task safe command.

### Architecture Decision Rule
- **D-06:** Use engineering judgment across cost, performance, future-proofing, speed, and compatibility; prioritize performance, future-proofing, speed, and compatibility, with cost as supporting evidence.
- **D-07:** Block ARM64 adoption for unresolved native dependency uncertainty, runtime regression, significant added complexity, or material performance regression.
- **D-08:** Capture compatibility plus operational evidence: task definition architecture, image architecture, rollback path, and operator notes.
- **D-09:** If ARM64 evidence is incomplete or mixed, keep the amd64 production default and document exact blockers and reopening criteria.

### Thruster Adoption Bar
- **D-10:** Default stance is reject Thruster unless it is clearly useful for Gala's actual CloudFront/S3/Puma/ECS architecture.
- **D-11:** "Clearly useful" means improving the dynamic Rails/Puma request path or operational behavior, not duplicating static asset serving already owned by S3 and CloudFront.
- **D-12:** Phase 28 should perform research and architecture reconciliation for Thruster, not a live Thruster experiment by default.
- **D-13:** The researcher must check current official Thruster and Rails deployment docs before locking a no-adopt decision, specifically looking for benefits beyond static asset serving.
- **D-14:** Any claimed Thruster benefit outside static assets still requires Gala-specific proof. Do not adopt unless the benefit maps to Gala's CloudFront/S3/Puma/ECS path and can be proven cheaply.
- **D-15:** If Thruster is rejected, remove or update stale active references that imply Thruster is planned, required, or recommended.

### Cleanup And Documentation Scope
- **D-16:** Record final ARM64 and Thruster decisions in phase artifacts and relevant AWS/operator docs when defaults, build commands, or architecture guidance changes.
- **D-17:** If ARM64 is adopted, update only source-of-truth paths: `infra/sst.config.ts`, `scripts/deploy-sst.sh`, and active production preflight docs.
- **D-18:** If ARM64 is not adopted, keep the amd64 default but strengthen the rationale and reopening criteria.
- **D-19:** If Thruster is not adopted, clean only misleading active references that imply Thruster is planned, required, or recommended. Do not rewrite historical planning artifacts.

### Rollback Posture
- **D-20:** If ARM64 becomes the production default, require task-definition rollback proof.
- **D-21:** Rollback coverage must include web and worker services.
- **D-22:** Collect rollback evidence through a live dev rollback drill after ARM testing.
- **D-23:** If rollback proof is incomplete, block the ARM64 production default flip and keep production on amd64.

### the agent's Discretion
- The planner may choose exact ARM64 validation commands and task-safe commands, provided they are non-destructive and prove the required web, worker, migration, and one-off task surfaces.
- The planner may choose exact documentation files to update within the active AWS/operator documentation set, provided it avoids broad historical planning rewrites.
- The researcher may decide which official Thruster and Rails deployment docs are canonical at research time, but must cite current official sources and distinguish source facts from inferences.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope And Project Rules
- `.planning/ROADMAP.md` - Phase 28 goal, dependency on Phase 27, and success criteria.
- `.planning/REQUIREMENTS.md` - AWS/SST deployment safety, no-Heroku-mutation, no Heroku DB/Redis reuse, Cloudflare/DNS boundaries, and AWS performance constraints.
- `.planning/PROJECT.md` - milestone context, route stability expectations, and Heroku production boundary.
- `.planning/STATE.md` - current active rules, AWS deployment context, and prior phase notes.

### Prior Phase Decisions
- `.planning/phases/27-spot-and-remove-ambiguous-environment-variables-like-the-git/27-CONTEXT.md` - task-definition environment cleanup, SST source-of-truth boundary, and read-only/dev validation constraints.
- `.planning/phases/26-simplify-ecs-task-definitions-and-add-ci-validation-status-r/26-CONTEXT.md` - ECS/SST task simplification, advisory CI, and operator-driven deploy boundaries.
- `.planning/phases/25-audit-docker-architecture-and-github-actions-operator-guardr/25-CONTEXT.md` - manual operator workflows, dry-run gates, rollback lanes, and ECS one-off task constraints.
- `.planning/phases/24-cut-gala-production-docker-image-size-with-reusable-base-ima/24-CONTEXT.md` - production Docker split, ECR proof expectations, base image strategy, and prior optional Thruster evaluation.
- `.planning/phases/23-immutable-cloudflare-dns-and-preview-deployment-pipeline/23-CONTEXT.md` - SST-owned Cloudflare DNS, immutable release assets, deploy workflow boundaries, and `.com` out-of-scope decision.
- `.planning/phases/22-aws-edge-cache-validation-and-catalog-load-optimization/22-CONTEXT.md` - app CloudFront validation, media bucket non-mutation, and AWS validation boundaries.
- `.planning/phases/21-aws-performance-and-edge-cache-optimization/21-CONTEXT.md` - CloudFront/S3 static asset and anonymous catalog cache architecture.

### Codebase Maps
- `.planning/codebase/STACK.md` - Rails, Docker, pnpm, SST, AWS, and production runtime package map.
- `.planning/codebase/ARCHITECTURE.md` - SST runtime, AWS deploy path, ECS service/task architecture, and Rails/Shakapacker asset architecture.
- `.planning/codebase/INTEGRATIONS.md` - AWS, ECS, ECR, S3, CloudFront, Cloudflare, GitHub Actions, Heroku, secrets, and environment boundary inventory.

### Implementation Files
- `infra/sst.config.ts` - SST source of truth for ECS services, tasks, architecture setting, runtime environment, secrets, CloudFront, database/cache, and outputs.
- `scripts/deploy-sst.sh` - guarded deploy helper, Docker build platform, ECR push, static asset sync, ECS-only rollout logic, and rollback-related task definition handling.
- `.github/workflows/deploy.yml` - operator-driven production-capable deploy workflow and input/permission model.
- `.github/workflows/preview.yml` - preview deployment workflow and branch subdomain behavior.
- `.github/workflows/rollback.yml` - existing rollback workflow surface for ECS task definition recovery.
- `Dockerfile` - current development/local Docker behavior to preserve.
- `Dockerfile.production` - production app image build path to validate for architecture changes.
- `Dockerfile.production-base` - reusable production base image path that may need architecture evidence.
- `.dockerignore` - build context boundary.
- `entrypoint.sh` - runtime entrypoint behavior for web, worker, migration, and task commands.
- `docs/aws-sst-phase-1-preflight.md` - active production image preflight guidance currently documenting `linux/amd64` / `x86_64` assumptions.
- `docs/ops/workflows/rollback.md` - operator rollback documentation for task-definition recovery.
- `docs/ops/workflows/operator-guardrails.md` - operator workflow safety and allowed side-effect boundaries.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `infra/sst.config.ts`: already centralizes shared Rails task defaults and currently sets `architecture: "x86_64"`.
- `scripts/deploy-sst.sh`: already owns Docker build/push behavior and currently builds with `--platform linux/amd64`.
- `.github/workflows/rollback.yml` and `docs/ops/workflows/rollback.md`: provide the existing rollback surface to extend or reference for ARM64 task-definition recovery.
- `docs/aws-sst-phase-1-preflight.md`: documents the current production image preflight and the Apple Silicon / `linux/amd64` compatibility rationale.

### Established Patterns
- Deploy work stays operator-driven through `workflow_dispatch`; CI and validation evidence inform operator judgment but do not automatically mutate production.
- AWS validation must not mutate Heroku production, `.com` DNS, SES, or the retained `msc-gala` ActiveStorage media bucket.
- Static asset serving is already split from Puma: compiled assets are uploaded to S3 release prefixes and served through CloudFront, while Puma handles dynamic Rails compute.
- One-off migrations, seed/import, index refresh, and maintenance commands run as ECS tasks using the production app image and AWS environment.

### Integration Points
- ARM64 adoption touches Docker build platform, ECR image architecture, SST ECS task architecture, ECS service task definitions, and operator rollback docs.
- Thruster evaluation touches production runtime architecture only if current official docs show a dynamic-path or operational benefit that maps to Gala.

</code_context>

<specifics>
## Specific Ideas

- Current code scan found explicit amd64/x86 assumptions in `infra/sst.config.ts`, `scripts/deploy-sst.sh`, and `docs/aws-sst-phase-1-preflight.md`.
- ARM64 proof must include dev ECS health for web, worker, migration task, and one-off task paths before a production default flip is accepted.
- If dev proof passes and rollback proof is complete, source may flip production defaults to ARM64 in this phase.
- If evidence is incomplete or mixed, production remains amd64 and the summary should document blockers plus reopening criteria.
- Thruster should not be adopted for static asset serving alone because Gala already uses S3 and CloudFront for fingerprinted/static assets.
- Current official Thruster and Rails deployment docs must be checked during research before the no-adopt decision is finalized.

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 28-Verify ARM ECS Fargate runtime architecture and resolve Thruster AWS fit*
*Context gathered: 2026-06-01*
