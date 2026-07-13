# rollback(7)

## NAME
rollback - recover Gala AWS service state by task definition or release redeploy

## SYNOPSIS
Run GitHub Actions workflow `Rollback AWS` (`.github/workflows/rollback.yml`)
with `workflow_dispatch`.

## INPUTS
- `stage`: `dev` or `production`.
- `lane`: `task_definition` or `release_redeploy`.
- `service`: `web`, `worker`, or `both` for task-definition rollback.
- `web_task_definition`, `worker_task_definition`: ARN or family:revision.
- `source_ref`, `release_id`: release redeploy target.
- `dry_run`: `true` first.
- `confirmation`: `rollback production <lane>:<service-or-release>`.

## DRY RUN
Print cluster, service names, current task definitions, requested task definitions
or release ID, and exact AWS/SST commands without mutation.

## SIDE EFFECTS
`task_definition` updates ECS services with `aws ecs update-service`.
`release_redeploy` rebuilds/redeploys the selected ref/release path. Neither lane
changes Heroku production.

## VERIFY
Check ECS deployment events, desired/running task counts, active task definition,
`/up`, app logs, worker logs, and workflow summary.

## ROLLBACK
This workflow is the rollback path. Task-definition rollback does not roll back
database migrations, Rails cache, CloudFront cache, static asset prefixes, or
unrelated environment changes. Use `Maintenance AWS` for cache actions.

Task-definition rollback requires ACTIVE target revisions. If SST has
deregistered the prior revision, `aws ecs update-service` fails with
`TaskDefinition is inactive`; re-register an equivalent task definition from the
captured revision before mutation, then dry-run and update services to the new
ACTIVE revision.

## EXAMPLES
Dry run web rollback: `lane=task_definition`, `service=web`,
`web_task_definition=gala-web:42`, `dry_run=true`.
