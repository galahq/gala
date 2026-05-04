# Phase 2 Context: Public and Utility Routes

**Phase:** 02-public-and-utility-routes  
**Date:** 2026-05-04  
**Milestone:** v1.0 Upgrade Stabilization

## Route Scope

Source: `config/routes.rb`

- `GET /403`, `/404`, `/422`, `/500`
- `GET /up`
- Legacy redirects: `/read/1071`, `/read/862`, `/read/611`, `/read/497`
- Locale redirects: `/:locale/*path.:format`, `/:locale/*path`
- `GET /runtime/stats`

## Current Findings

- Error routes render through `ErrorsController` and the `window` layout, which inherits `with_header` and `application`.
- Error views still use Blueprint 2-era `.pt-*` classes in their static Haml.
- Runtime browser QA shows the Phase 1 namespace bridge can mirror error-page `.pt-*` classes to `.bp4-*`, but that depends on JavaScript after initial render.
- `/up` already has request coverage in `spec/requests/health_check_spec.rb`.
- `/runtime/stats` requires an authenticated editor; unauthenticated access redirects through Devise.

## Decisions

- Keep `.pt-*` classes for compatibility.
- Add missing `.bp4-*` classes statically on public error views where practical.
- Validate public/utility route behavior with request specs before browser QA.
- Treat browser-container HMR `Invalid Host/Origin header` as tooling noise unless a normal localhost browser reproduces it.

## QA Gate

Phase 2 passes when:

- Error routes return the expected status codes and include static `bp4` class coverage for key Blueprint controls/states.
- Health check still returns plain `OK`.
- Legacy and locale redirects preserve their destinations.
- Runtime stats is protected for unauthenticated users.
- Browser smoke confirms representative error pages render with sane spacing and no missing local pack/CSS assets.
