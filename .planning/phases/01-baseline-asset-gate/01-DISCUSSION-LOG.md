# Phase 1: Baseline Asset Gate - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-03
**Phase:** 1-Baseline Asset Gate
**Areas discussed:** Blueprint namespace strategy, CSS loading order, QA gate shape, Baseline route sample

---

## Blueprint Namespace Strategy

| Question | Selected | Alternatives Considered |
|----------|----------|-------------------------|
| How aggressive should Phase 1 be about legacy `.pt-*` compatibility? | Keep bridge broad | Migrate touched code only; CSS aliases instead of DOM mirroring |
| Should the namespace bridge apply to Rails-rendered legacy DOM too? | Keep exclusions | Bridge everything; reduce exclusions |
| What should happen when both `.pt-*` and `.bp4-*` classes already exist? | Add missing only | Normalize to bp4; track and warn |
| Where should Phase 1 draw the line between compatibility and cleanup? | Compatibility now, cleanup later | Clean obvious dead selectors now; start migration now |

**User's choices:** 1, 1, 1, 1
**Notes:** The user chose a compatibility-first bridge strategy and deferred cleanup to the final deslopification phase.

---

## CSS Loading Order

| Question | Selected | Alternatives Considered |
|----------|----------|-------------------------|
| What should be the intended ownership model for Blueprint package CSS? | Sprockets owns package CSS | Shakapacker owns package CSS; temporary dual load |
| What should `styles.js` be allowed to import during Phase 1? | Overrides and helpers only | All frontend CSS; namespace bridge only |
| If route QA shows a style regression, where should the first fix go? | Narrowest shared compatibility layer | Global override first; route-local first |
| Should Phase 1 change the layout asset ordering, or only verify it? | Verify first, change only if proven | Move Sprockets before pack CSS; move all CSS before JS |

**User's choices:** 1, 1, 1, invalid `6` then 1
**Notes:** The user selected the current split as intentional and chose to avoid changing asset order without proof from browser QA.

---

## QA Gate Shape

| Question | Selected | Alternatives Considered |
|----------|----------|-------------------------|
| What evidence should be required before a phase can be committed? | Checklist + browser evidence + tests | Checklist + tests only; browser evidence only |
| Where should phase QA evidence live? | Phase notes file | Commit message only; inline in CONTEXT.md |
| How strict should console/network checks be? | No new errors | No errors at all; visual pass can override |
| Which automated tests should Phase 1 require? | Targeted first, broad if touched broadly | Always run broad tests; smoke only |

**User's choices:** 1, 1, 1, 1
**Notes:** The user chose a documented but pragmatic QA gate that blocks new errors and scales automated test breadth to the size of the change.

---

## Baseline Route Sample

| Question | Selected | Alternatives Considered |
|----------|----------|-------------------------|
| Which routes must Phase 1 verify before route-specific phases begin? | Minimal representative set | Public only; broad first pass |
| If a representative route needs data or credentials that are not immediately available, what should Phase 1 do? | Use best available substitute | Stop until available; create seed/test data now |
| How should screenshots be used in Phase 1? | Use when visual judgment matters | Always screenshot every route; no screenshots |
| What should Phase 1 do if the local server is not already running on port 3000? | Start it if possible | Require user to start it; skip browser QA |

**User's choices:** 1, 1, 1, 1
**Notes:** The user chose a minimal baseline route set with documented substitution when data or credentials are missing.

## the agent's Discretion

- Choose exact QA notes filename and evidence format.
- Choose closest reachable substitute route when credentials or seed data are missing, with documentation.

## Deferred Ideas

- `.pt-*` selector cleanup and compatibility shim removal are deferred to Phase 9.
- Full route-specific audits are deferred to Phases 2-8.
