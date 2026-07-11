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

GitHub run number `N` creates the only release identity, `vN`. It identifies
the immutable ECR tag, `releases/vN/` static assets, manifest, Rails
`GALA_RELEASE`, and tagged task definitions. The release record contains only:

```json
{"version":"v412","commit":"FULL_SHA","digest":"sha256:...","created_at":"2026-07-10T21:27:26Z"}
```

A workflow retry reuses that record only when its commit and digest match. A
collision fails closed. Local builds are not canonical or promotable.

## INPUTS

- `stage`: durable authorization boundary, `dev` or `production`.
- `user_data`: blank dev/preview release, `promote:vN`, `rollback`,
  `rollback:vN`, `infra:diff`, or `infra:apply:PLAN_ID`.

An empty production action is rejected. Production uses its protected GitHub
environment and requires explicit promotion or rollback.

## ROUTINE RELEASE

A routine release does not invoke SST. It builds one ARM64 image, writes the
immutable `vN` image and assets, registers paired digest-pinned web and worker
task definitions, enables the ECS deployment circuit breaker, waits for both
services, checks `/up`, and only then moves the stage channel. On failure the
previous task-definition pair and channel remain authoritative.

For an open PR, the workflow derives exactly `pr-NUMBER` and comments exactly
`https://pr-NUMBER.dev.learngala.dev`. It never addresses another PR stage.
The preview stage must already have been provisioned through the reviewed
stable-infrastructure path; routine release does not create infrastructure.

## PROMOTION

`promote:vN` requires `vN` to be the verified current dev channel. It reuses the
same image digest and assets, creates production task revisions from
production's existing environment and secret references, verifies health, and
then moves the `production` channel. It does not rebuild, copy data, or change
DNS.

## ROLLBACK

`rollback` restores the channel's immediate predecessor. `rollback:vN` selects
a retained version explicitly. Both locate the tagged web/worker task pair,
wait for stable services, verify health, and only then update the channel.
Database rollback is separate: schema changes must use expand/contract
compatibility and remain backward compatible through the rollback window.

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

`msc-gala` and SES are external Heroku-shared resources. This workflow never
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
