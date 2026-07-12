import { GALA, stageFacts, type StageContext } from "../config";
import type { DevPlatformReference } from "../dev-reference";

export function createDerivedRuntime(
  context: StageContext,
  dev: DevPlatformReference,
) {
  const { target, capacity } = context;
  const facts = stageFacts(target);
  const stage = target.stage;
  const baseUrl = facts.publicHost
    ? `https://${facts.publicHost}`
    : "http://localhost:3000";
  const image = `353760060567.dkr.ecr.us-west-2.amazonaws.com/gala:dev`;
  const environment = {
    AWS_REGION: GALA.awsRegion,
    BASE_URL: baseUrl,
    ASSET_HOST: $interpolate`https://${dev.staticAssetsDistribution.domainName}/releases/bootstrap`,
    FORCE_SSL: facts.publicHost ? "true" : "false",
    NODE_ENV: "production",
    PORT: "3000",
    RAILS_ENV: "production",
    SST_STAGE: stage,
    RAILS_LOG_TO_STDOUT: "true",
    RAILS_MAX_THREADS: "3",
    RAILS_SERVE_STATIC_FILES: "true",
    S3_BUCKET: GALA.mediaBucketName,
    GALA_STATIC_ASSETS_BUCKET: GALA.staticAssetsBucketName,
    GALA_RELEASE: "bootstrap",
    SIDEKIQ_CONCURRENCY: "3",
    WEB_CONCURRENCY: "1",
  };
  const permissions = [
    {
      actions: ["s3:ListBucket"],
      resources: [
        `arn:aws:s3:::${GALA.mediaBucketName}`,
        `arn:aws:s3:::${GALA.staticAssetsBucketName}`,
      ],
    },
    {
      actions: ["s3:GetObject", "s3:PutObject"],
      resources: [
        `arn:aws:s3:::${GALA.mediaBucketName}/*`,
        `arn:aws:s3:::${GALA.staticAssetsBucketName}/*`,
      ],
    },
  ];
  const defaults = {
    cluster: dev.cluster,
    image,
    architecture: GALA.containerArchitecture,
    environment,
    permissions,
    ssm: dev.ssm,
    capacity: "spot" as const,
  };

  // Derived stages own app compute, never dev's data plane.
  const web = new sst.aws.Service("GalaWeb", {
    ...defaults,
    command: ["bundle", "exec", "puma", "-C", "config/puma.rb"],
    cpu: capacity.web.cpu,
    memory: capacity.web.memory,
    scaling: { min: 1, max: 1 },
    transform: {
      service: (args: any) => {
        args.name = `gala-${stage}-web`;
      },
    },
    loadBalancer: {
      ports: [{ listen: "80/http", forward: "3000/http" }],
      health: { "3000/http": { path: "/up", successCodes: "200-399" } },
    },
  });
  const worker = new sst.aws.Service("GalaWorker", {
    ...defaults,
    command: ["bundle", "exec", "sidekiq", "-C", "config/sidekiq.yml"],
    cpu: capacity.worker.cpu,
    memory: capacity.worker.memory,
    scaling: { min: 1, max: 1 },
    transform: {
      service: (args: any) => {
        args.name = `gala-${stage}-worker`;
      },
    },
  });
  const task = (name: string, command: string[]) =>
    new sst.aws.Task(name, { ...defaults, command, cpu: "0.25 vCPU", memory: "1 GB" });
  const migration = task("GalaMigrate", ["bundle", "exec", "rails", "db:migrate"]);
  const seedDatabase = task("GalaSeedDatabase", ["bundle", "exec", "rails", "db:seed"]);
  task("GalaRefreshIndices", ["bundle", "exec", "rake", "indices:refresh"]);
  task("GalaWeeklyReport", ["bundle", "exec", "rake", "emails:send_weekly_report"]);

  if (facts.routeEnabled && facts.publicHost) {
    dev.router.route(`${facts.publicHost}/`, web.url);
  }

  return {
    stage,
    backingStage: facts.backingStage,
    appUrl: web.url,
    previewUrl: facts.publicHost ? baseUrl : undefined,
    webServiceName: web.nodes.service.name,
    workerServiceName: worker.nodes.service.name,
    migrationTaskDefinitionArn: migration.taskDefinition,
    seedTaskDefinitionArn: seedDatabase.taskDefinition,
  };
}
