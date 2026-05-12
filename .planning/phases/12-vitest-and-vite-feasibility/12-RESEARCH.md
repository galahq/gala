# Phase 12: Vitest and Vite Feasibility - Research

**Researched:** 2026-05-12  
**Domain:** Vitest/Jest migration feasibility and Vite/Rails/Shakapacker build feasibility  
**Confidence:** HIGH for package/version facts and repo inventory; MEDIUM for feasibility recommendations until spikes run

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
No explicit `## Decisions` section exists in `12-CONTEXT.md`; the following constraints are locked by `## Constraints` and `## Decision Policy`. [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-CONTEXT.md]

- Use pnpm for all JavaScript install and test commands.
- Keep React on the current React 16 baseline during v1.1.
- Keep BlueprintJS on the current 4.x baseline during v1.1.
- Do not remove Flow in Phase 12; Phase 13 owns Flow removal.
- Do not replace Shakapacker/Webpack production behavior unless the spike produces strong compatibility evidence.
- Do not add broad compatibility shims or dependency upgrades that belong to Phase 15 or Phase 16.
- Treat the existing dirty frontend files as pre-existing user work unless a Phase 12 task explicitly needs to read and preserve them.
- Prefer Vitest for Phase 16 only if representative React 16 tests run with a small, explainable config and no broad source rewrites.
- Defer Vite production replacement if it requires major entrypoint rewrites, Flow removal, React/Blueprint upgrades, or risky asset pipeline changes.
- A negative Vite decision is acceptable if it preserves Shakapacker/Webpack and records concrete blockers.

### the agent's Discretion
No explicit `## the agent's Discretion` section exists in `12-CONTEXT.md`; the agent has discretion to design focused feasibility spikes and fallback recommendations within the locked constraints above. [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-CONTEXT.md]

