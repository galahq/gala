# rollback(7)

## NAME
rollback - recover Gala AWS service state after a `.dev` stage deploy

## SYNOPSIS
Rollback is no longer a separate GitHub Actions workflow. Use `deploy`
(`.github/workflows/deploy.yaml`) with the selected known-good ref and the
minimal `user_data` payload required for the approved recovery action, or use the
repo-local operator scripts for direct ECS task-definition recovery.

## INPUTS
- `stage`: `dev` or `production` on the `deploy` workflow.
- `user_data`: optional rollback or recovery action data.

## SIDE EFFECTS
Recovery can redeploy a known-good ref, trigger an approved hook, or update ECS
state through repo-local operator scripts. These paths do not roll back database
migrations, Rails cache, CloudFront cache, or static asset prefixes by default.

## VERIFY
Check ECS deployment events, desired/running task counts, active task definition,
`/up`, app logs, worker logs, and workflow summary.

## ROLLBACK LIMITS
Task-definition rollback targets must be ACTIVE. If SST has deregistered a prior
revision, re-register an equivalent task definition before mutation. Cache clears
and CloudFront invalidations are not reversible.

## EXAMPLES
Redeploy a known-good ref through `deploy` with the appropriate `stage`. For an
ECS task-definition recovery, use the repo-local operator script path and record
the chosen web/worker task definitions in the incident notes.
