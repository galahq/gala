---
phase: 29
status: complete
created: 2026-06-01
---

# Phase 29 Research: AWS Spend Report For Heroku Migration Decisioning

## Research Question

What must be known to plan a CODEOWNER-facing `SPEND.md` report that uses
Gala's SST-tracked AWS infrastructure and live AWS observations to support a
Heroku-to-AWS migration decision?

## Current Source Facts

### SST Platform Inventory

- `infra/sst.config.ts` owns the AWS platform in `us-west-2`.
- Production removal policy is `retain`; non-production removal is `remove`.
- The retained media bucket is `msc-gala`; the managed static asset bucket is
  `gala-static-assets-353760060567`.
- Static assets are uploaded into immutable release prefixes:
  `releases/<stage>/<release_id>/`.
- Production database is configured as Postgres 16, `db.t4g.small`, single-AZ,
  no proxy, storage configured in source as `50 GB`.
- Dev database is configured as Postgres 16, `db.t4g.micro`, single-AZ,
  storage configured in source as `20 GB`.
- Cache is Valkey 7.2 on `cache.t4g.micro`, one node, no cluster mode.
- Production web service is Fargate, min 2 / max 3, `1 vCPU`, `2 GB`.
- Production worker service is Fargate, min 1 / max 2, `0.5 vCPU`, `1 GB`.
- Dev services use Fargate Spot capacity; production uses normal Fargate.
- Production and dev define separate static asset and app CloudFront
  distributions, and production also owns the `GalaAppRouter` distribution for
  `learngala.dev`, `dev.learngala.dev`, and `*.dev.learngala.dev`.
- `PriceClass_100` is set on the app/static distributions, but the SST Router
  transform currently sets the production router distribution to
  `PriceClass_100` while live AWS inspection observed the router as
  `PriceClass_All`. The report must call out this tracked-vs-live drift.
- Scheduled tasks in production include index refresh every 15 minutes and
  weekly report email. One-off tasks include migration, seed database, refresh
  indices, and weekly report task definitions.

### GitHub Actions And Operator Cost Surface

- `.github/workflows/deploy.yml` is manual `workflow_dispatch`.
- Production deploys currently set `GALA_ECS_ONLY_DEPLOY=true`, so most
  production releases avoid full SST infra mutation and roll ECS task
  definitions/images directly.
- The workflow uses GitHub-hosted Ubuntu runners, Docker build/push, asset sync,
  optional CloudFront invalidation, and optional allowlisted operator hooks.
- Cost reporting should treat GitHub Actions minutes as an operational cost
  surface even if the repo's current GitHub plan absorbs some minutes.

## Read-Only AWS Observations

Observed with `AWS_PROFILE=gala AWS_REGION=us-west-2` on 2026-06-01:

- Production ECS cluster:
  `gala-production-GalaClusterCluster-huxhnoss`.
- Production services:
  - `GalaWeb`: desired 2, running 2, task definition revision `:15`.
  - `GalaWorker`: desired 1, running 1, task definition revision `:15`.
- Production database:
  - `gala-production-galadatabaseinstance-ftmwmcra`
  - `db.t4g.small`, Postgres, single-AZ, allocated storage observed as `20 GB`,
    status `available`.
- Dev database:
  - `gala-dev-galadatabaseinstance-vfkaokum`
  - `db.t4g.micro`, Postgres, single-AZ, allocated storage `20 GB`, status
    `available`.
- Production cache:
  - `gal-production-galacachecluster-fbhebtwk-001`
  - Valkey, `cache.t4g.micro`, one node, status `available`.
- Dev cache:
  - `gala-dev-galacachecluster-bbtxmett-001`
  - Valkey, `cache.t4g.micro`, one node, status `available`.
- Active Gala ALBs:
  - `GalaWebLoadBala-chdmccbn`
  - `GalaWebLoadBala-bamvarum`
- CloudFront distributions with Gala relevance:
  - `EI4GGPHNM469B` - production static assets, `PriceClass_100`.
  - `EF4NIYHMN17KT` - production app edge cache, `PriceClass_100`.
  - `E3FF4TTU9Q4XTY` - production router/custom domains, observed
    `PriceClass_All`.
  - `EUWPHB77806X0` - dev static assets, `PriceClass_100`.
  - `EO8V10J0LC0GE` - dev app edge cache, `PriceClass_100`.
  - Older/other `learngala.com` distributions exist and must be separated from
    SST `learngala.dev` spend unless the report intentionally includes shared
    account cleanup opportunities.
