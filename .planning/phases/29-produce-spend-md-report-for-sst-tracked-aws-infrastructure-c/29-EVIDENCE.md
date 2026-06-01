# Phase 29 Evidence

Date: 2026-06-01
Mode: read-only source and AWS evidence collection.
AWS profile/region: `AWS_PROFILE=gala AWS_REGION=us-west-2`.

## Source Evidence

- `infra/sst.config.ts`
  - App name `gala`, home `aws`, provider region `us-west-2`.
  - Production removal policy is retain; non-production removal policy is remove.
  - `GalaStaticAssets` imports or creates `gala-static-assets-353760060567`; static assets use immutable cache control.
  - `GalaStaticAssetsDistribution` uses `PriceClass_100`.
  - Retained app secure strings are stored through SST/SSM; values were not read.
  - `GalaVpc` has 2 AZs; comment says ECS tasks stay in public subnets and RDS/cache private to avoid NAT costs, while current `Postgres`/`Redis` config passes public subnets.
  - `GalaDatabase` uses PostgreSQL 16, production `t4g.small`, dev `t4g.micro`, source storage production `50 GB`, dev `20 GB`, single AZ.
  - `GalaCache` uses Valkey 7.2, `t4g.micro`, no cluster.
  - `GalaWeb` production uses 1 vCPU/2 GB, min 2 max 3; dev uses 0.5 vCPU/1 GB, min 1 max 1.
  - `GalaWorker` production uses 0.5 vCPU/1 GB, min 1 max 2; dev uses 0.25 vCPU/1 GB.
  - `GalaAppDistribution`/dev app distribution use public catalog cache paths including `/cases.json`, `/cases/features.json`, `/catalog/languages.json`, `/catalog/libraries.json`, `/tags.json`.
  - `GalaAppRouter` source transform sets `PriceClass_100` for production router CDN.
  - `GalaMigrate`, `GalaSeedDatabase`, `GalaRefreshIndices`, and `GalaWeeklyReport` are SST tasks.

- Workflow and operator docs
  - `.github/workflows/deploy.yml`, `preview.yml`, `rollback.yml`, `maintenance.yml`, and `promote-production.yml` expose manual `workflow_dispatch` surfaces.
  - `deploy.yml`, `preview.yml`, and `rollback.yml` set `GALA_RELEASE_RETAIN_COUNT=10`.
  - `maintenance.yml` supports migration, allowlisted one-off tasks, Rails cache clear, CloudFront invalidation, and combined cache operations with dry-run and production confirmation gates.
  - `preview.yml` creates a preview URL and writes a PR comment when an associated PR exists.
  - `scripts/deploy-sst.sh` validates stage, release, image size, architecture, retained keys, user-data hooks, asset uploads, CloudFront invalidation, and ECS-only/SST deploy paths.
  - `docs/ops/workflows/` contains terse operator manuals for deploy-dev, PR merge, promote-production, rollback, maintenance, and guardrails.

## AWS Read-Only Commands

All commands were read-only AWS CLI commands. No SSM parameter values, database URLs, Redis URLs, passwords, tokens, or secret payloads were requested.

### Identity

Command:

```sh
AWS_PROFILE=gala AWS_REGION=us-west-2 aws sts get-caller-identity --query '{Account:Account,Arn:Arn}' --output json
```

Observation:

- Account `353760060567`.
- Principal ARN was an IAM user for the operator account; no credentials printed.

### ECS Clusters

Command:

```sh
AWS_PROFILE=gala AWS_REGION=us-west-2 aws ecs list-clusters --output json
```

Observation:

- `gala-dev-GalaClusterCluster-zeeusfkv`
- `gala-production-GalaClusterCluster-huxhnoss`

### ECS Services

Commands:

```sh
AWS_PROFILE=gala AWS_REGION=us-west-2 aws ecs describe-services --cluster gala-production-GalaClusterCluster-huxhnoss --services GalaWeb GalaWorker --query 'services[].{name:serviceName,desired:desiredCount,running:runningCount,capacityProviderStrategy:capacityProviderStrategy,taskDefinition:taskDefinition,deployments:deployments[].{status:status,desired:desiredCount,running:runningCount,taskDefinition:taskDefinition,rolloutState:rolloutState}}' --output json
AWS_PROFILE=gala AWS_REGION=us-west-2 aws ecs describe-services --cluster gala-dev-GalaClusterCluster-zeeusfkv --services GalaWeb GalaWorker --query 'services[].{name:serviceName,desired:desiredCount,running:runningCount,capacityProviderStrategy:capacityProviderStrategy,taskDefinition:taskDefinition,deployments:deployments[].{status:status,desired:desiredCount,running:runningCount,taskDefinition:taskDefinition,rolloutState:rolloutState}}' --output json
```

