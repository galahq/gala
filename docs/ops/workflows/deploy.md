# deploy(7)

## NAME
deploy - deploy Gala stages and run approved operator actions

## SYNOPSIS
`deploy` is `.github/workflows/deploy.yml`, the workflow for dev, nightly, and
AWS/SST production application deploys:

```sh
gh workflow run deploy.yml --ref REF -f stage=dev -f user_data=
gh workflow run deploy.yml --ref REF -f stage=nightly -f user_data=
gh workflow run deploy.yml --ref REF -f stage=production -f user_data=
```

Nightly also runs on a schedule at `09:07 UTC`.

## INPUTS
- `stage`: required choice, `dev`, `nightly`, or `production`.
- `user_data`: optional site-operator action data for approved promotion,
  migration, rollback, recovery, or deploy hooks. Use `diff` for the
  deploy-owned SST dry-run mode.

The selected workflow ref is the source ref. Add no extra deploy flags.

## DRY RUN
Use `user_data=diff` for deploy-owned SST dry-run evidence. Use `infra(7)` for
broader plans. Dry runs must not mutate runtime or release state.

## SIDE EFFECTS
The workflow name is `deploy`, the job id is `deploy`, and the runner is
`ubuntu-24.04-arm`. It builds with `Dockerfile.production`, defaults Gala
containers to `arm64`, and uses `scripts/deploy-sst.sh` as the guarded deploy
wrapper.

`GALA_PRODUCTION_BASE_IMAGE` is intentionally absent. ECS must receive the app
image URI from repository `gala`, never a base-image repository or tag. The
wrapper rejects app image repository names or tags that look like base images.
Secret-looking `user_data` is rejected.

`dev` deploys branch preview hosts under `*.dev.learngala.dev` and comments on
an open pull request when one exists. `nightly` builds `gala:nightly`, pushes
the immutable release-id tag, moves the Git tag `nightly`, and dispatches
`ci.yml` at `--ref nightly` with `smoke_url=https://nightly.learngala.com`.
`production` deploys `learngala.dev`, requires CODEOWNER authorization, creates
or updates a `production.<release-id>` GitHub release, and leaves
`https://www.learngala.com` / Heroku production out of scope.

Nightly always shares non-production static assets, media, and router resources.
It may import the dev VPC, ECS cluster, Postgres instance, and Valkey cluster
only when all shared-dev variables are set:

- `GALA_SHARED_DEV_VPC_ID`
- `GALA_SHARED_DEV_CLUSTER_ID`
- `GALA_SHARED_DEV_DATABASE_ID`
- `GALA_SHARED_DEV_CACHE_CLUSTER_ID`

Source those from dev SST outputs. A partial shared-dev configuration fails
fast. Do not assume shared database/cache use until `sharedDevRuntime: true`
appears in SST outputs and ECS task environment evidence.

Maintenance, migration, rollback, and Google OAuth handoff are not separate
workflows. Use minimal approved `user_data` or repo-local operator scripts.
Rails one-offs must run as ECS tasks using the deployed app image and AWS
environment. GitHub runners must not run Rails commands directly against
production DB/Redis. OAuth cutovers must keep provider name `google` and keep
secrets out of docs, PRs, issues, workflow summaries, and `sst secret list`.

OAuth callback URLs:

```text
https://www.learngala.com/authentication_strategies/auth/google/callback
https://learngala.dev/authentication_strategies/auth/google/callback
https://dev.learngala.dev/authentication_strategies/auth/google/callback
http://localhost:3000/authentication_strategies/auth/google/callback
```

## VERIFY
For every deploy, check workflow summary, AWS identity, release ID, asset
prefix, image tag, ECS service health, web and worker logs, `/up`, expected
custom domain routing, and static asset prefix.

For dev, confirm the preview URL and PR comment. For nightly, confirm the Git
tag `nightly`, ECR tags `nightly` and `<release-id>`, and the dispatched `ci`
run. For production, confirm the GitHub release, Sidekiq health, and no Heroku
mutation. For OAuth changes, complete Google sign-in with an existing reader,
verify no duplicate reader was created, and check Rails callback logs.

## ROLLBACK
Rerun `deploy` from a known-good ref for the same stage, or use an approved
rollback/recovery `user_data` payload. Repo-local operator scripts may be used
for explicit ECS task-definition recovery after confirming the target task
definition is `ACTIVE`.

Deploy rollback does not automatically undo database migrations, Rails cache,
CloudFront cache, static asset prefixes, or Google OAuth client changes. OAuth
secret rollback means re-enable the old Google secret and restore the previous
runtime values before deleting any client.

## EXAMPLES
```sh
gh workflow run deploy.yml --ref feature/ref -f stage=dev -f user_data=
gh workflow run deploy.yml --ref feature/ref -f stage=dev -f user_data=diff
gh workflow run deploy.yml --ref infra/rc_2-9-9 -f stage=nightly -f user_data=
```

## SEE ALSO
`ci(7)`, `infra(7)`, `docs/aws-production-operator-runbook.md`,
`docs/aws-sst-secret-inventory.md`
