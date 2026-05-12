---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: Upgrade Stabilization
status: Awaiting next milestone
last_updated: "2026-05-12T01:45:20.269Z"
last_activity: 2026-05-12 — Milestone v1.0 completed and archived
progress:
  total_phases: 10
  completed_phases: 10
  total_plans: 18
  completed_plans: 19
  percent: 100
---

# GSD State

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-05-12)

**Core value:** Every important route must keep working and looking recognizably like the pre-upgrade Gala experience while the Ruby, Node.js, and BlueprintJS stack is modernized.
**Current focus:** Planning next milestone

## Current Position

Phase: Milestone v1.0 complete
Plan: —
Status: Awaiting next milestone
Last activity: 2026-05-12 — Milestone v1.0 completed and archived

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

- None for v1.0 closeout.

## Follow-Up Noise

- Browser tooling reaches the app via `host.docker.internal:3000`, which produces webpack-dev-server `Invalid Host/Origin header` HMR console errors.
- Root catalog browser QA observed an external Mapbox style `404` and React runtime warnings; defer to route-specific phases unless they block visible behavior.
- Phase 2 legacy redirect destinations can show missing local data after redirect; redirect targets are still preserved.
- Phase 3 search returns `[]` if the local `cases_search_index` materialized view is present but unpopulated; refresh the index for real local search data.
- Phase 4 feature-spec supplement coverage was blocked by local Selenium/Capybara setup: `Can't initialize Selenium::WebDriver::Chrome::Driver with :url`.
- Phase 4 had no existing local editor-accessible case; protected case routes were verified as anonymous sign-in redirects and controller specs supplemented route behavior.
- Phase 7 full `yarn test --runInBand` is blocked by existing Jest transform configuration failures on ES module imports; targeted RSpec and Shakapacker gates passed.
- Phase 7 browser QA on deployment routes showed existing local dev-server stale chunk 404/MIME noise and shared styled-components deprecation warnings, with no deployment-specific blocker.
- Phase 8 browser QA confirmed the routed admin and Sidekiq surfaces are stable; remaining public-shell React/styled-components warnings and a Mapbox style `404` were accepted as unrelated noise for this route group.

## Notes

- `.planning/codebase/` contains the current codebase map.
- v1.0 archives live in `.planning/milestones/`.
- Phase execution directories were archived to `.planning/milestones/v1.0-phases/`.

## Quick Tasks Completed

| Date | Task | Status | Commit |
| --- | --- | --- | --- |
| 2026-05-05 | Remove legacy automation residue | complete | this commit |
| 2026-05-05 | Fix missing reading-list UUID nil title error | complete | this commit |
| 2026-05-04 | Restore production Mapbox style fallback | complete | this commit |
| 2026-05-04 | Document Google mock login for protected-route visual QA | complete | this commit |

## Operator Next Steps

- Start the next milestone with /gsd-new-milestone
