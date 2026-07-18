# Task 1: Rails Google OAuth migration routing and callback safety

Implement the approved Rails backend slice with strict test-first TDD.

## Requirements

- Add a frozen hard-coded Reader migration allowlist containing only normalized
  `nathan.papes@gmail.com`, plus an instance predicate that compares
  `Reader#email.to_s.strip.downcase` with the allowlist.
- Add `GoogleOauthSetup`, callable from OmniAuth's setup phase.
- Authorization setup reads and normalizes only the `reader_email` query
  parameter. It selects migration credentials only for an existing Reader found
  case-insensitively whose allowlist predicate passes and only when both
  `GOOGLE_MIGRATION_CLIENT_ID` and `GOOGLE_MIGRATION_CLIENT_SECRET` are present.
- Blank, unknown, non-allowlisted, or partially configured authorization
  requests explicitly select `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
- Authorization setup overwrites signed-session key
  `gala.google_oauth_client_selection` with only `legacy` or `migration`.
- Callback setup consumes/deletes that selection key and recovers normalized
  requested email from `rack.session['omniauth.params']`. It must select solely
  from the recorded class without re-evaluating Reader state. Missing/unknown
  marker selects legacy for pre-deployment compatibility.
- A recorded migration callback whose migration pair has become incomplete must
  retain migration classification and use non-secret invalid sentinel
  credentials so token exchange fails rather than switching to legacy.
- Only a recorded migration callback gets a request-local Rack marker carrying
  the normalized requested email for controller validation. Do not log
  credentials or identity parameters.
- Register `GoogleOauthSetup` on the existing Devise Google provider while
  preserving provider name `google`, scopes/defaults, and legacy credential
  arguments.
- In `AuthenticationStrategies::OmniauthCallbacksController`, run a Google
  migration identity guard before both model-writing callbacks. When the
  request-local migration marker exists, require Google's returned email to be
  verified and its normalized value to equal the requested allowlisted email.
  On failure use the existing failure redirect before any Reader or
  AuthenticationStrategy write. Clear the selection key in `failure` as
  defense in depth.
- Do not change `AuthenticationStrategy` implementation or the callback route.
  Prove a valid migration callback links a new provider `google` UID to the
  existing allowlisted Reader, creates no duplicate Reader, and retains the
  Reader's legacy Google strategy.

## Tests and TDD evidence

- Extend `spec/models/reader_spec.rb` for exact, case/whitespace-normalized,
  blank, and non-allowlisted emails.
- Add `spec/services/google_oauth_setup_spec.rb` covering eligible migration;
  blank/unknown/non-allowlisted; missing migration ID; missing migration secret;
  callback consumption and saved params; missing/unknown marker legacy;
  fail-closed migration pair loss; and Reader mutation/deletion between legs.
- Add `spec/requests/google_oauth_migration_spec.rb` covering matching verified
  migration identity, mismatch, unverified email, legacy/migration continuity,
  selection cleanup, no writes on rejection, linking without duplicate Reader,
  retained legacy strategy, provider name, and callback path.
- For every production behavior, first add a failing spec and capture the
  expected RED output. Then implement minimally and capture GREEN output.
- Use `./run-rspec.sh` for Rails specs because the test database is Docker-only.
  Run focused specs while iterating and the task's full focused set once before
  commit.

## Scope and safety

- Modify only the Rails/backend files and specs named above plus
  `config/initializers/devise.rb`.
- Preserve all existing untracked paths. Never stage or commit `.work/`,
  `.omx/`, `GCP_OAUTH.pdf`, or root `sst-env.d.ts`.
- No external service, Heroku, AWS, SST, Google Cloud, deploy, or secret action.
- Never print or persist real credentials; tests use unmistakably fake values.

