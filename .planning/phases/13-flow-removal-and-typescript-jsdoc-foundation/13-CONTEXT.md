---
phase: 13
title: Flow Removal and TypeScript/JSDoc Foundation
status: complete
created: 2026-05-12
requirements:
  - TYPE-01
  - TYPE-02
  - TYPE-03
  - TYPE-04
  - TYPE-05
  - TYPE-06
---

# Phase 13 Context

## Objective

Remove Flow from the active frontend toolchain and source tree while preserving the current React 16, BlueprintJS 4, Jest 24, and Shakapacker/Webpack build constraints. Establish TypeScript plus JSDoc as the forward typing direction without forcing a broad TypeScript rewrite in this phase.

## Current State

- Flow is configured through `.flowconfig`, `@babel/preset-flow`, `flow-bin`, `flow-inspect`, and `eslint-plugin-flowtype`.
- Babel currently strips Flow syntax for application and test code through `.babelrc.js`.
- ESLint requires Flow file annotations through `flowtype/require-valid-file-annotation`.
- Source usage is broad: roughly 298 frontend/config/test files contain `@flow` or `@noflow`; roughly 66 files contain `$FlowFixMe`.
- Several files contain actual Flow syntax, including type aliases, exact object types, optional types, typed function parameters, typed class members, and `import type`.
- Phase 12 proved Jest remains the stable frontend test runner for now. Vitest remains deferred to Phase 16.

## Decisions

- Use a mechanical Flow source-strip pass instead of hand-editing every annotated file. The migration is broad enough that manual edits would increase risk and review noise.
- Remove Flow parsing from active Babel config only after source stripping succeeds.
- Delete `.flowconfig` once Flow dependencies and source annotations are gone.
- Add a root `tsconfig.json` as a non-emitting JavaScript-aware baseline. It should support JS/JSDoc checking infrastructure without enabling broad project type checking yet.
- Add `typescript` as a dev dependency and keep TypeScript introduction configuration-only in this phase.
- Prefer JSDoc for future JavaScript typing where converting a file to TypeScript/TSX would add churn.
- Avoid adding broad ignore comments. Any future `// @ts-ignore`, `// @ts-nocheck`, or equivalent broad suppression needs a specific migration reason.

## Constraints

- Do not upgrade React, BlueprintJS, Jest, Shakapacker, or Webpack in this phase.
- Do not change route behavior or visual compatibility intentionally.
- Preserve existing user/pre-existing dirty edits in:
  - `app/javascript/catalog/search_results/NoSearchResults.jsx`
  - `app/javascript/shared/blueprint.scss`
  - `app/javascript/shared/blueprintLegacyNamespace.js`
  - `app/javascript/stats/__tests__/DatePicker.test.jsx`
- If the mechanical Flow strip touches one of those files, preserve the live file content and only remove Flow syntax/comments from it.

## Verification Expectations

- `pnpm install --frozen-lockfile`
- `pnpm test -- --runInBand`
- Docker asset precompile through Shakapacker/Webpack
- Static scans proving no active Flow config, dependencies, annotations, or `$FlowFixMe` usage remain in frontend/config/test source.

## Route QA

Browser route QA is not required unless implementation changes route-facing runtime behavior beyond stripping type-only syntax and removing inactive Flow tooling. Asset precompile is the route-facing bundler gate for this phase.
