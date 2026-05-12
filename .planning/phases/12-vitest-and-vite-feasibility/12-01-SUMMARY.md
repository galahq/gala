---
phase: 12-vitest-and-vite-feasibility
plan: 01
subsystem: testing
tags: [vitest, vite, shakapacker, webpack, pnpm, react-16, blueprint]
requires:
  - phase: 11-pnpm-package-manager-migration
    provides: pnpm package manager baseline
provides:
  - Vitest feasibility evidence for Phase 16
  - Vite production replacement gate for v1.1
  - Shakapacker/Webpack retention decision for v1.1
affects: [phase-15, phase-16, frontend-tests, frontend-build]
tech-stack:
  added: [vitest, vite, jsdom, vite-plugin-babel, "@vitejs/plugin-react"]
  patterns: [temporary planning-directory spike configs, evidence-backed bundler gate]
key-files:
  created:
    - .planning/phases/12-vitest-and-vite-feasibility/spikes/vitest.config.mjs
    - .planning/phases/12-vitest-and-vite-feasibility/spikes/vitest.setup.js
    - .planning/phases/12-vitest-and-vite-feasibility/spikes/vite.config.mjs
    - .planning/phases/12-vitest-and-vite-feasibility/12-01-SUMMARY.md
  modified:
    - package.json
    - pnpm-lock.yaml
key-decisions:
  - "Vitest is not accepted as a Phase 16 default yet; representative tests run but Jest mock/module semantics and Ramda/Babel interop need migration work."
  - "Vite production replacement is deferred for v1.1 because the representative build does not emit a manifest and blocks on YAML loader parity."
  - "Shakapacker/Webpack remains Gala's v1.1 production bundler."
patterns-established:
  - "Keep bundler feasibility configs under .planning/phases/12-vitest-and-vite-feasibility/spikes until a later phase commits a production migration."
requirements-completed: [VITE-01, VITE-04, VITE-05, VITE-06]
duration: 31 min
completed: 2026-05-12
---

# Phase 12 Plan 01: Vitest and Vite Feasibility Summary

**Vitest and Vite spikes with concrete blockers, preserving Jest and Shakapacker/Webpack as the working v1.1 baseline**

## Performance

- **Duration:** 31 min
- **Started:** 2026-05-12T03:02:00Z
- **Completed:** 2026-05-12T03:32:41Z
- **Tasks:** 3
- **Files modified:** 6

## Baseline evidence

- `pnpm install --frozen-lockfile` passed: already up to date with pnpm v11.1.0.
- `pnpm test -- --runInBand` passed before and after the spike dependencies: 1 suite skipped, 19 passed, 101 tests passed, 3 skipped. Existing React `FormattedList` key warning remains.
- Docker asset precompile passed after the dependency changes:
  - command: `docker compose exec web sh -lc 'pnpm install --frozen-lockfile && SECRET_KEY_BASE=build-placeholder DATABASE_URL=postgresql://placeholder/placeholder bundle exec rails assets:precompile'`
  - result: Webpack 5.106.1 compiled successfully and Shakapacker completed the build.

## Vitest decision

VITE-01 result: **defer Vitest adoption until Phase 16 migration work**.

The representative Vitest command ran but did not pass:

```bash
pnpm exec vitest run --config .planning/phases/12-vitest-and-vite-feasibility/spikes/vitest.config.mjs --reporter verbose
```

Observed result:

- 3 Blueprint namespace tests passed.
- 6 tests failed and 2 suites failed before tests completed.
- `blueprintLegacyNamespace.test.js` exposes `jest.fn` constructor semantics differences: `callback is not a function`.
- `DatePicker.test.jsx` exposes `jest.mock` / spy compatibility differences: `DateRangePicker` is not treated as a spy and `.mock.calls` is missing.
- `functions.test.js` and `cards.test.js` fail during module loading with Ramda/Babel interop: ``then` expected a Promise, received function () { [native code]`.

The temporary setup first tried current `jsdom@29.1.1`, but that broke Jest 24 globally with `VirtualConsole().sendTo is not a function`. The spike was changed to `jsdom@11.12.0` to preserve the existing Jest baseline while still allowing Vitest to run.

