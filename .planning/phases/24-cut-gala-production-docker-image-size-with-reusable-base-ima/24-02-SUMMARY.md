# 24-02 Summary: SST production image wiring and dev dry-run proof

## Objective

Wire the slimmer Phase 24 production image into the SST deploy path so production and dev deploys use one prebuilt ECR image, while keeping the direct SST Dockerfile fallback explicit and size-gated.

## Changes

- `scripts/deploy-sst.sh` now accepts `--production-base-image` and `--dockerfile`, plus `GALA_PRODUCTION_BASE_IMAGE`, `GALA_PRODUCTION_DOCKERFILE`, and `GALA_MAX_IMAGE_SIZE_BYTES` environment overrides.
- The deploy script now refuses deploy and dry-run operations unless the production base image is explicit, validates the Dockerfile path, and keeps the existing Heroku database/cache leakage guard intact.
- The deploy script builds with `Dockerfile.production`, passes `GALA_PRODUCTION_BASE_IMAGE` as a Docker build arg, pushes one app image, verifies the ECR image size, and passes the pushed image URI to SST as both `GALA_APP_IMAGE_URI` and the legacy `GALA_WEB_IMAGE_URI`.
- `infra/sst.config.ts` now supports `GALA_APP_IMAGE_URI` first, keeps `GALA_WEB_IMAGE_URI` as compatibility, and makes the fallback SST Docker build use `Dockerfile.production` with the required production base image build arg.
- `.github/workflows/deploy.yml` and `.github/workflows/preview.yml` now define the production Dockerfile, production base image URI, and 1.5 GB image size gate.

## Validation

- `bash -n scripts/deploy-sst.sh` passed.
- Ruby YAML parsing passed for `.github/workflows/deploy.yml` and `.github/workflows/preview.yml`.
- `npm exec --prefix infra tsc -- --noEmit` passed.
- Built and pushed production base image to ECR:
  - `353760060567.dkr.ecr.us-west-2.amazonaws.com/gala-production-base:ruby4.0.3-bookworm-pg17-runtime-v1`
  - ECR image size: `262,066,493` bytes.
- Built and pushed production app image using the remote production base image:
  - `353760060567.dkr.ecr.us-west-2.amazonaws.com/gala:phase24-sizecheck-20260601045517-f6067b8e`
  - ECR image size: `1,157,378,777` bytes.
  - The size is under the Phase 24 gate of `1,500,000,000` bytes.
- `scripts/deploy-sst.sh --stage dev --dry-run` first refused to run when `DATABASE_URL` was present, confirming the Heroku database/cache environment leakage guard still works.
- Re-ran the deploy script dry run with database/cache env vars unset and `GALA_ENABLE_CUSTOM_DOMAIN=false` for local validation. It completed successfully for stage `dev` and release `phase24-dryrun-20260601050350`.
- Direct `npx sst diff --stage dev` passed with `GALA_PRODUCTION_BASE_IMAGE` set and database/cache env vars unset.

## Safety notes

- No non-dry-run SST deploy was performed in this wave.
- No Heroku production database, Redis/cache, SES, or S3 media bucket resources were mutated.
- The local dry run disabled the Cloudflare custom domain only to avoid coupling validation to Cloudflare credentials and account mutation. The GitHub deploy and preview workflows still keep their normal custom-domain behavior.
- Direct SST fallback diffs can still show multiple Docker assets because SST builds per task when no pushed app image URI is provided. The real deploy script path now passes one pushed ECR app image URI to SST, so web, worker, migration, seed, refresh, and weekly tasks reuse that same app image.
- During local SST validation, the generated `.sst/platform` esbuild binary had to be replaced with a fresh copy after `write EPIPE` failures. This changed generated local tooling only and was not committed.

## Commit

- `f924f646 feat(24-02): wire production Docker image into SST deploy`
