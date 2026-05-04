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

- Browser-container HMR origin errors remain when using `host.docker.internal`.
- Unauthenticated catalog root/search requests still produce expected `401` responses for user-specific JSON endpoints.
- Existing React lifecycle/key warnings remain visible in development.
