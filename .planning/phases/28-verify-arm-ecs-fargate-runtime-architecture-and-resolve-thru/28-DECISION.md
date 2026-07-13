# Phase 28 Architecture Decision Log

## ARM64 Assumption Audit

| Area | Evidence | Phase 28 control |
| --- | --- | --- |
| SST task architecture | `infra/sst.config.ts:80` reads `GALA_CONTAINER_ARCHITECTURE` with default `x86_64`; `infra/sst.config.ts:382` feeds the validated value into `railsTaskDefaults`, which is shared by web, worker, migration, seed, refresh, and scheduled tasks. | One SST source now controls web, worker, migration, and one-off task architecture. |
| Docker image platform | `scripts/deploy-sst.sh:292` maps `x86_64` to `linux/amd64`; `scripts/deploy-sst.sh:296` maps `arm64` to `linux/arm64`; `scripts/deploy-sst.sh:1092` builds with `--platform "$DOCKER_PLATFORM"`. | Docker platform and ECS/SST architecture are selected from the same deploy input. |
| Workflow base image references | `.github/workflows/deploy.yml:68`, `.github/workflows/preview.yml:45`, and `.github/workflows/promote-production.yml:51` still set `GALA_PRODUCTION_BASE_IMAGE` to the existing explicit production base image tag. | ARM64 proof must provide or build an explicit ARM64-compatible base image; no mutable `latest` dependency is introduced. |
| Production ECS-only behavior | `.github/workflows/deploy.yml:74` keeps `GALA_ECS_ONLY_DEPLOY=true` for production deploys; `scripts/deploy-sst.sh:823` refuses mismatched current task-definition architecture before ECS-only rollout. | ECS-only remains image-only and cannot perform the first ARM64 transition. |
| rollback task-definition lane | `.github/workflows/rollback.yml:17` exposes `lane=task_definition`; `.github/workflows/rollback.yml:31` and `.github/workflows/rollback.yml:36` accept web and worker task definitions; `docs/ops/workflows/rollback.md:33` documents task-definition rollback limits. | The existing rollback lane is the ARM64 recovery path to prove in dev before any production default flip. |
| Operator guardrails | `docs/ops/workflows/operator-guardrails.md:77` documents `GALA_CONTAINER_ARCHITECTURE`; `docs/ops/workflows/operator-guardrails.md:79` documents that ECS-only rollout must not perform the first architecture transition. | Operators have active docs for the full SST task-definition transition path. |

No AWS, Heroku, DNS, SES, or retained media bucket mutation was run for this
initial audit.

## Pre-ARM Dev Rollback Capture

Before the ARM64 transition, dev services were stable on the existing X86_64
task definitions and image:

| Service | Captured task definition | Image | Runtime |
| --- | --- | --- | --- |
| Web | `gala-dev-GalaClusterCluster-zeeusfkv-GalaWeb:10` | `353760060567.dkr.ecr.us-west-2.amazonaws.com/gala:gsd-audit-uat.dev.20260601070800` | `X86_64` |
| Worker | `gala-dev-GalaClusterCluster-zeeusfkv-GalaWorker:9` | `353760060567.dkr.ecr.us-west-2.amazonaws.com/gala:gsd-audit-uat.dev.20260601070800` | `X86_64` |

The intended rollback target was direct ECS service update back to these captured
task definition ARNs through the task-definition rollback lane.

## Dev ARM64 Render Evidence

An explicit ARM64 base image was built and pushed because the GitHub workflow
base image inputs intentionally reference immutable production base tags:

- Base image: `353760060567.dkr.ecr.us-west-2.amazonaws.com/gala-production-base:ruby4.0.3-bookworm-pg17-runtime-v1-arm64`
- Local runtime proof: `docker run --rm --platform linux/arm64 gala-production:phase28-arm64 ruby -v`
- Read-only SST proof: `/tmp/phase28-arm64-sst-diff.json`

The read-only SST diff showed `GalaWebTask` and `GalaWorkerTask` moving to
`runtimePlatform.cpuArchitecture = ARM64` when `GALA_CONTAINER_ARCHITECTURE=arm64`
is set. No production or `.com` mutation was part of this render.

## Dev ARM64 Runtime Evidence

The successful dev ARM64 deploy used release `20260601153500.abcdef9` with:

```sh
AWS_PROFILE=gala AWS_REGION=us-west-2 SST_STAGE=dev \
GALA_CONTAINER_ARCHITECTURE=arm64 \
GALA_PRODUCTION_BASE_IMAGE=353760060567.dkr.ecr.us-west-2.amazonaws.com/gala-production-base:ruby4.0.3-bookworm-pg17-runtime-v1-arm64 \
/opt/homebrew/bin/bash scripts/deploy-sst.sh --stage dev \
  --branch infra/sst-aws-poc --release-id 20260601153500.abcdef9 \
  --invalidate-cache
```

Evidence:

