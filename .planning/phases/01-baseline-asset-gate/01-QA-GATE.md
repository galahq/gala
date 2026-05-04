# Phase 1 Baseline Asset Gate QA

**Phase:** 01-baseline-asset-gate  
**Date:** 2026-05-04  
**Source:** `config/routes.rb`  
**Local target:** `http://localhost:3000`  
**Status:** human_needed

## Route Checklist

Source: `config/routes.rb`

| Route group | Representative route | Expected result | Phase 1 result |
| --- | --- | --- | --- |
| Catalog root | `/` | Catalog home renders through Rails layout and global packs | Rendered in browser at `http://host.docker.internal:3000/`; visual smoke shows Gala catalog/sign-in page with Blueprint-styled controls, but console/network noise requires human review |
| Health endpoint | `/up` | Plain text `OK` without authentication | PASS via `curl`, RSpec, and browser snapshot |
| Case route sample | `/cases/:slug` | Known case renders if local data exists | Substituted; no local `Case` rows found |
| Auth/admin sample | `/admin` or `/readers/sign_in` | Admin is protected or sign-in renders without asset failures | `/admin` redirects/renders `403`; `/readers/sign_in` renders sign-in form, but HMR host-origin noise requires human review |

## Representative URLs

| URL | Reason | Result |
| --- | --- | --- |
| `http://localhost:3000/` | Baseline catalog route and global Blueprint styling check | Browser tooling used `http://host.docker.internal:3000/`; rendered Gala catalog/sign-in page |
| `http://localhost:3000/up` | Local server and health endpoint check | PASS: `OK` |
| `http://localhost:3000/cases/:slug` | Known case route when local data exists | Not run; local DB query found no `Case` rows |
| `http://localhost:3000/admin` | Protected admin/auth route when reachable | Reached `403 Forbidden`, expected for unauthenticated admin access |
| `http://localhost:3000/readers/sign_in` | Substitute auth route if admin credentials are unavailable | Rendered sign-in form with styled inputs/buttons |

## Browser Result

Automated browser QA used Playwright through the available browser MCP. Because that browser runs in a separate container, route URLs used `host.docker.internal:3000`; direct browser navigation to `localhost:3000` from that container was refused.

Observed:
- `/` rendered the Gala catalog/sign-in baseline with Blueprint-styled form controls and nav.
- `/up` rendered plain `OK` with no console messages.
- `/admin` rendered/redirected to `403 Forbidden` while unauthenticated.
- `/readers/sign_in` rendered the sign-in form and Google sign-in button.

Status: `human_needed` because console/network output is not clean enough to mark the gate passed without deciding whether the observed noise is pre-existing/non-blocking.

## Console Issues

Observed console items:
- `401 Unauthorized` API responses on unauthenticated catalog page: `profile.json`, `enrollments.json`, `saved_reading_lists.json`, `managerships.json`.
- Repeated `[webpack-dev-server] Invalid Host/Origin header` and reconnect logs when browser tooling used `host.docker.internal:3000`.
- React 16 lifecycle deprecation warnings for React Router components.
- React warning: `Cannot update during an existing state transition`.
- Mapbox style load failure logged from vendor bundle after external style URL returned `404`.
- Chrome verbose autocomplete warning for sign-in inputs.

No console evidence of missing Shakapacker pack files or missing Blueprint package CSS was observed.

## Network Issues

Observed network items:
- `/up` returned `200 OK`.
- `/admin` reached `/403` with `403 Forbidden`, expected while unauthenticated.
- Unauthenticated JSON endpoints returned `401 Unauthorized` from the catalog page.
- External Mapbox style request returned `404`.
- Typekit/font, Ahoy, and mini-profiler requests returned `200`.

No failed local pack, local CSS, local font, or unexpected local static asset request was identified in the browser network list.

## Screenshots

Captured browser-tool screenshot for `/` as `phase1-root.png` in the Playwright output area. It showed the Gala catalog/sign-in page with Blueprint-styled controls. No repository screenshot was committed because the visual issue is not ambiguous enough to require a tracked binary artifact.

## Automated Tests

| Command | Result | Notes |
| --- | --- | --- |
| `curl -fsS http://localhost:3000/up` | PASS | Returned `OK`; required localhost network access from sandbox |
| `yarn test app/javascript/shared/__tests__/blueprintAssetContract.test.js app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js --runInBand` | PASS | 19 passed suites, 1 skipped suite, 99 passed tests, 3 skipped tests; pre-existing React key warning in `FormattedList` |
| `docker compose exec -T web bundle exec rspec spec/requests/health_check_spec.rb` | PASS | 1 example, 0 failures; used Docker because host Ruby is 2.6.10 and Gemfile requires 4.0.3 |

## Substitutions

- Case route sample: substituted with documented data check because `Case.limit(5).pluck(:slug)` returned no slugs in the local Docker database.
- Auth/admin route: `/admin` confirmed unauthenticated `403`; `/readers/sign_in` used as reachable auth substitute.
- Browser host: used `http://host.docker.internal:3000` in Playwright because the browser container could not reach `http://localhost:3000`.

## Blocking Issues

- Browser QA cannot be marked passed without a human decision on whether the observed console/network noise is acceptable pre-existing development noise.
- External Mapbox style URL returned `404` during root catalog render.
- Webpack dev server HMR reports `Invalid Host/Origin header` under browser-container access via `host.docker.internal`.

## Non-Blocking Pre-Existing Noise

- Host Ruby mismatch: direct `bin/rails s` failed with Ruby 2.6.10 while Gemfile requires Ruby 4.0.3. Docker Compose is the documented local path and was already running.
- Docker Compose web/db/redis services were running before QA.
- RSpec emitted Rails 8.2 deprecation warnings for existing configuration/routes.
- Jest emitted a pre-existing React key warning in `FormattedList`.
- Browser emitted existing React 16 lifecycle warnings.
- Unauthenticated catalog requests returned expected `401` responses for user-specific JSON endpoints.

## Commit Hash

Plan commits recorded so far:
- `6fd13099` - asset contract test coverage
- `a1b91c97` - Plan 01 summary
- `d3365d1f` - namespace bridge RED coverage
- `c2ec0986` - namespace bridge observer fix
- `911c4968` - Plan 02 summary
- `7d152229` - initial QA gate artifact
- `5a81e56e` - QA verification evidence and `human_needed` status
- `3f61f76b` - Plan 03 summary

Final QA evidence and summary commits are recorded in the plan summary.
