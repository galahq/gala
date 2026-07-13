# Phase 9: Deslopification and Final Regression - Research

**Researched:** 2026-05-11
**Domain:** Upgrade residue removal, global Blueprint compatibility cleanup, and end-of-milestone broad route regression checks
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Scope and Cleanup Direction
- **D-01:** Use broader cleanup than strict dead-only, with scope tied to demonstrable upgrade residue.
- **D-02:** Run a broad final regression across representative routes from all prior stabilized phase groups.
- **D-03:** Use targeted RSpec as the baseline gate for milestone closure and document frontend blockers explicitly.
- **D-04:** Remove compatibility constructs only when no active path uses them.
- **D-05:** Execute cleanup in a global-first pass before route-level fine-tuning.
- **D-06:** Apply mechanical dead-reference prune first, then 1:1 simplifications where legacy and modern class variants are clearly paired.
- **D-07:** Use `config/routes.rb` as route-source-of-truth for regression samples.
- **D-08:** Keep cleanup narrow; avoid broad redesign or stack changes.
- **D-09:** QA on `localhost:3000`, with mock Google sign-in for protected surfaces and console/network triage before marking routes clean.

### Scope for this phase
- Primary work is global/shared frontend asset cleanup and a cross-phase regression surface, not route-behavior rewrite.
- Existing behavior noise from earlier phases (Mapbox style 404s, stale webpack dev-server chunk MIME warnings, existing React/dependency warnings) should be classified, not over-indexed.

### the agent's Discretion
- Final exact route subset for broad sweep, including substitution for any route that is discussed but not present in `config/routes.rb`.
- Exact ordering of cleanup tasks and what is treated as proven-safe one-to-one simplification versus strict dead-prune.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CLEAN-01 | Remove or consolidate duplicate Blueprint compatibility CSS/JS once all route groups pass. | Global shared files are concentrated in `app/javascript/packs/styles.js`, `app/javascript/shared/blueprintLegacyNamespace.js`, `app/javascript/shared/blueprint.scss`, `app/assets/stylesheets/application.css`, and `app/views/layouts/application.html.erb`. Route surface stability depends on shared global asset behavior already stabilized by Phase 1. | `.planning/phases/01-baseline-asset-gate/01-CONTEXT.md`, `.planning/phases/01-baseline-asset-gate/01-RESEARCH.md` |
| CLEAN-02 | Remove dead imports, stale pack assumptions, unused compatibility shims, and misleading comments introduced during the upgrade. | Prior phases introduced compatibility bridges and test contracts around these paths; this phase can remove only clearly safe items from those areas and keep behavior-driven fixes only. | `app/javascript/shared/blueprintLegacyNamespace.js`, `app/javascript/packs/styles.js`, `app/assets/stylesheets/application.css`, `app/javascript/shared/__tests__/blueprintAssetContract.test.js`, `app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js`, `.planning/phases/08-admin-and-operations/08-CONTEXT.md` |
| CLEAN-03 | Remove dead imports, stale pack assumptions, unused compatibility shims, and misleading comments introduced during the upgrade. | `app/javascript/shared/blueprint.scss` is still active override code and should be reviewed for dead/unnecessary legacy-only selectors only; `config/webpack/environment.js` has active upgrade-related output assumptions. | `app/javascript/shared/blueprint.scss`, `config/webpack/environment.js`, `.planning/phases/01-baseline-asset-gate/01-RESEARCH.md`, `.planning/ROADMAP.md` |
| CLEAN-03 | Run broad regression checks and document remaining known risks. | Phase 9 should cover route families stabilized in phases 2-8 at least once at smoke level, with console/network classification and one focused RSpec gate. | `spec/requests/*.rb` suites from phases 2-8, existing phase QA gates, `.planning/STATE.md`, `.planning/ROADMAP.md` |
</phase_requirements>

## Key Architectural Areas

- **Global asset ownership boundary:** `application.html.erb` + `application.css` + `styles.js` already define the app-wide style execution order used across all routes.
- **Namespace bridge boundary:** `blueprintLegacyNamespace.js` is the runtime translator for legacy `pt-*` classes and can be simplified only when active selectors are already paired with modern `bp4-*` usage.
- **Global override boundary:** `blueprint.scss` carries legacy compatibility overrides used by React and Rails-rendered markup; prune candidate selectors requires route-driven evidence.
- **Execution boundary:** `config/webpack/environment.js` affects runtime behavior and dev-server output; any change here impacts broad page load behavior.
- **Test boundary:** Regression coverage is anchored to `app/javascript/shared/__tests__/blueprintAssetContract.test.js` and `app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js`.

## Current Known State from prior phases

- Multiple phases already kept compatibility broad but narrow: many surfaces still include both `pt-*` and `bp4-*` classes in templates, with bridge behavior used to tolerate legacy classes.
- Broad route pass is still valuable because there is upgrade debt scattered across catalog, case, reader, deployment, and admin surfaces. The most efficient method is a “global-first then route-representatives” sweep.
- Frontend test infra remains partially blocked for full `yarn test`; this should be treated as pre-existing scope for the final closure, not a reason to stop regression at the route-surface level.

