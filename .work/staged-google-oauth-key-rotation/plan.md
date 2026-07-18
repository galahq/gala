# Plan: staged-google-oauth-key-rotation

## Approach

Implement the rotation as a request-scoped credential choice on the existing
Devise/OmniAuth `google` strategy. A server-side allowlist predicate recognizes
only the normalized email `nathan.papes@gmail.com`; an existing matching Reader
and a complete migration credential pair are both required before the migration
client is selected. During authorization, the OmniAuth setup callable records
only the non-secret selected client class (`legacy` or `migration`) in the
signed Rails/Rack session before OmniAuth saves `reader_email`. During callback
setup, it consumes that client-class marker, recovers `reader_email` from
OmniAuth's still-present saved request parameters, and selects credentials from
the recorded class without re-evaluating mutable Reader state. A missing marker
selects legacy credentials so an in-flight legacy authorization started before
deployment remains compatible. Before the callback can execute the existing
`find_or_create` path, it rejects an unverified or mismatched migration email
through the existing failure redirect.

Use TDD for the allowlist, credential-selection, URL construction, callback
validation, and account-linking behavior. Preserve the provider name, callback
route, `AuthenticationStrategy` linking implementation, and all legacy flows.
Expose four retained SST secrets through the existing SecureString runtime
projection. Provision explicit values for both `dev` and `production`; do not
use SST's account-wide `--fallback`. Create the migration Web client in the
existing Google Cloud project only after an action-time confirmation at the
final Create button, transfer all values over stdin without logging them,
deploy code only to AWS dev, and complete real dev plus read-only Heroku login
checks before any merge. A reviewed branch push may run ordinary CI before
deployment, but it must not dispatch the deploy workflow.

## Changes (file by file)

- `app/models/reader.rb` — add a frozen, hard-coded migration email allowlist
  and an instance predicate that normalizes `Reader#email` with `strip` plus
  `downcase` and returns true only for `nathan.papes@gmail.com`. Keep the
  general Reader creation and lookup behavior unchanged.
- `app/services/google_oauth_setup.rb` — add the callable used by OmniAuth's
  `setup` phase. Normalize only `reader_email`; on an authorization request,
  read it from the query string; select the migration pair only when a
  case-insensitive query finds an existing Reader whose allowlist predicate is
  true and both migration environment variables are nonblank. Explicitly set
  the legacy pair for blank, unknown, non-allowlisted, or partially configured
  migration requests, and overwrite the signed-session key
  `gala.google_oauth_client_selection` with the selected non-secret class. On a
  callback, delete/read that key and recover `reader_email` from
  `rack.session['omniauth.params']`, which OmniAuth 1.9.2 does not delete until
  after setup. Select credentials solely from the consumed class; treat a
  missing/unknown class as legacy for pre-deployment callback compatibility.
  For a recorded migration callback whose current migration pair is incomplete,
  retain migration classification and supply non-secret invalid sentinel
  credentials so OAuth2's token exchange follows its existing
  `invalid_credentials` failure path rather than switching to legacy. Store the
  normalized requested email in a request-local Rack marker only for a recorded
  migration callback; never log credentials or identity parameters.
- `config/initializers/devise.rb` — keep `name: 'google'`, the existing scopes,
  and the legacy `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` defaults; register
  `GoogleOauthSetup` as the existing provider's setup callable.
- `config/initializers/filter_parameter_logging.rb` — add `reader_email` to
  Rails' parameter filters so the OAuth routing hint is redacted from filtered
  request paths and parameter logs.
- `app/controllers/authentication_strategies/omniauth_callbacks_controller.rb` — insert
  a Google migration identity guard before
  `set_authentication_strategy` and `set_reader`. When the request-local
  migration marker is present, require Google's returned email verification
  flag and require the normalized returned email to equal the requested
  allowlisted email. Invoke the existing failure response before any model
  write when either check fails. Delete the custom selection session key in the
  existing `failure` action as defense-in-depth for failures that occur before
  callback setup consumes it. Leave legacy callbacks and successful
  `AuthenticationStrategy.from_omniauth` linking unchanged.
- `app/models/authentication_strategy.rb` — make no implementation change;
  exercise its existing provider/UID linking behavior in request specs to prove
  the new project UID attaches to the existing Reader while the old strategy
  remains.
- `config/routes.rb` — make no implementation change; assert the provider and
  `/authentication_strategies/auth/google/callback` contract remain intact.
