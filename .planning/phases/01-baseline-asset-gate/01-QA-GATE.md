# Phase 1 Baseline Asset Gate QA

**Phase:** 01-baseline-asset-gate  
**Date:** 2026-05-04  
**Source:** `config/routes.rb`  
**Local target:** `http://localhost:3000`  
**Status:** in_progress

## Route Checklist

Source: `config/routes.rb`

| Route group | Representative route | Expected result | Phase 1 result |
| --- | --- | --- | --- |
| Catalog root | `/` | Catalog home renders through Rails layout and global packs | Pending browser QA |
| Health endpoint | `/up` | Plain text `OK` without authentication | Pending curl/RSpec |
| Case route sample | `/cases/:slug` | Known case renders if local data exists | Pending data check |
| Auth/admin sample | `/admin` or `/readers/sign_in` | Admin is protected or sign-in renders without asset failures | Pending browser QA |

## Representative URLs

| URL | Reason | Result |
| --- | --- | --- |
| `http://localhost:3000/` | Baseline catalog route and global Blueprint styling check | Pending |
| `http://localhost:3000/up` | Local server and health endpoint check | Pending |
| `http://localhost:3000/cases/:slug` | Known case route when local data exists | Pending data check |
| `http://localhost:3000/admin` | Protected admin/auth route when reachable | Pending |
| `http://localhost:3000/readers/sign_in` | Substitute auth route if admin credentials are unavailable | Pending |

## Browser Result

Pending.

## Console Issues

Pending.

## Network Issues

Pending.

## Screenshots

Pending. Screenshots are only required when visual judgment is ambiguous.

## Automated Tests

| Command | Result | Notes |
| --- | --- | --- |
| `curl -fsS http://localhost:3000/up` | Pending | Verifies local app availability |
| `yarn test app/javascript/shared/__tests__/blueprintAssetContract.test.js app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js --runInBand` | Pending | Verifies Phase 1 frontend baseline tests |
| `bundle exec rspec spec/requests/health_check_spec.rb` | Pending | Verifies `/up` behavior through Rails request spec |

## Substitutions

Pending data and credential checks.

## Blocking Issues

Pending.

## Non-Blocking Pre-Existing Noise

Pending.

## Commit Hash

Pending. Fill after Phase 1 QA commit.
