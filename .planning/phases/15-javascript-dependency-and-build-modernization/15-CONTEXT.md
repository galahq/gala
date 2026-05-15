# Phase 15: JavaScript Dependency and Build Modernization - Context

**Gathered:** 2026-05-15T00:00:00Z
**Status:** Ready for planning

## Phase Boundary

Modernize JavaScript dependencies in a conservative, verification-driven pass while keeping route behavior and the v1.0-era Blueprint visual target intact.

The phase is explicitly about dependency modernization and build-tool alignment, not React/Blueprint major upgrades, not replacing production bundler behavior, and not test-runner migration decisions (except documenting compatibility constraints for later phases).

## Implementation Decisions

### Dependency Modernization Scope

- **D-01:** This phase will target constrained compatibility-safe updates first (patch/minor candidates already identified in prior matrix and historical scan), while explicitly holding major jumps for React, BlueprintJS, and major Shakapacker/Vite production migration blockers.
- **D-02:** The manifest is the primary decision source for this phase, with explicit compatibility reasons carried from phase 12 feasibility outcomes and the phase 10 dependency matrix (not broad package modernization).
- **D-03:** `pnpm outdated` baseline evidence used in execution plans must be rechecked in the live networked execution context before final package selection.

### Build and Tooling Alignment

- **D-04:** Preserve Shakapacker/Webpack as the production bundler baseline, and keep Shakapacker and webpack/loader behavior aligned with current Rails pack entrypoints and existing extension loaders.
- **D-05:** Any webpack/loader version movement must preserve the manifest and manifest-consumption contract used by Rails pack rendering in production.
- **D-06:** Update manifests and lockfile in narrow batches, not one huge sweep, to preserve a clear bisect path if asset compilation or tests fail.

### Blueprint/Frontend Compatibility Preservation

- **D-07:** Keep BlueprintJS on 4.x for v1.1 and retain the current layering where Sprockets owns blueprint package CSS, while JS packs provide legacy namespace bridging.
- **D-08:** Do not add new Blueprint CSS/shim imports into webpack pack space during this phase unless the route/build risk and value are explicitly documented and in-scope for this phase.
- **D-09:** Treat the four pre-existing dirty frontend files as out-of-band and preserve them unless execution decisions in phase 15 explicitly require edits.

### Verification and Gates

- **D-10:** For each dependency batch, run targeted verification gates: `pnpm install --frozen-lockfile`, `pnpm test -- --runInBand`, and Docker-based Rails precompile gate before promoting lockfile changes.
- **D-11:** Route-level manual checks on `localhost:3000` are deferred unless Shakapacker/Webpack outputs, pack entrypoints, or browser asset loading behavior change.

### the agent's Discretion

- No explicit discretionary areas were selected by the user; execution should stay within above phase-boundary decisions and defer broader compatibility jumps to later phases.

## Canonical References

Downstream agents MUST read these before planning or implementing.

### Roadmap and Requirements

- `.planning/ROADMAP.md` — Phase 15 goal: modernize compatible JavaScript dependencies while preserving React/Blueprint/Shakapacker constraints.
- `.planning/REQUIREMENTS.md` — `JS-01` through `JS-04` and `QA-01`/`QA-02` expectations.

### Phase Continuity and Constraints

- `.planning/PHASES/14-ruby-dependency-modernization/14-CONTEXT.md` — scope discipline and constraint carryover pattern from phase 14.
- `.planning/phases/14-ruby-dependency-modernization/14-VERIFICATION.md` — gate style for dependency-focused phases.
- `.planning/STATE.md` — current v1.1 sequencing and execution constraints.
- `AGENTS.md` (`/.planning/` top section provided by user) — explicit route-grouping and console/network QA directives for this milestone.
- `.planning/continue-javascript?` — none.

### Existing Feasibility Decisions

- `.planning/phases/12-vitest-and-vite-feasibility/12-CONTEXT.md` — keep Shakapacker/Webpack by default, defer Vite production replacement.
- `.planning/phases/12-vitest-and-vite-feasibility/12-01-SUMMARY.md` — evidence from Vitest/Vite spikes and blocker list.
- `.planning/phases/12-vitest-and-vite-feasibility/12-RESEARCH.md` — compatibility risks around Flow/Jest/vite and YAML/static assets.

### Dependency Baseline Evidence

- `.planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` — candidate/hold policy for webpack, webpack-cli, React/Blueprint, and related build dependencies.
- `package.json` — current dependency constraints and toolchain declarations.
- `pnpm-lock.yaml` — current lockfile state.

### Build/Runtime Integration Points

- `config/webpack/environment.js` — custom webpack merge (css/sass/yaml/raw-loader/process polyfill), manifest merge settings, and optimization behavior that must remain behaviorally stable.
- `config/shakapacker.yml` — pack source/entry and manifest configuration.
- `app/views/layouts/application.html.erb` — pack tag loading order and stylesheet ownership entry points.
- `app/javascript/packs/styles.js` — bootstrap for Blueprint namespace bridge and pack-level styling initialization.
- `app/javascript/shared/blueprintLegacyNamespace.js` — runtime namespace bridge used to preserve legacy `pt-*` class behavior.
- `app/assets/stylesheets/application.css` — canonical Blueprint CSS ownership by Sprockets.

## Existing Code Insights

### Reusable Assets

- `app/javascript/packs/styles.js` and `app/javascript/shared/blueprintLegacyNamespace.js` provide the stable bridge between Sprockets-owned Blueprint CSS and runtime DOM class normalization.
- `config/webpack/environment.js` already contains targeted loader and compatibility customizations; it is the primary extension point for webpack-safe updates.

### Established Patterns

- The codebase preserves production asset contract via `collective_stylesheet_pack_tag` and Shakapacker packs loaded from `app/javascript/packs/*`.
- Frontend code and tests are still pinned to older Jest/React-16-era assumptions, requiring conservative JS/runtime modernization.

### Integration Points

- Pack and helper chain: `app/views/layouts/application.html.erb` → `collected_javascript_pack_tag` / `collected_stylesheet_pack_tag` → Shakapacker/Webpack output in `public/packs`.
- Build/test integration: `pnpm` scripts run frontend tests and Docker-run Rails precompile verifies webpack manifests.

## Specific Ideas

No new specific implementation references were introduced during discussion; follow standard conservative dependency modernization patterns and upstream constraints above.

## Deferred Ideas

- Any React major upgrade, Blueprint major migration, or Vite production replacement is deferred to a later phase per current roadmap constraints.

---

*Phase: 15-javascript-dependency-and-build-modernization*
*Context gathered: 2026-05-15T00:00:00Z*
