---
phase: 28
slug: verify-arm-ecs-fargate-runtime-architecture-and-resolve-thru
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-01
---

# Phase 28 - Validation Strategy

> Validation contract for ARM64 ECS/Fargate proof and Thruster architecture
> closure. Live AWS steps are operator-gated; incomplete manual evidence blocks
> ARM64 production default instead of being treated as a pass.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Source assertions, shell syntax/tests, Docker BuildKit/buildx, SST CLI diff, AWS ECS read-only inspection, dev ECS live proof |
| **Config file** | `infra/sst.config.ts`, `scripts/deploy-sst.sh`, GitHub workflow env, active AWS operator docs |
| **Quick run command** | `rg -n "architecture|GALA_CONTAINER_ARCHITECTURE|DOCKER_PLATFORM|runtimePlatform|linux/arm64|linux/amd64|Thruster|thruster" infra/sst.config.ts scripts/deploy-sst.sh .github/workflows docs .planning/phases/28-verify-arm-ecs-fargate-runtime-architecture-and-resolve-thru` |
| **Full source suite command** | `cd infra && npm exec tsc -- --noEmit` plus `bash -n scripts/deploy-sst.sh scripts/ops/test-deploy-sst-architecture-guard.sh` plus `bash scripts/ops/test-deploy-sst-architecture-guard.sh` plus workflow YAML parse. |
| **Estimated runtime** | ~5-15 minutes for local Docker ARM64 builds on a warm builder; dev ECS proof can take longer depending on image push and service stabilization. |

---

## Sampling Rate

- **After every source/doc task:** Run the quick source assertion command.
- **After architecture guard tasks:** Run shell syntax plus `scripts/ops/test-deploy-sst-architecture-guard.sh`.
- **After image tasks:** Build ARM64 base/app images, inspect `linux/arm64`, and run a runtime smoke command.
- **Before live deploy:** Confirm pre-ARM dev web and worker task definitions are captured.
- **Before `$gsd-verify-work`:** ARM adoption requires dev ECS live proof plus rollback proof; otherwise final decision must be `Decision: keep-amd64`.
- **Max feedback latency:** 15 minutes for source checks; live dev deployment and rollback are operator-gated manual samples.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Command / Evidence | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|--------------------|-------------|--------|
| 28-01-01 | 01 | 1 | Phase goal | T-28-01 | Source audit names every amd64/x86 assumption without mutating AWS | source review | `rg -n "ARM64 Assumption Audit|x86_64|linux/amd64|GALA_ECS_ONLY_DEPLOY|GALA_PRODUCTION_BASE_IMAGE" 28-DECISION.md` | yes | pending |
| 28-01-02 | 01 | 1 | Phase goal | T-28-02 | Architecture knob keeps Docker platform aligned with ECS/SST architecture | source/type/syntax | `cd infra && npm exec tsc -- --noEmit`; `bash -n scripts/deploy-sst.sh`; workflow YAML parse | yes | pending |
| 28-01-03 | 01 | 1 | Phase goal | T-28-03 | ECS-only rollout refuses architecture transitions unless current task definitions already match | source assertion | `rg -n "runtimePlatform|cpuArchitecture|GALA_ECS_ONLY_DEPLOY|GALA_CONTAINER_ARCHITECTURE|describe-task-definition" scripts/deploy-sst.sh docs/ops/workflows/operator-guardrails.md` | yes | pending |
| 28-01-04 | 01 | 1 | Phase goal | T-28-04 | Guard behavior is proven without real AWS mutation | shell test | `bash scripts/ops/test-deploy-sst-architecture-guard.sh` | yes | pending |
| 28-02-01 | 02 | 2 | Phase goal | T-28-05 | ARM64 image proof uses dev-safe local/ECR paths and no production tag mutation | Docker build/smoke | Build base, build app, inspect `linux/arm64`, run `docker run --rm --platform linux/arm64 gala-production:phase28-arm64 ruby -v` | yes | pending |
| 28-02-02 | 02 | 2 | Phase goal | T-28-06 | Rollback source task definitions are captured before ARM rollout | AWS read-only | `aws ecs describe-services` and `aws ecs describe-task-definition` for dev web/worker | yes | pending |
| 28-02-03 | 02 | 2 | Phase goal | T-28-07 | SST renders ARM64 task definitions through read-only diff before live deploy | SST diff | `cd infra && AWS_PROFILE=gala AWS_REGION=us-west-2 SST_STAGE=dev GALA_CONTAINER_ARCHITECTURE=arm64 GALA_PRODUCTION_BASE_IMAGE=353760060567.dkr.ecr.us-west-2.amazonaws.com/gala-production-base:ruby4.0.3-bookworm-pg17-runtime-v1-arm64 npx sst diff --stage dev --json > /tmp/phase28-arm64-sst-diff.json` | yes | pending |
| 28-03-01 | 03 | 3 | Phase goal | T-28-08 | Live proof is limited to dev AWS and records runtime evidence without secrets | manual AWS | Dev ARM64 deploy plus `/up`, worker log, migration safe command, and one-off safe command evidence | yes | pending |
| 28-03-02 | 03 | 3 | Phase goal | T-28-09 | Rollback proof covers web and worker task definitions before production default flip | manual AWS | Dev rollback dry run and live drill for `service=both`, followed by web `/up` and worker stability evidence | yes | pending |
| 28-04-01 | 04 | 4 | Phase goal | T-28-10 | Final ARM decision is evidence-gated and includes all requested tradeoff dimensions | doc assertion | `rg -n "ARM64 Tradeoff Analysis|Decision: adopt-arm64|Decision: keep-amd64|reopening criteria" 28-DECISION.md` | yes | pending |
| 28-04-02 | 04 | 4 | Phase goal | T-28-11 | Source defaults and docs match final decision without weakening gates | type/syntax/doc | TypeScript, shell syntax, workflow YAML parse, final ARM `rg` check | yes | pending |
| 28-04-03 | 04 | 4 | Phase goal | T-28-12 | Thruster decision avoids duplicating CloudFront/S3 static asset serving | source/doc assertion | `rg -n "Thruster|thruster|thrust" docs Dockerfile.production Gemfile .planning/ROADMAP.md 28-DECISION.md` | yes | pending |

