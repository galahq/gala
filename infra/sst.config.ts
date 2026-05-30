/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "gala",
      home: "aws",
      removal: input?.stage === "production" ? "retain" : "remove",
      providers: {
        aws: {
          region: "us-west-2",
        },
      },
    };
  },
  async run() {
    const stage = $app.stage;
    const isProduction = stage === "production";
    const explicitBaseUrl = process.env.ALB_BASE_URL ?? "";
    const baseUrl = explicitBaseUrl.length > 0
      ? explicitBaseUrl
      : isProduction
        ? "https://pending-alb-url.invalid"
        : "https://staging.learngala.com";
    const mediaBucketName = "msc-gala";
    const staticAssetsBucketName = process.env.GALA_STATIC_ASSETS_BUCKET ??
      "gala-static-assets-353760060567";
    const importExistingStaticAssetsBucket =
      process.env.GALA_IMPORT_STATIC_ASSETS_BUCKET === "true";
    const immutableStaticCacheControl =
      "public,max-age=31536000,immutable";
    const webImage = process.env.GALA_WEB_IMAGE_URI?.trim().length
      ? process.env.GALA_WEB_IMAGE_URI
      : {
          context: "..",
          dockerfile: "Dockerfile",
          args: {
            rails_env: "production",
            secret_key_base: "build-placeholder",
          },
        };

    // Reference the retained ActiveStorage bucket instead of recreating it.
    aws.s3.BucketV2.get("GalaMediaBucket", mediaBucketName);

    const staticAssetsBucket = new sst.aws.Bucket("GalaStaticAssets", {
      access: "public",
      transform: {
        bucket: (args, opts) => {
          args.bucket = staticAssetsBucketName;
          args.forceDestroy = undefined;

          if (importExistingStaticAssetsBucket) {
            opts.import = staticAssetsBucketName;
          }
        },
      },
    });

    const staticAssetResponseHeaders = new aws.cloudfront.ResponseHeadersPolicy(
      "GalaStaticAssetResponseHeaders",
      {
        name: `${$app.name}-${stage}-static-asset-cache`,
        comment: "Immutable browser cache headers for fingerprinted assets",
        customHeadersConfig: {
          items: [
            {
              header: "Cache-Control",
              override: true,
              value: immutableStaticCacheControl,
            },
          ],
        },
      },
    );

    const staticAssetsDistribution = new aws.cloudfront.Distribution(
      "GalaStaticAssetsDistribution",
      {
        enabled: true,
        comment: `${$app.name}-${stage} static assets`,
        defaultRootObject: "",
        origins: [
          {
            domainName: staticAssetsBucket.domain,
            originId: "gala-static-assets-origin",
            customOriginConfig: {
              httpPort: 80,
              httpsPort: 443,
              originProtocolPolicy: "https-only",
              originSslProtocols: ["TLSv1.2"],
            },
          },
        ],
        defaultCacheBehavior: {
          targetOriginId: "gala-static-assets-origin",
          viewerProtocolPolicy: "redirect-to-https",
          allowedMethods: ["GET", "HEAD", "OPTIONS"],
          cachedMethods: ["GET", "HEAD", "OPTIONS"],
          compress: true,
          minTtl: 60,
          defaultTtl: 31536000,
          maxTtl: 31536000,
          responseHeadersPolicyId: staticAssetResponseHeaders.id,
          forwardedValues: {
            queryString: false,
            cookies: {
              forward: "none",
            },
          },
        },
        restrictions: {
          geoRestriction: {
            restrictionType: "none",
          },
        },
        viewerCertificate: {
          cloudfrontDefaultCertificate: true,
        },
        priceClass: "PriceClass_100",
        retainOnDelete: isProduction,
      },
    );

    const retainedSecrets = {
      RAILS_MASTER_KEY: new sst.Secret("RAILS_MASTER_KEY"),
      SECRET_KEY_BASE: new sst.Secret("SECRET_KEY_BASE"),
      LTI_KEY: new sst.Secret("LTI_KEY"),
      LTI_SECRET: new sst.Secret("LTI_SECRET"),
      MAPBOX_ACCESS_TOKEN: new sst.Secret("MAPBOX_ACCESS_TOKEN"),
      SES_SMTP_PASSWORD: new sst.Secret("SES_SMTP_PASSWORD"),
      SES_SMTP_USERNAME: new sst.Secret("SES_SMTP_USERNAME"),
    };

    const resolveSecret = (key: keyof typeof retainedSecrets) =>
      retainedSecrets[key].value;

    const vpc = new sst.aws.Vpc("GalaVpc", {
      az: 2,
    });

    // Keep ECS tasks in public subnets and RDS/cache private to avoid NAT costs.
    const cluster = new sst.aws.Cluster("GalaCluster", {
      vpc,
    });

    const database = new sst.aws.Postgres("GalaDatabase", {
      version: "16",
      vpc: {
        subnets: vpc.publicSubnets,
      },
      database: "gala",
      instance: isProduction ? "t4g.small" : "t4g.micro",
      storage: isProduction ? "50 GB" : "20 GB",
      multiAz: false,
      proxy: false,
    });

    // Phase 1 keeps a Redis-compatible cache so the current app can move without a rewrite.
    const cache = new sst.aws.Redis("GalaCache", {
      vpc: {
        subnets: vpc.publicSubnets,
        securityGroups: vpc.securityGroups,
      },
      engine: "valkey",
      version: "7.2",
      instance: "t4g.micro",
      cluster: false,
    });

    const databaseUrl = $interpolate`postgresql://${database.username}:${database.password}@${database.host}:${database.port}/${database.database}?sslmode=require`;
    const redisUrl = $interpolate`rediss://${cache.username}:${cache.password}@${cache.host}:${cache.port}`;

    const sharedEnvironment = {
      AWS_REGION: "us-west-2",
      BASE_URL: baseUrl,
      ASSET_HOST: $interpolate`https://${staticAssetsDistribution.domainName}`,
      DATABASE_URL: databaseUrl,
      FORCE_SSL: baseUrl.startsWith("https://") ? "true" : "false",
      LTI_KEY: resolveSecret("LTI_KEY"),
      LTI_SECRET: resolveSecret("LTI_SECRET"),
      MAPBOX_ACCESS_TOKEN: resolveSecret("MAPBOX_ACCESS_TOKEN"),
      MapboxAccessToken: resolveSecret("MAPBOX_ACCESS_TOKEN"),
      NODE_ENV: "production",
      PORT: "3000",
      RAILS_ENV: "production",
      RAILS_LOG_TO_STDOUT: "true",
      RAILS_MAX_THREADS: isProduction ? "5" : "3",
      RAILS_MASTER_KEY: resolveSecret("RAILS_MASTER_KEY"),
      RAILS_SERVE_STATIC_FILES: "true",
      REDIS_URL: redisUrl,
      S3_BUCKET: mediaBucketName,
      GALA_STATIC_ASSETS_BUCKET: staticAssetsBucketName,
      SECRET_KEY_BASE: resolveSecret("SECRET_KEY_BASE"),
      SES_SMTP_PASSWORD: resolveSecret("SES_SMTP_PASSWORD"),
      SES_SMTP_USERNAME: resolveSecret("SES_SMTP_USERNAME"),
      SIDEKIQ_CONCURRENCY: isProduction ? "5" : "3",
      WEB_CONCURRENCY: isProduction ? "2" : "1",
      COMMIT_SHA: process.env.GITHUB_SHA ?? "",
    };

    const serviceCapacity = isProduction
      ? { fargate: { weight: 1 } }
      : "spot";

    const web = new sst.aws.Service("GalaWeb", {
      cluster,
      image: webImage,
      command: ["bundle", "exec", "puma", "-C", "config/puma.rb"],
      cpu: isProduction ? "1 vCPU" : "0.5 vCPU",
      memory: isProduction ? "2 GB" : "1 GB",
      architecture: "x86_64",
      capacity: serviceCapacity,
      environment: sharedEnvironment,
      scaling: {
        min: isProduction ? 2 : 1,
        max: isProduction ? 3 : 1,
        cpuUtilization: 70,
        memoryUtilization: 80,
      },
      loadBalancer: {
        ports: [
          { listen: "80/http", forward: "3000/http" },
          { listen: "443/http", forward: "3000/http" },
        ],
        health: {
          "3000/http": {
            path: "/up",
            interval: "30 seconds",
            timeout: "5 seconds",
            healthyThreshold: 5,
            unhealthyThreshold: 2,
          },
        },
      },
      health: {
        command: ["CMD-SHELL", "curl -f http://localhost:3000/up || exit 1"],
        startPeriod: "60 seconds",
        interval: "30 seconds",
        timeout: "5 seconds",
        retries: 3,
      },
    });

    const worker = new sst.aws.Service("GalaWorker", {
      cluster,
      image: webImage,
      command: ["bundle", "exec", "sidekiq", "-C", "config/sidekiq.yml"],
      cpu: isProduction ? "0.5 vCPU" : "0.25 vCPU",
      memory: "1 GB",
      architecture: "x86_64",
      capacity: serviceCapacity,
      environment: sharedEnvironment,
      scaling: {
        min: 1,
        max: isProduction ? 2 : 1,
        cpuUtilization: 70,
        memoryUtilization: 80,
      },
      health: {
        command: ["CMD-SHELL", "pgrep -f sidekiq >/dev/null"],
        startPeriod: "60 seconds",
        interval: "30 seconds",
        timeout: "5 seconds",
        retries: 3,
      },
    });

    const appOriginId = "gala-app-alb-origin";
    const appOriginDomain = $resolve([web.url]).apply(([url]) =>
      new URL(url).hostname,
    );
    const publicCatalogCachePaths = [
      "/cases.json",
      "/cases/features.json",
      "/catalog/languages.json",
      "/catalog/libraries.json",
      "/tags.json",
    ];
    const publicCatalogCacheBehavior = (pathPattern: string) => ({
      pathPattern,
      targetOriginId: appOriginId,
      viewerProtocolPolicy: "redirect-to-https",
      allowedMethods: ["GET", "HEAD", "OPTIONS"],
      cachedMethods: ["GET", "HEAD", "OPTIONS"],
      compress: true,
      minTtl: 0,
      defaultTtl: 300,
      maxTtl: 300,
      forwardedValues: {
        queryString: true,
        headers: ["Accept", "Accept-Language", "Authorization"],
        cookies: {
          forward: "all",
        },
      },
    });

    const appDistribution = new aws.cloudfront.Distribution("GalaAppDistribution", {
      enabled: true,
      comment: `${$app.name}-${stage} app edge cache`,
      origins: [
        {
          domainName: appOriginDomain,
          originId: appOriginId,
          customOriginConfig: {
            httpPort: 80,
            httpsPort: 443,
            originProtocolPolicy: "http-only",
            originSslProtocols: ["TLSv1.2"],
          },
        },
      ],
      defaultCacheBehavior: {
        targetOriginId: appOriginId,
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
        cachedMethods: ["GET", "HEAD"],
        compress: true,
        minTtl: 0,
        defaultTtl: 0,
        maxTtl: 0,
        forwardedValues: {
          queryString: true,
          headers: ["*"],
          cookies: {
            forward: "all",
          },
        },
      },
      orderedCacheBehaviors: publicCatalogCachePaths.map(publicCatalogCacheBehavior),
      restrictions: {
        geoRestriction: {
          restrictionType: "none",
        },
      },
      viewerCertificate: {
        cloudfrontDefaultCertificate: true,
      },
      priceClass: "PriceClass_100",
      retainOnDelete: isProduction,
    });

    const migration = new sst.aws.Task("GalaMigrate", {
      cluster,
      image: webImage,
      command: ["bundle", "exec", "rails", "db:migrate"],
      cpu: "0.25 vCPU",
      memory: "1 GB",
      architecture: "x86_64",
      environment: sharedEnvironment,
    });

    const seedDatabase = new sst.aws.Task("GalaSeedDatabase", {
      cluster,
      image: webImage,
      command: [
        "bash",
        "-lc",
        [
          "set -euo pipefail",
          "echo \"Checking seed dump\"",
          "test -f db/sqldump/seed.dump",
          "echo \"Checking DATABASE_URL guard\"",
          "case \"${DATABASE_URL}\" in *heroku*|*HEROKU*|\"\") echo \"Refusing seed restore: DATABASE_URL is missing or appears Heroku-derived\" >&2; exit 1 ;; esac",
          "echo \"Restoring db/sqldump/seed.dump into SST database\"",
          "pg_restore --clean --if-exists --no-owner --no-privileges -f - db/sqldump/seed.dump | sed '/^SET transaction_timeout = 0;$/d' | psql \"${DATABASE_URL}\"",
          "echo \"Running migrations after seed restore\"",
          "bundle exec rails db:migrate",
        ].join(" && "),
      ],
      cpu: "0.5 vCPU",
      memory: "1 GB",
      architecture: "x86_64",
      environment: sharedEnvironment,
    });

    const refreshIndices = new sst.aws.Task("GalaRefreshIndices", {
      cluster,
      image: webImage,
      command: ["bundle", "exec", "rake", "indices:refresh"],
      cpu: "0.25 vCPU",
      memory: "1 GB",
      architecture: "x86_64",
      environment: sharedEnvironment,
    });

    const weeklyReport = new sst.aws.Task("GalaWeeklyReport", {
      cluster,
      image: webImage,
      command: ["bundle", "exec", "rake", "emails:send_weekly_report"],
      cpu: "0.25 vCPU",
      memory: "1 GB",
      architecture: "x86_64",
      environment: sharedEnvironment,
    });

    if (isProduction) {
      new sst.aws.Cron("GalaRefreshIndicesSchedule", {
        task: refreshIndices,
        schedule: "rate(15 minutes)",
      });

      new sst.aws.Cron("GalaWeeklyReportSchedule", {
        task: weeklyReport,
        schedule: "cron(0 15 ? * MON *)",
      });
    }

    const mediaPolicy = aws.iam.getPolicyDocumentOutput({
      statements: [
        {
          actions: ["s3:ListBucket"],
          resources: [
            `arn:aws:s3:::${mediaBucketName}`,
            `arn:aws:s3:::${staticAssetsBucketName}`,
          ],
        },
        {
          actions: ["s3:GetObject", "s3:PutObject"],
          resources: [
            `arn:aws:s3:::${mediaBucketName}/*`,
            `arn:aws:s3:::${staticAssetsBucketName}/*`,
          ],
        },
      ],
    }).json;

    for (const [name, role] of [
      ["Web", web.nodes.taskRole.name],
      ["Worker", worker.nodes.taskRole.name],
      ["Migrate", migration.nodes.taskRole.name],
      ["SeedDatabase", seedDatabase.nodes.taskRole.name],
      ["RefreshIndices", refreshIndices.nodes.taskRole.name],
      ["WeeklyReport", weeklyReport.nodes.taskRole.name],
    ] as const) {
      new aws.iam.RolePolicy(`Gala${name}MediaAccess`, {
        role,
        policy: mediaPolicy,
      });
    }

    return {
      stage,
      region: "us-west-2",
      appDomain: baseUrl,
      appUrl: web.url,
      appCdnUrl: $interpolate`https://${appDistribution.domainName}`,
      albBaseUrl: baseUrl,
      staticAssetsCdnUrl: $interpolate`https://${staticAssetsDistribution.domainName}`,
      migrationClusterArn: migration.cluster,
      migrationTaskDefinitionArn: migration.taskDefinition,
      migrationSubnets: migration.subnets,
      migrationSecurityGroups: migration.securityGroups,
      migrationAssignPublicIp: migration.assignPublicIp,
      seedClusterArn: seedDatabase.cluster,
      seedTaskDefinitionArn: seedDatabase.taskDefinition,
      seedSubnets: seedDatabase.subnets,
      seedSecurityGroups: seedDatabase.securityGroups,
      seedAssignPublicIp: seedDatabase.assignPublicIp,
    };
  },
});
