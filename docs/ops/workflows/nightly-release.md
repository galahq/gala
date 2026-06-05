# nightly-release(7)

## NAME
nightly-release - scheduled Gala release candidate deploy and validation path

## SCOPE
The nightly path is an experiment on branch `infra/rc_2-9-9`. It builds the
current commit with the repo-owned multi-stage `Dockerfile.production`, deploys
SST stage `nightly`, moves the Git tag `nightly`, and dispatches the existing
CI workflow at `--ref nightly` against the deployed URL.

## TECHNICAL SHAPE
- Docker uses official `ruby:4.0.3-slim-bookworm` and
  `node:24.15.0-bookworm-slim` images as build/runtime inputs.
- ECR repository stays `gala`. The moving app image tag is `nightly`.
- The deploy script also pushes the immutable release-id image tag when the
  moving tag differs from the release id.
- `GALA_PRODUCTION_BASE_IMAGE` is ignored. ECS must receive the app image URI,
  never a base-image repository or tag.
- `nightly.learngala.com` is the intended host. If CloudFront certificate or DNS
  ownership does not cover that host yet, use `nightly.dev.learngala.dev` until
  the router alias and DNS record are explicitly added.

## SHARED DEV RUNTIME
The current SST model always shares the static assets bucket, media bucket, and
shared router for non-production stages. Nightly can also import the dev VPC,
ECS cluster, Postgres instance, and Valkey cluster when all of these GitHub
Actions variables are set:

- `GALA_SHARED_DEV_VPC_ID`
- `GALA_SHARED_DEV_CLUSTER_ID`
- `GALA_SHARED_DEV_DATABASE_ID`
- `GALA_SHARED_DEV_CACHE_CLUSTER_ID`

Source these from the `dev` SST outputs after a dev deploy that includes
`vpcId`, `clusterId`, `databaseInstanceId`, and `cacheClusterId`. The nightly
deploy fails fast if only some of the shared-dev IDs are configured. If none are
configured, nightly remains a separate non-production runtime behind
`nightly.learngala.com`. Do not assume nightly is using the dev database/cache
until `sharedDevRuntime: true` is visible in SST outputs and the ECS task env.

## NIGHTLY FLOW
1. Scheduled deploy runs from `.github/workflows/deploy.yml` at 09:07 UTC.
2. Manual experiment deploy:
   `gh workflow run deploy.yml --ref infra/rc_2-9-9 -f stage=nightly -f user_data=`
3. Deploy builds `gala:nightly`, pushes `gala:<release-id>`, deploys SST stage
   `nightly`, updates Git tag `nightly`, then dispatches `ci.yml` with
   `smoke_url=https://nightly.learngala.com`.
4. CI runs the Rails, Jest, lint, factory, asset precompile, and optional
   Playwright auth catalog smoke suites. Smoke runs only when
   `GALA_SMOKE_READER_EMAIL` and `GALA_SMOKE_READER_PASSWORD` are configured.

## ACCEPTANCE CHECKS
- GitHub Actions `deploy` completes for stage `nightly`.
- Git tag `nightly` points at the deployed commit.
- ECR repo `gala` has tags `nightly` and the immutable release id.
- ECS web and worker task definitions reference the `gala` app image, not any
  base-image repository.
- `https://nightly.learngala.com/up` returns healthy after DNS and router alias
  propagation.
- The dispatched `ci` run passes or records only known warnings.

## ROLLBACK
Run `deploy.yml` from a known-good ref with `stage=nightly`, or set
`SST_IMAGE_TAG` to a known immutable release-id tag and redeploy with the local
operator script after confirming the image exists in ECR. If the issue is only
runtime state, use deploy `user_data=restart_ecs`. Database rollback is not
automatic.
