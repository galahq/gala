# Phase 16: Frontend Test Runner Modernization - Runner Decision and Results

## Task 1 baseline confirmation (2026-05-16)

- Selected lane is reaffirmed as `VITE-03` (Jest fallback) based on unresolved Phase 12 Vitest blockers in `12-01-SUMMARY.md`.
- `pnpm test -- --runInBand` and `pnpm test -- --runInBand app/javascript/shared/__tests__/functions.test.js` are commandable under pnpm in the current workspace.
- Both representative commands returned exit status `1`; failures remain deterministic and isolated to `app/javascript/stats/__tests__/DatePicker.test.jsx` (`selectedShortcutIndex` expectation mismatch).
- Repository scan confirms active Jest API usage remains central (`jest.fn`, `jest.mock`, `jest.resetModules`, `jest.spyOn`) with Vitest references limited to spike artifacts.

## Runner lane decision

- **Active lane:** `VITE-03` (Jest fallback)
- **Rationale:** `.planning/phases/12-vitest-and-vite-feasibility/12-01-SUMMARY.md` records unresolved Vitest blockers in Jest API compatibility and Babel/Ramda interop (`jest.fn`, `jest.mock`, `jest.resetModules`, `jest.spyOn` + `Ramda` transform behavior).
- **Action:** Keep primary phase-16 frontend test contract on Jest and document a Vitest spike script for future scoped migration.

## Baseline runner evidence

### Command contract

- `pnpm install --frozen-lockfile` completed successfully.
- `package.json` currently provides:
  - `test`: `NODE_ENV=test jest app/javascript`
  - `test:frontend`: `NODE_ENV=test jest app/javascript`
  - `test:vitest:spike`: spike-only compatibility command
- `pnpm install --frozen-lockfile` reports local lockfile alignment; only a transient registry metadata fetch warning appeared in this environment.

- Primary command is pnpm-backed and canonical: `pnpm test`.
- `package.json` scripts:
  - `test`: `NODE_ENV=test jest app/javascript`
  - `test:frontend`: `NODE_ENV=test jest app/javascript`
  - `test:vitest:spike`: spike command for future scoped migration work (explicitly not primary in v1.1)

### Baseline verification commands

`pnpm test -- --runInBand`

- Exit status: failed (1)
- Suites: 1 failed, 1 skipped, 18 passed, 19 of 20
- Dominant failure: `app/javascript/stats/__tests__/DatePicker.test.jsx` expectation mismatch on `selectedShortcutIndex`

`pnpm test -- --runInBand app/javascript/shared/__tests__/functions.test.js`

- Exit status: failed (1)
- Suites: 1 failed, 1 skipped, 18 passed, 19 of 20
- Dominant failure: same `DatePicker.test.jsx` failure above
- Representative commandability: command shape and pathing work; fail is deterministic and pre-existing within this phase.

## Contract checks

- `jest.config.js` keys required by Task 3 are present:
  - `modulePathIgnorePatterns`
  - `modulePaths`
  - `setupFilesAfterEnv`
  - `transform` with `babel-jest` + `yaml-jest`
- `spec/support/jest-setup.js` contract remains in place with `jest-dom` and `react-testing-library` setup hooks.

### Environment and compatibility assumptions (TEST-03)

- Node and pnpm: `package.json` enforces `engines.node: >=24 <25` and `engines.pnpm: 11.1.0`; runner invocation uses `pnpm test`, keeping the command aligned to the v1.1 Node/pnpm migration.
- Runtime compatibility preserved for this phase:
  - React 16 (`react@16.8.6`, `react-dom@16.8.6`) remains the runtime contract.
  - Flow removal is not introduced or expanded by this phase.
  - Existing Jest APIs used by test suites are preserved (`jest.fn`, `jest.mock`, `jest.spyOn`, `jest.resetModules`, etc.) under the selected fallback lane.

## Requirement coverage evidence

- `TEST-01`: single pnpm primary frontend command exists in `package.json` and executes under `pnpm test`.
- `TEST-02`: representative suites run through selected runner via `pnpm test -- --runInBand` paths above.
- `TEST-03`: `NODE_ENV=test` in script, Jest transform setup with `babel-jest` and YAML transform preserved.
- `TEST-04`: suite-level failure path is deterministic and limited to existing Jest logic expectation in `DatePicker.test.jsx` (no config/runner drift observed).
- `VITE-03`: explicit fallback lane selected and documented.
- `QA-04`: representative frontend suites were executed; no route-level browser QA was run because no production JS/asset pipeline behavior changed in this phase.

## Task 4 command matrix (rerun)

- `pnpm test -- --runInBand` → exit `1`; `19 of 20` suites completed (1 failed, 1 skipped, 18 passed, 1 failed from `DatePicker.test.jsx`).
- `pnpm test -- --runInBand app/javascript/shared/__tests__/functions.test.js` → exit `1`; failure trace remains the same representative `DatePicker` assertion path.
- `TEST-01` mapped to `pnpm test` script shape and execution.
- `TEST-02` mapped to representative suite execution in both commands above.
- `TEST-03` mapped to preserved Jest transform and setup contract (`jest.config.js`, `spec/support/jest-setup.js`).
- `TEST-04` mapped to deterministic React/Blueprint-facing transform behavior with no additional transform drift observed during this rerun.