- `app/javascript/controllers/google_oauth_controller.js` — add a Stimulus
  controller with an exported URL-building helper. On click, read only its
  surrounding form's email target, normalize it with trim plus lowercase, and
  navigate to the existing Google authorization path with exactly one optional
  query key, `reader_email`. Construct the URL from the link's fixed OAuth href
  rather than serializing the form, so password, confirmation, name, locale,
  and any future non-email field cannot enter the OAuth URL.
- `app/views/devise/sessions/_sign_in.html.haml` — attach the new Stimulus
  controller and email target to the sign-in form and attach its click action
  to the enabled Google link. Preserve the current disabled-link behavior and
  fixed authorization route.
- `app/views/devise/registrations/new.html.haml` — attach the same controller,
  email target, and Google-link click action to registration without exposing
  any other registration field.
- `app/javascript/controllers/__tests__/google_oauth_controller.test.js` — add
  Jest coverage for trimmed/lowercased email, blank email, preservation of the
  fixed Google authorization path, and exclusion of password, password
  confirmation, name, locale, and arbitrary extra form values.
- `spec/models/reader_spec.rb` — add allowlist predicate examples for exact,
  mixed-case/whitespace, blank, and non-allowlisted Reader emails.
- `spec/services/google_oauth_setup_spec.rb` — exercise request-phase and
  callback-phase selection with isolated Rack environments: eligible existing
  Reader plus complete migration pair, blank email, unknown email,
  non-allowlisted Reader, missing migration ID, missing migration secret, and
  saved callback parameters. Assert the selected client ID/secret, session
  selection, callback consumption, request-local migration marker, missing
  marker legacy behavior, and fail-closed recorded-migration behavior without
  printing credential values. Mutate/delete the Reader between authorization
  and callback in one example to prove the recorded selection wins over current
  Reader state.
- `spec/requests/google_oauth_migration_spec.rb` — drive OmniAuth request and
  callback behavior in test mode. Cover verified matching migration identity,
  verified mismatch, unverified email, migration and legacy client continuity,
  missing callback-time migration credentials, selection-key cleanup on callback
  and failure, no writes on rejection, no duplicate Reader, new UID linking,
  retained legacy strategy, provider `google`, and the unchanged callback path.
  For the callback-time missing-credential case, disable OmniAuth test mode,
  stub the token exchange failure, and assert `invalid_credentials` plus zero
  model writes. Also assert that Rails' filtered request path redacts
  `reader_email`.
- `spec/requests/devise_reader_routes_spec.rb` — extend rendered sign-in and
  registration assertions to require the fixed Google href plus the exact
  Stimulus controller/target/action hooks, with no non-email value embedded in
  either link.
- `infra/sst.config.ts` — add retained `sst.Secret` resources for
  `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_MIGRATION_CLIENT_ID`, and
  `GOOGLE_MIGRATION_CLIENT_SECRET`; pass each through
  `secretValueToParameter` into the shared SecureString map already inherited
  by the Rails web service, worker service, and every Rails task. Do not define
  a fallback secret value.
- `infra/sst-env.d.ts` — replace with the artifact produced by the first
  authenticated, non-refreshing GitHub diff after the four resources exist; do
  not hand-edit this generated file. Leave the pre-existing untracked root
  `sst-env.d.ts` untouched.
- `.github/workflows/deploy.yml` — add all four names to
  `RETAINED_SECRET_KEYS` so the existing retained-secret workflow preserves
  them. In `diff` mode, run `sst diff` without a preceding `sst refresh`,
  because refresh was proven to write computed-resource drift into the
  versioned dev state. Upload the Cloudflare-authenticated generated
  `infra/sst-env.d.ts` as a one-day artifact so the tracked generated contract
  can be committed without hand-editing it. Keep normal deploy mode unchanged.
- `.envrc` — load the ignored local Cloudflare credential file and map its
  legacy Global API Key variable name to the provider-compatible environment
  name. GitHub Actions continues to use its scoped repository token.
- `.gitignore` — ignore local Google/Cloudflare credential files and downloaded
  Google client JSON naming patterns.
- `infra/README.md` — document the `infra/` working directory, local credential
  loading, required AWS/SST environment, removal of conflicting local
  database/cache variables, and the non-refreshing safety-diff/deploy rule.
