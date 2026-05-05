---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Upgrade Stabilization
status: active
last_updated: "2026-05-05T15:35:00Z"
last_activity: 2026-05-05 -- Completed Phase 07 deployment and integration route stabilization
progress:
  total_phases: 9
  completed_phases: 7
  total_plans: 14
  completed_plans: 14
  percent: 78
---

# GSD State

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-05-03)

**Core value:** Every important route must keep working and looking recognizably like the pre-upgrade Gala experience while the Ruby, Node.js, and BlueprintJS stack is modernized.
**Current focus:** Phase 08 — admin-and-operations

## Current Position

Phase: 08 — READY
Plan: 0 of 0
Status: Phase 07 passed QA gate and was completed; Phase 08 is the next route group.
Last activity: 2026-05-05 -- Completed Phase 07 deployment and integration route stabilization
Resume file: .planning/ROADMAP.md#phase-8-admin-and-operations

## Milestone

**v1.0 Upgrade Stabilization**

Finish the Ruby, Node.js, Shakapacker/Webpacker, and BlueprintJS upgrade by iterating through route groups from `config/routes.rb`, using local QA gates on `localhost:3000`, committing after each route/phase gate, and cleaning up upgrade leftovers at the end.

## Active Rules

- Work route groups sequentially.
- Use `config/routes.rb` as the route source of truth.
- Use `localhost:3000` for browser QA.
- Compare visual behavior to the approximate BlueprintJS 2.3.1-era app.
- Run targeted automated tests where practical.
- Commit each phase after its QA gate passes.

## Blockers

- None for Phases 1-7.

## Follow-Up Noise

- Browser tooling reaches the app via `host.docker.internal:3000`, which produces webpack-dev-server `Invalid Host/Origin header` HMR console errors.
- Root catalog browser QA observed an external Mapbox style `404` and React runtime warnings; defer to route-specific phases unless they block visible behavior.
- Phase 2 legacy redirect destinations can show missing local data after redirect; redirect targets are still preserved.
- Phase 3 search returns `[]` if the local `cases_search_index` materialized view is present but unpopulated; refresh the index for real local search data.
- Phase 4 feature-spec supplement coverage was blocked by local Selenium/Capybara setup: `Can't initialize Selenium::WebDriver::Chrome::Driver with :url`.
- Phase 4 had no existing local editor-accessible case; protected case routes were verified as anonymous sign-in redirects and controller specs supplemented route behavior.
- Phase 7 full `yarn test --runInBand` is blocked by existing Jest transform configuration failures on ES module imports; targeted RSpec and Shakapacker gates passed.
- Phase 7 browser QA on deployment routes showed existing local dev-server stale chunk 404/MIME noise and shared styled-components deprecation warnings, with no deployment-specific blocker.

## Notes

- `.planning/codebase/` contains the current codebase map.
- `gsd-sdk` is not available on PATH in this environment, so initial artifacts were written directly and committed with regular git.
- Phase 1 execution used regular git commits and did not transition to Phase 2.

## Quick Tasks Completed

| Date | Task | Status | Commit |
| --- | --- | --- | --- |
| 2026-05-05 | Remove legacy automation residue | complete | this commit |
| 2026-05-05 | Fix missing reading-list UUID nil title error | complete | this commit |
| 2026-05-04 | Restore production Mapbox style fallback | complete | this commit |
| 2026-05-04 | Document Google mock login for protected-route visual QA | complete | this commit |
