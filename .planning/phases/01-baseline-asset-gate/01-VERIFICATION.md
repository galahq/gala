# Phase 1 Verification

**Phase:** 01-baseline-asset-gate  
**Date:** 2026-05-04  
**Status:** human_needed  
**No transition:** Phase 2 was not started.

## Automated Checks

| Check | Status | Evidence |
| --- | --- | --- |
| `curl -fsS http://localhost:3000/up` | PASS | Returned `OK` |
| `yarn test app/javascript/shared/__tests__/blueprintAssetContract.test.js app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js --runInBand` | PASS | 19 passed suites, 1 skipped suite, 99 passed tests, 3 skipped tests |
| `docker compose exec -T web bundle exec rspec spec/requests/health_check_spec.rb` | PASS | 1 example, 0 failures |

## Browser QA

Browser tooling reached the app through `http://host.docker.internal:3000` because the browser container could not connect to `http://localhost:3000`.

| Route | Status | Notes |
| --- | --- | --- |
| `/` | human review needed | Catalog/sign-in page rendered with Blueprint-styled controls; console/network noise recorded in `01-QA-GATE.md` |
| `/up` | PASS | Rendered plain `OK`; no console messages |
| `/cases/:slug` | substituted | No local `Case` rows were available in Docker DB |
| `/admin` | PASS with expected auth boundary | Unauthenticated access reached `403 Forbidden` |
| `/readers/sign_in` | human review needed | Sign-in form rendered; repeated HMR host-origin console errors due `host.docker.internal` |

## Human Review Items

- Decide whether the external Mapbox style `404` observed on `/` is acceptable pre-existing local-development noise for Phase 1 or a blocker for later catalog work.
- Decide whether the React runtime warning `Cannot update during an existing state transition` is acceptable pre-existing noise or blocks the baseline gate.
- Treat webpack-dev-server `Invalid Host/Origin header` as tooling-induced unless it reproduces in a normal user browser at `http://localhost:3000`.

## Outcome

The code/test baseline is verified, but the browser/manual QA gate is not marked passed. Phase 1 remains at `human_needed` and should not transition until the recorded browser noise is accepted or fixed.
