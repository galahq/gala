---
phase: 04-core-case-shell
status: complete
overall_score: 19
copywriting: 4
visuals: 3
color: 3
typography: 3
spacing: 3
experience_design: 3
created: 2026-05-04T17:38:00Z
---

# Phase 04 UI Review

Retroactive 6-pillar visual audit for the Core Case Shell route group.

## Scope

Reviewed the Phase 4 execution summary, UI-SPEC, QA evidence, completed UAT,
and current protected-route testing guidance.

Primary UI surfaces:

- public case overview shell
- case content suffix shell
- conversation suffix shell behavior
- protected case routes and admin/editor BlueprintJS surfaces

## Score Summary

| Pillar | Score |
| --- | ---: |
| Copywriting | 4/4 |
| Visuals | 3/4 |
| Color | 3/4 |
| Typography | 3/4 |
| Spacing | 3/4 |
| Experience Design | 3/4 |

Overall: 19/24

## Findings

### Copywriting - 4/4

Phase 4 preserved existing translated copy and did not introduce new product
copy. The UAT wording now correctly treats the local production Mapbox style
warning as accepted local noise.

### Visuals - 3/4

Public shell routes passed UAT and QA. Protected-route visual confidence is
limited unless the Playwright/MCP browser first authenticates through the local
Google mock and inspects the real protected pages rather than only anonymous
redirects.

Required gate:

1. Navigate to `http://host.docker.internal:3000/readers/sign_in`.
2. Click `a.oauth-icon-google`.
3. Let `config/initializers/mock_omniauth.rb` sign in
   `dev@learnmsc.org` / "Developer Admin".
4. Visit the protected route.
5. Confirm the route is not still the sign-in form before visual assertions.

### Color - 3/4

No new palette was introduced. Protected-route color/intent parity still needs
authenticated visual coverage for editor/admin buttons, danger actions, and
form states.

### Typography - 3/4

No typography redesign was introduced. Continue checking protected forms and
admin cards for BlueprintJS 4 density changes after mock-login authentication.

### Spacing - 3/4

Public shell spacing passed UAT. Protected route spacing should be judged only
after the Google mock login route gate reaches the actual editor/admin surface.

### Experience Design - 3/4

The main shell and route suffix behavior passed. Future protected-route UAT must
exercise the signed-in mock admin path so options menus, settings actions,
translations, copy/archive flows, and destructive confirmations are visually
reviewed in the state users actually see.

## Top Fixes

1. Add `a.oauth-icon-google` login prelude to every protected-route
   Playwright/MCP visual UAT gate.
2. In protected-route UAT, assert the browser is no longer on the sign-in form
   before scoring BlueprintJS parity.
3. Record console/network errors after authentication separately from known
   `host.docker.internal` HMR noise.

## Review Outcome

Phase 4 is visually acceptable for public shell coverage. Protected-route
visual coverage should be considered complete only when the Playwright/MCP
Google mock login prelude is used before inspecting protected routes.
