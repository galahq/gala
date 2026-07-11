# Gala infrastructure stacks

## Stable platform versus rapid release

Stable platform changes evaluate SST and require an authenticated,
non-refreshing diff before an explicit apply. They include networking,
databases, cache, clusters, load balancers, routing, static CDN, secrets, and
schedules. Rapid releases bypass SST and update only immutable image/assets,
paired ECS task revisions, service pointers, and post-health channel records.

## Stage ownership

`dev` owns the durable dev VPC, database, cache, cluster, services, load
balancer, and dev static CDN. `production` owns the corresponding production
resources, shared hostname router, static-assets bucket, and production static
CDN. Both stages use `protect: true` and `retain-all`.

Future `pr-NNN` stages may own only their runtime and exact preview route while
referencing the dev foundation. Future `local-NAME` stages may reference dev
resources for `sst dev` but own no durable AWS resources.

## External Heroku-shared resources

`msc-gala` and SES are external, Heroku-shared resources. SST may look up the
bucket and consume SES credentials or identifiers, but routine stages must not
create, import, replace, delete, or claim ownership of them.

The static-assets bucket is separate. Production is its intended sole SST
owner; dev ownership reconciliation is a later guarded state operation and
must never issue a physical bucket delete.

## Capacity changes

Edit `DURABLE_CAPACITY` in `infra/config.ts`. Review the resulting
non-refreshing diff before applying. The current live baseline is dev
`db.t4g.micro`/20 GB and production `db.t4g.small`/50 GB, with service capacity
documented in `infra/README.md`.

RDS allocated storage can grow but cannot shrink in place. A shrink is a data
migration/replacement, not a capacity edit.

## Structural refactor safety diff

From `infra/`, load the ignored provider credentials and remove local
database/cache overrides. Run `npx sst diff --stage dev` and then the equivalent
production command with `AWS_PROFILE=gala` and `AWS_REGION=us-west-2`. Never run
`sst refresh` first.

The accepted phase-one result contains no AWS resource mutation attributable to
module extraction. Protection/removal metadata may change locally without an
AWS provider operation.

## Stop conditions

Stop before apply for any unapproved S3, SES, ALB, CloudFront, log-group,
autoscaling, VPC, RDS, Redis/Valkey, bastion, router, route, ECS service,
task-definition, cron, import, replacement, deletion, provider refresh, or
cross-stage operation. `msc-gala` and SES are unconditional stop conditions.

## Remaining infrastructure phases

After clean dev and production structural diffs:

1. provision and migrate real `pr-NNN` previews one at a time;
2. add the `local-NAME` dev bridge;
3. reconcile static-bucket ownership;
4. remove only the verified-unused application edge-cache distributions.

Each phase gets its own reviewed plan and must not combine state reconciliation,
shared-resource ownership, CloudFront deletion, and release activation.
