# Context: staged-google-oauth-key-rotation

## Intent

Create a staged Google OAuth client migration for the existing Reader whose
normalized email is `nathan.papes@gmail.com`, while every other Google OAuth
request continues using the legacy client. Add the two current legacy secrets
plus the two migration secrets to the AWS migration infrastructure, then verify
the migration in AWS dev without changing the live Heroku deployment or its
runtime configuration.

## Acceptance criteria

- AC1: The implementation branch is `oauth/staged-google-key-rotation`, based on commit `2b808a57`.
- AC2: Every untracked file present before branch creation remains intact.
- AC3: With both migration credential variables configured, an OAuth authorization request for the existing allowlisted Reader redirects to Google with the migration client ID.
- AC4: An OAuth authorization request with a blank email redirects to Google with the legacy client ID.
- AC5: An OAuth authorization request with an unknown email redirects to Google with the legacy client ID.
- AC6: An OAuth authorization request for an existing non-allowlisted Reader redirects to Google with the legacy client ID.
- AC7: An OAuth authorization request for the allowlisted Reader redirects with the legacy client ID when either migration credential variable is blank or absent.
- AC8: The sign-in Google link submits only a normalized `reader_email` query parameter from its surrounding form.
- AC9: The registration Google link submits only a normalized `reader_email` query parameter from its surrounding form.
- AC10: Password, password confirmation, name, locale, plus every non-email form value are absent from each generated Google OAuth URL.
- AC11: A migration callback selects the migration client used by its corresponding authorization request.
- AC12: A legacy callback selects the legacy client used by its corresponding authorization request.
- AC13: A migration callback whose Google email is unverified uses the existing failure redirect without creating a Reader or authentication strategy.
- AC14: A migration callback whose verified Google email differs from the requested allowlisted email uses the existing failure redirect without creating a Reader or authentication strategy.
- AC15: A valid migration callback links the new Google project UID to the pre-existing allowlisted Reader without creating a duplicate Reader.
- AC16: A successful migration login retains the allowlisted Reader's legacy Google authentication strategy.
- AC17: All Google authentication strategy rows continue storing provider `google`.
- AC18: All Google OAuth flows continue using `/authentication_strategies/auth/google/callback`.
- AC19: SST defines all four Google OAuth names as retained `sst.Secret` resources.
- AC20: SST exposes all four Google OAuth secrets through SecureString/SSM to every Rails service or task.
- AC21: The deploy workflow retained-secret inventory includes all four Google OAuth secret names.
- AC22: Repository-generated SST types include all four Google OAuth secret resources.
- AC23: Both SST stages contain the current legacy Google credentials copied read-only from Heroku app `msc-gala` through stdin.
- AC24: Both SST stages contain the new migration Google credentials set through stdin.
- AC25: The downloaded client JSON exists only under `/private/tmp` during provisioning, then no longer exists after provisioning completes.
- AC26: Project `project-78c8a048-9020-484c-b18`, accessed through `authuser=1`, contains a Web application client named `Gala AWS staged OAuth migration`.
- AC27: The new Web application client contains exactly the ticket's dev callback URI plus production `.dev` callback URI.
- AC28: The new client reuses the existing consent configuration, or uses an External Testing app whose sole test user is `nathan.papes@gmail.com`.
- AC29: A real dev login by `nathan.papes@gmail.com` authenticates the pre-existing Reader through the migration client.
- AC30: A dev authorization request for a non-allowlisted Reader uses the legacy client.
- AC31: Google login on the Heroku-hosted Gala application remains functional under its untouched deployment plus runtime configuration.
- AC32: Focused OAuth specs, the relevant authentication suite, changed-Ruby RuboCop, and SST/workflow contract checks pass before the workflow-bootstrap push; the authenticated dev SST diff then generates `infra/sst-env.d.ts`, and the final branch passes the same checks plus a second authenticated dev SST diff before deployment.
- AC33: No Google client secret value is present in Git-tracked files, shell arguments, command output, Quark artifacts, design documents, or retained temporary files.
- AC34: Every AWS CLI or SST CLI command runs with `AWS_PROFILE=gala` plus `SST_STAGE=dev` in its environment.
- AC35: The Heroku CLI reads `GOOGLE_CLIENT_ID` from app `msc-gala` exactly once.
- AC36: The Heroku CLI reads `GOOGLE_CLIENT_SECRET` from app `msc-gala` exactly once.
- AC37: No Heroku CLI command deploys, restarts, writes config, changes an environment variable, or otherwise mutates app `msc-gala`.
- AC38: The selected existing Google Cloud project displays name `gala` with ID `project-78c8a048-9020-484c-b18` under account slot `authuser=1`.
- AC39: No Google Cloud project is created, renamed, or replaced during this task.

## Files / modules in play

- `app/models/reader.rb` — existing Reader lookup plus the normalized hard-coded migration allowlist predicate.
- `app/models/authentication_strategy.rb` — existing provider/UID linking behavior that must attach the new UID to the allowlisted Reader.
- `app/controllers/authentication_strategies/omniauth_callbacks_controller.rb` — callback email verification, requested-email recovery, failure behavior, and safe account linking.
- `config/initializers/devise.rb` — existing `google` provider and request-scoped OmniAuth setup.
- `app/views/devise/sessions/_sign_in.html.haml` — sign-in Google link and email-only `reader_email` propagation.
- `app/views/devise/registrations/new.html.haml` — registration Google link and email-only `reader_email` propagation.
- `config/routes.rb` — existing provider callback contract, which must remain unchanged.
- `spec/` OAuth request/model/view coverage — authorization selection, callback binding, rejection, linking, and URL privacy behavior.
- `infra/sst.config.ts` — retained secret resources, SecureString projection, and Rails service/task runtime exposure.
- `infra/sst-env.d.ts` — repository-generated SST resource types.
- `.github/workflows/deploy.yml` — retained-secret inventory for all four Google OAuth secrets.
- `scripts/ops/test-sst-dev-runtime-contracts.rb` and `scripts/ops/test-workflow-architecture-defaults.rb` — infrastructure and workflow contract assertions.
- Google Auth Platform and SST dev/production stages — external client creation, secret provisioning, deploy, and manual verification surfaces.

