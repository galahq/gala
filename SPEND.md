# SPEND.md

Generated: 2026-06-01T10:14:48.396Z
Command: `AWS_PROFILE=gala AWS_REGION=us-west-2 node scripts/ops/generate-spend-report.mjs --output SPEND.md`
Scope: Gala SST-tracked AWS infrastructure in `infra/sst.config.ts`, validated with read-only AWS CLI.

## EXECUTIVE SUMMARY

The AWS platform remains small enough for migration evaluation. Cost Explorer reports USD 50.79 from 2026-05-01 through 2026-06-01 across the current AWS account. That total is account-wide: it includes production, dev, shared buckets, legacy distributions, release artifacts, and account-level services. Treat it as a directional floor until cost allocation tags split production, dev, shared, and legacy resources.

Production is an always-on Fargate/RDS/Valkey/ALB stack. Dev uses Fargate Spot for ECS services but still carries RDS, Valkey, CloudFront, S3, logs, and artifacts. The first costs that will grow are web/worker task-hours, RDS load/storage, CloudFront/S3 transfer, log volume, ECR/static asset retention, and preview environment lifetime.

Highest leverage now:

1. Fix production cache behavior and measure CloudFront hit ratio before scaling web.
2. Add ECR, static asset, S3, and log retention controls.
3. Keep dev/preview on Spot and short TTLs.
4. Reconcile source/live drift before buying commitments.
5. Treat ARM64 as conditional until Phase 28 runtime proof passes.

Decision Thresholds:

- Stay on Heroku if the invoice is below the AWS recurring floor plus the operator burden of GitHub Actions/SST/ECS ownership.
- Run hybrid while AWS production is being proven and .com DNS/data migration risk remains open.
- Migrate fully when rollback, cache behavior, migrations, observability, and production deploy dry-runs are routine and Heroku is materially higher than AWS plus operator time.

Missing evidence: actual Heroku invoice/plan, CloudFront cache hit ratio, S3 bucket byte inventory, per-environment cost allocation tags, and Phase 28 ARM64 UAT.

## REPRODUCIBLE REPORT GENERATION

Run:

```sh
AWS_PROFILE=gala AWS_REGION=us-west-2 node scripts/ops/generate-spend-report.mjs --output SPEND.md
```

The script is read-only. It asserts expected resource names in `infra/sst.config.ts`, calls AWS CLI inventory APIs, calls Cost Explorer, and calls AWS Price List APIs for add-one unit estimates. It does not read SSM parameter values or secret payloads.

## SCOPE

Included:

- SST resources tracked by `infra/sst.config.ts`.
- GitHub Actions operator workflows that create deploy, rollback, preview, cache, migration, one-off, and release-retention side effects.
- Live AWS observations from ECS, RDS, ElastiCache/Valkey, ALB, CloudFront, S3, ECR, CloudWatch Logs, Cost Explorer, and AWS Price List.

Excluded:

- Heroku invoice totals, because they were not available in the repository or AWS account.
- Non-Gala AWS workloads unless they appear in account-wide service totals.
- Secret values, database URLs, Redis URLs, passwords, tokens, and deploy credentials.

## STAGE CHARACTERISTICS

| Stage | Service | Live shape | Price for one additional matching task/month | Current desired task monthly list price |
| --- | --- | --- | --- | --- |
| production | GalaWeb | 2 desired / 2 running, 1 vCPU, 2 GB, x86_64, rev 15 | USD 36.04 | USD 72.08 |
| production | GalaWorker | 1 desired / 1 running, 0.5 vCPU, 1 GB, x86_64, rev 15 | USD 18.02 | USD 18.02 |
| dev | GalaWeb | 1 desired / 1 running, 0.5 vCPU, 1 GB, x86_64, rev 10 | USD 18.02 | USD 18.02 |
| dev | GalaWorker | 1 desired / 1 running, 0.25 vCPU, 1 GB, x86_64, rev 9 | USD 10.63 | USD 10.63 |

Notes:

