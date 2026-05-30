# Phase 15-01 Summary: Conservative JavaScript Dependency Modernization

**Completed:** 2026-05-30
**Status:** complete

## Scope

Phase 15-01 applied one narrow JavaScript dependency batch while preserving the v1.1 compatibility rails:

- React and ReactDOM remain on the current React 16 line (`16.12.0` resolved).
- Blueprint packages remain on the current 4.x line.
- Shakapacker npm and Ruby gem versions remain aligned at `10.0.0`.
- Shakapacker/Webpack remain the production bundler; Vite replacement remains deferred.
- Blueprint legacy namespace and global asset-loading files were not changed.

## Package Decisions

Updated:

- `webpack`: `5.106.1` -> `5.107.2`
- `webpack-dev-server`: `5.2.3` -> `5.2.4`
- `sass`: `1.92.1` -> `1.100.0`

Held intentionally:

- `shakapacker`: registry latest was `10.1.0`, but npm and gem stay aligned at `10.0.0`.
- `sass-loader`: registry latest was `17.0.0`; held at `16.0.7` to avoid a major loader jump.
- `css-loader`: registry latest was `7.1.4`; held at `6.11.0` to avoid a major loader jump.
- `webpack-cli`: registry latest was `7.0.3`; held on the current direct major.
- `webpack-merge`: registry latest was `6.0.1`; held at direct `5.10.0`.
- React and Blueprint major upgrades remain out of scope for v1.1.

## Verification

- Passed: `pnpm install --frozen-lockfile`
- Initially failed, then passed after a narrow existing DatePicker fix: `pnpm test -- --runInBand`
  - Final result: 19 suites passed, 1 skipped; 101 tests passed, 3 skipped.
- Passed: `pnpm exec jest app/javascript/stats/__tests__/DatePicker.test.jsx --runInBand`
- Passed: `docker compose exec web sh -lc 'pnpm install --frozen-lockfile && SECRET_KEY_BASE=build-placeholder DATABASE_URL=postgresql://placeholder/placeholder bundle exec rails assets:precompile'`

The first frontend test run exposed that `DatePicker` used real today for shortcut ranges even when `maxDate` was explicitly capped. The fix now derives shortcut end dates from the effective `maxDate`, preserving the existing behavior when no `maxDate` is supplied and allowing capped ranges to select the all-time shortcut.

## Requirement Mapping

- JS-01: registry metadata was rechecked on 2026-05-30 and package decisions are recorded in `15-RESEARCH.md`.
- JS-02: Shakapacker npm and gem remain aligned at `10.0.0`.
- JS-03: Webpack/Shakapacker behavior was verified by frozen install, frontend tests, and Docker asset precompile.
- JS-04: Blueprint packages and compatibility surfaces were held unchanged; the Blueprint DatePicker test remains green after the capped-range fix.

## Route QA Note

No route-specific browser QA was required for this package batch because the production pack entrypoints, Shakapacker config, Blueprint global CSS ownership, and legacy namespace bridge were not changed. Docker asset precompile validated production asset generation for this phase.
