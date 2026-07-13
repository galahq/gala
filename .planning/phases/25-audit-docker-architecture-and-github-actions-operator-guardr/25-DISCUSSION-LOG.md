# Phase 25: Audit Docker Architecture and GitHub Actions Operator Guardrails for Secure Reliable Platform Operations - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-01
**Phase:** 25-audit-docker-architecture-and-github-actions-operator-guardr
**Areas discussed:** Operator workflow inventory, Dry-run and approval gates, Rollback and recovery semantics, Migrations and one-off scripts, Cache invalidation, Manpage documentation contract

---

## Operator Workflow Inventory

| Option | Description | Selected |
|--------|-------------|----------|
| Separate workflow files | Separate workflow files for each core operation: deploy dev preview, promote prod, migrate, one-off script, rollback, Rails cache clear, CloudFront invalidation. Clear audit trail, more files. | |
| One shared operator workflow | One `operator.yml` with an `operation` input. Less duplication, but higher risk of confusing side effects. | |
| Hybrid workflow shape | Keep deploy/promote/rollback as separate workflows, put lower-risk maintenance actions in one `maintenance.yml`. | ✓ |

**User's choice:** Hybrid workflow shape.
**Notes:** Follow-up locked the core operator set as separate deploy/promote/rollback workflows plus `maintenance.yml` for migrations, one-off scripts, Rails cache clear, and CloudFront invalidation. PR merge-to-base should be documented as a protected branch process rather than a mutating dispatch job.

---

## Dry-Run and Approval Gates

| Option | Description | Selected |
|--------|-------------|----------|
| Hard dry-run-first | Every mutating workflow requires a successful prior `dry_run=true` run ID for the same ref/stage/operation before `dry_run=false` is accepted. Highest rigor. | |
| Built-in preview only | Every workflow has `dry_run` input and prints the exact side effects, but does not require a separate prior run. | ✓ |
| Environment-gated | Dry-run is required for production only; dev can run directly with validation. | |

**User's choice:** Built-in dry-run preview for every workflow, without requiring a separate prior run.
**Notes:** Production mutations additionally require a CODEOWNER-only gate plus exact typed confirmation including environment, operation, and target ref/artifact.

---

## Rollback and Recovery Semantics

| Option | Description | Selected |
|--------|-------------|----------|
| ECS task definition revision | Roll service back to a prior known-good task definition, preserving the image and env bundle used there. | |
| Release artifact/image ID | Rebuild or redeploy a chosen image/artifact release ID through the deploy workflow. | |
| Both rollback lanes | Prefer ECS task definition rollback for immediate recovery, and document image/artifact redeploy for reproducible recovery or drift repair. | ✓ |

**User's choice:** Both rollback lanes.
**Notes:** Rollback docs need to state what does and does not roll back: task definition, image, env, asset prefix, migrations, Rails cache, and CloudFront state.

---

## Migrations and One-Off Scripts

| Option | Description | Selected |
|--------|-------------|----------|
| ECS one-off task only | Always ECS one-off task using the same production app image and AWS env; never run from a GitHub runner shell against production DB/Redis. | ✓ |
| GitHub runner direct execution | GitHub runner may run Rails commands directly if it has network access and secrets. | |
| Allow both | Allow both, but require production confirmation for direct runner execution. | |

**User's choice:** ECS one-off task only.
**Notes:** One-off script execution must be allowlisted and hard-coded, not arbitrary shell access.

---

## Cache Invalidation

| Option | Description | Selected |
|--------|-------------|----------|
| Maintenance workflow modes | One `maintenance.yml` operation with separate modes: `rails_cache_clear`, `cloudfront_invalidate`, `both`. Each mode prints exact scope and side effects. | ✓ |
| Separate cache workflows | Separate manual workflows for Rails cache and CloudFront invalidation. More explicit audit trail. | |
| CloudFront only | Only expose CloudFront invalidation; Rails cache clear remains a Rails console/manual ECS task. | |

**User's choice:** Maintenance workflow modes.
**Notes:** Each mode must include dry-run output, side-effect summary, and verification instructions.

---

## Manpage Documentation Contract

| Option | Description | Selected |
|--------|-------------|----------|
| `docs/ops/workflows/*.md` | One manpage-style file per core workflow. | ✓ |
| Combined operator manual | One combined `docs/operator-manual.md` with page breaks for each workflow. | |
| Inline workflow docs only | Inline docs inside each workflow YAML only, no separate docs. | |

**User's choice:** `docs/ops/workflows/*.md`, one manpage-style file per core workflow.
**Notes:** Mandatory sections are `NAME`, `SYNOPSIS`, `INPUTS`, `DRY RUN`, `SIDE EFFECTS`, `VERIFY`, `ROLLBACK`, and `EXAMPLES`. Each page must fit within one printed page and use terse manpage(7)-style prose.

---

## the agent's Discretion

- Exact workflow file names may be chosen during planning, provided the hybrid boundary remains clear.
- Exact confirmation phrase format may be chosen during planning, provided production mutations require CODEOWNER authorization and exact typed confirmation.
- Exact implementation details for maintenance workflow modes may be chosen during planning.

## Deferred Ideas

None.
