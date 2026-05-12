---
phase: 01-baseline-asset-gate
plan: 02
subsystem: frontend
tags: [blueprintjs, namespace-bridge, mutationobserver, jest]
requires:
  - phase: 01-baseline-asset-gate
    provides: Global styles pack imports the namespace bridge
provides:
  - Tested legacy Blueprint namespace bridge behavior
  - Runtime support for mirrored classes on existing and mutated DOM nodes
  - Preserved Rails-rendered legacy exclusions
affects: [phase-1, route-qa, blueprint, legacy-css]
tech-stack:
  added: []
  patterns: [Side-effect module tests with jest.resetModules and jsdom DOM setup]
key-files:
  created:
    - app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js
  modified:
    - app/javascript/shared/blueprintLegacyNamespace.js
key-decisions:
  - "Preserved pt-* classes and only added missing bp4-* equivalents."
  - "Kept Toolbar/window Rails-rendered legacy exclusions unchanged for Phase 1."
patterns-established:
  - "Namespace bridge tests reset the module and DOM per example to exercise startup behavior."
requirements-completed: [FOUND-03, QA-03]
duration: 18min
completed: 2026-05-04
---

# Phase 1 Plan 02: Blueprint Namespace Bridge Summary

**The legacy Blueprint bridge is now covered for existing nodes, mutation-observed nodes, class changes, duplicate prevention, and Rails-rendered exclusions.**

## Performance

- **Duration:** 18 min
- **Started:** 2026-05-04T00:31:00Z
- **Completed:** 2026-05-04T00:49:16Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added focused Jest coverage for `.pt-*` to `.bp4-*` mirroring without removing original classes.
- Covered `.Toolbar__bar`, `.window-admin`, and `.window.admin` exclusion behavior.
- Fixed observer construction so the bridge can use `window.MutationObserver` when the unqualified global is unavailable.

## Task Commits

1. **Task 1: Add namespace bridge behavior tests** - `d3365d1f` (test RED)
2. **Task 2: Correct bridge behavior only where tests prove drift** - `c2ec0986` (fix GREEN)

## Files Created/Modified

- `app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js` - jsdom tests for startup mirroring, duplicate prevention, exclusions, and observer callback handling.
- `app/javascript/shared/blueprintLegacyNamespace.js` - Observer lookup now falls back to `window.MutationObserver`.

## Decisions Made

- Exporting private helpers was not necessary; tests preserve the side-effect import path used by `styles.js`.
- The existing Rails-rendered exclusion selector remains unchanged.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed observer lookup drift**
- **Found during:** Task 2
- **Issue:** MutationObserver-backed behavior could not run when only `window.MutationObserver` is available.
- **Fix:** Resolve the observer constructor from `MutationObserver` or `window.MutationObserver` before observing `document.body`.
- **Files modified:** `app/javascript/shared/blueprintLegacyNamespace.js`
- **Verification:** `yarn test app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js --runInBand`
- **Committed in:** `c2ec0986`

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** The fix is directly required for the planned runtime mutation behavior and does not broaden the bridge contract.

## Issues Encountered

- Jest's jsdom setup does not provide a native MutationObserver, so observer-specific tests install a minimal mock and invoke the bridge callback directly.
- The Jest command again reported a pre-existing React key warning from `FormattedList`.

## Verification

- `yarn test app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js --runInBand` - PASS. Output included 19 passed suites, 1 skipped suite, 99 passed tests, 3 skipped tests.

## Known Stubs

None.

## Threat Flags

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plan 03 can use the bridge as part of the browser QA baseline; later route phases should keep `.pt-*` cleanup deferred until Phase 9.

## Self-Check: PASSED

- Created file exists: `app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js`
- Modified file exists: `app/javascript/shared/blueprintLegacyNamespace.js`
- Commits exist: `d3365d1f`, `c2ec0986`

---
*Phase: 01-baseline-asset-gate*
*Completed: 2026-05-04*
