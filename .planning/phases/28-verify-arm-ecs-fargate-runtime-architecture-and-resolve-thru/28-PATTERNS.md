---
phase: 28
status: complete
created: 2026-06-01
---

# Phase 28 Pattern Map

## Files to Modify

| File | Role | Pattern to Reuse |
| --- | --- | --- |
| `infra/sst.config.ts` | SST source of truth for ECS services/tasks and runtime architecture | Reuse shared `railsTaskDefaults` and `railsServiceDefaults`; make architecture a single validated value consumed by services and tasks. |
| `scripts/deploy-sst.sh` | Guarded deploy helper, Docker build/push, ECS-only rollout | Reuse existing input validation, `run_sst_cmd` env propagation, image build logging, and ECS-only registration payload construction. |
| `.github/workflows/deploy.yml` | Manual dev/production deployment surface | Reuse existing workflow_dispatch guardrails, CODEOWNER production validation, and summary format; add only architecture/base-image inputs or env needed for safe transition. |
| `.github/workflows/preview.yml` | Manual dev preview deployment surface | Reuse dev-only preview flow for first ARM proof. |
| `.github/workflows/promote-production.yml` | Manual production promotion surface | Reuse production promotion guardrails if ARM is accepted for production. |
| `.github/workflows/rollback.yml` | Existing web/worker task-definition rollback surface | Reuse the `task_definition` lane and service selector for dev rollback proof. |
| `docs/aws-sst-phase-1-preflight.md` | Active production image preflight guidance | Update amd64/x86-only guidance to reflect the final ARM decision. |
| `docs/ops/workflows/rollback.md` | Operator rollback manpage | Add architecture rollback notes if ARM64 becomes a production-capable/default path. |
| `docs/ops/workflows/operator-guardrails.md` | Operator safety overview | Add concise architecture-transition guardrail if source defaults change. |

## Analog Patterns

### Shared Task Defaults

Phase 26 centralized runtime defaults in `infra/sst.config.ts`. Phase 28 should
not edit every web/task declaration independently. The architecture value should
be computed once, then passed through the existing shared defaults to web,
worker, migration, seed, refresh, and scheduled task resources.

### Explicit Platform Mapping

`scripts/deploy-sst.sh` already owns the Docker build command. The ARM change
should not duplicate build platform decisions across workflows. Prefer one
script-level mapping:

- `x86_64` -> `linux/amd64` -> ECS `X86_64`
- `arm64` -> `linux/arm64` -> ECS `ARM64`

Invalid values should fail before Docker build, image push, or SST deploy.

### Base Image Remains Explicit

Phase 24 intentionally made `GALA_PRODUCTION_BASE_IMAGE` required. Keep that
contract. ARM64 proof must provide an explicit ARM64 base image tag rather than
silently falling back to a Ruby image or an implicit mutable `latest` tag.

### ECS-Only Rollout Is Image-Only

The ECS-only path reuses the current task definition shape and is appropriate
for image-only releases. An architecture transition is not image-only. The
script should refuse a requested architecture change through ECS-only rollout
unless the current service task definitions already have the same
`runtimePlatform.cpuArchitecture`.

### Rollback Stays Task-Definition Based

The existing rollback workflow already accepts web and worker task definition
ARNs. Phase 28 should prove this in dev by rolling back from ARM64 task
definitions to pre-ARM definitions. Do not add a second rollback mechanism.

## Data Flow

1. Operator or workflow selects an architecture, defaulting to the current
   production-safe value until validation passes.
2. `scripts/deploy-sst.sh` validates the architecture and maps it to a Docker
   build platform.
3. The app image is built and pushed for the selected platform from an explicit
   matching production base image.
4. `run_sst_cmd` passes the selected architecture to `infra/sst.config.ts`.
5. SST renders web, worker, migration, seed, refresh, and scheduled task
   definitions with the selected architecture.
6. Dev ECS validation proves web, worker, migration, and one-off task surfaces.
7. Rollback workflow restores captured web/worker task definitions in dev.
8. Final docs either flip production defaults to ARM64 or keep amd64 with exact
   blockers and reopening criteria.

## Landmines

- Do not push an ARM64 app image into an x86_64 task definition through the
  production ECS-only deploy path.
- Do not assume the current production base image tag is multi-arch; inspect or
  build an ARM64 base image explicitly.
- Do not mutate Heroku production, `.com` DNS, SES, or the retained media
  bucket.
- Do not print secret values while collecting task definition, image, or log
  evidence.
- Do not adopt Thruster for static assets; CloudFront and S3 already own that
  path.
- Do not rewrite historical Phase 24 planning artifacts when resolving
  Thruster; only active docs and Phase 28 decision artifacts need cleanup.

## PATTERN MAPPING COMPLETE
