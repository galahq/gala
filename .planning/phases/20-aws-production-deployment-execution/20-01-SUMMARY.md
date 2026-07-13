---
phase: 20
plan: 1
type: summary
status: complete
completed: 2026-05-23
title: AWS production deployment execution through SST
---

# Plan 20-01 Summary: AWS Production Deployment Through SST

## Outcome

Phase 20 completed the AWS production-candidate deployment path through GitHub Actions and SST without cutting over DNS or mutating Heroku production.

- GitHub Actions run: `26318968133`
- Commit deployed: `d6d99b940e0a51ffdada992d9951a9666b5b1c01`
- Image deployed: `353760060567.dkr.ecr.us-west-2.amazonaws.com/gala:d6d99b940e0a51ffdada992d9951a9666b5b1c01`
- ALB URL: `http://GalaWebLoadBala-chdmccbn-1073735116.us-west-2.elb.amazonaws.com`
- ECS services: `GalaWeb:7` and `GalaWorker:7`, both rollout states `COMPLETED`

## What Changed

- Hardened `.github/workflows/deploy.yml` and `scripts/deploy-sst.sh` for the approved SST deploy path.
- Removed GitHub Actions `AWS_PROFILE` use so OIDC credentials drive AWS deployment.
- Declared production asset build dependencies needed by CI.
- Added CI seed dump hydration from private S3 artifact `s3://gala-deploy-artifacts-353760060567/phase-20/seed.dump`.
- Installed PostgreSQL 17 restore client in the Docker image and filtered unsupported `transaction_timeout` restore output for the target AWS Postgres server.
- Aligned worker health checks with the Sidekiq process.
- Published compiled `public/assets` and `public/packs` to `gala-static-assets-353760060567`.

## Verification

- `bash -n scripts/deploy-sst.sh`
- `scripts/deploy-sst.sh --help`
- GitHub Actions deploy run `26318968133` completed successfully.
- Seed task restored `db/sqldump/seed.dump` into the AWS database and exited `0`.
- ECS `GalaWeb` desired/running `2/2`, pending `0`, rollout `COMPLETED`.
- ECS `GalaWorker` desired/running `1/1`, pending `0`, rollout `COMPLETED`.
- `curl -I http://GalaWebLoadBala-chdmccbn-1073735116.us-west-2.elb.amazonaws.com/up` returned `200 OK`.
- `curl -I http://GalaWebLoadBala-chdmccbn-1073735116.us-west-2.elb.amazonaws.com/` returned `200 OK`.
- Browser QA loaded the Gala shell through the ALB. Compiled static assets and retained ActiveStorage media returned `200 OK`.
- `https://www.learngala.com` remained served by Heroku.

## Accepted Noise

- Anonymous browser requests to `profile.json`, `enrollments.json`, `managerships.json`, and `saved_reading_lists.json` returned expected `401 Unauthorized`.
- External Mapbox terrain/street tile metadata returned the existing `403` noise already observed in earlier route QA.
- Browser reported WebGL readback performance warnings.

## Rollback

Previous healthy ECS task definition revision `:6` remains available. Previous image tag `831d5293bc53b5af0b5a641ac04a6d2ef50a4fa0` remains in ECR and can be redeployed without changing Heroku production.
