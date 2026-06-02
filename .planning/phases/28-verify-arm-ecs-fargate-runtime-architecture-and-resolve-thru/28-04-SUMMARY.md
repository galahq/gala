---
phase: 28
plan: 28-04
status: complete
completed: 2026-06-01
---

# Plan 28-04 Summary

## Completed

- Wrote the Phase 28 ARM64 tradeoff analysis in `28-DECISION.md`.
- Recorded the original ARM64 decision as `Decision: keep-amd64`.
- Superseded the rollback-gated decision on 2026-06-02 after the operator accepted ARM64 for a greenfield AWS environment with no users.
- Recorded ARM64 adoption gates for preview, production dry-run, and production validation.
- Closed the Thruster research path with `Decision: no-adopt`.

## Final Decisions

- ARM64: `Decision: adopt-arm64` as of 2026-06-02.
- Thruster: `Decision: no-adopt`.

## Rationale

ARM64 passed dev runtime checks for web, worker, migration, and safe one-off tasks. It originally did not pass the production default gate because direct task-definition rollback failed after the captured X86_64 task definitions became inactive. That rollback-to-x86 gate is now superseded because the AWS production environment is greenfield with no users; ARM64 is the default, and recovery is ARM64 redeploy/fix-forward or rollback to an ACTIVE ARM64 task definition.

Thruster was not adopted because Gala already uses CloudFront for edge behavior, S3 release prefixes for fingerprinted static assets, and ECS/ALB/Puma for dynamic Rails compute. Adding Thruster would add another proxy surface without addressing the current AWS deployment risks.

## Adoption Criteria

- GitHub deploy workflows default to ARM64 and select an architecture-matched base image.
- The first ARM64 production transition uses full SST task-definition deployment, not ECS-only image promotion.
- Preview and production-candidate validation record ECS task-definition architecture, service health, `/up`, and auth smoke evidence.

## Verification

- `28-DECISION.md` contains `ARM64 Tradeoff Analysis`.
- `28-DECISION.md` contains `Decision: adopt-arm64`.
- `28-DECISION.md` contains `Decision: no-adopt`.
- No production, Heroku, DNS, SES, or retained media bucket mutation was required for this summary reconciliation.
