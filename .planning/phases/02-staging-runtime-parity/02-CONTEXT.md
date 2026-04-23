# Phase 2: Staging Runtime Parity - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 proves the current Gala application behavior on AWS staging. It starts from the Phase 1 baseline: `/up` health checks, tracked SST package manifests, documented deploy guardrails, value-free secret inventory, production image validation, and task-role-friendly S3 configuration.

This phase is not the production cutover and should not mutate production resources. It should validate staging deploy/remove behavior, web runtime behavior, worker/Redis behavior, Action Cable, Active Storage, SES mail, diagnostic logs, and SST tasks for migrations/search/reporting.

</domain>

<decisions>
## Implementation Decisions

### Staging Deploy And Removal
- **D-01:** Treat `staging` as the only deploy target for this phase. Do not run production deploy/remove commands.
- **D-02:** Preserve the GitHub Actions guardrails from Phase 1, but allow equivalent local `infra/` SST commands for validation when they are safer or more observable in this workspace.
- **D-03:** Before any staging deploy attempt, verify the required SST staging secrets have been set outside the repo. If they are not set or cannot be inspected, stop with a clear blocker rather than inventing values.
- **D-04:** Use the `linux/amd64` production image path when validating locally because SST config currently sets ECS service architecture to `x86_64`.

### Web Runtime Parity
- **D-05:** Validate `/up` first, then representative Rails HTML, JSON/CSV/API-style endpoints, static assets/packs, Active Storage direct upload endpoint, OAuth/LTI callback route availability, runtime diagnostics, and `/cable`.
- **D-06:** Keep `/runtime/stats` as authenticated/editor-only diagnostics. It is useful for staging inspection but must not replace `/up`.
- **D-07:** Treat Action Cable as a real WebSocket check, not just a route check. It should prove an ALB upgrade reaches Rails and Redis-backed Cable can connect.

### Worker, Redis, And Background Behavior
- **D-08:** Validate Sidekiq boot separately from web boot. The worker service should connect to the same generated `REDIS_URL` and database as web.
- **D-09:** Redis/Valkey parity must cover Sidekiq, Action Cable, Rails cache, and Rack::Attack/cache-backed behavior because those are distinct app paths using Redis-compatible storage.
- **D-10:** Representative jobs should be low-risk staging-safe jobs. Avoid sending user-visible production email or mutating production-like data outside the staging boundary.

### S3, Mail, Tasks, And Search
- **D-11:** Active Storage staging validation must explicitly decide and record whether staging writes to `msc-gala`, a stage prefix, or a separate staging bucket. Phase 1 kept the existing `msc-gala` bucket policy; Phase 2 must make the boundary operationally safe.
- **D-12:** Validate direct upload, object read, delete/purge, and background analysis/purge behavior using staging-safe test objects.
- **D-13:** SES SMTP validation should use a controlled staging recipient and must not send broad reports to real users.
- **D-14:** Validate SST tasks individually: `db:migrate`, `indices:refresh`, and `emails:send_weekly_report`. Task invocation and logs/results must be inspectable.
- **D-15:** Action Mailbox Amazon ingress is configured in Rails production, but full inbound mail ownership can be documented as a production-cutover checklist item if staging AWS mail ingress is not available.

### the agent's Discretion
- The planner may choose exact staging smoke endpoints and representative jobs, provided each Phase 2 requirement has concrete evidence.
- The planner may create runbooks, scripts, or checklists when live AWS access or secret setup prevents fully automated execution in this workspace.
- If a live staging action is blocked by missing credentials/secrets, record the blocker and do not mark the affected runtime behavior as verified.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project And Phase State
- `.planning/PROJECT.md` — Migration core value and constraints.
- `.planning/REQUIREMENTS.md` — Phase 2 requirements: STOR-03, STOR-04, STAG-01 through STAG-08, TASK-01 through TASK-03, TASK-05.
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, planned plan split.
- `.planning/STATE.md` — Current position and blockers.

### Phase 1 Outputs
- `.planning/phases/01-infra-safety-baseline/01-VERIFICATION.md` — Baseline verification and platform-specific build note.
- `.planning/phases/01-infra-safety-baseline/01-USER-SETUP.md` — Required SST secret setup before staging deploy.
- `docs/aws-sst-secret-inventory.md` — Value-free runtime config inventory.
- `docs/aws-sst-phase-1-preflight.md` — Deploy, build, and storage preflight.