- `docs/ops/staged-google-oauth-deployment-findings.md` — preserve non-secret
  Cloudflare/SST diagnostic evidence, state-restoration results, and the
  current deployment blocker for later drift reconciliation.
- `scripts/ops/test-sst-dev-runtime-contracts.rb` — require all four retained
  `sst.Secret` declarations, all four SecureString projections, and inheritance
  of the shared Rails runtime map by both Rails services and every Rails task.
- `scripts/ops/test-workflow-architecture-defaults.rb` — assert the workflow's
  retained-secret inventory contains all four Google names.
- `.work/staged-google-oauth-key-rotation/uat.md` — during the later verify
  step, record the exact manual checks and non-secret results for Google project
  identity, client configuration, explicit stage provisioning, AWS dev Nathan
  login, legacy-client redirect, untouched Heroku login, and temporary-file
  removal. Keep this artifact uncommitted and include no client IDs, UIDs,
  emails other than the approved allowlist entry, or secrets. Compare each
  observed public authorization `client_id` with the expected in-memory value,
  then record only `migration_match=true` or `legacy_match=true` plus the stage
  and flow; never record either identifier.

## External provisioning and rollout sequence

1. Before any external mutation, confirm the branch still points to a history
   rooted at `2b808a57`, inventory the existing untracked paths, and confirm
   `.work/` is excluded from every staging command. Run read-only CLI/auth
   preflights without displaying secret inventories: confirm `heroku`, `jq`,
   Node, and the repository-pinned SST CLI are available without invoking any
   Heroku command; rely on the developer's authenticated-CLI assertion until
   the two authorized reads; use
   `AWS_PROFILE=gala SST_STAGE=dev aws sts get-caller-identity` for AWS identity;
   and use SST help/version plus a dev diff to verify auth, stdin-form command
   syntax, and the explicit stage targets before any secret read. Every AWS CLI
   or SST CLI command, including read-only preflights, must have
   `AWS_PROFILE=gala SST_STAGE=dev`; every production-targeted SST command must
   additionally pass `--stage production`.
2. Complete the TDD implementation and infrastructure contract changes. Before
   the bootstrap push, run every local check that does not require an
   authenticated SST evaluation. Do not treat a local `sst refresh` or a
   state-derived local type file as authoritative. The first authenticated
   GitHub diff in step 10 performs the authoritative type generation.
3. Before opening the client creation form, create a unique private directory
   with `/usr/bin/mktemp -d /private/tmp/gala-google-oauth.XXXXXX`, define
   `temporary_json_path` as `client.json` inside it, and install an
   `EXIT HUP INT TERM` cleanup trap. The trap must run
   `/bin/rm -P -- "$temporary_json_path"` when the file exists, verify with a
   path-absence test that the JSON is gone, and remove the now-empty directory.
   Configure the browser's download destination to that exact path and prove
   direct placement with a harmless non-secret test download, then delete the
   test file. If the browser cannot guarantee direct `/private/tmp` placement,
   stop before Google Create and ask the developer for a safe download method;
   never download the client JSON to a default directory and move it later.
4. Open Google Cloud through the approved `authuser=1` plus project-specific
   URL. Verify the selected project displays name `gala` and ID
   `project-78c8a048-9020-484c-b18`. Do not create, rename, replace, or delete a
   project. Inspect the existing Google Auth Platform consent configuration and
   reuse it. Only if it is absent, configure an External app in Testing with
   `nathan.papes@gmail.com` as its sole test user; do not add scopes beyond the
   existing Google login requirements.
5. Start creation of one **Web application** client named
   `Gala AWS staged OAuth migration`. Enter exactly these two authorized
   redirect URIs and no others:
   `https://dev.learngala.dev/authentication_strategies/auth/google/callback`
   and
   `https://learngala.dev/authentication_strategies/auth/google/callback`.
   Explicitly verify that the client is neither a service-account key nor an
   IAM Workforce client. Stop immediately before the console's final Create
   action, show the non-secret name/type/URI checklist to the developer, and
   wait for action-time confirmation.
6. After confirmation, click Create once and download the client JSON directly
   to `temporary_json_path`. In the same protected shell that owns the cleanup
   trap, disable command tracing and history, silently parse `.web.client_id`,
   `.web.client_secret`, `.web.project_id`, and `.web.redirect_uris` with `jq`,
   and retain the first two only in memory. Before any Heroku read, require a
   readable JSON object, nonblank migration ID/secret, the exact project ID, and
   the exact two redirect URIs with no extras. On any failure, clear variables,
   run the cleanup trap, and stop. Do not open, print, or copy the JSON through a
   command that emits its contents.
