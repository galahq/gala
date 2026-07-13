# Phase 1: Baseline Asset Gate - Context

**Gathered:** 2026-05-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 establishes the local QA harness and global BlueprintJS compatibility baseline before route-specific stabilization begins. It should confirm the Rails app can be inspected on `localhost:3000`, verify the intended global asset-loading model, preserve the legacy Blueprint namespace bridge, and define the repeatable QA evidence gate used by later route phases.

This phase is not a route audit, UI redesign, or full migration from `.pt-*` to `.bp4-*`. It prepares the baseline that later route groups will use.

</domain>

<decisions>
## Implementation Decisions

### Blueprint Namespace Strategy
- **D-01:** Keep `app/javascript/shared/blueprintLegacyNamespace.js` as the broad compatibility bridge during route stabilization.
- **D-02:** Keep current Rails-rendered legacy exclusions for `.Toolbar__bar`, `.window-admin`, and `.window.admin` in Phase 1. Evaluate those surfaces in their route-specific phases.
- **D-03:** Runtime namespace bridging should only add missing `.bp4-*` equivalents. Do not remove, replace, or rewrite existing `.pt-*` classes.
- **D-04:** Defer `.pt-*` selector cleanup and migration to Phase 9 after route groups pass.

### CSS Loading Order
- **D-05:** Sprockets owns Blueprint package CSS through `app/assets/stylesheets/application.css`.
- **D-06:** `app/javascript/packs/styles.js` may import Gala overrides, typography, `blueprintLegacyNamespace.js`, and Blueprint JavaScript helpers only. It should not import Blueprint package CSS.
- **D-07:** For style regressions, fix the narrowest shared compatibility layer when multiple Blueprint surfaces are affected; otherwise fix the route or feature's own style/component.
- **D-08:** Treat the current application layout asset order as intentional until browser QA proves a concrete ordering bug.

### QA Gate Shape
- **D-09:** Before a phase commit, record a route checklist, representative browser result, console/network status, screenshots when useful, and targeted test commands/results.
- **D-10:** Store QA evidence in a small phase notes artifact under `.planning/phases/NN-*`.
- **D-11:** Documented pre-existing console/network noise can be allowed, but any new console error, failed pack load, or unexpected failed request blocks the phase.
- **D-12:** Run focused Jest/RSpec checks for touched files first. Run broader `yarn test` or relevant RSpec only if shared/global changes are substantial.

### Baseline Route Sample
- **D-13:** Phase 1 should verify a minimal representative set: `/`, `/up`, one known case route if data exists, and one auth/admin route if reachable.
- **D-14:** If representative routes require unavailable data or credentials, document the missing data/credential, use the closest reachable substitute, and leave the original route for its route-specific phase.
- **D-15:** Use screenshots when visual judgment matters or styling is ambiguous. Do not require screenshots for plain endpoints like `/up`.
- **D-16:** If the local Rails app is not already running on port 3000, Phase 1 should try the repository's normal local startup path, request permission if sandbox/network/long-running process constraints require it, and document blockers.

### the agent's Discretion
- The agent may choose the exact QA notes filename and evidence format, as long as it lives under `.planning/phases/01-baseline-asset-gate/` and records the required gate fields.
- The agent may choose the closest reachable substitute route when credentials or seed data are missing, but must document the substitution.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning
- `.planning/PROJECT.md` — project goal, milestone constraints, and active rules.
- `.planning/REQUIREMENTS.md` — Phase 1 requirement IDs and QA gate requirements.
- `.planning/ROADMAP.md` — Phase 1 scope, files, success criteria, and downstream phase boundaries.
- `.planning/STATE.md` — current milestone and phase status.

### Codebase Map
- `.planning/codebase/STACK.md` — current Ruby, Rails, Node, Shakapacker, Webpack, React, BlueprintJS, and test stack.
- `.planning/codebase/CONVENTIONS.md` — coding, import, style, error-handling, and module conventions.
- `.planning/codebase/TESTING.md` — available RSpec, Jest, and browser testing patterns.

### Source Files
- `config/routes.rb` — source of truth for route groups used by later phase QA.
- `app/views/layouts/application.html.erb` — global layout and current asset ordering.
- `app/assets/stylesheets/application.css` — Sprockets manifest that owns Blueprint package CSS.
- `app/javascript/packs/styles.js` — global Shakapacker styles/helper entry.
- `app/javascript/shared/blueprint.scss` — Gala Blueprint override layer using legacy `.pt-*` selectors.
- `app/javascript/shared/blueprintLegacyNamespace.js` — runtime `.pt-*` to `.bp4-*` class bridge.
- `app/javascript/shared/galaTypography.scss` — global typography override layer loaded by `styles.js`.
- `config/webpack/environment.js` — Shakapacker/Webpack rules, CSS handling, split chunks, and asset behavior.
- `config/shakapacker.yml` — pack source, compile, dev server, and output configuration.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/javascript/shared/blueprintLegacyNamespace.js`: existing compatibility bridge that mirrors legacy `.pt-*` classes to `.bp4-*` for runtime DOM nodes while skipping selected Rails-rendered legacy surfaces.
- `app/javascript/shared/blueprint.scss`: existing Gala Blueprint override layer with many `.pt-*` selectors, color tokens, input/button/toast/popover/tag overrides, and compatibility styling.
- `app/javascript/packs/styles.js`: current global entrypoint for Gala overrides, namespace bridge, typography, and `FocusStyleManager.onlyShowFocusOnTabs()`.
- `.planning/codebase/TESTING.md`: lists viable test commands and patterns for targeted Jest/RSpec checks.

### Established Patterns
- Blueprint package CSS is loaded through Sprockets in `app/assets/stylesheets/application.css`, not imported directly by the Shakapacker styles entry.
- Shakapacker global styles are currently used for Gala-specific SCSS and JavaScript helpers rather than third-party package CSS.
- Frontend source uses Flow-era React 16 conventions, absolute imports rooted at `app/javascript`, and co-located Jest tests under `__tests__/`.
- Ruby tests use RSpec with feature specs excluded from `.rspec` by default; browser workflow checks may need explicit handling outside standard RSpec runs.

### Integration Points
- `app/views/layouts/application.html.erb` is the decisive integration point for current asset order.
- `app/assets/stylesheets/application.css` controls Blueprint package CSS inclusion and ordering relative to Sprockets app styles.
- `app/javascript/packs/styles.js` controls runtime compatibility helpers and Shakapacker-loaded overrides.
- Phase QA should interact with the running app on `localhost:3000` and record results under `.planning/phases/01-baseline-asset-gate/`.

</code_context>

<specifics>
## Specific Ideas

- Preserve the current compatibility-first approach so later route phases reveal real route-level regressions instead of spending Phase 1 on broad namespace migration.
- Use the previous BlueprintJS 2.3.1-era Gala appearance as an approximate visual target, while keeping current BlueprintJS 4 package CSS in place.
- Keep screenshots as evidence only where they help visual judgment; avoid artifact churn for plain text or JSON endpoints.

</specifics>

<deferred>
## Deferred Ideas

- `.pt-*` cleanup, selector migration, and compatibility shim removal belong in Phase 9 after route groups pass.
- Full route-specific audits belong in Phases 2-8, not Phase 1.

</deferred>

---

*Phase: 1-Baseline Asset Gate*
*Context gathered: 2026-05-03*
