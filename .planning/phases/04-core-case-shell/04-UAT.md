---
status: complete
phase: 04-core-case-shell
source:
  - .planning/phases/04-core-case-shell/04-01-SUMMARY.md
started: 2026-05-04T15:14:55Z
updated: 2026-05-04T17:24:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Case Index JSON
expected: Visiting `/cases.json` returns a JSON array of published cases. The response includes the selected local case slug `3880fdc8-0a48-4e5f-b146-9deffd7f9c22` and does not render an HTML error page.
result: pass

### 2. Case Overview Shell
expected: Visiting `/cases/3880fdc8-0a48-4e5f-b146-9deffd7f9c22` shows a nonblank Gala case overview with the header, toolbar, case content, table of contents/sidebar, and footer. The production `cbothner` Mapbox style may not render locally and may produce a local Mapbox style warning; this is accepted and should not block using the shell. Known HMR and legacy React warnings may also appear but should not block using the shell.
result: pass

### 3. Case Content Suffix Shell
expected: Visiting `/cases/3880fdc8-0a48-4e5f-b146-9deffd7f9c22/1` routes through the case shell, shows a case content page with sidebar/navigation, and does not produce a Rails 404 or blank React app.
result: pass

### 4. Case Conversation Suffix Shell
expected: Visiting `/cases/3880fdc8-0a48-4e5f-b146-9deffd7f9c22/conversation` is accepted by Rails and loads the case shell. In anonymous state, it may land back on the overview because conversation access is disabled, but it should not show a Rails 404 or blank React app.
result: pass

### 5. Protected Case Routes
expected: Visiting protected case routes such as `/cases/:slug/edit`, `/cases/:slug/copy`, `/cases/:slug/archive`, `/cases/:slug/settings/edit`, and `/cases/:slug/translations/new` while anonymous redirects to the sign-in page rather than exposing editor-only UI or crashing.
result: pass

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
