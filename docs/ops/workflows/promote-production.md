# promote-production(7)

## NAME
promote-production - promote a reviewed Gala ref or artifact to AWS production

## SYNOPSIS
Run GitHub Actions workflow `Promote Production AWS`
(`.github/workflows/promote-production.yml`) with `workflow_dispatch`.

## INPUTS
- `source_ref`: reviewed git ref to deploy.
- `release_id`: optional immutable release/artifact ID; defaults to run/date/SHA.
- `dry_run`: `true` first; runs validation and SST diff without mutation.
- `confirmation`: for mutation, type `promote production <source_ref-or-release_id>`.

## DRY RUN
Use `dry_run=true` first. Verify CODEOWNER actor, production environment gate,
AWS identity, release ID, asset prefix, and SST diff in `GITHUB_STEP_SUMMARY`.

## SIDE EFFECTS
When `dry_run=false`, production ECS services, ECR image, S3 static asset release
prefix, CloudFront/app routing, SST resources, and a GitHub release can change.
`https://www.learngala.com` and Heroku production are not mutated.

## VERIFY
Check workflow summary, GitHub release, ECS deployment events, task definitions,
`/up`, app logs, Sidekiq health, and expected static asset prefix.

## ROLLBACK
Use ECS task-definition rollback first for immediate recovery. Use release/image
redeploy for reproducible recovery or drift repair. Handle migrations and caches
with `Maintenance AWS`.

## EXAMPLES
Dry run: `source_ref=main`, `dry_run=true`. Mutate: `dry_run=false`,
`confirmation=promote production main`.
