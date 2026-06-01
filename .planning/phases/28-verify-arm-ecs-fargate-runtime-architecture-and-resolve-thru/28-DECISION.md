# Phase 28 Architecture Decision Log

## ARM64 Assumption Audit

| Area | Evidence | Phase 28 control |
| --- | --- | --- |
| SST task architecture | `infra/sst.config.ts:80` reads `GALA_CONTAINER_ARCHITECTURE` with default `x86_64`; `infra/sst.config.ts:382` feeds the validated value into `railsTaskDefaults`, which is shared by web, worker, migration, seed, refresh, and scheduled tasks. | One SST source now controls web, worker, migration, and one-off task architecture. |
| Docker image platform | `scripts/deploy-sst.sh:292` maps `x86_64` to `linux/amd64`; `scripts/deploy-sst.sh:296` maps `arm64` to `linux/arm64`; `scripts/deploy-sst.sh:1092` builds with `--platform "$DOCKER_PLATFORM"`. | Docker platform and ECS/SST architecture are selected from the same deploy input. |
| Workflow base image references | `.github/workflows/deploy.yml:68`, `.github/workflows/preview.yml:45`, and `.github/workflows/promote-production.yml:51` still set `GALA_PRODUCTION_BASE_IMAGE` to the existing explicit production base image tag. | ARM64 proof must provide or build an explicit ARM64-compatible base image; no mutable `latest` dependency is introduced. |
| Production ECS-only behavior | `.github/workflows/deploy.yml:74` keeps `GALA_ECS_ONLY_DEPLOY=true` for production deploys; `scripts/deploy-sst.sh:823` refuses mismatched current task-definition architecture before ECS-only rollout. | ECS-only remains image-only and cannot perform the first ARM64 transition. |
| rollback task-definition lane | `.github/workflows/rollback.yml:17` exposes `lane=task_definition`; `.github/workflows/rollback.yml:31` and `.github/workflows/rollback.yml:36` accept web and worker task definitions; `docs/ops/workflows/rollback.md:33` documents task-definition rollback limits. | The existing rollback lane is the ARM64 recovery path to prove in dev before any production default flip. |
| Operator guardrails | `docs/ops/workflows/operator-guardrails.md:74` documents `GALA_CONTAINER_ARCHITECTURE`; `docs/ops/workflows/operator-guardrails.md:76` documents that ECS-only rollout must not perform the first architecture transition. | Operators have active docs for the full SST task-definition transition path. |

No AWS, Heroku, DNS, SES, or retained media bucket mutation was run for this audit.