## Jest API audit

Command:

```bash
rg -n "jest\\.|jest\\.mock|jest\\.resetModules|jest\\.spyOn|jest\\.fn" app/javascript spec/support
```

Counts:

- `jest.fn`: 34
- `jest.mock`: 10
- `jest.clearAllMocks`: 2
- `jest.resetModules`: 1
- `jest.spyOn`: 1

Risk classification:

- Mechanical: most `jest.fn` and `jest.clearAllMocks` usage should map to `vi.fn` and `vi.clearAllMocks`.
- Behavior-risking: `jest.mock` appears in DatePicker, StatsPage, spotlight tests, and third-party component mocks; these need explicit Vitest mocking migration.
- Behavior-risking: `jest.resetModules` is used by `blueprintLegacyNamespace.test.js` and already failed under the simple `globalThis.jest = vi` bridge.
- Behavior-risking: `jest.spyOn(console, 'error')` in `StatsPage.test.jsx` needs explicit `vi.spyOn` cleanup semantics.

## Jest fallback

Keep Jest as the working frontend test runner until Phase 16. A Vitest migration remains plausible, but Phase 16 must plan explicit test updates instead of relying on a global `jest = vi` bridge.

Minimum Phase 16 work if Vitest is selected:

- Convert representative `jest.mock`, `jest.resetModules`, and `jest.spyOn` tests to Vitest-native APIs.
- Decide whether `jsdom@11.12.0` is an acceptable compatibility bridge or whether Jest must be upgraded/removed before modern jsdom can be installed.
- Investigate the Ramda/Babel interop failure before expanding beyond the representative subset.

## Vite decision

VITE-04 result: **Vite production replacement is not accepted for v1.1**.

The representative Vite build command ran but did not emit a manifest:

```bash
pnpm exec vite build --config .planning/phases/12-vitest-and-vite-feasibility/spikes/vite.config.mjs
```

Observed result:

- First attempt found config-level issues: SCSS extension resolution and a local alias for `redux` shadowed the real `redux` package.
- After narrowing aliases and adding CSS/Sass extensions, Vite transformed 2776 modules but failed on YAML locale imports from `config/locales/*.yml`.
- Vite/Rolldown reported browser externalization warnings for Node `path` from transitive markdown/vfile dependencies.
- No `tmp/vite-phase-12/.vite/manifest.json` or `tmp/vite-phase-12/manifest.json` was emitted.

Manifest entries: none, because the build failed before output.

CSS arrays: none inspectable, because the build failed before manifest output.

Assets: none inspectable, because the build failed before manifest output.

YAML: blocker. Existing Webpack uses `json-loader` plus `yaml-loader`; the temporary Vite config does not provide equivalent YAML module handling.

raw SVG: not reached in the successful transform path before YAML failure; still a required future compatibility check.

dynamic import: locale dynamic imports were part of the failing path and remain a required future compatibility check.

Blueprint CSS duplication: `rg -n "@blueprintjs/.*/lib/css" tmp/vite-phase-12 || true` found no output because `tmp/vite-phase-12` was not created. No production CSS order changed.

Blueprint compatibility: not accepted for Vite production replacement because no manifest/CSS output was available to validate ordering.

## Shakapacker/Webpack gate

VITE-05 result: **replacement gate not met**.

Vite production replacement may only proceed after a later phase proves all of these:

- Manifest helper parity for Rails-rendered packs.
- YAML locale import parity.
- raw SVG and dynamic image import parity.
- CSS output order with Sprockets-owned Blueprint package CSS unchanged or deliberately migrated.
- Route QA on `localhost:3000` with console and network checks.

VITE-06 result: **Shakapacker/Webpack remains the v1.1 production bundler**.

Current Shakapacker/Webpack evidence remains positive: Docker asset precompile passed, and no production Rails layout, Shakapacker, Webpack, pack entrypoint, or Blueprint asset-loading file was intentionally changed by this phase.

Route QA: not required because only temporary tooling configs, dev dependencies, and planning artifacts changed. Production route-facing JavaScript and asset helper behavior were not changed.

## Task Commits

