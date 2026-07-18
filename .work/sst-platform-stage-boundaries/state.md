---
ticket: sst-platform-stage-boundaries
current_step: verify
status: ready-for-verify
driving_engine: Codex
updated: 2026-07-12T17:27:14Z
#gate_plan_approved / gate_review are stamped by `quark gate` — do not hand-edit
gate_plan_approved: Nathan @ 2026-07-12T17:14:52.865Z hash=a5669d6a1437
gate_review: passed — by Codex hash=a5669d6a1437
---

# State: sst-platform-stage-boundaries

## Completed

- frame — replaced the 29-criterion platform-wide refactor with an eight-criterion stage-first ticket covering durable dev/production, dev-backed previews, and dev-backed local development (no commit)
- plan — produced a three-slice stage-first plan: characterize durable declarations, add dev-backed preview/local composition, then finish target contracts and four-mode documentation (no commit)
- review — found no Blocking, Important, or Minor gaps; stamped a passed verdict for approved plan hash `a5669d6a1437` (no commit)
- build Slice 1 — added tested stage backing/route facts and pinned durable constructor/shared-resource boundaries (`d0c86484`)
- build Slice 2 — split the durable runtime without changing its declarations, added read-only dev references, and added explicit preview/local application composition (`82031d9e`)
- build Slice 3 — unified exact GitHub/deploy stage resolution and documented the four supported stage forms and shared-resource exclusions (`6eb1e3cc`)

## Decisions & deviations

- Nathan selected the stage-first approach: establish explicit stage modules and ownership boundaries before release, CI, Docker, or state work.
- The prior `sst-ergonomic-platform-refactor` ticket remains historical evidence and is not the implementation plan for this ticket.
- Existing non-empty durable-stage drift is acknowledged but excluded; this ticket performs no durable apply, refresh, reconciliation, or state edit.
- Preview/local application resources are isolated in their own SST stage state while consuming only the verified dev cluster, router, static distribution, and SSM references.
- GitHub accepts only `dev` or `production`; its canonical resolver may derive only an exact open-PR `pr-NUMBER`. `local-NAME` is local-only.

## Next action

- Run `$quark verify sst-platform-stage-boundaries`; all plan-required local checks were green at build handoff.

## Gotchas for the next runner

- Preserve all unrelated working-tree changes; the developer previously required no worktree for this effort.
- `infra/runtime.ts` is now a constructor-free facade; durable declarations live unchanged in `infra/runtime/durable.ts`.
- `msc-gala` and SES remain externally owned by the surviving Heroku production system.
- Do not reintroduce the frozen-operation/HMAC/state-reconciliation machinery from the superseded ticket.
- This plan intentionally has no authenticated SST/AWS verification; any request to deploy, diff live state, or reconcile drift requires a separate approved ticket.
