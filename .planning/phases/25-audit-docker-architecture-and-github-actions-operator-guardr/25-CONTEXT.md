# Phase 25: Audit Docker Architecture and GitHub Actions Operator Guardrails for Secure Reliable Platform Operations - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 25 delivers a CODEOWNER-held platform operations plan for Gala's AWS/SST deployment path. The phase is scoped to auditing the production Docker image/task architecture against safety guardrails, specifying manual GitHub Actions operator workflows, and writing terse one-page manpage(7)-style operator docs.

The phase must cover deploys to dev from feature branches, production promotion, PR merge-to-base expectations, migrations, one-off scripts in the AWS environment, rollback, Rails cache invalidation, CloudFront invalidation, dry-run behavior, validation gates, preview PR comments, and documented side effects. It must not broaden into unrelated dependency upgrades, product behavior changes, Heroku production mutation, `.com` DNS cutover, or unapproved secrets movement.

</domain>

<decisions>
## Implementation Decisions

### Operator Workflow Inventory
- **D-01:** Use a hybrid workflow shape: keep deploy, promote, and rollback operations as separate manual workflow files, and group lower-risk maintenance actions in a shared maintenance workflow.
- **D-02:** The core operator set is: separate deploy/promote/rollback workflows plus `maintenance.yml` for migrations, one-off scripts, Rails cache clearing, and CloudFront invalidation.
- **D-03:** PR merge-to-base behavior should be documented as a protected branch process and verification expectation, not as a mutating `workflow_dispatch` job.
- **D-04:** All operator actions in this phase must be manual `workflow_dispatch` jobs. The plan should not introduce automatic production mutation on push or merge.

### Dry Run and Authority Gates
- **D-05:** Every operator workflow must expose dry-run behavior that prints planned side effects and validation outputs before mutation, but the workflow does not need to require a separate prior successful dry-run run ID.
- **D-06:** Production mutations require a CODEOWNER-only gate plus exact typed confirmation, such as a phrase that includes the target environment, domain/stage, operation, and commit or artifact identifier.
- **D-07:** Dev-stage operations still need explicit inputs, validation output, and audit links, but production gets the strongest confirmation path.

### Rollback and Recovery
- **D-08:** Rollback has two lanes. Immediate recovery should prefer rolling ECS services back to a prior known-good task definition revision, preserving the image and environment bundle from that task.
- **D-09:** Reproducible recovery or drift repair should redeploy a chosen release/image/artifact ID through the deployment workflow.
- **D-10:** Rollback docs and plans must explain what does and does not roll back, including task definition, image, release asset prefix, environment variables, database migrations, Rails cache, and CloudFront state.

### Migrations and One-Off Scripts
- **D-11:** Migrations and one-off scripts must run as ECS one-off tasks using the same production app image and AWS environment.
- **D-12:** GitHub runners must not execute Rails commands directly against production database or Redis services.
- **D-13:** One-off script support must stay hard-coded and allowlisted, with no secret-looking freeform payloads and no arbitrary shell execution path.

### Cache Invalidation
- **D-14:** Cache invalidation belongs in the shared maintenance workflow.
- **D-15:** The maintenance workflow must expose explicit modes for `rails_cache_clear`, `cloudfront_invalidate`, and `both`.
- **D-16:** Each cache mode must print its exact scope and side effects before mutation and include post-run verification instructions.

### Operator Manual Contract
- **D-17:** Operator docs live under `docs/ops/workflows/*.md`, one manpage-style file per core workflow.
- **D-18:** Each page must fit within one printed page.
- **D-19:** Each page must use these mandatory sections: `NAME`, `SYNOPSIS`, `INPUTS`, `DRY RUN`, `SIDE EFFECTS`, `VERIFY`, `ROLLBACK`, and `EXAMPLES`.
- **D-20:** The docs are for CODEOWNER manual operation. They should be terse like Unix manpages and focus on use, side effects, verification, and recovery rather than tutorial prose.

### the agent's Discretion
- The planner may choose the exact workflow file names, provided the hybrid boundary remains clear and the docs map one-to-one to the core workflows.
- The planner may choose the exact confirmation phrase format, provided production mutations require CODEOWNER authorization and exact typed confirmation with environment, operation, and target artifact/ref.
- The planner may decide whether maintenance modes are implemented as one workflow with an `operation` input or small internal reusable actions, provided operator-facing behavior stays explicit and manual.
- The planner may choose documentation tooling or formatting checks for the one-page limit if a lightweight reliable check exists; otherwise the one-page requirement may be enforced by review and concise source structure.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope and Safety Boundaries
- `.planning/ROADMAP.md` — Phase 25 goal, success criteria, dependency on Phase 24, and operator workflow coverage.
- `.planning/REQUIREMENTS.md` — AWS/SST deployment safety, immutable preview/DNS requirements, dry-run/user-data boundaries, rollback expectations, and no-Heroku-mutation constraints.
- `.planning/PROJECT.md` — milestone context, Heroku production boundary, route-driven stability expectations, and deployment architecture evolution.
- `.planning/STATE.md` — current AWS deployment state, Phase 23 live breakpoint, Phase 24 completion notes, and operator next steps.

