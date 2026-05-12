---
phase: 11-pnpm-package-manager-migration
plan: 01
status: complete
completed: 2026-05-12
---

# 11-01 Summary - pnpm Root Manifest and Lockfile

## Changes

- Replaced root `packageManager` from `yarn@1.22.22` to `pnpm@11.1.0`.
- Replaced `engines.yarn` with exact `engines.pnpm: 11.1.0`, preserving `engines.node: >=24 <25`.
- Generated `pnpm-lock.yaml` from the current `yarn.lock` with `pnpm import`.
- Removed the root `yarn.lock` after pnpm install, Jest, and asset-build parity passed.
- Added `pnpm-workspace.yaml` build approvals required by pnpm 11. `fsevents` is explicitly not built because transitive `fsevents@1.2.9` fails native compilation on Node 24 and is an optional watcher dependency.

## Pre-existing Diff Classification

- `package.json` test script change from `jest app/javascript` to `NODE_ENV=test jest app/javascript` was present before Phase 11 execution and was preserved as baseline.
- `package.json` `playwright` devDependency was present before Phase 11 execution and was preserved as baseline.
- `yarn.lock` Playwright, Playwright Core, and `fsevents@2.3.2` entries were present before Phase 11 execution and were carried into `pnpm-lock.yaml` through the lockfile import.
- Pre-existing unrelated frontend worktree changes were not touched.

## Verification

- `npm view pnpm version time.modified engines dist-tags --json` confirmed `pnpm@11.1.0` is current and supports Node `>=22.13`.
- `pnpm install --frozen-lockfile` passed locally.
- `pnpm test -- --runInBand` passed locally: 19 suites passed, 1 skipped; 101 tests passed, 3 skipped.
- `bundle exec rails assets:precompile` passed in the running Docker dev container with Ruby 4.0.3. The host command is blocked by the known local Ruby mismatch: host Ruby 2.6.10, Gemfile Ruby 4.0.3.

## Notes

- The running Docker dev container did not have `corepack` available because the current Dockerfile only copies `node`, `npm`, and `npx` from the Node image. For this Wave 1 verification, `corepack@latest` was installed temporarily inside the container. Wave 2 must make Corepack/pnpm available in Docker permanently.
- No `.npmrc` fallback or hoisted node linker was needed.
