# Phase 8: Admin and Operations - Context

**Gathered:** 2026-05-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 8 stabilizes the Rails-rendered admin dashboards and operational routes after the public, case, reader, and deployment flows are stable. It covers the admin root, representative Administrate resources, the custom `admin/cases/:id/copy` route, `admin/ahoy/events`, and the editor-gated `/sidekiq` mount from `config/routes.rb`.

This remains an upgrade-stabilization phase, not a redesign, permissions redesign, or operational platform overhaul. Fixes should preserve the approximate BlueprintJS 2.3.1-era Gala behavior while narrowly correcting verified admin and operational regressions.

</domain>

<decisions>
## Implementation Decisions

### Admin Route Sampling
- **D-01:** Use a representative browser sweep instead of visiting every admin resource individually.
- **D-02:** The anchor browser sweep should include the admin root plus `cases`, `readers`, `libraries`, `deployments`, and `ahoy events`.
- **D-03:** Empty admin pages are acceptable if the shared shell renders correctly, but each major admin slice should include at least one populated representative resource.

### Auth and Verification Split
- **D-04:** Keep admin and operational auth/authorization checks mostly spec-driven rather than trying to manually browser-check every denied path.
- **D-05:** Use only minimal protected-surface browser QA on admin/editor-only routes; rely on request/controller specs for anonymous and non-editor denial behavior.
- **D-06:** Use a deliberate mix of request and controller specs based on existing nearby coverage and the specific behavior under test.

### Visual Parity Priorities
- **D-07:** Prioritize case admin pages and custom action surfaces for the closest visual parity review.
- **D-08:** Shared Administrate shell issues still matter, but broad polish across every generic resource should stay secondary to case/admin action routes.
- **D-09:** `admin/ahoy/events` should receive shared-shell coverage plus an explicit newest-first ordering check.

### Mutations and Operational Scope
- **D-10:** Treat `admin/cases/:id/copy` as the primary mutation path to exercise in this phase.
- **D-11:** Keep the rest of Phase 8 primarily read/auth focused unless a supposedly read-only admin route still exposes mutation behavior that clearly belongs in scope.
- **D-12:** Verify `/sidekiq` as editor-only and perform only a landing-page smoke test once inside; do not expand into a multi-tab operational audit.

### Data Setup Strategy
- **D-13:** Seed a small representative admin dataset up front so browser QA can inspect populated admin tables and show pages.
- **D-14:** Prefer factories/spec-backed setup for that seeded dataset where possible.
- **D-15:** Use minimal manual local records only if browser QA still needs them after the reproducible setup path is used.

### Carried Forward
- **D-16:** `config/routes.rb` remains the source of truth for route coverage.
- **D-17:** Protected browser QA should use the local sign-in flow at `/readers/sign_in` and the mock Google button `a.oauth-icon-google`.
- **D-18:** Keep fixes narrow and route-driven; avoid broad restyling or permission model changes unless a verified admin regression requires it.
- **D-19:** Existing unrelated console noise or local dev-server noise should be classified rather than treated as blocking unless visible admin or Sidekiq behavior breaks.

### the agent's Discretion
- The agent may choose the exact seeded records and factories for the representative admin dataset as long as the resulting routes cover the agreed anchor set.
- The agent may choose whether a given auth/copy check is better served by a request spec or controller spec, provided the choice follows nearby repo patterns and is documented in the plan.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning
- `.planning/PROJECT.md` — milestone goal, route-driven stabilization rules, Blueprint compatibility target, and mock Google login guidance.
- `.planning/REQUIREMENTS.md` — `ADM-01`, `ADM-02`, `ADM-03`, and shared QA requirements.
- `.planning/ROADMAP.md` — Phase 8 route list, UI areas, and success criteria.
- `.planning/STATE.md` — current milestone position and Phase 8 readiness.
- `.planning/phases/07-deployments-and-integrations/07-CONTEXT.md` — prior protected-route QA decisions and carry-forward guidance on narrow fixes and accepted local noise.

