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

- Prefer a fast unit/component command backed by Vitest if compatibility with the existing React 16/Babel test corpus is practical.
- Treat Jest 30 as a fallback path if Vitest migration creates more churn than it removes.
- Add any required explicit browser-like test environment dependency, such as `jsdom` or `happy-dom`, if the selected runner requires it.
- Keep legacy React 16 compatible testing APIs unless a requirement explicitly scopes React test-library migration.
- Preserve targeted test names and existing behavior while making the full command stable.

Current runner signals:

- Vitest latest registry version is `4.1.6`; it peers on Vite `^6 || ^7 || ^8` and supports Node 20, 22, and 24+.
- Vite latest registry version is `8.0.12`; it requires Node `^20.19.0 || >=22.12.0`, compatible with the repo's Node 24 target.
- `@vitejs/plugin-react` latest is `6.0.1`; it peers on Vite 8 and uses the modern Vite plugin stack.

Sources:
- https://registry.npmjs.org/vitest/latest
- https://registry.npmjs.org/vite/latest
- https://registry.npmjs.org/%40vitejs%2Fplugin-react/latest

## Vite Build Architecture Evaluation

Recommended shape:

- Evaluate Vite separately from the test-runner migration.
- Keep Shakapacker/Webpack as the production bundler unless a focused spike proves Vite can serve the existing Rails pack entrypoints, CSS imports, static assets, and Blueprint compatibility layers without route regressions.
- If viable, use the Rails ecosystem path through `vite_rails`/`vite_ruby` rather than hand-rolled asset tags.
- Consider a test-only Vite config first, because Vitest can provide faster tests without immediately replacing the Rails asset build.
- Treat full Shakapacker-to-Vite replacement as optional v1.1 scope gated by spike evidence, not an assumed requirement.

Current Rails/Vite signal:

- `vite_rails` latest registry version is `3.11.0`; it supports Rails via `railties >= 5.1, < 9`, compatible with Rails 8.1.

Source:
- https://rubygems.org/api/v1/gems/vite_rails.json

## Flow Removal and Type Architecture

Recommended shape:

- Remove Flow-specific package dependencies after the source tree no longer requires Flow parsing.
- Add TypeScript tooling as the long-term replacement for static typing.
- Start with a conservative `tsconfig.json` that supports staged migration, likely `allowJs` with explicit included paths and no broad `checkJs` gate until noisy files are converted or documented.
- Convert low-risk shared type/contract files from Flow to TypeScript first, especially files whose purpose is already type/data contracts.
- For React 16 JSX files, convert to `.tsx` only when the file has meaningful Flow types or shared contracts; otherwise strip Flow annotations and use JSDoc where useful.
- Replace `$FlowFixMe` with either real TypeScript-compatible types, scoped JSDoc comments, or plain code simplification. Avoid introducing blanket ignores as a one-for-one substitute.
- Remove `@babel/preset-flow`, `flow-bin`, `flow-inspect`, `eslint-plugin-flowtype`, and related config once build/test pass without Flow parsing.

## React and Blueprint Compatibility

Recommended shape:

- Keep React on the current 16.8 line during v1.1.
- Keep BlueprintJS on the current 4.x line during v1.1.
- Treat React/Blueprint major upgrades as a separate milestone because latest BlueprintJS peers on React 18.
- Validate that dependency and test-tool updates do not disturb v1.0 Blueprint compatibility layers.

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
