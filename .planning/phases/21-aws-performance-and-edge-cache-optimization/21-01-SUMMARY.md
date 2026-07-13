# Phase 21 Summary: AWS Performance and Edge Cache Optimization

## Completed

- Added `PublicCatalogCache` and applied it to public catalog JSON endpoints:
  - `/cases.json`
  - `/cases/features.json`
  - `/catalog/languages.json`
  - `/catalog/libraries.json`
  - `/tags.json`
- Added short anonymous-only public cache headers and one-minute Rails render caching for those JSON responses.
- Added targeted request spec coverage for anonymous public cache headers and signed-in private `/cases.json`.
- Added immutable cache metadata to SST static asset S3 sync uploads.
- Added a CloudFront response headers policy for the static asset distribution.
- Added a separate app CloudFront distribution with default caching disabled and short TTL caching only for public catalog JSON paths.
- Increased production SST runtime headroom for `GalaWeb` and CPU for `GalaWorker`.
- Updated Puma to use production workers, higher default thread count, preloading, and ActiveRecord reconnect on worker boot.
- Normalized `.dockerignore` to exclude local SST state from Docker build context.

## Safety

- No Heroku production changes.
- No production DNS changes.
- No SES changes.
- No destructive S3 media bucket changes.
- Existing static asset bucket usage remains limited to deploy-script uploads and the static CloudFront distribution.

## Verification

- Ruby syntax checks passed for touched runtime/controller files.
- `AWS_PROFILE=gala AWS_REGION=us-west-2 npx sst diff --stage production` passed and previewed the intended CloudFront and ECS task changes.
- Targeted catalog request specs passed in Docker compose: 10 examples, 0 failures.
