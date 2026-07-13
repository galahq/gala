# deploy-dev(7)

## NAME
deploy-dev - manually deploy a feature branch to the Gala dev AWS stage

## SYNOPSIS
Run GitHub Actions workflow `Deploy Dev AWS` (`.github/workflows/deploy.yml`) or
`Preview AWS` (`.github/workflows/preview.yml`) with `workflow_dispatch`.

## INPUTS
- `branch`: reviewed branch/ref to deploy.
- `dry_run`: `true` first; prints SST diff and summary without mutation.
- `invalidate_cache`: dev CloudFront invalidation after deploy, deploy workflow only.
- `user_data`: optional allowlisted dev hooks; never pass secrets.

## DRY RUN
Use `dry_run=true` before mutation. Confirm AWS account, `SST_STAGE=dev`,
release ID, asset prefix, preview URL, and planned SST changes in the run summary.

## SIDE EFFECTS
When `dry_run=false`, dev ECS services, ECR image, SST resources, S3 static asset
release prefix, optional CloudFront invalidation, preview URL, and optional PR
comment can change. Heroku production is out of scope.

## VERIFY
Open the preview URL, check `/up`, inspect workflow summary, confirm ECS service
health, and verify the PR comment when an open PR exists for the deployed branch.

## ROLLBACK
Use `Rollback AWS` for ECS task-definition rollback. For dev drift repair, rerun
this workflow with the last known good branch/ref and release ID.

## EXAMPLES
Dry run branch `feature/x`: workflow `Deploy Dev AWS`, `branch=feature/x`,
`dry_run=true`. Create preview comment: workflow `Preview AWS`, same branch,
`dry_run=false`.