| Check | Result |
| --- | --- |
| ECR app image | `353760060567.dkr.ecr.us-west-2.amazonaws.com/gala:20260601153500.abcdef9`, digest `sha256:31da80da51bd629f226c7730e5dc6843954ecd3ed9028b8c6ea630e8ab97a203` |
| Web service | `GalaWeb:11`, `ARM64`, desired `1`, running `1`, rollout `COMPLETED` |
| Worker service | `GalaWorker:10`, `ARM64`, desired `1`, running `1`, rollout `COMPLETED` |
| Migration task definition | `GalaMigrate:11`, `ARM64`, same app image |
| HTTP health | `https://dev.learngala.dev/up` returned HTTP `200` |
| Worker runtime | Sidekiq booted and processed Ahoy jobs under the ARM64 task definition |
| One-off `db:version` | ECS task `ec40654e66be4ff0bb774e37d9f957a3`, exit `0`, current version `20250107000000` |
| One-off runner | ECS task `12916a51e9f14be89f0670fc703d3bca`, exit `0`, output `ok` |

Host note: macOS `/bin/bash` lacks `mapfile`; the deploy had to invoke
`/opt/homebrew/bin/bash` for the script itself, not only the outer shell.

## Dev Rollback Evidence

The dry-run rollback lane printed the expected `aws ecs update-service` commands
from current ARM64 `GalaWeb:11`/`GalaWorker:10` back to captured
`GalaWeb:10`/`GalaWorker:9`.

The live direct rollback failed:

```text
An error occurred (ClientException) when calling the UpdateService operation:
TaskDefinition is inactive
```

Only the current ARM64 revisions were active. Prior X86_64 revisions, including
the captured rollback targets, had been deregistered. Recovery required manually
re-registering active X86_64 copies from the inactive captured task definitions:

| Service | Recovery task definition | Image | Runtime | Final state |
| --- | --- | --- | --- | --- |
| Web | `GalaWeb:12` | `gala:gsd-audit-uat.dev.20260601070800` | `X86_64` | desired `1`, running `1`, rollout `COMPLETED` |
| Worker | `GalaWorker:11` | `gala:gsd-audit-uat.dev.20260601070800` | `X86_64` | desired `1`, running `1`, rollout `COMPLETED` |

Post-recovery `https://dev.learngala.dev/up` returned HTTP `200`. Worker logs
showed the ARM worker shutting down cleanly and a new X86_64 worker booting
Rails 8.1.3 on Ruby 4.0.3.

## ARM64 Tradeoff Analysis

| Dimension | ARM64 | X86_64 current |
| --- | --- | --- |
| Cost | Likely lower Fargate CPU/memory pricing for equivalent steady tasks. | Known cost profile; no immediate migration savings. |
| Performance | Dev web, worker, migration, and one-off tasks ran successfully, but no production load comparison exists. | Known production-like behavior and current tuning assumptions. |
| Future-proofing | Aligns with AWS Graviton direction and may improve long-term price/performance. | Broadest gem/native-binary compatibility and least surprise. |
| Build speed | Requires explicit ARM64 base images and platform-aware buildx paths. | Existing base images and promotion paths already work. |
| Compatibility | Ruby/Rails path worked in dev; third-party native extension risk still requires release validation. | Proven for current app image, jobs, and maintenance tasks. |
| Operational simplicity | Adds architecture as a release variable and requires a first-transition full SST deploy. | Keeps ECS-only image promotion and rollback mental model simpler. |
| Long-term maintenance | Worth revisiting once rollback workflow preserves active targets or re-registers copies automatically. | Lower immediate maintenance burden. |
| Rollback | Direct rollback proof failed because captured task definitions were inactive. | Direct rollback remains the known safe default after re-registering recovery copies. |

## Final ARM64 Decision

Decision: keep-amd64

ARM64 is technically viable in dev for web, worker, migration, and safe one-off
tasks, but it does not pass the production default gate because task-definition
rollback proof failed. The first production architecture transition must not use
the ECS-only image path, and production defaults must not flip until rollback can
handle inactive captured task definitions without manual operator surgery.

Reopening criteria:

1. Update rollback workflow/operator docs to either preserve active rollback task
   definitions or re-register inactive task-definition copies before
   `update-service`.
2. Rerun the dev ARM64 full SST deploy.
3. Prove direct rollback through the documented workflow, with `dry_run=true`
   first and a live rollback second.
4. Capture web, worker, migration, one-off, `/up`, log, and task-definition
   architecture evidence again.

## Thruster Decision

Decision: no-adopt

Basecamp's current Thruster README describes it as an HTTP/2 proxy that runs
beside Puma for simple Rails deployments, with automatic TLS, public asset
caching, compression, X-Sendfile, and a single-container open-Internet model.
Gala's AWS design already terminates and caches at CloudFront, stores
fingerprinted static assets in S3 release prefixes, and runs dynamic Rails
compute behind ECS/ALB/Puma. Adding Thruster now would create another proxy and
configuration surface without solving the phase's dynamic Rails compute,
CloudFront cache, or task-definition rollback concerns.
