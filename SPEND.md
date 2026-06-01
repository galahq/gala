# SPEND.md

Date: 2026-06-01
Scope: Gala SST-tracked AWS infrastructure in `infra/sst.config.ts`, observed with `AWS_PROFILE=gala AWS_REGION=us-west-2`.

## EXECUTIVE SUMMARY

The AWS platform is already cheap enough for migration evaluation: May 2026 account-wide Cost Explorer spend for the services in scope was about USD 50.79. That is not a clean production-only bill because it includes dev, shared buckets, old distributions, deploy artifacts, and account-level services, but it is good enough to show the current cost shape.

The recurring floor is always-on Fargate, RDS, Valkey, ALB, VPC public IPv4/networking, S3, CloudWatch Logs, and small retained secrets/platform charges. The first costs that will grow are app compute, RDS load/storage, CloudFront/S3 transfer, log volume, ECR/static asset retention, and preview environment lifetime.

Highest leverage now:

1. Keep dev/preview on Fargate Spot and short TTLs.
2. Fix CloudFront cache behavior before scaling web tasks.
3. Add ECR, static asset, S3, and log retention budgets.
4. Reconcile source/live drift before buying commitments.
5. Treat ARM64 as conditional until Phase 28 runtime proof is complete.

Decision Thresholds:

- Stay on Heroku if the invoice is below the AWS recurring floor plus the operator burden of GitHub Actions/SST/ECS ownership.
- Hybrid is best while AWS production is being proven and `.com` DNS/data migration risk remains open.
- Migrate fully when rollback, cache behavior, migrations, observability, and production deploy dry-runs are routine and the Heroku invoice is materially higher than AWS plus operator time.

Missing evidence: actual Heroku invoice/plan, production traffic and cache hit ratio, S3 bucket byte inventory, per-environment cost allocation tags, and Phase 28 ARM64 UAT.

## SCOPE

Included:

- SST resources tracked by `infra/sst.config.ts`.
- GitHub Actions operator workflows that create deploy, rollback, preview, cache, migration, one-off, and release-retention side effects.
- Live AWS observations from ECS, RDS, ElastiCache/Valkey, ALB, CloudFront, S3, ECR, CloudWatch Logs, and Cost Explorer.

Excluded:

- Heroku invoice totals, because they were not available in the repository or AWS account.
- Non-Gala AWS workloads unless they appeared in account-wide service totals.
- Any secret values, database URLs, Redis URLs, passwords, or deploy credentials.

## INVENTORY

