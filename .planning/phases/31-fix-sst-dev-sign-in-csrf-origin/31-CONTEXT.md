# Phase 31 Context - Fix SST dev Devise auth failures

## Trigger

Manual sign-in on `https://infra-sst-aws-poc.dev.learngala.dev/readers/sign_in` returned HTTP 422 after the Phase 30 preview deploy. After F-01 was fixed and deployed, manual sign-up on `https://infra-sst-aws-poc.dev.learngala.dev/readers` returned HTTP 500.

## Evidence

- User-provided browser curl posted to `/readers/sign_in` on the dev preview host with an HTTPS `Origin` header.
- CloudWatch Logs Insights for `/sst/cluster/gala-dev-GalaClusterCluster-zeeusfkv/gala-dev-GalaWeb-bcxhrofd/GalaWeb` showed `POST /readers/sign_in` returning `422` at `2026-06-02T02:16:19Z`.
- The dev log included: `HTTP Origin header (https://infra-sst-aws-poc.dev.learngala.dev) didn't match request.base_url (http://infra-sst-aws-poc.dev.learngala.dev)`.
- AWS ECS task-definition inspection showed dev `GalaWeb:14` had `BASE_URL=https://infra-sst-aws-poc.dev.learngala.dev` but `FORCE_SSL=false`.
- AWS ECS task-definition inspection showed production `GalaWeb:17` had `BASE_URL=https://learngala.dev` and `FORCE_SSL=true`.
- User-provided browser curl posted to `/readers` on the dev preview host with reader registration form data.
- CloudWatch Logs Insights showed `POST /readers` reached `Readers::RegistrationsController#create`, inserted the reader, and then raised `Net::SMTPAuthenticationError (535 Authentication Credentials Invalid)` while sending Devise confirmation mail from `Reader#send_devise_notification`.

## Scope

- Fix the SST-managed runtime environment in `infra/sst.config.ts`.
- Keep Devise registration resilient when non-production-like preview mail delivery fails after the database transaction.
- Keep Heroku untouched.
- Keep production-capable deploys on `x86_64`; ARM64 adoption remains deferred.
- Keep Thruster deferred/no-adopt.
- Treat production generic CSRF 422 logs as observation-only unless a fresh reproduction shows the same origin mismatch, because production runtime already has `FORCE_SSL=true`.
- Do not mutate shared SES infrastructure or secrets as part of this phase; rotate or validate SMTP credentials separately if confirmation email delivery itself must be proven.

## Finding Classification

| ID | Severity | Finding | Classification | Disposition |
| --- | --- | --- | --- | --- |
| F-01 | High | Dev SST preview uses an HTTPS public `BASE_URL` but deploys Rails with `FORCE_SSL=false`, so Rails calculates `request.base_url` as `http://...` and rejects Devise sign-in CSRF origin checks. | Auto-fixable | Derive SST `FORCE_SSL` from production stage or HTTPS `BASE_URL`; add request and deploy guard regressions. |
| F-02 | Medium | Production CloudWatch contains a generic `ActionController::InvalidAuthenticityToken` sign-in event without the dev origin mismatch. | Manual/observe | Confirm with fresh production reproduction before changing production behavior; current production task env already satisfies HTTPS/SSL runtime requirements. |
| F-03 | High | Dev sign-up commits the reader and then returns HTTP 500 because Devise confirmation mail raises `Net::SMTPAuthenticationError` synchronously. | Auto-fixable | Default production-like mail delivery errors to non-fatal unless `RAISE_DELIVERY_ERRORS=true`; rescue SMTP delivery failures in `Reader#send_devise_notification`; add model and request regressions. |
