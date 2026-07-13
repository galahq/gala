# Phase 7 QA Gate - Deployments and Integrations

Status: PASS

Date: 2026-05-05
Route checklist source: `config/routes.rb`
Local target: `http://localhost:3000`
Browser tooling target: `http://host.docker.internal:3000`

## Route Coverage

| Route group | Evidence | Status |
| --- | --- | --- |
| `GET /deployments` | Browser QA rendered authenticated "Teach with Cases" empty-state surface for mock Google admin; request spec verifies admin deployment list with paired `pt-*`/`bp4-*` button classes. | PASS |
| `GET /deployments/:id` | Request spec verifies authorized show page and breadcrumb paired classes. | PASS |
| `GET /deployments/new` | Browser QA rendered the selected-case deployment form for case slug `3880fdc8-0a48-4e5f-b146-9deffd7f9c22`; request spec verifies paired card classes. | PASS |
| `POST /deployments` | Request spec verifies deployment creation, redirect anchor, and admin membership creation with the same CSRF request-spec setup used by adjacent route specs. | PASS |
| `GET /deployments/:id/edit` | Request spec verifies authorized edit pack shell renders. `bin/shakapacker` compiled `js/deployment.js` successfully. | PASS |
| `PATCH /deployments/:id` | Request spec verifies JSON customization update and redirect payload. | PASS |
| `GET /deployments/:deployment_id/submissions` | Request spec verifies authorized CSV export. | PASS |
| `POST /groups/:group_id/canvas_deployments` | Request spec verifies selection-state guard redirects without creating a Canvas deployment. | PASS |
| `GET /authentication_strategies/config/lti` | Request spec verifies LTI XML config response. | PASS |
| `POST /catalog/content_items` | Controller spec verifies real LTI launch validation; request spec verifies invalid launch redirect and route/session behavior after successful validation. | PASS |
| `GET /sparql`, `GET /sparql/:id` | Existing SPARQL request coverage rerun with Phase 7 suite. | PASS |

## Browser QA

- Auth: `/readers/sign_in` using mock Google login (`a.oauth-icon-google`) to `Developer Admin` / `dev@learnmsc.org`.
- `GET /deployments`: rendered signed-in nav, "Teach with Cases", deployment guidance, search controls, and empty teaching state.
- `GET /deployments/new?case_slug=3880fdc8-0a48-4e5f-b146-9deffd7f9c22`: rendered selected case title, study group selector, and create button.
- Console/network classification: no deployment-specific blocking failure. Existing local dev noise remains: stale dev-server vendor chunk 404/MIME pair and styled-components object-form `attrs({})` deprecation warnings from shared header components.

## Automated Verification

- `docker compose exec -T web bundle exec rspec spec/requests/deployment_integration_routes_spec.rb spec/controllers/content_items_controller_spec.rb` -> 13 examples, 0 failures.
- `docker compose exec -T web bundle exec rspec spec/requests/deployment_integration_routes_spec.rb spec/requests/wikidata_sparql_routes_spec.rb spec/controllers/content_items_controller_spec.rb` -> 19 examples, 0 failures.
- `docker compose exec -T web bin/shakapacker` -> webpack compiled successfully, including `js/deployment.js`.

## Non-Blocking Test Notes

- `docker compose exec -T web yarn test --runInBand` remains blocked by repo-level Jest/Babel configuration: most suites fail before running with `SyntaxError: Cannot use import statement outside a module`. `app/javascript/shared/__tests__/blueprintAssetContract.test.js` still passes in that run. This is not specific to the Phase 7 deployment edits.
