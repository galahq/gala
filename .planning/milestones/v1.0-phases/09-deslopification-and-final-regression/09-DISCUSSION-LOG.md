# Phase 9: Deslopification and Final Regression - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `09-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-05-11
**Phase:** 9-deslopification-and-final-regression
**Areas discussed:** Cleanup aggressiveness, Final regression sampling breadth, Test gate strategy, Compatibility layer exit criteria, Cleanup sequencing and blast radius, Legacy compatibility pruning policy

---

## Cleanup aggressiveness

| Option | Description | Selected |
|--------|-------------|----------|
| Dead-only cleanup | Remove only clearly unused compatibility code/usages. | |
| Selective consolidation | Remove dead items and simplify a small number of used patterns with high confidence. | |
| **Broader cleanup** | Broader simplification/removal pass beyond only dead items, while still evidence-driven. | ✓ |

**User's choice:** Broader cleanup
**Notes:** Phase 9 will not be limited to dead code; it will include cleanup of confidently safe legacy-equivalent patterns.

---

## Final regression sampling breadth

| Option | Description | Selected |
|--------|-------------|----------|
| Lean representative smoke | Revisit only a short high-signal route subset from earlier groups. | |
| Moderate breadth | Revisit all primary routes in stabilized groups with limited exclusion of low-signal edges. | |
| **Broad sweep** | Run cross-phase coverage on a broad representative set aligned to prior route groups. | ✓ |

**User's choice:** Broad sweep
**Notes:** This final phase should re-check broad representative coverage, consistent with a milestone-closing regression signal.

---

## Test gate strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Targeted RSpec gate (recommended) | Run route-appropriate targeted RSpec gate and explicitly exempt full Jest until blockers are addressed. | ✓ |
| Hybrid gate | Targeted RSpec plus minimal Node smoke, only if stable. | |
| Full frontend CI gate | Require complete `yarn test` success before closeout. | |

**User's choice:** Targeted RSpec gate
**Notes:** The phase closes out on proven backend route/spec coverage and explicit documentation of remaining non-blocking frontend-gate issues.

---

## Compatibility layer exit criteria

| Option | Description | Selected |
|--------|-------------|----------|
| Usage-based removal | Remove compatibility constructs when no active path still uses them, with targeted coverage checks. | ✓ |
| Keep-and-document | Keep uncertain constructs and defer cleanup to later phase. | |
| Consolidation-first | Remove dead compatibility immediately and refactor shared usage in-place even if not fully dead. | |

**User's choice:** Usage-based removal
**Notes:** Removes unnecessary legacy compatibility only when evidence supports no active dependency.

---

## Cleanup sequencing and blast radius

| Option | Description | Selected |
|--------|-------------|----------|
| Global-first pass | Remove dead constructs broadly, then handle edge-case cleanup. | ✓ |
| Risk-first pass | Remove high-confidence items first, then do route-by-route cleanup. | |
| Target-slice pass | Clean admin/shared first, then expand as needed. | |

**User's choice:** Global-first pass
**Notes:** Keep a single cleanup sweep first to reduce repeated scanning and simplify final regression attribution.

---

## Legacy compatibility pruning policy

| Option | Description | Selected |
|--------|-------------|----------|
| Mechanical dead-only prune | Remove only constructs confirmed unused by references. | ✓* |
| Prune plus safe simplification | Remove dead constructs and safely simplify legacy patterns with clear modern equivalents. | ✓* |
| Aggressive cleanup | Remove broad scaffolding and adjust shared patterns in one go. | |

**User's choice:** **Combined policy:** mechanical dead-reference prune first, plus safe 1:1 modernization simplifications where a modern equivalent is already active and clear.
**Notes:** The pass starts from reference-based certainty, then applies narrow 1:1 simplifications to reduce residual legacy surface.

