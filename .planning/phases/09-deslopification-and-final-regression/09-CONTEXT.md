# Phase 9: Deslopification and Final Regression - Context

**Gathered:** 2026-05-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 9 is the final cleanup and stabilization pass after Phases 1-8 are complete. It targets upgrade leftovers (compatibility bridges, stale style paths, and shim-based patterns) while preserving route stability and the existing BlueprintJS 2.3-era visual baseline. The phase combines two tasks:

1) Remove or consolidate clearly dead upgrade residue and 1:1 legacy-equivalent compatibility patterns in a controlled way.
2) Run a broad cross-phase regression sweep over the representative route set from prior phases.

This phase must remain route-driven and narrow in intent. We should avoid redesign, dependency changes, or behavior changes unrelated to cleanup safety.

</domain>

<decisions>
## Implementation Decisions

### Scope and Cleanup Direction
- **D-01:** Apply **broader cleanup** for this phase rather than dead-only-only. Keep scope tied to demonstrably upgrade-related residue.
- **D-02:** Use **broad final regression breadth** across prior phase surfaces, with route-surface checks kept route-driven from `config/routes.rb`.
- **D-03:** Use **targeted RSpec-only gate** as the baseline automated gate for the milestone closeout, while explicitly documenting any non-actionable frontend test infra blockers.

### Compatibility Exit and Sequencing
- **D-04:** Apply **usage-based compatibility exit criteria**: remove compatibility constructs when no active template/helper/controller/view path uses them.
- **D-05:** Execute cleanup in a **global-first pass** before fine-grained local fixes.
- **D-06:** During that pass, run **mechanical dead-reference pruning first**, and also apply safe 1:1 simplifications where a clear modern equivalent is already active on all observed code paths.

### Carry-Forward Constraints
- **D-07:** `config/routes.rb` remains source of truth for scope and route sampling.
- **D-08:** Keep fixes narrowly scoped; do not turn this phase into a redesign or broad architecture change.
- **D-09:** Browser checks continue on `localhost:3000`, with mock Google sign-in for protected surfaces and console/network triage before marking a route clean.

</decisions>

<canonical_refs>
## Canonical References

### Planning
- `.planning/PROJECT.md` — milestone goal, compatibility target, and auth/QA assumptions.
- `.planning/REQUIREMENTS.md` — `CLEAN-01`, `CLEAN-02`, `CLEAN-03` and route coverage requirements.
- `.planning/ROADMAP.md` — phase goals and success criteria.
- `.planning/STATE.md` — current focus and gate history.
- `.planning/phases/07-deployments-and-integrations/07-CONTEXT.md` and `.planning/phases/08-admin-and-operations/08-CONTEXT.md` — prior carry-forwards on route-first stabilization and narrow fixes.

### Route Source
- `config/routes.rb` — authoritative route universe for broad final smoke and route-linked regression checks.

### Codebase Targets
- `app/views/layouts/application.html.erb`
- `app/assets/stylesheets/application.css`
- `app/javascript/packs/styles.js`
- `app/javascript/shared/blueprint.js`
- `app/javascript/shared/blueprintLegacyNamespace.js`

### QA and Test Context
- `.planning/codebase/TESTING.md`
- `.planning/codebase/CONVENTIONS.md`
- `.planning/codebase/STRUCTURE.md`

</canonical_refs>

<code_context>
## Working Assumptions

- Upgrade leftovers are expected in global and shared frontend files first, especially around Blueprint compatibility bridges and compatibility class usage.
- Legacy and modern class patterns (`.pt-*` and `.bp4-*`) may both remain in use across different surfaces; cleanup should prioritize dead code and unequivocal simplifications.
- Phase 9 should not alter active auth boundaries or routing behavior while removing compatibility scaffolding.
- Existing unrelated browser noise from earlier phases (e.g., local dev-server warnings) remains non-blocking unless it affects current phase route checks.

</code_context>

<specifics>
## Specific Scope Ideas

- Build a cleanup checklist from active references (`rg`) before edits.
- Remove dead imports/helpers/namespace bridges first, then apply limited safe one-to-one modernization where active patterns already use a direct modern equivalent.
- Verify each broad sweep route after cleanup via browser QA checklist and relevant targeted RSpec checks.
- Record all pre-existing infra blockers and exceptions explicitly in final QA artifacts.

</specifics>

<deferred>
## Deferred Ideas

- Deep visual refactors that intentionally replace shared legacy markup beyond compatibility cleanup.
- Broad frontend test-infra remediation (`yarn test` blocker) until it is a separate maintenance phase.

</deferred>
