---
ticket: staged-google-oauth-key-rotation
current_step: plan
status: blocked
driving_engine: Codex
updated: 2026-07-10T22:20:08Z
#gate_plan_approved / gate_review are stamped by `quark gate` — do not hand-edit
gate_plan_approved: Nathan Papes @ 2026-07-10T21:41:08.488Z hash=66d07390ea42
gate_review: resolved — by Codex hash=66d07390ea42
---

# State: staged-google-oauth-key-rotation

## Completed

- frame — reconstructed approved staged Google OAuth rotation context, confirmed scope, and resolved 0 open questions
- plan — wrote a TDD, file-by-file implementation and external rollout plan covering AC1-AC39
- review — cold-start critique found 4 Important actionability gaps and 2 Minor clarifications; no implementation or external state was changed
- plan revision — folded I1-I4 and M2 into the executable plan; the revised plan requires persisted client-class binding, preflight-before-Heroku ordering, exact permitted reads, and deterministic `/private/tmp` cleanup
- review re-run — confirmed the revised plan closes every prior Important gap and recorded a resolved verdict bound to plan hash `cf644a8ed445`
- build preflight — build gate passed; dedicated branch and pre-existing untracked inventory confirmed; 23 focused Rails examples, 109 JavaScript tests, and both infrastructure contract scripts passed before edits
- build Task 1 — implemented request-scoped Google client selection, callback identity validation, fail-closed continuity, and existing-Reader linking with strict TDD (`280840fe`); 36 focused examples passed, changed-file RuboCop was clean, and independent review found no issues
- build Task 2 — implemented email-only Google OAuth URL construction plus sign-in/registration Stimulus hooks with strict TDD (`348f0c5d`); 113 Jest tests and 11 request examples passed, focused ESLint was clean, and independent review found no issues
- build Task 3 — committed the four retained Google SST secrets, SecureString projection, deploy inventory, non-refreshing safety-diff workflow, and generated-type artifact export in `2467f774`; both contract scripts pass and ordinary CI run `29125701806` succeeded
- deploy failure diagnosis — run `29124738391` checked out `infra/aws-migration` at `2b808a57`, not this ticket branch; image build/push succeeded and SST failed only when Cloudflare rejected the repository `CLOUDFLARE_API_TOKEN` with error `9109`. The same exact commit deployed successfully in run `27522834795`, and GitHub reports the token secret has not changed since 2026-06-01, so the credential was revoked, expired, or disabled at Cloudflare after the last successful run rather than broken by this branch
- Cloudflare token preflight — rechecked both ignored local bearer-token candidates without printing their values; Cloudflare rejected both. The only locally working credential is the ignored Global API Key in `cloudflare.txt`, which cannot replace the scoped GitHub API token without changing the approved authentication model
- Cloudflare credential migration — created one active user API token named `gala-github-actions-sst-2026-07-10`, restricted to the single `learngala.dev` zone with exactly `Zone Read` and `DNS Write`; verified token, zone, and DNS reads; replaced the three global GitHub Actions `CLOUDFLARE_*` secrets; and wrote an ignored mode-0600 `.env.secrets.migrate` containing the three Cloudflare values plus both normalized Google OAuth pairs without printing values
- workflow-equivalent local SST test — the exact dry-run wrapper path reproduced a Cloudflare provider 6.13.0 account-discovery failure because a zone-scoped token cannot infer its account from `CLOUDFLARE_ACCOUNT_ID`; adding only the provider-required `CLOUDFLARE_DEFAULT_ACCOUNT_ID` alias let `npm ci`, `sst install`, and `sst diff --stage dev` complete from `infra/`, with no refresh or deploy
- scoped-token workflow fix — added a regression contract and mapped the existing GitHub `CLOUDFLARE_ACCOUNT_ID` secret to `CLOUDFLARE_DEFAULT_ACCOUNT_ID`, documented the local findings, ignored `.env.secrets.migrate`, and committed/pushed the unit as `1bd5d1b5`
- post-fix CI — ordinary CI run `29127114823` passed on exact commit `1bd5d1b5` in 2m43s; no deploy workflow was dispatched
- plan re-entry — classified the completed dev preview into required OAuth secret/SSM additions, potentially required ECS task-definition revisions, normal preview-route turnover, and unrelated destructive ALB/routing/log/autoscaling/bastion drift; the plan remains blocked on whether state reconciliation is added to this ticket or split into a separate prerequisite

## Decisions & deviations