### Prior AWS/SST Decisions
- `.planning/phases/23-immutable-cloudflare-dns-and-preview-deployment-pipeline/23-CONTEXT.md` — SST as IaC source of truth, five-input deploy workflow, release IDs, immutable asset prefixes, preview PR comments, and `.com` out-of-scope boundary.
- `.planning/phases/23-immutable-cloudflare-dns-and-preview-deployment-pipeline/23-01-SUMMARY.md` — current Cloudflare/SST deployment status and live breakpoint context.
- `.planning/phases/24-cut-gala-production-docker-image-size-with-reusable-base-ima/24-CONTEXT.md` — production Dockerfile split, reusable base image strategy, ECR proof target, and dev/prod stage model.
- `.planning/phases/24-cut-gala-production-docker-image-size-with-reusable-base-ima/24-01-SUMMARY.md` — implemented Docker image architecture and SST wiring.
- `.planning/phases/24-cut-gala-production-docker-image-size-with-reusable-base-ima/24-02-SUMMARY.md` — Phase 24 follow-up evidence and deployment behavior.
- `.planning/phases/24-cut-gala-production-docker-image-size-with-reusable-base-ima/24-03-SUMMARY.md` — test harness, request-cache, and continuation notes.

### Codebase Maps
- `.planning/codebase/STACK.md` — Docker, pnpm, Rails, SST, runtime package, production dependency, and deployment stack map.
- `.planning/codebase/ARCHITECTURE.md` — infrastructure layer, AWS deploy path, SST runtime, and task/service architecture.
- `.planning/codebase/INTEGRATIONS.md` — AWS, Cloudflare, GitHub Actions, cache, secrets, CloudFront, ECS, and Heroku boundary inventory.

### Implementation Files
- `Dockerfile` — current local/development Docker behavior to preserve.
- `Dockerfile.production` — production app image build path to audit.
- `Dockerfile.production-base` — reusable production base image strategy to audit.
- `.dockerignore` — production build context boundary.
- `entrypoint.sh` — runtime entrypoint behavior for web, worker, migration, and task commands.
- `infra/sst.config.ts` — ECS services, tasks, database, cache, CDN, DNS, IAM, image references, and one-off task definitions.
- `.github/workflows/deploy.yml` — existing production-capable manual deploy workflow and input/permission model.
- `.github/workflows/preview.yml` — preview deployment and PR comment behavior.
- `scripts/deploy-sst.sh` — guarded deploy helper, release metadata, allowed user-data hooks, asset sync, CloudFront invalidation, and safety checks.
- `docs/aws-sst-secret-inventory.md` — secret names and boundaries; do not copy secret values.
- `CODEOWNERS` — repository ownership rules for CODEOWNER-gated workflow changes, if present.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.github/workflows/deploy.yml`: existing `workflow_dispatch` production-capable deploy path with GitHub OIDC, release metadata, branch/stage inputs, and SST execution.
- `.github/workflows/preview.yml`: preview workflow path with branch preview URL and PR comment behavior.
- `scripts/deploy-sst.sh`: existing shell guardrail layer for release ID validation, immutable asset sync, SST deploys, approved hooks, CloudFront invalidation, and release pruning.
- `infra/sst.config.ts`: current source of truth for AWS web/worker services, one-off tasks, database, Redis/Valkey, app CDN, static assets, and Cloudflare DNS.
- Phase 24 Dockerfiles and `.dockerignore`: production image architecture that this phase should audit rather than redesign from scratch.

### Established Patterns
- AWS/SST work must not mutate Heroku production, `.com` DNS, SES, or the retained `msc-gala` ActiveStorage media bucket unless a later explicit phase says so.
- Production and preview deploys use immutable release asset prefixes under `releases/<stage>/<release_id>/`.
- Preview environments are branch-derived under `*.dev.learngala.dev` and should comment on a PR when one exists.
- Deployment operations already favor explicit environment variables such as `AWS_PROFILE=gala`, `AWS_REGION=us-west-2`, `SST_STAGE`, `GALA_RELEASE_ID`, and `GALA_ASSET_PREFIX`.
- Existing deployment safety relies on explicit allowlists and validation around `USER_DATA`; Phase 25 should extend that posture, not replace it with freeform shell access.

### Integration Points
- GitHub Actions operator jobs connect to AWS through OIDC and should produce durable logs, summaries, and links for verification.
- ECS task definitions and SST tasks are the right boundary for migrations and one-off Rails work in AWS.
- Redis-backed Rails cache and CloudFront invalidation have different scopes and side effects; operator docs must distinguish them.
- GitHub release metadata, PR comments, CloudFront distributions, S3 static asset prefixes, ECS services, RDS, and Redis/Valkey are all side-effect surfaces that docs and dry-run summaries must name explicitly.

</code_context>

<specifics>
## Specific Ideas

- Prefer the hybrid workflow inventory: separate deploy/promote/rollback workflows, one maintenance workflow with explicit operation modes.
- Keep all operator workflows manual via `workflow_dispatch`.
- Require dry-run output in every workflow, but do not require a prior dry-run run ID before mutation.
- Use CODEOWNER-only production gating plus exact typed confirmation.
- Treat rollback as two lanes: ECS task definition rollback for immediate recovery, release/image/artifact redeploy for reproducible recovery.
- Run migrations and one-off scripts only as ECS one-off tasks using the production app image and AWS environment.
- Put operator manual pages in `docs/ops/workflows/*.md` and keep each page terse enough for one printed page.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 25-audit-docker-architecture-and-github-actions-operator-guardr*
*Context gathered: 2026-06-01*
