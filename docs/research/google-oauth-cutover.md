# Google OAuth Cutover Research

This research backs the short Google OAuth operator note in
`docs/ops/workflows/deploy.md`. It is intentionally not a GitHub Actions
workflow manpage; keep workflow-dispatch procedures in `deploy(7)`.

## Purpose
Use this when handing off, rotating, or replacing the Google OAuth credentials
used by Gala's Devise/OmniAuth reader authentication.

The safest production cutover is to keep the existing Google Cloud project and
OAuth web client, add the new maintainers to the project, and rotate the client
secret. Create a new OAuth client or project only when ownership or compliance
requires it.

## Gala OAuth Contract
Current app wiring:

- Gem: `omniauth-google-oauth2` `0.8.0`, through OmniAuth `1.9.1`.
- Devise initializer: `config.omniauth :google_oauth2, ENV['GOOGLE_CLIENT_ID'],
  ENV['GOOGLE_CLIENT_SECRET'], name: 'google'`.
- Provider name stored in Gala: `google`.
- Reader auth start path: `/authentication_strategies/auth/google`.
- Google callback path: `/authentication_strategies/auth/google/callback`.
- Reader link table: `authentication_strategies.provider` plus
  `authentication_strategies.uid`; Google `uid` comes from the user `sub`.

Do not change `name: 'google'` during a credential cutover. A provider rename can
create duplicate authentication strategy rows and makes rollback harder.

Local development uses mocked Google auth by default. To test real Google OAuth
locally, unset `MOCK_OMNIAUTH`, set `LOCALHOST_SSL=1`, provide real
`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, and use the localhost redirect
URI below.

## Google Auth Platform Setup
Use the Google Auth Platform in the Google Cloud Console.

1. Project access handoff
   - In `IAM & Admin`, add the receiving maintainers or a managed Google Group.
   - Use the least privilege that still lets the operator manage OAuth clients,
     branding, audience, data access, and verification.
   - Keep at least one individual owner on the project.
   - Update project and OAuth app contact email addresses to monitored inboxes.

2. Audience
   - Use `External` for public Gala readers with normal Google Accounts.
   - Do not use `Internal` unless access should be limited to one Google
     Workspace or Cloud Identity organization; external readers will hit
     `org_internal`.
   - For public production sign-in, publish the app as `In production`.

3. Branding
   - App name: `Gala` or the approved production brand name.
   - Support email: a monitored address available to the Console account.
   - Homepage: use the public production home page for the active environment.
   - Privacy policy and terms URLs must be public HTTPS URLs and on authorized
     domains. The repo text references `https://about.learngala.com/policies`;
     confirm the final live policy URL before submitting production branding.
   - Authorized domains should include the top private domains used by those
     links and OAuth redirect hosts, such as `learngala.com` and `learngala.dev`.

4. Data Access scopes
   - The pinned gem requests `email` and `profile` by default.
   - If Google Console displays URI forms, use
     `https://www.googleapis.com/auth/userinfo.email` and
     `https://www.googleapis.com/auth/userinfo.profile`.
   - Do not add Drive, Sheets, Gmail, Classroom, or other API scopes as part of
     this sign-in cutover.
   - If a future feature adds sensitive or restricted scopes, verify those
     scopes in a separate staging project first and do not request them from
     production code until Google has approved them.

5. OAuth client
   - Application type: `Web application`.
   - Use separate nonproduction and production clients when possible.
   - A production transition client may contain both the current and target
     production callback URIs while both hosts are live.
   - Store the client secret immediately in the approved secret manager; Google
     only shows full client secrets at creation time for new clients.

## Client URLs
Authorized redirect URIs must exactly match the URI Gala sends to Google. Do not
use wildcards, fragments, query strings, or alternate `www`/non-`www` forms.

Production or current Heroku host, while active:

```text
https://www.learngala.com/authentication_strategies/auth/google/callback
```

AWS/SST production host, when that stage needs Google auth:

```text
https://learngala.dev/authentication_strategies/auth/google/callback
```

AWS/SST dev host:

```text
https://dev.learngala.dev/authentication_strategies/auth/google/callback
```

Local real-OAuth test host:

```text
http://localhost:3000/authentication_strategies/auth/google/callback
```

PR preview hosts under `*.dev.learngala.dev` cannot be registered with a
wildcard. Add the concrete preview callback URI only when that preview truly
needs real Google auth, or use mocked auth for preview QA.

Gala uses server-side OAuth, so Authorized JavaScript origins are not the
primary control. If the Console requires origins or a future Google JS flow is
introduced, use exact origins with no paths:

