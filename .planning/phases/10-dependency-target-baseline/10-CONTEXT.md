# Phase 10: Dependency Target Baseline - Context

**Gathered:** 2026-05-12
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase establishes a conservative dependency target matrix and holdback policy for v1.1 before any lockfiles or dependency manifests are changed. It documents latest compatible stable targets and compatibility holds for later phases to execute against.

</domain>

<decisions>
## Implementation Decisions

### Baseline Scope
- **D-01:** Use a conservative matrix: document latest compatible stable targets, explicitly hold React 16.8 and BlueprintJS 4.x, and make no dependency, package manager, lockfile, or build-runner changes in this phase.
- **D-02:** Treat Phase 10 as policy and target selection only. Later phases perform pnpm migration, Flow removal, Vitest/Vite spikes, Ruby updates, JavaScript updates, and visual regression setup.
- **D-03:** Dependency target selection should use current official registry or documentation data at implementation time. The matrix may include current checked values, but downstream implementation phases must re-check official sources before editing manifests or lockfiles.

### Compatibility Holds
- **D-04:** React remains on the current 16.8 line for v1.1. React major upgrades are deferred to v1.2+.
- **D-05:** BlueprintJS remains on the current 4.x line for v1.1. BlueprintJS major upgrades are deferred to v1.2+.
- **D-06:** Shakapacker/Webpack production behavior remains the default unless the Vite feasibility phase later proves replacement is safe.

### the agent's Discretion
The planner may choose the exact matrix file shape and columns, but it must keep the deliverable documentation-only and must not stage manifest or lockfile edits during this phase.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning Scope
- `.planning/PROJECT.md` — Project context and milestone framing.
- `.planning/REQUIREMENTS.md` — v1.1 requirements, including DEPS-01 through DEPS-04.
- `.planning/ROADMAP.md` — Phase 10 goal, success criteria, and downstream phase boundaries.
- `.planning/STATE.md` — Current workflow state and active phase.

### Codebase Intelligence
- `.planning/codebase/STACK.md` — Current runtime, Rails, Ruby, Node, Shakapacker/Webpack, React, BlueprintJS, Flow, Jest, and Yarn baseline.
- `.planning/codebase/TESTING.md` — Existing Ruby and JavaScript test commands and test-suite constraints.
- `.planning/codebase/CONCERNS.md` — Known upgrade risks, deprecated frontend packages, Node 24 compatibility concerns, and fragile areas.
- `.planning/codebase/ARCHITECTURE.md` — Rails MVC plus Shakapacker React island architecture and production bundling constraints.

### Source of Truth for Current Manifests
- `Gemfile` — Ruby dependency constraints.
- `Gemfile.lock` — Current resolved Ruby dependency baseline.
- `package.json` — Current JavaScript dependency constraints and scripts.
- `yarn.lock` — Current resolved JavaScript dependency baseline before pnpm migration.
- `.ruby-version` — Current Ruby version target.
- `.node-version` — Current Node version target.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `package.json`: Provides the current top-level JavaScript dependency and script inventory for the target matrix.
- `Gemfile`: Provides the current top-level Ruby dependency inventory for the target matrix.
- `.planning/research/SUMMARY.md`: Captures recent dependency modernization research that can seed the matrix, with official sources rechecked during implementation.

### Established Patterns
- Route-facing upgrade work is driven by small, verified phases and avoids broad unrelated dependency movement.
- React islands are bundled through Shakapacker/Webpack, with entrypoints under `app/javascript/packs`.
- Existing frontend tests are Jest-era tests colocated under `app/javascript/**/__tests__`; Vitest migration is intentionally deferred to later phases.

### Integration Points
- Phase 10 should produce a committed planning artifact, such as a dependency target matrix, that Phase 11 through Phase 18 can reference.
- The matrix should separate held dependencies from update candidates so later implementation phases can apply changes in small groups.

</code_context>

<specifics>
## Specific Ideas

Use a conservative target baseline. Do not use Phase 10 to change dependency manifests, lockfiles, package manager configuration, test runner configuration, or build tooling.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 10-Dependency Target Baseline*
*Context gathered: 2026-05-12*