---

## Wave 0 Requirements

Existing infrastructure covers this phase. No new test framework is required.

Required setup before live ARM proof:

- Docker BuildKit/buildx can build `linux/arm64` images locally or through a
  documented dev-safe ECR fallback.
- An explicit ARM64 production base image tag exists in the Gala ECR account or
  can be built and pushed through an operator-approved dev-safe step.
- AWS credentials are scoped to `AWS_PROFILE=gala AWS_REGION=us-west-2`.
- `SST_STAGE=dev` is used for the first live validation.
- Pre-ARM dev web and worker task definition ARNs are captured before any ARM
  rollout.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions | Failure Behavior |
|----------|-------------|------------|-------------------|------------------|
| Dev ARM64 ECS deployment | D-02 to D-05 | Starts real AWS tasks and may push images | Deploy only to `dev`, then verify web `/up`, worker logs, migration safe command, and one-off safe command. | Record blocker and keep production on amd64. |
| Dev rollback drill | D-20 to D-23 | Mutates dev ECS service task definitions | Capture pre-ARM web/worker task definitions before deploy, deploy ARM64, roll both services back, then verify service stability. | Record blocker and keep production on amd64. |
| Production default flip decision | D-04, D-06, D-09, D-20, D-23 | Requires interpreting evidence and rollback proof | Flip production defaults only if build, dev runtime, and rollback evidence are complete. | `Decision: keep-amd64` with reopening criteria. |
| Thruster no-adopt decision | D-10 to D-15 | Architecture fit is evidence-based, not purely mechanical | Confirm official docs were checked, active references do not imply adoption, and no-adopt note names CloudFront/S3/Puma reasons. | Keep no-adopt unless a Gala-specific dynamic-path proof is recorded. |

---

## Validation Sign-Off

- [x] All source tasks have automated source, syntax, type, or shell regression checks.
- [x] ARM64 image proof includes build, architecture inspection, and runtime smoke.
- [x] Pre-ARM rollback capture is explicitly before live ARM deployment.
- [x] Manual AWS checks are operator-gated and failure blocks ARM64 adoption.
- [x] No watch-mode flags.
- [x] Feedback latency target is explicit for local/source checks.
- [x] `nyquist_compliant: true` reflects the combination of automated local checks plus explicit manual blocking gates.

**Approval:** pending execution
