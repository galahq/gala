# Research Summary: v1.1 Dependency Modernization and Test Coverage

Date: 2026-05-12

## Executive Summary

The repo is already on the current Ruby/Rails/Shakapacker line for the core framework stack: Ruby `4.0.3`, Rails `8.1.3`, and Shakapacker `10.0.0`. The highest-value modernization work is therefore package-manager migration, frontend test repair, selective dependency constraint cleanup, and visual regression coverage.

The safest interpretation of "recommended latest" is: use current stable versions where compatible with the existing architecture, and explicitly document any holdbacks where latest major versions require a larger migration. The clearest holdback candidate is BlueprintJS: latest core is `6.12.1`, but it peers on React 18 while Gala is React 16.8.

## Recommended Milestone Shape

1. Baseline dependency audit and target selection.
2. pnpm migration with lockfile parity and script/doc updates.
3. Ruby dependency modernization in small groups with boot/test gates.
4. JavaScript dependency modernization focused on build/test stability, not a React rewrite.
5. Frontend Jest repair so the full frontend test command is reliable under pnpm.
6. Playwright visual regression harness with a small deterministic route baseline.
7. Final route/build/test verification and cleanup of Yarn assumptions.

## Requirement Themes

- Dependency target policy: current stable and compatible by default, explicit exceptions for incompatible latest majors.
- pnpm migration: `packageManager`, lockfile, scripts, docs, and install/test parity.
- Ruby modernization: selected gem updates, lockfile hygiene, and targeted RSpec/boot verification.
- JavaScript modernization: selected npm updates, Shakapacker/Webpack alignment, and targeted build/test verification.
- Frontend tests: reliable pnpm-backed Jest command.
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
- Playwright visual comparisons: https://playwright.dev/docs/test-snapshots
- Playwright Test npm registry: https://registry.npmjs.org/%40playwright%2Ftest/latest
- Webpack npm registry: https://registry.npmjs.org/webpack/latest
- Puma RubyGems API: https://rubygems.org/api/v1/gems/puma.json
- Sidekiq RubyGems API: https://rubygems.org/api/v1/gems/sidekiq.json
