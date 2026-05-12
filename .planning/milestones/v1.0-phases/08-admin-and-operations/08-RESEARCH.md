# Phase 8: Admin and Operations - Research

**Researched:** 2026-05-11
**Domain:** Rails Administrate dashboards, admin authorization, custom admin case copy, Ahoy admin event ordering, and Sidekiq route gating
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Admin Route Sampling
- **D-01:** Use a representative browser sweep instead of visiting every admin resource individually.
- **D-02:** The intended anchor browser sweep is admin root plus `cases`, `readers`, `libraries`, `deployments`, and `ahoy events`.
- **D-03:** Empty admin pages are acceptable if the shared shell renders correctly, but each major admin slice should include at least one populated representative resource.

### Auth and Verification Split
- **D-04:** Keep admin and operational auth/authorization checks mostly spec-driven.
- **D-05:** Use only minimal protected-surface browser QA on admin/editor-only routes; rely on request/controller specs for anonymous and non-editor denial behavior.
- **D-06:** Use a deliberate mix of request and controller specs based on existing nearby coverage and the behavior under test.

### Visual Parity Priorities
- **D-07:** Prioritize case admin pages and custom action surfaces for the closest visual parity review.
- **D-08:** Shared Administrate shell issues matter, but broad generic resource polish is secondary.
- **D-09:** `admin/ahoy/events` should get shared-shell coverage plus an explicit newest-first ordering check.

### Mutations and Operational Scope
- **D-10:** Treat `admin/cases/:id/copy` as the primary mutation path to exercise.
- **D-11:** Keep the rest of Phase 8 primarily read/auth focused unless a supposedly read-only admin route still exposes mutation behavior that clearly belongs in scope.
- **D-12:** Verify `/sidekiq` as editor-only and perform only a landing-page smoke test once inside.

### Data Setup Strategy
- **D-13:** Seed a small representative admin dataset up front so browser QA can inspect populated admin tables and show pages.
- **D-14:** Prefer factories/spec-backed setup for that seeded dataset where possible.
- **D-15:** Use minimal manual local records only if browser QA still needs them after the reproducible setup path is used.

### Carried Forward
- **D-16:** `config/routes.rb` remains the source of truth for route coverage.
- **D-17:** Protected browser QA should use the local sign-in flow at `/readers/sign_in` and the mock Google button `a.oauth-icon-google`.
- **D-18:** Keep fixes narrow and route-driven; avoid broad restyling or permission model changes unless a verified admin regression requires it.
- **D-19:** Existing unrelated console noise or local dev-server noise should be classified rather than treated as blocking unless visible behavior breaks.

### the agent's Discretion
- The exact seeded records and factories for the representative admin dataset.
- Whether a given auth/copy check is better served by a request spec or controller spec, provided the choice follows nearby repo patterns.

### Deferred Ideas (OUT OF SCOPE)
None - discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADM-01 | Admin root and Administrate resources render with usable styling after the global asset loading change. | The admin layout and most resource screens are Rails-rendered Administrate templates with shared index/show views, so representative shell coverage is more valuable than exhaustive per-resource browser passes. [VERIFIED: app/views/layouts/admin.html.erb, app/views/admin/application/index.html.erb, app/views/admin/application/show.html.erb] |
| ADM-02 | Admin case copy and nested admin resources keep expected authorization and routing behavior. | `Admin::ApplicationController` centralizes editor authorization and `Admin::CasesController#copy` is the meaningful custom mutation path in scope. [VERIFIED: app/controllers/admin/application_controller.rb, app/controllers/admin/cases_controller.rb] |
| ADM-03 | Sidekiq web route remains editor-only and is not broken by layout/style changes. | `/sidekiq` is mounted through an `authenticate :reader, ->(reader) { reader.has_role? :editor }` route constraint, so route-level access needs spec coverage plus a shallow in-browser smoke test once signed in as an editor. [VERIFIED: config/routes.rb] |
| QA-01 | Each phase includes a route checklist derived from `config/routes.rb`. | Phase 8 route coverage must be built from the admin namespace resources, `admin/cases/:id/copy`, `admin/ahoy/events`, and `/sidekiq`. [VERIFIED: config/routes.rb] |
| QA-02 | Each phase performs browser QA on representative routes with console and network checks. | Use representative route-backed admin resources plus `/sidekiq` landing-page smoke coverage and classify console/network noise. [VERIFIED: AGENTS.md, 08-CONTEXT.md] |
| QA-03 | Each phase runs targeted automated tests where practical. | Existing repo patterns support focused request/controller specs and factory-backed auth/data setup for admin and operational routes. [VERIFIED: .planning/codebase/TESTING.md, spec/requests/reader_management_routes_spec.rb, spec/requests/deployment_integration_routes_spec.rb] |
| QA-04 | Each phase commits only after QA passes or documented non-blocking exceptions exist. | The QA artifact should explicitly record pass/blocked status for each plan before phase completion. [VERIFIED: AGENTS.md, prior phase plan structure] |
</phase_requirements>

