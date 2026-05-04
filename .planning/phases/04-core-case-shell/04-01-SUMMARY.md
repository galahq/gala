---
phase: 04-core-case-shell
plan: 01
subsystem: ui
tags: [rails, react, blueprintjs, browser-qa, rspec]

requires:
  - phase: 01-baseline-asset-gate
    provides: BlueprintJS compatibility strategy and local QA expectations
  - phase: 03-catalog-routes
    provides: Browser-console noise classification for HMR and external Mapbox errors
provides:
  - Route-derived Core Case Shell QA evidence
  - Published local case slug selection for public shell coverage
  - Browser QA results for case overview, content suffix, conversation suffix, and protected route redirects
  - Targeted RSpec controller verification result
affects: [phase-05-nested-case-interactions, case-shell, blueprint-compatibility]

tech-stack:
  added: []
  patterns:
    - Route checklist from config/routes.rb before browser QA
    - Existing-data-first browser QA with documented auth substitutions

key-files:
  created:
    - .planning/phases/04-core-case-shell/04-QA.md
  modified:
    - .planning/phases/04-core-case-shell/04-QA.md

key-decisions:
  - "Used existing published case slug 3880fdc8-0a48-4e5f-b146-9deffd7f9c22 for public shell QA."
  - "Did not mutate local data to create editor browser coverage; documented missing editorships and used controller/feature-spec attempts as supplemental coverage."
  - "Made no code changes because browser QA did not prove a Phase 4 visual/runtime regression requiring a narrow compatibility fix."

patterns-established:
  - "Core case route QA records public shell results separately from protected-route auth redirects."
  - "Feature-spec failures caused by Selenium driver setup are recorded as environment-blocked, not route regressions."

requirements-completed:
  - CASE-01
  - CASE-02
  - CASE-03
  - QA-01
  - QA-02
  - QA-03
  - QA-04

duration: 12 min
completed: 2026-05-04
---

# Phase 04 Plan 01: Core Case Shell Route Stabilization Summary

**Route-derived case shell QA with existing local data, browser route evidence, and targeted controller verification**

## Performance

- **Duration:** 12 min
- **Started:** 2026-05-04T14:55:42Z
- **Completed:** 2026-05-04T15:07:44Z
- **Tasks:** 4
- **Files modified:** 1

## Accomplishments

- Created `.planning/phases/04-core-case-shell/04-QA.md` from `config/routes.rb` route families.
- Selected published slug `3880fdc8-0a48-4e5f-b146-9deffd7f9c22` from the Dockerized local DB.
- Browser-QAed the public case overview, `/1` content suffix, `/conversation` shell suffix, and protected-route redirects.
- Confirmed no Phase 4 code fix was justified by browser evidence.
- Ran the required controller spec successfully and documented feature-spec Selenium setup failures.

## Task Commits

Each task was committed atomically:

1. **Task 04-01-01: Derive the route checklist and select slugs** - `5ed3015`
2. **Task 04-01-02: Browser-QA the core case shell** - `c25bb30`
3. **Task 04-01-03: Apply only verified fixes** - `54deece`
4. **Task 04-01-04: Run targeted gates and finalize QA evidence** - `f587b40`

## Files Created/Modified

- `.planning/phases/04-core-case-shell/04-QA.md` - Route checklist, browser QA evidence, fix decision, automated gate results, and Phase 4 gate status.

## Decisions Made

- Used Docker for app/database commands because host Ruby is `2.6.10` and the app requires Ruby `4.0.3`.
- Treated `host.docker.internal` HMR `Invalid Host/Origin header`, external Mapbox style `404`, and existing React 16 lifecycle/prop warnings as non-blocking Phase 4 noise.
- Did not create local editorship data or reset credentials; existing local data had one reader and no editorship rows, and `secret` did not authenticate that reader.
- Left `app/views/cases/deletions/new.html.haml` unchanged because the route was not reachable with existing editor credentials and there was no browser-confirmed visual regression.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Editor-authenticated browser coverage was not available from existing local data/credentials. Protected routes were checked as anonymous redirects and the limitation is recorded in QA.
- The combined feature-spec command was attempted but blocked by local Selenium/Capybara setup: `Can't initialize Selenium::WebDriver::Chrome::Driver with :url`.
- Host-side Rails commands are blocked by Ruby mismatch; Docker commands worked.

## User Setup Required

None - no external service configuration required.

## Self-Check: PASSED

- `04-QA.md` exists and contains the required route families, chosen slug, console/network notes, `/conversation`, editor-auth limitation, test commands, and final gate result.
- `docker compose exec web bundle exec rspec spec/controllers/cases_controller_spec.rb` passed with `5 examples, 0 failures`.
- Feature-spec failures are documented as environment-blocked, not unresolved app regressions.

## Next Phase Readiness

Phase 4 is ready for `$gsd-verify-work 4` or Phase 5 planning. Phase 5 should start from the documented shell behavior and focus on nested case interactions, with special attention to authenticated/enrolled reader states if local credentials are made available.

---
*Phase: 04-core-case-shell*
*Completed: 2026-05-04*
