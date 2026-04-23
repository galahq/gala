# Phase 1: Infra Safety Baseline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-23
**Phase:** 1-Infra Safety Baseline
**Areas discussed:** Health Endpoint And Health Checks, Secrets And Runtime Environment, S3 Identity And Media Boundary, Deploy And Build Guardrails

The GSD interactive question API is unavailable in this Codex default-mode session. Following the workflow adapter fallback, the agent selected conservative recommended defaults from the roadmap, research artifacts, and local code evidence. These choices are reviewable in `01-CONTEXT.md` before planning.

---

## Health Endpoint And Health Checks

| Option | Description | Selected |
|--------|-------------|----------|
| Shallow `/up` liveness endpoint | Fast unauthenticated process liveness check; no auth, Redis, external calls, or page rendering. | ✓ |
| Deep readiness endpoint | Include database/Redis checks in health response. | |
| Use existing `/runtime/stats` | Reuse editor-only diagnostics as infrastructure health. | |

**User's choice:** Fallback selected the recommended shallow `/up` liveness endpoint.
**Notes:** `infra/sst.config.ts` currently health-checks `/` with comments to switch to `/up`. `runtime/stats` is authenticated and expensive enough to keep as diagnostics, not health.

---

## Secrets And Runtime Environment

| Option | Description | Selected |
|--------|-------------|----------|
| Heroku-to-SST parity checklist with classifications | Inventory names only, classify boot-critical/feature-critical/optional, and inject required values into shared SST env. | ✓ |
| Minimal current SST secrets only | Keep only the existing declared secrets and defer OAuth/Sentry parity. | |
| Full secret automation now | Build a comprehensive deploy-time secret validation system before any other work. | |

**User's choice:** Fallback selected the parity checklist with classifications.
**Notes:** The selected approach avoids committing secret values while giving Phase 2 enough readiness to validate staging behavior.

---

## S3 Identity And Media Boundary

| Option | Description | Selected |
|--------|-------------|----------|
| ECS task-role credentials | Let AWS SDK use ECS task-role provider chain; avoid static AWS runtime keys. | ✓ |
| Keep static AWS access keys | Preserve current `config/storage.yml` shape and require env keys in ECS. | |
| Separate staging bucket immediately | Solve staging media isolation as part of Phase 1. | |

**User's choice:** Fallback selected ECS task-role credentials.
**Notes:** SST already attaches bucket policies to task roles, but `config/storage.yml` still references `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`. Planning should investigate or patch this mismatch. Full staging media validation remains Phase 2.

---

## Deploy And Build Guardrails

| Option | Description | Selected |
|--------|-------------|----------|
| Preserve existing deploy guardrails and add focused preflight validation | Keep manual stage/action workflow, OIDC, production remove refusal, SST retain, root/infra tooling boundary, and production image build checks. | ✓ |
| Redesign deploy workflow now | Introduce broader CI/CD automation before staging validation. | |
| Modernize root app tooling first | Upgrade Node/Webpacker/frontend tooling before validating AWS infra. | |

**User's choice:** Fallback selected preserving existing guardrails with focused preflight validation.
**Notes:** This keeps Phase 1 aligned with the migration's core value and avoids coupling infrastructure safety to unrelated app modernization.

---

## the agent's Discretion

- Exact Rails route/controller structure for `/up`.
- Exact format of the secret parity artifact, provided it does not include secret values.
- Exact focused verification commands for production image build and infra/tooling boundary.

## Deferred Ideas

- Full staging runtime validation belongs to Phase 2.
- Data migration rehearsal belongs to Phase 3.
- Production cutover belongs to Phase 4.
- Post-cutover architecture simplification belongs to Phase 5 or later.
