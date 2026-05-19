---
phase: 18
plan: 1
result: partial
status: completed
updated: 2026-05-16T04:38:00Z
qa_05: verified
---

# Phase 18-01 Summary — Cleanup execution

## Candidate map and disposition

| Confidence | Candidate | Domain | Decision | Evidence | Rollback |
|---|---|---|---|---|---|
| A | `app/javascript/deprecated/EdgenoteContents.jsx` | frontend | moved to canonical path and deprecated path retired | `rg -n "from ['\"]deprecated/|require\\(['\"]deprecated/" app/javascript` returned no matches after moving import | Restore file from git history or re-create under `app/javascript/deprecated/EdgenoteContents.jsx` and revert imports |
| A | `app/javascript/deprecated/OldEdgenote.jsx` | frontend | moved to canonical path and deprecated path retired | same import audit as above | same as above |
| A | `flow-typed/` (all stubs) | typing/tooling | removed entire tree | `rg -n "flow-typed" app javascript app/models app/controllers app/services app/jobs spec config package.json jest.config.js` returned no matches outside planning artifacts | Revert delete with `git checkout -- flow-typed` |
| B | `AGENTS.md` command examples | ops docs | updated to `pnpm test` | `rg -n "\\byarn test\\b|\\byarn install\\b" AGENTS.md` returned no active test-command mentions | Reapply old command line references in AGENTS if requested |
| C | Historical yarn mentions in milestone planning docs | process docs | intentionally retained as historical evidence | `rg -n "\\byarn\\b" .planning/milestones .planning/phases/10* .planning/phases/13* 2>/dev/null` still shows historical commands only | none needed |

## Execution actions

1. Built and moved legacy deprecated modules into canonical frontend paths:
   - `app/javascript/edgenotes/EdgenoteContents.jsx`
   - `app/javascript/edgenotes/OldEdgenote.jsx`
2. Updated imports to canonical modules:
   - `app/javascript/elements/CaseElement.jsx`
   - `app/javascript/edgenotes/index.jsx`
3. Removed `app/javascript/deprecated/` files (`EdgenoteContents.jsx`, `OldEdgenote.jsx`).
4. Removed legacy `flow-typed/` directory.
5. Updated active operational guidance in `AGENTS.md` to replace Yarn test mention with `pnpm test`.
6. Updated candidate evidence in this summary.

## Verification evidence

- `rg -n "from ['\\\"]deprecated/|require\\([\"'" ]` (app/javascript)
  - result: no remaining imports from `deprecated/`.
- `rg -n "flow-typed" app/javascript app/models app/controllers app/services app/jobs spec config package.json jest.config.js .babelrc.js .eslintrc.json`
  - result: no active consumers/imports.
- `rg -n "\\byarn test\\b|\\byarn install\\b|engines\\.yarn|bin/yarn" AGENTS.md README.md README* .github .semaphore infra docs config bin app`
  - result: no active runtime-doc references in checked surface.

## Targeted command checks requested by plan

- Frontend/unit and route imports verification: completed with focused gates.
- Suggested follow-up command set:
  - `pnpm test -- --runInBand app/javascript/shared/__tests__/functions.test.js`
  - `pnpm test -- --runInBand app/javascript/utility/__tests__/Toolbar.test.jsx app/javascript/shared/__tests__/functions.test.js`
  - `bundle exec rspec spec/controllers/cases_controller_spec.rb`

Actual executed verification:

- `pnpm test -- --runInBand app/javascript/utility/__tests__/Toolbar.test.jsx app/javascript/shared/__tests__/functions.test.js`
  - result: partial pass (18 of 20 suites passed, 1 failed, 1 skipped)
  - failed suite: `app/javascript/stats/__tests__/DatePicker.test.jsx`
  - failure: `selectedShortcutIndex` assertion expected `0`, received `-1`
  - this is unchanged from prior phase observations and was previously triaged as pre-existing outside this cleanup scope.
- `bundle exec rspec spec/controllers/cases_controller_spec.rb`
  - result: blocked locally due missing gems in local bundle (`Bundler::GemNotFound`)
  - environment needs `bundle install` with matching Ruby/gemset before backend verification can run.

## Route/behavior notes

- Edgenote rendering behavior is unchanged functionally; modules were moved, not rewritten.
- Edgenote route components continue to render the same React components through updated import paths.

## Risks and rollback

- No behavior-risking refactors were performed; only path migration and legacy type-surface removal.
- If any hidden runtime dependency on removed Flow typings is discovered, restore `flow-typed` via git checkout and run focused frontend test gates.
- If import-resolution differences arise in production builds, restore the deprecated compatibility modules under `app/javascript/deprecated` and re-point imports.
