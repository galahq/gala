---
phase: 28
status: complete
created: 2026-06-01
---

# Phase 28 Research: ARM ECS Fargate Runtime And Thruster Fit

## Research Question

What needs to be known to plan a safe ARM64 validation path for Gala's ECS
Fargate web, worker, migration, and one-off task model, and how should the
prior Thruster spike be resolved against Gala's CloudFront/S3 static asset plus
ECS Puma dynamic compute architecture?

## Current Source Facts

### AWS ECS And Fargate ARM64

- Amazon ECS supports 64-bit ARM applications on AWS Graviton, including
  application server and microservice workloads. For Fargate, ARM64 workloads
  must be Linux tasks on Fargate platform version 1.4.0 or later.
  Source: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-arm64.html
- ECS task definitions select ARM by setting `runtimePlatform.cpuArchitecture`
  to `ARM64` with `operatingSystemFamily` set to `LINUX`.
  Source: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-arm-specifying.html
- Fargate task definition parameters default `cpuArchitecture` to `X86_64`
  when left null, and all task definitions used by a service must use the same
  value for the runtime platform fields.
  Source: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html
- The ECS `RuntimePlatform` API accepts `X86_64` and `ARM64`; ARM64 is valid
  for Linux containers on Fargate.
  Source: https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_RuntimePlatform.html
- AWS Fargate pricing is architecture-aware. The pricing page lists Linux/X86
  and Linux/ARM dimensions, and its public example for US East (N. Virginia)
  shows lower vCPU and memory rates for Linux/ARM than Linux/X86. This is cost
  evidence, not a Gala-specific performance result.
  Source: https://aws.amazon.com/fargate/pricing/
- AWS's Graviton2 Fargate announcement claims up to 40% better price/performance
  and 20% lower cost versus comparable x86 Fargate for several workload classes.
  Treat this as a vendor-level claim requiring Gala-specific validation.
  Source: https://aws.amazon.com/about-aws/whats-new/2021/11/aws-fargate-amazon-ecs-aws-graviton2-processors/
- Fargate Spot also supports Graviton-based compute for ARM64 tasks on Fargate
  platform version 1.4.0 or later. This matters because Gala's non-production
  SST services currently use spot capacity.
  Source: https://aws.amazon.com/about-aws/whats-new/2024/09/amazon-ecs-graviton-based-spot-compute-fargate/

### SST Architecture Controls

- `sst.aws.Service` exposes `architecture?: "x86_64" | "arm64"` and defaults
  to `x86_64`. SST docs say to check Linux/ARM prices when using `arm64`.
  Source: https://sst.dev/docs/component/aws/service/
- `sst.aws.Task` exposes the same `architecture?: "x86_64" | "arm64"` setting
  and also defaults to `x86_64`.
  Source: https://sst.dev/docs/component/aws/task
- Gala already has one shared `railsTaskDefaults` object in
  `infra/sst.config.ts`; it currently sets `architecture: "x86_64" as const`
  before web, worker, migration, seed, refresh, and scheduled task definitions
  consume the defaults.

### Gala Local Architecture Facts

- `scripts/deploy-sst.sh` currently builds the production app image with
  `docker build --platform linux/amd64`. This must match the SST/ECS task
  architecture or ECS will try to start an image for the wrong CPU.
- `Dockerfile.production` builds the app image from an explicit
  `GALA_PRODUCTION_BASE_IMAGE`. The final runtime stage uses that base image,
  so ARM proof also requires an ARM64-compatible production base image.
- `Dockerfile.production-base` uses `ruby:${RUBY_VERSION}-slim-bookworm` and
  installs runtime packages including `libvips`, `wkhtmltopdf`, fonts,
  `libjemalloc2`, and `postgresql-client-17`. These packages must be proven
  available for `linux/arm64`, not assumed.
- `Gemfile.lock` already includes `aarch64-linux`, `arm64-darwin-24`, and
  `x86_64-linux` platforms, and includes ARM Linux native variants for key
  gems such as `nokogiri` and `pg`. This lowers, but does not eliminate, native
  dependency risk; `sassc`, `ffi`, PDF/image packages, and full asset
  precompile still need container build proof.
- Production deploy workflow defaults deserve special attention:
  `.github/workflows/deploy.yml` sets `GALA_ECS_ONLY_DEPLOY=true` for
  production. ECS-only rollout currently re-registers from the existing task
  definition and preserves `runtimePlatform`; it is suitable for image-only
  promotion but not for the first architecture transition unless it is changed
  or explicitly bypassed.
- Rollback already has a task-definition lane covering web, worker, and both
  services through `.github/workflows/rollback.yml` and
  `docs/ops/workflows/rollback.md`. ARM adoption should prove this lane in dev
  before production defaults change.

### Thruster And Rails Static Asset Model

- Rails 8 release notes describe Thruster as a proxy in front of Puma providing
  X-Sendfile acceleration, asset caching, and asset compression.
  Source: https://guides.rubyonrails.org/8_0_release_notes.html