| Area | Tracked source | Live observation | Spend driver |
| --- | --- | --- | --- |
| ECS web | `GalaWeb`, production 1 vCPU/2 GB, min 2 max 3; dev 0.5 vCPU/1 GB, min 1 max 1 | Production desired/running 2/2 on `FARGATE`, task def rev 15, X86_64. Dev desired/running 1/1 on `FARGATE_SPOT`, task def rev 9, X86_64. | Fargate vCPU-hours, GB-hours, public IPv4/networking, logs. |
| ECS worker | `GalaWorker`, production 0.5 vCPU/1 GB, min 1 max 2; dev 0.25 vCPU/1 GB, min 1 max 1 | Production desired/running 1/1 on `FARGATE`, task def rev 15, X86_64. Dev desired/running 1/1 on `FARGATE_SPOT`, task def rev 8, X86_64. | Fargate vCPU-hours, GB-hours, queue volume, logs. |
| ECS tasks | `GalaMigrate`, `GalaSeedDatabase`, `GalaRefreshIndices`, `GalaWeeklyReport` | SST log groups exist with 30-day retention. | Short Fargate task runtime, logs, operator workflow frequency. |
| Database | `GalaDatabase`, PostgreSQL 16, production `db.t4g.small`, dev `db.t4g.micro`, single AZ, proxy off | Production `db.t4g.small`, PostgreSQL 16.13, 20 GB gp3, 7-day backups. Dev `db.t4g.micro`, 20 GB gp3, 7-day backups. | Instance-hours, storage, backups, I/O, CPU credits if bursty. |
| Cache | `GalaCache`, Valkey 7.2, `cache.t4g.micro`, cluster false | Production and dev each have one `cache.t4g.micro` Valkey 7.2.6 node. | Node-hours, memory pressure, cache churn. |
| ALB | `GalaWeb` load balancer | Two internet-facing app load balancers are active for dev/prod. | ALB-hours, LCUs, data processed. |
| App edge | `GalaAppDistribution` / `GalaAppDistributionDev`, `PriceClass_100`, public catalog JSON cached for 30 days, case show 2 minutes | Production app edge `EF4NIYHMN17KT`, dev app edge `EO8V10J0LC0GE`, both deployed and `PriceClass_100`. | Requests, transfer, invalidations, origin miss rate. |
| Router | `GalaAppRouter`, production routes `learngala.dev`, `dev.learngala.dev`, `*.dev.learngala.dev` | Router distribution `E3FF4TTU9Q4XTY` deployed with those aliases but `PriceClass_All`. Source transform intends `PriceClass_100`. | Requests, transfer, extra global edge scope if drift persists. |
| Static assets | `GalaStaticAssets`, `GalaStaticAssetsDistribution`, immutable release prefixes | Bucket `gala-static-assets-353760060567`, static distributions for prod/dev, `PriceClass_100`. | S3 storage, requests, CloudFront transfer, retained release prefixes. |
| Media | Retained `msc-gala` bucket reference | Buckets include `msc-gala` and `msc-gala-dev`; ownership and byte volume need separate inventory. | S3 storage, requests, transfer, lifecycle, backup/retention. |
| Images | ECR `gala`, `gala-production-base` | Repository `gala` has 33 image details, including multiple large untagged layers and current tags around 0.36-1.7 GB. | ECR storage, image retention, deploy frequency. |
| Logs | SST ECS log groups | 12 Gala log groups, 30-day retention; production web stored about 142 MB, dev web about 43 MB. | Ingestion, retention storage, query scans. |
| Secrets/config | SST secure parameters and retained app secrets | Names and counts are cost-bearing; values were not read. Cost Explorer shows Secrets Manager charges in the account. | Per-secret/per-parameter storage/API, KMS where used. |
| Workflows | `workflow_dispatch` in deploy, preview, rollback, maintenance, promote-production | `GALA_RELEASE_RETAIN_COUNT=10` used in deploy/preview/rollback paths. | GitHub Actions minutes/storage, AWS calls, release asset retention, operator time. |

## CAPEX

Capex here means one-time migration and platform work, not purchased hardware.

| Work item | Why it exists | Evidence needed before `.com` cutover |
| --- | --- | --- |
| Database migration | Heroku-to-RDS migration, restore rehearsal, migration ordering, rollback boundary. | Restore duration, data integrity checks, migration dry-run logs, snapshot/backup plan. |
| Media migration | ActiveStorage/media bucket ownership and lifecycle must be settled. | S3 inventory for `msc-gala`, object class mix, missing-object smoke tests. |
| DNS and Cloudflare cutover | `learngala.dev` is active; `.com` legacy domains still exist in CloudFront. | DNS TTL plan, Cloudflare zone readiness, `.com` route ownership decision. |
| Deploy/rollback drills | Operator workflows replace Heroku deploy primitives. | Successful dry-run, mutation run, rollback run, and maintenance run summaries. |
| Observability | ECS/RDS/cache/CloudFront ownership requires logs, metrics, alarms, and runbooks. | Alarm list, dashboard links, log retention policy, on-call verification checklist. |
| Cache correctness | Production cache miss behavior can force excess origin load. | CloudFront hit ratio, Rails cache keys, anonymous vs authenticated path policy tests. |
| Spend model | Cost tags and budget alarms are required for decision hygiene. | Cost allocation tags, AWS Budgets, monthly Cost Explorer review. |

## OPEX

Measured May 2026 account-wide Cost Explorer service totals for the material AWS services in this scope:

| Service | May 2026 spend | Treatment |
| --- | ---: | --- |
| Amazon Elastic Container Service | USD 18.65 | Main compute floor for ECS/Fargate. |
| Amazon Relational Database Service | USD 7.83 | RDS instance/storage/backup floor. |
| Amazon Virtual Private Cloud | USD 6.44 | Public IPv4/networking/NAT-like account charges. Verify exact allocation. |
| Amazon Elastic Load Balancing | USD 5.06 | ALB floor and LCU usage. |
| Amazon ElastiCache | USD 4.45 | Valkey dev/prod node-hours. |
| Amazon Simple Storage Service | USD 4.41 | Media/static/deploy artifact storage and requests. |
| AWS Secrets Manager | USD 1.70 | Account secret/config storage. Validate if all are still needed. |
| EC2 - Other | USD 0.91 | EBS/networking/supporting EC2-class charges; inspect if this grows. |
| AmazonCloudWatch | USD 0.46 | Logs/metrics. Logs currently have 30-day retention. |
| Amazon EC2 Container Registry | USD 0.25 | ECR image storage. Retention matters as deploy frequency grows. |
| Amazon Route 53 | USD 0.27 | Hosted zones/DNS queries. |
| Amazon CloudFront | USD 0.02 | Currently low; will grow with successful cacheable traffic. |
| Other low-dollar services | USD 0.20 | KMS, Lambda, API Gateway, SES, etc. |
| **Total observed** | **about USD 50.79** | Account-wide, not production-only. |