1. **Task 1: Record baseline** - captured in this summary; baseline commands passed.
2. **Task 2: Vitest spike** - `3d96399a` added spike dependencies/configs and ran the representative Vitest command.
3. **Task 3: Vite spike** - `3d96399a` added the temporary Vite backend build config and ran the representative build.

**Plan metadata:** this summary commit.

## Files Created/Modified

- `package.json` - Added bounded dev dependencies for the feasibility spike.
- `pnpm-lock.yaml` - Locked the spike dependency graph.
- `.planning/phases/12-vitest-and-vite-feasibility/spikes/vitest.config.mjs` - Temporary Vitest config.
- `.planning/phases/12-vitest-and-vite-feasibility/spikes/vitest.setup.js` - Temporary Vitest setup with a minimal Jest compatibility bridge.
- `.planning/phases/12-vitest-and-vite-feasibility/spikes/vite.config.mjs` - Temporary non-production Vite backend build config.
- `.planning/phases/12-vitest-and-vite-feasibility/12-01-SUMMARY.md` - Feasibility evidence and decisions.

## Decisions Made

- Use `jsdom@11.12.0`, not `jsdom@29.1.1`, while Jest 24 remains installed because current jsdom breaks `jest-environment-jsdom@24.9.0`.
- Do not change `package.json` test scripts in Phase 12.
- Do not replace Shakapacker/Webpack in v1.1.
- Keep Vite as a future production migration candidate only after YAML, manifest, raw SVG, asset, CSS order, and route evidence exists.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Current jsdom broke Jest 24**
- **Found during:** Task 2
- **Issue:** Installing `jsdom@29.1.1` caused all Jest suites to fail with `VirtualConsole().sendTo is not a function`.
- **Fix:** Changed the direct spike dependency to `jsdom@11.12.0`, matching the Jest 24-era API surface.
- **Files modified:** `package.json`, `pnpm-lock.yaml`
- **Verification:** `pnpm test -- --runInBand` passed after the change.
- **Committed in:** `3d96399a`

**2. [Rule 3 - Blocking] Babel transformed Vitest setup to CommonJS**
- **Found during:** Task 2
- **Issue:** Vitest rejected the setup file after Babel converted its `import { vi } from 'vitest'` to CommonJS `require`.
- **Fix:** Limited the Babel bridge to `app/javascript` source files.
- **Files modified:** `.planning/phases/12-vitest-and-vite-feasibility/spikes/vitest.config.mjs`
- **Verification:** Vitest progressed to executing representative tests.
- **Committed in:** `3d96399a`

**3. [Rule 3 - Blocking] Vite alias config shadowed real package imports**
- **Found during:** Task 3
- **Issue:** The first Vite config aliased bare `redux` to the local source directory, breaking imports from the real `redux` package.
- **Fix:** Changed aliases to prefix-only regex aliases for source directories, while preserving exact aliases only for local bare imports such as `catalog`, `deployment`, and `Case`.
- **Files modified:** `.planning/phases/12-vitest-and-vite-feasibility/spikes/vite.config.mjs`, `.planning/phases/12-vitest-and-vite-feasibility/spikes/vitest.config.mjs`
- **Verification:** Vite progressed past the alias error and failed later on YAML loader parity.
- **Committed in:** `3d96399a`

**Total deviations:** 3 auto-fixed blocking issues.
**Impact on plan:** All fixes stayed inside the temporary spike scope or dev dependency set. Production Shakapacker/Webpack behavior was not changed.

## Issues Encountered

- Vitest representative subset does not pass with a simple compatibility bridge.
- Vite build does not emit a manifest because YAML locale imports need an explicit Vite equivalent to Webpack's YAML loader chain.
- Vite/Rolldown reports browser externalization warnings for Node `path` through transitive markdown/vfile dependencies.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 13 can proceed with Flow removal independently.

Phase 16 should keep Jest as the fallback and only select Vitest if it includes explicit migration tasks for Jest mocks, module reset behavior, jsdom compatibility, and Ramda/Babel interop.

Phase 15 should preserve Shakapacker/Webpack production behavior unless a later Vite migration phase is added with route/build/asset proof.

---
*Phase: 12-vitest-and-vite-feasibility*
*Completed: 2026-05-12*
