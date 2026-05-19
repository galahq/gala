---
phase: 15-javascript-dependency-and-build-modernization
collected: 2026-05-15
status: complete
---

# Phase 15: JavaScript Dependency and Build Modernization - Research

## Scope

Update compatible JavaScript dependencies for v1.1 while preserving:

- React 16.x behavior
- BlueprintJS 4.x ownership and namespace compatibility
- Shakapacker/Webpack production behavior
- Route-facing behavior and `localhost:3000` QA discipline from `AGENTS.md`

## Baseline Evidence

### Dependency Source-of-Truth

- `package.json` is the JavaScript dependency contract for this phase.
- `pnpm-lock.yaml` is the resolved lockfile for the current pnpm baseline.
- `Gemfile` / `Gemfile.lock` pin `shakapacker` to `10.0.0`.
- `config/shakapacker.yml` and `config/webpack/environment.js` define production pack and manifest behavior.
- Blueprint CSS ownership remains in `app/assets/stylesheets/application.css`; runtime class remapping remains in `app/javascript/shared/blueprintLegacyNamespace.js`.

### Environment note

This workspace currently blocks npm metadata fetches, so the dependency check can’t fully verify latests.

```bash
pnpm outdated --format json
```

Result in this environment:
- Repeated `ENOTFOUND` failures when querying npm registry metadata.
- Partial JSON result still captured, but the command is not a trustworthy latest baseline in this environment.
- Execution-time recheck with network access is required before any dependency bump decisions are finalized.

### Baseline versions from repo manifests

| Family | Package | Manifest current | Constraint source | Phase constraint |
|---|---|---|---|---|
| Framework | `react`, `react-dom` | `^16.8.6` / resolved `16.12.0` | `package.json` | Keep React 16 for v1.1 (JS-02). |
| Blueprint | `@blueprintjs/core` | `4.20.2` | `package.json` | Keep BlueprintJS 4.x (JS-04). |
| Blueprint | `@blueprintjs/datetime` | `4.4.37` | `package.json` | Keep BlueprintJS 4.x (JS-04). |
| Blueprint | `@blueprintjs/select` | `4.3.1` | `package.json` | Keep 4.x unless route QA explicitly allows a specific bump. |
| Build | `webpack` | `5.106.1` | `package.json` | Keep in 5.x; validate output/manifest each batch (JS-03). |
| Build | `webpack-cli` | `6.0.1` | `package.json` | Hold while Shakapacker/Webpack behavior is proven stable. |
| Build | `webpack-merge` | `5.10.0` | `package.json` | Hold same major in v1.1 unless verified. |
| Bundler alignment | `shakapacker` (Gem + npm) | `10.0.0` | `Gemfile`, `package.json` | Must remain aligned (JS-02). |
| Test runner | `jest` / `jest-dom` / `jsdom` | Jest 24.x stack | `package.json` | Keep Jest baseline; Vitest/Vite remain deferred by phase 12. |

## Candidate Set (Conservative)

- Build patch candidates from baseline audit and existing history:
  - `webpack` patch progression inside 5.x.
  - `webpack-dev-server` patch progression inside 5.x.
  - Build utility micro-updates (e.g., loader/test utility patches where compatible).
- Select Babel/Sass-related updates that avoid API breakage when constrained by current ranges.
- No cross-major framework updates in this phase.

## Hold / Defer Set

- React major/minor beyond current v1.1 rail.
- Blueprint major updates (`6.x`) and any CSS ownership migration not explicitly scoped into phase 15.
- `webpack-cli`/`webpack-merge` major jumps unless paired with explicit production behavior proof.
- `vitest`, `vite`, and `@vitejs/plugin-react` major updates remain outside this phase; feasibility decisions are already captured in phase 12.

## Recheck Commands for Execution

```bash
npm view react version
npm view react-dom version
npm view @blueprintjs/core version peerDependencies engines
npm view @blueprintjs/datetime version peerDependencies engines
npm view @blueprintjs/select version peerDependencies engines
npm view shakapacker version peerDependencies
npm view webpack version
npm view webpack-cli version
npm view webpack-merge version
npm view sass version
npm view sass-loader version
npm view whatwg-fetch version
npm view prop-types version
```

## Execution Boundaries (for this phase)

- JS-01: all dependency decisions are from a traceable source, then applied in small batches.
- JS-02: Ruby gem and npm package `shakapacker` remain aligned unless roadmap changes ownership.
- JS-03: webpack/manifests/precompile gates run after each batch.
- JS-04: Blueprint 4.x ownership and the legacy class bridge remain intact unless this phase explicitly proves compatibility.

