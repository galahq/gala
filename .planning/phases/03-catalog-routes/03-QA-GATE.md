# Phase 3 Catalog Routes QA

**Phase:** 03-catalog-routes  
**Date:** 2026-05-04  
**Source:** `config/routes.rb`  
**Local target:** `http://localhost:3000`  
**Status:** passed

## Route Checklist

| Route group | Representative route | Expected result | Phase 3 result |
| --- | --- | --- | --- |
| Catalog root | `/` | Catalog React shell mounts with sane toolbar/layout | PASS; toolbar remains 40px, visible callouts/buttons include `.pt-*` and `.bp4-*` classes |
| Catalog React Router | `/catalog/search` | Rails serves catalog shell and React handles route | PASS by request spec and browser smoke |
| Catalog JSON | `/catalog/libraries.json`, `/catalog/languages.json` | JSON arrays without layout/pack failures | PASS by request specs |
| Search JSON | `/search.json`, `/search.json?q[]=...` | JSON array for catalog search consumers | PASS; unpopulated local search index now returns `[]` instead of 500 |
| Tags JSON | `/tags.json` | JSON array for keyword consumers | PASS by request spec |

## Browser Smoke

Browser tooling used `http://host.docker.internal:3000`.

| URL | Result |
| --- | --- |
| `/` | PASS; toolbar height `40`, no horizontal overflow, catalog buttons/callouts have Blueprint 4 class counterparts |
| `/catalog/search?q=zzzz-no-results` | PASS; no-results state rendered, submit button has `.bp4-button`/`.bp4-intent-success`, no `/search.json` 500 after fix |
| `/up` | Already covered by Phases 1-2 |

## Automated Tests

| Command | Result | Notes |
| --- | --- | --- |
| `yarn test app/javascript/catalog --runInBand` | PASS | 19 passed suites, 1 skipped suite, 99 passed tests, 3 skipped tests; includes existing shared Jest suite selection behavior |
| `docker compose exec -T web bundle exec rspec spec/requests/catalog_routes_spec.rb` | PASS | 7 examples, 0 failures |

## Changes Made

- Added explicit `.bp4-*` class counterparts to catalog hand-written Blueprint classes in:
  - `app/javascript/catalog/home/ValueProposition.jsx`
  - `app/javascript/catalog/home/WelcomeMessage.jsx`
  - `app/javascript/catalog/search_results/NoSearchResults.jsx`
  - `app/javascript/catalog/search_results/LanguageChooser.jsx`
  - `app/javascript/catalog/search_results/SearchForm.jsx`
- Added `spec/requests/catalog_routes_spec.rb` for catalog shell and JSON endpoints.
- Added a narrow `SearchController` fallback for the local case where `cases_search_index` exists but has not been populated.

## Non-Blocking Noise

- Historical browser-container HMR origin errors were resolved in the 2026-05-04 rerun after allowing `host.docker.internal` in Shakapacker dev-server config.
- Unauthenticated catalog root/search requests still produce expected `401` responses for user-specific JSON endpoints.
- Existing React lifecycle/key warnings remain visible in development.

## Revalidation 2026-05-04

Reason: rerun previously PASS catalog QA gates through Playwright MCP after the
Docker browser host was accepted by Shakapacker.

| Route | Browser/MCP result | HMR host/origin |
| --- | --- | --- |
| `/` | PASS: catalog root rendered at `http://host.docker.internal:3000/`; WDS started; existing unauthenticated JSON `401`s, React warnings, and local Mapbox style 404 remain non-blocking. | `invalidHostCount: 0` |
| `/catalog/search?q=zzzz-no-results` | PASS: catalog search shell rendered, no-results state visible, no `/search.json` 500. | `invalidHostCount: 0` |
| `/catalog/libraries.json` | PASS: `200`, JSON array. | `invalidHostCount: 0` |
| `/catalog/languages.json` | PASS: `200`, JSON includes English. | `invalidHostCount: 0` |
| `/search.json` | PASS: `200`, JSON case slug array. | `invalidHostCount: 0` |
| `/search.json?q[]=zzzz-no-results` | PASS: `200`, JSON `[]`. | `invalidHostCount: 0` |
| `/tags.json` | PASS: `200`, JSON array. | `invalidHostCount: 0` |

Retested automated gates:

| Command | Result | Notes |
| --- | --- | --- |
| `docker compose exec web bundle exec rspec spec/config/shakapacker_dev_server_spec.rb spec/requests/health_check_spec.rb spec/requests/public_utility_routes_spec.rb spec/requests/catalog_routes_spec.rb spec/controllers/cases_controller_spec.rb` | PASS | 27 examples, 0 failures |
| `docker compose exec -e NODE_ENV=test web yarn jest app/javascript/utility/__tests__/Toolbar.test.jsx app/javascript/shared/__tests__/blueprintAssetContract.test.js app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js app/javascript/catalog/home/__tests__/helpers.test.js --runInBand` | PASS | 4 suites, 12 tests. Running through `yarn test ...` without overriding `NODE_ENV` is not valid inside the compose service because it keeps `NODE_ENV=development` and prevents `babel-jest` from transforming import syntax. |