- Dev ECS is expected to use Fargate Spot; the task estimates above use on-demand AWS Price List rates because Spot pricing varies.
- Current task monthly list price excludes ALB, RDS, Valkey, S3, CloudFront, ECR, logs, public IPv4, requests, transfer, and operator costs.
- Production and dev are both currently X86_64; ARM64 pricing is shown only as a conditional add-one estimate.

## MODELED STAGE COST BY INFRA

This table models the tracked stage floor with public on-demand rates where a single unit price is available. It is not a replacement for Cost Explorer tags: S3, CloudFront, ECR, CloudWatch, VPC/public IPv4, request volume, data transfer, backups, storage, GitHub Actions, and operator labor remain account-wide or usage-metered.

| Stage | Infra | Live/source characteristic | Modeled monthly price | Boundary |
| --- | --- | --- | --- | --- |
| production | ECS GalaWeb | 2 desired 1 vCPU/2 GB x86_64 | USD 72.08 | Fargate task-hours only. |
| production | ECS GalaWorker | 1 desired 0.5 vCPU/1 GB x86_64 | USD 18.02 | Fargate task-hours only. |
| production | RDS GalaDatabase | db.t4g.small, 20 GB gp3 | USD 23.36 | Instance-hours only; storage, backups, I/O separate. |
| production | Valkey GalaCache | cache.t4g.micro, 1 node | USD 9.34 | Node-hours only. |
| production | Application Load Balancer | 1 ALB assumed from tracked web service | USD 16.43 | ALB-hours only; LCUs/data processing separate. |
| production | Modeled subtotal | task + RDS instance + Valkey node + ALB hour floor | USD 139.23 | Production modeled recurring floor subset. |
| dev | ECS GalaWeb | 1 desired 0.5 vCPU/1 GB x86_64 | USD 18.02 | Fargate task-hours only. |
| dev | ECS GalaWorker | 1 desired 0.25 vCPU/1 GB x86_64 | USD 10.63 | Fargate task-hours only. |
| dev | RDS GalaDatabase | db.t4g.micro, 20 GB gp3 | USD 11.68 | Instance-hours only; storage, backups, I/O separate. |
| dev | Valkey GalaCache | cache.t4g.micro, 1 node | USD 9.34 | Node-hours only. |
| dev | Application Load Balancer | 1 ALB assumed from tracked web service | USD 16.43 | ALB-hours only; LCUs/data processing separate. |
| dev | Modeled subtotal | task + RDS instance + Valkey node + ALB hour floor | USD 66.10 | Dev ECS live capacity is Spot; subtotal uses on-demand task equivalent. |

## INVENTORY

