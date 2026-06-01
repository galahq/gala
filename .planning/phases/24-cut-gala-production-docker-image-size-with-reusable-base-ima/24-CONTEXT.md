# Phase 24: Cut Gala Production Docker Image Size With Reusable Base Ima - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 24 delivers a slimmer AWS production Docker build path for Gala. The phase is scoped to production image size, reusable base-image caching, and dev-stage deploy validation through SST/GitHub Actions. It must not change Rails app behavior, Heroku production at `https://www.learngala.com`, Heroku database/cache configuration, SES, or the retained `msc-gala` ActiveStorage media bucket.

The production Docker path should support the existing AWS/SST deployment architecture while keeping only two SST stages: `production` and `dev`. Preview environments remain branch-derived deployments under `*.dev.learngala.dev` and should use shared dev-stage infrastructure rather than introducing more SST stages.

</domain>

<decisions>
## Implementation Decisions

### Size Target and Proof
- **D-01:** The hard success metric is compressed AWS ECR image size `<= 1.5GB` for the production app image.
- **D-02:** Proof must come from a dev ECR image using AWS image-size evidence, not from local Docker image size alone.
- **D-03:** If the first safe trimming pass lands close to the target, such as `1.52GB`, keep trimming until the compressed dev ECR image is `<= 1.5GB`; do not accept a near miss.
- **D-04:** Record before/after ECR sizes and the exact measurement commands in the phase summary. A reusable measurement script is not required for the first pass.

### Dockerfile Split Strategy
- **D-05:** Keep the current `Dockerfile` for development/local compatibility.
- **D-06:** Add separate production Dockerfiles: `Dockerfile.production` and `Dockerfile.production-base`.
- **D-07:** Wire dev deploy validation to use `Dockerfile.production` during this phase.
- **D-08:** Preserve current runtime behavior exactly, including entrypoint behavior, Puma/Sidekiq commands, Rails environment contract, and asset compile expectations.
- **D-09:** Keep the production Dockerfiles production-only; do not add development ergonomics there.

### Base Image Cache Strategy
- **D-10:** Version the reusable base image with explicit tags tied to runtime and system dependency versions, such as Ruby, Node, Debian, and package-set version identifiers.
- **D-11:** Rebuild the base image manually and infrequently, only when Ruby, Node, Debian packages, or required runtime libraries change.
- **D-12:** Store the reusable base image in the same AWS ECR account/repository family as Gala deploy images under `AWS_PROFILE=gala`.
- **D-13:** Require `GALA_PRODUCTION_BASE_IMAGE` for production app builds and fail clearly if it is missing. Do not silently fall back to an implicit base image.

### Runtime Pruning Line
- **D-14:** Remove Node.js and pnpm from the final production runtime image; keep them only in build stages.
- **D-15:** Keep proven runtime packages first, including PDF/image/font dependencies such as `wkhtmltopdf`, fonts, and `libvips`, unless route evidence proves they are unused.
- **D-16:** Remove clearly build-only packages and conservatively clean caches, `.git`, `node_modules`, temporary build directories, test directories, and development-only caches while preserving Rails runtime source needed by the app.
- **D-17:** Evaluate 37signals Thruster as a bounded check, but do not require it. Add it only if it improves deploy/runtime shape without size or behavior risk.

### the agent's Discretion
- The planner may choose the exact ECR repository naming convention for the base image, provided it stays in the Gala AWS account/repository family and uses explicit dependency-version tags.
- The planner may choose the exact implementation mechanism for passing `GALA_PRODUCTION_BASE_IMAGE` into local, CI, and SST build steps, provided missing configuration fails clearly.
- The executor may identify additional safe cleanup targets during image inspection, provided changes stay conservative and the final runtime behavior remains unchanged.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope and Research
- `.planning/ROADMAP.md` — Phase 24 requirements, success criteria, dependency on Phase 23, and safety boundaries.
- `.planning/REQUIREMENTS.md` — AWS/SST deployment safety, immutable preview/DNS requirements, and no-Heroku-mutation constraints.
- `.planning/PROJECT.md` — milestone context and project-level deployment boundaries.
- `.planning/phases/24-cut-gala-production-docker-image-size-with-reusable-base-ima/RESEARCH.md` — current image-size evidence, 37signals/Rails Docker tactics, and candidate implementation approach.

