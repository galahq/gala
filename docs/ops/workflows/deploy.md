# deploy(7)

## NAME

deploy — deploy SST stages and promote or roll back retained releases.

Workflow file: `.github/workflows/deploy.yml`.

## SYNOPSIS

```sh
gh workflow run deploy.yml --ref BRANCH -f stage=dev -f user_data=infra:diff
gh workflow run deploy.yml --ref BRANCH -f stage=dev -f user_data=infra:apply
gh workflow run deploy.yml --ref main -f stage=production -f user_data=promote:v412
gh workflow run deploy.yml --ref main -f stage=production -f user_data=rollback
```

## INPUTS

`stage` is a durable authorization boundary: `dev` or `production`.
`user_data` selects one operation:

| Value | Effect |
|---|---|
| blank | deploy dev when manually dispatched; PR updates deploy their exact `pr-NUMBER` automatically |
| `infra:diff` | print the selected durable stage's SST diff |
| `infra:apply` | deploy the selected durable stage after operator review |
| `promote:vN` | promote retained dev release `vN` to production |
| `rollback` | restore the previous retained release for the selected durable stage |
| `rollback:vN` | restore retained release `vN` |

`infra:diff` has no cryptographic proof, plan ID, or state fingerprint. It is
the operator's readable proposal; the operator decides whether to run
`infra:apply`.

## ROUTES

`dev` is `https://dev.learngala.dev`; production is
`https://learngala.dev`. A same-repository pull request update deploys only
`https://pr-NUMBER.dev.learngala.dev`. `local-NAME` is for local `sst dev` and
never enters GitHub deployment or receives a public route.

## DRY RUN

Use `user_data=infra:diff`. It invokes `sst diff --stage dev` or
`sst diff --stage production` and writes no plan record. Review all operations
before running `infra:apply`.

## SIDE EFFECTS

Blank preview deployment builds the ARM64 image and updates only its exact PR
stage. `infra:apply` applies the selected durable stage. Promotion and rollback
operate on retained application releases. Production is protected by its GitHub
environment and is never automatically promoted by a pull request.

## SHARED RESOURCES

`msc-gala` and SES are externally owned Heroku-shared resources. SST only
references the bucket and never constructs, imports, replaces, deletes, or
configures either shared resource.

## VERIFY

Check the workflow output, the target URL, and the displayed SST diff. For a
preview, confirm the PR number and hostname match exactly. For durable changes,
stop on any `msc-gala` or SES lifecycle operation.

## ROLLBACK

Use `rollback` for the immediate predecessor or `rollback:vN` for a retained
release. Database changes must remain backward compatible through the rollback
window.

## EXAMPLES

```sh
cd infra
npx sst diff --stage dev
npx sst deploy --stage dev
npx sst deploy --stage pr-790
npx sst dev --stage local-nathan
```
