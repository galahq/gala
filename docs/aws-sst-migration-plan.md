# AWS + SST Migration Plan

## Goal

Move Gala from Heroku to AWS with SST v4 while preserving the current application behavior, reducing recurring hosting cost, and keeping infrastructure simple enough that application developers can stay focused on product work.

Primary production domain: `https://www.learngala.com`

Target region for phase 1: `us-west-2`

## Current Runtime Shape

Local development:

- Docker Compose starts `web`, `worker`, `js`, `css`, `ws`, `db`, and `valkey`
  on the Compose-scoped `app` network
- `web` runs Thruster in front of Rails
- `js` runs the Vite/Rollup watch build and `css` runs the Sass watch build
- `ws` runs AnyCable-Go on development port `3002` against Valkey using the
  Redis protocol, while Rails exposes HTTP RPC for channel/auth logic
- `web`, `js`, and `css` share generated assets through an `assets_builds` named
  volume; the app source bind remains delegated and dependency/runtime write
  paths use named volumes
- Sidekiq runs as the `worker` service; Foreman/`Procfile.dev` is no longer part
  of the local process graph

Heroku production:

- `web` dyno runs Puma from `Procfile`
- `worker` dyno runs Sidekiq from `Procfile`
- Heroku Postgres Standard-0
- Heroku Key-Value Store Mini
- Heroku Scheduler runs:
  - `bundle exec rake indices:refresh`
  - `bundle exec rake emails:send_weekly_report`

Application dependencies that matter for the migration:

- Redis is used today for Action Cable, caching, and Sidekiq
- S3 is used for Active Storage uploads
- SES SMTP is already used for outbound mail
- Action Mailbox uses Amazon ingress
- WebSockets are active on `/cable`

## Recommendation

### Phase 1: Lift-and-shift with fewer moving parts than Heroku

Use:

- `ECS Fargate` for the Rails web service
- `ECS Fargate` for the worker service
- `RDS PostgreSQL` single-AZ
- `ElastiCache Valkey` single node
- `Application Load Balancer`
- `ECR` for container images
- `EventBridge Scheduler` + `ECS Task` for scheduled jobs
- `S3` for uploads
- `SES` for outbound mail
- `CloudWatch Logs`
- `Route 53` + `ACM`

Avoid:

- Lambda for the main app
- ECS-on-EC2 for the first cut
- NAT Gateways
- A custom Postfix container

### Phase 2: Simplify the app after cutover

After production is stable on AWS:

- upgrade Rails to adopt built-in rate limiting where it helps
- evaluate replacing Sidekiq + Redis with `Solid Queue`
- evaluate replacing Redis-backed Action Cable with `Solid Cable`
- evaluate keeping cache in Postgres or dropping low-value cache paths
- add `CloudFront` in front of static assets and optionally public media

This second phase can remove Redis, but it should not be coupled to the hosting move.

## Architecture

```text
Internet
  -> Route 53
  -> ACM TLS cert
  -> ALB
  -> ECS Fargate web service (public subnets)
      -> RDS PostgreSQL (private subnets)
      -> ElastiCache Valkey (private subnets)
      -> S3 bucket msc-gala
      -> SES SMTP

ECS Fargate worker service (public subnets)
  -> RDS PostgreSQL
  -> ElastiCache Valkey
  -> S3
  -> SES SMTP

EventBridge Scheduler
  -> ECS Task: db:migrate
  -> ECS Task: indices:refresh
  -> ECS Task: emails:send_weekly_report
```

## Why `us-west-2`

The app is already configured around a `us-west-2` S3 bucket and SES SMTP endpoint.

- `config/storage.yml` currently points the `amazon` storage service at bucket `msc-gala` in `us-west-2`
- uploads use Active Storage direct uploads, so media traffic already lands in S3
- keeping compute, mail, and storage in the same region avoids cross-region transfer cost and latency

Moving compute to `us-east-1` before moving the media bucket would add avoidable inter-region transfer and operational complexity.

## Why Fargate Instead of ECS on EC2

### Fargate wins on:

- maintenance simplicity
- lower operational risk
- no AMI lifecycle management
- no instance patching
- no ECS capacity provider tuning
- easier rollback and scaling