7. Only after every tool/auth/stage/download/JSON preflight succeeds, run the
   two permitted Heroku commands exactly once each in that same shell and no
   other Heroku config command:
   `heroku config:get GOOGLE_CLIENT_ID --app msc-gala` and
   `heroku config:get GOOGLE_CLIENT_SECRET --app msc-gala`. Capture each stdout
   directly into a distinct shell variable via command substitution; immediately
   capture its exit status, require status zero plus nonblank content without
   echoing it, and never retry either command. If either read fails or is blank,
   clear all in-memory values, run cleanup, report the blocker, and do not issue
   another Heroku read.
8. Keep the protected shell alive with all four validated values in memory
   until eight writes succeed: each of the four names once to explicit
   `--stage dev` and once to explicit `--stage production`. Pipe each value over
   stdin to `sst secret set`, always retaining
   `AWS_PROFILE=gala SST_STAGE=dev`; never place a value in an argument and
   never pass `--fallback`. Check only command exit status. If a write fails,
   keep the shell and variables alive, diagnose without printing values, and
   retry only that SST write; never repeat a successful Heroku read. If the
   failure cannot be recovered in the live shell, do not exit silently—report
   that exact-once source reads have been consumed and await developer direction.
9. After all eight writes succeed, unset both client-secret variables
   immediately, retain only the two public client IDs in the protected shell
   for the later boolean browser comparisons, invoke the cleanup routine
   explicitly, and verify `temporary_json_path` is absent; the installed trap
   repeats the absence check on normal exit, failure, or interruption. Do not
   list secret values or retain value-bearing transcripts.
10. After local automated checks pass, commit the intended source files and
    push the branch to run ordinary GitHub CI only. Do not dispatch
    `.github/workflows/deploy.yml` during this bootstrap. After ordinary CI
    succeeds, dispatch the workflow's dev `user_data=diff` path only when the
    developer separately authorizes it. That first authenticated diff must run
    `sst diff` directly without `sst refresh` and upload generated
    `infra/sst-env.d.ts` as a one-day artifact; it cannot authorize deployment.
    Download the artifact, verify that only the expected four Google secret
    resource names were added, commit that generated file without hand edits,
    push, and require ordinary CI plus all final local checks to pass again.
    Then, only with separate developer authorization, run a second
    non-refreshing GitHub diff against that exact final commit and review its
    complete plan. Any deletion or replacement not expressly required by this
    ticket keeps deployment unauthorized and requires drift reconciliation,
    regardless of resource type. Before any deploy authorization, also build a
    value-free inventory of every secret name and explicit stage emitted by the
    prior `sst secret list` invocation using command/transcript metadata only;
    do not rerun a value-bearing list command. For every affected credential,
    rotate it at its authoritative issuer, update each consumer (including each
    explicit SST stage), revoke the old value, and record only boolean evidence
    that the replacement works and the old value is rejected. If the inventory
    includes the legacy Google pair consumed by Heroku, a Rails signing key, or
    any other credential whose issuer/consumer mutation is outside this ticket,
    keep deployment unauthorized and obtain separate owner approval and a
    reviewed rotation procedure; do not mutate Heroku or bypass invalidation.
    Only a clean second diff plus complete exposure remediation may be followed
    by a separately and explicitly authorized AWS dev deploy. Pushes, ordinary
    CI, and non-deploying safety diffs may proceed while that remediation is
    pending. Do not run any Heroku deployment/config command and do not deploy
    production code.
11. In the browser, sign in to AWS dev as `nathan.papes@gmail.com`; compare the
   public authorization `client_id` against the expected migration ID held only
   in the active verification session and record only a boolean match. Confirm
   the authorization request uses the migration client and the callback returns to
   the pre-existing Reader. Verify through non-secret record counts/associations
   that the new `google` strategy exists and the legacy strategy remains. Start
   a dev authorization request with a blank or known non-allowlisted email and
   compare its public client ID against the expected legacy ID without recording
   either value, record only a boolean match, and do not complete a
   record-creating callback. Unset both public client-ID variables after these
   comparisons.
