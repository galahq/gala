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
- Webpack-dev-server `Invalid Host/Origin header`; caused by browser-container access through `host.docker.internal`, not normal `localhost:3000`.

## Outcome

Phase 1 is verified after the corrective toolbar pass. Proceed to Phase 2.
