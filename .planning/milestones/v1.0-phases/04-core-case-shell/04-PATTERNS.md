# Phase 04 — Pattern Map

## Closest Existing Analogs

| Phase 4 Target | Closest Existing Analog | Pattern to Reuse |
|----------------|-------------------------|------------------|
| Route checklist and QA evidence | `.planning/phases/03-catalog-routes/03-01-PLAN.md` and prior phase QA notes style | Keep route-driven checklist small, explicit, and tied to `config/routes.rb`. |
| Case route behavior specs | `spec/controllers/cases_controller_spec.rb` | Use focused controller/request coverage for case shell status, redirects, and React Router handoff. |
| Browser case shell checks | `spec/features/viewing_a_case_spec.rb`, `spec/features/editing_a_case_spec.rb`, `spec/features/deleting_a_case_spec.rb`, `spec/features/publishing_a_case_spec.rb` | Use existing factories and feature coverage as references, but prefer browser QA evidence for local route group pass/fail. |
| Toolbar class contract | `app/javascript/utility/__tests__/Toolbar.test.jsx` | Preserve `.Toolbar__*` structure and paired `.pt-*`/`.bp4-*` class expectations. |
| Static Blueprint companion fixes | `app/views/cases/settings/*.haml`, `spec/requests/public_utility_routes_spec.rb` | Add `.bp4-*` companions alongside `.pt-*` where static Rails-rendered controls need coverage; do not remove legacy classes. |

## Data Flow

1. Rails route resolves a case slug through `CasesController`.
2. `CasesController#show` renders `app/views/cases/show.html.erb` for HTML or `Cases::ShowSerializer` for JSON.
3. `show.html.erb` serializes `window.caseData` and appends the `case` pack.
4. `app/javascript/packs/case.entry.jsx` mounts `app/javascript/Case.jsx`.
5. `Case.jsx` routes `/`, `/1`, `/conversation`, and other suffixes through React Router.
6. `StatusBar.jsx` exposes editor and shell actions using `Toolbar.jsx`.

## Planning Constraints

- Keep fixes narrow and route-driven.
- Prefer existing local case data for browser QA; do not require seed-data engineering unless no practical route sample exists.
- Do not expand into full Phase 5 nested interactions.
- Use request/controller specs to supplement browser auth gaps, not to silently replace all browser QA.
- Record selected slugs, routes, console/network findings, tests, and substitutions in a Phase 4 QA evidence artifact.