| Area | Tracked source | Live observation | Spend driver |
| --- | --- | --- | --- |
| ECS web | `GalaWeb`, production 1 vCPU/2 GB min 2 max 3; dev 0.5 vCPU/1 GB min 1 max 1 | production: 2/2, x86_64, rev 15. dev: 1/1, x86_64, rev 10. | Fargate vCPU-hours, GB-hours, public IPv4/networking, logs. |
| ECS worker | `GalaWorker`, production 0.5 vCPU/1 GB min 1 max 2; dev 0.25 vCPU/1 GB | production: 1/1, x86_64, rev 15. dev: 1/1, x86_64, rev 9. | Fargate vCPU-hours, GB-hours, queue volume, logs. |
| ECS tasks | `GalaMigrate`, `GalaSeedDatabase`, `GalaRefreshIndices`, `GalaWeeklyReport` | SST task log groups observed for dev and production. | Short Fargate runtime, logs, operator workflow frequency. |
| Database | `GalaDatabase`, PostgreSQL 16, production `db.t4g.small`, dev `db.t4g.micro`, source production storage 50 GB | Production db.t4g.small, postgres 16.13, 20 GB gp3, backup retention 7 days. Dev db.t4g.micro, postgres 16.13, 20 GB gp3, backup retention 7 days. | Instance-hours, storage, backups, I/O, CPU credits if bursty. |
| Cache | `GalaCache`, Valkey 7.2, `cache.t4g.micro`, cluster false | gala-dev-galacachecluster-bbtxmett-001: cache.t4g.micro, valkey 7.2.6, 1 node; gal-production-galacachecluster-fbhebtwk-001: cache.t4g.micro, valkey 7.2.6, 1 node | Node-hours, memory pressure, cache churn. |
| ALB | `GalaWeb` load balancer | Web services create one app load balancer per stage; account has active Gala ALBs. | ALB-hours, LCUs, data processed. |
| App edge | `GalaAppDistribution` / dev app distribution, `PriceClass_100` | Production and dev app/static distributions are deployed. | Requests, transfer, invalidations, origin miss rate. |
| Router | `GalaAppRouter` routes `learngala.dev`, `dev.learngala.dev`, and `*.dev.learngala.dev` | Router E3FF4TTU9Q4XTY is PriceClass_All with aliases dev.learngala.dev, *.dev.learngala.dev, learngala.dev. | Requests, transfer, extra global edge scope if drift persists. |
| Static assets | `GalaStaticAssets`, `GalaStaticAssetsDistribution`, immutable release prefixes | Buckets observed: briefing.learngala.com, csc.learngala.com, docs.learngala.com, gala-activities, gala-deploy-artifacts-353760060567, gala-static-assets-353760060567, galaxy.learngala.com, msc-gala, msc-gala-dev. | S3 storage, requests, CloudFront transfer, retained release prefixes. |
| Media | Retained `msc-gala` bucket reference | Media bucket byte inventory not collected by this script. | S3 storage, requests, transfer, lifecycle, backup/retention. |
| Images | ECR `gala`, `gala-production-base` | Repositories: gala, gala-production-base; `gala` image detail count 36. | ECR storage, image retention, deploy frequency. |
| Logs | SST ECS log groups | 12 Gala log groups observed; largest stored log group /sst/cluster/gala-production-GalaClusterCluster-huxhnoss/gala-production-GalaWeb-bcmrnbvk/GalaWeb (142469677 bytes, retention 30 days). | Ingestion, retention storage, query scans. |
| Workflows | Manual `workflow_dispatch` deploy, preview, rollback, maintenance, promote-production | Release retention input `GALA_RELEASE_RETAIN_COUNT` is part of deploy/preview/rollback operations. | GitHub Actions minutes/storage, AWS calls, release asset retention, operator time. |

## CURRENT ACCOUNT-WIDE OPEX

Cost Explorer service totals from 2026-05-01 through 2026-06-01:

| Service | Observed spend | Treatment |
| --- | --- | --- |
| Amazon Elastic Container Service | USD 18.65 | Account-wide; split by tags before treating as production-only. |
| Amazon Relational Database Service | USD 7.83 | Account-wide; split by tags before treating as production-only. |
| Amazon Virtual Private Cloud | USD 6.44 | Account-wide; split by tags before treating as production-only. |
| Amazon Elastic Load Balancing | USD 5.06 | Account-wide; split by tags before treating as production-only. |
| Amazon ElastiCache | USD 4.45 | Account-wide; split by tags before treating as production-only. |
| Amazon Simple Storage Service | USD 4.41 | Account-wide; split by tags before treating as production-only. |
| AWS Secrets Manager | USD 1.70 | Account-wide; split by tags before treating as production-only. |
| EC2 - Other | USD 0.91 | Account-wide; split by tags before treating as production-only. |
| AmazonCloudWatch | USD 0.46 | Account-wide; split by tags before treating as production-only. |
| Amazon Route 53 | USD 0.27 | Account-wide; split by tags before treating as production-only. |
| Amazon EC2 Container Registry (ECR) | USD 0.25 | Account-wide; split by tags before treating as production-only. |
| Amazon Elastic Compute Cloud - Compute | USD 0.24 | Account-wide; split by tags before treating as production-only. |
| Amazon Simple Email Service | USD 0.10 | Account-wide; split by tags before treating as production-only. |
| Amazon CloudFront | USD 0.02 | Account-wide; split by tags before treating as production-only. |
| Amazon API Gateway | USD 0.00 | Account-wide; split by tags before treating as production-only. |
| AWS Key Management Service | USD 0.00 | Account-wide; split by tags before treating as production-only. |
| AWS Lambda | USD 0.00 | Account-wide; split by tags before treating as production-only. |
| Amazon Elastic File System | USD 0.00 | Account-wide; split by tags before treating as production-only. |

