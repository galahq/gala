# maintenance(7)

## NAME
maintenance - run guarded Gala AWS migration, one-off, and cache operations

## SYNOPSIS
Maintenance is no longer a separate GitHub Actions workflow. Use `deploy`
(`.github/workflows/deploy.yaml`) and pass approved maintenance action data in
`user_data`, or use repo-local operator scripts when a direct ECS one-off task or
CloudFront operation is required.

## INPUTS
- `stage`: `dev` or `production` on the `deploy` workflow.
- `user_data`: optional migration, one-off, cache, or recovery action data.

## SIDE EFFECTS
Migrations and Rails one-offs must run as ECS tasks using the production app
image and AWS environment. GitHub runners must not run Rails commands directly
against production DB/Redis. CloudFront invalidation affects configured path
scope and is irreversible.

## VERIFY
For ECS tasks, check task status and CloudWatch logs. For Rails cache clear,
check app behavior or logs. For CloudFront, check invalidation status and path
scope. Confirm no Heroku mutation appears in logs.

## ROLLBACK
Migrations need application/data-specific remediation. Cache clears are not
rolled back. CloudFront invalidation is irreversible; wait for cache refill.

## EXAMPLES
Run a migration through an approved `user_data` payload on `deploy`. For direct
operator work, use the repo-local scripts and keep the GitHub workflow set at
`ci`, `deploy`, and `infra` only.
