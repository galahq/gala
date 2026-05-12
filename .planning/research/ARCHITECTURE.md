# Architecture Research: pnpm, Dependencies, and Visual Tests

Date: 2026-05-12

## Package Manager Migration

Recommended shape:

- Change `packageManager` from Yarn 1 to pinned pnpm, likely `pnpm@11.1.0` if execution begins immediately.
- Replace `engines.yarn` with a pnpm expectation.
- Generate and commit `pnpm-lock.yaml`.
- Remove `yarn.lock` only after pnpm install and existing build/test commands work.
- Update docs and scripts from `yarn` to `pnpm`.
- Prefer `corepack use pnpm@latest-11` or equivalent pinned package-manager entry for reproducible local installs.

Official pnpm installation docs note:

- pnpm 11 requires Node at least 22 when not using the standalone executable.
- Corepack can pin the project package manager in `package.json`.
- pnpm 11 supports Node 22, 24, and 26.

Sources:
- https://pnpm.io/installation
- https://registry.npmjs.org/pnpm/latest

## Frontend Test Architecture

Recommended shape:

- Keep a fast unit/component command, for example `pnpm test` or `pnpm test:frontend`, running Jest against `app/javascript`.
- Modernize Jest/Babel configuration just enough to handle current dependency module formats.
- Add any required explicit test environment dependency, such as `jest-environment-jsdom`, if the selected Jest version requires it.
- Keep legacy React 16 compatible testing APIs unless a requirement explicitly scopes React test-library migration.
- Preserve targeted test names and existing behavior while making the full command stable.

## Visual Regression Architecture

Recommended shape:

- Add `@playwright/test` as the canonical test-runner package, even if `playwright` is already present.
- Add `playwright.config.*` with stable settings for base URL, browser project, screenshot thresholds, and output paths.
- Add route specs under a dedicated directory such as `tests/visual` or `app/javascript/__visual__`.
- Add `pnpm test:visual` for comparisons and `pnpm test:visual:update` for intentional baseline updates.
- Stabilize screenshots with deterministic seed data, viewport sizes, animation disabling, and `stylePath` masks for volatile elements.
- Use one browser/project initially, most likely Chromium, until the baseline process is reliable.

## Ruby Dependency Architecture

Recommended shape:

- Keep Rails at the current latest stable `8.1.3` unless a newer patch is available when implementation starts.
- Audit constrained gems and update in small groups:
  - runtime server/background/cache/database gems
  - authentication/admin/integration gems
  - test/development gems
- Run targeted RSpec or unit tests for touched code paths and boot/asset checks after dependency lockfile changes.
- Treat major upgrades such as Sidekiq 7 to 8 and Puma 7 to 8 as separate verification gates because they can affect Rack/runtime behavior.

## CI/Verification Implications

- All JavaScript verification commands should use pnpm.
- Existing Ruby verification remains Bundler-based.
- Visual tests require a running Rails server on `localhost:3000` or a Playwright web server config that starts it deterministically.
- Browser console and network error capture remains required before accepting route-facing dependency changes.