Recurring model formulas:

- Fargate = sum(task count x vCPU x hours x regional vCPU rate) + sum(task count x GB x hours x regional memory rate).
- RDS = instance-hours + allocated storage + backup storage above free retention + I/O where applicable.
- Valkey = node-hours + transfer/backup if enabled later.
- ALB = load-balancer hours + LCUs.
- CloudFront = requests + data transfer + invalidation overage.
- S3 = object storage by class + requests + transfer + inventory/lifecycle operations.
- ECR = GB-month of retained images and layers.
- CloudWatch = ingestion + retained GB-month + Logs Insights query scans.
- Public IPv4/VPC = public IPv4 hours and related network processing.
- GitHub Actions = runner minutes, artifacts, release assets, and operator review time.

Pricing sources checked on 2026-06-01:

- AWS Fargate pricing: https://aws.amazon.com/fargate/pricing/
- Amazon RDS pricing: https://aws.amazon.com/rds/postgresql/pricing/
- Amazon ElastiCache pricing: https://aws.amazon.com/elasticache/pricing/
- Elastic Load Balancing pricing: https://aws.amazon.com/elasticloadbalancing/pricing/
- Amazon CloudFront pricing: https://aws.amazon.com/cloudfront/pricing/
- Amazon S3 pricing: https://aws.amazon.com/s3/pricing/
- Amazon ECR pricing: https://aws.amazon.com/ecr/pricing/
- Amazon CloudWatch pricing: https://aws.amazon.com/cloudwatch/pricing/
- Amazon VPC pricing, including public IPv4: https://aws.amazon.com/vpc/pricing/
- GitHub Actions billing: https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions

## GROWTH MODEL

| Scenario | Traffic and cache assumptions | Infra behavior | Cost watchpoints |
| --- | --- | --- | --- |
| Low | Catalog JSON and anonymous paths remain modest; cache hit ratio is high; authenticated/private case traffic is the minority; preview count is 0-1 and short-lived. | Production stays 2 web + 1 worker; RDS `db.t4g.small` and Valkey `cache.t4g.micro` remain enough; dev uses Spot. | Fixed floor dominates. Cut via retention, preview TTL, and old distribution cleanup. |
| Expected | `/cases.json`, feature/catalog JSON, and public case reads rise; anonymous cache hit ratio improves; authenticated/editor traffic grows slowly; 1-2 previews during active work. | Web may scale to 3 during peaks; worker queue volume grows with refresh/report tasks; RDS CPU/storage and log volume become the first scaling signals. | CloudFront miss rate, RDS CPU credits/load, production web autoscaling, logs, ECR images. |
| High | Cacheable catalog traffic grows materially, cache hit ratio is uneven, authenticated/private traffic is significant, previews linger, release frequency increases. | Web max may need >3; worker max may need >2; RDS class/storage may grow; Valkey memory pressure may require larger node; S3/media transfer grows. | Origin misses, DB saturation, Valkey evictions, CloudFront transfer, S3 media, preview lifetime, scheduled task runtime. |

First-class drivers:

- Catalog JSON traffic: `/cases.json`, `/cases/features.json`, `/catalog/languages.json`, `/catalog/libraries.json`, `/tags.json`.
- Cache hit ratio: anonymous/cacheable paths must stay cookie-free where safe; authenticated paths should bypass edge cache.
- Web task scaling: production has min 2, max 3; cost grows linearly with task-hours.
- Worker queue volume: Sidekiq and scheduled tasks grow with indexing, reports, mail, and cache refresh work.
- RDS: storage, CPU, connections, query shape, backups, and possible class changes.
- Valkey: memory, evictions, connection count, and cache churn.
- CloudFront: requests, transfer, invalidations, and `PriceClass_All` router drift.
- S3: media, static release prefixes, deploy artifacts, object count, and lifecycle.
- ECR: deploy frequency and untagged image retention.
- CloudWatch: app verbosity, Rails/Sidekiq logs, and Logs Insights query scans.
- Preview environments: count, TTL, Spot availability, and release artifact cleanup.

