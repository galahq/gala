---
phase: 28
plan: 28-01
subsystem: aws-sst-architecture
tags:
  - ecs
  - fargate
  - arm64
  - deployment
  - guardrails
key-files:
  - infra/sst.config.ts
  - scripts/deploy-sst.sh
  - scripts/ops/test-deploy-sst-architecture-guard.sh
  - .github/workflows/deploy.yml
  - .github/workflows/preview.yml
  - .github/workflows/promote-production.yml
  - docs/ops/workflows/operator-guardrails.md
  - .planning/phases/28-verify-arm-ecs-fargate-runtime-architecture-and-resolve-thru/28-DECISION.md
metrics:
  plans_completed: 1
  local_guard_cases: 4
  workflow_yaml_files_parsed: 3
completed: 2026-06-01
---

# Phase 28 Plan 28-01 Summary

## Outcome

Added a single explicit container architecture control path for Gala AWS/SST deploys while keeping the default on `x86_64`.

## Changes

- Added `GALA_CONTAINER_ARCHITECTURE` validation in `infra/sst.config.ts` with allowed values `x86_64` and `arm64`.
- Routed the validated architecture through shared `railsTaskDefaults`, covering web, worker, migration, seed, refresh, and scheduled task definitions.
- Added deploy-script architecture mapping:
  - `x86_64` -> `linux/amd64` -> ECS `X86_64`
  - `arm64` -> `linux/arm64` -> ECS `ARM64`
- Propagated `GALA_CONTAINER_ARCHITECTURE` through `run_sst_cmd`.
- Added workflow dispatch architecture selection to deploy, preview, and promote-production workflows without changing current confirmations or secret boundaries.
- Added ECS-only rollout protection: `GALA_ECS_ONLY_DEPLOY=true` now refuses if the current web or worker task definition architecture does not match the requested architecture.
- Added `scripts/ops/test-deploy-sst-architecture-guard.sh`, a local fake-AWS regression test for dry-run and live ECS-only guard paths.
- Created `28-DECISION.md` with the ARM64 assumption audit.
- Updated active operator guardrails to state that the first architecture transition must use the full SST task-definition deployment path.

## Validation

| Check | Result | Evidence |
| --- | --- | --- |
| Shell syntax | PASS | `bash -n scripts/deploy-sst.sh scripts/ops/test-deploy-sst-architecture-guard.sh` exited 0. |
| ECS-only architecture guard regression | PASS | `bash scripts/ops/test-deploy-sst-architecture-guard.sh` passed dry-run mismatch, live mismatch, dry-run match, and live match cases. |
| Workflow YAML parse | PASS | Ruby parsed `.github/workflows/deploy.yml`, `.github/workflows/preview.yml`, and `.github/workflows/promote-production.yml`. |
| Decision audit assertion | PASS | `rg -n "ARM64 Assumption Audit|x86_64|linux/amd64|GALA_ECS_ONLY_DEPLOY|GALA_PRODUCTION_BASE_IMAGE|rollback task-definition" 28-DECISION.md` found the required evidence. |
| Architecture source assertion | PASS | `rg -n "GALA_CONTAINER_ARCHITECTURE|DOCKER_PLATFORM|linux/arm64|linux/amd64|containerArchitecture|architecture" infra/sst.config.ts scripts/deploy-sst.sh .github/workflows` found the new control path. |
| SST TypeScript check | PARTIAL | `cd infra && npm exec tsc -- --noEmit` still exits 2 from existing generated SST/Bun/Node type conflicts and missing `sst/config/tsconfig.json`; filtered diagnostics show the new architecture union type errors were removed. |

## Mutation Boundary

No AWS deploy, SST deploy, Heroku command, DNS mutation, SES mutation, or retained media bucket mutation was run.

## Deviations

- The full `tsc --noEmit` command remains blocked by existing generated SST type environment issues, matching prior Phase 26 behavior. The Phase 28 source-specific architecture typing issue was fixed and no longer appears in filtered diagnostics.

## Next

Plan 28-02 can continue the preview/dev validation loop with ARM64 image build, pre-ARM dev rollback capture, and read-only dev SST render evidence.
