# Phase 17: Playwright Visual Regression Coverage - Research

**Gathered:** 2026-05-16
**Status:** Complete
**Source:** Local codebase + roadmap context + prior phase decisions

## Research Goal

- Make Playwright Test the canonical visual-regression runner.
- Cover a small, deterministic set of routes derived from `config/routes.rb`.
- Keep routes and baselines stable with strict compare/update separation and explicit diff controls.
- Classify browser console/network noise before accepting visual coverage.

## Findings

### Existing Baseline

- `package.json` already targets Node 24 and `pnpm@11.1.0`, and Playwright is present.
- There is no `@playwright/test` dependency yet in `package.json`.
- There is no existing `playwright.config.*` or dedicated visual test suite directory.
- Existing JS frontend test command is `test: NODE_ENV=test jest app/javascript`, with Jest-based failures historically observed in this project.

### Required Runner Shape

- Use `@playwright/test` (Playwright Test) as the visual runner (not Puppeteer/Cypress/screenshot scripts).
- Use route-driven specs under a dedicated path (candidate: `tests/visual/`).
- Provide two explicit commands:
  - compare mode: `pnpm test:visual`
  - update mode: `pnpm test:visual:update` (opt-in and explicit)
- Keep snapshots/baseline artifacts local (`test-results`, `tests/visual/**/__screenshots__`, `playwright-report`).

### Route Group Baseline

Given phase 17 context and v1.0 route discipline:

- Public shell:
  - `/`
  - `/search`
  - `/cases`
  - representative case routes discovered from `/cases` list (dynamic extraction to avoid local slug assumptions)
  - `/catalog/...` shell route via `/catalog`
- Reader-safe:
  - `/profile`
  - `/my_cases`
  - `/reading_lists`
- Admin/editor candidate:
  - `/admin`
  - `/admin/cases`
- Deferrals:
  - `/deployments`, `/podcasts`, `/libraries/:slug`, and `/sidekiq` remain excluded in this initial pass.

### Determinism and Stability Controls

- Add per-test stabilization:
  - fixed viewport list (`1366x768`, `375x812`)
  - disabled animations and caret hiding in screenshot assertions
  - route-specific ignore/mask selectors for known volatile elements
- Use deterministic waits (`waitForLoadState('networkidle')`) and targeted route assertion before screenshot.
- Collect console and network errors per test and fail on unexpected categories; keep explicit allowlist for approved, documented noise.

### Constraints from Prior Decisions

- Keep BlueprintJS/React hold and compatibility style targets from v1.1 instructions.
- Use `localhost:3000` for browser QA and keep server assumptions explicit.
- Do not overwrite or sync to any existing S3 snapshot bucket.
- Keep route set small and deterministic for this phase.

### Recommended File Set

- `package.json` (scripts + dependency + maybe lockfile update via pnpm workflow)
- `playwright.config.mjs` (or `.ts`)
- `tests/visual/visual-routes.spec.mjs`
- `tests/visual/visual-helpers.mjs`
- Optional noise allowlist: `tests/visual/allowlist.json` or equivalent

## Open Questions / Risk Log

- Playwright browser install lifecycle may require first-time installation (`pnpm exec playwright install --with-deps`).
- Protected-route navigation in CI needs deterministic auth strategy (mock Google sign-in path if used).
- Baseline stability requires route-level masking decisions after first snapshot run.

## Recommended Decisions

- Implement pnpm-backed visual commands with strict compare default.
- Keep baseline updates separate and intentional.
- Preserve local artifacts only in repo working dirs and CI paths; do not write to external object storage.
- Capture and classify console/network findings in test run output before route acceptance.

---

*Phase: 17-playwright-visual-regression-coverage*
*Research completed: 2026-05-16*
