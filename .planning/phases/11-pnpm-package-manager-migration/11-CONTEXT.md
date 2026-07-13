# Phase 11: pnpm Package Manager Migration - Context

**Gathered:** 2026-05-12
**Status:** Ready for planning
**Mode:** Auto-generated smart discuss context (infrastructure phase)

<domain>
## Phase Boundary

Replace Yarn 1 with pnpm while preserving install, build, and test parity. This phase owns package-manager metadata, lockfile migration, and Yarn-assumption cleanup needed for pnpm-backed Node dependency workflows.

</domain>

<decisions>
## Implementation Decisions

### the agent's Discretion
- All implementation choices are at the agent's discretion because this is a pure infrastructure phase.
- Preserve the v1.1 compatibility holds from Phase 10: React remains on the existing React 16 baseline and BlueprintJS remains on 4.x.
- Use the Phase 10 matrix as the source for pnpm target policy: target `pnpm@11.1.0` unless official registry recheck during implementation changes the recommended compatible version.
- Do not combine pnpm migration with unrelated dependency upgrades, Flow removal, Vitest/Vite implementation, or Playwright visual regression setup.
- Treat any pre-existing `package.json` or `yarn.lock` diffs as user work unless the Phase 11 plan explicitly adopts them after reading the current diff.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning Scope
- `.planning/PROJECT.md` - Project context, constraints, and v1.1 milestone framing.
- `.planning/REQUIREMENTS.md` - PNPM-01 through PNPM-05 and QA gates.
- `.planning/ROADMAP.md` - Phase 11 goal and success criteria.
- `.planning/STATE.md` - Current workflow state and known follow-up noise.
- `.planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` - Dependency target baseline and pnpm target/recheck policy.
- `.planning/phases/10-dependency-target-baseline/10-01-SUMMARY.md` - Phase 10 decisions and next-phase readiness.

### Codebase Intelligence
- `.planning/codebase/STACK.md` - Current Yarn 1, Node 24, Shakapacker/Webpack, Jest, and Docker baseline.
- `.planning/codebase/TESTING.md` - Existing Ruby and JavaScript test commands and known Jest constraints.
- `.planning/codebase/CONCERNS.md` - Upgrade risks and fragile frontend/tooling areas.
- `.planning/codebase/ARCHITECTURE.md` - Rails plus Shakapacker React island architecture.

### Source of Truth for Package Manager Migration
- `package.json` - Current package manager, scripts, engines, and dependency constraints.
- `yarn.lock` - Current Yarn lockfile baseline before migration.
- `.node-version` - Current Node 24.15.0 target.
- `Dockerfile` - Container package-manager installation and build workflow.
- `README.md` - Developer setup commands that may reference Yarn.
- `Procfile.dev` - Local process commands that may assume Yarn/Shakapacker behavior.
- `config/shakapacker.yml` - Rails/Shakapacker integration that must keep working after install migration.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `package.json` already declares `packageManager: "yarn@1.22.22"` and Node engine `>=24 <25`.
- `.node-version` pins Node 24.15.0, compatible with current pnpm 11.x according to Phase 10 research.
- `yarn.lock` is the active root JavaScript lockfile and must be replaced only after install/build/test parity is proven.

### Established Patterns
- Route-facing upgrade work stays narrow and avoids unrelated dependency movement.
- JavaScript build behavior is owned by Shakapacker/Webpack; Vite replacement is explicitly deferred to Phase 12 feasibility.
- Existing frontend test command is Jest-era and has known transform issues; Phase 11 should preserve or document parity rather than solve the full test-runner modernization.

### Integration Points
- Package-manager metadata affects local install, Docker builds, JavaScript scripts, Shakapacker compilation, Jest invocation, and later dependency/test phases.
- Later phases depend on Phase 11 to establish `pnpm-lock.yaml` and pnpm-backed commands before further JavaScript dependency modernization.

</code_context>

<specifics>
## Specific Ideas

No specific user-facing requirements. Use the standard pnpm migration path for a Node 24 Rails/Shakapacker app, keep the migration scoped, and verify parity with targeted install/build/test commands.

</specifics>

<deferred>
## Deferred Ideas

- Flow removal and TypeScript/JSDoc foundation belong to Phase 13.
- Vitest/Vite feasibility belongs to Phase 12, with frontend test runner implementation in Phase 16.
- JavaScript dependency modernization belongs to Phase 15.
- Playwright visual regression setup belongs to Phase 17.

</deferred>