### Research
- `.planning/research/SUMMARY.md`
- `.planning/research/ARCHITECTURE.md`
- `.planning/research/FEATURES.md`
- `.planning/research/PITFALLS.md`

### Runtime And Infra
- `infra/sst.config.ts` — Staging/production domains, ECS services, tasks, schedules, shared env, S3 policies.
- `infra/package.json` and `infra/package-lock.json` — Node >=20/npm/SST v4 package boundary.
- `.github/workflows/deploy.yml` — Manual deploy/remove workflow and production removal refusal.
- `config/environments/production.rb` — production/staging runtime behavior, Action Cable, Active Storage, Redis cache, SES SMTP, Action Mailbox.
- `config/cable.yml` — Redis-backed Action Cable config.
- `config/initializers/sidekiq.rb` — Redis/TLS settings for Sidekiq.
- `config/initializers/rack_attack.rb` — Cache-backed Rack::Attack behavior.
- `config/storage.yml` — Active Storage S3 provider-chain config.
- `config/routes.rb` — Rails routes including `/up`, Active Storage engine routes, auth/LTI callbacks, Sidekiq, runtime stats.
- `Dockerfile` — Production image and asset precompile path.
- `lib/tasks/emails.rake` and `lib/tasks/indices.rake` — Scheduled task behavior.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `infra/sst.config.ts` already defines `GalaWeb`, `GalaWorker`, `GalaMigrate`, `GalaRefreshIndices`, and `GalaWeeklyReport` against a shared environment.
- `config/environments/production.rb` configures Action Cable URL/origins from `BASE_URL`, Active Storage `:amazon`, Redis cache, Sidekiq Active Job, SES SMTP, and Amazon Action Mailbox ingress.
- `config/cable.yml`, `config/initializers/sidekiq.rb`, and `config/initializers/rack_attack.rb` identify the Redis-backed paths that staging must test separately.
- `app/controllers/runtime_controller.rb` can provide editor-only diagnostics for Redis, database, Sidekiq, Action Cable, and process state once staging auth access exists.
- Active Storage direct upload paths are used by React and Rails forms; `app/javascript/packs/file_upload.js` starts Active Storage direct uploads.

### Integration Points
- Deploy validation integrates through `infra/` commands and `.github/workflows/deploy.yml`.
- Web validation integrates through ALB domain, `/up`, Rails root/catalog/case paths, static asset URLs, Active Storage direct-upload endpoint, auth/LTI routes, and `/cable`.
- Worker validation integrates through Sidekiq service boot, Redis connectivity, Active Job queue adapter, and representative low-risk jobs.
- Storage validation integrates through `config/storage.yml`, task role S3 policies, Active Storage blob/service behavior, and stage media boundary decisions.
- Mail validation integrates through SES SMTP env values and staging-safe recipients.
- Search and scheduled task validation integrates through `GalaRefreshIndices`, `GalaWeeklyReport`, `lib/tasks/indices.rake`, and `lib/tasks/emails.rake`.

</code_context>

<specifics>
## Specific Ideas

- Plan 02-01 should focus on deploy/remove, diagnostics, and web service runtime checks.
- Plan 02-02 should focus on worker, Redis/Valkey, Sidekiq, Action Cable, cache, and Rack::Attack/cache-backed behavior.
- Plan 02-03 should focus on Active Storage media boundary, S3 upload/read/delete/purge, SES mail, SST tasks, and search freshness.
- Every live AWS operation must record stage, command, expected result, observed result, and logs/output location.
- If staging secrets are not ready, create a blocker artifact rather than marking runtime parity complete from local-only checks.

</specifics>

<deferred>
## Deferred Ideas

- Heroku-to-RDS migration rehearsal and data checks — Phase 3.
- Production freeze/drain, DNS/TLS switch, callbacks, schedule ownership, and smoke checks — Phase 4.
- Cost tuning, post-cutover monitoring, Redis removal, Solid Queue, Solid Cable, CloudFront, multi-AZ, and frontend modernization — Phase 5 or later.

</deferred>

---

*Phase: 02-staging-runtime-parity*
*Context gathered: 2026-04-23*
