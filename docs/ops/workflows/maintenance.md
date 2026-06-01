# maintenance(7)

## NAME
maintenance - run guarded Gala AWS migration, one-off, and cache operations

## SYNOPSIS
Run GitHub Actions workflow `Maintenance AWS`
(`.github/workflows/maintenance.yml`) with `workflow_dispatch`.

## INPUTS
- `stage`: `dev` or `production`.
- `operation`: `migrate`, `one_off`, `rails_cache_clear`,
  `cloudfront_invalidate`, or `both`.
- `one_off_task`: `refresh_indices` or `weekly_report`.
- `cloudfront_paths`: invalidation scope, default `/*`.
- `dry_run`: `true` first.
- `confirmation`: `maintenance production <operation>`.

## DRY RUN
Print stage, operation, ECS task definition, cluster, CloudFront distribution IDs,
path scope, and AWS commands without mutation.

## SIDE EFFECTS
Migrations and Rails one-offs run as ECS one-off tasks using the production app
image and AWS environment. GitHub runners do not run Rails commands against
production DB/Redis. CloudFront invalidation affects configured path scope.

## VERIFY
For ECS tasks, check task status and CloudWatch logs. For Rails cache clear,
check app behavior or logs. For CloudFront, check invalidation status and path
scope. Confirm no Heroku mutation appears in logs.

## ROLLBACK
Migrations need application/data-specific remediation. Cache clears are not
rolled back. CloudFront invalidation is irreversible; wait for cache refill.

## EXAMPLES
Clear caches: `operation=both`, `cloudfront_paths=/*`, `dry_run=true`. Run
migration: `operation=migrate`, then rerun with exact production confirmation.
