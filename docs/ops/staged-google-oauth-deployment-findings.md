# Staged Google OAuth deployment findings

Status: local credentials verified; deployment blocked by unsafe SST diff

## Current state

- Branch: `oauth/staged-google-key-rotation`
- SST app: `gala`
- Target stage: `dev`
- Heroku remains untouched.
- No production code deployment has been performed.
- The branch is pushed and ordinary GitHub CI passed. No GitHub Actions SST
  deployment has been performed from this branch.
- No local SST deployment has been performed.

## Credentials and secrets

- `infra/.env.google_migrated` contains the newly provisioned migration client pair.
- The migration pair was provisioned into SST for `dev` and `production` as:
  - `GOOGLE_MIGRATION_CLIENT_ID`
  - `GOOGLE_MIGRATION_CLIENT_SECRET`
- The legacy pair from `.env.google` was also provisioned into SST for `dev` and
  `production` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, because the
  application intentionally retains the legacy fallback path.
- A previously supplied Cloudflare token was stored in SST for `dev` and
  `production` as `CLOUDFLARE_API_TOKEN`, but Cloudflare later rejected that
  token. A replacement scoped token is stored in GitHub Actions and the ignored
  local migration bundle; it has not been copied into SST secret state.
- Secret values are not reproduced in this document or Git-tracked source.
- A prior `sst secret list` invocation unexpectedly printed values to the local
  command transcript. The exact affected name/stage inventory has not yet been
  reconstructed. The Cloudflare credential was replaced afterward, but that
  alone does not close the exposure event.
- Before any deployment is authorized, reconstruct a value-free inventory from
  command/transcript metadata without rerunning `sst secret list`. Rotate every
  affected credential at its authoritative issuer, update every explicit-stage
  and external consumer, and record only boolean evidence that the replacement
  works and the old value is rejected. Credentials with Heroku or other
  out-of-scope consumers require separate owner approval; do not mutate those
  consumers as part of this ticket.

## Cloudflare verification

- `cloudflare.txt` contains a Cloudflare Global API Key, account
  ID, and zone ID. Global API Keys authenticate with `X-Auth-Key` plus
  `X-Auth-Email`; they are not Bearer API tokens.
- The operator email is stored only in ignored `cloudflare.txt`. Tracked
  `.envrc` loads that file and maps `CLOUDFLARE_ID` to
  `CLOUDFLARE_API_KEY` for the provider.
- Authenticated Cloudflare API reads returned HTTP 200 for the expected account,
  the `learngala.dev` zone, and its DNS records.
- The pinned Cloudflare provider installed successfully, and SST refresh and
  diff both initialized Cloudflare with these local credentials. This proves
  the credentials are usable by the local SST planning path.
- A Global API Key is broader than the scoped API token used by GitHub Actions.
  Rotate it after this work and prefer a scoped token for routine operations.
- The replacement GitHub Actions token is restricted to the single
  `learngala.dev` zone with `Zone Read` and `DNS Write`. Value-free API
  readback confirmed one active token, one zone resource, and those two
  permission groups.
- Cloudflare provider 6.13.0 cannot infer an account from this zone-scoped
  token. It requires `CLOUDFLARE_DEFAULT_ACCOUNT_ID`; the workflow maps the
  existing `CLOUDFLARE_ACCOUNT_ID` repository secret to that provider variable
  without granting the token account-wide permissions.
- No Cloudflare DNS mutation was performed solely to test access.

## Local SST findings

- Running SST from the repository root selected an unrelated parent config and
  reported `App: archie-api`. Gala commands must run from `infra/`.
- Gala's pinned SST 4.7.1 platform initially failed during Pulumi evaluation
  with `Error: The service was stopped`. Its generated arm64 esbuild binary was
  killed by macOS (`status 137`) even when invoked directly. Reinstalling the
  generated platform's exact `@esbuild/darwin-arm64@0.21.5` package repaired the
  local binary; subsequent provider installs preserved the repair.
- SST 4.17.0 from `infra/` fixed the esbuild failure, but required Cloudflare
  provider version `6.15.0` or newer. That experiment was abandoned; the config
  is back on the repository-pinned SST 4.7.1 / Cloudflare 6.13.0 combination
  used by CI and the deployed stack.
