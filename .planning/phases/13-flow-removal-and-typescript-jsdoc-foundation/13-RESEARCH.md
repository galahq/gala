---
phase: 13
title: Flow Removal and Typing Foundation Research
status: complete
created: 2026-05-12
---

# Research

## Source Inventory

Flow is not isolated to a small area. The active source tree contains hundreds of Flow annotations and comments across React components, Redux reducers/actions, Stimulus controllers, tests, webpack config, locale helpers, and stats modules.

Representative syntax includes:

- `import type`
- `type Props = ...`
- exact object types `{| ... |}`
- nullable types such as `?string`
- typed parameters and return values
- type casts such as `(window.i18n: { locale: string })`
- `$FlowFixMe` comments inside JSX and JavaScript expressions

Because Babel currently strips Flow, the safest implementation is a mechanical source-strip that preserves JavaScript behavior and formatting as much as possible.

## Tooling Inventory

Active Flow dependencies and config:

- `@babel/preset-flow`
- `flow-bin`
- `flow-inspect`
- `eslint-plugin-flowtype`
- `.flowconfig`
- `.babelrc.js` preset entry
- `.eslintrc.json` flowtype extends/plugin/rules

Forward typing target:

- Use TypeScript as the project-level typing tool.
- Start with `allowJs` and `checkJs: false` so JavaScript remains buildable while JSDoc can be added incrementally.
- Keep `noEmit: true` so Shakapacker/Webpack remains the only frontend build output path.

## Implementation Approach

Use `flow-remove-types` as a one-time mechanical migration tool. It can strip Flow comments and syntax while preserving JSX and most existing source layout better than a generic Babel rewrite. Do not add it as a project dependency unless repeated use becomes necessary.

After source stripping:

- Remove Flow-only package dependencies.
- Remove Flow from Babel and ESLint config.
- Delete `.flowconfig`.
- Add `typescript` and `tsconfig.json`.
- Run install, frontend tests, and Shakapacker asset precompile.

## Risk Notes

- Mechanical stripping can leave parenthesized expression remnants such as `(element)`. These are valid JavaScript and should be accepted unless tests/build fail.
- Flow suppression comments inside JSX should disappear; JSX comments may leave blank lines only.
- Removing `@babel/preset-flow` before fully stripping syntax would break Jest and Webpack parsing.
- Dirty pre-existing frontend files must be handled from the live working copy to preserve user changes.