### Prior AWS/SST Decisions
- `.planning/phases/23-immutable-cloudflare-dns-and-preview-deployment-pipeline/23-CONTEXT.md` — SST as IaC source of truth, Cloudflare DNS ownership, preview URL behavior, and `.com` out-of-scope boundary.
- `.planning/phases/22-aws-edge-cache-validation-and-catalog-load-optimization/22-CONTEXT.md` — app CloudFront validation boundaries and media bucket non-mutation constraints.
- `.planning/phases/21-aws-performance-and-edge-cache-optimization/21-CONTEXT.md` — AWS performance deployment safety rules and static asset/CDN context.

### Codebase Maps
- `.planning/codebase/STACK.md` — Docker, pnpm, Rails, SST, runtime package, and production dependency map.
- `.planning/codebase/ARCHITECTURE.md` — deployment IaC role and Rails/Shakapacker asset architecture.
- `.planning/codebase/INTEGRATIONS.md` — AWS, ECR/ECS, Cloudflare, GitHub Actions, static asset, and secret boundary inventory.

### Implementation Files
- `Dockerfile` — current development/local Docker behavior to preserve.
- `.dockerignore` — build-context pruning boundary.
- `Dockerfile.production` — new production app image Dockerfile to add.
- `Dockerfile.production-base` — new reusable production base image Dockerfile to add.
- `scripts/deploy-sst.sh` — deploy helper that should build/push the production Dockerfile and record dev ECR proof.
- `infra/sst.config.ts` — SST services/tasks that should consume the production app image without duplicating large Docker assets.
- `.github/workflows/deploy.yml` — production-capable deploy workflow and allowed input/secrets boundary.
- `.github/workflows/preview.yml` — dev preview workflow integration point.
- `entrypoint.sh` — runtime entrypoint behavior that must remain compatible.
- `Gemfile` and `Gemfile.lock` — Ruby runtime dependency source of truth.
- `package.json` and `pnpm-lock.yaml` — Node/pnpm build-stage dependency source of truth.
- `Aptfile` — runtime/system package compatibility reference where applicable.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `scripts/deploy-sst.sh`: existing guarded deploy helper for image build/push, immutable asset sync, SST deploy, approved hooks, CloudFront invalidation, and release pruning.
- `infra/sst.config.ts`: existing SST IaC for ECS web/worker services, one-off tasks, database, cache, CloudFront, static assets, and Cloudflare DNS.
- `.github/workflows/deploy.yml` and `.github/workflows/preview.yml`: existing GitHub Actions entrypoints for production-capable deploys and dev preview deployments.
- Existing Rails asset precompile path: use the established Shakapacker/Webpack/Sprockets production asset build, not a new bundler path.

### Established Patterns
- AWS/SST work must be non-destructive toward Heroku production, Heroku database/cache URLs, SES, and the retained `msc-gala` media bucket.
- Production deploys use immutable release asset prefixes under `releases/<stage>/<release_id>/`.
- Preview deploys are dev-stage resources with branch-derived subdomains under `*.dev.learngala.dev`, not separate SST stages.
- Docker production builds should follow Rails/37signals-style multi-stage conventions: build-only Node/pnpm/toolchains, production-only final image, `SECRET_KEY_BASE_DUMMY` for asset compilation where appropriate, Bootsnap precompile, jemalloc, and non-root runtime where feasible.
- Current production runtime includes Ruby 4.0.3, Node 24.15.0, pnpm 11.1.0, Debian Bookworm slim, PostgreSQL client packages, jemalloc, libvips, wkhtmltopdf, and fonts; Phase 24 should remove build-only weight first and keep proven runtime packages.

### Integration Points
- Docker build integration connects through `scripts/deploy-sst.sh` and GitHub Actions, not through Heroku.
- SST image references in `infra/sst.config.ts` must use one shared production app image for compatible web, worker, migration, and maintenance task usage where possible.
- ECR compressed image size is the accepted proof source for the phase gate.
- Local image inspection can be used diagnostically, but it is not the hard acceptance proof.

</code_context>

<specifics>
## Specific Ideas

- Target a compressed dev ECR production app image size of `<= 1.5GB`.
- Preserve the existing development Dockerfile and introduce production-specific Dockerfiles instead of forcing all workflows through one file.
- Make base-image caching explicit and failure-prone in the right way: missing `GALA_PRODUCTION_BASE_IMAGE` should stop the production build rather than quietly using a stale fallback.
- Treat Thruster as optional research-backed refinement, not a mandatory runtime change.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 24-cut-gala-production-docker-image-size-with-reusable-base-ima*
*Context gathered: 2026-06-01*