12. Perform a read-only browser login against the live Heroku-hosted Gala
    application and confirm Google login still succeeds. Do not use the Heroku
    CLI for this verification and do not deploy, restart, or alter its config.
    The only pre-verification push exception is the workflow bootstrap and its
    generated-type follow-up described in step 10. No AWS dev deployment occurs
    until local checks, generated-type validation, the second authenticated SST
    diff, and leak checks pass. Complete browser verification and Quark verify
    before shipping or merging.

## Test strategy

- (AC3, AC4, AC5, AC6, AC7, AC11, AC12) The setup callable selects a complete
  migration pair only for the existing allowlisted Reader, records that client
  class, and consumes the class on callback without re-evaluating Reader state;
  every ineligible or incompletely configured authorization uses the legacy
  pair, a missing callback marker is legacy-compatible, and a recorded migration
  callback with a now-incomplete pair reaches the real callback phase, attempts
  token exchange with sentinel migration credentials, and fails as
  `invalid_credentials` without switching clients or writing records —
  service/request specs written first; TDD yes.
- (AC8, AC9, AC10) Sign-in and registration construct an OAuth URL from only a
  normalized email while all other form fields are excluded, and Rails redacts
  that routing email from filtered request paths/logs — Jest helper/controller
  tests and a Rails request-filter regression written first plus request-level
  rendered-hook assertions; TDD yes.
- (AC13, AC14) Unverified and verified-mismatched migration callbacks take the
  existing failure redirect before model persistence — request specs written
  first, asserting unchanged Reader and AuthenticationStrategy counts; TDD yes.
- (AC15, AC16, AC17, AC18) A verified matching migration callback attaches a
  new `google` UID strategy to the existing Reader, retains the old strategy,
  creates no Reader, and uses the existing callback route — request spec
  written first; TDD yes.
- (AC19, AC20, AC21, AC22) All four SST resources are retained, projected as
  SecureStrings to every Rails workload, present in the deploy inventory, and
  present in generated SST types — Ruby infrastructure contract assertions
  written before the TypeScript/workflow changes; TDD yes.
- (AC23, AC24, AC25, AC33, AC34, AC35, AC36, AC37) The external provisioning
  run uses exact-once Heroku reads, stdin-only explicit dev/production writes,
  required CLI environments, no SST fallback, no Heroku mutation, and verified
  temporary-file removal — action-time checklist plus command exit-status
  evidence recorded without values; TDD not applicable.
- The prior value-bearing SST list is handled as a credential-exposure event:
  record affected names/stages without values, rotate at authoritative sources,
  update every consumer, and prove old-value invalidation before deployment;
  action checklist and boolean evidence, TDD not applicable.
- (AC26, AC27, AC28, AC38, AC39) The existing project and consent setup contain
  one correctly named Web client with exactly the two approved redirects —
  browser inspection before and after the confirmation-gated Create action;
  TDD not applicable.
- (AC29, AC30, AC31) Nathan's real dev migration login, a dev legacy-client
  authorization, and a read-only live Heroku Google login work before
  merge/ship —
  browser UAT with non-secret observations; TDD not applicable.
- (AC32) Run focused RSpec and Jest tests, the complete relevant
  authentication request/model suite, RuboCop for every changed Ruby file,
  both repository infrastructure/workflow contract scripts, then use the first
  authenticated GitHub diff for SST type generation. After committing that
  artifact and rerunning CI/final checks, run a second SST dev diff against the
  exact final commit; neither diff may run `sst refresh`. Finish with
  `git diff --check`, a staged
  secret scan after staging only intended source files, and a status check that
  proves `.work/` plus all pre-existing untracked paths are uncommitted —
  automated verification; TDD not applicable.

## Definition of done

- [ ] (AC1) `git branch --show-current` is
  `oauth/staged-google-key-rotation`, and merge-base/history inspection proves
  the branch started at `2b808a57`.
- [ ] (AC2) The pre-work inventory confirms `.omx/`, `.work/`, `GCP_OAUTH.pdf`,
  and the root `sst-env.d.ts` remain intact and uncommitted.
- [ ] (AC3) An automated authorization request for the existing normalized
  allowlisted Reader exposes the migration client ID when both migration
  variables are nonblank.
- [ ] (AC4, AC5, AC6) Automated requests with blank, unknown, and existing
  non-allowlisted emails each expose the legacy client ID.
- [ ] (AC7) Automated requests prove a missing migration ID and a missing
  migration secret independently fall back to the legacy client.
