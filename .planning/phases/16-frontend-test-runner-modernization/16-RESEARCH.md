---
phase: 16-frontend-test-runner-modernization
collected: 2026-05-15
status: complete
---

# Phase 16: Frontend Test Runner Modernization - Research

## Purpose

Enable a single stable frontend test command through pnpm and decide whether Vitest is currently acceptable on the legacy stack.

## Scope Snapshot

1) Test command consolidation
- `package.json` currently has only `test: NODE_ENV=test jest app/javascript`.
- Runner must stay pnpm-backed after phase 16.
- Legacy Jest command surface remains available as baseline evidence.

2) Runner feasibility state
- Phase 12 demonstrated that Vitest spike execution still fails on representative tests due legacy API and transform incompatibilities.
- Current blockers include `jest.fn`, `jest.mock`, `jest.spyOn`, `jest.resetModules`, and Babel/Flow transform behavior.

3) Compatibility constraints
- React remains `^16.8.6`.
- Blueprint remains 4.x.
- Shakapacker remains production bundler.
- No production behavior changes should be made by this phase unless a separate decision path proves them safe.

## Evidence Sources

- `.planning/phases/12-vitest-and-vite-feasibility/12-01-SUMMARY.md`
- `.planning/phases/12-vitest-and-vite-feasibility/12-RESEARCH.md`
- `package.json`
- `jest.config.js`
- `.planning/REQUIREMENTS.md`
- `AGENTS.md`

## Candidate Decision

- Default this phase to explicit Jest fallback execution (`VITE-03`) unless executor confirms Vitest blockers are removed before runtime tests start.
- Keep `vitest` dev dependency installed for future migration batches only if not already required by prior phases.
- Select a single runner script that is deterministic under Docker/Docker-style verification and local pnpm execution.

## Recheck Commands

```bash
pnpm test -- --runInBand
pnpm test -- --runInBand app/javascript/shared/__tests__/functions.test.js
pnpm exec vitest --help >/tmp/vitest-help.txt 2>&1 || true
rg -n "jest\\.|vitest" package.json jest.config.js .planning/phases/12-vitest-and-vite-feasibility/12-01-SUMMARY.md
```

## Execution Boundaries

- JS-01/JS-02 do not apply directly to phase16; use existing package constraints from Phase 12 and AGENTS.
- Keep this phase focused on commands, environment setup, and verification output.
- Route-level QA remains optional and only needed if production-facing scripts or pack integration change.