### ECS on EC2 only clearly wins if:

- you commit to 1-year or 3-year pricing
- you accept more infrastructure ownership
- you are optimizing for absolute minimum compute cost over simplicity

For Gala’s current size, Fargate is close enough in price that the operational simplicity is the better trade.

## Why Keep SES

SES is already a good fit:

- cheap
- managed
- reliable
- no MTA patching
- no queue persistence work
- no sender reputation management inside your app stack

A custom Postfix container would increase maintenance burden and failure modes.

## Cost Estimate

These estimates assume `us-west-2`, a single always-on production environment, and staging deployed only when needed.

### Production, current-app-compatible stack

- `web`: Fargate `0.5 vCPU / 2 GB`
- `worker`: Fargate `0.25 vCPU / 1 GB`
- `RDS db.t4g.small`
- `50 GB gp3`
- `Valkey cache.t4g.micro`
- one public `ALB`

Estimated monthly total:

- about `$100-$115/mo`

Rough shape:

- Fargate web: about `$21/mo`
- Fargate worker: about `$11/mo`
- ALB: about `$16-$22/mo`
- RDS instance + storage: about `$29-$30/mo`
- Valkey: about `$9-$10/mo`
- public IPv4 and small supporting services: about `$8-$15/mo`

### Production, later Rails-simplified stack

If Redis is removed later and the database can stay on `db.t4g.small`:

- about `$90-$105/mo`

If removing Redis forces RDS to move to `db.t4g.medium`, much of that savings disappears.

### Staging

Recommended staging policy:

- deploy only with `workflow_dispatch`
- run on `FARGATE_SPOT`
- remove the stage when finished

Monthly fixed cost when removed:

- effectively near-zero except for small ECR/log/snapshot residue

## Tradeoffs Against Heroku

### Security

- Better IAM control and secret handling than Heroku config vars
- Private RDS and cache reduce exposure
- OIDC GitHub deploys remove long-lived AWS keys from CI

### Price

- Production should be cheaper than the current visible Heroku production spend
- The real savings come from removing always-on staging and avoiding NAT Gateways

### Reliability

- Single-AZ is acceptable for phase 1 and keeps cost down
- Reliability is comparable to a small Heroku setup, but not equivalent to a multi-AZ design

### Performance

- More memory headroom than the current Heroku web dyno that is hitting R14
- Direct control over CPU and memory sizing
- Optional CloudFront later for static assets and public content

### Maintenance Simplicity

- Fargate keeps host management out of the application team’s path
- SES keeps mail simple
- SST keeps infra code centralized and deployable from GitHub Actions

## Required Application Changes Before Cutover

### Must-do

- Add a lightweight health endpoint such as `/up`
- Update Active Storage to rely on IAM task roles instead of static `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
- Replace Heroku `postdeploy` behavior with an explicit migration task
- Move scheduler jobs from Heroku Scheduler to EventBridge Scheduler

### Strongly recommended

- Keep Redis in phase 1
- Upgrade Rails and simplify queue/cable later
- Keep `www.learngala.com` as the primary production hostname

## Secrets To Carry Into SST

These should be set with `sst secret set ...` per stage.

Required platform/runtime secrets:

- `RAILS_MASTER_KEY`
- `SECRET_KEY_BASE`
- `LTI_KEY`
- `LTI_SECRET`
- `MAPBOX_ACCESS_TOKEN`
- `SES_SMTP_USERNAME`
- `SES_SMTP_PASSWORD`

Common feature secrets to carry if used in production:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`
- `SENTRY_DSN`

## Deployment Workflow

The repo includes a GitHub Actions workflow that:

- assumes an AWS role via OIDC
- installs the separate `infra/` Node 24 package
- runs `sst deploy` or `sst remove`
- supports `production` and on-demand `staging`

Production removal is intentionally blocked in CI.

## Phase Plan

1. Add health endpoint and IAM-based S3 auth
2. Create AWS staging in `us-west-2`
3. Validate uploads, mail, websocket behavior, and jobs
4. Migrate Postgres from Heroku to RDS
5. Cut over DNS for `www.learngala.com`
6. Monitor production
7. Decide whether Redis removal is still worth it after measuring real AWS cost
