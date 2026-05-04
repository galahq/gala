---
project: Gala
milestone: v1.0
milestone_name: Upgrade Stabilization
status: ready_for_phase_3
current_phase: 3
current_phase_name: Catalog Routes
current_plan: 00
updated: 2026-05-04
resume_file: .planning/ROADMAP.md
progress:
  phases_complete: 2
  phases_total: 9
  plans_complete: 4
  plans_total: 4
---

# GSD State

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-05-03)

**Core value:** Every important route must keep working and looking recognizably like the pre-upgrade Gala experience while the Ruby, Node.js, and BlueprintJS stack is modernized.
**Current focus:** Phase 3 - Catalog Routes

## Current Position

Phase: 3 - Catalog Routes
Plan: 00 - not planned yet
Status: Phase 2 passed; ready to discuss/plan Phase 3
Last activity: 2026-05-04 - Phase 2 public/utility routes hardened with static Blueprint 4 classes and verified
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

- None for Phases 1-2.

## Follow-Up Noise

- Browser tooling reaches the app via `host.docker.internal:3000`, which produces webpack-dev-server `Invalid Host/Origin header` HMR console errors.
- Root catalog browser QA observed an external Mapbox style `404` and React runtime warnings; defer to route-specific phases unless they block visible behavior.
- Phase 2 legacy redirect destinations can show missing local data after redirect; redirect targets are still preserved.

## Notes

- `.planning/codebase/` contains the current codebase map.
- `gsd-sdk` is not available on PATH in this environment, so initial artifacts were written directly and committed with regular git.
- Phase 1 execution used regular git commits and did not transition to Phase 2.
