# Simplified SST Preview and Release Design

## Goal

Make Gala's infrastructure read as one Terraform-like SST configuration while
keeping deployments simple: durable `dev` and `production`, dev-backed
ephemeral PR/local environments, GitHub-driven preview deploys, and no SST
ownership of the Heroku-shared media bucket or SES.

## Configuration

`infra/sst.config.ts` is the single resource-definition file. It contains small
local helpers only when they remove repeated resource arguments. It owns the
four stage branches and is the only place that constructs or references SST/AWS
resources.

`infra/sst.platform.json` contains every non-secret platform value: AWS account
and region, domains, bucket names, Cloudflare zone, ECR repository, capacity,
pinned AMIs, and durable dev reference IDs. Secrets stay in existing SST
Secrets/SSM parameters and are never added to tracked JSON or read from Heroku.

## Stage model

| Stage | Backing | Resource ownership | Route |
|---|---|---|---|
| `dev` | itself | durable network, database, cache, assets, app | `dev.learngala.dev` |
| `production` | itself | durable network, database, cache, assets, app | `learngala.dev` |
| `pr-NUMBER` | dev references | web, worker, tasks only | exact `pr-NUMBER.dev.learngala.dev` |
| `local-NAME` | dev references | local `sst dev` application process | none |

`msc-gala` is always an S3 reference and SES is never constructed, imported, or
managed by SST. Preview and local stages reference the durable dev cluster,
router, static-assets distribution, and SSM parameters; they never reference
production.

## Routing and caching

Remove the custom application CloudFront distribution, response-header policy,
and per-route cache behavior. The SST Router sends application traffic directly
to the web service. The existing separate static-assets distribution remains
the only CDN cache and serves immutable fingerprinted release assets.

## GitHub workflow boundary

`ci.yml` runs checks on pushes and pull requests; it never deploys.

`deploy.yml` has two paths:

1. A PR path triggered by GitHub Actions that resolves the exact open PR,
   runs `sst diff --stage pr-NUMBER`, deploys that same stage, and comments its
   exact preview URL. It cannot promote or alter production.
2. A manual durable path for `dev` and `production`. Production remains an
   explicit, protected operation.

The PR workflow uses the existing GitHub OIDC and Cloudflare credentials. It
does not call Heroku or accept a user-provided stage name.

## Operator actions

`user_data` has a short, visible vocabulary:

- blank: routine dev or preview release;
- `promote:vN`: explicit dev-to-production promotion;
- `rollback` or `rollback:vN`: channel rollback;
- `infra:diff`: print the SST diff for the selected durable stage;
- `infra:apply`: run SST deploy for that durable stage after operator review.

There are no plan files, state-version records, fingerprint hashes, or
cryptographic approval checks. The human reviewing `infra:diff` decides whether
to invoke `infra:apply`.

## Validation and constraints

Do not add tests in this refactor. Use TypeScript checking and operator-run
`sst diff`/`sst deploy` locally or from the deploy workflow. Do not push, use
the Heroku CLI, or deploy during implementation. Replacements shown by an SST
diff are reviewable and acceptable except any ownership/lifecycle change to
`msc-gala` or SES, which is a stop condition.
