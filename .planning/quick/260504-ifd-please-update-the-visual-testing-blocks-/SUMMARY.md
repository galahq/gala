---
status: complete
quick_id: 260504-ifd
slug: please-update-the-visual-testing-blocks-
completed: 2026-05-04T17:16:02.011Z
---

# Quick Task Summary

Documented the local Google OmniAuth mock sign-in flow for protected-route visual QA.

## Changes

- `.planning/PROJECT.md` now states that protected-route visual QA should click "Sign in with Google" and use `config/initializers/mock_omniauth.rb`.
- Phase 1 QA evidence now records the Docker/browser-MCP authenticated testing pattern.
- Phase 4 UI-SPEC and QA evidence now require attempting the Google mock sign-in flow before treating anonymous redirects or request specs as sufficient protected-route visual coverage.

## Verification

- Documentation-only change; verified against `config/initializers/mock_omniauth.rb`.