## ADDITIONAL INFRA PRICE CARD

Region: us-west-2. Pricing API region: us-east-1. Estimates use 730 hours/month and on-demand public rates unless noted.

| Add-one item | Unit | Estimated monthly price | Boundary |
| --- | --- | --- | --- |
| Production web task | 1 vCPU / 2 GB Fargate x86_64 for one month | USD 36.04 | Adds one always-on web task before autoscaling or savings plans. |
| Production worker task | 0.5 vCPU / 1 GB Fargate x86_64 for one month | USD 18.02 | Adds one always-on Sidekiq worker. |
| ARM64 production web task | 1 vCPU / 2 GB Fargate ARM64 for one month | USD 28.84 | Only valid after Phase 28 ARM64 proof passes. |
| RDS production class | 1 `db.t4g.small` PostgreSQL Single-AZ instance-month | USD 23.36 | Storage, backups, and I/O are additional. |
| RDS dev class | 1 `db.t4g.micro` PostgreSQL Single-AZ instance-month | USD 11.68 | Storage, backups, and I/O are additional. |
| Valkey cache node | 1 `cache.t4g.micro` Valkey node-month | USD 9.34 | One node; no cluster. |
| Application Load Balancer | 1 ALB-hour for one month | USD 16.43 | LCUs and data processing are additional. |

Raw rates used:

| Rate | AWS Price List result |
| --- | --- |
| Fargate x86 vCPU | USD 0.040480 / hours |
| Fargate x86 GB | USD 0.004445 / hours |
| Fargate ARM vCPU | USD 0.032380 / hours |
| Fargate ARM GB | USD 0.003560 / hours |
| RDS db.t4g.small PostgreSQL | USD 0.032000 / Hrs |
| RDS db.t4g.micro PostgreSQL | USD 0.016000 / Hrs |
| Valkey cache.t4g.micro | USD 0.012800 / Hrs |
| ALB hour | USD 0.022500 / Hrs |

Services not reduced to a single add-one price: CloudFront, S3, ECR, CloudWatch, public IPv4, Route 53, and GitHub Actions are usage-metered by requests, transfer, GB-month, query scans, IP-hours, hosted zones, artifacts, or runner minutes. Their current account-wide totals are in Cost Explorer above; use AWS Calculator or Price List API dimensions once traffic/object assumptions are known.

## CAPEX

Capex here means one-time migration and platform work, not purchased hardware.

| Work item | Why it exists | Evidence needed before .com cutover |
| --- | --- | --- |
| Database migration | Heroku-to-RDS migration, restore rehearsal, migration ordering, rollback boundary. | Restore duration, data integrity checks, migration dry-run logs, snapshot/backup plan. |
| Media migration | ActiveStorage/media bucket ownership and lifecycle must be settled. | S3 inventory for `msc-gala`, object class mix, missing-object smoke tests. |
| DNS and Cloudflare cutover | `learngala.dev` is active; .com legacy domains still exist in CloudFront. | DNS TTL plan, Cloudflare zone readiness, .com route ownership decision. |
| Deploy/rollback drills | Operator workflows replace Heroku deploy primitives. | Successful dry-run, mutation run, rollback run, and maintenance run summaries. |
| Observability | ECS/RDS/cache/CloudFront ownership requires logs, metrics, alarms, and runbooks. | Alarm list, dashboard links, log retention policy, on-call checklist. |
| Cache correctness | Production cache miss behavior can force excess origin load. | CloudFront hit ratio, Rails cache keys, anonymous vs authenticated path policy tests. |
| Spend model | Cost tags and budget alarms are required for decision hygiene. | Cost allocation tags, AWS Budgets, monthly Cost Explorer review. |

