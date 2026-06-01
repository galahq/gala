---
phase: 28
plan: 28-04
status: complete
completed: 2026-06-01
---

# Plan 28-04 Summary

## Completed

- Wrote the Phase 28 ARM64 tradeoff analysis in `28-DECISION.md`.
- Recorded the final ARM64 decision as `Decision: keep-amd64`.
- Preserved `x86_64` as the production-capable default because live dev rollback proof failed.
- Recorded reopening criteria for a future ARM64 adoption attempt.
- Closed the Thruster research path with `Decision: no-adopt`.

## Final Decisions

- ARM64: `Decision: keep-amd64`.
- Thruster: `Decision: no-adopt`.

## Rationale

ARM64 passed dev runtime checks for web, worker, migration, and safe one-off tasks. It did not pass the production default gate because direct task-definition rollback failed after the captured X86_64 task definitions became inactive. Production must stay on `x86_64` until the rollback workflow can preserve active rollback targets or re-register inactive copies automatically before `update-service`.

Thruster was not adopted because Gala already uses CloudFront for edge behavior, S3 release prefixes for fingerprinted static assets, and ECS/ALB/Puma for dynamic Rails compute. Adding Thruster would add another proxy surface without addressing the current AWS deployment risks.

## Reopening Criteria

- Update rollback workflow/operator docs to preserve active rollback task definitions or re-register inactive task-definition copies before `update-service`.
- Rerun dev ARM64 full SST deployment.
- Prove dry-run and live rollback through the documented workflow.
- Recapture web, worker, migration, one-off, `/up`, log, and task-definition architecture evidence.

## Verification

- `28-DECISION.md` contains `ARM64 Tradeoff Analysis`.
- `28-DECISION.md` contains `Decision: keep-amd64`.
- `28-DECISION.md` contains `Decision: no-adopt`.
- No production, Heroku, DNS, SES, or retained media bucket mutation was required for this summary reconciliation.