- [ ] (AC8, AC9, AC10) Jest plus rendered-view assertions prove both Google
  links send at most normalized `reader_email` and never send password,
  confirmation, name, locale, or any other form value; a Rails regression
  proves `reader_email` is redacted from filtered request paths/logs.
- [ ] (AC11, AC12) Request/callback specs prove migration and legacy callbacks
  each consume the session-recorded client class used for their authorization
  request even if Reader state changes; missing markers use legacy, markers are
  cleared on callback/failure, and unavailable recorded-migration credentials
  fail closed without model writes.
- [ ] (AC13, AC14) Request specs prove unverified and mismatched migration
  emails use the existing failure redirect with zero Reader and authentication
  strategy writes.
- [ ] (AC15, AC16) A successful callback spec proves the new Google UID links
  to the pre-existing allowlisted Reader, no duplicate Reader is created, and
  the old Google strategy remains.
- [ ] (AC17, AC18) Automated assertions prove every new strategy still stores
  provider `google` and the callback remains
  `/authentication_strategies/auth/google/callback`.
- [ ] (AC19) Source and contract checks find all four Google names as retained
  `sst.Secret` resources.
- [ ] (AC20) Contract checks prove all four values pass through the existing
  SecureString/SSM map to both Rails services and every Rails task.
- [ ] (AC21) The deploy workflow contract proves all four names are in the
  retained-secret inventory.
- [ ] (AC22) SST's normal generation command produces repository
  `infra/sst-env.d.ts` entries for all four resources without modifying the
  untracked root type file.
- [ ] (AC23) Exit-status evidence confirms the two current Heroku values were
  piped over stdin to explicit dev and production SST stage values, with no
  account-wide fallback value, after all other fallible preflights completed.
- [ ] (AC24) Exit-status evidence confirms the migration ID and secret were
  piped over stdin to explicit dev and production SST stage values, with no
  account-wide fallback value.
- [ ] (AC25) The migration JSON was created only under `/private/tmp`, was
  protected by the installed cleanup trap, was deleted with `/bin/rm -P` after
  both stage writes, and its exact path is absent on every exit path.
- [ ] (AC26, AC38) Browser inspection confirms account slot `authuser=1` has
  selected existing project display name `gala`, ID
  `project-78c8a048-9020-484c-b18`, containing a Web client named
  `Gala AWS staged OAuth migration`.
- [ ] (AC27) Browser inspection confirms the new client has exactly the dev
  and production callback URIs specified in the ticket and no additional URI.
- [ ] (AC28) Browser inspection confirms the existing consent configuration was
  reused, or an absent configuration was created as External/Testing with only
  `nathan.papes@gmail.com` as a test user.
- [ ] (AC29) A real AWS dev login as `nathan.papes@gmail.com` uses the migration
  client, returns to the existing Reader, and adds the new strategy association;
  UAT records only a boolean public-client-ID match.
- [ ] (AC30) A real AWS dev request with a blank or known non-allowlisted email
  exposes the public legacy client ID and does not create a migration record;
  UAT records only a boolean public-client-ID match.
- [ ] (AC31) A read-only browser check confirms Google login still succeeds on
  the untouched live Heroku-hosted application.
- [ ] (AC32) Focused RSpec/Jest, the relevant authentication suite, changed-file
  RuboCop, and SST/workflow contract scripts pass before the workflow-bootstrap
  push; ordinary GitHub CI passes without dispatching deploy; a first
  authenticated dev SST diff without `sst refresh` generates
  `infra/sst-env.d.ts`; the generated-only follow-up commit passes final checks
  and ordinary CI; and a second non-refreshing diff against that exact commit
  contains no ticket-unrelated deletion or replacement before deployment can
  be authorized.
- [ ] (AC33) `git diff`, staged secret scanning, command-output review, Quark
  artifact review, and temporary-file inspection reveal no client secret value;
  no secret was passed as a command argument or retained outside SST/AWS.
- [ ] (AC34) The provisioning record confirms every AWS CLI and SST CLI command
  had `AWS_PROFILE=gala SST_STAGE=dev`, including commands targeting production.
- [ ] (AC35, AC36) The protected shell-session checklist records exactly one
  Heroku CLI read of `GOOGLE_CLIENT_ID` and exactly one read of
  `GOOGLE_CLIENT_SECRET`, both via the two named `config:get` commands against
  `msc-gala`, without recording either value or invoking another config command.
