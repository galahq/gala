# Phase 8: Admin and Operations - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-11
**Phase:** 8-Admin and Operations
**Areas discussed:** Admin route sampling depth, Protected-route verification split, Admin visual parity focus, Risky mutations and copy flow, Data setup strategy, Sidekiq verification depth, Ahoy events coverage style, Empty-state tolerance, Representative resource mix, Spec target level, Dataset creation path, Sidekiq tab scope

---

## Admin route sampling depth

| Option | Description | Selected |
|--------|-------------|----------|
| Representative sweep | Browser-QA admin root plus a small high-signal set, then rely on targeted specs for the rest. | ✓ |
| Broad manual pass | Browser-QA most or all admin resources individually. | |
| Critical-path only | Browser-QA only admin root, cases, and ahoy events, then use specs for nearly everything else. | |

**User's choice:** Representative sweep
**Notes:** The admin surface is mostly shared Administrate shell, so the browser pass should stay representative rather than exhaustive.

---

## Protected-route verification split

| Option | Description | Selected |
|--------|-------------|----------|
| Editor browser first, spec for negative cases | Sign in as the mock admin for reachable editor surfaces; use specs for denied branches. | |
| Mostly spec-driven | Rely on specs for auth boundaries and do only minimal browser checks. | ✓ |
| Dual-path manual QA | Browser-check both allowed and denied behavior wherever practical, plus specs. | |

**User's choice:** Mostly spec-driven
**Notes:** Phase 8 should not spend time manually browser-checking every denial path.

---

## Admin visual parity focus

| Option | Description | Selected |
|--------|-------------|----------|
| Shared shell first | Focus on the admin layout, nav/header, search, table density, pagination, and generic form/show pages. | |
| Case/admin actions first | Prioritize case admin pages and any page with custom links/actions like copy flows. | ✓ |
| Operational screens first | Prioritize ahoy events and Sidekiq appearance/usability over general Administrate polish. | |

**User's choice:** Case/admin actions first
**Notes:** Shared shell matters, but case admin pages and custom action surfaces deserve the closest parity attention.

---

## Risky mutations and copy flow

| Option | Description | Selected |
|--------|-------------|----------|
| Copy-focused mutation check | Treat `admin/cases/:id/copy` as the main mutation to exercise. | ✓ |
| Broader mutation audit | Inspect and spec any admin resource path that still mutates despite disabled standard actions. | |
| No browser mutations | Verify copy and any other writes only through specs. | |

**User's choice:** Copy-focused mutation check
**Notes:** Most admin resources are effectively read-only here; the custom copy action is the real mutation risk.

---

## Data setup strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Use existing data first, create only minimal disposable records when necessary | Keep setup narrow while still enabling meaningful QA. | |
| Existing data only | Accept empty pages and rely on specs instead of creating records. | |
| Seed representative admin data proactively | Create a small admin-focused dataset up front for consistent populated pages. | ✓ |

**User's choice:** Seed representative admin data proactively
**Notes:** The browser pass should not depend on chance local data quality.

---

## Sidekiq verification depth

| Option | Description | Selected |
|--------|-------------|----------|
| Access control plus basic UI smoke test | Confirm editor-only access, then verify the main Sidekiq page renders and is basically usable. | ✓ |
| Access control only | Verify allowed/denied behavior and stop there. | |
| Deeper operational pass | Inspect multiple Sidekiq tabs/views beyond the landing page. | |

**User's choice:** Access control plus basic UI smoke test
**Notes:** Enough to cover both the route boundary and the visible operational surface without turning this into infra testing.

---

## Ahoy events coverage style

| Option | Description | Selected |
|--------|-------------|----------|
| Shared-shell plus ordering check | Verify the admin shell and confirm events appear newest-first. | ✓ |
| Shared-shell only | Treat it like any other representative admin page. | |
| Detailed events QA | Inspect ordering plus event readability/details more deeply. | |

**User's choice:** Shared-shell plus ordering check
**Notes:** The controller has custom ordering behavior, so that should be explicitly checked.

---

## Empty-state tolerance

| Option | Description | Selected |
|--------|-------------|----------|
| Empty pages are acceptable if the shell renders, but at least one populated representative resource is required in each major admin slice | Balanced browser QA rule. | ✓ |
| Empty pages are acceptable everywhere | Layout-only checks are enough. | |
| Require populated examples for every representative resource | Stronger confidence, but more setup work. | |

**User's choice:** Empty pages are acceptable if the shell renders, but at least one populated representative resource is required in each major admin slice
**Notes:** The phase should see real populated content somewhere in each major slice without overcommitting to exhaustive seeding.

---

## Representative resource mix

| Option | Description | Selected |
|--------|-------------|----------|
| Cases + readers + libraries + deployments + ahoy events | Covers custom copy flow, user/admin tables, content/library management, deployment surfaces, and Ahoy scope. | ✓ |
| Cases + readers + groups + communities + ahoy events | Shifts the sweep toward community/group administration. | |
| Cases + libraries + reading lists + deployments + ahoy events | Shifts the sweep toward content-management surfaces. | |

**User's choice:** Cases + readers + libraries + deployments + ahoy events
**Notes:** This is the anchor set for the representative browser sweep.

---

## Spec target level

| Option | Description | Selected |
|--------|-------------|----------|
| Request-spec first | Prefer request specs for admin auth and copy-route behavior, falling back to controller specs only when clearly cheaper. | |
| Controller-spec first | Prefer controller specs for speed and narrower setup. | |
| Deliberate mix | Choose per route based on existing nearby coverage without a fixed default bias. | ✓ |

**User's choice:** Deliberate mix
**Notes:** The repo already has both test styles, so Phase 8 should follow the most natural nearby coverage.

---

## Dataset creation path

| Option | Description | Selected |
|--------|-------------|----------|
| Factories/spec-backed setup where possible, minimal manual records only if browser QA needs them | Reproducible first, practical fallback second. | ✓ |
| Manual local setup | Create records directly in the local app or console and document them. | |
| Existing app flows only | Create needed data only through normal app flows. | |

**User's choice:** Factories/spec-backed setup where possible, minimal manual records only if browser QA needs them
**Notes:** Reproducible setup is preferred, but the browser pass may still need a small manual assist.

---

## Sidekiq tab scope

| Option | Description | Selected |
|--------|-------------|----------|
| Landing page only | Confirm the main Sidekiq page loads and is usable, without checking additional tabs. | ✓ |
| Landing page plus one core tab | Confirm the main page and one additional tab like Queues, Busy, or Retries. | |
| Several tabs | Inspect multiple Sidekiq tabs/views. | |

**User's choice:** Landing page only
**Notes:** The Sidekiq smoke test should stay shallow.

---

## the agent's Discretion

- Exact seeded records and factories for the representative admin dataset.
- Per-route choice of request spec vs controller spec where nearby coverage suggests one is cheaper or clearer.

## Deferred Ideas

None.
