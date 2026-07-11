import type { StageContext } from "./config";

const encodeUriComponent = (value: unknown) =>
  $resolve([value]).apply((resolvedValues) =>
    encodeURIComponent(`${resolvedValues[0] ?? ""}`),
  );

export function createPlatform(context: StageContext) {
  const { target, capacity } = context;
  const isProduction = target.kind === "production";
  const bastionAmi = isProduction
    ? "ami-0a2a049c945b84826"
    : "ami-08c28b6151a0ba92f";
  const vpc = new sst.aws.Vpc("GalaVpc", {
    az: 2,
    bastion: true,  // public nat ec2 instance to use as a jump box to pg db running in a private subnet
    transform: {
      bastionInstance: (args: any) => {
        args.ami = bastionAmi;
      },
    },
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
    instance: capacity.databaseClass,
    storage: capacity.databaseStorage,
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

  return { vpc, cluster, database, cache, databaseUrl, redisUrl };
}

export type PlatformResources = ReturnType<typeof createPlatform>;

