# Stack Research: v1.1 Dependency Modernization

Date: 2026-05-12

## Current Project Baseline

- Ruby: `4.0.3` via `.ruby-version` and `Gemfile.lock`
- Rails: `8.1.3`
- Node: package engines currently target `>=24 <25`
- Package manager: Yarn 1.22.22 with `yarn.lock`
- Shakapacker: gem and npm package at `10.0.0`
- Webpack: `5.106.1`
- React: `16.8.6`
- BlueprintJS: `@blueprintjs/core` `4.20.2`, `datetime` `4.4.37`, `select` `4.3.1`
- Frontend tests: Jest 24-era stack with known ES module transform failures
- Visual regression: `playwright` dependency exists, but no durable route visual harness exists

## Current Latest Signals

Primary registry/doc checks on 2026-05-12:

| Area | Latest signal | Source |
| --- | --- | --- |
| Ruby | Ruby `4.0.3` is current stable; Ruby release schedule expects future 4.0 patch releases | https://www.ruby-lang.org/en/downloads/ |
| Rails | `rails` `8.1.3` | https://rubygems.org/api/v1/gems/rails.json |
| Shakapacker gem | `10.0.0` | https://rubygems.org/api/v1/gems/shakapacker.json |
| Shakapacker npm | `10.0.0` | https://registry.npmjs.org/shakapacker/latest |
| pnpm | `11.1.0`, Node engine `>=22.13` | https://registry.npmjs.org/pnpm/latest |
| Jest | `30.4.2`, Node engine includes Node 24+ | https://registry.npmjs.org/jest/latest |
| babel-jest | `30.4.1`, peer `@babel/core` `^7.11.0 || ^8.0.0-0` | https://registry.npmjs.org/babel-jest/latest |
| Playwright Test | `@playwright/test` `1.60.0`, Node engine `>=18` | https://registry.npmjs.org/%40playwright%2Ftest/latest |
| Webpack | `5.106.2` | https://registry.npmjs.org/webpack/latest |
| Puma | `8.0.1` | https://rubygems.org/api/v1/gems/puma.json |
| Sidekiq | `8.1.4` | https://rubygems.org/api/v1/gems/sidekiq.json |

## Recommended Direction

- Keep Ruby and Rails on current stable lines unless a patch release appears during execution.
- Treat Ruby gem modernization as constraint cleanup and targeted unlocks rather than a Rails migration.
- Move package management from Yarn 1 to pnpm 11 because the repo already targets Node 24 and pnpm 11 supports Node 22, 24, and 26.
- Generate `pnpm-lock.yaml`, update scripts to `pnpm`, and remove Yarn-specific assumptions only after install/test parity is proven.
- Upgrade the frontend test runner as a focused test-infrastructure phase, not as a broad React rewrite.
- Avoid upgrading BlueprintJS to 6.x in this milestone unless a later requirement explicitly accepts a React 18 peer dependency migration. BlueprintJS 6 currently peers on React 18, while Gala is React 16.8.

## Compatibility Risks

- pnpm's stricter dependency isolation can expose undeclared transitive dependencies that Yarn 1 hoisting masked.
- pnpm 11 is pure ESM and requires Node `>=22.13`; the current Node 24 target is compatible.
- Jest 30 may require explicit `jest-environment-jsdom`, Babel transform updates, and ESM handling changes from the current Jest 24 configuration.
- React 16 constrains component-library upgrades. BlueprintJS 6 is not a straightforward "latest" target without a React migration.
- Native Ruby gems should be tested under Ruby 4.0.3 and any selected patch updates, especially database, server, background job, and asset pipeline dependencies.
