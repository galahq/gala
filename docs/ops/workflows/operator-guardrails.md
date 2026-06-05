# operator-guardrails(7)

## NAME
operator-guardrails - CODEOWNER safety contract for Gala AWS operations

## SYNOPSIS
Audit Docker, ECS, SST, and GitHub Actions changes against this contract before
running or editing operator workflows.

## INPUTS
Read `.github/workflows/ci.yml`, `.github/workflows/deploy.yaml`,
`.github/workflows/infra.yml`, `scripts/deploy-sst.sh`, `infra/sst.config.ts`,
`Dockerfile.production`, `Dockerfile.production-base`, `CODEOWNERS`,
`docs/aws-sst-secret-inventory.md`, and `docs/aws-production-operator-runbook.md`.
Do not copy secret values.

## WORKFLOW SET
Only three GitHub Actions workflow files are allowed:

- `ci.yml`: workflow name `ci`, job id `ci`, automated validation on PR/push.
- `deploy.yaml`: workflow name `deploy`, job id `deploy`, manual site operator deploy path.
- `infra.yml`: workflow name `infra`, job id `infra`, manual thin SST wrapper.

All workflow jobs must run on `ubuntu-24.04-arm` and default Gala container
architecture to `arm64` where a container architecture is emitted.

## DEPLOY CONTRACT
`deploy` owns site-operator actions for the explicit `dev` and `production`
stages. Its only inputs are:

- `stage`: required choice, `dev` or `production`.
- `user_data`: optional string for approved site-operator action data such as
  promotion, migration, rollback, or deploy hooks.

No extra deploy checkboxes or ad hoc optional flags should be added. Use the
workflow ref selected in GitHub Actions as the source ref.

## INFRA CONTRACT
`infra` is manually dispatched only and remains a thin SST wrapper. Its only
inputs are:

- `command`: required choice, `diff` or `deploy`.
- `stage`: required choice, `dev` or `production`.
- `preview`: required checkbox. When checked, mutation is suppressed and the
  effective command is `sst diff`.

Do not add rollback, migration, cache, release, or branch-specific controls to
`infra`; those belong to `deploy` through `user_data` or to repo-local operator
scripts.

## DOMAIN SCOPE
This workflow set is scoped to the AWS/SST `.dev` migration surface only:

- `learngala.dev` for the explicit production environment.
- `dev.learngala.dev` for the explicit dev environment.
- `*.dev.learngala.dev` for pull-request-tied ephemeral previews.

`https://www.learngala.com` and Heroku production remain outside this workflow
migration unless a separate cutover phase explicitly changes that boundary.

## VERIFY
Operators verify workflow name/id, ARM runner, stage, AWS account, release ID,
asset prefix, preview URL or `/up`, PR preview URL when created, CloudFront
routing, ECS health, and logs.

## ROLLBACK
Immediate recovery uses deploy-owned operator action data or repo-local operator
scripts that update ECS task definitions or redeploy a known-good release. These
paths do not roll back database migrations, Rails cache, CloudFront cache, or
static asset prefixes automatically.

## VALIDATION CONTRACT
Parse workflow YAML, lint shell helpers, confirm the three-workflow inventory,
check `workflow_dispatch` inputs, and verify `GITHUB_STEP_SUMMARY` evidence.
Reject arbitrary secret-looking `user_data` and any workflow path that expands
beyond `ci`, `deploy`, and `infra` without a matching docs update.