## Summary

Phase 8 is primarily a Rails/Administrate stabilization pass, not a React-heavy one. The highest-value route work is concentrated in three places: the shared admin shell rendered by `app/views/layouts/admin.html.erb` and the generic Administrate templates, the custom `admin/cases/:id/copy` mutation surfaced through the admin case collection partial, and the editor-only `/sidekiq` mount. [VERIFIED: app/views/layouts/admin.html.erb, app/views/admin/application/index.html.erb, app/views/admin/cases/_collection.html.erb, config/routes.rb]

The main planning wrinkle is that the discussed representative set included `libraries`, but `config/routes.rb` does not currently expose `admin/libraries` inside the admin namespace even though an `Admin::LibrariesController` and dashboard exist. Because `config/routes.rb` is the source of truth, planning should record that mismatch and substitute a route-backed admin resource such as `enrollments` or `reading_lists` for browser QA rather than assuming a nonexistent route. [VERIFIED: config/routes.rb, app/controllers/admin/libraries_controller.rb]

**Primary recommendation:** split Phase 8 into one plan for checklist/spec/data-setup groundwork and one plan for representative browser QA, copy-path validation, Sidekiq smoke coverage, and final QA evidence. Keep auth boundaries spec-first, use factories to create a small editor/case/deployment/reader/event dataset, and only make route-scoped view fixes where browser QA proves a regression.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Admin route authorization | Rails backend | Route constraint | `Admin::ApplicationController` handles editor checks for Administrate controllers, while `/sidekiq` is gated directly in routes. [VERIFIED: app/controllers/admin/application_controller.rb, config/routes.rb] |
| Shared admin presentation | Rails views | Administrate | The admin toolbar/layout and the generic index/show templates shape most of the visible admin UI. [VERIFIED: app/views/layouts/admin.html.erb, app/views/admin/application/index.html.erb, app/views/admin/application/show.html.erb] |
| Admin case copy mutation | Rails backend | Admin collection partial | The custom collection partial exposes the copy action and `Admin::CasesController#copy` executes it through `CaseCloner`. [VERIFIED: app/views/admin/cases/_collection.html.erb, app/controllers/admin/cases_controller.rb] |
| Ahoy event listing behavior | Rails backend | Administrate dashboard | `Admin::Ahoy::EventsController#scoped_resource` orders by descending time, while the dashboard defines the visible columns. [VERIFIED: app/controllers/admin/ahoy/events_controller.rb, app/dashboards/ahoy/event_dashboard.rb] |
| Representative admin dataset | Test factories | Local browser runtime | Existing factories for readers, cases, groups, deployments, visits, and Ahoy events can build reproducible admin-visible data for request specs and browser QA. [VERIFIED: spec/factories/readers.rb, spec/factories/cases.rb, spec/factories/groups.rb, spec/factories/deployments.rb, spec/factories/visits.rb, spec/factories/ahoy_events.rb] |