### Codebase Maps
- `.planning/codebase/STRUCTURE.md` — admin controllers, dashboards, views, and operational file locations.
- `.planning/codebase/CONVENTIONS.md` — Rails controller/view/spec conventions and error-handling expectations.
- `.planning/codebase/TESTING.md` — request spec, controller spec, feature, and factory patterns relevant to Phase 8.

### Route Source
- `config/routes.rb` — source of truth for `admin`, `admin/ahoy/events`, `admin/cases/:id/copy`, and `/sidekiq`.

### Source Areas
- `app/views/layouts/admin.html.erb` — shared admin layout and Blueprint-compatible toolbar/search shell.
- `app/controllers/admin/application_controller.rb` — shared editor authorization and disabled-action behavior for Administrate controllers.
- `app/controllers/admin/cases_controller.rb` — custom case copy action and friendly-id resource loading.
- `app/controllers/admin/ahoy/events_controller.rb` — custom newest-first event ordering.
- `app/dashboards/case_dashboard.rb` — case admin resource configuration and highest-priority admin surface.
- `app/dashboards/reader_dashboard.rb` — representative user/admin table/show configuration.
- `app/dashboards/library_dashboard.rb` — representative content-management admin resource.
- `app/dashboards/deployment_dashboard.rb` — representative deployment/admin resource.
- `app/dashboards/ahoy/event_dashboard.rb` — Ahoy event admin resource configuration.
- `app/views/admin/application/index.html.erb` — shared Administrate collection template used by most admin resources.
- `app/views/admin/application/show.html.erb` — shared Administrate show template used by most admin resources.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/views/layouts/admin.html.erb`: shared admin navigation, search box, and Blueprint-compatible toolbar classes used across admin screens.
- `app/views/admin/application/index.html.erb`: generic Administrate collection view shared by most admin resources.
- `app/views/admin/application/show.html.erb`: generic Administrate show view shared by most admin resources.
- `app/controllers/admin/application_controller.rb`: central place for editor authorization and disabled admin actions.
- `app/dashboards/*`: existing Administrate dashboard definitions provide the representative resource surfaces for browser and spec coverage.

### Established Patterns
- Most admin pages are Rails-rendered Administrate resources sharing common layout/templates, so representative sampling is more valuable than exhaustive per-resource browser QA.
- Admin authorization is centralized through `Admin::ApplicationController#authorize_admin`, while `/sidekiq` is protected directly in `config/routes.rb` through an editor-only route constraint.
- Standard admin `new`, `edit`, and `destroy` actions are disabled by `valid_action?`, making the custom case copy route the most meaningful mutation target in scope.
- The repo already uses both request specs and controller specs, so Phase 8 can follow nearby coverage instead of forcing a single test style.

### Integration Points
- Protected admin browser QA begins at `/readers/sign_in` using the mock Google sign-in path from `config/initializers/mock_omniauth.rb`.
- The representative admin sweep connects the shared admin layout to the `cases`, `readers`, `libraries`, `deployments`, and `ahoy events` dashboards.
- `admin/cases/:id/copy` connects `Admin::CasesController`, friendly case lookup, and `CaseCloner`.
- `/sidekiq` connects route-level editor gating with the mounted operational UI and must remain inaccessible to non-editors.

</code_context>

<specifics>
## Specific Ideas

- The representative browser sweep should center on admin root plus `cases`, `readers`, `libraries`, `deployments`, and `ahoy events`.
- Seed at least one populated representative resource in each major admin slice so table/show density and styling can actually be judged.
- Explicitly record whether `admin/ahoy/events` preserves newest-first ordering and whether `admin/cases/:id/copy` still redirects to the cloned admin case.
- Limit `/sidekiq` UI verification to the landing page after confirming the editor-only gate.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 8-Admin and Operations*
*Context gathered: 2026-05-11*
