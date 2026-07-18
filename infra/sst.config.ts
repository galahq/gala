/// <reference path="./.sst/platform/config.d.ts" />

type Stage = "dev" | "production" | `pr-${number}` | `local-${string}`;
type Platform = typeof import("./sst.platform.json");

function target(stage: string) {
  const preview = /^pr-([1-9][0-9]*)$/.exec(stage);
  const local = /^local-([a-z0-9][a-z0-9-]{0,31})$/.exec(stage);
  if (stage === "dev" || stage === "production") {
    return { stage: stage as "dev" | "production", durable: true, preview: false, local: false };
  }
  if (preview) {
    return { stage: `pr-${preview[1]}` as Stage, durable: false, preview: true, local: false };
  }
  if (local) {
    return { stage: `local-${local[1]}` as Stage, durable: false, preview: false, local: true };
  }
  throw new Error(`Unsupported SST stage: ${stage || "<empty>"}`);
}

function parameterArn(platform: Platform, name: string) {
  return `arn:aws:ssm:${platform.aws.region}:${platform.aws.accountId}:parameter/gala/dev/${name}`;
}

export default $config({
  async app(input) {
    const platform = (await import("./sst.platform.json")).default;
    const current = target(input?.stage || "");
    return {
      name: "gala",
      home: "aws",
      providers: { aws: { region: platform.aws.region }, cloudflare: "6.13.0" },
      protect: current.durable,
      removal: current.durable ? "retain-all" : "remove",
    };
  },

  async run() {
    const platform = (await import("./sst.platform.json")).default;
    const current = target($app.stage);
    const stage = current.stage;
    const durableStage = stage === "production" ? "production" : "dev";
    const capacity = platform.capacity[durableStage];
    const host = stage === "production"
      ? platform.domains.root
      : current.preview
        ? `${stage}.${platform.domains.dev}`
        : platform.domains.dev;
    const baseUrl = current.local ? "http://localhost:3000" : `https://${host}`;
    const image = {
      context: "..",
      dockerfile: "Dockerfile.production",
      args: { rails_env: "production" },
    };
    const media = aws.s3.BucketV2.get("GalaMediaBucket", platform.storage.mediaBucket);

    let cluster: any;
    let router: any;
    let staticAssets: any;
    let database: any;
    let cache: any;
    let databaseUrl: any;
    let redisUrl: any;
    let ssm: Record<string, any>;

    if (current.durable) {
      const vpc = new sst.aws.Vpc("GalaVpc", {
        az: 2,
        bastion: true,
        transform: { bastionInstance: (args: any) => { args.ami = platform.bastionAmi[durableStage]; } },
      });
      cluster = new sst.aws.Cluster("GalaCluster", { vpc });
      database = new sst.aws.Postgres("GalaDatabase", {
        version: "16",
        vpc: { subnets: vpc.publicSubnets },
        database: "gala",
        instance: capacity.database as any,
        storage: capacity.storage as any,
        multiAz: false,
        proxy: false,
      });
      cache = new sst.aws.Redis("GalaCache", {
        vpc: { subnets: vpc.publicSubnets, securityGroups: vpc.securityGroups },
        engine: "valkey",
        version: "7.2",
        instance: "t4g.micro",
        cluster: false,
      });
      const encode = (value: any) => $resolve([value]).apply(([resolved]) => encodeURIComponent(`${resolved ?? ""}`));
      databaseUrl = $interpolate`postgresql://${encode(database.username)}:${encode(database.password)}@${database.host}:${database.port}/${database.database}?sslmode=require`;
      redisUrl = $interpolate`rediss://${encode(cache.username)}:${encode(cache.password)}@${cache.host}:${cache.port}`;

      const bucket = new sst.aws.Bucket("GalaStaticAssets", {
        policy: [{ principals: "*", actions: ["s3:GetObject"], paths: ["releases/*", "manifests/*", "assets/*"] }],
        transform: {
          bucket: (args: any, opts: any) => {
            args.bucket = platform.storage.staticAssetsBucket;
            args.forceDestroy = undefined;
            if (durableStage === "dev") opts.import = platform.storage.staticAssetsBucket;
          },
          publicAccessBlock: (args: any) => {
            args.blockPublicPolicy = false;
            args.restrictPublicBuckets = false;
          },
        },
      });
      staticAssets = new aws.cloudfront.Distribution("GalaStaticAssetsDistribution", {
        enabled: true,
        comment: `gala-${stage} static assets`,
        origins: [{
          domainName: bucket.domain,
          originId: "gala-static-assets",
          customOriginConfig: { httpPort: 80, httpsPort: 443, originProtocolPolicy: "https-only", originSslProtocols: ["TLSv1.2"] },
        }],
        defaultCacheBehavior: {
          targetOriginId: "gala-static-assets",
          viewerProtocolPolicy: "redirect-to-https",
          allowedMethods: ["GET", "HEAD", "OPTIONS"],
          cachedMethods: ["GET", "HEAD", "OPTIONS"],
          compress: true,
          minTtl: 60,
          defaultTtl: 31536000,
          maxTtl: 31536000,
          forwardedValues: { queryString: false, cookies: { forward: "none" } },
        },
        restrictions: { geoRestriction: { restrictionType: "none" } },
        viewerCertificate: { cloudfrontDefaultCertificate: true },
        priceClass: "PriceClass_100",
        retainOnDelete: durableStage === "production",
      });
      router = durableStage === "production"
        ? new sst.aws.Router("GalaAppRouter", {
            domain: {
              name: platform.domains.root,
              aliases: [platform.domains.dev, `*.${platform.domains.dev}`],
              dns: sst.cloudflare.dns({ zone: platform.domains.cloudflareZoneId, proxy: false }),
            },
            transform: { cdn: (args: any) => { args.priceClass = "PriceClass_100"; args.retainOnDelete = true; } },
          })
        : sst.aws.Router.get("GalaAppRouter", platform.domains.sharedRouterDistributionId);

      const secretNames = [
        "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_MIGRATION_CLIENT_ID", "GOOGLE_MIGRATION_CLIENT_SECRET",
        "RAILS_MASTER_KEY", "SECRET_KEY_BASE", "LTI_KEY", "LTI_SECRET", "MAPBOX_ACCESS_TOKEN",
        "SES_SMTP_PASSWORD", "SES_SMTP_USERNAME", "POSTHOG_API_KEY", "POSTHOG_PROJECT_ID",
      ] as const;
      const secrets = Object.fromEntries(secretNames.map((name) => [name, new sst.Secret(name)])) as Record<string, any>;
      const values: Record<string, any> = {
        DATABASE_URL: databaseUrl,
        REDIS_URL: redisUrl,
        ...secrets,
        MapboxAccessToken: secrets.MAPBOX_ACCESS_TOKEN,
      };
      ssm = Object.fromEntries(Object.entries(values).map(([name, value]) => {
        const parameter = new aws.ssm.Parameter(`${name}Parameter`, {
          name: `/gala/${stage}/${name}`,
          type: "SecureString",
          description: `gala ${stage} ${name}`,
          value: $resolve([value]).apply(([resolved]) => `${resolved ?? ""}`.trim()),
          overwrite: true,
        });
        return [name, parameter.arn];
      }));
    } else {
      cluster = sst.aws.Cluster.get("GalaDevCluster", {
        id: platform.devReference.clusterId,
        vpc: {
          id: platform.devReference.vpcId,
          securityGroups: platform.devReference.securityGroupIds,
          containerSubnets: platform.devReference.containerSubnetIds,
          loadBalancerSubnets: platform.devReference.loadBalancerSubnetIds,
          cloudmapNamespaceId: platform.devReference.cloudMapNamespaceId,
          cloudmapNamespaceName: platform.devReference.cloudMapNamespaceName,
        },
      });
      router = sst.aws.Router.get("GalaDevRouter", platform.domains.sharedRouterDistributionId);
      staticAssets = aws.cloudfront.Distribution.get("GalaDevStaticAssets", platform.storage.staticAssetsDistributionId);
      ssm = Object.fromEntries([
        "DATABASE_URL", "REDIS_URL", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET",
        "GOOGLE_MIGRATION_CLIENT_ID", "GOOGLE_MIGRATION_CLIENT_SECRET", "RAILS_MASTER_KEY",
        "SECRET_KEY_BASE", "LTI_KEY", "LTI_SECRET", "MAPBOX_ACCESS_TOKEN", "MapboxAccessToken",
        "SES_SMTP_PASSWORD", "SES_SMTP_USERNAME", "POSTHOG_API_KEY", "POSTHOG_PROJECT_ID",
      ].map((name) => [name, parameterArn(platform, name)]));
    }

    const environment = {
      AWS_REGION: platform.aws.region,
      BASE_URL: baseUrl,
      ASSET_HOST: $interpolate`https://${staticAssets.domainName}/releases/bootstrap`,
      FORCE_SSL: current.local ? "false" : "true",
      NODE_ENV: "production",
      PORT: "3000",
      RAILS_ENV: "production",
      RAILS_LOG_TO_STDOUT: "true",
      RAILS_MAX_THREADS: durableStage === "production" ? "5" : "3",
      RAILS_SERVE_STATIC_FILES: "true",
      S3_BUCKET: platform.storage.mediaBucket,
      GALA_STATIC_ASSETS_BUCKET: platform.storage.staticAssetsBucket,
      GALA_RELEASE: "bootstrap",
      SIDEKIQ_CONCURRENCY: durableStage === "production" ? "5" : "3",
      SST_STAGE: stage,
      WEB_CONCURRENCY: durableStage === "production" ? "2" : "1",
    };
    const permissions = [{ actions: ["s3:ListBucket"], resources: [`arn:aws:s3:::${platform.storage.mediaBucket}`, `arn:aws:s3:::${platform.storage.staticAssetsBucket}`] }, {
      actions: ["s3:GetObject", "s3:PutObject"],
      resources: [`arn:aws:s3:::${platform.storage.mediaBucket}/*`, `arn:aws:s3:::${platform.storage.staticAssetsBucket}/*`],
    }];
    const defaults = {
      cluster,
      image,
      architecture: platform.aws.architecture as "arm64",
      environment,
      permissions,
      ssm,
      capacity: durableStage === "production" ? { fargate: { weight: 1 } } : "spot" as const,
    };
    const web = new sst.aws.Service("GalaWeb", {
      ...defaults,
      dev: current.local ? { command: "bin/rails server -b 0.0.0.0 -p 3000" } : false,
      command: ["bundle", "exec", "puma", "-C", "config/puma.rb"],
      cpu: capacity.web.cpu as any,
      memory: capacity.web.memory as any,
      scaling: { min: capacity.web.min, max: capacity.web.max, cpuUtilization: 70, memoryUtilization: 80 },
      loadBalancer: { ports: [{ listen: "80/http", forward: "3000/http" }], health: { "3000/http": { path: "/up", successCodes: "200-399" } } },
      transform: current.durable ? undefined : { service: (args: any) => { args.name = `gala-${stage}-web`; } },
    });
    const worker = new sst.aws.Service("GalaWorker", {
      ...defaults,
      dev: current.local ? { command: "bundle exec sidekiq -C config/sidekiq.yml" } : false,
      command: ["bundle", "exec", "sidekiq", "-C", "config/sidekiq.yml"],
      cpu: capacity.worker.cpu as any,
      memory: capacity.worker.memory as any,
      scaling: { min: capacity.worker.min, max: capacity.worker.max, cpuUtilization: 70, memoryUtilization: 80 },
      transform: current.durable ? undefined : { service: (args: any) => { args.name = `gala-${stage}-worker`; } },
    });

    if (!current.local) {
      const task = (name: string, command: string[]) => new sst.aws.Task(name, { ...defaults, command, cpu: "0.25 vCPU", memory: "1 GB" });
      const migration = task("GalaMigrate", ["bundle", "exec", "rails", "db:migrate"]);
      task("GalaSeedDatabase", ["bundle", "exec", "rails", "db:seed"]);
      const refresh = task("GalaRefreshIndices", ["bundle", "exec", "rake", "indices:refresh"]);
      const weekly = task("GalaWeeklyReport", ["bundle", "exec", "rake", "emails:send_weekly_report"]);
      if (stage === "production") {
        new sst.aws.Cron("GalaRefreshIndicesSchedule", { task: refresh, schedule: "rate(15 minutes)" });
        new sst.aws.Cron("GalaWeeklyReportSchedule", { task: weekly, schedule: "cron(0 15 ? * MON *)" });
      }
      if (!current.local) router.route(`${host}/`, web.url);
      return { stage, url: current.local ? undefined : baseUrl, appUrl: web.url, clusterId: cluster.id, databaseId: database?.id, cacheId: cache?.clusterId, migrationTaskDefinitionArn: migration.taskDefinition };
    }

    return { stage, appUrl: web.url, clusterId: cluster.id };
  },
});
