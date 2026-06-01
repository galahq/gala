# Phase 28: Verify ARM ECS Fargate runtime architecture and resolve Thruster AWS fit - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-06-01
**Phase:** 28-Verify ARM ECS Fargate runtime architecture and resolve Thruster AWS fit
**Areas discussed:** ARM validation boundary, Architecture decision rule, Thruster adoption bar, Cleanup and documentation scope, Rollback posture

---

## ARM Validation Boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Dev/preview proof only | Build and run ARM64 in a non-production ECS path, then document production adoption as a later operator decision. | |
| Production-ready config behind a gate | Prepare config/scripts so production can use ARM64, but require explicit operator input and rollback evidence before production use. | yes |
| Research only | No source changes beyond docs; decide whether ARM is worth a later implementation phase. | |

**User's choice:** Production-ready config behind a gate.
**Notes:** Follow-up answers refined this: validate first in dev/preview AWS infrastructure; proof must cover web, worker, migration, and one-off task paths; if dev ARM64 proof passes, source may flip production defaults to ARM64 in this phase. Minimum proof is healthy dev ECS task surfaces.

---

## Architecture Decision Rule

| Option | Description | Selected |
|--------|-------------|----------|
| Lower AWS compute cost | Adopt if ARM64 gives meaningful cost reduction with no major operational penalty. | |
| Long-term platform direction | Adopt because AWS Graviton/ARM64 is the preferred future baseline when compatibility is proven. | |
| Performance-per-dollar | Adopt only if CPU/memory behavior is at least as good for comparable or lower cost. | |
| Simplicity only | Adopt only if it reduces build/deploy/runtime complexity. | |
| Engineering judgment across criteria | Validate all criteria, prioritizing performance, future-proofing, speed, and compatibility. | yes |

**User's choice:** Best judgment across all criteria, looking for performance and future-proofing, aiming for speed and compatibility.
**Notes:** Adoption should be blocked by native dependency uncertainty, runtime regression, significant added complexity, or material performance regression. Required evidence is compatibility plus operational proof: task/image architecture, rollback path, and operator notes. Mixed or incomplete evidence means conservative no-adopt for production.

---

## Thruster Adoption Bar

| Option | Description | Selected |
|--------|-------------|----------|
| Reject unless clearly useful | CloudFront/S3 already owns static asset serving and Puma owns dynamic Rails compute. | yes |
| Bounded experiment | Run a small local or dev ECS experiment even if likely not adopted. | |
| Adopt if compatible | Add Thruster if it boots cleanly and does not break behavior, even if benefit is modest. | |

**User's choice:** Reject unless clearly useful.
**Notes:** "Clearly useful" means improving the dynamic Rails/Puma request path or operational behavior, not duplicating CloudFront/S3 static asset serving. Phase 28 should use research/reconciliation only by default. Current official Thruster/Rails deployment docs must be checked, but any claimed non-static benefit still needs Gala-specific proof before adoption.

---

## Cleanup And Documentation Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Phase artifacts only | Put the decision in phase artifacts or research and leave project docs unchanged. | |
| Operator/deployment docs too | Update relevant AWS/operator docs if defaults, build commands, or architecture guidance changes. | yes |
| Code comments/config only | Keep docs minimal and make source-of-truth files self-explanatory. | |

**User's choice:** Operator/deployment docs too.
**Notes:** If ARM64 is adopted, update only source-of-truth paths: `infra/sst.config.ts`, `scripts/deploy-sst.sh`, and active production preflight docs. If ARM64 is not adopted, keep amd64 default but strengthen rationale and reopening criteria. If Thruster is not adopted, clean only misleading active references that imply it is planned, required, or recommended.

---

## Rollback Posture

| Option | Description | Selected |
|--------|-------------|----------|
| Source rollback path only | Document reverting architecture setting and Docker platform flag. | |
| Task-definition rollback proof | Confirm operators can roll ECS services back to prior amd64 task definition revisions. | yes |
| Full redeploy rollback | Require prior-release redeploy path plus task-definition rollback documentation. | |

**User's choice:** Task-definition rollback proof.
**Notes:** Rollback coverage must include web and worker services. Evidence should come from a live dev rollback drill after ARM testing. If rollback proof is incomplete, block ARM64 production default flip and keep production amd64.

---

## the agent's Discretion

- Exact ARM64 validation commands and safe ECS task commands.
- Exact active AWS/operator docs to update within the documented scope.
- Exact current official Thruster/Rails deployment docs to cite during research.

## Deferred Ideas

None.
