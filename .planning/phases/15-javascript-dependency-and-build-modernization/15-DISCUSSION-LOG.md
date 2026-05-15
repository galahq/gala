# Phase 15: JavaScript Dependency and Build Modernization - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-15T00:00:00Z
**Phase:** 15-javascript-dependency-and-build-modernization
**Areas discussed:** Dependency Modernization Scope, Build and Tooling Alignment, Blueprint Compatibility Preservation, Verification Gates and Sequencing

---

## Dependency Modernization Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Broad modernization | Move all manageable JavaScript dependencies forward regardless of ecosystem coupling. |  |
| Conservative updates | Update only compatibility-safe patch/minor groups in this phase; explicitly defer risky major/jump candidates. | ✓ |
| No dependency modernization now | Defer entire phase to later. |  |

**User's choice:** Conservative updates (auto-selected in `--auto` mode)
**Notes:** Aligns with phase-10 matrix holds and phase-12 bundler/test feasibility outcomes; candidate list must be revalidated at execution time.

---

## Build and Tooling Alignment

| Option | Description | Selected |
|--------|-------------|----------|
| Move Shakapacker version in lockstep with webpack now | Upgrade major/minor Shakapacker alongside webpack to align build stack. |  |
| Preserve Shakapacker baseline and keep webpack upgrades constrained (patch/minor where viable) | Keep webpack as 5.x/close patch path and maintain production behavior unless evidence supports broader change. | ✓ |
| Replace webpack with Vite in this phase | Do not migrate to Vite production; keep existing bundler baseline. |  |

**User's choice:** Preserve Shakapacker baseline and keep constrained webpack modernization.
**Notes:** This is directly consistent with phase-12 Vite decision and existing `shakapacker` constraints.

---

## Blueprint Compatibility Preservation

| Option | Description | Selected |
|--------|-------------|----------|
| Upgrade Blueprint family together to latest major | Not allowed in v1.1; risk to visual contract. |  |
| Keep Blueprint 4.x baseline and preserve current Sprockets + legacy namespace bridge; postpone major upgrades | Preserve ownership and compatibility; only consider safe intra-line movement after verification. | ✓ |
| Move blueprint CSS fully into webpack processing for this phase | Avoid due to existing CSS ownership risk and prior v1.0 compatibility constraints. |  |

**User's choice:** Keep Blueprint 4.x baseline; preserve current CSS/compatibility setup.
**Notes:** `blueprintLegacyNamespace` and `application.css` ownership remain source of compatibility truth.

---

## Verification Gates and Sequencing

| Option | Description | Selected |
|--------|-------------|----------|
| Single large lockfile update then full verification | Faster but high-risk and low-resolution rollback. |  |
| Batched updates with freeze-install + frontend tests + Docker precompile after each batch | More controlled and aligns with phase-level safety expectations. | ✓ |
| Skip verification in favor of full route QA only | Not sufficient for dependency-only phase. |  |

**User's choice:** Batched updates with freeze-install, test, and precompile gates.
**Notes:** Browser route QA remains conditional on build/runtime surface changes.

---

## the agent's Discretion

- No areas were explicitly handed to agent discretion in this `--auto` run.

## Deferred Ideas

- React major upgrade, Blueprint 6 migration, and Vite production migration are deferred to future phases.
