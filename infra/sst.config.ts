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
    const domain = isProduction ? "www.learngala.com" : "staging.learngala.com";
    const baseUrl = `https://${domain}`;
    const mediaBucketName = "msc-gala";

    const RAILS_MASTER_KEY = new sst.Secret("RAILS_MASTER_KEY");
    const SECRET_KEY_BASE = new sst.Secret("SECRET_KEY_BASE");
    const LTI_KEY = new sst.Secret("LTI_KEY");
    const LTI_SECRET = new sst.Secret("LTI_SECRET");
    const MAPBOX_ACCESS_TOKEN = new sst.Secret("MAPBOX_ACCESS_TOKEN");
    const SES_SMTP_USERNAME = new sst.Secret("SES_SMTP_USERNAME");
    const SES_SMTP_PASSWORD = new sst.Secret("SES_SMTP_PASSWORD");

    // Keep ECS tasks in public subnets and RDS/cache private to avoid NAT costs.
    const vpc = new sst.aws.Vpc("GalaVpc", {
      az: 2,
    });

    const cluster = new sst.aws.Cluster("GalaCluster", { vpc });

    const database = new sst.aws.Postgres("GalaDatabase", {
      vpc,
      version: "16.4",
      database: "gala",
      instance: isProduction ? "t4g.small" : "t4g.micro",
      storage: isProduction ? "50 GB" : "20 GB",
      multiAz: false,
      proxy: false,
    });

    // Phase 1 keeps a Redis-compatible cache so the current app can move without a rewrite.
    const cache = new sst.aws.Redis("GalaCache", {
      vpc,
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
      DATABASE_URL: databaseUrl,
      LTI_KEY: LTI_KEY.value,
      LTI_SECRET: LTI_SECRET.value,
      MAPBOX_ACCESS_TOKEN: MAPBOX_ACCESS_TOKEN.value,
      MapboxAccessToken: MAPBOX_ACCESS_TOKEN.value,
      NODE_ENV: "production",
      PORT: "3000",
      RAILS_ENV: "production",
      RAILS_LOG_TO_STDOUT: "true",
      RAILS_MAX_THREADS: "3",
      RAILS_MASTER_KEY: RAILS_MASTER_KEY.value,
      RAILS_SERVE_STATIC_FILES: "true",
      REDIS_URL: redisUrl,
      S3_BUCKET: mediaBucketName,
      SECRET_KEY_BASE: SECRET_KEY_BASE.value,
      SES_SMTP_PASSWORD: SES_SMTP_PASSWORD.value,
      SES_SMTP_USERNAME: SES_SMTP_USERNAME.value,
      SIDEKIQ_CONCURRENCY: isProduction ? "5" : "3",
      WEB_CONCURRENCY: isProduction ? "2" : "1",
      COMMIT_SHA: process.env.GITHUB_SHA ?? "",
    };

    const serviceCapacity = isProduction
      ? { fargate: { weight: 1 } }
      : "spot";

    const web = new sst.aws.Service("GalaWeb", {
      cluster,
      image: {
        context: "..",
        dockerfile: "Dockerfile",
        args: {
          rails_env: "production",
          secret_key_base: "build-placeholder",
        },
      },
      command: ["bundle", "exec", "puma", "-C", "config/puma.rb"],
      cpu: "0.5 vCPU",
      memory: "2 GB",
      architecture: "x86_64",
      capacity: serviceCapacity,
      environment: sharedEnvironment,
      scaling: {
        min: 1,
        max: isProduction ? 3 : 1,
        cpuUtilization: 70,
        memoryUtilization: 80,
      },
      loadBalancer: {
        domain,
        ports: [
          { listen: "80/http", forward: "3000/http" },
          { listen: "443/https", forward: "3000/http" },
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
      image: {
        context: "..",
        dockerfile: "Dockerfile",
        args: {
          rails_env: "production",
          secret_key_base: "build-placeholder",
        },
      },
      command: ["bundle", "exec", "sidekiq", "-C", "config/sidekiq.yml"],
      cpu: "0.25 vCPU",
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
        command: ["CMD-SHELL", "ps -o comm= 1 | grep -q ruby"],
        startPeriod: "60 seconds",
        interval: "30 seconds",
        timeout: "5 seconds",
        retries: 3,
      },
    });

    const migration = new sst.aws.Task("GalaMigrate", {
      cluster,
      image: {
        context: "..",
        dockerfile: "Dockerfile",
        args: {
          rails_env: "production",
          secret_key_base: "build-placeholder",
        },
      },
      command: ["bundle", "exec", "rails", "db:migrate"],
      cpu: "0.25 vCPU",
      memory: "1 GB",
      architecture: "x86_64",
      environment: sharedEnvironment,
    });

    const refreshIndices = new sst.aws.Task("GalaRefreshIndices", {
      cluster,
      image: {
        context: "..",
        dockerfile: "Dockerfile",
        args: {
          rails_env: "production",
          secret_key_base: "build-placeholder",
        },
      },
      command: ["bundle", "exec", "rake", "indices:refresh"],
      cpu: "0.25 vCPU",
      memory: "1 GB",
      architecture: "x86_64",
      environment: sharedEnvironment,
    });

    const weeklyReport = new sst.aws.Task("GalaWeeklyReport", {
      cluster,
      image: {
        context: "..",
        dockerfile: "Dockerfile",
        args: {
          rails_env: "production",
          secret_key_base: "build-placeholder",
        },
      },
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
          resources: [`arn:aws:s3:::${mediaBucketName}`],
        },
        {
          actions: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
          resources: [`arn:aws:s3:::${mediaBucketName}/*`],
        },
      ],
    }).json;

    for (const [name, role] of [
      ["Web", web.nodes.taskRole.name],
      ["Worker", worker.nodes.taskRole.name],
      ["Migrate", migration.nodes.taskRole.name],
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
      appDomain: domain,
      appUrl: web.url,
      migrationClusterArn: migration.cluster,
      migrationTaskDefinitionArn: migration.taskDefinition,
      migrationSubnets: migration.subnets,
      migrationSecurityGroups: migration.securityGroups,
      migrationAssignPublicIp: migration.assignPublicIp,
    };
  },
});
