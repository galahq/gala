---
phase: 29
plan: 29-03
status: complete
completed: 2026-06-01
---

# Plan 29-03 Summary

## Completed

- Ran Phase 29 static completeness checks.
- Ran secret-pattern scans against `SPEND.md` and `29-EVIDENCE.md`.
- Reconciled source/live drift and unknowns into the report.
- Tightened the executive summary around cost shape, growth, cost cuts, missing evidence, and Heroku migration thresholds.
- Added `scripts/ops/generate-spend-report.mjs` so `SPEND.md` can be regenerated consistently from tracked `infra/sst.config.ts`, read-only AWS CLI inventory, Cost Explorer, and AWS Price List data.

## Drift And Unknowns Preserved

- Source production DB storage says 50 GB; live RDS allocated storage is 20 GB.
- Source router transform intends `PriceClass_100`; live router distribution reports `PriceClass_All`.
- Legacy `.com` CloudFront distributions and S3 buckets exist but were not counted as SST-owned migration resources without ownership confirmation.
- S3 bucket byte totals, per-stage cost allocation tags, Heroku invoice data, and Phase 28 ARM64 proof remain missing.

## Verification

- Required section `rg` check passed.
- Full Ruby section and secret-pattern check passed.
- Additional evidence-file secret-pattern check passed.
- `AWS_PROFILE=gala AWS_REGION=us-west-2 aws sts get-caller-identity >/dev/null` passed.
- `node --check scripts/ops/generate-spend-report.mjs` passed.
- `AWS_PROFILE=gala AWS_REGION=us-west-2 node scripts/ops/generate-spend-report.mjs --output SPEND.md` passed.
