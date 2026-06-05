# infra(7)

## NAME
infra - run thin SST diff/deploy operations for Gala infrastructure

## SYNOPSIS
`infra` is `.github/workflows/infra.yml`. Manual dispatch:

```sh
gh workflow run infra.yml --ref REF -f command=diff -f stage=dev -f preview=true
gh workflow run infra.yml --ref REF -f command=deploy -f stage=nightly -f preview=false
```

## INPUTS
- `command`: required choice, `diff` or `deploy`.
- `stage`: required choice, `dev`, `nightly`, or `production`.
- `preview`: required boolean. When `true`, mutation is suppressed and the
  effective command is `sst diff`.

## DRY RUN
Use `command=diff` or `preview=true` for non-mutating SST plan evidence. The
effective command must be `sst diff`, even if `command=deploy` was selected with
preview enabled.

## SIDE EFFECTS
The workflow name is `infra`, the job id is `infra`, and the runner is
`ubuntu-24.04-arm`. The job is bound to the selected GitHub environment,
configures AWS OIDC, installs infra dependencies, installs SST providers, syncs
media bucket CORS, then runs `npx sst diff` or `npx sst deploy` from `infra/`.

`infra` is deliberately thin. Do not add rollback, migration, cache, release, or
branch-specific controls here. Those belong to `deploy(7)` through `user_data`
or to repo-local operator scripts.

The stage choices match `deploy`: `dev`, `nightly`, and `production`.
`GALA_CONTAINER_ARCHITECTURE` defaults to `arm64`. Nightly accepts the same
optional shared-dev runtime variables as `deploy`; copy them only from trusted
dev SST outputs.

`command=deploy` with `preview=false` may mutate CloudFront routing, ECS
services, VPC, RDS, Valkey, S3-backed static assets, and related IAM resources
according to `infra/sst.config.ts`. It does not create GitHub releases, move Git
tags, dispatch CI, run migrations, or perform application rollback.

## VERIFY
Check workflow summary, AWS account, selected stage, effective command, SST
output, and whether a mutation was requested. For deploys, inspect SST outputs,
CloudFront/router aliases, ECS health, and `/up` through the relevant
`deploy(7)` acceptance checks before treating the environment as usable.

## ROLLBACK
For accidental `infra` mutation, run `infra` with `command=diff` first to see
the desired corrective plan, then use a reviewed follow-up `infra` deploy or
repo-local SST command. Application rollback, task-definition recovery,
migrations, cache, and release metadata remain `deploy(7)` or operator-script
concerns.

## EXAMPLES
Preview dev infrastructure:

```sh
gh workflow run infra.yml --ref REF -f command=diff -f stage=dev -f preview=true
```

Deploy nightly infrastructure:

```sh
gh workflow run infra.yml --ref REF -f command=deploy -f stage=nightly -f preview=false
```

## SEE ALSO
`deploy(7)`, `ci(7)`, `scripts/deploy-sst.sh`, `infra/sst.config.ts`
