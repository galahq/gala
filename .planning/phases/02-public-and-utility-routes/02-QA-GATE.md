# Phase 2 Public and Utility Routes QA

**Phase:** 02-public-and-utility-routes  
**Date:** 2026-05-04  
**Source:** `config/routes.rb`  
**Local target:** `http://localhost:3000`  
**Status:** passed

## Route Checklist

| Route group | Representative route | Expected result | Phase 2 result |
| --- | --- | --- | --- |
| Error pages | `/403`, `/404`, `/422`, `/500` | Correct status, Rails layout, static Blueprint-compatible state/action controls | PASS; request specs verify status and static `.pt-*` plus `.bp4-*` classes |
| Health endpoint | `/up` | Plain text `OK` without authentication | PASS; request spec and browser smoke confirm text/plain `OK` |
| Legacy redirects | `/read/1071`, `/read/862`, `/read/611`, `/read/497` | Preserve published redirect destinations | PASS by request specs |
| Locale redirects | `/en/catalog/libraries`, `/en/catalog/libraries.json` | Remove locale prefix while preserving path/format | PASS by request specs |
| Runtime stats | `/runtime/stats` | Protected from unauthenticated access | PASS; unauthenticated request returns JSON `401 Unauthorized` |

## Browser Smoke

Browser tooling used `http://host.docker.internal:3000` because the containerized browser cannot reach the host as `localhost`.

| URL | Result |
| --- | --- |
| `/404` | Rendered `404 Not Found - Gala`; centered non-ideal-state, static `.bp4-*` classes present, no failed local resources detected |
| `/500` | Rendered `500 Internal Server Error - Gala`; feedback button has `.pt-*` and `.bp4-*` classes |
| `/up` | Rendered plain `OK` with `text/plain` content |
| `/read/497` | Redirected to `/cases/mi-wolves`; destination then showed local missing-case behavior, treated as data limitation for this phase |

## Automated Tests

| Command | Result | Notes |
| --- | --- | --- |
| `docker compose exec -T web bundle exec rspec spec/requests/public_utility_routes_spec.rb spec/requests/health_check_spec.rb` | PASS | 14 examples, 0 failures |

## Changes Made

- Added static `.bp4-*` counterparts to `app/views/errors/*.html.haml` while retaining `.pt-*`.
- Added `spec/requests/public_utility_routes_spec.rb` covering error pages, redirects, locale redirects, and `/runtime/stats` protection.

## Non-Blocking Noise

- Docker/Rails test output includes existing RubyGems and Rails 8.2 deprecation warnings.
- Browser-container HMR origin errors remain a tooling artifact when using `host.docker.internal`.
- Legacy redirect destinations may fail in this local DB if referenced case slugs are absent; redirect behavior itself is covered.
