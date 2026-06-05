# Agent Playbook: `.dev` Domain Migration Workflows

## Scope
This playbook covers only the AWS/SST migration surface for:

- `learngala.dev` as the explicit production environment.
- `dev.learngala.dev` as the explicit dev environment.
- `*.dev.learngala.dev` as ephemeral pull-request preview environments.

Do not treat this playbook as approval to mutate `https://www.learngala.com` or
Heroku production.

## Workflow Contract
The GitHub Actions surface must stay limited to three workflows:

- `ci.yml`: name `ci`, job id `ci`, ARM runner validation.
- `deploy.yaml`: name `deploy`, job id `deploy`, ARM runner site-operator path.
- `infra.yml`: name `infra`, job id `infra`, ARM runner SST wrapper.

`deploy` has only two inputs: required `stage` and optional `user_data`. Use
`user_data` as the only optional deploy channel for approved operator actions
such as promotion, migration, rollback, or hooks.

`infra` is manual-only and thin: `command=diff|deploy`, `stage=dev|production`,
and `preview=true|false`. With `preview=true`, deploy requests resolve to
`sst diff`.

## Agent Procedure
1. Inspect `ci` evidence before proposing deploy or infra mutation.
2. Use `infra` with `command=diff` or `preview=true` for SST evidence.
3. Use `deploy` for dev previews, production promotion, and approved site
   operator actions through `user_data`.
4. Verify the resulting `.dev` hostname, `/up`, ECS service health, CloudFront
   route, and workflow summary.
5. Keep Heroku `.com` production out of scope unless a separate cutover plan is
   explicitly requested.

## Pull Request Preview Rule
Ephemeral preview environments are tied to pull requests through the selected
workflow ref and `*.dev.learngala.dev` branch-derived hostnames. A preview should
be considered temporary validation evidence, not production release approval.
