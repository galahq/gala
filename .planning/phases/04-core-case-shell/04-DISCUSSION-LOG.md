# Phase 4: Core Case Shell - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-04
**Phase:** 4-Core Case Shell
**Areas discussed:** Case-route QA sample

---

## Gray Areas Presented

| Option | Description | Selected |
|--------|-------------|----------|
| Case-route QA sample | Which concrete case slug/routes should define the pass? Should the plan require seeded examples for published, unpublished/editable, settings, translations, archive, and React suffix routes? | ✓ |
| Editor and toolbar behavior | How strict should we be around edit mode, publish/unpublish, save, options menu, spotlight, and content-item selection behavior before calling the shell stable? | |
| Legacy Blueprint class treatment | For mixed Rails/React case surfaces, should Phase 4 only patch visible regressions, or proactively add `.bp4-*` companions to obvious `.pt-*` controls in settings/delete/admin-style views? | |
| Data and auth assumptions | How should the plan handle missing local case data or credentials: create/refresh seed data, use closest existing records, or document substitutions and keep moving? | |

**User's choice:** Case-route QA sample
**Notes:** User selected only the route QA sample for discussion. Other areas remain available for planner discretion under the compatibility-first rules carried forward from prior phases.

---

## Case-route QA sample

### Route sample strictness

| Option | Description | Selected |
|--------|-------------|----------|
| Full core set | Cover one representative URL for each scoped route family: case index JSON, show shell, edit redirect, settings, archive, translations, copy, delete confirmation, and React suffix. | ✓ |
| Minimal smoke | Cover only show shell, edit redirect, settings, and one React suffix so planning stays fast. | |
| Data-driven only | Use whatever seeded/local records exist and document skipped route families instead of creating fixtures or setup. | |

**User's choice:** Full core set
**Notes:** Phase 4 should not be declared stable from a minimal smoke pass alone.

### Case data source

| Option | Description | Selected |
|--------|-------------|----------|
| Use existing local data first | Find a usable case slug from the local app/database, prefer a published case plus an editable case if available, and document any substitutions. | ✓ |
| Require seeded fixtures | Planning should include creating or refreshing deterministic local seed data before QA, so the same slug/routes are always available. | |
| Hybrid | Use existing local data for browser QA, but add request/controller specs with factories for route families that need stable coverage. | |

**User's choice:** Use existing local data first
**Notes:** Existing local data should be tried before introducing seed-data work.

### Authenticated coverage

| Option | Description | Selected |
|--------|-------------|----------|
| Require editor coverage | Use existing credentials/session setup if available so settings, edit redirect, copy, delete confirmation, publish/edit controls, and translations are tested as an editor. | ✓ |
| Unauthenticated plus request specs | Browser QA can verify redirects/login boundaries, while request specs cover authenticated behavior with factories. | |
| Unauthenticated only | Treat protected routes as passing if they redirect correctly, and defer authenticated browser coverage. | |

**User's choice:** Require editor coverage
**Notes:** Restricted routes need editor-authenticated behavior where central to the case shell.

### React Router suffix sampling

| Option | Description | Selected |
|--------|-------------|----------|
| Overview plus known shell suffixes | Verify `/cases/:slug`, one content-position route like `/cases/:slug/1`, and `/cases/:slug/conversation` when data/auth allows. | ✓ |
| Any one suffix | Verify only one non-root suffix proves Rails hands off to React Router. | |
| Exhaust nested routes later | Only verify `/cases/:slug` in Phase 4 and leave all suffix routes to Phase 5. | |

**User's choice:** Overview plus known shell suffixes
**Notes:** Phase 4 should sample real shell suffixes without expanding into full Phase 5 nested interaction coverage.

---

## the agent's Discretion

- Choose the exact local case slug(s) after inspecting available data.
- Choose targeted specs based on touched files and practical browser-auth coverage.
- Treat non-selected gray areas as planner discretion, bounded by prior locked decisions and route evidence.

## Deferred Ideas

- Full nested case interactions remain Phase 5.
- Broad Blueprint class cleanup remains Phase 9.
