---
project: Gala
milestone: v1.0
milestone_name: Upgrade Stabilization
status: human_needed
current_phase: 1
current_phase_name: Baseline Asset Gate
current_plan: 03
updated: 2026-05-04
resume_file: .planning/phases/01-baseline-asset-gate/01-VERIFICATION.md
progress:
  phases_complete: 0
  phases_total: 9
  plans_complete: 2
  plans_total: 3
---

# GSD State

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-05-03)

**Core value:** Every important route must keep working and looking recognizably like the pre-upgrade Gala experience while the Ruby, Node.js, and BlueprintJS stack is modernized.
**Current focus:** Phase 1 - Baseline Asset Gate

## Current Position

Phase: 1 - Baseline Asset Gate
Plan: 03 - Local browser QA gate
Status: Human verification needed for Phase 1 browser QA noise
Last activity: 2026-05-04 - Phase 1 Plans 01 and 02 completed; Plan 03 evidence recorded as human_needed
Resume file: `.planning/phases/01-baseline-asset-gate/01-VERIFICATION.md`

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

- Phase 1 browser QA is not clean enough to mark passed automatically. See `.planning/phases/01-baseline-asset-gate/01-QA-GATE.md` and `01-VERIFICATION.md`.
- Browser tooling reached the app via `host.docker.internal:3000`, which produces webpack-dev-server `Invalid Host/Origin header` HMR console errors. Confirm in a normal browser at `http://localhost:3000`.
- Root catalog browser QA observed an external Mapbox style `404` and React runtime warnings that need acceptance as pre-existing noise or follow-up before phase transition.

## Notes

- `.planning/codebase/` contains the current codebase map.
- `gsd-sdk` is not available on PATH in this environment, so initial artifacts were written directly and committed with regular git.
- Phase 1 execution used regular git commits and did not transition to Phase 2.
