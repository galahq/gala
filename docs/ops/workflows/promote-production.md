# promote-production(7)

## NAME
promote-production - promote a reviewed Gala ref to the AWS/SST production stage

## SYNOPSIS
Run GitHub Actions workflow `deploy` (`.github/workflows/deploy.yaml`) with
`workflow_dispatch`, select the reviewed ref in the GitHub Actions UI, choose
`stage=production`, and use `user_data` only when an approved operator action is
needed.

## INPUTS
- `stage`: `production`.
- `user_data`: optional promotion, migration, rollback, or approved hook data.

## SIDE EFFECTS
Production deploys target `learngala.dev` and the SST-managed AWS production
stage. The workflow creates release metadata, deploys the ARM64 image path, and
creates a GitHub release. `https://www.learngala.com` and Heroku production are
not mutated by this workflow.

## VERIFY
Check workflow summary, GitHub release, ECS deployment events, task definitions,
`/up`, app logs, Sidekiq health, and expected static asset prefix.

## ROLLBACK
Use `deploy` with a known-good ref and rollback-focused `user_data`, or use
repo-local operator scripts for explicit ECS task-definition rollback. Migrations
and cache changes require application-specific remediation.

## EXAMPLES
Promote the selected ref: workflow `deploy`, `stage=production`, blank
`user_data`. Promote with an approved migration hook: same workflow plus the hook
payload in `user_data`.
