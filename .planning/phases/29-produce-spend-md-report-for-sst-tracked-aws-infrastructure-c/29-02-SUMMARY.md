---
phase: 29
plan: 29-02
status: complete
completed: 2026-06-01
---

# Plan 29-02 Summary

## Completed

- Filled `SPEND.md` capex and opex sections.
- Added low, expected, and high growth scenarios.
- Added prioritized cost-cut recommendations with impact, risk, and validation requirements.
- Added Heroku stay/hybrid/migrate decision thresholds.

## Decision Points

- AWS cost evidence is currently account-wide, not production-only.
- The largest current spend drivers are ECS/Fargate, RDS, VPC/networking, ALB, Valkey, and S3.
- Cache hit ratio, preview lifetime, release retention, logs, and ECR image cleanup are first-order cost controls.
- ARM64 savings remain conditional on Phase 28 proof.
- Heroku comparison remains assumption-based until invoice and plan data are attached.

## Verification

- Capex and opex are separate.
- Growth model includes low, expected, and high scenarios.
- Cost-cut section includes now/next/later priorities.
- Heroku decision section includes stay, hybrid, and migrate thresholds.
