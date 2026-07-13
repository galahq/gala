# Phase 10: Dependency Target Baseline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-12
**Phase:** 10-Dependency Target Baseline
**Areas discussed:** Dependency target baseline scope

---

## Dependency Target Baseline Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Conservative matrix | Document latest compatible stable targets, explicitly hold React and BlueprintJS, no lockfile/package changes. | yes |
| Expanded matrix | Include top-level Ruby/Node targets plus transitive risk notes for Flow-era/Babel/Jest/Webpack packages. | |
| Baseline plus smoke check | Do expanded matrix and also run no-change baseline commands to capture current failures before planning migrations. | |

**User's choice:** 1 - Conservative matrix.
**Notes:** User previously clarified that React and BlueprintJS should remain at their current versions for the milestone, and that v1.1 should focus on removing Flow from Node dependencies and evaluating modern TypeScript/JSDoc, Vite, Vitest, pnpm, frontend tests, and Playwright coverage in later phases.

---

## the agent's Discretion

- Planner may choose the exact documentation artifact format for the dependency target matrix.
- Planner must preserve the documentation-only boundary for Phase 10.

## Deferred Ideas

None.
