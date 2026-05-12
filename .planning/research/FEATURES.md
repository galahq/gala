# Feature Research: v1.1 Testing and Coverage

Date: 2026-05-12

## Desired Capabilities

- A pnpm-backed install and test workflow replaces Yarn 1 for JavaScript dependencies.
- Frontend unit/component tests run reliably from one documented command.
- Flow dependencies and Flow syntax are removed from the active frontend toolchain.
- TypeScript provides the modern type-checking direction, with JSDoc available for JavaScript files that are not worth converting immediately.
- Frontend tests run on Vitest if a compatibility spike proves the existing tests can migrate from Jest without excessive churn.
- Vite is evaluated for the frontend build path, but production bundler replacement is gated by route/build evidence.
- Playwright visual regression tests cover a small set of high-value routes derived from `config/routes.rb`.
- Visual baselines are committed and intentionally updated, not regenerated accidentally.
- Route QA continues to classify console and network errors before a phase is marked complete.

## Frontend Test Findings

- Current `package.json` uses `NODE_ENV=test jest app/javascript`.
- v1.0 recorded that full `yarn test --runInBand` is blocked by Jest transform failures on ES module imports.
- Latest Jest 30 supports Node 24 according to the npm registry, but the current Jest 24-era Babel config is likely to need migration work.
- The safe acceptance target is not "all test libraries latest at once"; it is a reliable test command with documented transforms and representative existing tests passing.

## Vitest and Vite Findings

- Latest Vitest is `4.1.6`; it is powered by Vite, supports Node 20/22/24+, and peers on Vite 6, 7, or 8.
- Latest Vite is `8.0.12`; it supports Node `^20.19.0 || >=22.12.0`, compatible with the repo's Node 24 target.
- Latest `@vitejs/plugin-react` is `6.0.1` and peers on Vite 8.
- Latest `vite_rails` is `3.11.0` and supports Rails via `railties >= 5.1, < 9`, compatible with Rails 8.1.
- Recommended acceptance target: prove Vitest can run the existing frontend test suite before investing in Jest 30 migration.
- Recommended Vite build target: spike feasibility separately from Vitest. Replacing Shakapacker/Webpack affects Rails asset integration and should not be assumed.

## Flow Removal Findings

- `package.json` currently includes Flow-specific packages: `@babel/preset-flow`, `eslint-plugin-flowtype`, `flow-bin`, and `flow-inspect`.
- The source tree contains many `@flow`, `@noflow`, `$FlowFixMe`, and Flow type annotations across React components, Redux modules, stats, catalog, quiz, edgenote, and utility code.
- Removing Flow from dependencies requires either stripping Flow syntax to plain JavaScript or converting selected modules to TypeScript/TSX.
- Recommended approach: introduce TypeScript configuration as the forward-compatible type tool, convert shared contract-heavy files first, and use JSDoc annotations in plain JavaScript where TypeScript conversion would be high churn.

## Visual Regression Findings

- Playwright's visual comparison API is `expect(page).toHaveScreenshot()`.
- Playwright generates reference screenshots on first run and compares against them on later runs.
- Official docs warn screenshot rendering varies by OS, browser, hardware, fonts, and headless/headed mode, so baselines should be generated and compared in a consistent environment.
- Playwright supports `--update-snapshots` for intentional baseline updates.
- `toHaveScreenshot` supports thresholds such as `maxDiffPixels` and a `stylePath` option to hide volatile elements.
- Non-image snapshots and screenshot directories should be committed and reviewed.

Sources:
- https://playwright.dev/docs/test-snapshots
- https://registry.npmjs.org/%40playwright%2Ftest/latest
- https://registry.npmjs.org/jest/latest
- https://registry.npmjs.org/babel-jest/latest

## Candidate Route Coverage

Use `config/routes.rb` as the source of truth, but keep initial visual coverage small and stable:

- Public catalog/root shell
- Search results or no-results state
- Public case show shell
- Reader/library surface where local fixture data supports deterministic render
- Authentication sign-in page
- Admin or operational shell only if local auth/data setup is deterministic

## Non-Goals

- Pixel-perfect full-site visual coverage in the first Playwright phase.
- Browser automation for every route group from v1.0.
- Replacing RSpec/Capybara coverage with Playwright.
- Upgrading React or BlueprintJS major versions.
- Keeping Flow alive by merely bumping `flow-bin`.
- Replacing Shakapacker/Webpack with Vite without a feasibility spike and route/build verification.
- Visual tests over volatile map tiles, remote images, timestamps, animations, or randomized data without masking/stabilization.
