---
phase: 13
title: Flow Removal Validation Strategy
status: complete
created: 2026-05-12
---

# Validation Strategy

## Functional Gates

1. Source no longer depends on Flow parsing:
   - No `@flow`, `@noflow`, `$FlowFixMe`, or `FlowFixMe` markers remain in active frontend/config/test JavaScript files.
   - No Flow-specific Babel preset remains in `.babelrc.js`.
   - No `.flowconfig` remains.

2. Tooling no longer depends on Flow:
   - `package.json` no longer lists `@babel/preset-flow`, `eslint-plugin-flowtype`, `flow-bin`, or `flow-inspect`.
   - `pnpm-lock.yaml` is updated by pnpm.
   - `.eslintrc.json` no longer extends or configures flowtype rules.

3. TypeScript/JSDoc foundation exists:
   - `typescript` is present as a dev dependency.
   - Root `tsconfig.json` exists, uses `allowJs`, `checkJs: false`, and `noEmit: true`.
   - `tsconfig.json` excludes build output, vendor, node modules, and planning artifacts.

## Automated Gates

- `pnpm install --frozen-lockfile`
- `pnpm test -- --runInBand`
- `docker compose exec web sh -lc 'pnpm install --frozen-lockfile && SECRET_KEY_BASE=build-placeholder DATABASE_URL=postgresql://placeholder/placeholder bundle exec rails assets:precompile'`

## Static Audit Commands

- `rg -n "@flow|@noflow|\\$FlowFixMe|FlowFixMe" app/javascript config/webpack config/locales spec/support jest.config.js`
- `rg -n "flowtype|@babel/preset-flow|flow-bin|flow-inspect" package.json .babelrc.js .eslintrc.json pnpm-lock.yaml`
- `test ! -f .flowconfig`

## Known Acceptable Noise

- Existing Jest warning from `FormattedList` can remain if all tests pass.
- Existing pre-existing dirty frontend files may remain dirty after the phase, but committed Phase 13 changes must not revert unrelated edits.