Observed:

- Production `GalaWeb`: desired 2, running 2, `FARGATE`, task definition rev 15, rollout completed.
- Production `GalaWorker`: desired 1, running 1, `FARGATE`, task definition rev 15, rollout completed.
- Dev `GalaWeb`: desired 1, running 1, `FARGATE_SPOT`, task definition rev 9, rollout completed.
- Dev `GalaWorker`: desired 1, running 1, `FARGATE_SPOT`, task definition rev 8, rollout completed.

### ECS Task Definitions

Commands:

```sh
AWS_PROFILE=gala AWS_REGION=us-west-2 aws ecs describe-task-definition --task-definition gala-production-GalaClusterCluster-huxhnoss-GalaWeb:15 --query 'taskDefinition.{family:family,revision:revision,cpu:cpu,memory:memory,runtimePlatform:runtimePlatform,container:containerDefinitions[0].{name:name,image:image}}' --output json
AWS_PROFILE=gala AWS_REGION=us-west-2 aws ecs describe-task-definition --task-definition gala-production-GalaClusterCluster-huxhnoss-GalaWorker:15 --query 'taskDefinition.{family:family,revision:revision,cpu:cpu,memory:memory,runtimePlatform:runtimePlatform,container:containerDefinitions[0].{name:name,image:image}}' --output json
AWS_PROFILE=gala AWS_REGION=us-west-2 aws ecs describe-task-definition --task-definition gala-dev-GalaClusterCluster-zeeusfkv-GalaWeb:9 --query 'taskDefinition.{family:family,revision:revision,cpu:cpu,memory:memory,runtimePlatform:runtimePlatform,container:containerDefinitions[0].{name:name,image:image}}' --output json
AWS_PROFILE=gala AWS_REGION=us-west-2 aws ecs describe-task-definition --task-definition gala-dev-GalaClusterCluster-zeeusfkv-GalaWorker:8 --query 'taskDefinition.{family:family,revision:revision,cpu:cpu,memory:memory,runtimePlatform:runtimePlatform,container:containerDefinitions[0].{name:name,image:image}}' --output json
```

Observed:

- Production web: cpu 1024, memory 2048, X86_64 Linux, current image tag `20260601093132.local.7b69926b.dirty`.
- Production worker: cpu 512, memory 1024, X86_64 Linux, same current image tag.
- Dev web: cpu 512, memory 1024, X86_64 Linux, image tag `26744286076.20260601083851.075b8941`.
- Dev worker: cpu 256, memory 1024, X86_64 Linux, same dev image tag.

### RDS

Command:

```sh
AWS_PROFILE=gala AWS_REGION=us-west-2 aws rds describe-db-instances --query 'DBInstances[?contains(DBInstanceIdentifier, `gala`)].{id:DBInstanceIdentifier,class:DBInstanceClass,engine:Engine,engineVersion:EngineVersion,allocated:AllocatedStorage,multiAZ:MultiAZ,storageType:StorageType,status:DBInstanceStatus,backupRetention:BackupRetentionPeriod}' --output json
```

Observed:

- Dev: `db.t4g.micro`, PostgreSQL 16.13, 20 GB gp3, single AZ, 7-day backup retention.
- Production: `db.t4g.small`, PostgreSQL 16.13, 20 GB gp3, single AZ, 7-day backup retention.
- Drift: source intends production storage `50 GB`; live production allocated storage is 20 GB.

### ElastiCache / Valkey

Command:

```sh
AWS_PROFILE=gala AWS_REGION=us-west-2 aws elasticache describe-cache-clusters --show-cache-node-info --query 'CacheClusters[?contains(CacheClusterId, `gala`)].{id:CacheClusterId,engine:Engine,version:EngineVersion,nodeType:CacheNodeType,numNodes:NumCacheNodes,status:CacheClusterStatus}' --output json
```

Observed:

- Dev: `cache.t4g.micro`, Valkey 7.2.6, one node, available.
- Production: `cache.t4g.micro`, Valkey 7.2.6, one node, available.

### Load Balancers

Command:

