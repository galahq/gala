---
phase: 12
phase_slug: vitest-and-vite-feasibility
status: draft
nyquist_compliant: true
created: 2026-05-12
---

# Phase 12 Validation Strategy

## Validation Scope

Phase 12 is a feasibility and decision phase. Validation must prove that the
spikes are representative enough to guide later phases without accidentally
changing production frontend behavior.

## Baseline Commands

Use pnpm as the only Node package manager:

```bash
pnpm install --frozen-lockfile
```

Verify the existing frontend test baseline before interpreting spike results:

```bash
pnpm test -- --runInBand
```

Verify the current Shakapacker/Webpack asset baseline in the Ruby 4.0.3 Docker
environment:

```bash
docker compose exec web sh -lc 'pnpm install --frozen-lockfile && SECRET_KEY_BASE=build-placeholder DATABASE_URL=postgresql://placeholder/placeholder bundle exec rails assets:precompile'
```

## Task Validation Map

| Task | Evidence Required | Commands / Checks |
|------|-------------------|-------------------|
| 12-01-01 Baseline inventory | Current Jest, Shakapacker, pack, CSS, asset, and Blueprint compatibility paths are documented before any spike conclusion. | `pnpm test -- --runInBand`; Docker asset precompile command above; route/build pattern notes in `12-PATTERNS.md` or the task summary. |
| 12-01-02 Vitest spike | Representative existing React 16 tests either run under Vitest with a small, explainable config or fail with documented blockers. | Spike command defined in the plan, expected to use `pnpm exec vitest run ...` if Vitest is installed. Record pass/fail output, config changes, and migration limits. |
| 12-01-03 Vite build spike | Representative Rails entrypoints, CSS imports, static assets, and Blueprint compatibility layers are tested against a non-production Vite config, or concrete blockers are documented. | Spike command defined in the plan, expected to use `pnpm exec vite build --config ...` if Vite is installed. Confirm no production Shakapacker replacement unless evidence is strong. |
| 12-01-04 Decision summary | Phase 16 receives a clear Vitest/Jest direction, and Phase 12 records whether Vite replacement is accepted or deferred. | `test -f .planning/phases/12-vitest-and-vite-feasibility/12-01-SUMMARY.md`; `rg -n "Vitest decision|Jest fallback|Vite decision|Shakapacker|Webpack|accept|defer" .planning/phases/12-vitest-and-vite-feasibility/12-01-SUMMARY.md`. |

## Route QA Policy

Phase 12 should not require browser route QA if it only adds temporary spike
configuration and planning artifacts. If any committed code changes alter
production bundler behavior, global asset loading, pack entrypoints, Blueprint
compatibility loading, or route-facing JavaScript, validate the affected route
group on `localhost:3000` and check browser console and network errors before
marking the task complete.

## Guardrails

- Do not remove Flow in Phase 12.
- Do not replace Shakapacker/Webpack production behavior unless the Vite spike
  produces strong compatibility evidence.
- Do not add broad dependency upgrades beyond the minimum spike dependencies
  needed to evaluate Vitest and Vite.
- Do not modify the four pre-existing dirty frontend files unless a task
  explicitly needs to preserve and extend their current contents.
- Negative feasibility results are valid if the blockers are concrete and
  documented.
