# SST Durable Baseline Equivalence Design

**Date:** 2026-07-12
**Ticket:** `sst-ergonomic-platform-refactor`
**Decision:** Accept a frozen non-empty read-only SST baseline for source-only refactoring.

## Objective

Allow the ergonomic source refactor to proceed without treating the current durable-stage desired-source/checkpoint drift as authorized infrastructure work. Source-only changes must preserve the exact normalized operation sets already reproduced twice. The existing operations remain inert evidence and are never an apply allowlist.

## Frozen baseline

The baseline was captured with SST 4.7.1, commit `d6d7e48a7a071f5cd4a492f971b89df4743c2c78`, and canonical constants SHA-256 `ddf2329522d3648943c0fd1cad3f040f10dea692632eea032fff04ddd263237d`.

- Dev: 37 operations, normalized operations SHA-256 `9d05c269d2d1755d349b8526d1fc73f18a1e2944315841397063ef862ff92b0f`.
- Production: 100 operations, normalized operations SHA-256 `4479de82918ef71286fec4d66657e89507be6300e749a4f2501677b662d43bca`.

Each stage produced the same operation set on two isolated read-only runs. The evidence is stored under `.work/sst-ergonomic-platform-refactor/evidence/` and remains uncommitted because it is ticket scratch data.

## Equivalence rule

For every source-only infrastructure move:

1. Run the sanitized no-refresh wrapper twice for `dev` and twice for `production` at one commit and constants hash.
2. Require each stage's pair to be identical.
3. Compare the full sorted normalized `{op, urn, type, parent}` array to its frozen baseline.
4. Require exact structural equality: no added, removed, or changed operation.
5. Stop before the next source move on any mismatch.

Counts alone are insufficient. The comparison uses the complete normalized arrays and their SHA-256 fingerprints.

## Behavioral-change rule

A later behavior-changing slice must calculate a set delta against the frozen baseline. The artifact reports baseline-only, unchanged, added, removed, and changed operations. Only the delta is reviewed as the proposed behavior change; unchanged baseline operations never become approved by appearing in the comparison.

No `dev` or `production` apply is authorized by this ticket, even if the delta is empty or contains apparently safe operations. Preview-stage UAT retains its separate exact-plan and explicit-human-approval gate.

## Safety boundaries

- Never apply the frozen durable-stage baselines.
- Do not run refresh, state edit/repair/remove, import, or direct checkpoint writes.
- Do not mutate Heroku, `msc-gala`, SES, shared S3, CloudFront, ALB, log groups, autoscaling, bastion, database, cache, or another preview.
- Preserve the complete baseline arrays; do not collapse duplicate SST component events or compare counts only.
- Bind every comparison to commit, constants hash, stage, SST version, and normalized-array fingerprint.
- Keep state/source reconciliation as separate future work.

## Failure handling

Any baseline mismatch stops the refactor. The builder may revert only its current source-only move and rerun the comparison; it may not edit the baseline, broaden normalization, refresh state, or classify a new operation during build. Changing the frozen baseline requires a new frame, plan approval, and review.

## Testing

Contract fixtures cover exact equality, count-preserving substitutions, duplicate removal, added and removed operations, reordered input, stage/commit/constants mismatch, and baseline-versus-delta partitioning. Tests are written before the comparator implementation.
