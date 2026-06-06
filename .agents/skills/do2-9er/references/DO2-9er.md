# DO2-9er Project Context

Use this reference only for the Gala `infra/rc_2-9-9` nightly SST iteration.

## Purpose

Create and validate the experimental `nightly` SST stage from local operator
work, with a fresh production multi-stage Docker image tagged `nightly`, shared
dev database/cache runtime, globally shared SES and `msc-gala` S3 access, and no
Heroku mutation.

## Known Live Facts From 2026-06-05

- AWS account: `353760060567`.
- Correct local AWS profile: `AWS_PROFILE=gala`.
- Current Gala AWS region: `us-west-2`. Gala resource probes in `us-east-2`
  returned no matching ECS, RDS, ECR, or SSM resources.
- Dev VPC: `vpc-030eda5dfde37d35b`.
- Dev ECS cluster:
  `arn:aws:ecs:us-west-2:353760060567:cluster/gala-dev-GalaClusterCluster-zeeusfkv`.
- Dev RDS instance: `gala-dev-galadatabaseinstance-vfkaokum`.
- Dev Valkey replication group: `gala-dev-galacachecluster-bbtxmett`.
- Dev Valkey member cache node: `gala-dev-galacachecluster-bbtxmett-001`.
- Shared router distribution: `E3FF4TTU9Q4XTY`.
- Cloudflare zone `learngala.dev`: `b95aebc5cd4c107a97157de72bd75627`.
- Local Cloudflare file: `dev.learngala.global`, with `CF_ACCOUNT_ID` and
  `CF_ACCESS_TOKEN`. Map those to `CLOUDFLARE_ACCOUNT_ID` and
  `CLOUDFLARE_API_TOKEN` without printing values.
- Current CloudFront/ACM cert covers `learngala.dev`, `dev.learngala.dev`, and
  `*.dev.learngala.dev`, not `nightly.learngala.dev`.
- `nightly.dev.learngala.dev` resolves via the existing wildcard; exact
  `nightly.learngala.dev` DNS does not exist yet.
- SST CLI 4.7.1 state currently lists only `dev` and `production`.
- `npx sst diff --stage nightly` currently returns `Stage not found` because
  `nightly` is not yet a deployed SST stage.

## Early Stop Conditions

- Stop if `AWS_REGION` is set to `us-east-2` for this work without an explicit
  region-migration decision.
- Stop if `SST_STAGE` is misspelled as `nighly`.
- Stop if `DATABASE_URL`, `REDIS_URL`, `REDIS_HOST`, or `CACHE_URL` are exported
  in the deploy shell.
- Stop if the SST diff includes nightly task definitions beyond web and worker.
- Stop before treating SST as confirmed if `nightly` is absent from
  `npx sst state list`; first creation needs `npx sst deploy --stage nightly`
  after the shape, image, and test gates pass.
- Stop if the preferred host `nightly.learngala.dev` is attempted before cert and
  router alias coverage are proven.
- Stop before any Heroku command except read-only `config:get` style inspection.

## Required Local Flow

1. Read `SPEC_2-9-9.md`, `scratch.md`, `scripts/deploy-sst.sh`,
   `infra/sst.config.ts`, and `docs/ops/workflows/deploy.md`.
2. Run read-only AWS/Cloudflare checks first and record names/ids only.
3. Build and inspect `Dockerfile.production` locally as `gala:nightly`.
4. Run Docker Compose local QA and targeted tests for touched files.
5. Run `npx sst state list` from `infra/`.
6. If `nightly` exists, run `npx sst diff --stage nightly` and review the diff
   before mutation.
7. If `nightly` is absent, record the `Stage not found` diff result and treat
   first creation as the next mutating SST CLI step after all gates pass.
8. Run `npx sst deploy --stage nightly` only after evidence shows shared dev
   runtime intent and web/worker-only task definitions.
9. Verify ECR, ECS, CloudFront/Cloudflare routing, `/up`, browser console,
   network errors, and CloudWatch logs before accepting nightly.
10. Do not push `infra/rc_2-9-9` or move the remote `nightly` tag until the SST
   infra is confirmed working.
