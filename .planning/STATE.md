---
project: Gala
milestone: v1.0
milestone_name: Upgrade Stabilization
status: ready_for_phase_4
current_phase: 4
current_phase_name: Core Case Shell
current_plan: 00
updated: 2026-05-04
resume_file: .planning/ROADMAP.md
progress:
  phases_complete: 3
  phases_total: 9
  plans_complete: 5
  plans_total: 5
---

# GSD State

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-05-03)

**Core value:** Every important route must keep working and looking recognizably like the pre-upgrade Gala experience while the Ruby, Node.js, and BlueprintJS stack is modernized.
**Current focus:** Phase 4 - Core Case Shell

## Current Position

Phase: 4 - Core Case Shell
Plan: 00 - not planned yet
Status: Phase 3 passed; ready to discuss/plan Phase 4
Last activity: 2026-05-04 - Phase 3 catalog routes hardened and search fallback fixed for unpopulated local index
Resume file: `.planning/ROADMAP.md`

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

- None for Phases 1-3.

## Follow-Up Noise

- Browser tooling reaches the app via `host.docker.internal:3000`, which produces webpack-dev-server `Invalid Host/Origin header` HMR console errors.
- Root catalog browser QA observed an external Mapbox style `404` and React runtime warnings; defer to route-specific phases unless they block visible behavior.
- Phase 2 legacy redirect destinations can show missing local data after redirect; redirect targets are still preserved.
- Phase 3 search returns `[]` if the local `cases_search_index` materialized view is present but unpopulated; refresh the index for real local search data.

## Notes

- `.planning/codebase/` contains the current codebase map.
- `gsd-sdk` is not available on PATH in this environment, so initial artifacts were written directly and committed with regular git.
- Phase 1 execution used regular git commits and did not transition to Phase 2.