- ECR repositories:
  - `gala`
  - `gala-production-base`
  - `gala` currently has 33 image details.
- Relevant buckets:
  - `gala-static-assets-353760060567`
  - `msc-gala`

## Official Pricing Facts To Use

- AWS Fargate has no upfront cost and charges by vCPU, memory, architecture,
  OS, and storage resource use. Fargate Spot can run interrupt-tolerant ECS
  tasks at up to a 70% discount from regular Fargate; additional charges can
  include CloudWatch Logs, public IPv4 addresses, and data transfer.
  Source: https://aws.amazon.com/fargate/pricing/
- AWS Fargate pricing has separate Linux/X86 and Linux/ARM dimensions; AWS's
  own examples show lower ARM vCPU/memory rates than x86. Treat this as a
  pricing input, not a Gala performance result.
  Source: https://aws.amazon.com/fargate/pricing/
- RDS PostgreSQL on-demand DB instances charge by DB instance-hour. RDS T4g/T3
  instances run in unlimited mode and can incur CPU credit charges if average
  CPU exceeds the baseline over a rolling 24-hour period.
  Source: https://aws.amazon.com/rds/postgresql/pricing/
- RDS Reserved Instances and Database Savings Plans may reduce predictable
  database spend but trade flexibility for commitment.
  Source: https://aws.amazon.com/rds/postgresql/pricing/
- S3 charges include storage, request/retrieval, data transfer, management,
  replication, and related features. Storage class and object size/retention
  rules matter for retained media and immutable release assets.
  Source: https://aws.amazon.com/s3/pricing/
- CloudFront can be pay-as-you-go or use flat-rate plans. It can reduce origin
  load by serving cached content at the edge and collapsing duplicate requests;
  the spend report should evaluate cache hit ratio and router/app distribution
  duplication.
  Source: https://aws.amazon.com/cloudfront/pricing/
- Elastic Load Balancing, ElastiCache, CloudWatch, public IPv4, and data
  transfer are separate cost surfaces that must not be hidden behind ECS or SST
  labels.
  Sources:
  - https://aws.amazon.com/elasticloadbalancing/pricing/
  - https://aws.amazon.com/elasticache/pricing/

## Planning Implications

1. `SPEND.md` should not be a generic AWS pricing essay. It should start with
   the actual tracked Gala platform and show how each resource appears in cost.
2. The report needs an evidence appendix or embedded evidence table that
   distinguishes source-of-truth SST config from live AWS observations and
   drift.
3. Current monthly cost should be a model with formulas and assumptions, not a
   false-precision invoice, unless Cost Explorer data is explicitly pulled and
   included.
4. The plan should use read-only AWS CLI and AWS Pricing Calculator/API checks;
   no production mutation is needed.
5. The report should separate:
   - Capex-like migration/engineering work: cutover, validation, rollback,
     DB/media movement, CI/operator work, runbook ownership, observability.
   - Opex recurring cost: Fargate, RDS, Valkey, ALB, CloudFront, S3, ECR,
     CloudWatch, public IPv4, data transfer, GitHub Actions, backups, logs.
6. Growth modeling should be scenario-based and tied to observable drivers:
   catalog traffic, authenticated case traffic, cache hit ratio, preview count,
   release retention, image retention, DB/storage growth, log volume, worker
   queue depth, and scheduled task frequency.
7. Cost-cut recommendations should name both dollars and risk:
   rightsizing web/worker, ARM64 if Phase 28 passes, dev/preview spot and TTL,
   reducing duplicated CloudFront distributions, image lifecycle retention, S3
   lifecycle policies for immutable release assets, log retention, database
   commitments, and removing unused legacy distributions.

## Validation Architecture

- Parse `SPEND.md` for required sections: `EXECUTIVE SUMMARY`, `SCOPE`,
  `INVENTORY`, `CAPEX`, `OPEX`, `GROWTH MODEL`, `CUT COST`, `HEROKU DECISION`,
  `EVIDENCE`, and `UNKNOWN UNKNOWNS`.
- Run read-only AWS inventory commands and confirm every live resource category
  named by `infra/sst.config.ts` is represented in the report.
- Verify the report states all assumptions and marks estimates as estimates.
- Verify no secret values or database/cache URLs are printed.
- Verify the report mentions drift where source and live AWS differ.
- Verify Heroku comparison uses read-only evidence or explicitly marks missing
  Heroku invoices/plan names as assumptions.

## RESEARCH COMPLETE
