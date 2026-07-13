# Phase 27: Spot And Remove Ambiguous Environment Variables Like The Git - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 
**Phase:** 27-spot-and-remove-ambiguous-environment-variables-like-the-git
**Areas discussed:** Blank-value removal scope, Source-of-truth boundary, Safe exceptions, Verification gate

---

## Blank-Value Removal Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Empty only | Remove values exactly equal to `""`. | |
| Blank-like values | Remove `""`, whitespace-only strings, `null`, and `undefined`. | yes |
| `GIT_*` only | Apply blank-like removal only to `GIT_*` variables. | |
| Other | User-defined rule. | |

**User's choice:** Blank-like values.
**Notes:** The cleanup should not be restricted to `GIT_*`; Git metadata is the motivating example of ambiguous blank task-definition noise.

---

## Source-of-Truth Boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Source only | Edit `infra/sst.config.ts` and verify the source no longer defines blank env entries. | |
| Source plus rendered diff | Use `sst diff` for `dev` as read-only evidence after source cleanup. | yes |
| Source plus AWS diagnostics | Inspect currently deployed ECS task definitions with read-only AWS CLI before/after source cleanup. | |
| Source, rendered diff, and AWS diagnostics | Use all three without deploying. | |

**User's choice:** Source plus rendered diff.
**Notes:** `infra/sst.config.ts` remains the source of truth; `sst diff --stage dev` is the rendered read-only evidence. No deployment.

---

## Safe Exceptions

| Option | Description | Selected |
|--------|-------------|----------|
| No allowlist | Blank-like env values are invalid task-definition noise and should be removed. | yes |
| Narrow allowlist | Allow explicit named exceptions only if a comment explains why blank is meaningful. | |
| GIT allowlist only | Remove blank `GIT_*`, but tolerate other blank vars for now. | |
| Other | User-defined exception policy. | |

**User's choice:** No allowlist.
**Notes:** Blank env values should be categorically removed from task-definition output.

---

## Verification Gate

| Option | Description | Selected |
|--------|-------------|----------|
| Static source assertions only | Verify source-level cleanup only. | |
| Static source assertions plus `sst diff --stage dev` | Verify source and rendered read-only dev diff. | yes |
| Static source assertions, `sst diff --stage dev`, and read-only ECS task-definition inspection | Add AWS ECS inspection evidence. | |
| Other | User-defined gate. | |

**User's choice:** Static source assertions plus `sst diff --stage dev`.
**Notes:** Read-only ECS task-definition inspection is not required unless `sst diff` proves insufficient.

---

## the agent's Discretion

- Choose the exact normalization helper/function shape.
- Choose deterministic static source assertions.
- Decide whether a small local test/check is worth adding.

## Deferred Ideas

- Live ECS task-definition inspection.
- CI enforcement for blank env values, unless execution finds a very small and stable check.
