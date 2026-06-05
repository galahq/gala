# deploy-dev(7)

## NAME
deploy-dev - manually deploy a ref to the Gala dev AWS stage

## SYNOPSIS
Run GitHub Actions workflow `deploy` (`.github/workflows/deploy.yaml`) with
`workflow_dispatch`, choose `stage=dev`, and optionally provide `user_data` for
approved site-operator action data.

## INPUTS
- `stage`: `dev`.
- `user_data`: optional action data for approved deploy hooks, migrations,
  rollback-style recovery, or preview behavior tied to the selected workflow ref.

## SIDE EFFECTS
The workflow uses the selected GitHub ref, builds the ARM64 release path, deploys
through `scripts/deploy-sst.sh`, and targets the `.dev` AWS/SST surface. Dev
preview hosts use `*.dev.learngala.dev`. Heroku production is out of scope.

## VERIFY
Open the preview URL, check `/up`, inspect workflow summary, confirm ECS service
health, and verify the PR preview comment when an open PR exists for the ref.

## ROLLBACK
Rerun `deploy` with a known-good ref and appropriate `user_data`, or use the
repo-local operator scripts for explicit ECS task-definition recovery.

## EXAMPLES
Deploy the selected branch to dev: workflow `deploy`, `stage=dev`, blank
`user_data`. Run an approved deploy hook: same workflow plus the hook payload in
`user_data`.
