# Pitfalls Research: v1.1 Dependency Modernization

Date: 2026-05-12

## High-Risk Areas

- **Yarn to pnpm hoisting differences:** Undeclared dependencies may fail under pnpm because packages cannot rely on Yarn 1's flatter install tree.
- **Package manager churn in dirty files:** `package.json` and `yarn.lock` already have unrelated working-tree edits. Implementation must preserve user changes and stage intentionally.
- **React 16 constraints:** Latest React is 19.2.6 and latest BlueprintJS core is 6.12.1, but BlueprintJS 6 peers on React 18. User direction for v1.1 is to keep current React and Blueprint versions.
- **Flow removal breadth:** Flow is not just a dependency. It appears across many source files as annotations, `$FlowFixMe`, `@flow`, and `@noflow`, so dependency removal must follow source conversion.
- **TypeScript migration overreach:** Converting every React file to TSX in one pass would create high churn and likely hide behavior regressions. Staged TypeScript plus JSDoc is safer.
- **Jest/Vitest migration risk:** Moving from Jest 24 to Vitest or Jest 30 can require transform, environment, fake timer, snapshot, and mock API changes.
- **Vite build replacement risk:** Vite can be evaluated, but replacing Shakapacker/Webpack affects Rails view helpers, pack entrypoints, CSS extraction/loading, asset paths, dev-server behavior, and production build output.
- **Visual test determinism:** Fonts, OS, browser version, local data, remote images, animation, and maps can cause unstable screenshots.
- **Ruby major upgrades:** Latest Sidekiq and Puma are major-version bumps relative to the current Gemfile constraints and should be gated independently.
- **Shakapacker package parity:** The repo uses both Ruby gem and npm package forms of Shakapacker. They should stay aligned.

## Required Safeguards

- Confirm the exact current latest versions again at implementation time before changing lockfiles.
- Update dependencies in small, testable groups rather than one all-at-once lockfile churn.
- Keep route-facing verification tied to `config/routes.rb`.
- Do not remove v1.0 Blueprint compatibility layers unless tests and browser QA prove they are unnecessary.
- Do not upgrade React or BlueprintJS major versions during v1.1.
- Do not replace Flow ignores with broad TypeScript ignores without justification.
- Do not replace Shakapacker/Webpack with Vite unless a spike proves route, build, and asset compatibility.
- Commit planning, dependency migration, frontend test repair, and visual coverage in separate phase commits.
- Document any dependency intentionally held below latest due to peer dependencies or migration blast radius.

## Open Decisions

- Which files should become TypeScript/TSX versus plain JavaScript with JSDoc.
- Whether Vitest can replace Jest for the existing frontend tests within v1.1.
- Whether Vite should remain test-only infrastructure or also replace the production Shakapacker/Webpack build.
- Whether CI should run visual regression immediately or only provide a local baseline command first.
- Whether Playwright should start/stop Rails itself or assume `localhost:3000` is already running.
- Which route fixtures are deterministic enough for first visual baselines.