## Recommended Route Coverage for Final Smoke Sweep

Build the final checklist from `config/routes.rb` groups covered in completed phases:

- **Public and utility:** `/403`, `/404`, `/422`, `/500`, `/up`, `/read/1071`, `/en/catalog/libraries`, `/runtime/stats` (authenticated/401 check).
- **Catalog:** `/`, `/catalog/search`, `/catalog/libraries`, `/catalog/languages`, `/tags.json`, `/search.json`.
- **Case shell (routed):** `/cases/:slug`, `/cases/:slug/1` (suffix handoff), `/cases/:slug/settings`, `/cases/:slug/2` if route-suffixed content is available, plus `/cases/:case_slug/*react_router_location`.
- **Nested case interactions:** representative `POST /comments`, `POST /comment_threads` nested endpoints, `GET/POST /quizzes`, `GET /pages`, `GET /edgenotes`, `GET /stats`, `GET /wikidata_links`.
- **Reader/library/profile:** `/readers/sign_in`, `/profile/edit`, `/readers`, `/libraries`, `/reading_lists`, `/saved_reading_lists`, `/my_cases`, `/enrollments`.
- **Deployments/integrations:** `/deployments`, `/deployments/:id`, `/deployments/:deployment_id/submissions`, `/catalog/content_items`, `/authentication_strategies/config/lti`, `/sparql`, `/groups/:group_id/canvas_deployments`.
- **Admin/operations:** `/admin`, `/admin/cases`, `/admin/cases/:id`, `POST /admin/cases/:id/copy`, `/admin/readers`, `/admin/deployments`, `/admin/ahoy/events`, `/sidekiq` (auth + console/network check).

For each family, keep the prior phase’s auth/state substitutions if required (for example: mock Google sign-in flow for editor routes, documented non-existent routes when route-map mismatch appears).

## Candidate Cleanup Targets (before edits)

1. **Static cleanup (mechanical, usage-prioritized):**
   - `app/javascript/shared/blueprint.scss`
   - `app/javascript/shared/blueprintLegacyNamespace.js` (selectors and exclusion logic)
   - `app/javascript/packs/styles.js` imports and `FocusStyleManager` usage
   - comments in shared assets describing bridge behavior
2. **Compatibility-safe simplification candidates (only where modern equivalent is present):**
   - mixed class usage in templates where both legacy and `bp4-*` already co-occur for same semantic element.
   - small comment/docs/bridge comment cleanup when evidence shows deterministic behavior.
3. **Verification artifacts to touch/keep in sync:**
   - `app/javascript/shared/__tests__/blueprintAssetContract.test.js`
   - `app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js`
   - route-level specs from prior phase QA suites for regression confidence.

## Suggested Regression Test Strategy

- Run a **single targeted RSpec command** covering touched backend-visible route groups before closure.
- Prefer existing phase suites where possible:
  - `docker compose exec web bundle exec rspec spec/requests/public_utility_routes_spec.rb spec/requests/catalog_routes_spec.rb spec/requests/reader_management_routes_spec.rb spec/requests/admin_operations_routes_spec.rb spec/requests/deployment_integration_routes_spec.rb spec/requests/nested_case_interactions_spec.rb`
- For frontend compatibility checks, run:
  - `yarn test app/javascript/shared/__tests__/blueprintAssetContract.test.js --runInBand`
  - `yarn test app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js --runInBand`
- Treat broad browser sweep failures as pre-existing noise unless they are route-specific regressions after cleanup.

## Project Constraints (from AGENTS.md)

- Use `.planning/` artifacts and work sequentially by roadmap.
- Use `config/routes.rb` as route scope source-of-truth.
- Use `localhost:3000` for QA and include console/network triage.
- Run targeted tests for touched files.
- Commit after QA gate pass.
- Keep fixes narrow and route-driven.

## Standard Stack

### Core

| Library | Version | Why standard |
|---------|---------|-------------|
| Rails | 8.1.3 | Route and view surfaces plus request/controller specs in this phase |
| Shakapacker/Webpacker chain | app runtime | Governs shared pack/style load behavior; cleanup can impact all routes |
| BlueprintJS | v4 family | Compatibility bridge (`pt-*` -> `bp4-*`) remains active |
| RSpec | suite coverage | Baseline regression gate selected by team discussions |

### Supporting

| Library | Version | Why standard |
|---------|---------|-------------|
| Playwright/Browser QA | MCP-based QA loop | Route smoke coverage and noise classification required |
| Jest | `app/javascript/shared/__tests__` | Keeps contract tests around shared Blueprint ownership and bridge behavior |

## Route Source Evidence

- Primary route source for this phase: `config/routes.rb`.
- Cross-route context from `.planning/phases/02-08*/` and `.planning/ROADMAP.md` phase route groups.
