# Phase 16: Frontend Test Runner Modernization - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning

## Phase Boundary

Phase 16 modernizes frontend test command reliability and runner selection on top of the v1.1-compatible stack.

This phase does not alter React, Blueprint, Shakapacker, or the production asset pipeline.

## Locked Decisions

- Keep JavaScript on pnpm-backed commands only.
- Keep React and Blueprint at their v1.1-compatible lines (`react@16.8.x`, `@blueprintjs/*@4.x`).
- Preserve Shakapacker/Webpack as the production bundler unless a later phase produces stronger migration evidence.
- Use route and browser QA on `localhost:3000` only if this phase changes production-facing bundle/runtime behavior.
- Keep fixes narrow and evidence-driven.

## Implementation Guidance

- Use Phase 12’s feasibility results as the source-of-truth for runner choice.
- Prefer a single stable runner command path from `package.json` scripts.
- Address test-environment configuration explicitly so local failures are reproducible and explainable under pnpm.
- Keep Jest as the stable v1.1 baseline if Vitest compatibility work is not complete at phase start.

## Canonical References

- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/STATE.md`
- `.planning/phases/12-vitest-and-vite-feasibility/12-01-SUMMARY.md`
- `.planning/phases/12-vitest-and-vite-feasibility/12-RESEARCH.md`
- `AGENTS.md`
- `package.json`
- `jest.config.js`

## Decisions from Inputs

- From Phase 12 spikes: Vitest has known Jest-API and parser compatibility blockers on the current legacy test surface, so v1.1 production fallback remains Jest unless a scoped migration is completed.
- Keep the phase deliverable scope to command reliability, env configuration, and representative verification under selected runner.
- If Vitest blockers remain, document explicit fallback acceptance under VITE-03 and keep `yarn` references out of test execution.

### Discussion Lock-in (from 1,2,1)

- Primary command shape: keep a single canonical frontend test entrypoint in `package.json` (`test`) with explicit `NODE_ENV=test` and shared invocation path for the baseline frontend command.
- Vitest policy: choose the fallback lane (`VITE-03`) now; retain `test:vitest:spike` as a bounded experiment-only script until migration blockers are explicitly remediated.
- Representative scope: use focused shared-suite verification as the baseline representative path (`app/javascript/shared/__tests__/functions.test.js`) plus the full baseline `pnpm test -- --runInBand` commandability check.