### Deferred Ideas (OUT OF SCOPE)
No explicit `## Deferred Ideas` section exists in `12-CONTEXT.md`; deferred-by-policy items are Flow removal, broad dependency modernization, React/Blueprint major upgrades, and production Vite replacement without strong compatibility evidence. [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-CONTEXT.md]
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VITE-01 | A focused spike determines whether Vitest can replace Jest for the existing frontend test suite. | Use Vitest 4.1.6 with Vite 8.0.12, `jsdom`, `globals: true`, Babel Flow transforms, and a small representative test subset. [VERIFIED: npm registry] [CITED: https://vitest.dev/guide/migration] |
| VITE-04 | A focused spike determines whether Vite can support Gala's Rails frontend entrypoints, CSS imports, static assets, and Blueprint compatibility layers. | Use a temporary Vite config with Shakapacker-like aliases, multi-entry Rollup input, manifest output, Sprockets-owned Blueprint CSS unchanged, and explicit checks for Webpack-only constructs. [CITED: https://vite.dev/guide/backend-integration] [VERIFIED: config/shakapacker.yml] |
| VITE-05 | Vite production bundler replacement only proceeds if the spike proves route, build, and asset compatibility. | Vite production replacement requires manifest helper parity, CSS order parity, dynamic import/assets parity, and browser QA evidence before acceptance. [CITED: https://vite.dev/guide/backend-integration] [VERIFIED: app/views/layouts/application.html.erb] |
| VITE-06 | If Vite build replacement is not accepted for v1.1, Shakapacker/Webpack remains the production bundler. | Default recommendation is to keep Shakapacker/Webpack in production for v1.1 unless the spike is unusually clean. [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-CONTEXT.md] |
</phase_requirements>

## Summary

Vitest is feasible enough to spike in Phase 12, but not safe to adopt in this phase. Current Vitest 4.1.6 supports Node `^20.0.0 || ^22.0.0 || >=24.0.0`, peers with Vite `^6 || ^7 || ^8`, and explicitly documents Jest-compatible migration patterns, `globals: true`, `setupFiles`, and `jsdom`/`happy-dom` browser-like environments. [VERIFIED: npm registry] [CITED: https://vitest.dev/guide/migration] [CITED: https://vitest.dev/config/globals] [CITED: https://vitest.dev/config/environment] Gala's local blockers are Flow syntax, Jest global APIs, `jest.mock`/`jest.fn` usage, `modulePaths`, YAML transforms, old `react-testing-library` cleanup setup, and React 16-era testing assumptions. [VERIFIED: package.json] [VERIFIED: jest.config.js] [VERIFIED: spec/support/jest-setup.js] [VERIFIED: app/javascript/stats/__tests__/DatePicker.test.jsx]

Vite is feasible only as a build spike in Phase 12. Current Vite 8.0.12 supports this Node 24 environment, and official backend integration docs support Rails-style HTML ownership through `build.manifest`, `rollupOptions.input`, dev server CORS/origin handling, and manifest-based production tag rendering. [VERIFIED: npm registry] [CITED: https://vite.dev/guide/backend-integration.html] Gala's risk is that Shakapacker currently owns pack manifests and helpers, while Sprockets owns global Blueprint CSS and fonts; Vite replacement would need equivalent helper behavior and asset ordering before touching production. [VERIFIED: config/shakapacker.yml] [VERIFIED: app/helpers/application_helper.rb] [VERIFIED: app/views/layouts/application.html.erb] [VERIFIED: app/assets/stylesheets/application.css]

**Primary recommendation:** Run two temporary spikes, one for Vitest and one for Vite build compatibility, then keep Shakapacker/Webpack as the v1.1 production bundler unless both Vite build and localhost route QA evidence are strong. [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-CONTEXT.md]

## Project Constraints (from AGENTS.md)

- Work phases sequentially from `.planning/ROADMAP.md`. [VERIFIED: AGENTS.md]
- Use `config/routes.rb` as the source of truth for route coverage. [VERIFIED: AGENTS.md]
- Use `localhost:3000` for browser QA. [VERIFIED: AGENTS.md]
- Check browser console and network errors before marking a route group complete. [VERIFIED: AGENTS.md]
- Run targeted tests for touched files; relevant commands include `yarn test`, `bundle exec rspec`, `./run-rspec.sh`, and `bundle exec rake test:unit`, but Phase 12 context supersedes JavaScript commands to pnpm. [VERIFIED: AGENTS.md] [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-CONTEXT.md]
- Commit after each phase QA gate passes. [VERIFIED: AGENTS.md]
- Keep fixes narrow and route-driven; avoid broad redesigns or unrelated dependency upgrades. [VERIFIED: AGENTS.md]
- Preserve BlueprintJS 2.3.1-era visual compatibility while packages remain on BlueprintJS 4.x. [VERIFIED: AGENTS.md]
- Be careful around `app/views/layouts/application.html.erb`, `app/assets/stylesheets/application.css`, `app/javascript/packs/styles.js`, and `app/javascript/shared/blueprintLegacyNamespace.js`. [VERIFIED: AGENTS.md]
- Avoid duplicating Blueprint CSS or adding route-specific shims before confirming the route group needs them. [VERIFIED: AGENTS.md]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Vitest runner feasibility | Frontend test tooling | Browser-like test environment | The runner executes `app/javascript/**/__tests__` and simulates DOM behavior through `jsdom`; it should not alter Rails runtime behavior. [VERIFIED: jest.config.js] [CITED: https://vitest.dev/config/environment] |
| Flow parsing during tests | Frontend transform pipeline | Source files | Current Babel config strips Flow through `@babel/preset-flow`; Vite/Vitest spike must preserve parsing without removing Flow. [VERIFIED: .babelrc.js] [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-CONTEXT.md] |
| Rails entrypoint rendering | Frontend server / Rails views | Bundler manifest | Rails templates currently render Shakapacker pack tags; Vite production would require manifest-aware Rails helper parity. [VERIFIED: app/views/layouts/application.html.erb] [VERIFIED: app/helpers/application_helper.rb] [CITED: https://vite.dev/guide/backend-integration.html] |
| CSS and Blueprint asset ownership | Rails asset pipeline | Frontend bundler | Blueprint package CSS is loaded through Sprockets `application.css`, while Shakapacker `styles` loads local shims and runtime namespace bridging. [VERIFIED: app/assets/stylesheets/application.css] [VERIFIED: app/javascript/packs/styles.js] |
| Static images/SVG/YAML modules | Frontend bundler | Rails static serving | Current Webpack config handles raw SVG, YAML, file assets, and `images/*` imports; Vite spike must prove equivalent handling. [VERIFIED: config/webpack/environment.js] [VERIFIED: app/javascript/images] |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `vitest` | 4.1.6, published 2026-05-11 | Temporary Jest migration spike runner | Current official runner with Jest-compatible migration docs and Node 24 support. [VERIFIED: npm registry] [CITED: https://vitest.dev/guide/migration] |
| `vite` | 8.0.12, published 2026-05-11 | Temporary build spike and Vitest transform base | Current official Vite release with Node 24 support and Rails-style backend integration docs. [VERIFIED: npm registry] [CITED: https://vite.dev/guide/backend-integration.html] |
| `jsdom` | 29.1.1, published 2026-04-30 | DOM-like Vitest environment | Vitest documents `jsdom` as a browser-like environment for web app tests. [VERIFIED: npm registry] [CITED: https://vitest.dev/config/environment] |
| `@vitejs/plugin-react` | Prefer 5.2.0 for spike; latest is 6.0.1 | React JSX transform for Vite spike | Version 5.2.0 supports Vite `^4.2 || ^5 || ^6 || ^7 || ^8`; latest 6.0.1 peers only with Vite `^8`, so 5.2.0 gives downgrade room during feasibility. [VERIFIED: npm registry] |
| `vite-plugin-babel` | 1.6.0 | Optional Flow/Babel transform bridge for spike only | It peers with Vite `^2.7 || ^3 || ^4 || ^5 || ^6 || ^7 || ^8` and can test whether existing Babel presets preserve Flow parsing under Vite without source rewrites. [VERIFIED: npm registry] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@testing-library/jest-dom` | 6.9.1 latest | Optional future matcher package | Use only in a spike if old `jest-dom@3` fails under Vitest; avoid broad test-library modernization in Phase 12. [VERIFIED: npm registry] [VERIFIED: package.json] |
| `react-testing-library` | 6.0.0 installed, deprecated | Existing React 16 test helper | Keep for initial representative tests because the installed package already passes under Jest 24 and latest `@testing-library/react` peers with React 18/19. [VERIFIED: package.json] [VERIFIED: npm registry] |
| `@babel/preset-flow` | Existing installed `^7.0.0` | Flow stripping during spike transforms | Required because Phase 12 must not remove Flow and source files contain Flow annotations. [VERIFIED: package.json] [VERIFIED: .babelrc.js] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vitest 4.1.6 | Keep Jest 24 or modernize Jest in Phase 16 | Jest fallback avoids Vite transform/Flow risk but leaves the runner on an old major unless Phase 16 modernizes Jest separately. [VERIFIED: package.json] [VERIFIED: .planning/REQUIREMENTS.md] |
| Vite production replacement | Keep Shakapacker/Webpack 5 production | Shakapacker retention preserves working Rails helpers, manifest behavior, CSS order, and Blueprint asset ownership. [VERIFIED: config/shakapacker.yml] [VERIFIED: app/views/layouts/application.html.erb] |
| `@vitejs/plugin-react` with dev HMR | Build-only Vite spike without React Refresh | The plugin README says Fast Refresh requires React `>=16.9`, while Gala is pinned to React 16.8.6, so Phase 12 should avoid using dev HMR success as an acceptance gate. [VERIFIED: npm registry README] [VERIFIED: package.json] |

**Installation for temporary spike branch only:**

```bash
pnpm add -D vitest@4.1.6 vite@8.0.12 jsdom@29.1.1 @vitejs/plugin-react@5.2.0 vite-plugin-babel@1.6.0
```

**Version verification commands used:**

```bash
npm view vitest version time engines peerDependencies --json
npm view vite version time engines peerDependencies --json
npm view @vitejs/plugin-react version time engines peerDependencies --json
npm view @vitejs/plugin-react@5.2.0 version time engines peerDependencies --json
npm view jsdom version time engines peerDependencies --json
npm view vite-plugin-babel version time peerDependencies --json
```

## Architecture Patterns

### System Architecture Diagram

```text
Phase 12 input
  |
  v
Repo inventory: Jest config, Babel Flow config, Shakapacker packs, Rails asset helpers
  |
  +--> Vitest spike config
  |      |
  |      +--> Babel/Flow transform check
  |      +--> jsdom + globals + setupFiles check
  |      +--> representative Jest mock/component/helper test subset
  |      |
  |      v
  |   Decision: Vitest candidate for Phase 16 or Jest fallback
  |
  +--> Vite spike config
         |
         +--> multi-entry build.rollupOptions.input
         +--> manifest output inspection
         +--> CSS/static asset/YAML/raw SVG/require.context blocker scan
         +--> optional localhost route smoke only if production behavior changes
         |
         v
      Decision: defer production Vite or require stronger route/build evidence
```

### Recommended Project Structure

```text
.planning/phases/12-vitest-and-vite-feasibility/
├── 12-RESEARCH.md       # this research
├── 12-PATTERNS.md       # local Jest/Shakapacker/packs/assets inventory
├── 12-VALIDATION.md     # existing validation strategy
├── spikes/              # optional temporary configs, remove or document after spike
│   ├── vitest.config.mjs
│   ├── vitest.setup.js
│   └── vite.config.mjs
└── 12-01-SUMMARY.md     # final feasibility decision summary
```

### Pattern 1: Vitest Compatibility Spike

**What:** Run Vitest against a representative subset with Jest globals enabled, `jsdom`, setup file parity, app/javascript aliasing, Babel Flow transform, and targeted Jest API compatibility checks. [CITED: https://vitest.dev/config/globals] [CITED: https://vitest.dev/config/environment] [CITED: https://vitest.dev/config/setupfiles]  
**When to use:** Phase 12 only; Phase 16 owns actual runner migration. [VERIFIED: .planning/ROADMAP.md]  
**Example:**

```javascript
// Source: Vitest config docs and Gala jest.config.js
import path from 'node:path'
import { defineConfig } from 'vitest/config'
import babel from 'vite-plugin-babel'

export default defineConfig({
  resolve: {
    alias: {
      images: path.resolve(__dirname, '../../app/javascript/images'),
      shared: path.resolve(__dirname, '../../app/javascript/shared'),
      stats: path.resolve(__dirname, '../../app/javascript/stats'),
      utility: path.resolve(__dirname, '../../app/javascript/utility'),
      redux: path.resolve(__dirname, '../../app/javascript/redux'),
    },
  },
  plugins: [
    babel({
      babelConfig: {
        configFile: path.resolve(__dirname, '../../.babelrc.js'),
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    include: [
      '../../app/javascript/shared/__tests__/functions.test.js',
      '../../app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js',
      '../../app/javascript/stats/__tests__/DatePicker.test.jsx',
      '../../app/javascript/redux/reducers/__tests__/cards.test.js',
    ],
  },
})
```

### Pattern 2: Vite Backend Build Spike

**What:** Use Rails backend integration mode: configure CORS for `localhost:3000`, enable `build.manifest`, specify pack-like entries in `rollupOptions.input`, and inspect emitted manifest/CSS/assets without changing Rails helpers. [CITED: https://vite.dev/guide/backend-integration.html]  
**When to use:** Only for feasibility; production helper replacement is out of scope unless route/build/asset evidence is strong. [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-CONTEXT.md]  
**Example:**

```javascript
// Source: Vite backend integration docs and Gala pack inventory
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import babel from 'vite-plugin-babel'

const root = path.resolve(__dirname, '../..')
const fromRoot = (...parts) => path.resolve(root, ...parts)

export default defineConfig({
  root,
  publicDir: false,
  server: {
    cors: { origin: 'http://localhost:3000' },
  },
  resolve: {
    alias: {
      images: fromRoot('app/javascript/images'),
      shared: fromRoot('app/javascript/shared'),
      utility: fromRoot('app/javascript/utility'),
      redux: fromRoot('app/javascript/redux'),
      deployment: fromRoot('app/javascript/deployment'),
      catalog: fromRoot('app/javascript/catalog'),
    },
  },
  plugins: [
    react({ jsxRuntime: 'classic' }),
    babel({ babelConfig: { configFile: fromRoot('.babelrc.js') } }),
  ],
  build: {
    outDir: fromRoot('tmp/vite-phase-12'),
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        styles: fromRoot('app/javascript/packs/styles.js'),
        controllers: fromRoot('app/javascript/packs/controllers.js'),
        catalog: fromRoot('app/javascript/packs/catalog.entry.jsx'),
        case: fromRoot('app/javascript/packs/case.entry.jsx'),
        deployment: fromRoot('app/javascript/packs/deployment.entry.jsx'),
      },
    },
  },
})
```

### Anti-Patterns to Avoid

- **Replacing Shakapacker helpers during research:** This would turn a feasibility phase into a production migration and bypass the VITE-05 evidence gate. [VERIFIED: .planning/REQUIREMENTS.md]
- **Moving Blueprint CSS into Vite to make the build pass:** Current tests assert Blueprint package CSS stays in Sprockets and out of the Shakapacker styles pack. [VERIFIED: app/javascript/shared/__tests__/blueprintAssetContract.test.js]
- **Removing Flow to satisfy Vite/Vitest parsing:** Phase 13 owns Flow removal, so Phase 12 must measure Flow as a blocker or bridge it temporarily. [VERIFIED: .planning/ROADMAP.md]
- **Treating React Refresh as required:** `@vitejs/plugin-react` Fast Refresh requires React `>=16.9`, while Gala is pinned to React 16.8.6. [VERIFIED: npm registry README] [VERIFIED: package.json]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Test runner API compatibility | Custom Jest compatibility shim | Vitest `globals`, `vi`, `setupFiles`, and targeted test edits in Phase 16 | Vitest already documents Jest migration surfaces; custom shims hide real migration cost. [CITED: https://vitest.dev/guide/migration] |
| DOM simulation | Custom fake `document`/`window` | `jsdom` environment | Vitest supports `jsdom` as a browser-like environment. [CITED: https://vitest.dev/config/environment] |
| Rails/Vite manifest parsing | Custom opaque asset naming | Vite `build.manifest` plus Rails helper spike | Vite emits manifest metadata for entry chunks, CSS, assets, imports, and dynamic imports. [CITED: https://vite.dev/guide/backend-integration.html] |
| Static asset URLs | Manual hashed filename generation | Vite asset imports, `?raw`, `?url`, or public directory semantics | Vite handles imported assets, CSS `url()`, raw imports, and public assets with defined behavior. [CITED: https://vite.dev/guide/assets.html] |
| Flow stripping | Regex removal | Existing Babel preset or Phase 13 Flow removal | Babel already strips Flow in the current toolchain; regex would corrupt source semantics. [VERIFIED: .babelrc.js] |

**Key insight:** The feasible path is to measure compatibility with standard Vitest/Vite controls, not to create a third custom compatibility layer between Jest, Webpack, Shakapacker, Sprockets, and Rails. [VERIFIED: jest.config.js] [VERIFIED: config/webpack/environment.js] [VERIFIED: app/assets/stylesheets/application.css]

## Common Pitfalls

### Pitfall 1: Flow Parse Failures Look Like Vite Failures
**What goes wrong:** Vite/Vitest fails before executing tests or building entries because source files contain Flow annotations. [VERIFIED: app/javascript/stats/__tests__/DatePicker.test.jsx]  
**Why it happens:** Current Babel config includes `@babel/preset-flow`, but Vite's default transforms do not prove Flow stripping for this project. [VERIFIED: .babelrc.js] [CITED: https://esbuild.github.io/content-types/]  
**How to avoid:** Include a Babel bridge in the spike or record Flow as a blocker for Phase 13/16. [VERIFIED: npm registry]  
**Warning signs:** Errors near `(window.i18n: { locale: string })`, function return annotations, `import type`, or object type syntax. [VERIFIED: app/javascript/packs/case.entry.jsx] [VERIFIED: app/javascript/stats/__tests__/DatePicker.test.jsx]

### Pitfall 2: Jest Globals and Mock APIs Are Assumed Everywhere
**What goes wrong:** Tests using `jest.fn`, `jest.mock`, `jest.clearAllMocks`, or `jest.resetModules` fail under Vitest unless globals or edits are configured. [VERIFIED: app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js] [VERIFIED: app/javascript/stats/__tests__/DatePicker.test.jsx]  
**Why it happens:** Jest enables globals by default; Vitest does not. [CITED: https://vitest.dev/config/globals]  
**How to avoid:** Spike with `globals: true`; if tests still fail, record the minimal `jest` to `vi` conversion set for Phase 16. [CITED: https://vitest.dev/guide/migration]  
**Warning signs:** `ReferenceError: jest is not defined` or hoisting differences in mocked modules. [CITED: https://vitest.dev/guide/mocking]

### Pitfall 3: CSS Ownership Drift Breaks Blueprint Compatibility
**What goes wrong:** Vite imports Blueprint CSS into JS chunks, changing order or duplicating CSS. [VERIFIED: app/javascript/shared/__tests__/blueprintAssetContract.test.js]  
**Why it happens:** Current architecture loads Blueprint package CSS from Sprockets and local shims from `styles.js`. [VERIFIED: app/assets/stylesheets/application.css] [VERIFIED: app/javascript/packs/styles.js]  
**How to avoid:** In the Vite spike, do not import Blueprint package CSS; assert manifest CSS only includes local shim CSS unless a deliberate experiment is recorded. [VERIFIED: app/javascript/shared/__tests__/blueprintAssetContract.test.js]  
**Warning signs:** Vite manifest CSS entries include `@blueprintjs/*/lib/css` output or route screenshots show namespace/order regressions. [VERIFIED: app/javascript/shared/__tests__/blueprintAssetContract.test.js]

### Pitfall 4: Webpack-Only Module Features Block Vite
**What goes wrong:** `require.context`, raw SVG `require`, dynamic template `require`, and YAML loader behavior fail during Vite build. [VERIFIED: app/javascript/packs/controllers.js] [VERIFIED: app/javascript/utility/Icon.jsx] [VERIFIED: config/locales/index.js]  
**Why it happens:** Current Webpack config explicitly adds raw SVG and YAML loader rules, while Vite uses different asset and module semantics. [VERIFIED: config/webpack/environment.js] [CITED: https://vite.dev/guide/assets.html]  
**How to avoid:** Spike these constructs directly; do not rewrite broadly in Phase 12. [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-CONTEXT.md]  
**Warning signs:** Build errors around `require.context`, `images/*.svg`, `.yml`, or dynamic locale imports. [VERIFIED: rg repo scan]

### Pitfall 5: React 16.8 Is Below React Refresh's Documented Floor
**What goes wrong:** Vite dev server with `@vitejs/plugin-react` reports refresh/preamble errors or HMR behaves unreliably. [CITED: https://vite.dev/guide/backend-integration.html]  
**Why it happens:** The plugin README says Fast Refresh requires React `>=16.9`; Gala uses React `^16.8.6` and Phase 12 cannot upgrade React. [VERIFIED: npm registry README] [VERIFIED: package.json]  
**How to avoid:** Treat production build output as the main Vite feasibility signal and record React Refresh as a dev-only blocker unless React is upgraded in a later phase. [VERIFIED: .planning/REQUIREMENTS.md]  
**Warning signs:** `@vitejs/plugin-react can't detect preamble` or refresh runtime errors in backend-served HTML. [CITED: https://vite.dev/guide/backend-integration.html]

## Code Examples

### Representative Vitest Spike Command

```bash
pnpm exec vitest run \
  --config .planning/phases/12-vitest-and-vite-feasibility/spikes/vitest.config.mjs \
  --reporter verbose
```

Source: Vitest config/migration docs and Phase 12 validation map. [CITED: https://vitest.dev/config/] [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-VALIDATION.md]

### Representative Vite Build Spike Command

```bash
pnpm exec vite build \
  --config .planning/phases/12-vitest-and-vite-feasibility/spikes/vite.config.mjs \
  --mode production
```

Source: Vite backend integration docs and Phase 12 validation map. [CITED: https://vite.dev/guide/backend-integration.html] [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-VALIDATION.md]

### Manifest Inspection Command

```bash
node -e "const m=require('./tmp/vite-phase-12/.vite/manifest.json'); console.log(Object.keys(m)); for (const [k,v] of Object.entries(m)) console.log(k, v.file, v.css || [], v.assets || [])"
```

Source: Vite manifest docs. [CITED: https://vite.dev/guide/backend-integration.html]

## Concrete Spike Tasks for Planning

| Task | Goal | Commands | Acceptance |
|------|------|----------|------------|
| 12-SPIKE-01 Baseline | Confirm existing Jest and asset baseline before interpreting spikes. | `pnpm test -- --runInBand`; Docker precompile command from `12-VALIDATION.md`. | Baseline pass/fail recorded with no Phase 12 source edits. [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-VALIDATION.md] |
| 12-SPIKE-02 Vitest config | Create temporary Vitest config with aliases, `jsdom`, `globals`, setup file, and Babel Flow bridge. | `pnpm add -D ...`; `pnpm exec vitest run --config ...`. | At least pure helper, Blueprint namespace, reducer, and one React component test either pass or fail with specific blockers. [VERIFIED: app/javascript/**/__tests__] |
| 12-SPIKE-03 Jest API audit | Count and classify `jest.*` APIs that need `vi.*` migration. | `rg -n "jest\\." app/javascript spec/support`. | Summary separates mechanical renames from behavior-risking mock hoist/module reset cases. [VERIFIED: repo scan] |
| 12-SPIKE-04 Vite multi-entry build | Create temporary Vite config for representative packs. | `pnpm exec vite build --config ... --mode production`. | Manifest is emitted or blockers identify Flow, YAML, SVG, `require.context`, dynamic require, or alias failures. [CITED: https://vite.dev/guide/backend-integration.html] |
| 12-SPIKE-05 Asset/CSS contract | Inspect emitted CSS/assets and compare against existing Blueprint asset contract. | manifest inspection command; `rg -n "@blueprintjs/.*/lib/css" tmp/vite-phase-12`. | No accidental Blueprint CSS duplication accepted as success. [VERIFIED: app/javascript/shared/__tests__/blueprintAssetContract.test.js] |
| 12-SPIKE-06 Decision summary | Produce `12-01-SUMMARY.md`. | `rg -n "Vitest decision|Jest fallback|Vite decision|Shakapacker|Webpack" ...`. | Phase 16 gets Vitest/Jest direction; v1.1 production bundler defaults to Shakapacker unless evidence is strong. [VERIFIED: .planning/ROADMAP.md] |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Jest 24 + `babel-jest` | Vitest 4 with Vite transform and explicit globals/setup/environment | Vitest 4 docs current as of v4.1.6 | Migration is plausible but must prove Jest API and Flow transform parity. [VERIFIED: npm registry] [CITED: https://vitest.dev/guide/migration] |
| Webpack/Shakapacker manifest helpers | Vite backend manifest consumed by backend templates | Vite 8 docs current as of v8.0.12 | Rails can integrate with Vite, but helper replacement is production-risking and out of scope for Phase 12 unless proven. [VERIFIED: npm registry] [CITED: https://vite.dev/guide/backend-integration.html] |
| Webpack loaders for raw SVG/YAML/assets | Vite asset imports, `?raw`, `?url`, public dir, plugins | Vite 8 docs current as of v8.0.12 | Source constructs need compatibility proof before migration. [CITED: https://vite.dev/guide/assets.html] [VERIFIED: config/webpack/environment.js] |
| React Refresh dev workflow | React Refresh via `@vitejs/plugin-react` | Current plugin README | Gala React 16.8.6 is below documented Fast Refresh floor, so dev HMR should not drive production feasibility. [VERIFIED: npm registry README] [VERIFIED: package.json] |

**Deprecated/outdated:**
- `react-testing-library@6.0.0` is deprecated in favor of `@testing-library/react`, but latest `@testing-library/react@16.3.2` peers with React 18/19, so replacing it is not a Phase 12 move. [VERIFIED: npm registry] [VERIFIED: package.json]
- `jest-dom@3.0.0` is old relative to `@testing-library/jest-dom@6.9.1`, but matcher package modernization belongs in Phase 16 if Vitest is selected. [VERIFIED: npm registry] [VERIFIED: package.json]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The Vite production replacement will likely be deferred for v1.1 unless the spike is unusually clean. [ASSUMED] | Summary / fallback | If wrong, planner may under-plan a production migration; VITE-05 still requires route/build/asset proof before replacement. |
| A2 | `vite-plugin-babel` is sufficient to test Flow stripping in a temporary spike. [ASSUMED] | Standard Stack / Pattern 1 | If wrong, the spike should record Flow parsing as a blocker and defer to Phase 13/16 rather than adding custom transforms. |

## Open Questions (RESOLVED)

1. **Can Vite parse all active Flow-bearing entry dependencies without source rewrites?**
   - What we know: Current Babel config strips Flow and many app files contain Flow annotations. [VERIFIED: .babelrc.js] [VERIFIED: rg repo scan]
   - What's unclear: Whether a temporary Vite/Babel bridge handles every dependency path and dynamic import shape. [ASSUMED]
   - Recommendation: Make Flow parse success/failure an explicit Vite and Vitest spike result.
   - RESOLVED for planning: Phase 12 will not assume compatibility. The plan resolves this by running temporary Vitest and Vite configs with the existing Babel/Flow path and recording pass/fail evidence in `12-01-SUMMARY.md`; failures become Phase 13/16 blockers rather than Phase 12 source rewrites.

2. **Can `require.context` for Stimulus controllers be replaced without broad behavior change?**
   - What we know: `controllers.js` uses `stimulus/webpack-helpers` and `require.context`. [VERIFIED: app/javascript/packs/controllers.js]
   - What's unclear: Whether a Vite equivalent can be introduced narrowly or must wait for a production migration phase. [ASSUMED]
   - Recommendation: Record as blocker if Vite build fails here; do not rewrite controllers in Phase 12.
   - RESOLVED for planning: The Vite spike will include `controllers.js` as representative Webpack-only coverage. If `require.context` blocks the build, the decision artifact will defer Vite production replacement and keep Shakapacker/Webpack for v1.1.

3. **Will Blueprint namespace bridging behave identically when bundled by Vite?**
   - What we know: Tests cover legacy `pt-` to `bp4-` class mirroring and CSS ownership. [VERIFIED: app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js] [VERIFIED: app/javascript/shared/__tests__/blueprintAssetContract.test.js]
   - What's unclear: Whether output chunk order and CSS injection under Vite preserves route behavior. [ASSUMED]
   - Recommendation: Keep Sprockets Blueprint CSS unchanged during spike and require browser QA before accepting production replacement.
   - RESOLVED for planning: The plan treats Blueprint compatibility as a Vite acceptance gate. Phase 12 preserves Sprockets-owned Blueprint CSS, inspects Vite CSS/manifest output, and requires localhost route QA before any production replacement can be accepted.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Vitest/Vite | yes | 24.15.0 | None needed; satisfies package engines. [VERIFIED: local command] [VERIFIED: npm registry] |
| pnpm | Phase 12 JS commands | yes | 11.1.0 | None; required by phase constraints. [VERIFIED: local command] [VERIFIED: package.json] |
| Docker | Rails asset precompile baseline | yes | 29.4.1 | Host Ruby is not suitable; use Docker for Rails checks. [VERIFIED: local command] |
| Host Ruby | Rails checks outside Docker | no for app target | 2.6.10 | Use Docker Ruby 4.0.3 workflow from validation docs. [VERIFIED: local command] [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-VALIDATION.md] |
| Browser/Chrome CLI | Optional route QA | not found on PATH | — | Use Playwright/browser tooling or Docker/browser QA workflow if production behavior changes. [VERIFIED: local command] [VERIFIED: AGENTS.md] |

**Missing dependencies with no fallback:**
- None for research. [VERIFIED: local command]

**Missing dependencies with fallback:**
- Host Ruby target mismatch; fallback is Docker-based Rails commands. [VERIFIED: local command] [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-VALIDATION.md]
- Chrome CLI not found; fallback is project Playwright/browser QA setup if route-facing behavior changes. [VERIFIED: local command] [VERIFIED: package.json]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Current baseline Jest 24.5.0; spike candidate Vitest 4.1.6. [VERIFIED: package.json] [VERIFIED: npm registry] |
| Config file | Current `jest.config.js`; spike config under `.planning/phases/12-vitest-and-vite-feasibility/spikes/`. [VERIFIED: jest.config.js] |
| Quick run command | `pnpm test -- --runInBand` for baseline; `pnpm exec vitest run --config ...` for spike. [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-VALIDATION.md] |
| Full suite command | `pnpm test -- --runInBand`; Vite build spike command is separate. [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-VALIDATION.md] |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VITE-01 | Representative Jest tests can or cannot run under Vitest with small config. | spike/unit | `pnpm exec vitest run --config .planning/phases/12-vitest-and-vite-feasibility/spikes/vitest.config.mjs` | No; Wave 0 creates temporary config. [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-VALIDATION.md] |
| VITE-04 | Vite can or cannot build representative Rails entrypoints/assets. | spike/build | `pnpm exec vite build --config .planning/phases/12-vitest-and-vite-feasibility/spikes/vite.config.mjs --mode production` | No; Wave 0 creates temporary config. [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-VALIDATION.md] |
| VITE-05 | Production replacement is gated by route/build/asset compatibility. | manual gate plus build | Build spike plus localhost route QA only if production behavior changes. | Existing validation policy file exists. [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-VALIDATION.md] |
| VITE-06 | Shakapacker/Webpack remains if Vite replacement not accepted. | decision artifact | `rg -n "Shakapacker|Webpack|defer|accept" .planning/phases/12-vitest-and-vite-feasibility/12-01-SUMMARY.md` | No; summary to be created. [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-VALIDATION.md] |

### Sampling Rate

- **Per task commit:** Run baseline or spike command touched by that task. [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-VALIDATION.md]
- **Per wave merge:** Run `pnpm test -- --runInBand` and any completed spike command. [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-VALIDATION.md]
- **Phase gate:** Require `12-01-SUMMARY.md` with Vitest decision, Jest fallback, Vite decision, and Shakapacker/Webpack retention or replacement rationale. [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-VALIDATION.md]

### Wave 0 Gaps

- [ ] `.planning/phases/12-vitest-and-vite-feasibility/spikes/vitest.config.mjs` - temporary Vitest spike config for VITE-01. [VERIFIED: file absent]
- [ ] `.planning/phases/12-vitest-and-vite-feasibility/spikes/vitest.setup.js` - temporary setup equivalent to `spec/support/jest-setup.js`. [VERIFIED: spec/support/jest-setup.js]
- [ ] `.planning/phases/12-vitest-and-vite-feasibility/spikes/vite.config.mjs` - temporary Vite build config for VITE-04. [VERIFIED: file absent]
- [ ] `12-01-SUMMARY.md` - final decision artifact for VITE-05/VITE-06. [VERIFIED: file absent]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Phase 12 should not change authentication code. [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-CONTEXT.md] |
| V3 Session Management | no | Phase 12 should not change session behavior. [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-CONTEXT.md] |
| V4 Access Control | no | Phase 12 should not change authorization code. [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-CONTEXT.md] |
| V5 Input Validation | yes, indirectly | Do not introduce production runtime changes; if temporary configs parse YAML or assets, keep them local to spikes. [VERIFIED: config/webpack/environment.js] |
| V6 Cryptography | no | No cryptography changes are in scope. [VERIFIED: .planning/phases/12-vitest-and-vite-feasibility/12-CONTEXT.md] |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Dev server CORS accidentally widened | Information disclosure / tampering | In Vite spike, set CORS only for `http://localhost:3000` and do not commit production server changes. [CITED: https://vite.dev/guide/backend-integration.html] |
| Asset helper replacement emits wrong script/style URLs | Tampering / denial of service | Do not replace Shakapacker helpers in Phase 12; inspect Vite manifest only. [VERIFIED: app/helpers/application_helper.rb] |
| Blueprint CSS duplication changes UI state affordances | Spoofing / UX integrity risk | Keep Sprockets-owned Blueprint CSS unchanged and rely on existing asset contract tests. [VERIFIED: app/javascript/shared/__tests__/blueprintAssetContract.test.js] |

## Sources

### Primary (HIGH confidence)

- npm registry - `vitest@4.1.6`, `vite@8.0.12`, `@vitejs/plugin-react@6.0.1`, `@vitejs/plugin-react@5.2.0`, `jsdom@29.1.1`, `vite-plugin-babel@1.6.0`. [VERIFIED: npm registry]
- Context7 `/websites/vitest_dev` - Jest migration, globals, setup files, global mocking. [VERIFIED: Context7 CLI]
- Context7 `/websites/vite_dev` - backend integration, manifest, React preamble, public assets. [VERIFIED: Context7 CLI]
- Vitest docs - migration, globals, setupFiles, environment, deps, CSS. [CITED: https://vitest.dev/guide/migration] [CITED: https://vitest.dev/config/globals] [CITED: https://vitest.dev/config/setupfiles] [CITED: https://vitest.dev/config/environment] [CITED: https://vitest.dev/config/deps] [CITED: https://vitest.dev/config/css]
- Vite docs - backend integration, build manifest, static asset handling. [CITED: https://vite.dev/guide/backend-integration.html] [CITED: https://vite.dev/config/build-options.html] [CITED: https://vite.dev/guide/assets.html]
- esbuild docs - content types used to identify Flow parsing as a risk. [CITED: https://esbuild.github.io/content-types/]
- Gala repo - `package.json`, `.babelrc.js`, `jest.config.js`, `spec/support/jest-setup.js`, `config/shakapacker.yml`, `config/webpack/environment.js`, `app/views/layouts/application.html.erb`, `app/assets/stylesheets/application.css`, `app/javascript/packs/styles.js`, `app/javascript/shared/blueprintLegacyNamespace.js`, test files. [VERIFIED: repo grep]

### Secondary (MEDIUM confidence)

- Official npm README for `@vitejs/plugin-react` - Fast Refresh React floor and preamble behavior. [VERIFIED: npm registry README]

### Tertiary (LOW confidence)

- None used as authoritative sources. [VERIFIED: research process]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - versions, engines, peer dependencies, and publish dates were verified through npm registry commands. [VERIFIED: npm registry]
- Architecture: HIGH for current Gala ownership, MEDIUM for Vite replacement feasibility until spike output exists. [VERIFIED: repo grep]
- Pitfalls: HIGH for local blockers discovered by repo grep, MEDIUM for exact Vite/Vitest failure modes until commands run. [VERIFIED: repo grep] [ASSUMED]

**Research date:** 2026-05-12  
**Valid until:** 2026-05-19 for package versions because Vitest/Vite are fast-moving; repo evidence remains valid until related files change. [VERIFIED: npm registry]
