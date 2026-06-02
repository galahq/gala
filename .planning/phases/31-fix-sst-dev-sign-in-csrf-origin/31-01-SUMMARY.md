# Summary 31-01 - Fix SST Devise auth failures

## Completed

- Classified the dev preview sign-in failure as F-01 and confirmed it with CloudWatch plus ECS task-definition runtime environment inspection.
- Classified the follow-up dev preview sign-up 500 as F-03 and confirmed it with CloudWatch request logs showing synchronous Devise confirmation mail failed with `Net::SMTPAuthenticationError`.
- Preserved production as observation-only for this change because its deployed SST runtime already has `BASE_URL=https://learngala.dev` and `FORCE_SSL=true`.
- Updated SST runtime environment derivation so HTTPS base URLs set `FORCE_SSL=true` in dev previews as well as production.
- Defaulted production-like mail delivery failures to non-fatal unless `RAISE_DELIVERY_ERRORS=true`, and made `Reader#send_devise_notification` rescue SMTP delivery failures consistently with that setting.
- Added a Devise sign-in request regression that enables CSRF origin checks and posts to `/readers/sign_in` from the dev preview HTTPS origin.
- Added Devise sign-up and mail-delivery regressions so `/readers` does not return 500 when confirmation delivery fails in a preview-style runtime.
- Extended ECS-only deploy payload guard tests to keep dev HTTPS/HTTP `FORCE_SSL` behavior explicit.
- Kept preview URL checks env-driven; tests use `GALA_TEST_SIGN_UP_BASE_URL`, `GALA_TEST_SIGN_IN_BASE_URL`, `GALA_TEST_AUTH_BASE_URL`, `BASE_URL`, or `GALA_TEST_DEV_HTTPS_BASE_URL` instead of hard-coded ephemeral preview hosts.

## Validation

Validation is recorded in `31-VALIDATION.md`. Final live validation deployed through GitHub preview workflow run `26795072027` on `x86_64`, stabilized ECS `GalaWeb:16` and `GalaWorker:15`, returned `/up` HTTP 200, returned sign-up POST HTTP 302, returned sign-in POST HTTP 200, and found zero recent CloudWatch bad-pattern matches in query `7b305a77-dcb4-467c-873e-22ef682ab458`.

Exact-head CI artifact run `26795428197` correctly exposed a Phase 31 test-helper regression: Devise auth specs failed when no preview URL env var was present in CI. The helper now uses env-provided URLs for real preview validation and a neutral HTTPS test host fallback for regular request specs; focused request specs and focused RuboCop pass after the repair.

## Decisions Preserved

- Heroku production was not touched.
- ARM64 production adoption remains deferred.
- Thruster remains deferred/no-adopt.
- SST in `infra/sst.config.ts` remains the infrastructure source of truth.
- Dev SMTP credential rotation/validation is left as a separate operator task if confirmation delivery itself must be proven.
