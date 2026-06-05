/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    const customDomainEnabled =
      process.env.GALA_ENABLE_CUSTOM_DOMAIN !== "false";

    return {
      name: "gala",
      home: "aws",
      removal: input?.stage === "production" ? "retain" : "remove",
      providers: {
        aws: {
          region: "us-west-2",
        },
        ...(customDomainEnabled ? { cloudflare: "6.13.0" } : {}),
      },
    };
  },
  async run() {
    const stage = $app.stage;
    const isProduction = stage === "production";
    const releaseId = (
      process.env.GALA_RELEASE_ID ??
      process.env.GITHUB_RUN_ID ??
      `${stage}.local`
    )
      .trim()
      .replace(/[^A-Za-z0-9._-]/g, "-")
      .slice(0, 96);
    const requireEnv = (name: string) => {
      const value = process.env[name]?.trim();
      if (!value) {
        throw new Error(`${name} is required for the ${stage} SST stage`);
      }
      return value;
    };
    const trimSecretValue = (value: unknown) =>
      $resolve([value]).apply((resolvedValues) =>
        `${resolvedValues[0] ?? ""}`.trim()
      );
    const encodeUriComponent = (value: unknown) =>
      $resolve([value]).apply((resolvedValues) =>
        encodeURIComponent(`${resolvedValues[0] ?? ""}`)
      );
    const appCdnName = isProduction
      ? "GalaAppDistribution"
      : "GalaAppDistributionDev";
    const rootDomain = process.env.GALA_DOMAIN_NAME?.trim() || "learngala.dev";
    const devDomain = `dev.${rootDomain}`;
    const devWildcardDomain = `*.${devDomain}`;
    const sharedRouterDistributionId =
      process.env.GALA_ROUTER_DISTRIBUTION_ID?.trim() ||
      (isProduction ? "" : "E3FF4TTU9Q4XTY");
    const previewHost = process.env.GALA_PREVIEW_HOST?.trim() ||
      (isProduction ? rootDomain : devDomain);
    const customDomainEnabled =
      process.env.GALA_ENABLE_CUSTOM_DOMAIN !== "false";
    const cloudflareProxy = process.env.GALA_CLOUDFLARE_PROXY === "true";
    const cloudflareZoneId = process.env.CLOUDFLARE_ZONE_ID?.trim();
    const assetReleasePrefix = (
      process.env.GALA_ASSET_PREFIX || `releases/${stage}/${releaseId}`
    ).replace(/^\/+|\/+$/g, "");
    const explicitBaseUrl =
      process.env.GALA_BASE_URL ?? process.env.ALB_BASE_URL ?? "";
    const baseUrl = explicitBaseUrl.length > 0
      ? explicitBaseUrl
      : `https://${previewHost}`;
    const forceSsl = isProduction || baseUrl.trim().startsWith("https://");
    const mediaBucketName = "msc-gala";
    const staticAssetsBucketName = process.env.GALA_STATIC_ASSETS_BUCKET ??
      "gala-static-assets-353760060567";
    const importExistingStaticAssetsBucket =
      process.env.GALA_IMPORT_STATIC_ASSETS_BUCKET === "true" || !isProduction;
    const immutableStaticCacheControl =
      "public,max-age=31536000,immutable";
    const appImageUri =
      process.env.GALA_APP_IMAGE_URI?.trim() ||
      process.env.GALA_WEB_IMAGE_URI?.trim() ||
      "";
    const productionBaseImage =
      process.env.GALA_PRODUCTION_BASE_IMAGE?.trim() ||
      {
        x86_64:
          "353760060567.dkr.ecr.us-west-2.amazonaws.com/gala-production-base:ruby4.0.3-bookworm-pg17-runtime-v1",
        arm64:
          "353760060567.dkr.ecr.us-west-2.amazonaws.com/gala-production-base:ruby4.0.3-bookworm-pg17-runtime-v1-arm64",
      }[process.env.GALA_CONTAINER_ARCHITECTURE?.trim() || "arm64"] ||
      "";
    const rawContainerArchitecture =
      process.env.GALA_CONTAINER_ARCHITECTURE?.trim() || "arm64";
    if (
      rawContainerArchitecture !== "x86_64" &&
      rawContainerArchitecture !== "arm64"
    ) {
      throw new Error(
        "GALA_CONTAINER_ARCHITECTURE must be one of: x86_64, arm64",
      );
    }
    const containerArchitecture: "x86_64" | "arm64" = rawContainerArchitecture;

    if (!appImageUri && !productionBaseImage) {
      throw new Error(
        "GALA_PRODUCTION_BASE_IMAGE is required when SST builds Dockerfile.production for this architecture",
      );
    }

    const railsContainerImage = appImageUri.length
      ? appImageUri
      : {
          context: "..",
          dockerfile: process.env.GALA_PRODUCTION_DOCKERFILE?.trim() ||
            "Dockerfile.production",
          args: {
            GALA_PRODUCTION_BASE_IMAGE: productionBaseImage,
            rails_env: "production",
          },
        };

    // Reference the retained ActiveStorage bucket instead of recreating it.
    aws.s3.BucketV2.get("GalaMediaBucket", mediaBucketName);

    const staticAssetsBucket = new sst.aws.Bucket("GalaStaticAssets", {
      access: "public",
      transform: {
        bucket: (args: any, opts: any) => {
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
            {
              header: "Vary",
              override: true,
              value: "Accept-Encoding",
            },
          ],
        },
      },
    );

    const browserCompressionHeaders = new aws.cloudfront.ResponseHeadersPolicy(
      "GalaBrowserCompressionHeaders",
      {
        name: `${$app.name}-${stage}-browser-compression`,
        comment:
          "Preserve request-level compression negotiation for browser payloads",
        customHeadersConfig: {
          items: [
            {
              header: "Vary",
              override: true,
              value: "Accept-Encoding",
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
      POSTHOG_API_KEY: new sst.Secret("POSTHOG_API_KEY"),
      POSTHOG_PROJECT_ID: new sst.Secret("POSTHOG_PROJECT_ID"),
    };

    const resolveSecret = (key: keyof typeof retainedSecrets) =>
      retainedSecrets[key].value;
    const secretParameterName = (name: string) =>
      `/${$app.name}/${stage}/${name}`;
    const secretValueToParameter = (name: string, value: any) =>
      new aws.ssm.Parameter(`${name}Parameter`, {
        name: secretParameterName(name),
        type: "SecureString",
        description: `${$app.name} ${stage} secret ${name}`,
        value: trimSecretValue(value),
        overwrite: true,
      }).arn;

    const vpc = new sst.aws.Vpc("GalaVpc", {
      az: 2,
      bastion: true,  // public nat ec2 instance to use as a jump box to pg db running in a private subnet
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

    const databaseUrl = $interpolate`postgresql://${encodeUriComponent(database.username)}:${encodeUriComponent(database.password)}@${database.host}:${database.port}/${database.database}?sslmode=require`;
    const redisUrl = $interpolate`rediss://${encodeUriComponent(cache.username)}:${encodeUriComponent(cache.password)}@${cache.host}:${cache.port}`;

    const compactRuntimeEnvironment = <T extends Record<string, unknown>>(
      environment: T,
    ) =>
      Object.fromEntries(
        Object.entries(environment).filter(([, value]) => {
          if (value == null) {
            return false;
          }

          if (typeof value === "string") {
            return value.trim().length > 0;
          }

          return true;
        }),
      ) as { [K in keyof T]: Exclude<T[K], null | undefined> };

    const railsRuntimeEnvironment = compactRuntimeEnvironment({
      AWS_REGION: "us-west-2",
      BASE_URL: baseUrl,
      ASSET_HOST: $interpolate`https://${staticAssetsDistribution.domainName}/${assetReleasePrefix}`,
      FORCE_SSL: forceSsl ? "true" : "false",
      NODE_ENV: "production",
      PORT: "3000",
      RAILS_ENV: "production",
      SST_STAGE: stage,
      RAILS_LOG_TO_STDOUT: "true",
      RAILS_MAX_THREADS: isProduction ? "5" : "3",
      RAILS_SERVE_STATIC_FILES: "true",
      S3_BUCKET: mediaBucketName,
      GALA_STATIC_ASSETS_BUCKET: staticAssetsBucketName,
      GALA_ASSET_PREFIX: assetReleasePrefix,
      GALA_RELEASE_ID: releaseId,
      GALA_RELEASE_VERSION: process.env.GALA_RELEASE_VERSION?.trim() || "v2.9.9",
      GALA_PREVIEW_PR_NUMBER: process.env.GALA_PREVIEW_PR_NUMBER,
      GITHUB_RUN_ID: process.env.GITHUB_RUN_ID,
      SIDEKIQ_CONCURRENCY: isProduction ? "5" : "3",
      WEB_CONCURRENCY: isProduction ? "2" : "1",
      COMMIT_SHA: process.env.GITHUB_SHA,
      RELEASE: process.env.RELEASE?.trim() || releaseId,
      RELEASE_URL: process.env.GALA_RELEASE_URL,
    });

    const sharedSecrets = Object.fromEntries([
      ["DATABASE_URL", secretValueToParameter("DATABASE_URL", databaseUrl)],
      ["REDIS_URL", secretValueToParameter("REDIS_URL", redisUrl)],
      [
        "RAILS_MASTER_KEY",
        secretValueToParameter(
          "RAILS_MASTER_KEY",
          resolveSecret("RAILS_MASTER_KEY"),
        ),
      ],
      [
        "SECRET_KEY_BASE",
        secretValueToParameter(
          "SECRET_KEY_BASE",
          resolveSecret("SECRET_KEY_BASE"),
        ),
      ],
      ["LTI_KEY", secretValueToParameter("LTI_KEY", resolveSecret("LTI_KEY"))],
      [
        "LTI_SECRET",
        secretValueToParameter("LTI_SECRET", resolveSecret("LTI_SECRET")),
      ],
      [
        "MAPBOX_ACCESS_TOKEN",
        secretValueToParameter(
          "MAPBOX_ACCESS_TOKEN",
          resolveSecret("MAPBOX_ACCESS_TOKEN"),
        ),
      ],
      [
        "MapboxAccessToken",
        secretValueToParameter(
          "MapboxAccessToken",
          resolveSecret("MAPBOX_ACCESS_TOKEN"),
        ),
      ],
      [
        "SES_SMTP_PASSWORD",
        secretValueToParameter(
          "SES_SMTP_PASSWORD",
          resolveSecret("SES_SMTP_PASSWORD"),
        ),
      ],
      [
        "SES_SMTP_USERNAME",
        secretValueToParameter(
          "SES_SMTP_USERNAME",
          resolveSecret("SES_SMTP_USERNAME"),
        ),
      ],
      [
        "POSTHOG_API_KEY",
        secretValueToParameter(
          "POSTHOG_API_KEY",
          resolveSecret("POSTHOG_API_KEY"),
        ),
      ],
      [
        "POSTHOG_PROJECT_ID",
        secretValueToParameter(
          "POSTHOG_PROJECT_ID",
          resolveSecret("POSTHOG_PROJECT_ID"),
        ),
      ],
    ]);
    const railsRuntimeSecrets = sharedSecrets;

    const serviceCapacity = isProduction
      ? ({ fargate: { weight: 1 } } as const)
      : ("spot" as const);
    const singleTaskDeploymentTransform = isProduction
      ? {}
      : {
          service: (args: any) => {
            args.deploymentMinimumHealthyPercent = 0;
            args.deploymentMaximumPercent = 200;
            return undefined;
          },
        };

    const railsTaskDefaults = {
      cluster,
      image: railsContainerImage,
      architecture: containerArchitecture,
      environment: railsRuntimeEnvironment,
      ssm: railsRuntimeSecrets,
    };

    const railsServiceDefaults = {
      ...railsTaskDefaults,
      capacity: serviceCapacity,
      transform: singleTaskDeploymentTransform,
    };

    const web = new sst.aws.Service("GalaWeb", {
      ...railsServiceDefaults,
      command: ["bundle", "exec", "puma", "-C", "config/puma.rb"],
      cpu: isProduction ? "1 vCPU" : "0.5 vCPU",
      memory: isProduction ? "2 GB" : "1 GB",
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
            successCodes: "200-399",
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
      ...railsServiceDefaults,
      command: ["bundle", "exec", "sidekiq", "-C", "config/sidekiq.yml"],
      cpu: isProduction ? "0.5 vCPU" : "0.25 vCPU",
      memory: "1 GB",
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
      "/cases/features",
      "/catalog/languages.json",
      "/catalog/libraries.json",
      "/tags.json",
    ];
    const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
    const caseShowCacheTtl = 0;
    const caseShowCachePaths = ["/cases/*"];
    const nonCacheableCaseShowPaths = [
      "/cases/*/comment_threads*",
      "/cases/*/comments*",
      "/cases/*/confirm_deletion*",
      "/cases/*/locks*",
      "/cases/*/archive*",
      "/cases/*/community*",
      "/cases/*/deployments*",
      "/cases/*/editorships*",
      "/cases/*/quizzes*",
      "/cases/*/settings*",
      "/cases/*/stats*",
      "/cases/*/translation*",
      "/cases/*/edgenotes*",
      "/cases/*/library*",
      "/cases/*/libraries*",
      "/cases/*/enrollment*",
      "/cases/*/edit*",
      "/cases/*/copy*",
      "/cases/*/wiki*",
      "/cases/*/taggings*",
      "/cases/*/pages*",
      "/cases/*/podcasts*",
      "/cases/*/forums*",
      "/cases/*/features*",
    ];

    const appCacheBehavior = (
      pathPattern: string,
      cacheSeconds: number,
      forwardCookies: "all" | "none" = "all",
    ) => ({
      pathPattern,
      targetOriginId: appOriginId,
      viewerProtocolPolicy: "redirect-to-https",
      allowedMethods: ["GET", "HEAD", "OPTIONS"],
      cachedMethods: ["GET", "HEAD", "OPTIONS"],
      compress: true,
      responseHeadersPolicyId: browserCompressionHeaders.id,
      minTtl: 0,
      defaultTtl: cacheSeconds,
      maxTtl: cacheSeconds,
      forwardedValues: {
        queryString: true,
        headers: [
          "Accept",
          "Accept-Language",
          "Accept-Encoding",
          "Authorization",
        ],
        cookies: {
          forward: forwardCookies,
        },
      },
    });

    const appDistribution = new aws.cloudfront.Distribution(appCdnName, {
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
        responseHeadersPolicyId: browserCompressionHeaders.id,
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
      orderedCacheBehaviors: [
        ...publicCatalogCachePaths.map((pathPattern) =>
          appCacheBehavior(pathPattern, thirtyDaysInSeconds, "all")
        ),
        ...nonCacheableCaseShowPaths.map((pathPattern) =>
          appCacheBehavior(pathPattern, 0)
        ),
        ...caseShowCachePaths.map((pathPattern) =>
          appCacheBehavior(pathPattern, caseShowCacheTtl)
        ),
      ],
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

    const appRouter = customDomainEnabled
      ? isProduction
        ? new sst.aws.Router("GalaAppRouter", {
            domain: {
              name: rootDomain,
              aliases: [devDomain, devWildcardDomain],
              dns: sst.cloudflare.dns({
                ...(cloudflareZoneId ? { zone: cloudflareZoneId } : {}),
                proxy: cloudflareProxy,
              }),
            },
            transform: {
              cdn: (args: any) => {
                args.priceClass = "PriceClass_100";
                args.retainOnDelete = true;
              },
            },
          })
        : sst.aws.Router.get(
            "GalaAppRouter",
            sharedRouterDistributionId,
          )
      : undefined;

    if (appRouter) {
      if (isProduction) {
        appRouter.route(`${rootDomain}/`, web.url);
      } else {
        appRouter.route(`${devDomain}/`, web.url);
        appRouter.route(`${devWildcardDomain}/`, web.url);
      }
    }

    const migration = new sst.aws.Task("GalaMigrate", {
      ...railsTaskDefaults,
      command: ["bundle", "exec", "rails", "db:migrate"],
      cpu: "0.25 vCPU",
      memory: "1 GB",
    });

    const seedDatabase = new sst.aws.Task("GalaSeedDatabase", {
      ...railsTaskDefaults,
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
    });

    const refreshIndices = new sst.aws.Task("GalaRefreshIndices", {
      ...railsTaskDefaults,
      command: ["bundle", "exec", "rake", "indices:refresh"],
      cpu: "0.25 vCPU",
      memory: "1 GB",
    });

    const weeklyReport = new sst.aws.Task("GalaWeeklyReport", {
      ...railsTaskDefaults,
      command: ["bundle", "exec", "rake", "emails:send_weekly_report"],
      cpu: "0.25 vCPU",
      memory: "1 GB",
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
      appCdnDistributionId: appDistribution.id,
      appCustomDomainUrl: undefined,
      appRouterUrl: appRouter?.url,
      appRouterDistributionId: appRouter?.distributionID,
      previewUrl: baseUrl,
      albBaseUrl: baseUrl,
      staticAssetsCdnUrl: $interpolate`https://${staticAssetsDistribution.domainName}`,
      staticAssetsDistributionId: staticAssetsDistribution.id,
      staticAssetReleasePrefix: assetReleasePrefix,
      releaseId,
      databaseInstanceId: database.id,
      webServiceName: web.nodes.service.name,
      workerServiceName: worker.nodes.service.name,
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
