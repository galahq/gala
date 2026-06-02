---
phase: 32
status: source_validated_with_external_validation_pending
verified_at: 2026-06-02T03:17:53Z
---

# Phase 32 Verification

## Verified Source Decisions

- `infra/sst.config.ts` defaults `GALA_CONTAINER_ARCHITECTURE` to `arm64`.
- `scripts/deploy-sst.sh` defaults to ARM64 and still rejects invalid
  architectures.
- Deploy, preview, and promote workflows default `container_architecture` to
  `arm64`.
- Workflows select the immutable base image that matches the requested
  architecture.
- Production ARM64 deploys use the full SST task-definition deployment path;
  ECS-only remains available only when task definitions already match.
- Rollback release redeploy defaults to ARM64.
- Thruster remains no-adopt and no runtime dependency is added.

## Local Validation

- `ruby scripts/ops/test-workflow-architecture-defaults.rb` passed.
- `GALA_TEST_DEV_HTTPS_BASE_URL=https://dev.learngala.dev bash scripts/ops/test-deploy-sst-architecture-guard.sh` passed.
- `bash -n scripts/deploy-sst.sh` passed.
- `bash -n scripts/ops/test-deploy-sst-architecture-guard.sh` passed.
- `ruby -c scripts/ops/test-workflow-architecture-defaults.rb` passed.
- `node --check scripts/ops/generate-spend-report.mjs` passed.
- `git diff --check` passed.
- After the GitHub ARM64 preview failure, `ruby scripts/ops/test-workflow-architecture-defaults.rb`
  also verifies `docker/setup-qemu-action@v3` is present for ARM64 Docker
  builds in deploy, preview, promote, and rollback release-redeploy workflows.

## Read-Only AWS/SST Evidence

- AWS account confirmed through `aws sts get-caller-identity`: `353760060567`.
- ARM64 base image exists in ECR:
  `gala-production-base:ruby4.0.3-bookworm-pg17-runtime-v1-arm64`,
  digest `sha256:bdc4c6229e8ebac5db35c0ca4ca98622662ca96f53e73b059cafef69099e7d61`.
- x86_64 base image remains available for explicit override:
  `gala-production-base:ruby4.0.3-bookworm-pg17-runtime-v1`,
  digest `sha256:2edf74a2f3bcc4bb7ab62df8a5be7ee430f13156827e462bc780eefef7c9ab86`.
- Read-only `npx sst diff --stage dev` with `GALA_CONTAINER_ARCHITECTURE=arm64`
  rendered `runtimePlatform.cpuArchitecture = ARM64` for web, worker,
  migration, seed, weekly report, and refresh task definitions.
- Local TypeScript no-emit remains blocked by generated SST platform typings:
  missing `.sst/platform/types.generated`, duplicate nested Node/Bun type
  declarations, and missing `sst/config/tsconfig.json`, even after `npm ci`
  and `npx sst install`.

## GitHub Preview Run 26796357841

- Dispatched `preview.yml` from `infra/sst-aws-poc` with
  `container_architecture=arm64` and `dry_run=false`.
- Workflow selected the ARM64 base image and invoked
  `docker build --platform linux/arm64`.
- The deploy failed before image completion with `exec /bin/sh: exec format
  error` because the GitHub x86 runner did not have QEMU/binfmt registered for
  ARM64 build steps.
- Follow-up source fix adds `docker/setup-qemu-action@v3` with
  `platforms: arm64` before Docker-building deploy steps.

## Current Dev Baseline Before ARM64 Workflow Dispatch

- Dev `GalaWeb` and `GalaWorker` services were `COMPLETED`, desired `1`, running
  `1`.
- Dev web task definition `GalaWeb:16` and worker task definition
  `GalaWorker:15` currently report `X86_64`.
- `https://infra-sst-aws-poc.dev.learngala.dev/up` returned HTTP `200`.

## External Validation Required

1. Dispatch GitHub preview with `container_architecture=arm64`.
2. Verify the workflow logs selected the ARM64 base image.
3. Use AWS CLI to confirm web and worker task definitions report `ARM64`.
4. Verify preview `/up`, sign-up, and sign-in through env-provided HTTPS base
   URLs.
5. Run production dry-run/full SST path before any production ARM64 mutation.
