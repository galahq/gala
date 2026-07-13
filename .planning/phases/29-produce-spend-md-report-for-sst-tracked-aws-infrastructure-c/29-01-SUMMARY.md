---
phase: 29
plan: 29-01
status: complete
completed: 2026-06-01
---

# Plan 29-01 Summary

## Completed

- Created root `SPEND.md`.
- Created `29-EVIDENCE.md` with source, workflow, AWS, pricing, drift, and validation evidence.
- Reconciled `infra/sst.config.ts` with read-only AWS observations for ECS, RDS, Valkey, ALB, CloudFront, S3, ECR, CloudWatch Logs, and Cost Explorer.
- Recorded current official pricing source links and labeled estimates by date and scope.

## Key Evidence

- Production ECS is running `GalaWeb` 2/2 and `GalaWorker` 1/1 on Fargate X86_64.
- Dev ECS is running `GalaWeb` 1/1 and `GalaWorker` 1/1 on Fargate Spot X86_64.
- Production RDS is live as `db.t4g.small`, PostgreSQL 16.13, 20 GB gp3; source intent says 50 GB.
- Production/dev Valkey are `cache.t4g.micro`.
- May 2026 Cost Explorer account-wide spend for in-scope services is about USD 50.79.
- CloudFront router live price class is `PriceClass_All`; source transform intends `PriceClass_100`.

## Verification

- `SPEND.md` and `29-EVIDENCE.md` exist.
- Required report sections are present.
- Read-only AWS identity check passed.
- Secret-pattern scan passed.