```sh
AWS_PROFILE=gala AWS_REGION=us-west-2 aws elbv2 describe-load-balancers --query 'LoadBalancers[?contains(LoadBalancerName, `GalaWebLoadBala`)].{name:LoadBalancerName,dns:DNSName,scheme:Scheme,type:Type,state:State.Code}' --output json
```

Observed:

- Two active internet-facing application load balancers matching the SST web load balancer naming pattern.

### CloudFront

Command:

```sh
AWS_PROFILE=gala AWS_REGION=us-west-2 aws cloudfront list-distributions --query 'DistributionList.Items[].{id:Id,comment:Comment,aliases:Aliases.Items,priceClass:PriceClass,status:Status,enabled:Enabled}' --output json
```

Observed:

- `EI4GGPHNM469B`: `gala-production static assets`, `PriceClass_100`.
- `EF4NIYHMN17KT`: `gala-production app edge cache`, `PriceClass_100`.
- `E3FF4TTU9Q4XTY`: `GalaAppRouter app`, aliases `learngala.dev`, `dev.learngala.dev`, `*.dev.learngala.dev`, live `PriceClass_All`.
- `EUWPHB77806X0`: `gala-dev static assets`, `PriceClass_100`.
- `EO8V10J0LC0GE`: `gala-dev app edge cache`, `PriceClass_100`.
- Legacy `learngala.com` distributions are deployed with `PriceClass_All`: `galaxy.learngala.com`, `docs.learngala.com`, `about.learngala.com`, `csc.learngala.com`.
- Drift: source sets router CDN `PriceClass_100`; live router reports `PriceClass_All`.

### S3

Command:

```sh
AWS_PROFILE=gala AWS_REGION=us-west-2 aws s3api list-buckets --query 'Buckets[?contains(Name, `gala`)].Name' --output json
```

Observed buckets:

- `gala-static-assets-353760060567`
- `gala-deploy-artifacts-353760060567`
- `msc-gala`
- `msc-gala-dev`
- Legacy/domain buckets including `briefing.learngala.com`, `csc.learngala.com`, `docs.learngala.com`, `galaxy.learngala.com`
- Bucket byte/object totals were not enumerated in this phase to avoid expensive recursive scans.

### ECR

Commands:

```sh
AWS_PROFILE=gala AWS_REGION=us-west-2 aws ecr describe-repositories --query 'repositories[?contains(repositoryName, `gala`)].{name:repositoryName,uri:repositoryUri}' --output json
AWS_PROFILE=gala AWS_REGION=us-west-2 aws ecr describe-images --repository-name gala --query 'length(imageDetails)' --output text
AWS_PROFILE=gala AWS_REGION=us-west-2 aws ecr describe-images --repository-name gala --query 'imageDetails[].{pushed:imagePushedAt,size:imageSizeInBytes,tags:imageTags}' --output json
```

Observed:

- Repositories: `gala`, `gala-production-base`.
- `gala` repository has 33 image details.
- Image sizes include multiple large retained images and untagged details; current tagged production image is about 1.16 GB.

### CloudWatch Logs

Commands:

```sh
AWS_PROFILE=gala AWS_REGION=us-west-2 aws logs describe-log-groups --log-group-name-prefix /aws/ecs/gala --query 'logGroups[].{name:logGroupName,retention:retentionInDays,bytes:storedBytes}' --output json
AWS_PROFILE=gala AWS_REGION=us-west-2 aws logs describe-log-groups --query 'logGroups[?contains(logGroupName, `gala`)].{name:logGroupName,retention:retentionInDays,bytes:storedBytes}' --output json
```

Observed:

- No `/aws/ecs/gala` log groups.
- SST log groups under `/sst/cluster/...` exist for dev and production `GalaWeb`, `GalaWorker`, `GalaMigrate`, `GalaSeedDatabase`, `GalaRefreshIndices`, and `GalaWeeklyReport`.
- All observed Gala SST log groups had 30-day retention.
- Largest observed stored logs: production web about 142 MB, dev web about 43 MB.

### Cost Explorer

Command:

```sh
AWS_PROFILE=gala AWS_REGION=us-east-1 aws ce get-cost-and-usage --time-period Start=2026-05-01,End=2026-06-01 --granularity MONTHLY --metrics UnblendedCost --group-by Type=DIMENSION,Key=SERVICE --query 'ResultsByTime[0].Groups[].{service:Keys[0],amount:Metrics.UnblendedCost.Amount,unit:Metrics.UnblendedCost.Unit}' --output json
```

Observed May 2026 account-wide service costs in scope:

