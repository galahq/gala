# Feature Research: v1.1 Testing and Coverage

Date: 2026-05-12

## Desired Capabilities

- A pnpm-backed install and test workflow replaces Yarn 1 for JavaScript dependencies.
- Frontend unit/component tests run reliably from one documented command.
- Playwright visual regression tests cover a small set of high-value routes derived from `config/routes.rb`.
- Visual baselines are committed and intentionally updated, not regenerated accidentally.
- Route QA continues to classify console and network errors before a phase is marked complete.

## Frontend Test Findings

- Current `package.json` uses `NODE_ENV=test jest app/javascript`.
- v1.0 recorded that full `yarn test --runInBand` is blocked by Jest transform failures on ES module imports.
- Latest Jest 30 supports Node 24 according to the npm registry, but the current Jest 24-era Babel config is likely to need migration work.
- The safe acceptance target is not "all test libraries latest at once"; it is a reliable test command with documented transforms and representative existing tests passing.

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
- Visual tests over volatile map tiles, remote images, timestamps, animations, or randomized data without masking/stabilization.
