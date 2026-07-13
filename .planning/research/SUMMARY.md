# Research Summary: v1.1 Dependency Modernization and Test Coverage

Date: 2026-05-12

## Executive Summary

The repo is already on the current Ruby/Rails/Shakapacker line for the core framework stack: Ruby `4.0.3`, Rails `8.1.3`, and Shakapacker `10.0.0`. The highest-value modernization work is therefore package-manager migration, Flow removal, frontend test runner modernization, selective dependency constraint cleanup, and visual regression coverage.

The user clarified that v1.1 should keep the current React and BlueprintJS versions. The safest interpretation of "recommended latest" is now: use current stable versions where compatible with React 16.8 and BlueprintJS 4.x, remove Flow from the frontend dependency/tooling surface, prefer TypeScript/JSDoc for typing, and explicitly document holdbacks where latest major versions require React/Blueprint migration.

Vitest and Vite are plausible modern replacements for the Jest/webpack testing path, but they are different levels of change. Vitest can likely be evaluated as the preferred frontend test runner without replacing the Rails production bundler. Vite production build replacement should be treated as a gated spike because the app currently uses Shakapacker/Webpack entrypoints and Rails pack integration.

## Recommended Milestone Shape

1. Baseline dependency audit and target selection.
2. pnpm migration with lockfile parity and script/doc updates.
3. Flow removal and TypeScript/JSDoc migration plan.
4. Vitest/Vite feasibility spike, with Vitest preferred for frontend tests if compatible and Vite production bundling optional only if proven safe.
5. Ruby dependency modernization in small groups with boot/test gates.
6. JavaScript dependency modernization focused on build/test stability, not a React or Blueprint rewrite.
7. Frontend test repair so the full frontend test command is reliable under pnpm, preferably using Vitest instead of Jest.
8. Playwright visual regression harness with a small deterministic route baseline.
9. Final route/build/test verification and cleanup of Yarn and Flow assumptions.

## Requirement Themes

- Dependency target policy: current stable and compatible by default, explicit exceptions for incompatible latest majors.
- pnpm migration: `packageManager`, lockfile, scripts, docs, and install/test parity.
- Flow removal: remove Flow packages/config and migrate source annotations to TypeScript or JSDoc-backed JavaScript.
- Ruby modernization: selected gem updates, lockfile hygiene, and targeted RSpec/boot verification.
- JavaScript modernization: selected npm updates, Shakapacker/Webpack alignment, and targeted build/test verification.
- Frontend tests: reliable pnpm-backed Vitest command if feasible; Jest modernization only as fallback.
- Vite feasibility: decide whether Vite remains test-only support or can safely replace Shakapacker/Webpack.
- Visual regression: Playwright config, route specs, committed baselines, update workflow, deterministic rendering controls.
- QA gates: console/network checks for route-facing changes and targeted automated tests for touched code.

## Sources

- Ruby downloads: https://www.ruby-lang.org/en/downloads/
- Ruby releases: https://www.ruby-lang.org/en/downloads/releases/
- Rails RubyGems API: https://rubygems.org/api/v1/gems/rails.json
- Shakapacker RubyGems API: https://rubygems.org/api/v1/gems/shakapacker.json
- Shakapacker npm registry: https://registry.npmjs.org/shakapacker/latest
- pnpm installation docs: https://pnpm.io/installation
- pnpm npm registry: https://registry.npmjs.org/pnpm/latest
- Jest npm registry: https://registry.npmjs.org/jest/latest
- babel-jest npm registry: https://registry.npmjs.org/babel-jest/latest
- TypeScript npm registry: https://registry.npmjs.org/typescript/latest
- Flow npm registry: https://registry.npmjs.org/flow-bin/latest
- Vite npm registry: https://registry.npmjs.org/vite/latest
- Vitest npm registry: https://registry.npmjs.org/vitest/latest
- Vite React plugin npm registry: https://registry.npmjs.org/%40vitejs%2Fplugin-react/latest
- vite_rails RubyGems API: https://rubygems.org/api/v1/gems/vite_rails.json
- Playwright visual comparisons: https://playwright.dev/docs/test-snapshots
- Playwright Test npm registry: https://registry.npmjs.org/%40playwright%2Ftest/latest
- Webpack npm registry: https://registry.npmjs.org/webpack/latest
- Puma RubyGems API: https://rubygems.org/api/v1/gems/puma.json
- Sidekiq RubyGems API: https://rubygems.org/api/v1/gems/sidekiq.json
