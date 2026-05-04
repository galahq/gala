---
status: ready
quick_id: 260504-ifd
slug: please-update-the-visual-testing-blocks-
created: 2026-05-04T17:16:02.011Z
---

# Quick Task Plan

Update visual testing guidance so local protected-route QA signs in through the Docker-friendly Google OmniAuth mock before judging BlueprintJS parity on protected pages.

## Steps

1. Confirm `config/initializers/mock_omniauth.rb` provides the development Google mock user.
2. Update shared project QA guidance to require clicking "Sign in with Google" on `/readers/sign_in` for authenticated browser QA.
3. Update Phase 1/Phase 4 visual testing blocks so protected-route visual assertions use the mock signed-in admin session instead of stopping at anonymous redirects.
4. Record the quick task in `.planning/STATE.md` and commit atomically.
