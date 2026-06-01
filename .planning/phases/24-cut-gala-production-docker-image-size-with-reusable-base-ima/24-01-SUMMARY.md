# Phase 24-01 Summary: Production Docker Image Split

## Objective

Create a production-only Docker build path without disturbing the existing local/development Dockerfile behavior.

## Changes

- Added `Dockerfile.production-base` for stable Ruby, Debian, PostgreSQL client, PDF/font/image, jemalloc, and Bundler runtime dependencies.
- Added `Dockerfile.production` as a multi-stage production build that installs Node/pnpm and native build dependencies only in the build stage.
- Updated `.dockerignore` to exclude planning artifacts, local secrets, dependency caches, generated runtime output, and local infra state from Docker build contexts.
- Left the existing `Dockerfile` untouched for current local/development compatibility.

## Validation

Commands run locally:

```bash
docker buildx build --platform linux/amd64 -f Dockerfile.production-base -t gala-production-base:sizecheck --load .
docker buildx build --platform linux/amd64 -f Dockerfile.production --build-arg GALA_PRODUCTION_BASE_IMAGE=gala-production-base:sizecheck -t gala-production:sizecheck --load .
docker image inspect gala-production-base:sizecheck --format '{{.Size}}'
docker image inspect gala-production:sizecheck --format '{{.Size}}'
docker run --rm --entrypoint sh gala-production:sizecheck -lc 'if command -v node >/dev/null 2>&1; then echo node-present; exit 1; fi; if command -v pnpm >/dev/null 2>&1; then echo pnpm-present; exit 1; fi; echo no-node-or-pnpm'
```

Results:

- Production base image size: `262,068,973` bytes.
- Production app image size: `1,157,378,687` bytes.
- Final runtime image is below the `1.5GB` Phase 24 target.
- Final runtime image does not include `node` or `pnpm`.
- Rails assets and Shakapacker packs compiled successfully during the production image build.

## Commit

- `2f9c2c19` - `feat(24-01): split production Docker image`

## Notes

- Docker BuildKit emitted `InvalidDefaultArgInFrom` warnings because `GALA_PRODUCTION_BASE_IMAGE` has no default. That is intentional for the production image contract: deployment tooling must provide the explicit base image reference.
- Dev-stage ECR proof is deferred to `24-02`, where the deploy/SST path will build and push the same production image path.
