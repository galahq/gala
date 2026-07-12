# deploy(7)

## NAME
deploy - publish, promote, and roll back canonical Gala releases

Workflow file: `.github/workflows/deploy.yml`.

## SYNOPSIS

```sh
gh workflow run deploy.yml --ref REF -f stage=dev -f user_data=
gh workflow run deploy.yml --ref REF -f stage=production -f user_data=promote:v412
gh workflow run deploy.yml --ref REF -f stage=production -f user_data=rollback
gh workflow run deploy.yml --ref REF -f stage=production -f user_data=rollback:v411
```

## RELEASE IDENTITY

GitHub run number `N` creates canonical release `vN` for the image, assets,
manifest, Rails release, and task definitions. Its record is:

```json
{"version":"v412","commit":"FULL_SHA","digest":"sha256:...","created_at":"2026-07-10T21:27:26Z"}
```

Retries require the same commit and digest. Local builds are not promotable.

## INPUTS

- `stage`: durable authorization boundary, `dev` or `production`.
- `user_data`: blank dev/preview release, `promote:vN`, `rollback`,
  `rollback:vN`, `infra:diff`, or `infra:apply:PLAN_ID`.

An empty production action is rejected. Production uses its protected GitHub
environment and requires explicit promotion or rollback.

## ROUTINE RELEASE

A routine release does not invoke SST. It publishes one ARM64 image and assets,
updates the digest-pinned web/worker tasks, checks stability and `/up`, then
moves the stage channel. Failure preserves the previous pair and channel.

For an open PR, the workflow derives exactly `pr-NUMBER` and comments exactly
`https://pr-NUMBER.dev.learngala.dev`. It never addresses another PR stage.
Routine release does not create preview infrastructure.

## STAGE MODES

Preview and local stages use the dev platform; neither can reference production.

| Form | Canonical infrastructure command | Result |
|---|---|---|
| `dev` | `cd infra && npx sst deploy --stage dev` | durable `https://dev.learngala.dev` |
| `production` | `cd infra && npx sst deploy --stage production` | durable `https://learngala.dev` |
| `pr-790` | `cd infra && npx sst deploy --stage pr-790` | dev-backed `https://pr-790.dev.learngala.dev` |
| `local-NAME` | `cd infra && npx sst dev --stage local-NAME` | dev-backed compute with no public route |

GitHub accepts only durable input `dev` or `production`; an open PR on a dev
run resolves to its exact `pr-NUMBER`. GitHub rejects `local-NAME`.

## PROMOTION

`promote:vN` requires the verified dev channel, reuses its digest and assets,
verifies production, then moves the production channel. It does not rebuild,
copy data, or change DNS.

## ROLLBACK

`rollback` restores the immediate predecessor; `rollback:vN` selects a retained
version. Database changes require expand/contract compatibility.

## STABLE INFRASTRUCTURE

Networking, RDS, cache, ECS clusters/services, routes, DNS, certificates,
secrets, and schedules are stable infrastructure. They require a non-refreshing
`infra:diff` and an exact reviewed `infra:apply:PLAN_ID`. Routine releases may
not invoke SST or mutate those resources.

Change RDS class or scaling values in `infra/config.ts`, run both source
contract tests and the authenticated diff, and inspect every operation.
Allocated RDS storage can grow in place but cannot shrink. DNS, caching, and
route changes require their own narrow infrastructure plan.

## DRY RUN

`user_data=infra:diff` is the non-refreshing infrastructure preview. It records
the commit, stage, state version, operation fingerprint, and timestamp without
applying. Routine releases use immutable-artifact and ECS health gates instead
of an SST dry run.

## SIDE EFFECTS

A routine release writes a new immutable ECR tag, versioned static assets, two
tagged task-definition revisions, web/worker service pointers, and—only after
health checks—the stage channel and ECR convenience alias. Promotion and
rollback reuse retained artifacts. Stable infrastructure changes occur only for
an exact approved `infra:apply:PLAN_ID`.

## SHARED RESOURCES

`msc-gala` and SES are externally owned Heroku-shared resources. This workflow never
creates, imports, replaces, deletes, applies CORS to, or claims ownership of
them. Static release assets use the separate
`gala-static-assets-353760060567` bucket.

## VERIFY

Check the workflow summary, immutable manifest, digest-pinned task definitions,
both ECS services, `/up`, static assets, stage hostname, and channel file. For a
preview, confirm the stage number, route number, PR number, and URL all match.

## EXAMPLES

```sh
gh workflow run deploy.yml --ref feature/ref -f stage=dev -f user_data=
gh workflow run deploy.yml --ref main -f stage=production -f user_data=promote:v412
gh workflow run deploy.yml --ref main -f stage=production -f user_data=rollback
gh workflow run deploy.yml --ref infra/change -f stage=dev -f user_data=infra:diff
```

## SEE ALSO

`ci(7)`, `docs/ops/infra-stacks.md`, `infra/README.md`
