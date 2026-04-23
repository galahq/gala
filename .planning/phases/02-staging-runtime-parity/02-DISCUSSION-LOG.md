# Phase 2: Staging Runtime Parity - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-23
**Phase:** 2-Staging Runtime Parity
**Areas discussed:** Staging Deploy And Removal, Web Runtime Parity, Worker/Redis Behavior, S3/Mail/Tasks/Search

The GSD interactive question API is unavailable in this Codex default-mode session. Following the workflow adapter fallback, the agent selected conservative recommended defaults from the roadmap, Phase 1 verification, research artifacts, and local code evidence. These choices are reviewable in `02-CONTEXT.md` before planning.

---

## Staging Deploy And Removal

| Option | Description | Selected |
|--------|-------------|----------|
| Staging-only deploy/remove validation | Use only the `staging` SST stage and preserve production removal guardrails. | yes |
| Production dry-run included | Include production deploy/remove previews in this phase. | |
| Documentation-only deploy validation | Avoid live deploy commands entirely. | |

**Notes:** Phase 2 requires real staging evidence, but missing AWS credentials or unset SST secrets should become explicit blockers rather than guessed success.

## Web Runtime Parity

| Option | Description | Selected |
|--------|-------------|----------|
| Layered web smoke checks | Validate `/up`, representative Rails endpoints, assets, direct upload endpoint, auth/LTI routes, diagnostics, and `/cable`. | yes |
| Health-only validation | Treat `/up` as enough for web service parity. | |
| Full manual browser-only validation | Rely only on manual web exploration. | |

**Notes:** `/runtime/stats` is useful after editor auth exists, but `/up` remains the liveness endpoint.

## Worker And Redis/Valkey

| Option | Description | Selected |
|--------|-------------|----------|
| Separate Redis path checks | Validate Sidekiq, Action Cable, Rails cache, and Rack::Attack/cache-backed paths separately. | yes |
| Sidekiq boot only | Treat worker process health as enough. | |
| Defer all Redis behavior | Push Redis validation to post-cutover. | |

**Notes:** The app has several Redis clients with different behavior and TLS handling, so one successful connection does not prove parity.

## S3, Mail, Tasks, And Search

| Option | Description | Selected |
|--------|-------------|----------|
| Controlled staging validation | Use staging-safe objects, recipients, and task invocations with logs/results captured. | yes |
| Production-like full traffic replay | Exercise broad production behavior through staging. | |
| Documentation-only validation | Write runbooks without attempting staging checks. | |

**Notes:** Staging media boundary must be decided before uploads. SES and weekly report tests must avoid accidental real-user mail.

## Deferred Ideas

- Data migration rehearsal belongs to Phase 3.
- Production cutover and inbound mail ownership belong to Phase 4 unless staging AWS mail ingress already exists.
- Operational cost tuning and architecture simplification belong to Phase 5 or later.