## CUT COST

| Priority | Recommendation | Impact | Risk | Validate |
| --- | --- | --- | --- | --- |
| Now | Fix production cache behavior and measure CloudFront hit ratio before adding web tasks. | Avoids paying Fargate/RDS/ALB for repeat anonymous catalog traffic. | Incorrect caching can expose private data or serve stale content. | Header tests for anonymous/authenticated paths; CloudFront hit/miss metrics. |
| Now | Add ECR lifecycle policy for untagged images and retain only needed rollback tags. | ECR is low now but grows with deploy frequency and large images. | Over-aggressive cleanup can remove rollback image. | Keep `GALA_RELEASE_RETAIN_COUNT=10`; prove rollback references survive. |
| Now | Add static asset release-prefix lifecycle or retention budget. | Prevents S3/static assets from growing without bound. | Removing active asset prefix breaks old pages/releases. | Confirm active release prefixes and rollback window before deletion. |
| Now | Set and audit log retention by environment. | CloudWatch is manageable now; growth is predictable. | Too-short retention hurts incident review. | Keep production retention aligned with incident policy; dev can be shorter. |
| Now | Reconcile CloudFront router `PriceClass_All` drift against source `PriceClass_100`. | Reduces global edge scope if intended. | Changing router distribution affects public routing. | SST diff, CloudFront config check, dry-run, then low-traffic deployment. |
| Next | Rightsize production web/worker after real utilization data. | Can reduce Fargate floor or prevent premature scale-up. | Undersizing hurts latency and job throughput. | CPU/memory p95, request latency, Sidekiq queue age. |
| Next | Keep dev and preview on Fargate Spot with strict TTL controls. | Saves non-prod compute. | Spot interruption can disrupt validation. | Preview run summary, smoke tests, explicit re-run path. |
| Next | S3 lifecycle for media/deploy artifacts by bucket role. | Controls media and artifact storage. | Incorrect lifecycle can delete user media or seed dumps. | Classify `msc-gala`, `msc-gala-dev`, deploy artifact buckets before applying. |
| Next | Add cost allocation tags and AWS Budgets. | Makes prod/dev/shared cost visible. | Tag rollout can be incomplete at first. | Monthly Cost Explorer report split by stage/tag. |
| Later | ARM64 Fargate and images if Phase 28 proof passes. | Can lower compute price and sometimes improve efficiency. | Native gem/image/runtime mismatch can break production. | Complete Phase 28 UAT, task-definition architecture match, rollback drill. |
| Later | Savings Plans or RDS reservations only after steady utilization. | Reduces fixed cost after usage stabilizes. | Premature commitments reduce flexibility. | Three months of stable utilization and migration confidence. |
| Later | Review old `learngala.com` CloudFront distributions. | Removes legacy monthly minimums and confusion if unused. | They may still serve live properties. | Owner confirmation, DNS lookup, access logs, staged disable window. |
| Later | Larger RDS/cache classes only after bottleneck proof. | Avoids spend caused by cache misses or query bugs. | Delaying real capacity can hurt reliability. | Metrics, slow queries, hit ratio, load tests. |

## HEROKU DECISION

Stay on Heroku when:

- Heroku invoice is below the AWS recurring floor plus the expected operator time.
- AWS rollback, migration, cache, and observability workflows are not yet routine.
- `.com` DNS/data migration risk is still unresolved.

Run hybrid when:

- AWS serves `learngala.dev` reliably, but Heroku remains the lower-risk `.com` production system.
- AWS is used for preview/dev/prod-candidate validation, cache behavior testing, and migration rehearsals.
- CODEOWNER review still needs Heroku invoice data and a final cutover runbook.

Migrate fully when:

- GitHub Actions deploy, promote-production, rollback, and maintenance workflows have successful dry-run-first evidence and mutation evidence.
- Production cache behavior is correct enough that anonymous traffic is mostly edge-served where safe.
- RDS restore/migration, media validation, CloudFront invalidation, Rails.cache clear, and rollback boundaries are understood.
- Heroku invoice and platform limitations justify the AWS operator burden.

