# Phase 3 Context: Catalog Routes

**Phase:** 03-catalog-routes  
**Date:** 2026-05-04  
**Milestone:** v1.0 Upgrade Stabilization

## Route Scope

Source: `config/routes.rb`

- `GET /`
- `catalog/content_items` and nested session destroy
- `GET /catalog/libraries`
- `GET /catalog/languages`
- `GET /catalog/*react_router_location`
- `GET /search`
- `GET /tags`

## Current Findings

- Catalog home mounts `#catalog-app` from `app/views/catalog/home.html.haml` and appends the `catalog` pack.
- The Phase 1 toolbar fix corrected the oversized catalog navbar by restoring the `.MaxWidthContainer` CSS hook.
- Browser root QA still has expected unauthenticated JSON `401`s and external Mapbox style noise; these are not local pack/CSS failures.
- Catalog React components still contain hand-written `.pt-*` Blueprint class strings in visible controls/states.

## Decisions

- Keep `.pt-*` classes and add `.bp4-*` counterparts for catalog-specific hand-written controls/states touched in this phase.
- Do not rewrite React Blueprint component usage; package components already emit Blueprint 4 classes.
- Add request coverage for catalog shell and JSON endpoints to protect route behavior.
