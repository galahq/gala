---
phase: 01-baseline-asset-gate
plan: 01
subsystem: testing
tags: [blueprintjs, shakapacker, sprockets, jest, asset-contract]
requires:
  - phase: 01-baseline-asset-gate
    provides: Phase 1 context and Blueprint asset ownership decisions
provides:
  - Tested global Blueprint asset ownership contract
  - Regression coverage for layout asset order
  - Regression coverage preventing Blueprint package CSS imports in styles.js
affects: [phase-1, blueprint, shakapacker, route-qa]
tech-stack:
  added: []
  patterns: [Jest source-file contract test for global asset ownership]
key-files:
  created:
    - app/javascript/shared/__tests__/blueprintAssetContract.test.js
  modified: []
key-decisions:
  - "Preserved Sprockets as the owner of Blueprint package CSS."
  - "Preserved Shakapacker styles.js as the owner of Gala overrides and Blueprint JS helpers only."
patterns-established:
  - "Asset ownership checks read source files directly with Node fs and assert the compatibility contract."
requirements-completed: [FOUND-02, QA-03]
duration: 12min
completed: 2026-05-04
---

# Phase 1 Plan 01: Global Blueprint Asset Contract Summary

**Jest coverage now locks Blueprint package CSS to Sprockets and preserves the application layout asset order.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-05-04T00:35:00Z
- **Completed:** 2026-05-04T00:47:01Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Added `blueprintAssetContract.test.js` to assert Blueprint package CSS requires remain in `application.css`.
- Added coverage that rejects `@blueprintjs/*/lib/css` imports from `app/javascript/packs/styles.js`.
- Added coverage for the intended layout order: JavaScript packs, stylesheet pack, then Sprockets application stylesheet.

## Task Commits

1. **Task 1: Add asset ownership regression tests** - `6fd13099` (test)
2. **Task 2: Fix only proven global asset contract violations** - No code changes required; existing files matched the contract.

## Files Created/Modified

- `app/javascript/shared/__tests__/blueprintAssetContract.test.js` - Source-file contract tests for global Blueprint asset ownership and layout order.

## Decisions Made

- No implementation change was made because the current layout, Sprockets manifest, and styles pack already matched D-05, D-06, and D-08.

## Deviations from Plan

None - plan executed as written. The TDD RED check passed immediately because the implementation already satisfied the planned contract; the missing deliverable was regression coverage.

## Issues Encountered

- `yarn test app/javascript/shared/__tests__/blueprintAssetContract.test.js --runInBand` runs through the repository Jest script as `jest app/javascript ...`, so it executed the existing frontend suite subset. It passed with one pre-existing React key warning in `FormattedList`.

## Verification

- `yarn test app/javascript/shared/__tests__/blueprintAssetContract.test.js --runInBand` - PASS. Output included 18 passed suites, 1 skipped suite, 94 passed tests, 3 skipped tests.

## Known Stubs

None.

## Threat Flags

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plan 02 can rely on the global styles pack importing `shared/blueprintLegacyNamespace` without duplicating Blueprint package CSS.

## Self-Check: PASSED

- Created file exists: `app/javascript/shared/__tests__/blueprintAssetContract.test.js`
- Commit exists: `6fd13099`

---
*Phase: 01-baseline-asset-gate*
*Completed: 2026-05-04*