- The full SST 4.17 dev diff completed, but it proposed destructive changes:
  router route deletions/re-creations, CloudFront/ALB changes, ECS task and
  service replacements, and deletion of existing task/log resources. This diff
  is not approved for deployment.
- The targeted `GalaWeb` diff did not avoid the issue; it failed under SST 4.7.1
  and the full SST 4.17 diff exposed the broader state drift.
- The workflow-equivalent pinned 4.7.1 refresh completed successfully for app
  `gala`, stage `dev`, after the local binary repair.
- The workflow-equivalent media bucket CORS check passed without applying a
  change.
- The first deploy-wrapper dry-run correctly refused a local `DATABASE_URL`.
  Removing local database/cache variables from only the subprocess matches the
  GitHub Actions environment and allowed the dry-run to complete.
- The completed pinned 4.7.1 diff still proposed unsafe changes: deletion of
  active `dev.learngala.dev`, wildcard, and prior preview router state;
  load-balancer/listener/target-group replacement; CloudFront and ECS service
  updates; and deletion/replacement of unrelated task/log resources.
- Repeating the diff with the currently deployed image, release metadata, base
  URL, preview host, and original Cloudflare provider did not eliminate that
  destructive infrastructure drift. A local deploy was therefore stopped.
- The local refresh wrote a new version of the versioned SST backend object.
  The exact immediately preceding `gala/dev` state version was restored after
  diagnosis; its content length and ETag match the pre-refresh checkpoint.
  No live AWS or Cloudflare resource was changed by that state rollback.
- A state-aligned diff against the restored checkpoint still proposed the same
  unrelated replacements/deletions. The unsafe plan is therefore not caused by
  leaving the refreshed checkpoint active.
- A fresh workflow-equivalent local dry run used the new scoped token, the
  `gala` AWS profile, PR 790 release metadata, `npm ci`, `sst install`, and
  `sst diff --stage dev` from `infra/`. The unmodified workflow environment
  failed because `CLOUDFLARE_DEFAULT_ACCOUNT_ID` was absent. Adding only that
  alias allowed the complete SST 4.7.1 diff to finish, confirming the provider
  account-ID mapping as the root cause.
- The corrected dry run still proposed the same unrelated ALB/listener/target
  group, CloudFront, ECS task/log group, autoscaling, bastion, and router-route
  deletions or replacements. No `sst refresh` or `sst deploy` ran.

## Workflow path

.github/workflows/deploy.yml supplies the Cloudflare GitHub secrets and maps
the existing account ID secret to `CLOUDFLARE_DEFAULT_ACCOUNT_ID` for scoped
token compatibility. Its revised `user_data=diff` path runs:

1. `scripts/deploy-sst.sh --dry-run` with workflow release metadata, which runs
   `sst diff` without a preceding `sst refresh`
2. No deployment when `user_data=diff` is selected
3. Upload of the generated `infra/sst-env.d.ts` as a one-day artifact

The workflow also runs a read-only media-bucket CORS check. After ordinary CI,
the first separately authorized diff may generate the tracked type artifact but
cannot authorize a deploy. The artifact must be verified, committed, pushed,
and covered by final checks and CI. A second separately authorized diff against
that exact final commit must then be reviewed in full. Any deletion or
replacement unrelated to this OAuth ticket keeps deployment unauthorized.

## Required follow-up

- Explain or eliminate every ticket-unrelated deletion or replacement before
  any full SST deployment. In particular, investigate why a
  refresh makes the existing load balancer's computed `loadBalancerType` and
  existing task `volumes` appear replacement-worthy.
- Decide whether the OAuth rollout needs a narrowly scoped infrastructure
  bootstrap or a separately reviewed state-reconciliation change. Do not use a
  full deploy as the reconciliation mechanism.
- Run the first workflow `diff` mode on the pushed branch only after ordinary
  CI passes and the developer separately authorizes it. Do not treat that first
  diff as deployment authorization.
- Keep deployment unauthorized until the prior value-bearing SST output has a
  complete value-free name/stage inventory and every affected credential has
  completed issuer rotation, consumer updates, and old-value invalidation.
- Do not deploy production code or modify Heroku configuration.