```text
https://www.learngala.com
https://learngala.dev
https://dev.learngala.dev
http://localhost:3000
```

Google can take from several minutes to a few hours to apply OAuth client URI
changes. Do not schedule the final switch immediately after editing redirect
URIs.

## Secret Rotation Cutover
Use this path for a secure handoff with minimal reader disruption.

1. In Google Auth Platform `Clients`, open the existing production web client.
2. Add a new client secret. Both old and new secrets can work while enabled.
3. Store the new secret in the approved secret store.
4. Update the runtime `GOOGLE_CLIENT_SECRET` while keeping the same
   `GOOGLE_CLIENT_ID`.
5. Restart or redeploy only the web processes that handle Devise/OmniAuth.
6. Validate sign-in on every active host that uses the client.
7. Confirm logs and deployment state show only the new secret path is active.
8. Disable the old secret, validate again, then delete it after the rollback
   window closes.

If sign-in fails immediately after disabling the old secret, re-enable the old
secret in Google Auth Platform, restore the previous runtime value if needed,
and repeat the migration after finding the stale runtime.

## New Client Or Project Cutover
Use this path when the OAuth app must move to a new client ID or Google Cloud
project.

1. Create or select the new Google Cloud project.
2. Configure Branding, Audience, Data Access, and the Web application client
   with the exact Gala redirect URIs above.
3. Put the new `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` into a nonproduction
   environment first.
4. Validate with at least one existing reader and one new reader.
5. For production, set both runtime variables together and restart or redeploy
   the web processes.
6. Keep the old OAuth client enabled until callback success, reader lookup, and
   rollback checks pass.

Google OpenID Connect advertises public subject identifiers and the `sub` claim
is the stable user identifier. Gala also falls back to finding or creating the
reader by email when a new auth strategy row is needed. Even so, verify known
existing readers before deleting the old client because provider name, scope, or
email-verification drift can still change app behavior.

## AWS/SST Note
The Rails app reads only `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Current
SST docs classify them as feature-critical if Google login is required, but
`infra/sst.config.ts` must inject them into the web runtime before AWS Google
login can work. Do not copy secret values into docs, PRs, issues, or workflow
summaries.

Avoid captured `sst secret list` output if it prints values. Prefer setting or
updating the named secrets through the approved operator path, then verify by
logging in rather than by displaying the secret.

## Validation
Manual browser validation is required for real Google OAuth.

1. Open `/readers/sign_in` on the target host.
2. Click `Sign in with Google`.
3. Confirm Google does not show `redirect_uri_mismatch`, `origin_mismatch`,
   `invalid_client`, `deleted_client`, `org_internal`, or an unexpected
   unverified-app warning.
4. Complete sign-in with an existing reader.
5. Confirm the app returns to Gala and does not create a duplicate reader.
6. Sign out, then sign in from `/readers/sign_up` and any magic-link flow being
   cut over.
7. Check browser console and network errors before marking the route group
   complete.
8. Check Rails logs for a successful
   `/authentication_strategies/auth/google/callback` response.

Useful console check, with the email chosen by the operator:

```ruby
reader = Reader.find_by(email: "reader@example.edu")
reader.authentication_strategies.pluck(:provider, :uid)
```

Expected provider is `google`; never paste real `uid` values into public notes.

## Rollback
For a secret rotation, re-enable the old secret in Google Auth Platform and
restore the previous `GOOGLE_CLIENT_SECRET` if the new runtime cannot complete
callbacks.

For a new client or project, restore the previous `GOOGLE_CLIENT_ID` and
`GOOGLE_CLIENT_SECRET`, redeploy or restart the web processes, and validate
reader sign-in before deleting the new client.

Do not delete an old OAuth client during the cutover window. Google can restore
deleted clients only for a limited period, and deleted clients fail auth flows
with `deleted_client`.

## References
- Google Auth Platform overview:
  `https://support.google.com/cloud/answer/15544987`
- Google OAuth client management and secret rotation:
  `https://support.google.com/cloud/answer/15549257`
- Google OAuth audience and publishing status:
  `https://support.google.com/cloud/answer/15549945`
- Google OAuth branding and authorized domains:
  `https://support.google.com/cloud/answer/15549049`
- Google OAuth data access and scope verification:
  `https://support.google.com/cloud/answer/15549135`
- Google OAuth scopes:
  `https://developers.google.com/identity/protocols/oauth2/scopes`
- Google OpenID Connect:
  `https://developers.google.com/identity/openid-connect/openid-connect`
- `omniauth-google-oauth2` v0.8.0:
  `https://github.com/zquestz/omniauth-google-oauth2/tree/v0.8.0`
