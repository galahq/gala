# Gala infrastructure

`sst.config.ts` is the complete Gala infrastructure definition. It stays in
one file so stage behavior, resource ownership, and the `sst diff` review
surface remain visible together.

`sst.platform.json` contains only non-secret identifiers, domains, capacity,
AMI pins, external bucket names, and dev resource IDs used by previews.
Runtime secrets remain in SSM Parameter Store.

## Stage model

| Stage | Backing infrastructure | Owns | URL |
|---|---|---|---|
| `dev` | durable dev | network, database, cache, app | `https://dev.learngala.dev` |
| `production` | durable production | network, database, cache, app | `https://learngala.dev` |
| `pr-NUMBER` | references durable dev | preview web/worker/tasks and route | `https://pr-NUMBER.dev.learngala.dev` |
| `local-NAME` | references durable dev | local `sst dev` processes | no public route |

Preview and local stages never reference production. SST Console owns the
`pr-NUMBER` lifecycle: its repository path is `/infra`, and its `pr-*`
environment points at AWS account `353760060567`. Closing a pull request removes
its preview stage.

## External services

Both S3 buckets are external to SST:

- `msc-gala` stores application uploads and media.
- `gala-static-assets-353760060567` remains untouched for Heroku and legacy
  operations.

Rails serves `/assets` and `/packs` from the application image. SST does not
create, import, update, empty, or delete either bucket. SES also remains
external; ECS reads the existing SMTP username and password from SSM.

## Local commands

Run from `infra/` with `AWS_PROFILE=gala`, `SST_STAGE=<stage>`, and region
`us-west-2`:

```sh
npm test
npm run check
npx sst diff --stage dev
npx sst deploy --stage dev
npx sst dev --stage local-nathan
```

Review every durable diff before deploying. Stop on any S3 or SES mutation or
unexpected durable-resource replacement.

## Automation boundary

| Owner | Trigger | Responsibility |
|---|---|---|
| `ci.yml` | push, pull request, manual | full RSpec and Vitest suites only |
| SST Console | pull request updates/closure | create, update, and remove `pr-NUMBER` previews |
| `deploy.yml` | manual | deploy an explicitly selected durable stage with the pinned SST CLI |

GitHub Actions does not construct or comment preview URLs. The durable workflow
accepts only `dev` or `production` and runs `npx sst deploy` directly from this
directory.
