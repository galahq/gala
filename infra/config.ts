export type DevTarget = { kind: "dev"; stage: "dev"; durable: true };
export type ProductionTarget = {
  kind: "production";
  stage: "production";
  durable: true;
};
export type PreviewTarget = {
  kind: "preview";
  stage: `pr-${number}`;
  prNumber: number;
  durable: false;
};
export type LocalTarget = {
  kind: "local";
  stage: `local-${string}`;
  name: string;
  durable: false;
};
export type StageTarget = DevTarget | ProductionTarget | PreviewTarget | LocalTarget;
export type DurableStage = DevTarget["stage"] | ProductionTarget["stage"];

export type ServiceCapacity = {
  cpu: "0.25 vCPU" | "0.5 vCPU" | "1 vCPU";
  memory: "1 GB" | "2 GB";
  min: number;
  max: number;
};

export type DurableCapacity = {
  databaseClass: "t4g.micro" | "t4g.small";
  databaseStorage: "20 GB" | "50 GB";
  web: ServiceCapacity;
  worker: ServiceCapacity;
};

export const DURABLE_CAPACITY: Record<DurableStage, DurableCapacity> = {
  dev: {
    databaseClass: "t4g.micro",
    databaseStorage: "20 GB",
    web: { cpu: "0.5 vCPU", memory: "1 GB", min: 1, max: 1 },
    worker: { cpu: "0.25 vCPU", memory: "1 GB", min: 1, max: 1 },
  },
  production: {
    databaseClass: "t4g.small",
    databaseStorage: "50 GB",
    web: { cpu: "1 vCPU", memory: "2 GB", min: 2, max: 3 },
    worker: { cpu: "0.5 vCPU", memory: "1 GB", min: 1, max: 2 },
  },
};

export function classifyStage(stage: string): StageTarget {
  if (stage === "dev") return { kind: "dev", stage, durable: true };
  if (stage === "production") return { kind: "production", stage, durable: true };

  const preview = /^pr-([1-9][0-9]*)$/.exec(stage);
  if (preview) {
    const prNumber = Number(preview[1]);
    return { kind: "preview", stage: `pr-${prNumber}`, prNumber, durable: false };
  }

  const local = /^local-([a-z0-9][a-z0-9-]{0,31})$/.exec(stage);
  if (local) {
    return { kind: "local", stage: `local-${local[1]}`, name: local[1], durable: false };
  }

  throw new Error(`unsupported SST stage: ${stage || "<empty>"}`);
}

export function capacityFor(target: StageTarget): DurableCapacity {
  return target.kind === "production"
    ? DURABLE_CAPACITY.production
    : DURABLE_CAPACITY.dev;
}

export function statePolicy(target: StageTarget) {
  return target.durable
    ? ({ protect: true, removal: "retain-all" } as const)
    : ({ protect: false, removal: "remove" } as const);
}

export const GALA = {
  appName: "gala",
  awsRegion: "us-west-2",
  rootDomain: "learngala.dev",
  devDomain: "dev.learngala.dev",
  devWildcardDomain: "*.dev.learngala.dev",
  mediaBucketName: "msc-gala",
  staticAssetsBucketName: "gala-static-assets-353760060567",
  immutableStaticCacheControl: "public,max-age=31536000,immutable",
  containerArchitecture: "arm64",
  productionDockerfile: "Dockerfile.production",
  cloudflareProxy: false,
  // Verified live on 2026-07-10. This is a phase-one no-op bridge only;
  // shared-reference reconciliation replaces it with a validated lookup.
  currentSharedRouterDistributionId: "E3FF4TTU9Q4XTY",
} as const;

export type StageContext = {
  target: StageTarget;
  capacity: DurableCapacity;
};

export function createStageContext(stage: string): StageContext {
  const target = classifyStage(stage);
  return {
    target,
    capacity: capacityFor(target),
  };
}

export function publicHostFor(target: StageTarget): string | undefined {
  if (target.kind === "production") return GALA.rootDomain;
  if (target.kind === "dev") return GALA.devDomain;
  if (target.kind === "preview") {
    return `pr-${target.prNumber}.${GALA.devDomain}`;
  }
  return undefined;
}

export function appSettings(stage: string) {
  const target = classifyStage(stage);
  const policy = statePolicy(target);
  return {
    name: GALA.appName,
    home: "aws" as const,
    ...policy,
    providers: {
      aws: { region: GALA.awsRegion },
      cloudflare: "6.13.0",
    },
  };
}