## GROWTH MODEL

| Scenario | Traffic/cache assumptions | Infra behavior | Cost watchpoints |
| --- | --- | --- | --- |
| Low | Catalog JSON and anonymous paths remain modest; cache hit ratio high; preview count 0-1. | Production stays 2 web + 1 worker; RDS and Valkey remain current classes; dev uses Spot. | Fixed floor dominates; cut via retention, preview TTL, and legacy cleanup. |
| Expected | /cases.json and public catalog reads rise; authenticated/editor traffic grows slowly; 1-2 previews during active work. | Web may scale to 3; worker queue grows with refresh/report tasks; RDS CPU/storage and logs become leading signals. | CloudFront miss rate, RDS load, autoscaling, logs, ECR images. |
| High | Cacheable catalog traffic grows materially; cache hit ratio uneven; authenticated traffic significant; previews linger. | Web max may need >3; worker max >2; RDS/cache classes may grow; S3/media transfer grows. | Origin misses, DB saturation, Valkey evictions, CloudFront transfer, S3 media, preview lifetime. |

## CUT COST

| Priority | Recommendation | Impact | Risk | Validate |
| --- | --- | --- | --- | --- |
| Now | Fix production cache behavior and measure CloudFront hit ratio before adding web tasks. | Avoids paying Fargate/RDS/ALB for repeat anonymous catalog traffic. | Incorrect caching can expose private data or serve stale content. | Header tests for anonymous/authenticated paths; CloudFront hit/miss metrics. |
| Now | Add ECR lifecycle policy for untagged images and retain rollback tags. | Stops image storage from growing with deploy frequency. | Over-cleanup can remove rollback image. | Keep release-retention window and prove rollback references survive. |
| Now | Add static asset release-prefix lifecycle or retention budget. | Prevents S3/static assets from growing without bound. | Removing active prefix breaks old releases. | Confirm active prefixes and rollback window. |
| Now | Reconcile CloudFront router price-class drift. | Can reduce global edge scope if intended. | Router mutation affects public routing. | SST diff, CloudFront config check, dry-run, low-traffic deployment. |
| Next | Rightsize production web/worker after utilization data. | Can reduce Fargate floor or prevent premature scale-up. | Undersizing hurts latency and queue throughput. | CPU/memory p95, latency, Sidekiq queue age. |
| Next | Keep dev and preview on Fargate Spot with strict TTL controls. | Saves non-prod compute. | Spot interruption can disrupt validation. | Preview summary, smoke tests, explicit rerun path. |
| Next | Add cost allocation tags and AWS Budgets. | Splits prod/dev/shared/legacy costs. | Tag rollout may be incomplete at first. | Monthly Cost Explorer review by tag. |
| Later | ARM64 Fargate and images if Phase 28 proof passes. | Can lower compute price. | Native gem/image/runtime mismatch can break production. | Complete Phase 28 UAT and rollback drill. |
| Later | Savings Plans or RDS reservations after steady utilization. | Reduces fixed cost. | Premature commitments reduce flexibility. | Three months of stable utilization. |
| Later | Review old learngala.com CloudFront distributions. | Removes legacy minimums and confusion if unused. | They may serve live properties. | Owner confirmation, DNS lookup, access logs, staged disable. |

## HEROKU DECISION

Stay on Heroku when:

- Heroku invoice is below the AWS recurring floor plus expected operator time.
- AWS rollback, migration, cache, and observability workflows are not routine.
- .com DNS/data migration risk is unresolved.

Run hybrid when:

- AWS serves `learngala.dev` reliably but Heroku remains the lower-risk .com production system.
- AWS is used for preview/dev/prod-candidate validation, cache behavior testing, and migration rehearsals.
- CODEOWNER review still needs Heroku invoice data and final cutover runbook.