- [ ] (AC37) Shell history/command review and Heroku browser verification show
  no Heroku deploy, restart, config write, environment change, or other Heroku
  CLI mutation occurred.
- [ ] (AC39) Google Cloud activity and project inspection show no project was
  created, renamed, replaced, or deleted.
- [ ] A value-free inventory identifies every name/stage emitted by the prior
  `sst secret list`; every affected credential has been rotated at its issuer,
  all explicit-stage and external consumers have the replacement, and boolean
  checks prove the replacement works and the old value is invalid. Any item
  requiring Heroku or other out-of-scope mutation keeps deployment unauthorized
  until separately approved and completed.
- [ ] The final source diff contains only ticket files, `.work/` is not staged,
  `git diff --check` passes, and `scripts/scan-staged-secrets` passes after
  staging only the intended source changes.

## Risks & mitigations

- Authorization and callback could choose different clients — persist only the
  selected class in the signed session, consume it before callback token
  exchange, never re-evaluate Reader eligibility on callback, clear it on all
  callback/failure paths, and test Reader/config changes between both legs.
- An attacker could submit the allowlisted email in the authorization URL —
  treat it only as routing intent; require Google's independently returned,
  verified, normalized email to match before any Reader or strategy write.
- Callback validation could run after `find_or_create_by!` and leave records on
  failure — order the migration guard before both persistence callbacks and
  assert record counts remain unchanged for mismatch and unverified cases.
- Mutable OmniAuth strategy options could leak between requests — mutate only
  the per-request strategy copy supplied in the Rack environment and explicitly
  set legacy credentials on every non-migration invocation.
- A partially configured migration pair could send an invalid OAuth request —
  require both migration values to be present; independently test each missing
  variable.
- Form serialization could disclose passwords or future fields — build the URL
  from the fixed OAuth href and a single email target rather than a form payload;
  test arbitrary extra inputs as well as current sensitive fields, and add the
  routing email key to Rails' request-parameter filters.
- A new UID could create a duplicate Reader or replace the old strategy — leave
  existing model linking code unchanged and prove the Reader count, both
  strategy associations, and provider value in a full callback request spec.
- A redirect typo could make the new Google client unusable — display the exact
  name/type/two-URI checklist and require developer confirmation immediately
  before Create, then inspect the created client before provisioning.
- Consent or project edits could affect unrelated Google clients — verify the
  exact account/project identity first, reuse existing consent configuration,
  and prohibit project creation, rename, replacement, and unrelated consent
  changes.
- A secret could leak through shell arguments, tracing, logs, or generated
  artifacts — disable tracing, keep values in memory, use stdin-only SST writes,
  suppress value-bearing output, avoid secret-list commands, run the staged
  scanner, and review all artifacts before push. Treat every value previously
  emitted by `sst secret list` as exposed, inventory them without reproducing
  their values, and rotate them before deployment authorization.
- One SST write could fail after an exact-once Heroku read — complete every
  fallible non-Heroku preflight first, keep the protected shell session alive
  with all four values until all eight explicit stage writes succeed, and retry
  only failed SST writes without rereading Heroku.
- An account-wide fallback could violate explicit stage isolation — never pass
  `--fallback`; use explicit `--stage dev` and `--stage production` writes for
  every secret.
- The client JSON could land outside `/private/tmp` or survive provisioning —
  prove direct-download capability with non-secret data before Create, stop if
  the destination cannot be guaranteed, and install a trap that runs
  `/bin/rm -P` plus an absence check on success, failure, and interruption.
- SST declarations could omit a Rails task or be pruned by deploy workflow —
  extend both contract scripts to enumerate all services/tasks and all four
  retained names before running the dev diff.
- `sst refresh` could persist computed-resource drift before a safety check —
  prohibit refresh in workflow diff mode, assert that contract in the workflow
  test, retain S3 versioning as recovery only, and never use refresh as a
  prerequisite for deployment authorization.
- Live Heroku could be accidentally changed — restrict Heroku CLI use to the
  two exact read commands in one session; perform functional verification in
  the browser and prohibit every Heroku deployment/config/restart command.
- Dev success could be mistaken for production rollout approval — provision
  production secret values only; explicitly prohibit production code deploy,
  DNS cutover, global enablement, and legacy-key deletion.
