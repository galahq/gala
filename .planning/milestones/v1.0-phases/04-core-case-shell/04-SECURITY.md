---
phase: 04
slug: core-case-shell
status: verified
threats_open: 0
asvs_level: 1
created: 2026-05-04T17:45:00Z
---

# Phase 04 — Security

Per-phase security contract for Core Case Shell route stabilization.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Anonymous browser to public case shell | Public users may load published case index/show/suffix routes. | Published case metadata and reader shell data. |
| Anonymous browser to protected case routes | Unauthenticated access to edit/copy/archive/settings/translations/deletion routes must not expose editor-only surfaces. | Redirects to Devise sign-in or Pundit denial paths. |
| Authenticated reader/editor to case mutations | Signed-in users may create or mutate case data only through Devise authentication, Pundit authorization, strong params, and lock checks. | Case titles, metadata, settings, publication state, archive/translation jobs. |
| Browser QA tooling to Docker app | Playwright/MCP reaches the Rails app through `host.docker.internal:3000` while project target remains `localhost:3000`. | Session cookies, route responses, console/network evidence. |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-04-01 | Information Disclosure / Authorization | Protected case route QA | mitigate | QA originally recorded anonymous redirect coverage and the editor-auth limitation; later UI/UAT gates now require Playwright/MCP to click `a.oauth-icon-google` and use `config/initializers/mock_omniauth.rb` before visually accepting protected routes. | closed |
| T-04-02 | Elevation of Privilege | Case controllers and policies | mitigate | `CasesController` authenticates all non-index/show actions, authorizes show/edit/update/destroy, and settings/deletion/archive/translation controllers call Devise/Pundit authorization. No Phase 4 implementation changes weakened these controls. | closed |
| T-04-03 | Tampering / Regression | Blueprint compatibility changes | mitigate | Phase 4 made no app code compatibility changes during execution; later Mapbox/docs-only quick tasks did not remove `.pt-*` classes or duplicate Blueprint CSS. UI review preserves narrow route-driven guidance. | closed |
| T-04-04 | Reliability / False Assurance | Local data and browser QA evidence | mitigate | `04-QA.md` records the selected published slug, missing editorship data, browser host substitution, route coverage, console/network classifications, feature-spec environment blocker, and supplemental controller spec. `04-UAT.md` completed with 5/5 passed. | closed |

---

## Accepted Risks Log

No accepted risks.

---

## Evidence

- `app/controllers/cases_controller.rb`: `before_action :authenticate_reader!, except: %i[index show]`; `show`, `edit`, `update`, and `destroy` authorize the case; update params are allow-listed.
- `app/controllers/cases/settings_controller.rb`: settings routes require `authenticate_reader!`, call `authorize @case`, and allow-list `:slug` and `:license`.
- `app/controllers/cases/deletions_controller.rb`: deletion confirmation requires `authenticate_reader!` and `authorize @case, :destroy?`.
- `app/controllers/archives_controller.rb`: archive route requires `authenticate_reader!` and `authorize @case`.
- `app/controllers/translations_controller.rb`: translation creation authorizes `@case, :update?`.
- `app/policies/case_policy.rb`: visibility and mutation paths are scoped through published, owned, enrolled, managed, library, or editor permissions.
- `.planning/phases/04-core-case-shell/04-QA.md`: route-derived QA evidence records protected-route redirects, limitations, and updated mock-login instructions for visual protected-route checks.
- `.planning/phases/04-core-case-shell/04-UAT.md`: Phase 4 UAT complete, 5 passed, 0 issues.
- `.planning/phases/04-core-case-shell/04-UI-REVIEW.md`: protected-route visual parity requires the Playwright/MCP `a.oauth-icon-google` mock login prelude before scoring protected pages.

## Verification Commands

| Command | Result | Notes |
|---------|--------|-------|
| `docker compose exec web bundle exec rspec spec/controllers/cases_controller_spec.rb` | pass | `5 examples, 0 failures`; confirms case create creates editorship/enrollment and case show/suffix routes return 200. |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-05-04 | 4 | 4 | 0 | Codex |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-05-04