## Constraints

- Create the implementation branch from commit `2b808a57` before any other repository mutation and preserve all existing untracked files.
- Keep all `.work/staged-google-oauth-key-rotation/` artifacts uncommitted.
- Use account slot `authuser=1` and project `project-78c8a048-9020-484c-b18`; create a Web application OAuth client, not a service-account key or IAM Workforce client.
- Confirm the selected existing project's display name is `gala`; do not create or rename a Google Cloud project.
- Enter Google Cloud through `https://console.cloud.google.com/welcome/new?authuser=1&project=project-78c8a048-9020-484c-b18` so the account slot plus project selection are explicit.
- Pause for developer confirmation immediately before the Google Console's final Create action because redirect URIs must match exactly.
- The only authorized redirect URIs on the new client are `https://dev.learngala.dev/authentication_strategies/auth/google/callback` and `https://learngala.dev/authentication_strategies/auth/google/callback`.
- Preserve the provider name `google`, the existing callback route, legacy credentials, and all non-allowlisted authentication behavior.
- Select migration credentials only for an existing allowlisted Reader and only when both migration variables are configured.
- Treat passwords and every non-email form field as prohibited OAuth URL data.
- Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_MIGRATION_CLIENT_ID`, and `GOOGLE_MIGRATION_CLIENT_SECRET` to SST.
- Do not deploy, restart, reconfigure, or mutate environment variables on the live Heroku application.
- Use the already-authenticated Heroku CLI only to fetch `GOOGLE_CLIENT_ID` once plus `GOOGLE_CLIENT_SECRET` once from app `msc-gala`.
- Hold those two fetched values only in memory long enough to pipe each into explicit dev plus production SST stage values; never print or persist them.
- Perform the one-time reads plus four SST writes in one shell session without command tracing so a later step cannot require another Heroku fetch.
- Do not create an SST account-wide fallback value; the only fallback in this design is the Rails runtime selecting its legacy client for requests that are not eligible for migration.
- The legacy-secret transfer may mutate only SST/AWS secret state.
- Use `AWS_PROFILE=gala SST_STAGE=dev` for every AWS CLI and SST CLI invocation.
- A production-targeted SST secret command must use an explicit `--stage production` while retaining the required CLI environment variables.
- Never put secret values in Git, shell arguments, logs, Quark artifacts, or design documents; use stdin-capable secret commands.
- Download client JSON only under `/private/tmp` and securely delete it after provisioning.
- Provision production secret values, but do not deploy the production code.
- A workflow-bootstrap push is permitted only because Cloudflare-authenticated SST type generation is available exclusively in GitHub Actions. The bootstrap dry-run uploads only `infra/sst-env.d.ts`; after committing that generated artifact, complete the remaining Quark build checks and a second authenticated dev SST diff before deployment.

## Risks

- Google requires byte-for-byte redirect URI matching; a typo blocks the callback.
- Request and callback phases can choose different clients unless the requested allowlisted identity is preserved safely across the OmniAuth round trip.
- Trusting an unverified or mismatched returned email could link an attacker-controlled Google subject to the allowlisted Reader.
- The current `find_or_create_by!` flow can create a new Reader before migration identity validation unless validation occurs first.
- Provider renaming or changing the callback route could orphan legacy strategy rows or create duplicate strategies.
- Missing only one migration variable must not yield a partially configured OAuth client.
- Secret provisioning commands can leak values through arguments, shell tracing, captured output, or temporary files if handled incorrectly.
- A partial SST write after the one-time Heroku reads must be recovered within the same in-memory shell session because re-fetching either Heroku value is prohibited.
- The current `.work/` directory is untracked but not ignored, so Quark artifacts require explicit exclusion from all staging operations.
- Real OAuth verification depends on Google propagation, consent configuration, dev deployment health, and access to the existing Reader account.

## Out of scope

- Production code deployment or production DNS cutover.
- Any Heroku deployment, restart, config write, environment-variable update, or secret rotation.
- Enabling the migration client for any Reader other than `nathan.papes@gmail.com`.
- Deleting, disabling, or globally rotating the legacy Google client or credentials.
- Removing legacy Google authentication strategy rows.
- Renaming the `google` provider or changing the callback route.
- Creating a database migration.
- Adding service-account keys, IAM Workforce OAuth clients, extra Google scopes, or unrelated consent-screen changes.
- Creating, renaming, replacing, or deleting the existing Google Cloud project.
- Supporting real OAuth on wildcard PR preview hosts or adding additional redirect URIs.
- Unrelated authentication, infrastructure, or UI refactoring.

## Sensitivity

- auth
- PII
- data-integrity

## Open questions

- [x] None. The developer supplied and approved the staged-rotation design, existing `gala` project identity, exact client metadata, redirect URIs, four-secret SST scope, single-read Heroku transfer, CLI environment guards, verification target, and out-of-scope boundaries.
