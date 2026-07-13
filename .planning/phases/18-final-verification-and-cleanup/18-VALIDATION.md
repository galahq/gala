---
phase: 18
validation_type: execution
status: partial
owner: executor
updated: 2026-05-16T06:55:00Z
---

# Phase 18 Validation (Final Verification and Cleanup)

## Verification checklist

- [x] `rg -n "from ['\"]deprecated/|require\(['\"]deprecated/" app/javascript spec`
  - Result: no remaining imports/requires from `deprecated/` under `app/javascript`.
- [x] `rg -n "flow-typed|@flow|@noflow|FlowFixMe" app/javascript spec lib .planning`
  - Result: no matches in scoped runtime/test source (`app/javascript`, `spec`, `lib`).
  - Remaining matches are documentation-only in `.planning/*` and pre-existing legacy ERB pragmas:
    - `app/assets/javascripts/sentry.js.erb`
    - `app/views/roles/_replace_button.js.erb`
    - These files are outside this phase’s cleanup scope and were not part of `flow-typed` removal.
- [x] `rg -n "yarn test|yarn install|engines\\.yarn|bin/yarn" package.json AGENTS.md README.md app .github .semaphore infra scripts`
  - Result: no active runtime/docs references to Yarn remain on current phase surfaces.
  - Remaining hits are historical references in `.planning/*`.
- [ ] `git status --short` shows only files intentionally changed by this phase.
  - Result: workspace still includes additional in-progress changes outside this phase (`.planning/phases/15-*`, `.planning/phases/16-*`, etc.); not yet isolated.
- [x] Targeted test gates run for files modified in this phase:
  - `pnpm test -- --runInBand app/javascript/utility/__tests__/Toolbar.test.jsx app/javascript/shared/__tests__/functions.test.js`
    - Result: partial pass (`18` of `20` suites passed, `1` failed, `1` skipped).
    - Failure was pre-existing in `app/javascript/stats/__tests__/DatePicker.test.jsx`
      (`selectedShortcutIndex` expected `0`, received `-1`).
  - `bundle exec rspec spec/controllers/cases_controller_spec.rb`
    - Result: blocked locally by missing gems (`Bundler::GemNotFound`).

## Post-cleanup risk review

- [ ] Re-check changed render paths under local dev route smoke if any UI-facing files were removed.
  - Pending: route-level smoke not executed in this validation pass.
- [ ] Confirm no route-facing behavior changed without QA evidence.
  - Pending: no route-level verification recorded during this pass.
- [ ] Ensure `config/routes.rb` route surfaces are unchanged unless explicitly documented.
  - Pending: not re-scanned in this pass; imports were moved only, no route edits.

## Acceptance mapping

- `QA-05` is partially satisfied for this phase.
  - Ruby boot/test check evidence: blocked locally.
  - Frontend command test evidence: collected (partial pass with pre-existing failure).
  - Route visual/behavior confirmation: not executed in this phase.
