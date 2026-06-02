---
phase: 32
status: complete
verified_at: 2026-06-02T04:02:21Z
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
- After the GitHub ARM64 preview failure and slow QEMU retry,
  `ruby scripts/ops/test-workflow-architecture-defaults.rb` also verifies
  deploy, preview, promote, and rollback release-redeploy workflows select the
  native `ubuntu-24.04-arm` runner for ARM64 deploy builds.
- `GALA_TEST_AUTH_BASE_URL=https://infra-sst-aws-poc.dev.learngala.dev ./run-rspec.sh spec/requests/devise_reader_routes_spec.rb`
  passed: 11 examples, 0 failures.

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
- Follow-up QEMU source fix reached the Docker build but was intentionally
  canceled before deploy because ARM64 emulation was too slow for the deploy
  path.

## GitHub Preview Run 26797189665

- Dispatched `preview.yml` from `infra/sst-aws-poc` at
  `3ff7f8fa2b8e64c9e96b4b8b492428a548dca81e`.
- Workflow selected the native `ubuntu-24.04-arm` runner and completed
  successfully in 5m33s.
- Workflow selected the ARM64 production base image:
  `353760060567.dkr.ecr.us-west-2.amazonaws.com/gala-production-base:ruby4.0.3-bookworm-pg17-runtime-v1-arm64`.
- Workflow built and pushed `linux/arm64` image
  `353760060567.dkr.ecr.us-west-2.amazonaws.com/gala:26797189665.20260602035020.3ff7f8fa`.
- Workflow completed the dev deploy with release
  `26797189665.20260602035020.3ff7f8fa`.

## Dev Runtime After ARM64 Deploy

- `aws ecs wait services-stable` passed for `GalaWeb` and `GalaWorker`.
- `GalaWeb` is desired `1`, running `1`, pending `0`, rollout `COMPLETED`,
  task definition `GalaWeb:17`.
- `GalaWorker` is desired `1`, running `1`, pending `0`, rollout `COMPLETED`,
  task definition `GalaWorker:16`.
- `GalaWeb:17` and `GalaWorker:16` report
  `runtimePlatform.cpuArchitecture = ARM64`.
- Auxiliary task definitions `GalaMigrate:16`, `GalaSeedDatabase:15`,
  `GalaRefreshIndices:15`, and `GalaWeeklyReport:15` report
  `runtimePlatform.cpuArchitecture = ARM64`.
- All ARM64 task definitions point at image
  `353760060567.dkr.ecr.us-west-2.amazonaws.com/gala:26797189665.20260602035020.3ff7f8fa`.
- `https://infra-sst-aws-poc.dev.learngala.dev/up` returned HTTP `200`.

## Live Auth Validation

- Live sign-up smoke against
  `https://infra-sst-aws-poc.dev.learngala.dev/readers` with
  `codex-arm64-smoke-2720c3a2aee8@example.com` returned raw HTTP `302` and did
  not reproduce the reported `500`.
- Live sign-in smoke against
  `https://infra-sst-aws-poc.dev.learngala.dev/readers/sign_in` with the
  reported `papester1+01@gmail.com` credential shape returned raw/final HTTP
  `200` and did not reproduce the reported `4XX`.
- CloudWatch route query
  `f14a36b3-8c14-4ca3-a655-10940d3a5ee7` shows the sign-up smoke as
  `POST /readers`, `Readers::RegistrationsController#create`, status `302`.
- CloudWatch route query
  `f14a36b3-8c14-4ca3-a655-10940d3a5ee7` shows the reported sign-in smoke as
  `POST /readers/sign_in`, `Readers::SessionsController#create`, followed by
  `Readers::SessionsController#new`, status `200`.
- A broad status/error CloudWatch query
  `9708cc64-cc83-434d-9a78-1145de31f22f` found unrelated external scanner
  routing errors such as `/.git`, `/wp-config.php`, `/boaform`, and `/login`,
  but no `InvalidAuthenticityToken`, SMTP auth failure, `POST /readers` 500, or
  `POST /readers/sign_in` 4XX/5XX evidence for the smoke window.

## Residual Follow-Up

- GitHub run `26797189665` emitted Node.js 20 deprecation warnings for upstream
  GitHub Actions dependencies. The warning is not ARM64-specific and should be
  handled by a separate workflow dependency refresh.
- Local TypeScript no-emit for `infra/` remains blocked by generated SST
  platform typings and is recorded above; live SST diff and GitHub deploy
  validation covered the ARM64 runtime path for this phase.
