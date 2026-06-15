# deploy(7)

## NAME
deploy - deploy Gala dev previews and production

Workflow file: `.github/workflows/deploy.yml`.

## SYNOPSIS
```sh
gh workflow run deploy.yml --ref REF -f stage=dev -f user_data=
gh workflow run deploy.yml --ref REF -f stage=production -f user_data=
```

Use `user_data=diff` for deploy-owned SST dry-run evidence. Use
`user_data=sst_unlock` only to clear a stale SST app lock.

## INPUTS
- `stage`: required choice, `dev` or `production`.
- `user_data`: optional approved operator action data. `diff` runs the dry-run
  path. `sst_unlock` clears a stale SST app lock and exits before deploy.

## DRY RUN
`stage=dev user_data=diff` checks shared media CORS without applying changes,
runs SST refresh, then runs the deploy wrapper dry run. It does not prove a
preview hostname; run an actual dev deploy for that.

## UNLOCK
`stage=dev user_data=sst_unlock` runs the SST unlock path and exits before image
build, deploy, preview comments, or release creation.

## SIDE EFFECTS
The workflow name is `deploy`, the job id is `deploy`, and the runner is
`ubuntu-24.04-arm`. It builds the app image with `Dockerfile.production`, uses
`scripts/deploy-sst.sh`, and rejects secret-looking `user_data`.

Dev deploys use `https://pr-NUMBER.dev.learngala.dev` when the selected ref has
an open pull request. Manual dev deploys without a pull request use a sanitized
branch fallback under `dev.learngala.dev`. Dev deploys export the concrete
preview host and route flag for the shared CloudFront router.

Production deploys use the production stage contract and require the configured
repository authorization. Heroku production cutover is out of scope for this
workflow note.

## VERIFY
For every deploy, check the workflow summary, release ID, image tag, ECS service
health, `/up`, static assets, and the expected custom domain route.

For dev, confirm the preview URL format, PR comment when a PR exists, check-only
media CORS, and a page with existing ActiveStorage media. No image or media
response should return HTTP 400 or higher.

## ROLLBACK
Rerun `deploy` from a known-good ref for the same stage, or use an approved
rollback `user_data` payload. Rollback does not automatically undo database
migrations, cache state, static asset prefixes, or external provider changes.

## EXAMPLES
```sh
gh workflow run deploy.yml --ref feature/ref -f stage=dev -f user_data=diff
gh workflow run deploy.yml --ref feature/ref -f stage=dev -f user_data=sst_unlock
gh workflow run deploy.yml --ref feature/ref -f stage=dev -f user_data=
```

## SEE ALSO
`ci(7)`, `docs/agent-playbooks/dev-domain-preview-migration.md`,
`docs/aws-production-operator-runbook.md`
