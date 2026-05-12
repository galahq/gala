---
phase: 13
plan: 1
title: Remove Flow tooling and source annotations, then add TypeScript/JSDoc baseline
status: complete
completed: 2026-05-12
commit: 6361447a
---

# Summary

## Completed

- Stripped Flow syntax and Flow file annotations from active frontend, webpack, locale, Jest, and support JavaScript.
- Removed `$FlowFixMe` comments from active frontend source.
- Removed Flow from active tooling:
  - deleted `.flowconfig`
  - removed `@babel/preset-flow`
  - removed `flow-bin`
  - removed `flow-inspect`
  - removed `eslint-plugin-flowtype`
  - removed Flow ESLint extends/plugin/rules
- Added `typescript@6.0.3` as the forward typing tool.
- Added root `tsconfig.json` with `allowJs`, `checkJs: false`, `noEmit`, JSX parsing, bundler module resolution, and `skipLibCheck`.

## Notes

- The implementation used `flow-remove-types` as a one-time mechanical migration tool, not as a project dependency.
- `skipLibCheck` is intentional for the first TypeScript baseline because the current dependency graph exposes third-party declaration issues without React/webpack ambient type packages. This phase introduces the TypeScript path without adopting full project type checking yet.
- Route browser QA was not required because this phase removed type-only syntax and inactive Flow tooling; forced Shakapacker/Webpack precompile was the route-facing build gate.
- Pre-existing dirty files remain dirty and were not swept wholesale into the phase commit:
  - `app/javascript/catalog/search_results/NoSearchResults.jsx`
  - `app/javascript/shared/blueprint.scss`
  - `app/javascript/shared/blueprintLegacyNamespace.js`
  - `app/javascript/stats/__tests__/DatePicker.test.jsx`
