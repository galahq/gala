# Phase 1 Verification

**Phase:** 01-baseline-asset-gate  
**Date:** 2026-05-04  
**Status:** passed  
**Transition:** Phase 1 baseline gate may proceed to Phase 2.

## Automated Checks

| Check | Status | Evidence |
| --- | --- | --- |
| `curl -fsS http://localhost:3000/up` | PASS | Returned `OK` |
| `yarn test app/javascript/utility/__tests__/Toolbar.test.jsx app/javascript/shared/__tests__/blueprintAssetContract.test.js app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js --runInBand` | PASS | 19 passed suites, 1 skipped suite, 99 passed tests, 3 skipped tests |
| `docker compose exec -T web bundle exec rspec spec/requests/health_check_spec.rb` | PASS | 1 example, 0 failures |

## Browser QA

Browser tooling reached the app through `http://host.docker.internal:3000` because the browser container could not connect to `http://localhost:3000`.

| Route | Status | Notes |
| --- | --- | --- |
| `/` | PASS | Catalog/sign-in page rendered with Blueprint-styled controls; user-reported oversized navbar was fixed and verified at 40px |
| `/up` | PASS | Rendered plain `OK`; no console messages |
| `/cases/:slug` | substituted | No local `Case` rows were available in Docker DB |
| `/admin` | PASS with expected auth boundary | Unauthenticated access reached `403 Forbidden` |
| `/readers/sign_in` | PASS | Sign-in form rendered; repeated HMR host-origin console errors due `host.docker.internal` are tooling-induced |

## Corrective Visual Gate

The user rejected the first root-route browser pass because the navbar was too tall. Follow-up inspection found the toolbar groups stacked vertically because the styled `MaxWidthContainer` wrapper no longer exposed the `.MaxWidthContainer` class consumed by `Toolbar.sass`.

Fix and evidence:
- `Toolbar.jsx` passes `className="MaxWidthContainer"` to the wrapper.
- `Toolbar.test.jsx` asserts the stable wrapper contract under `.Toolbar__bar`.
- Browser measurement after refresh: `.Toolbar__bar` height `40`, wrapper display `flex`, all `.Toolbar__group` tops `70.875`.
- Screenshot captured by browser tooling as `toolbar-fixed-root.png`.

## Remaining Non-Blocking Noise

- External Mapbox style `404` observed on `/`; defer to catalog-route phase unless it blocks visible UI.
- React runtime warning `Cannot update during an existing state transition`; defer unless tied to a route regression.
- Historical Webpack-dev-server `Invalid Host/Origin header`; resolved in the 2026-05-04 rerun after allowing `host.docker.internal` in Shakapacker dev-server config.

## Revalidation 2026-05-04

Playwright MCP reran the Phase 1 PASS browser routes through
`http://host.docker.internal:3000`.

| Route | Status | Notes |
| --- | --- | --- |
| `/` | PASS | Catalog root rendered; WDS started; `Invalid Host/Origin header` did not recur. |
| `/up` | PASS | `200 OK`, body `OK`, no console messages. |
| `/admin` | PASS with expected auth boundary | Final route `/403`, no HMR host/origin errors. |
| `/readers/sign_in` | PASS | Sign-in form and Google mock-login button rendered, no HMR host/origin errors. |

Automated gate rerun:

- `docker compose exec web bundle exec rspec spec/config/shakapacker_dev_server_spec.rb spec/requests/health_check_spec.rb spec/requests/public_utility_routes_spec.rb spec/requests/catalog_routes_spec.rb spec/controllers/cases_controller_spec.rb` — PASS, 27 examples, 0 failures.
- `docker compose exec -e NODE_ENV=test web yarn jest app/javascript/utility/__tests__/Toolbar.test.jsx app/javascript/shared/__tests__/blueprintAssetContract.test.js app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js app/javascript/catalog/home/__tests__/helpers.test.js --runInBand` — PASS, 4 suites, 12 tests.

## Outcome

Phase 1 is verified after the corrective toolbar pass. Proceed to Phase 2.