## Project Constraints (from AGENTS.md)

- Use `.planning/` artifacts for GSD planning. [VERIFIED: AGENTS.md]
- Work phases sequentially from `.planning/ROADMAP.md`. [VERIFIED: AGENTS.md]
- Use `config/routes.rb` as the source of truth for route coverage. [VERIFIED: AGENTS.md]
- Use `localhost:3000` for browser QA. [VERIFIED: AGENTS.md]
- Check browser console and network errors before marking a route group complete. [VERIFIED: AGENTS.md]
- Run targeted tests for touched files; relevant commands include `yarn test`, `bundle exec rspec`, `./run-rspec.sh`, and `bundle exec rake test:unit`. [VERIFIED: AGENTS.md]
- Commit after each phase QA gate passes. [VERIFIED: AGENTS.md]
- Keep fixes narrow and route-driven; avoid broad redesigns or unrelated dependency upgrades. [VERIFIED: AGENTS.md]
- The visual target remains the approximate BlueprintJS 2.3.1-era Gala experience, not a Blueprint 4 redesign. [VERIFIED: AGENTS.md]

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Rails | 8.1.3 | Routing, controllers, views, ActiveRecord | Phase 8 is almost entirely Rails-rendered admin and operational routes. [VERIFIED: Gemfile.lock, config/routes.rb] |
| Administrate | installed | Admin dashboards and shared index/show scaffolding | Existing admin namespace controllers and dashboards rely on Administrate conventions. [VERIFIED: app/controllers/admin/application_controller.rb, app/dashboards/*] |
| Devise | 4.9.4 | Reader authentication helpers and request test `sign_in` support | Admin and Sidekiq access depend on authenticated readers, and existing request specs already use Devise test helpers. [VERIFIED: Gemfile.lock, spec/requests/reader_management_routes_spec.rb] |
| Rolify / role helpers | installed | Editor role checks | Both admin and Sidekiq access depend on `reader.has_role?(:editor)`. [VERIFIED: app/controllers/admin/application_controller.rb, config/routes.rb, spec/factories/readers.rb] |
| Sidekiq | installed | Operational web UI at `/sidekiq` | The mounted Sidekiq web UI is part of the Phase 8 route group. [VERIFIED: config/routes.rb, Gemfile.lock] |
| Ahoy | installed | Event tracking model surfaced in admin | `admin/ahoy/events` exposes Ahoy event rows and ordering behavior. [VERIFIED: app/controllers/admin/ahoy/events_controller.rb, app/dashboards/ahoy/event_dashboard.rb] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| RSpec Rails | 7.1.0 | Request/controller specs | Use for admin auth boundaries, copy-route behavior, and `/sidekiq` access. [VERIFIED: Gemfile.lock, spec/requests, spec/controllers] |
| FactoryBot Rails | installed | Reproducible data setup | Use to create editor readers, cases, groups, deployments, visits, and Ahoy events for specs and browser QA. [VERIFIED: spec/factories] |
| Capybara | 3.40.0 | Existing feature helpers | Not the primary gate; Playwright/browser QA and request/controller specs remain preferred for this phase. [VERIFIED: Gemfile.lock, .planning/codebase/TESTING.md] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Exhaustive per-resource admin browser QA | Representative sweep over shared-shell resources | Better matches the shared Administrate template architecture and the locked decisions. [VERIFIED: 08-CONTEXT.md, app/views/admin/application/index.html.erb] |
| Manual console/browser setup only | Factory-backed setup plus minimal manual assist | More reproducible and fits the user’s data-setup decision. [VERIFIED: 08-CONTEXT.md, spec/factories/*] |
| Treating `admin/libraries` as mandatory browser coverage | Substitute a route-backed admin resource and record the route mismatch | `config/routes.rb` does not expose `admin/libraries`, so forcing it would violate the route-source-of-truth rule. [VERIFIED: config/routes.rb, app/controllers/admin/libraries_controller.rb] |
| Broad admin restyling | Narrow shared-shell or case-surface fixes only when QA proves a regression | Matches the route-driven stabilization goal. [VERIFIED: AGENTS.md, 08-CONTEXT.md] |

**Installation:** No dependency changes are recommended for Phase 8. [VERIFIED: AGENTS.md]

## Phase 8 Route Checklist

| Route Area | Representative Paths | Primary QA Mode |
|------------|----------------------|-----------------|
| Admin root and generic resources | `/admin`, representative `/admin/cases`, `/admin/readers`, `/admin/deployments`, and one additional route-backed admin resource from `config/routes.rb` | Browser representative sweep plus targeted auth specs. [VERIFIED: config/routes.rb, app/views/admin/application/index.html.erb] |
| Custom copy action | `POST /admin/cases/:id/copy` | Request/controller spec plus browser validation if safe local data exists. [VERIFIED: config/routes.rb, app/controllers/admin/cases_controller.rb, app/views/admin/cases/_collection.html.erb] |
| Ahoy events | `/admin/ahoy/events` | Browser shell check plus explicit ordering verification and request/controller support if needed. [VERIFIED: config/routes.rb, app/controllers/admin/ahoy/events_controller.rb] |
| Sidekiq | `/sidekiq` | Request spec for access boundary plus landing-page browser smoke test as editor. [VERIFIED: config/routes.rb] |

## Architecture Patterns

### Pattern 1: Shared Administrate Shell First

**What:** Most admin resources share the same layout and generic index/show templates, so fixing shared shell regressions can repair multiple resources at once. [VERIFIED: app/views/layouts/admin.html.erb, app/views/admin/application/index.html.erb, app/views/admin/application/show.html.erb]

**When to use:** Browser QA or narrow CSS/view fixes for admin headers, search, table density, pagination, and generic show pages.

### Pattern 2: Custom Resource Collection Action

**What:** The case admin collection overrides the generic table partial to expose a copy action via `valid_action?(:copy, ...)`, and the controller performs a redirect to the cloned admin case. [VERIFIED: app/views/admin/cases/_collection.html.erb, app/controllers/admin/cases_controller.rb]

**When to use:** Any spec or browser validation touching `admin/cases/:id/copy`.

### Pattern 3: Request-Spec Route Stabilization

**What:** Recent stabilization phases use focused request specs with factories and Devise `sign_in` helpers for route-level behavior and visible marker assertions. [VERIFIED: spec/requests/reader_management_routes_spec.rb, spec/requests/deployment_integration_routes_spec.rb]

**When to use:** Admin authorization branches, response status assertions, route gating, and non-visual copy/Sidekiq behavior.

### Pattern 4: Factory-Backed Operational Data

**What:** Existing factories can create editor readers, cases, groups, deployments, visits, and Ahoy events without adding seed infrastructure. [VERIFIED: spec/factories/readers.rb, spec/factories/cases.rb, spec/factories/groups.rb, spec/factories/deployments.rb, spec/factories/visits.rb, spec/factories/ahoy_events.rb]

**When to use:** Building the representative admin dataset required by Phase 8.

### Anti-Patterns to Avoid

- **Assuming every admin controller has a route:** `config/routes.rb` must win over unused admin controllers/dashboards. [VERIFIED: AGENTS.md, config/routes.rb]
- **Using only anonymous denial checks as admin coverage:** Phase 8 requires real editor-visible QA for representative admin routes and `/sidekiq`. [VERIFIED: 08-CONTEXT.md]
- **Turning `/sidekiq` into an infra audit:** the locked scope is landing-page smoke coverage only. [VERIFIED: 08-CONTEXT.md]
- **Applying broad styling changes across all admin templates before a verified regression exists:** keep fixes route-driven and narrow. [VERIFIED: AGENTS.md, 08-CONTEXT.md]