Non-cost drivers:

- Operator burden: AWS/SST/ECS requires more explicit ownership than Heroku.
- Rollback confidence: task/image rollback does not reverse migrations, Rails cache, CloudFront cache, static prefixes, or data writes.
- Data migration risk: DB and media cutover are the highest one-time risks.
- Cache/performance wins: CloudFront can beat Heroku when cache keys are correct.
- CI/deploy maturity: manual `workflow_dispatch`, dry-run-first behavior, PR preview comments, and operator docs are strengths.
- Supportability: alarms, logs, runbooks, and account-level cost visibility must be maintained.

## EVIDENCE

Primary local evidence:

- `infra/sst.config.ts`: VPC, ECS services/tasks, RDS, Valkey, S3, CloudFront, router, runtime architecture, cache paths.
- `.github/workflows/deploy.yml`, `preview.yml`, `rollback.yml`, `maintenance.yml`, `promote-production.yml`: manual workflow surfaces and dry-run/operator gates.
- `scripts/deploy-sst.sh`, `scripts/ops/operator-common.sh`: deploy, release retention, cache invalidation, ECS task execution, rollback helpers.
- `docs/ops/workflows/`: manpage-style operator documentation for deploy-dev, PR merge, promote-production, rollback, maintenance, and guardrails.

Primary AWS evidence:

- Account: `353760060567`, region `us-west-2`.
- ECS clusters: `gala-dev-GalaClusterCluster-zeeusfkv`, `gala-production-GalaClusterCluster-huxhnoss`.
- Production ECS: `GalaWeb` 2/2 Fargate X86_64 rev 15, `GalaWorker` 1/1 Fargate X86_64 rev 15.
- Dev ECS: `GalaWeb` 1/1 Fargate Spot X86_64 rev 9, `GalaWorker` 1/1 Fargate Spot X86_64 rev 8.
- RDS: production `db.t4g.small`, dev `db.t4g.micro`, PostgreSQL 16.13, 20 GB gp3 each, 7-day backups.
- Valkey: production and dev `cache.t4g.micro`, Valkey 7.2.6, one node each.
- CloudFront: production app/static and dev app/static are `PriceClass_100`; router is `PriceClass_All`; three legacy `.com` distributions are also deployed.
- ECR: repositories `gala` and `gala-production-base`; `gala` has 33 image details.
- Logs: SST ECS log groups have 30-day retention.
- Cost Explorer: May 2026 service total about USD 50.79 for account-wide services in scope.

## UNKNOWN UNKNOWNS

| Unknown | Why it matters | How to resolve |
| --- | --- | --- |
| Heroku invoice and plan | Needed for stay/hybrid/migrate economics. | Export latest Heroku invoice, dyno/add-on plan, database/cache tiers, and bandwidth if available. |
| Per-stage AWS cost split | Current Cost Explorer evidence is account-wide. | Add/verify cost allocation tags for stage and resource role. |
| S3 bucket byte/object inventory | `msc-gala`, `msc-gala-dev`, static, and deploy artifact buckets can dominate later. | Use S3 Storage Lens or bucket inventory; avoid ad hoc destructive cleanup. |
| Production CloudFront cache hit ratio | User-observed cache misses can drive compute/RDS spend. | Add CloudFront metrics review and header smoke tests for anonymous/authenticated paths. |
| Router price-class drift | Source intends `PriceClass_100`; live router is `PriceClass_All`. | Run SST diff and inspect router distribution config before mutation. |
| Production DB source/live storage drift | Source says production 50 GB; live RDS is 20 GB. | Reconcile SST state/config/import behavior and confirm desired storage. |
| Phase 28 ARM64 proof | ARM64 savings are conditional. | Complete ARM64 dev/prod validation and rollback evidence. |
| Legacy `.com` distribution ownership | They may be live non-SST assets. | Confirm DNS, owners, logs, and planned `.com` migration before removal. |
| Operator labor cost | AWS can be cheaper in dollars but more expensive in maintenance. | Track deploy, incident, rollback, and monthly spend-review hours. |

## NEXT REVIEW

Review this report after:

- Heroku invoice data is attached.
- Cache hit ratio evidence exists for `/cases.json` and other public catalog paths.
- Phase 28 ARM64 runtime proof is complete or explicitly rejected.
- Cost allocation tags split production, dev, shared, and legacy resources.
- `.com` DNS and legacy CloudFront ownership are decided.
