---
status: testing
phase: 04-core-case-shell
source:
  - .planning/phases/04-core-case-shell/04-01-SUMMARY.md
started: 2026-05-04T15:14:55Z
updated: 2026-05-04T15:35:00Z
---

## Current Test

number: 2
name: Case Overview Shell
expected: |
  Visiting `/cases/3880fdc8-0a48-4e5f-b146-9deffd7f9c22` shows a nonblank Gala case overview with the header, toolbar, case content, table of contents/sidebar, footer, and rendered Mapbox map using the same maintained style pattern as the stats route. Known HMR and legacy React warnings may appear but should not block using the shell.
awaiting: user response

## Tests

### 1. Case Index JSON
expected: Visiting `/cases.json` returns a JSON array of published cases. The response includes the selected local case slug `3880fdc8-0a48-4e5f-b146-9deffd7f9c22` and does not render an HTML error page.
result: pass

### 2. Case Overview Shell
expected: Visiting `/cases/3880fdc8-0a48-4e5f-b146-9deffd7f9c22` shows a nonblank Gala case overview with the header, toolbar, case content, table of contents/sidebar, footer, and rendered Mapbox map using the same maintained style pattern as the stats route. Known HMR and legacy React warnings may appear but should not block using the shell.
result: issue
reported: "Mapbox is not rendering currently please see how /cases/3880fdc8-0a48-4e5f-b146-9deffd7f9c22/stats is rendering mapbox and follow that example"
severity: major

### 3. Case Content Suffix Shell
expected: Visiting `/cases/3880fdc8-0a48-4e5f-b146-9deffd7f9c22/1` routes through the case shell, shows a case content page with sidebar/navigation, and does not produce a Rails 404 or blank React app.
result: [pending]

### 4. Case Conversation Suffix Shell
expected: Visiting `/cases/3880fdc8-0a48-4e5f-b146-9deffd7f9c22/conversation` is accepted by Rails and loads the case shell. In anonymous state, it may land back on the overview because conversation access is disabled, but it should not show a Rails 404 or blank React app.
result: [pending]

### 5. Protected Case Routes
expected: Visiting protected case routes such as `/cases/:slug/edit`, `/cases/:slug/copy`, `/cases/:slug/archive`, `/cases/:slug/settings/edit`, and `/cases/:slug/translations/new` while anonymous redirects to the sign-in page rather than exposing editor-only UI or crashing.
result: [pending]

## Summary

total: 5
passed: 1
issues: 1
pending: 3
skipped: 0
blocked: 0

## Gaps

- truth: "Case overview Mapbox renders using the same working pattern as the case stats route"
  status: failed
  reason: "User reported: Mapbox is not rendering currently please see how /cases/3880fdc8-0a48-4e5f-b146-9deffd7f9c22/stats is rendering mapbox and follow that example"
  root_cause: "Case overview map used the global MAPBOX_STYLE fallback `mapbox://styles/cbothner/cj5l9s2dg2aps2sqfrnidiq14`, while the stats route uses `mapbox://styles/mapbox/dark-v11`; the old custom style URL returns 404 and prevents the overview map from rendering."
  severity: major
  test: 2
  artifacts:
    - app/views/layouts/application.html.erb
    - app/javascript/stats/map/config.js
    - "Browser QA: `/cases/3880fdc8-0a48-4e5f-b146-9deffd7f9c22` now requests `https://api.mapbox.com/styles/v1/mapbox/dark-v11` with HTTP 200"
    - "Targeted test: `yarn test app/javascript/shared/__tests__/blueprintAssetContract.test.js` passed"
  missing:
    - "User re-check of Test 2 after the Mapbox style fallback fix"