- Created `oauth/staged-google-key-rotation` from required commit `2b808a57` as the first repository mutation.
- Recovered historical OAuth contract context from commit `cb584082` and used the developer-provided prior Superpowers design as the approved source of requirements.
- Classified the ticket as auth, PII, and data-integrity sensitive because it changes credential selection and links a new external UID to an existing Reader.
- Scope correction: Heroku is live and immutable for this ticket; no deploy, restart, config write, environment-variable change, or legacy secret copy is allowed.
- Scope correction superseded: AWS infrastructure must add all four `GOOGLE_*` secrets for SST dev and production; current legacy values are copied read-only from Heroku into SST.
- CLI safety: every AWS CLI or SST CLI command must run with `AWS_PROFILE=gala SST_STAGE=dev`; production-secret targeting additionally requires an explicit `--stage production`.
- Heroku transfer safety: fetch each legacy `GOOGLE_*` value from authenticated app `msc-gala` exactly once, retain only in memory, then pipe it into both SST stages in the same shell session.
- External mutation boundary: the legacy-secret transfer may write only SST/AWS secret state; Heroku must remain byte-for-byte operationally unchanged.
- Google Cloud target: use the existing project named `gala`, ID `project-78c8a048-9020-484c-b18`, under `authuser=1`; create only the approved Web OAuth client, never a project.
- SST stage semantics: write explicit values separately to `dev` and `production`; never use SST's account-wide `--fallback`. Rails still falls back to the legacy Google client for ineligible requests.
- Review verdict is `resolved`: the revised plan persists authorization-time client choice, moves all fallible preflight before exact-once Heroku reads, names the only permitted Heroku commands, and makes `/private/tmp` download/cleanup executable.
- Callback continuity decision: record only `legacy` or `migration` in the signed session, consume it during callback setup, treat an absent marker as legacy, and fail closed rather than switch clients if a recorded migration callback loses its credential pair.
- Test runner decision: use `./run-rspec.sh` because the repository test database is reachable only inside Docker; run JavaScript tests inside the existing web container because host `node_modules` is intentionally absent.
- The approved single signed-session selection key remains the scope boundary; concurrent multi-tab OAuth authorization is not added during build.
- Preservation recovery: `.omx/` moved to macOS Trash during subagent startup at 12:43:33; restored the original directory by byte-preserving copy and verified it identical with `diff -qr` before resuming.
- Developer clarified that untracked `.env.google` contains the current legacy Google client values from Heroku, not the new migration client values for `learngala.dev` and `dev.learngala.dev`. Treat it as secret-bearing: never read, source, modify, stage, commit, quote, or scan its contents unless the developer later explicitly authorizes its use at the provisioning checkpoint.
- SST provider install succeeded with `AWS_PROFILE=gala SST_STAGE=dev npx sst install --stage dev`; both plain and standard-direnv `sst diff --stage dev` attempts failed only because Cloudflare API credentials were unavailable. No deploy, secret write, Heroku command, Google Cloud action, or AWS mutation occurred.
- Developer authorized pushing the branch and deploying dev through `.github/workflows/deploy.yml`, whose GitHub secrets supply Cloudflare credentials. The reconciled plan permits a bootstrap push to run authenticated diff and export the generated type artifact, then requires that artifact on the final branch and a second successful authenticated diff before dev deployment.
- Developer requested `.env.google_migrated` contain only the newly provisioned Google OAuth values. No new client JSON is currently available under `/private/tmp` or Downloads, so never substitute `.env.google`; the deployment remains gated on obtaining and provisioning the new pair.
- Local `.env.cloudflare` was checked using only valid `KEY=value` lines; both `CLOUDFLARE_API_TOKEN` and `CF_ACCESS_TOKEN` returned HTTP 401 from Cloudflare's token verification endpoint. The file also has a stray trailing `]` line. Account/zone values cannot be authenticated until a valid token is supplied.
- Superseding Cloudflare result: ignored `cloudflare.txt` contains a Global API Key, account ID, and `learngala.dev` zone ID. With `nathan.papes@atomicobject.com` stored only in that ignored file, authenticated account, zone, and DNS reads returned HTTP 200. SST 4.7.1 provider install, refresh, and diff also initialized Cloudflare successfully.
- Local environment decision: tracked `.envrc` loads ignored `cloudflare.txt` and maps `CLOUDFLARE_ID` to `CLOUDFLARE_API_KEY`; no Cloudflare secret value or personal email is tracked. GitHub Actions continues using global repository `CLOUDFLARE_*` secrets and does not read `.envrc`.
- Workflow-equivalent local refresh completed for `gala/dev`, and the media-bucket CORS check passed. The deploy wrapper must run with local `DATABASE_URL`, `REDIS_HOST`, `REDIS_URL`, and `CACHE_URL` removed from only its subprocess.
- Pinned SST 4.7.1 dry-run completed after repairing its generated macOS arm64 esbuild 0.21.5 binary, but proposed destructive router, ALB/listener/target-group, CloudFront, ECS, task, and log changes. Repeating with the currently deployed image/release/routing metadata and Cloudflare 6.13.0 did not eliminate the drift. No local deploy was performed.
- The versioned SST backend proved today's refresh wrote a new `app/gala/dev.json` checkpoint. The immediately preceding checkpoint was restored exactly (matching content length and ETag), without changing live resources. A state-aligned diff against the restored checkpoint still proposed the unrelated destructive changes.
- The referenced failed GitHub run was an ordinary deploy (`USER_DATA` empty), not a safety diff. Current branch workflow differences do not change Cloudflare secret sourcing or the normal deploy invocation; they only extend `RETAINED_SECRET_KEYS`, remove `sst refresh` from explicit diff mode, and upload the generated type artifact after a successful diff.
- Stop-on-drift applied: do not alter the workflow to use the broader Global API Key plus operator email. The approved plan requires GitHub Actions to continue using a scoped repository `CLOUDFLARE_API_TOKEN`.
- The requested migration bundle contains exactly `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_ZONE_ID`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_MIGRATION_CLIENT_ID`, and `GOOGLE_MIGRATION_CLIENT_SECRET`. It intentionally excludes the Global API Key and operator email; source `*_PASSWORD` and `GOOGLE_MIGRATED_*` names were normalized to the application/SST contract.
- The local workflow-equivalent run used PR 790 metadata and the repository-pinned SST 4.7.1 / Cloudflare 6.13.0 stack. The corrected run proved authentication and provider initialization, but its plan still deletes/replaces unrelated active router routes, ALB/listeners/target group, CloudFront, ECS task definitions/log groups/services, autoscaling policies, and the bastion. Those changes remain unauthorized.

## Next action

- Developer manually verifies the dev sign-in UI by entering `nathan.papes@gmail.com` before selecting Google. Blank-email Google authorization now stops at the form with an explicit validation message; an allowlisted email selects the migration client and exact dev callback.

## 2026-07-10 live OAuth correction

- Root cause: the server-side allowlist and client swap were already correct, but the browser could start Google OAuth with a blank email. Google account selection happens after Rails redirects, so Rails cannot infer the selected Google account at that point; the blank request deliberately used the legacy client, whose Google registration does not accept the dev callback.
- TDD fix: commit `5746decf` requires a nonblank email before the Google authorization redirect and preserves the existing `reader_email`-only contract. The JavaScript suite passed with 114 tests and focused ESLint passed.
- Secret correction: the temporary primary-pair substitution was rolled back before this deployment. Boolean-only SSM verification confirms the dev primary and migration client IDs are distinct and their secrets are distinct. Heroku and production were not read or changed.
- Dev deployment: release `local.20260711032438.5746decf` updated exactly six ECS task definitions and the `GalaWeb`/`GalaWorker` service pointers. No S3 infrastructure, SES, bastion, ALB, CloudFront, DNS, autoscaling, log-group, or preview-route resource changed. Versioned static assets were uploaded only to `gala-static-assets-353760060567`; `msc-gala` was untouched.
- Live evidence: both services reached stable state (1 desired, 1 running, 0 pending), web task revision 51 uses the `5746decf` release image, `/up` returns HTTP 200, and an authorization request for `nathan.papes@gmail.com` emits the migration client ID with exactly `https://dev.learngala.dev/authentication_strategies/auth/google/callback`. Following it reaches Google's normal sign-in page without `redirect_uri_mismatch`.

