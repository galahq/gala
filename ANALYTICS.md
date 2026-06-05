# Analytics Plan and Implementation: LearnGala PostHog

## Status (current branch)
- ✅ PostHog is wired as an additive analytics path, with Ahoy preserved as source of truth.
- Existing analytics behavior uses Ahoy (`ahoy_matey`) and emits events from
  `app/javascript/utility/Tracker.jsx`.
- In this phase we added PostHog as a parallel analytics path with dual write,
  preserving existing Ahoy behavior.

## Why this approach
- The current codebase is a Rails + Shakapacker app (legacy React pack entrypoints),
  while PostHog wizard support is focused on a limited set of frontend integrations.
- Manual integration is safer and gives deterministic control over environment, rollout,
  and fallback behavior.

## Implementation completed
- Added backend dependencies:
  - `posthog-ruby` and `posthog-rails` in `Gemfile`.
  - `config/initializers/posthog.rb` with guarded initialization and exception settings.
- Added frontend dependency:
  - `posthog-js` in `package.json`.
- Added shared analytics shim:
  - `app/javascript/shared/analytics.js`
    - initializes PostHog from `window.POSTHOG_CONFIG`
    - identifies the current reader when present
    - provides `trackEvent(name, properties)` that sends to Ahoy and PostHog (dual write)
- Wired analytics bootstrap into globally loaded JS:
  - `app/javascript/packs/onboarding.js`
- Replaced direct Ahoy calls in case engagement tracking:
  - `app/javascript/utility/Tracker.jsx`
- Added frontend config injection in page head:
  - `app/views/layouts/application.html.erb`
    - populates `window.POSTHOG_CONFIG` from env vars.

## Current config contract
Set these env vars in the target environments:
- `POSTHOG_ENABLED` (optional, default `true`)
- `POSTHOG_API_KEY` (required to start client + backend init)
- `POSTHOG_HOST` (optional, default `https://us.i.posthog.com`)
- `POSTHOG_PERSONAL_API_KEY` (optional, backend-only)

On each request the layout writes:
```
window.POSTHOG_CONFIG = {
  enabled: <boolean>,
  apiKey: "<string>",
  apiHost: "<string>"
}
```

## Rollout plan
1. **Phase 1 (staging):** enable backend+frontend, verify app boots, check for console
   errors, and confirm posthog-js captures one manual path.
2. **Phase 2 (pilot):** enable tracking for a single environment + route family,
   verify both Ahoy and PostHog receive `Tracker` events.
3. **Phase 3 (expand):** keep Ahoy active and expand wrappers if needed.

## QA checks (recommended)
- For Phase 2 pilot validation, use the case overview route first:
  - `read_overview` is now emitted after 3s while the tracker has remained active.
  - Existing tracker components keep their prior Ahoy timing behavior.
- For broader route-family pilots, verify these event names:
  - `read_overview`
  - `read_card`
  - `visit_edgenote`
  - `visit_podcast`
  - `visit_element`
  - `read_quiz`
- Confirm config:
  - `POSTHOG_API_KEY` present only in environments intended for PostHog.
- Browser network checks:
  - PostHog captures usually appear as network calls to PostHog capture endpoints under `${POSTHOG_HOST}` (often `/e/` in this SDK) after a tracked interaction.
  - No hard errors in console from `app/javascript/shared/analytics.js`.
- Flow checks:
  - case page interactions still update existing Ahoy-derived dashboards.

### Validation notes (current branch)
- With a placeholder key such as `ph_testkey`, PostHog initializes but only remote config/feature-flag requests are observed (`/flags`, `/config`); this is expected behavior before a real project key is enabled.
- For end-to-end confirmation, use a valid PostHog project API key in staging/production and confirm:
  - `window.POSTHOG_CONFIG.apiKey` is that key,
  - `window.posthog` is initialized,
  - tracked events create outbound requests to the PostHog capture endpoint (typically `/e/`).

## Rollback
- Set `POSTHOG_ENABLED=false` to stop client init immediately.
- If needed, remove `POSTHOG_API_KEY` to disable backend initialization.
- Since Ahoy remains unchanged, dashboards can continue during rollback.

## Known limitations
- The PostHog installer wizard path has inconsistent behavior in legacy/non-interactive setups.
- This rollout keeps Ahoy as source-of-truth for now; PostHog is intentionally additive.

## Files changed in this plan
- `Gemfile`
- `package.json`
- `config/initializers/posthog.rb` *(new)*
- `app/javascript/shared/analytics.js` *(new)*
- `app/javascript/packs/onboarding.js`
- `app/javascript/utility/Tracker.jsx`
- `app/views/layouts/application.html.erb`
- `ANALYTICS.md` (this document)

## Next steps
- Verify this rollout in a staging run:
  - Confirm `POSTHOG_API_KEY` is set and `POSTHOG_ENABLED=true` in staging.
  - Confirm `window.POSTHOG_CONFIG` appears in page source.
  - Confirm `/batch/` or `/capture/` traffic in browser devtools with no hard JS errors.
- After validation, decide whether to expand tracking from `Tracker`-only to additional app events.
- Verify event dashboards and tune event names/props if your analytics team requires stricter schema.

## Executable rollout checklist (1 → 2 → 3)
1. Step 1 — boot + config
- Set `POSTHOG_ENABLED=true` and a valid `POSTHOG_API_KEY` in staging.
- Load a tracked case page and confirm both exist in page source/runtime:
  - `window.POSTHOG_CONFIG.enabled === true`
  - `window.POSTHOG_CONFIG.apiKey` equals the real project key
- Confirm no console errors from analytics bootstrap (`shared/analytics.js`).

2. Step 2 — event path validation
- On `/cases/<slug>` hold the page open for at least 3s so the overview timer can fire.
- In Network, verify PostHog receives a capture request (SDK path may be `/e/` on this version).
- Confirm Ahoy still sends `POST /ahoy/visits` and existing Ahoy dashboards remain unaffected.
- Spot-check event payload includes expected props for `read_overview` (at minimum `name: read_overview`, `duration`, `case_slug`).

3. Step 3 — expand guardrail
- Keep Ahoy source-of-truth intact.
- Expand to additional Tracker-backed routes only after Step 2 is clean, then verify the same dual-write pattern per route.
