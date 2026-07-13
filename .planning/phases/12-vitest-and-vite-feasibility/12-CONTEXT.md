# Phase 12 Context - Vitest and Vite Feasibility

## Goal

Decide how far v1.1 should move toward Vitest and Vite before committing to implementation.

## Scope

- Run focused feasibility spikes for Vitest and Vite.
- Produce evidence-backed decisions for:
  - whether representative existing Jest tests can move to Vitest in v1.1;
  - whether Vite can support Gala's Rails entrypoints, CSS imports, static assets, and Blueprint compatibility layers;
  - whether v1.1 should keep Shakapacker/Webpack as the production bundler.
- Document fallback paths if Vitest or Vite are not feasible within v1.1.

## Requirements

- VITE-01: A focused spike determines whether Vitest can replace Jest for the existing frontend test suite.
- VITE-04: A focused spike determines whether Vite can support Gala's Rails frontend entrypoints, CSS imports, static assets, and Blueprint compatibility layers.
- VITE-05: Vite production bundler replacement only proceeds if the spike proves route, build, and asset compatibility.
- VITE-06: If Vite build replacement is not accepted for v1.1, Shakapacker/Webpack remains the production bundler.

## Constraints

- Use pnpm for all JavaScript install and test commands.
- Keep React on the current React 16 baseline during v1.1.
- Keep BlueprintJS on the current 4.x baseline during v1.1.
- Do not remove Flow in Phase 12; Phase 13 owns Flow removal.
- Do not replace Shakapacker/Webpack production behavior unless the spike produces strong compatibility evidence.
- Do not add broad compatibility shims or dependency upgrades that belong to Phase 15 or Phase 16.
- Treat the existing dirty frontend files as pre-existing user work unless a Phase 12 task explicitly needs to read and preserve them.

## Known Current State

- Phase 11 migrated the root workflow to `pnpm@11.1.0`.
- `pnpm test -- --runInBand` currently passes under Jest 24: 19 suites passed, 1 skipped; 101 tests passed, 3 skipped.
- Rails asset precompile passed through Shakapacker/Webpack in the Ruby 4.0.3 Docker dev container.
- Docker build reached `pnpm install --frozen-lockfile` successfully after the Dockerfile Corepack fix.

## Decision Policy

- Prefer Vitest for Phase 16 only if representative React 16 tests run with a small, explainable config and no broad source rewrites.
- Defer Vite production replacement if it requires major entrypoint rewrites, Flow removal, React/Blueprint upgrades, or risky asset pipeline changes.
- A negative Vite decision is acceptable if it preserves Shakapacker/Webpack and records concrete blockers.

## Expected Outputs

- `12-RESEARCH.md`: current Vitest/Vite compatibility research and spike design.
- `12-PATTERNS.md`: local test/build pattern map for Jest, Shakapacker, packs, CSS, assets, and Blueprint compatibility.
- `12-VALIDATION.md`: Nyquist validation map for feasibility decisions.
- One or more execution plans producing a decision summary, not broad production migration.
