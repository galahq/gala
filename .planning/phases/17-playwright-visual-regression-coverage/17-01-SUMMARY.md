---
phase: 17
plan: 1
status: ready
result: partial
run_date: 2026-05-16
runner: pnpm

## Summary

- Added a Playwright visual regression entrypoint and scripts in `package.json` (`test:visual`, `test:visual:update`, `test:visual:install`).
- Added `playwright.config.mjs` for local-only Chromium execution against `http://localhost:3000` with local artifacts (`playwright-report`, `test-results`, `tests/visual/__screenshots__`).
- Added route-driven visual coverage specs in `tests/visual/visual-routes.spec.mjs` and shared helpers in `tests/visual/visual-route-helpers.mjs`.
- Added route-level noise allowlist in `tests/visual/noise-allowlist.json` for controlled console/network deviations.
- Implemented deterministic two-viewport capture (1366x768 and 375x812) for public + reader-safe + admin candidate routes and per-route auth isolation.
- Implemented deterministic case slug resolution for `/cases/:slug/*` from `/cases` links with fallback to `mi-wolves/translations/fr`.
- Added support for explicit deterministic slug override via `VISUAL_CASE_SLUG`.

## Files changed

- `package.json`
- `playwright.config.mjs`
- `tests/visual/visual-route-helpers.mjs`
- `tests/visual/visual-routes.spec.mjs`
- `tests/visual/noise-allowlist.json`

## Route matrix implemented

- `/`
- `/catalog`
- `/cases`
- `/cases/:slug/*`
- `/search`
- `/profile`
- `/my_cases`
- `/reading_lists`
- `/admin`
- `/admin/cases`

## Checks completed

- Structural and contract checks:
  - `node -e` validation for Playwright script contract and `@playwright/test` presence: passed.
  - `node -e` config loader validation for `playwright.config.mjs`: passed.
  - `pnpm exec playwright test --config playwright.config.mjs --list`: passed (1 test discovered).
  - `pnpm test:visual --help`: passed.
- Lockfile sync:
  - Ran `pnpm install --no-frozen-lockfile` and aligned `playwright`/`@playwright/test` to `^1.60.0`.
- Runtime baseline update/generation remains pending:
  - `pnpm test:visual` (not executed in this pass)
  - `pnpm test:visual:update` (not executed in this pass)
  - Playwright browser install + Rails server on `localhost:3000` (not executed in this pass)

## Follow-up

- Execute full visual run when environment is ready on `localhost:3000`.
- If deterministic case slug inference fails in a target environment, set `VISUAL_CASE_SLUG` to a known public case slug.
- Track any additional required route candidates in a follow-up phase only after this baseline stabilizes.