- Amazon Elastic Container Service: USD 18.6523848963.
- Amazon Relational Database Service: USD 7.8279245471.
- Amazon Virtual Private Cloud: USD 6.4412603338.
- Amazon Elastic Load Balancing: USD 5.0633594504.
- Amazon ElastiCache: USD 4.454272.
- Amazon Simple Storage Service: USD 4.4108611675.
- AWS Secrets Manager: USD 1.6993556091.
- EC2 - Other: USD 0.9069961643.
- AmazonCloudWatch: USD 0.4563754291.
- Amazon EC2 Container Registry: USD 0.2523920774.
- Amazon Route 53: USD 0.267.
- Amazon CloudFront: USD 0.0249640159.
- Low-dollar services including KMS, Lambda, API Gateway, SES total under USD 0.20.
- Total for listed groups: about USD 50.79.

Cost Explorer caveat: this is account-wide and not production-only. It includes dev, shared resources, legacy distributions/buckets, deploy artifacts, and account-level services.

## Pricing Source Notes

Checked on 2026-06-01:

- AWS Fargate pricing: https://aws.amazon.com/fargate/pricing/
- Amazon RDS for PostgreSQL pricing: https://aws.amazon.com/rds/postgresql/pricing/
- Amazon ElastiCache pricing: https://aws.amazon.com/elasticache/pricing/
- Elastic Load Balancing pricing: https://aws.amazon.com/elasticloadbalancing/pricing/
- Amazon CloudFront pricing: https://aws.amazon.com/cloudfront/pricing/
- Amazon S3 pricing: https://aws.amazon.com/s3/pricing/
- Amazon ECR pricing: https://aws.amazon.com/ecr/pricing/
- Amazon CloudWatch pricing: https://aws.amazon.com/cloudwatch/pricing/
- Amazon VPC pricing, including public IPv4: https://aws.amazon.com/vpc/pricing/
- GitHub Actions billing: https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions

SPEND.md uses measured Cost Explorer totals and formulas rather than unsupported exact monthly forecasts.

## Drift And Unknowns

- Production DB storage: source says 50 GB; live RDS says 20 GB allocated.
- Router CloudFront price class: source transform sets `PriceClass_100`; live `GalaAppRouter app` reports `PriceClass_All`.
- Legacy `learngala.com` distributions and buckets exist; ownership is unknown and they are not silently counted as SST migration resources.
- S3 byte/object totals were not measured.
- Cost allocation tags were not verified.
- Heroku invoice and plan data were not available.
- Phase 28 ARM64 proof is not complete in this evidence set; ARM64 savings are conditional.

## Validation Evidence

Final validation commands run on 2026-06-01:

```sh
rg -n "EXECUTIVE SUMMARY|SCOPE|INVENTORY|CAPEX|OPEX|GROWTH MODEL|CUT COST|HEROKU DECISION|EVIDENCE|UNKNOWN" SPEND.md
rg -n "GalaWeb|GalaWorker|GalaDatabase|GalaCache|GalaAppRouter|GalaStaticAssets|GalaStaticAssetsDistribution|GalaAppDistribution|GalaMigrate|GalaSeedDatabase|GalaRefreshIndices|GalaWeeklyReport|workflow_dispatch|GALA_RELEASE_RETAIN_COUNT" SPEND.md .planning/phases/29-produce-spend-md-report-for-sst-tracked-aws-infrastructure-c/29-EVIDENCE.md
rg -n "Assumption|Estimate|Fargate|RDS|Valkey|CloudFront|S3|ALB|ECR|CloudWatch|public IPv4|data transfer" SPEND.md
rg -n "CAPEX|OPEX|Low|Expected|High|GROWTH MODEL|Scenario" SPEND.md
rg -n "CUT COST|Risk|Tradeoff|Heroku|Decision threshold|Stay|Hybrid|AWS" SPEND.md
ruby -e '<section check plus sensitive connection/config pattern scan from 29-VALIDATION.md>'
ruby -e '<same sensitive pattern scan against SPEND.md plus 29-EVIDENCE.md>'
AWS_PROFILE=gala AWS_REGION=us-west-2 aws sts get-caller-identity >/dev/null
```

Result:

- Required sections are present.
- Source, workflow, and live AWS inventory terms are present.
- Capex, opex, growth, cost-cut, and Heroku decision sections are present.
- Secret-pattern scans passed for `SPEND.md` and the phase evidence file.
- AWS identity check passed.
