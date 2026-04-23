---
phase: 01-infra-safety-baseline
plan: "02"
subsystem: infra
tags: [sst, secrets, deploy, preflight]
requires:
  - phase: 01-infra-safety-baseline
    provides: Dedicated health endpoint and SST health check wiring
provides:
  - Value-free SST secret and runtime config inventory
  - Phase 1 deploy, tooling, image, and config preflight checklist
  - Explicit candidate config list for OAuth and Sentry parity decisions
affects: [staging-runtime-parity, data-migration-rehearsal, production-cutover]
tech-stack:
  added: []
  patterns: [value-free-secret-inventory, root-vs-infra-tooling-boundary]
key-files:
  created:
    - docs/aws-sst-secret-inventory.md
    - docs/aws-sst-phase-1-preflight.md
  modified: []
key-decisions:
  - "Document secret names and ownership only; never record values or derived credentials in planning docs."
  - "Keep generated SST values separate from manually supplied secrets so later staging work knows which values should come from infrastructure."
patterns-established:
  - "Use docs/aws-sst-secret-inventory.md as the value-free checklist for stage config."
  - "Run infra checks from infra/ with Node >=20 and app checks from the repo root with the Rails runtime."
requirements-completed: [DPLY-01, DPLY-02, DPLY-03, SECR-01, SECR-02, SECR-03, SECR-04]
duration: 9min
completed: 2026-04-23
---

# Phase 1 Plan 02 Summary

**Value-free SST secret inventory and deploy preflight for AWS staging readiness**

## Performance

- **Duration:** 9 min
- **Completed:** 2026-04-23T08:44:07Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created a value-free inventory of SST secrets, generated runtime environment, and candidate app config not yet declared in SST.
- Documented deploy guardrails, including manual workflow dispatch, explicit stage/action inputs, OIDC, production removal refusal, and SST production retain behavior.
- Captured root-vs-infra tooling boundaries and preflight commands for SST, app health, image build, and config review.

## Task Commits

1. **Task 1 and 2: Secret inventory plus deploy/tooling preflight** - `74d0a737` (docs)

**Plan metadata:** `20727b1e` (docs)

## Files Created/Modified

- `docs/aws-sst-secret-inventory.md` - Names and classifies stage config without values.
- `docs/aws-sst-phase-1-preflight.md` - Lists deploy guardrails and focused checks before Phase 2.

## Decisions Made

Candidate production config for Google OAuth, Facebook OAuth, and Sentry is documented as pending because it is referenced by the app but not currently declared in SST.

## Deviations from Plan

None - plan executed as written.

## Issues Encountered

Initial preflight wording did not match the exact plan verification grep for `production removal`, `Node 12.5.0`, `Node >=20`, and `assets:precompile`. The doc was tightened to make those constraints explicit.

## Verification

- `rg -n 'RAILS_MASTER_KEY|SECRET_KEY_BASE|LTI_KEY|SES_SMTP_USERNAME|GOOGLE_CLIENT_ID|SENTRY_DSN|DATABASE_URL|REDIS_URL' docs/aws-sst-secret-inventory.md` - passed.
- `rg -n 'npm ci|npx sst install|production removal|Node 12.5.0|Node >=20|assets:precompile' docs/aws-sst-phase-1-preflight.md` - passed.
- `rg -n 'AKIA|BEGIN |PRIVATE KEY|password:|secret:|token:|https://[^ ]+:[^ ]+@' docs/aws-sst-secret-inventory.md docs/aws-sst-phase-1-preflight.md` - no matches.

## User Setup Required

Before Phase 2 staging deploys, SST stage secrets must be set outside the repo for the required names listed in `docs/aws-sst-secret-inventory.md`.

## Next Phase Readiness

Phase 2 can use the inventory to set staging config and can use the preflight checklist before the first AWS staging deploy.

---
*Phase: 01-infra-safety-baseline*
*Completed: 2026-04-23*
