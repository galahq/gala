# Agent Playbook: `.dev` Domain Migration Workflows

## Scope
This playbook covers only the AWS/SST migration surface for:

- `learngala.dev` as the explicit production environment.
- `dev.learngala.dev` as the explicit dev environment.
- `*.dev.learngala.dev` as ephemeral pull-request preview environments.

Do not treat this playbook as approval to mutate `https://www.learngala.com` or
Heroku production.

## Workflow Contract
The GitHub Actions surface must stay limited to two workflows:

- `ci.yml`: name `ci`, job id `ci`, ARM runner validation.
- `deploy.yml`: name `deploy`, job id `deploy`, ARM runner site-operator path.

`deploy` has only two inputs: required `stage` and optional `user_data`. Use
`user_data` as the only optional deploy channel for approved operator actions
such as promotion, migration, rollback, or hooks.

For SST dry-run evidence, dispatch `deploy.yml` with `stage=dev` and
`user_data=diff`. That mode checks media CORS without applying changes, runs
`sst refresh`, then runs the deploy wrapper dry-run for `sst diff`. This flag is
not branch preview routing proof.

## Agent Procedure
1. Inspect `ci` evidence before proposing deploy mutation.
2. Use `deploy` with `stage=dev user_data=diff` for SST refresh/diff evidence.
3. Use `deploy` with empty `user_data` for dev branch preview hosts,
   production promotion, and approved site operator actions through `user_data`.
4. Verify the resulting `.dev` hostname, `/up`, ECS service health, CloudFront
   route, and workflow summary.
5. Keep Heroku `.com` production out of scope unless a separate cutover plan is
   explicitly requested.

## Pull Request Preview Rule
Ephemeral preview environments are tied to pull requests through the selected
workflow ref and `*.dev.learngala.dev` branch-derived hostnames. A preview should
be considered temporary validation evidence, not production release approval.
Do not treat a `deploy.yml` run with `user_data=diff` as that hostname evidence;
validate the concrete deploy-derived preview URL separately.