- The Basecamp Thruster README describes Thruster as an HTTP/2 proxy that runs
  alongside Puma, with automatic TLS, basic public asset caching, X-Sendfile,
  compression, and process wrapping for Puma. It says the original target was a
  single-container Rails app directly on the open internet.
  Source: https://github.com/basecamp/thruster
- Rails' asset pipeline guide describes CDNs as the production best practice
  when serving static assets, and notes that CDN-served assets do not touch the
  Rails server when served from cache.
  Source: https://guides.rubyonrails.org/asset_pipeline.html#cdns
- Gala's current AWS architecture already uploads fingerprinted/static assets to
  S3 release prefixes and serves them through CloudFront. The app CloudFront
  distribution keeps the dynamic Rails default behavior uncached while caching
  only selected anonymous public catalog JSON paths. Puma remains the Rails
  dynamic compute path behind ECS/ALB.

## Architecture Implications

### ARM64

ARM64 is a credible target for Gala and worth validating. The current blockers
are not conceptual AWS support; they are operational proof:

1. The reusable production base image must build and run for `linux/arm64`.
2. The production app image must build for `linux/arm64` from an ARM64 base.
3. SST must render ARM64 task definitions for services and tasks.
4. Dev ECS must prove web `/up`, worker boot/logs, migration safe command, and
   one-off safe command on ARM64.
5. The existing production ECS-only promotion path must not be allowed to push
   an ARM64 image into an x86 task definition.
6. Web and worker task-definition rollback must be proven in dev after the ARM
   rollout.

Recommendation for planning: add a small, explicit architecture knob across SST
and deploy tooling, validate it in dev, and only flip production defaults to
ARM64 if the dev runtime and rollback evidence is complete. If evidence is
incomplete or mixed, retain the current amd64/x86_64 default and document exact
reopening criteria.

### Thruster

Thruster should be treated as a no-adopt decision unless execution finds a
Gala-specific dynamic-path benefit that is cheap to prove. The official sources
show real value for direct-to-internet or single-container Rails deployments:
TLS, HTTP/2, public asset caching, static-file compression, X-Sendfile, and Puma
process wrapping. Gala already delegates TLS/CDN/static asset caching to
CloudFront and S3, and has one Puma process under ECS service supervision.

The only plausible remaining reasons to revisit Thruster would be:

- Gala starts serving large protected files through Rails where X-Sendfile maps
  to a measured bottleneck.
- CloudFront/S3 asset serving is intentionally removed.
- A current production incident shows Puma needs a local reverse proxy behavior
  that ALB/CloudFront/ECS do not provide.

Until one of those exists, adding Thruster would add another process and proxy
layer without a proven benefit in the current AWS design.

## Validation Architecture

### Static Source Assertions

- `infra/sst.config.ts` has a single architecture setting that feeds web,
  worker, migration, seed, refresh, and scheduled task definitions.
- `scripts/deploy-sst.sh` has one validated mapping between ECS/SST
  architecture (`x86_64` or `arm64`) and Docker build platform
  (`linux/amd64` or `linux/arm64`).
- ECS-only rollout refuses or clearly blocks architecture transitions that would
  reuse an incompatible current `runtimePlatform`.
- Active docs explain both the ARM64 validation path and the fallback/default
  decision if ARM is not adopted.
- Active docs or a phase decision artifact record Thruster as no-adopt unless a
  dynamic-path benefit is proven.

### Local Build Evidence

- Build the reusable base image for `linux/arm64`.
- Build the production app image for `linux/arm64` from the ARM64 base image.
- Inspect the resulting app image and confirm `linux/arm64`.
- Run at least a smoke command in the image, for example `ruby -v` or
  `bundle exec rails runner 'puts :ok'` with safe placeholder env.

### Read-Only AWS/SST Evidence

- Run `sst diff --stage dev` with the ARM64 architecture knob and the ARM64
  image/base image selected.
- Inspect rendered ECS task definitions or AWS read-only output to confirm
  `runtimePlatform.cpuArchitecture` is `ARM64` for web, worker, migration, and
  one-off task definitions.

### Live Dev Evidence

- Deploy ARM64 only to `SST_STAGE=dev` or equivalent preview AWS infrastructure.
- Verify web service health at `/up`.
- Verify worker task boots and logs Sidekiq readiness.
- Run a safe migration command such as `bundle exec rails db:version` through
  the migration task path.
- Run a safe one-off command such as `bundle exec rails runner 'puts :ok'`
  through the maintenance task path.
- Record task definition ARNs, image URI/digest, image architecture, and log
  links without printing secret values.

### Rollback Evidence

- Capture the pre-ARM web and worker task definitions in dev.
- After ARM dev validation, roll web and worker back to the captured task
  definitions using the task-definition rollback lane or equivalent AWS CLI
  commands.
- Verify web `/up`, worker logs, and service stability after rollback.
- If rollback proof is incomplete, block any production default flip.

## RESEARCH COMPLETE