Migrate fully when:

- GitHub Actions deploy, promote-production, rollback, and maintenance workflows have dry-run-first and mutation evidence.
- Production cache behavior is correct enough that anonymous traffic is mostly edge-served where safe.
- RDS restore/migration, media validation, CloudFront invalidation, Rails.cache clear, and rollback boundaries are understood.
- Heroku invoice and platform limitations justify AWS operator burden.

## EVIDENCE

- Source assertions: GalaWeb, GalaWorker, GalaDatabase, GalaCache, GalaAppRouter, GalaStaticAssets, GalaStaticAssetsDistribution, GalaAppDistribution, GalaMigrate, GalaSeedDatabase, GalaRefreshIndices, GalaWeeklyReport are present in `infra/sst.config.ts`.
- AWS account identity: `353760060567`.
- ECS clusters: production `arn:aws:ecs:us-west-2:353760060567:cluster/gala-production-GalaClusterCluster-huxhnoss`; dev `arn:aws:ecs:us-west-2:353760060567:cluster/gala-dev-GalaClusterCluster-zeeusfkv`.
- RDS rows observed: 2.
- Valkey rows observed: 2.
- CloudFront distributions observed:

| ID | Comment | Aliases | Price class | Status |
| --- | --- | --- | --- | --- |
| EFG3KMY34LDY6 | (no comment) | galaxy.learngala.com | PriceClass_All | Deployed |
| E2EDUP84FXRXCP | (no comment) | docs.learngala.com, about.learngala.com | PriceClass_All | Deployed |
| E28H7N26PSNC9E | (no comment) | csc.learngala.com | PriceClass_All | Deployed |
| EI4GGPHNM469B | gala-production static assets | (none) | PriceClass_100 | Deployed |
| EF4NIYHMN17KT | gala-production app edge cache | (none) | PriceClass_100 | Deployed |
| E3FF4TTU9Q4XTY | GalaAppRouter app | dev.learngala.dev, *.dev.learngala.dev, learngala.dev | PriceClass_All | Deployed |
| EUWPHB77806X0 | gala-dev static assets | (none) | PriceClass_100 | Deployed |
| EO8V10J0LC0GE | gala-dev app edge cache | (none) | PriceClass_100 | Deployed |

- ECR repositories: gala, gala-production-base.
- S3 buckets with gala in name: briefing.learngala.com, csc.learngala.com, docs.learngala.com, gala-activities, gala-deploy-artifacts-353760060567, gala-static-assets-353760060567, galaxy.learngala.com, msc-gala, msc-gala-dev.
- Log groups with gala in name: 12.
- Cost Explorer total: USD 50.79.

## UNKNOWN UNKNOWNS

| Unknown | Why it matters | How to resolve |
| --- | --- | --- |
| Heroku invoice and plan | Needed for stay/hybrid/migrate economics. | Export latest Heroku invoice, dyno/add-on plan, database/cache tiers, and bandwidth if available. |
| Per-stage AWS cost split | Current Cost Explorer evidence is account-wide. | Add/verify cost allocation tags for stage and resource role. |
| S3 bucket byte/object inventory | Media, static, and deploy buckets can dominate later. | Use S3 Storage Lens or bucket inventory; avoid recursive cleanup scans. |
| Production CloudFront cache hit ratio | User-observed cache misses can drive compute/RDS spend. | Add CloudFront metrics review and header smoke tests. |
| Router price-class drift | Source intends `PriceClass_100`; live router may differ. | Run SST diff and inspect router distribution config before mutation. |
| Production DB storage drift | Source says 50 GB; live production allocated storage is 20 GB. | Reconcile SST state/config/import behavior and confirm desired storage. |
| Phase 28 ARM64 proof | ARM64 savings are conditional. | Complete ARM64 dev/prod validation and rollback evidence. |
| Legacy .com distribution ownership | They may be live non-SST assets. | Confirm DNS, owners, logs, and migration plan before removal. |
