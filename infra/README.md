# Gala infrastructure

`sst.config.ts` is the complete Gala infrastructure definition. It is purposely
one file: the four supported stages are adjacent, resource ownership is visible,
and `sst diff` is the review surface before any durable change.

`sst.platform.json` is the only tracked non-secret configuration file. It holds
AWS and Cloudflare identifiers, domains, capacity, AMI pins, bucket names, and
the dev IDs used by ephemeral stages. Secrets remain in existing SST Secrets
and SSM parameters. Do not add application configuration switches or Heroku
lookups to the workflow.

## Stage model

| Stage | Backing infrastructure | Owns | URL |
|---|---|---|---|
| `dev` | durable dev | network, database, cache, static assets, app | `https://dev.learngala.dev` |
| `production` | durable production | network, database, cache, static assets, app | `https://learngala.dev` |
| `pr-NUMBER` | references durable dev | preview web/worker/tasks and one route | `https://pr-NUMBER.dev.learngala.dev` |
| `local-NAME` | references durable dev | local `sst dev` processes | no public route |

Preview and local stages never reference production. `msc-gala` is always an
S3 reference because Heroku also uses it. SES is external: this config never
creates, imports, replaces, or deletes a SES resource. Stop if an SST diff
shows lifecycle activity for either shared resource.

## Local commands

Run commands from `infra/` with `AWS_PROFILE=gala` and `AWS_REGION=us-west-2`.

```sh
npx sst diff --stage dev
npx sst deploy --stage dev
npx sst deploy --stage pr-790
npx sst dev --stage local-nathan
```

`sst diff` only prints the proposed change. Review it, especially replacement
and shared-resource operations, before choosing `sst deploy`. `sst dev` uses
the dev references and runs the application locally; it never creates a public
route for a `local-NAME` stage.

## GitHub workflow boundary

| Workflow | Trigger | Responsibility | Cannot do |
|---|---|---|---|
| `ci.yml` | pushes and pull requests | application checks and SST TypeScript checking | deploy or mutate AWS |
| `deploy.yml` | same-repository PR update and manual dispatch | exact preview deployment and durable operator actions | call Heroku or own `msc-gala`/SES |

On each same-repository PR update, `deploy.yml` deploys the exact
`pr-NUMBER` stage and comments its preview URL. It does not target production.
Production remains a protected manual GitHub environment.

## `user_data` actions

The manual `deploy.yml` action accepts a durable `stage` (`dev` or
`production`) and one of these values:

| `user_data` | Allowed stage | Effect |
|---|---|---|
| blank | dev | deploy current dev configuration and image |
| `infra:diff` | dev / production | print `sst diff` for the selected durable stage |
| `infra:apply` | dev / production | run `sst deploy` for the reviewed durable stage |
| `promote:vN` | production | promote retained dev release `vN` |
| `rollback` | dev / production | restore the immediate prior retained release |
| `rollback:vN` | dev / production | restore retained release `vN` |

There is no generated plan ID, state record, cryptographic fingerprint, or
automatic approval. The operator reviews the displayed diff and decides whether
to run `infra:apply`.
