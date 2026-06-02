#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const args = process.argv.slice(2);
const outputPath = path.resolve(
  repoRoot,
  valueFor("--output") || "SPEND.md",
);
const profile = valueFor("--profile") || process.env.AWS_PROFILE || "gala";
const region = valueFor("--region") || process.env.AWS_REGION || "us-west-2";
const pricingRegion = "us-east-1";
const hoursPerMonth = Number(valueFor("--hours") || "730");
const costMonth = valueFor("--cost-month") || previousMonthWindow();

function valueFor(flag) {
  const index = args.indexOf(flag);
  if (index === -1) return null;
  return args[index + 1] || null;
}

function previousMonthWindow() {
  const now = new Date();
  const firstThisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const firstLastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  return `${firstLastMonth.toISOString().slice(0, 10)}:${firstThisMonth.toISOString().slice(0, 10)}`;
}

function awsJson(serviceArgs, options = {}) {
  const commandArgs = [
    "--profile",
    profile,
    "--region",
    options.region || region,
    ...serviceArgs,
    "--output",
    "json",
  ];
  try {
    const stdout = execFileSync("aws", commandArgs, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return JSON.parse(stdout);
  } catch (error) {
    return { __error: `${error.message}`.split("\n")[0] };
  }
}

function awsText(serviceArgs, options = {}) {
  const commandArgs = [
    "--profile",
    profile,
    "--region",
    options.region || region,
    ...serviceArgs,
    "--output",
    "text",
  ];
  try {
    return execFileSync("aws", commandArgs, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (error) {
    return "";
  }
}

function requiredSourceAssertions() {
  const sstConfigPath = path.join(repoRoot, "infra", "sst.config.ts");
  const sstConfig = fs.readFileSync(sstConfigPath, "utf8");
  const required = [
    "GalaWeb",
    "GalaWorker",
    "GalaDatabase",
    "GalaCache",
    "GalaAppRouter",
    "GalaStaticAssets",
    "GalaStaticAssetsDistribution",
    "GalaAppDistribution",
    "GalaMigrate",
    "GalaSeedDatabase",
    "GalaRefreshIndices",
    "GalaWeeklyReport",
  ];
  const missing = required.filter((name) => !sstConfig.includes(name));
  if (missing.length) {
    throw new Error(`infra/sst.config.ts missing expected tracked resources: ${missing.join(", ")}`);
  }

  return {
    sstConfigPath: "infra/sst.config.ts",
    trackedResourceNames: required,
    productionDbSourceStorage: sstConfig.includes('storage: isProduction ? "50 GB" : "20 GB"')
      ? "50 GB"
      : "unknown",
    customDomainDefault: sstConfig.includes('process.env.GALA_ENABLE_CUSTOM_DOMAIN !== "false"')
      ? "enabled unless disabled"
      : "unknown",
    releaseRetentionEnv: "GALA_RELEASE_RETAIN_COUNT",
  };
}

function findCluster(stage) {
  const clusters = awsJson(["ecs", "list-clusters"]);
  const arns = clusters.clusterArns || [];
  return arns.find((arn) => arn.includes(`gala-${stage}-GalaClusterCluster`)) || "";
}

function describeStage(stage) {
  const clusterArn = findCluster(stage);
  if (!clusterArn) return { stage, error: "cluster not found" };

  const services = awsJson([
    "ecs",
    "describe-services",
    "--cluster",
    clusterArn,
    "--services",
    "GalaWeb",
    "GalaWorker",
    "--query",
    "services[].{name:serviceName,desired:desiredCount,running:runningCount,capacityProviderStrategy:capacityProviderStrategy,taskDefinition:taskDefinition,rollout:deployments[0].rolloutState}",
  ]);
  const serviceRows = Array.isArray(services) ? services : [];
  const taskDefinitions = Object.fromEntries(
    serviceRows.map((service) => {
      const taskDef = awsJson([
        "ecs",
        "describe-task-definition",
        "--task-definition",
        service.taskDefinition,
        "--query",
        "taskDefinition.{family:family,revision:revision,cpu:cpu,memory:memory,runtimePlatform:runtimePlatform,container:containerDefinitions[0].{name:name,image:image}}",
      ]);
      return [service.name, taskDef];
    }),
  );

  return { stage, clusterArn, services: serviceRows, taskDefinitions };
}

function priceOnDemand(serviceCode, filters) {
  const filterArgs = filters.flatMap(([field, value]) => [
    "Type=TERM_MATCH,Field=" + field + ",Value=" + value,
  ]);
  const product = awsJson(
    [
      "pricing",
      "get-products",
      "--service-code",
      serviceCode,
      "--filters",
      ...filterArgs,
      "--max-results",
      "1",
      "--query",
      "PriceList[0]",
    ],
    { region: pricingRegion },
  );
  if (!product || product.__error) return null;
  const parsed = typeof product === "string" ? JSON.parse(product) : product;
  const term = Object.values(parsed.terms?.OnDemand || {})[0];
  const dimension = Object.values(term?.priceDimensions || {})[0];
  if (!dimension) return null;
  return {
    usd: Number(dimension.pricePerUnit?.USD || 0),
    unit: dimension.unit,
    description: dimension.description,
    publicationDate: parsed.publicationDate,
  };
}

function buildPricing() {
  return {
    fargateVCpu: priceOnDemand("AmazonECS", [
      ["location", "US West (Oregon)"],
      ["usagetype", "USW2-Fargate-vCPU-Hours:perCPU"],
    ]),
    fargateGb: priceOnDemand("AmazonECS", [
      ["location", "US West (Oregon)"],
      ["usagetype", "USW2-Fargate-GB-Hours"],
    ]),
    fargateArmVCpu: priceOnDemand("AmazonECS", [
      ["location", "US West (Oregon)"],
      ["usagetype", "USW2-Fargate-ARM-vCPU-Hours:perCPU"],
    ]),
    fargateArmGb: priceOnDemand("AmazonECS", [
      ["location", "US West (Oregon)"],
      ["usagetype", "USW2-Fargate-ARM-GB-Hours"],
    ]),
    rdsT4gSmall: priceOnDemand("AmazonRDS", [
      ["location", "US West (Oregon)"],
      ["instanceType", "db.t4g.small"],
      ["databaseEngine", "PostgreSQL"],
      ["deploymentOption", "Single-AZ"],
    ]),
    rdsT4gMicro: priceOnDemand("AmazonRDS", [
      ["location", "US West (Oregon)"],
      ["instanceType", "db.t4g.micro"],
      ["databaseEngine", "PostgreSQL"],
      ["deploymentOption", "Single-AZ"],
    ]),
    valkeyT4gMicro: priceOnDemand("AmazonElastiCache", [
      ["location", "US West (Oregon)"],
      ["cacheEngine", "Valkey"],
      ["instanceType", "cache.t4g.micro"],
    ]),
    albHour: priceOnDemand("AWSELB", [
      ["location", "US West (Oregon)"],
      ["usagetype", "USW2-LoadBalancerUsage"],
    ]),
  };
}

function money(value) {
  if (value == null || Number.isNaN(value)) return "n/a";
  return `USD ${value.toFixed(2)}`;
}

function rate(value) {
  if (!value) return "n/a";
  return `USD ${value.usd.toFixed(6)} / ${value.unit}`;
}

function monthlyFargate(pricing, vcpu, gb, architecture = "x86_64") {
  const vcpuRate = architecture === "arm64" ? pricing.fargateArmVCpu : pricing.fargateVCpu;
  const gbRate = architecture === "arm64" ? pricing.fargateArmGb : pricing.fargateGb;
  if (!vcpuRate || !gbRate) return null;
  return (vcpu * vcpuRate.usd + gb * gbRate.usd) * hoursPerMonth;
}

function monthlyHourly(price) {
  return price ? price.usd * hoursPerMonth : null;
}

function stageService(stage, name) {
  return stage.services?.find((service) => service.name === name) || {};
}

function taskShape(stage, name) {
  const task = stage.taskDefinitions?.[name] || {};
  return {
    cpu: Number(task.cpu || 0) / 1024,
    memory: Number(task.memory || 0) / 1024,
    architecture: task.runtimePlatform?.cpuArchitecture === "ARM64" ? "arm64" : "x86_64",
    revision: task.revision || "unknown",
    image: task.container?.image || "unknown",
  };
}

function describeRds() {
  const dbs = awsJson([
    "rds",
    "describe-db-instances",
    "--query",
    "DBInstances[?contains(DBInstanceIdentifier, `gala`)].{id:DBInstanceIdentifier,class:DBInstanceClass,engine:Engine,engineVersion:EngineVersion,allocated:AllocatedStorage,multiAZ:MultiAZ,storageType:StorageType,status:DBInstanceStatus,backupRetention:BackupRetentionPeriod}",
  ]);
  return Array.isArray(dbs) ? dbs : [];
}

function describeCache() {
  const caches = awsJson([
    "elasticache",
    "describe-cache-clusters",
    "--show-cache-node-info",
    "--query",
    "CacheClusters[?contains(CacheClusterId, `gala`)].{id:CacheClusterId,engine:Engine,version:EngineVersion,nodeType:CacheNodeType,numNodes:NumCacheNodes,status:CacheClusterStatus}",
  ]);
  return Array.isArray(caches) ? caches : [];
}

function describeCloudfront() {
  const distributions = awsJson([
    "cloudfront",
    "list-distributions",
    "--query",
    "DistributionList.Items[].{id:Id,comment:Comment,aliases:Aliases.Items,priceClass:PriceClass,status:Status,enabled:Enabled}",
  ]);
  return Array.isArray(distributions) ? distributions : [];
}

function describeEcr() {
  const repos = awsJson([
    "ecr",
    "describe-repositories",
    "--query",
    "repositories[?contains(repositoryName, `gala`)].{name:repositoryName,uri:repositoryUri}",
  ]);
  const imageCount = awsText([
    "ecr",
    "describe-images",
    "--repository-name",
    "gala",
    "--query",
    "length(imageDetails)",
  ]);
  return { repos: Array.isArray(repos) ? repos : [], imageCount: Number(imageCount || 0) };
}

function describeLogs() {
  const logs = awsJson([
    "logs",
    "describe-log-groups",
    "--query",
    "logGroups[?contains(logGroupName, `gala`)].{name:logGroupName,retention:retentionInDays,bytes:storedBytes}",
  ]);
  return Array.isArray(logs) ? logs : [];
}

function describeBuckets() {
  const buckets = awsJson([
    "s3api",
    "list-buckets",
    "--query",
    "Buckets[?contains(Name, `gala`)].Name",
  ]);
  return Array.isArray(buckets) ? buckets : [];
}

function costExplorer() {
  const [start, end] = costMonth.split(":");
  const groups = awsJson(
    [
      "ce",
      "get-cost-and-usage",
      "--time-period",
      `Start=${start},End=${end}`,
      "--granularity",
      "MONTHLY",
      "--metrics",
      "UnblendedCost",
      "--group-by",
      "Type=DIMENSION,Key=SERVICE",
      "--query",
      "ResultsByTime[0].Groups[].{service:Keys[0],amount:Metrics.UnblendedCost.Amount,unit:Metrics.UnblendedCost.Unit}",
    ],
    { region: pricingRegion },
  );
  return Array.isArray(groups) ? { start, end, groups } : { start, end, groups: [] };
}

function stageCostRows(stages, pricing) {
  return stages.flatMap((stage) => {
    if (stage.error) return [[stage.stage, "stage", stage.error, "n/a", "n/a"]];
    const web = stageService(stage, "GalaWeb");
    const worker = stageService(stage, "GalaWorker");
    const webShape = taskShape(stage, "GalaWeb");
    const workerShape = taskShape(stage, "GalaWorker");
    const webMonthly = monthlyFargate(pricing, webShape.cpu, webShape.memory, webShape.architecture);
    const workerMonthly = monthlyFargate(pricing, workerShape.cpu, workerShape.memory, workerShape.architecture);
    return [
      [
        stage.stage,
        "GalaWeb",
        `${web.desired || 0} desired / ${web.running || 0} running, ${webShape.cpu} vCPU, ${webShape.memory} GB, ${webShape.architecture}, rev ${webShape.revision}`,
        money(webMonthly),
        money(webMonthly == null ? null : webMonthly * Number(web.desired || 0)),
      ],
      [
        stage.stage,
        "GalaWorker",
        `${worker.desired || 0} desired / ${worker.running || 0} running, ${workerShape.cpu} vCPU, ${workerShape.memory} GB, ${workerShape.architecture}, rev ${workerShape.revision}`,
        money(workerMonthly),
        money(workerMonthly == null ? null : workerMonthly * Number(worker.desired || 0)),
      ],
    ];
  });
}

function modeledStageInfraRows(stages, rdsRows, cacheRows, pricing) {
  const rows = [];
  for (const stage of stages) {
    if (stage.error) continue;
    const web = stageService(stage, "GalaWeb");
    const worker = stageService(stage, "GalaWorker");
    const webShape = taskShape(stage, "GalaWeb");
    const workerShape = taskShape(stage, "GalaWorker");
    const rds = rdsRows.find((row) => row.id?.includes(stage.stage));
    const cache = cacheRows.find((row) => row.id?.includes(stage.stage === "production" ? "production" : "dev"));
    const webMonthly = monthlyFargate(pricing, webShape.cpu, webShape.memory, webShape.architecture) * Number(web.desired || 0);
    const workerMonthly = monthlyFargate(pricing, workerShape.cpu, workerShape.memory, workerShape.architecture) * Number(worker.desired || 0);
    const rdsRate = rds?.class === "db.t4g.small" ? pricing.rdsT4gSmall : pricing.rdsT4gMicro;
    const rdsMonthly = monthlyHourly(rdsRate);
    const cacheMonthly = cache ? monthlyHourly(pricing.valkeyT4gMicro) : null;
    const albMonthly = monthlyHourly(pricing.albHour);
    const subtotal = [webMonthly, workerMonthly, rdsMonthly, cacheMonthly, albMonthly]
      .filter((value) => value != null && !Number.isNaN(value))
      .reduce((sum, value) => sum + value, 0);
    rows.push(
      [stage.stage, "ECS GalaWeb", `${web.desired || 0} desired ${webShape.cpu} vCPU/${webShape.memory} GB ${webShape.architecture}`, money(webMonthly), "Fargate task-hours only."],
      [stage.stage, "ECS GalaWorker", `${worker.desired || 0} desired ${workerShape.cpu} vCPU/${workerShape.memory} GB ${workerShape.architecture}`, money(workerMonthly), "Fargate task-hours only."],
      [stage.stage, "RDS GalaDatabase", rds ? `${rds.class}, ${rds.allocated} GB ${rds.storageType}` : "not observed", money(rdsMonthly), "Instance-hours only; storage, backups, I/O separate."],
      [stage.stage, "Valkey GalaCache", cache ? `${cache.nodeType}, ${cache.numNodes} node` : "not observed", money(cacheMonthly), "Node-hours only."],
      [stage.stage, "Application Load Balancer", "1 ALB assumed from tracked web service", money(albMonthly), "ALB-hours only; LCUs/data processing separate."],
      [stage.stage, "Modeled subtotal", "task + RDS instance + Valkey node + ALB hour floor", money(subtotal), stage.stage === "dev" ? "Dev ECS live capacity is Spot; subtotal uses on-demand task equivalent." : "Production modeled recurring floor subset."],
    );
  }
  return rows;
}

function table(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => `${cell ?? ""}`).join(" | ")} |`),
  ].join("\n");
}

function ceRows(costs) {
  return costs.groups
    .filter((group) => Number(group.amount) > 0)
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .map((group) => [group.service, money(Number(group.amount)), "Account-wide; split by tags before treating as production-only."]);
}

function sumCost(costs) {
  return costs.groups.reduce((sum, group) => sum + Number(group.amount || 0), 0);
}

function cloudfrontRows(distributions) {
  return distributions.map((distribution) => [
    distribution.id,
    distribution.comment || "(no comment)",
    (distribution.aliases || []).join(", ") || "(none)",
    distribution.priceClass,
    distribution.enabled ? distribution.status : "disabled",
  ]);
}

function render() {
  const source = requiredSourceAssertions();
  const production = describeStage("production");
  const dev = describeStage("dev");
  const stages = [production, dev];
  const rds = describeRds();
  const caches = describeCache();
  const distributions = describeCloudfront();
  const ecr = describeEcr();
  const logs = describeLogs();
  const buckets = describeBuckets();
  const costs = costExplorer();
  const pricing = buildPricing();
  const ceTotal = sumCost(costs);
  const router = distributions.find((distribution) => distribution.comment === "GalaAppRouter app");
  const prodDb = rds.find((db) => db.id?.includes("production"));
  const devDb = rds.find((db) => db.id?.includes("dev"));

  const addOneRows = [
    ["Production web task", "1 vCPU / 2 GB Fargate x86_64 for one month", money(monthlyFargate(pricing, 1, 2, "x86_64")), "Adds one always-on web task before autoscaling or savings plans."],
    ["Production worker task", "0.5 vCPU / 1 GB Fargate x86_64 for one month", money(monthlyFargate(pricing, 0.5, 1, "x86_64")), "Adds one always-on Sidekiq worker."],
    ["ARM64 production web task", "1 vCPU / 2 GB Fargate ARM64 for one month", money(monthlyFargate(pricing, 1, 2, "arm64")), "Active default for new SST production candidates after the 2026-06-02 greenfield decision."],
    ["RDS production class", "1 `db.t4g.small` PostgreSQL Single-AZ instance-month", money(monthlyHourly(pricing.rdsT4gSmall)), "Storage, backups, and I/O are additional."],
    ["RDS dev class", "1 `db.t4g.micro` PostgreSQL Single-AZ instance-month", money(monthlyHourly(pricing.rdsT4gMicro)), "Storage, backups, and I/O are additional."],
    ["Valkey cache node", "1 `cache.t4g.micro` Valkey node-month", money(monthlyHourly(pricing.valkeyT4gMicro)), "One node; no cluster."],
    ["Application Load Balancer", "1 ALB-hour for one month", money(monthlyHourly(pricing.albHour)), "LCUs and data processing are additional."],
  ];

  return `# SPEND.md

Generated: ${new Date().toISOString()}
Command: \`AWS_PROFILE=${profile} AWS_REGION=${region} node scripts/ops/generate-spend-report.mjs --output SPEND.md\`
Scope: Gala SST-tracked AWS infrastructure in \`${source.sstConfigPath}\`, validated with read-only AWS CLI.

## EXECUTIVE SUMMARY

The AWS platform remains small enough for migration evaluation. Cost Explorer reports ${money(ceTotal)} from ${costs.start} through ${costs.end} across the current AWS account. That total is account-wide: it includes production, dev, shared buckets, legacy distributions, release artifacts, and account-level services. Treat it as a directional floor until cost allocation tags split production, dev, shared, and legacy resources.

Production is an always-on Fargate/RDS/Valkey/ALB stack. Dev uses Fargate Spot for ECS services but still carries RDS, Valkey, CloudFront, S3, logs, and artifacts. The first costs that will grow are web/worker task-hours, RDS load/storage, CloudFront/S3 transfer, log volume, ECR/static asset retention, and preview environment lifetime.

Highest leverage now:

1. Fix production cache behavior and measure CloudFront hit ratio before scaling web.
2. Add ECR, static asset, S3, and log retention controls.
3. Keep dev/preview on Spot and short TTLs.
4. Reconcile source/live drift before buying commitments.
5. Treat ARM64 as the active AWS production default after the greenfield adoption decision; x86_64 remains an explicit manual override only.

Decision Thresholds:

- Stay on Heroku if the invoice is below the AWS recurring floor plus the operator burden of GitHub Actions/SST/ECS ownership.
- Run hybrid while AWS production is being proven and .com DNS/data migration risk remains open.
- Migrate fully when rollback, cache behavior, migrations, observability, and production deploy dry-runs are routine and Heroku is materially higher than AWS plus operator time.

Missing evidence: actual Heroku invoice/plan, CloudFront cache hit ratio, S3 bucket byte inventory, per-environment cost allocation tags, and Phase 28 ARM64 UAT.

## REPRODUCIBLE REPORT GENERATION

Run:

\`\`\`sh
AWS_PROFILE=gala AWS_REGION=us-west-2 node scripts/ops/generate-spend-report.mjs --output SPEND.md
\`\`\`

The script is read-only. It asserts expected resource names in \`infra/sst.config.ts\`, calls AWS CLI inventory APIs, calls Cost Explorer, and calls AWS Price List APIs for add-one unit estimates. It does not read SSM parameter values or secret payloads.

## SCOPE

Included:

- SST resources tracked by \`infra/sst.config.ts\`.
- GitHub Actions operator workflows that create deploy, rollback, preview, cache, migration, one-off, and release-retention side effects.
- Live AWS observations from ECS, RDS, ElastiCache/Valkey, ALB, CloudFront, S3, ECR, CloudWatch Logs, Cost Explorer, and AWS Price List.

Excluded:

- Heroku invoice totals, because they were not available in the repository or AWS account.
- Non-Gala AWS workloads unless they appear in account-wide service totals.
- Secret values, database URLs, Redis URLs, passwords, tokens, and deploy credentials.

## STAGE CHARACTERISTICS

${table(["Stage", "Service", "Live shape", "Price for one additional matching task/month", "Current desired task monthly list price"], stageCostRows(stages, pricing))}

Notes:

- Dev ECS is expected to use Fargate Spot; the task estimates above use on-demand AWS Price List rates because Spot pricing varies.
- Current task monthly list price excludes ALB, RDS, Valkey, S3, CloudFront, ECR, logs, public IPv4, requests, transfer, and operator costs.
- Production and dev are both currently X86_64; ARM64 pricing is shown only as a conditional add-one estimate.

## MODELED STAGE COST BY INFRA

This table models the tracked stage floor with public on-demand rates where a single unit price is available. It is not a replacement for Cost Explorer tags: S3, CloudFront, ECR, CloudWatch, VPC/public IPv4, request volume, data transfer, backups, storage, GitHub Actions, and operator labor remain account-wide or usage-metered.

${table(["Stage", "Infra", "Live/source characteristic", "Modeled monthly price", "Boundary"], modeledStageInfraRows(stages, rds, caches, pricing))}

## INVENTORY

| Area | Tracked source | Live observation | Spend driver |
| --- | --- | --- | --- |
| ECS web | \`GalaWeb\`, production 1 vCPU/2 GB min 2 max 3; dev 0.5 vCPU/1 GB min 1 max 1 | ${describeStageLine(production, "GalaWeb")} ${describeStageLine(dev, "GalaWeb")} | Fargate vCPU-hours, GB-hours, public IPv4/networking, logs. |
| ECS worker | \`GalaWorker\`, production 0.5 vCPU/1 GB min 1 max 2; dev 0.25 vCPU/1 GB | ${describeStageLine(production, "GalaWorker")} ${describeStageLine(dev, "GalaWorker")} | Fargate vCPU-hours, GB-hours, queue volume, logs. |
| ECS tasks | \`GalaMigrate\`, \`GalaSeedDatabase\`, \`GalaRefreshIndices\`, \`GalaWeeklyReport\` | SST task log groups observed for dev and production. | Short Fargate runtime, logs, operator workflow frequency. |
| Database | \`GalaDatabase\`, PostgreSQL 16, production \`db.t4g.small\`, dev \`db.t4g.micro\`, source production storage ${source.productionDbSourceStorage} | Production ${dbLine(prodDb)}. Dev ${dbLine(devDb)}. | Instance-hours, storage, backups, I/O, CPU credits if bursty. |
| Cache | \`GalaCache\`, Valkey 7.2, \`cache.t4g.micro\`, cluster false | ${cacheLine(caches)} | Node-hours, memory pressure, cache churn. |
| ALB | \`GalaWeb\` load balancer | Web services create one app load balancer per stage; account has active Gala ALBs. | ALB-hours, LCUs, data processed. |
| App edge | \`GalaAppDistribution\` / dev app distribution, \`PriceClass_100\` | Production and dev app/static distributions are deployed. | Requests, transfer, invalidations, origin miss rate. |
| Router | \`GalaAppRouter\` routes \`learngala.dev\`, \`dev.learngala.dev\`, and \`*.dev.learngala.dev\` | ${router ? `Router ${router.id} is ${router.priceClass} with aliases ${(router.aliases || []).join(", ")}.` : "Router distribution not found."} | Requests, transfer, extra global edge scope if drift persists. |
| Static assets | \`GalaStaticAssets\`, \`GalaStaticAssetsDistribution\`, immutable release prefixes | Buckets observed: ${buckets.join(", ") || "none"}. | S3 storage, requests, CloudFront transfer, retained release prefixes. |
| Media | Retained \`msc-gala\` bucket reference | Media bucket byte inventory not collected by this script. | S3 storage, requests, transfer, lifecycle, backup/retention. |
| Images | ECR \`gala\`, \`gala-production-base\` | Repositories: ${ecr.repos.map((repo) => repo.name).join(", ") || "none"}; \`gala\` image detail count ${ecr.imageCount}. | ECR storage, image retention, deploy frequency. |
| Logs | SST ECS log groups | ${logs.length} Gala log groups observed; largest stored log group ${largestLogLine(logs)}. | Ingestion, retention storage, query scans. |
| Workflows | Manual \`workflow_dispatch\` deploy, preview, rollback, maintenance, promote-production | Release retention input \`${source.releaseRetentionEnv}\` is part of deploy/preview/rollback operations. | GitHub Actions minutes/storage, AWS calls, release asset retention, operator time. |

## CURRENT ACCOUNT-WIDE OPEX

Cost Explorer service totals from ${costs.start} through ${costs.end}:

${table(["Service", "Observed spend", "Treatment"], ceRows(costs))}

## ADDITIONAL INFRA PRICE CARD

Region: ${region}. Pricing API region: ${pricingRegion}. Estimates use ${hoursPerMonth} hours/month and on-demand public rates unless noted.

${table(["Add-one item", "Unit", "Estimated monthly price", "Boundary"], addOneRows)}

Raw rates used:

${table(["Rate", "AWS Price List result"], [
    ["Fargate x86 vCPU", rate(pricing.fargateVCpu)],
    ["Fargate x86 GB", rate(pricing.fargateGb)],
    ["Fargate ARM vCPU", rate(pricing.fargateArmVCpu)],
    ["Fargate ARM GB", rate(pricing.fargateArmGb)],
    ["RDS db.t4g.small PostgreSQL", rate(pricing.rdsT4gSmall)],
    ["RDS db.t4g.micro PostgreSQL", rate(pricing.rdsT4gMicro)],
    ["Valkey cache.t4g.micro", rate(pricing.valkeyT4gMicro)],
    ["ALB hour", rate(pricing.albHour)],
  ])}

Services not reduced to a single add-one price: CloudFront, S3, ECR, CloudWatch, public IPv4, Route 53, and GitHub Actions are usage-metered by requests, transfer, GB-month, query scans, IP-hours, hosted zones, artifacts, or runner minutes. Their current account-wide totals are in Cost Explorer above; use AWS Calculator or Price List API dimensions once traffic/object assumptions are known.

## CAPEX

Capex here means one-time migration and platform work, not purchased hardware.

| Work item | Why it exists | Evidence needed before .com cutover |
| --- | --- | --- |
| Database migration | Heroku-to-RDS migration, restore rehearsal, migration ordering, rollback boundary. | Restore duration, data integrity checks, migration dry-run logs, snapshot/backup plan. |
| Media migration | ActiveStorage/media bucket ownership and lifecycle must be settled. | S3 inventory for \`msc-gala\`, object class mix, missing-object smoke tests. |
| DNS and Cloudflare cutover | \`learngala.dev\` is active; .com legacy domains still exist in CloudFront. | DNS TTL plan, Cloudflare zone readiness, .com route ownership decision. |
| Deploy/rollback drills | Operator workflows replace Heroku deploy primitives. | Successful dry-run, mutation run, rollback run, and maintenance run summaries. |
| Observability | ECS/RDS/cache/CloudFront ownership requires logs, metrics, alarms, and runbooks. | Alarm list, dashboard links, log retention policy, on-call checklist. |
| Cache correctness | Production cache miss behavior can force excess origin load. | CloudFront hit ratio, Rails cache keys, anonymous vs authenticated path policy tests. |
| Spend model | Cost tags and budget alarms are required for decision hygiene. | Cost allocation tags, AWS Budgets, monthly Cost Explorer review. |

## GROWTH MODEL

${table(["Scenario", "Traffic/cache assumptions", "Infra behavior", "Cost watchpoints"], [
    ["Low", "Catalog JSON and anonymous paths remain modest; cache hit ratio high; preview count 0-1.", "Production stays 2 web + 1 worker; RDS and Valkey remain current classes; dev uses Spot.", "Fixed floor dominates; cut via retention, preview TTL, and legacy cleanup."],
    ["Expected", "/cases.json and public catalog reads rise; authenticated/editor traffic grows slowly; 1-2 previews during active work.", "Web may scale to 3; worker queue grows with refresh/report tasks; RDS CPU/storage and logs become leading signals.", "CloudFront miss rate, RDS load, autoscaling, logs, ECR images."],
    ["High", "Cacheable catalog traffic grows materially; cache hit ratio uneven; authenticated traffic significant; previews linger.", "Web max may need >3; worker max >2; RDS/cache classes may grow; S3/media transfer grows.", "Origin misses, DB saturation, Valkey evictions, CloudFront transfer, S3 media, preview lifetime."],
  ])}

## CUT COST

${table(["Priority", "Recommendation", "Impact", "Risk", "Validate"], [
    ["Now", "Fix production cache behavior and measure CloudFront hit ratio before adding web tasks.", "Avoids paying Fargate/RDS/ALB for repeat anonymous catalog traffic.", "Incorrect caching can expose private data or serve stale content.", "Header tests for anonymous/authenticated paths; CloudFront hit/miss metrics."],
    ["Now", "Add ECR lifecycle policy for untagged images and retain rollback tags.", "Stops image storage from growing with deploy frequency.", "Over-cleanup can remove rollback image.", "Keep release-retention window and prove rollback references survive."],
    ["Now", "Add static asset release-prefix lifecycle or retention budget.", "Prevents S3/static assets from growing without bound.", "Removing active prefix breaks old releases.", "Confirm active prefixes and rollback window."],
    ["Now", "Reconcile CloudFront router price-class drift.", "Can reduce global edge scope if intended.", "Router mutation affects public routing.", "SST diff, CloudFront config check, dry-run, low-traffic deployment."],
    ["Next", "Rightsize production web/worker after utilization data.", "Can reduce Fargate floor or prevent premature scale-up.", "Undersizing hurts latency and queue throughput.", "CPU/memory p95, latency, Sidekiq queue age."],
    ["Next", "Keep dev and preview on Fargate Spot with strict TTL controls.", "Saves non-prod compute.", "Spot interruption can disrupt validation.", "Preview summary, smoke tests, explicit rerun path."],
    ["Next", "Add cost allocation tags and AWS Budgets.", "Splits prod/dev/shared/legacy costs.", "Tag rollout may be incomplete at first.", "Monthly Cost Explorer review by tag."],
    ["Now", "ARM64 Fargate and images for SST-managed AWS production candidates.", "Can lower compute price.", "Native gem/image/runtime mismatch can break production.", "Use full SST task-definition deploy for the first transition, then validate ECS task architecture and live smoke checks."],
    ["Later", "Savings Plans or RDS reservations after steady utilization.", "Reduces fixed cost.", "Premature commitments reduce flexibility.", "Three months of stable utilization."],
    ["Later", "Review old learngala.com CloudFront distributions.", "Removes legacy minimums and confusion if unused.", "They may serve live properties.", "Owner confirmation, DNS lookup, access logs, staged disable."],
  ])}

## HEROKU DECISION

Stay on Heroku when:

- Heroku invoice is below the AWS recurring floor plus expected operator time.
- AWS rollback, migration, cache, and observability workflows are not routine.
- .com DNS/data migration risk is unresolved.

Run hybrid when:

- AWS serves \`learngala.dev\` reliably but Heroku remains the lower-risk .com production system.
- AWS is used for preview/dev/prod-candidate validation, cache behavior testing, and migration rehearsals.
- CODEOWNER review still needs Heroku invoice data and final cutover runbook.

Migrate fully when:

- GitHub Actions deploy, promote-production, rollback, and maintenance workflows have dry-run-first and mutation evidence.
- Production cache behavior is correct enough that anonymous traffic is mostly edge-served where safe.
- RDS restore/migration, media validation, CloudFront invalidation, Rails.cache clear, and rollback boundaries are understood.
- Heroku invoice and platform limitations justify AWS operator burden.

## EVIDENCE

- Source assertions: ${source.trackedResourceNames.join(", ")} are present in \`infra/sst.config.ts\`.
- AWS account identity: \`${awsText(["sts", "get-caller-identity", "--query", "Account"])}\`.
- ECS clusters: production \`${production.clusterArn || "missing"}\`; dev \`${dev.clusterArn || "missing"}\`.
- RDS rows observed: ${rds.length}.
- Valkey rows observed: ${caches.length}.
- CloudFront distributions observed:

${table(["ID", "Comment", "Aliases", "Price class", "Status"], cloudfrontRows(distributions))}

- ECR repositories: ${ecr.repos.map((repo) => repo.name).join(", ") || "none"}.
- S3 buckets with gala in name: ${buckets.join(", ") || "none"}.
- Log groups with gala in name: ${logs.length}.
- Cost Explorer total: ${money(ceTotal)}.

## UNKNOWN UNKNOWNS

| Unknown | Why it matters | How to resolve |
| --- | --- | --- |
| Heroku invoice and plan | Needed for stay/hybrid/migrate economics. | Export latest Heroku invoice, dyno/add-on plan, database/cache tiers, and bandwidth if available. |
| Per-stage AWS cost split | Current Cost Explorer evidence is account-wide. | Add/verify cost allocation tags for stage and resource role. |
| S3 bucket byte/object inventory | Media, static, and deploy buckets can dominate later. | Use S3 Storage Lens or bucket inventory; avoid recursive cleanup scans. |
| Production CloudFront cache hit ratio | User-observed cache misses can drive compute/RDS spend. | Add CloudFront metrics review and header smoke tests. |
| Router price-class drift | Source intends \`PriceClass_100\`; live router may differ. | Run SST diff and inspect router distribution config before mutation. |
| Production DB storage drift | Source says ${source.productionDbSourceStorage}; live production allocated storage is ${prodDb?.allocated || "unknown"} GB. | Reconcile SST state/config/import behavior and confirm desired storage. |
| ARM64 adoption validation | ARM64 savings are now the active AWS default. | Complete preview and production-candidate validation with ARM64 task-definition evidence. |
| Legacy .com distribution ownership | They may be live non-SST assets. | Confirm DNS, owners, logs, and migration plan before removal. |
`;
}

function describeStageLine(stage, serviceName) {
  if (stage.error) return `${stage.stage}: ${stage.error}.`;
  const service = stageService(stage, serviceName);
  const shape = taskShape(stage, serviceName);
  return `${stage.stage}: ${service.desired || 0}/${service.running || 0}, ${shape.architecture}, rev ${shape.revision}.`;
}

function dbLine(db) {
  if (!db) return "not observed";
  return `${db.class}, ${db.engine} ${db.engineVersion}, ${db.allocated} GB ${db.storageType}, backup retention ${db.backupRetention} days`;
}

function cacheLine(caches) {
  if (!caches.length) return "not observed";
  return caches
    .map((cache) => `${cache.id}: ${cache.nodeType}, ${cache.engine} ${cache.version}, ${cache.numNodes} node`)
    .join("; ");
}

function largestLogLine(logs) {
  if (!logs.length) return "none";
  const largest = [...logs].sort((a, b) => Number(b.bytes || 0) - Number(a.bytes || 0))[0];
  return `${largest.name} (${Number(largest.bytes || 0)} bytes, retention ${largest.retention || "unset"} days)`;
}

const report = render();
fs.writeFileSync(outputPath, `${report.trim()}\n`);
console.log(`wrote ${path.relative(repoRoot, outputPath)}`);
