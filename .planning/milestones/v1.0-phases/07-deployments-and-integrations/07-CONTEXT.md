# Phase 7 Context: Deployments and Integrations

**Phase:** 07-deployments-and-integrations  
**Date:** 2026-05-05  
**Milestone:** v1.0 Upgrade Stabilization

## Route Scope

Source: `config/routes.rb`

- `GET /deployments`
- `GET /deployments/:id`
- `GET /deployments/new`
- `POST /deployments`
- `GET /deployments/:id/edit`
- `PATCH /deployments/:id`
- `GET /deployments/:deployment_id/submissions`
- `POST /groups/:group_id/canvas_deployments`
- `GET /authentication_strategies/config/lti`
- Devise omniauth callbacks for authentication strategies
- `POST /catalog/content_items`
- `GET /sparql`
- `GET /sparql/:schema/:qid`

## Current Findings

- Deployment index/show/new pages use the admin layout and contain hand-authored legacy `.pt-*` Blueprint classes.
- The deployment edit route mounts the `deployment` pack and contains React markup with hand-authored `.pt-*` classes in toolbar, quiz selector, and quiz cards.
- `BlueprintFormBuilder` already emits Blueprint 4 class counterparts for form-builder-generated fields, but deployment templates also contain custom class strings outside the builder.
- SPARQL and Wikidata routes already have request coverage from Phase 5; Phase 7 should re-run that coverage as part of the integration gate.
- LTI content-item and Canvas deployment routes intentionally skip CSRF and depend on LTI/session validation boundaries; tests should preserve those redirects and not broaden access.

## Decisions

- Keep legacy `.pt-*` classes and add `.bp4-*` counterparts for deployment-specific hand-authored controls/states.
- Add request specs for deployment HTML/JSON routes and integration redirect/config behavior.
- Do not change LTI request validation semantics unless a route check shows a direct regression.
- Treat SPARQL hardening beyond current behavior as separate security scope unless a regression blocks route QA.