## Gotchas for the next runner

- `.work/` is untracked but not ignored in this checkout; never stage its artifacts.
- Existing untracked `.omx/`, `.work/`, `GCP_OAUTH.pdf`, and root `sst-env.d.ts` must remain intact.
- Pause for developer confirmation immediately before the Google Console's final Create action.
- Verify the selected project shows display name `gala` plus the exact project ID before editing OAuth configuration.
- Never display or place Google client secret values in arguments, logs, artifacts, or tracked files.
- Do not modify Heroku environment variables; read-only piping of the two current legacy Google values into SST is authorized.
- The only permitted Heroku CLI operations are one read of `GOOGLE_CLIENT_ID` plus one read of `GOOGLE_CLIENT_SECRET` from `msc-gala`; no retries after the values have been obtained.
- Add all four Google SST secrets, with the legacy pair supplying the existing provider fallback path.
- Prefix every AWS CLI or SST CLI command with `AWS_PROFILE=gala SST_STAGE=dev`.
- Production secrets are provisioned in scope, but production code deployment is explicitly out of scope.
- SST's account-wide `--fallback` is explicitly prohibited; set each of the four names independently with `--stage dev` and `--stage production`.
- Review gate is resolved for approved plan hash `cf644a8ed445`; any later plan edit invalidates it and requires re-review.
- AC27's wording is awkward, but the two literal callback URIs in context Constraints are authoritative and must remain unchanged.
- The only permitted Heroku CLI commands remain the two exact `config:get` reads named in the revised plan; all preflight must finish before either command.
