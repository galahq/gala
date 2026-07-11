# SST Stable Platform Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the live dev/production baseline and refactor the monolithic SST configuration into small stage, platform, runtime, and asset modules without changing deployed AWS resources.

**Architecture:** This is phase one of the approved migration. Pure stage configuration is separated first and tested without SST; resource declarations are then moved mechanically behind functions while retaining every Pulumi logical name and input. The phase ends with authenticated, non-refreshing dev and production diffs and does not deploy.

**Tech Stack:** SST 4.7.1, Pulumi TypeScript, TypeScript 6, Node 24 test runner, Ruby contract tests, AWS ECS/RDS/CloudFront in `us-west-2`, GitHub Actions

## Global Constraints

- AWS account is `353760060567`, accessed locally with `AWS_PROFILE=gala`.
- AWS region is exactly `us-west-2`.
- Work in the current checkout; the user explicitly requested no worktree.
- Preserve the existing `gala/dev` and `gala/production` SST state identities and every current Pulumi logical resource name.
- Do not run `sst deploy`, `sst refresh`, `sst remove`, or any state-edit command in this plan.
- Do not create `pr-NNN` or `local-NAME` resources in this plan; their classifiers are pure preparation for later phases.
- Do not remove CloudFront resources or cache rules in this plan.
- Do not implement image promotion, release rollback, or canonical `vN` artifacts in this plan.
- `msc-gala` and Heroku-compatible SES resources remain external and must never be created, imported, replaced, or destroyed.
- The static-assets bucket remains physically unchanged.
- Dev database baseline is `db.t4g.micro`, 20 GB, single-AZ.
- Production database baseline is `db.t4g.small`, 20 GB, single-AZ.
- Dev web is 0.5 vCPU/1 GB at 1–1; dev worker is 0.25 vCPU/1 GB at 1–1.
- Production web is 1 vCPU/2 GB at 2–3; production worker is 0.5 vCPU/1 GB at 1–2.
- Preserve the approved bastion AMIs: dev `ami-08c28b6151a0ba92f`, production `ami-0a2a049c945b84826`.
- Never print SST secret values or decrypted SSM values.
- Preserve unrelated working-tree paths, including `infra/sst-env.d.ts`, `.work/`, `.superpowers/`, and `GCP_OAUTH.pdf`.
- Commit only the files listed by the current task.

## Scope decomposition

The approved design contains four independently reviewable implementation phases. This plan covers only phase one:

1. **This plan:** live baseline, pure stage configuration, and no-behavior-change TypeScript module extraction.
2. **Follow-on plan:** canonical `v<GITHUB_RUN_NUMBER>` releases, thin `deploy.yml`, ECS-only rollout, promotion, and rollback.
3. **Follow-on plan:** real `pr-NNN` isolation and `local-NAME`/Docker Compose tunnel integration.
4. **Follow-on plan:** static-bucket ownership reconciliation and verified removal of only the unused application edge-cache distributions.

No later phase starts until this plan's final authenticated diffs are accepted.

## File map

- Create `infra/config.ts`: pure stage classifier, live capacity table, environment normalization, and stage context.
- Create `infra/test/config.test.ts`: Node tests for stage parsing, live capacity, environment defaults, and rejection behavior.
- Create `infra/assets.ts`: current media/static bucket lookup, static bucket component, response policy, and static distribution.
- Create `infra/platform.ts`: current VPC, bastion, cluster, Postgres, Redis/Valkey, and generated connection URLs.
- Create `infra/runtime.ts`: current secrets, SSM parameters, ECS services/tasks, app edge distribution, router routes, cron, and outputs.
- Create `infra/stages/dev.ts`: dev composition entry point.
- Create `infra/stages/production.ts`: production composition entry point.
- Create `infra/stages/index.ts`: phase-one durable-stage dispatcher.
- Modify `infra/sst.config.ts`: reduce to app settings plus stage dispatch.
- Modify `infra/package.json`: add deterministic `check` and `test` scripts.
- Modify `scripts/ops/test-sst-dev-runtime-contracts.rb`: read the complete TypeScript module set instead of one monolithic file.
- Create `scripts/ops/test-sst-module-boundaries.rb`: assert ownership, import-time purity, and dispatcher size.
- Modify `.github/workflows/ci.yml`: run TypeScript and module-boundary contracts in the existing non-mutating contracts suite.
- Modify `scripts/ops/test-workflow-architecture-defaults.rb`: require the new CI commands.
- Modify `infra/README.md`: document the module map, capacity edit point, and no-refresh diff workflow.
- Create `docs/ops/infra-stacks.md`: document the stable platform boundary and phase-one stage ownership.

---

### Task 1: Add the pure stage classifier and live capacity table

**Files:**
- Create: `infra/config.ts`
- Create: `infra/test/config.test.ts`
- Modify: `infra/package.json`

**Interfaces:**
- Produces: `classifyStage(stage: string) -> StageTarget`
- Produces: `capacityFor(target: StageTarget) -> DurableCapacity`
- Produces: `DURABLE_CAPACITY.dev` and `DURABLE_CAPACITY.production`
- Produces: `statePolicy(target: StageTarget) -> { protect: boolean, removal: "remove" | "retain-all" }`

- [ ] **Step 1: Write failing Node tests for stage classification and the verified live capacity**

Create `infra/test/config.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";

import {
  DURABLE_CAPACITY,
  capacityFor,
  classifyStage,
  statePolicy,
} from "../config.ts";

test("classifies durable, preview, and local stages", () => {
  assert.deepEqual(classifyStage("dev"), { kind: "dev", stage: "dev", durable: true });
  assert.deepEqual(classifyStage("production"), {
    kind: "production",
    stage: "production",
    durable: true,
  });
  assert.deepEqual(classifyStage("pr-790"), {
    kind: "preview",
    stage: "pr-790",
    prNumber: 790,
    durable: false,
  });
  assert.deepEqual(classifyStage("local-nathan"), {
    kind: "local",
    stage: "local-nathan",
    name: "nathan",
    durable: false,
  });
});

test("rejects malformed or unknown stages", () => {
  for (const stage of ["", "nightly", "pr-0", "pr-0790", "local-", "local-Nathan", "prod"]) {
    assert.throws(() => classifyStage(stage), /unsupported SST stage/);
  }
});

test("encodes the live dev and production capacity", () => {
  assert.deepEqual(DURABLE_CAPACITY.dev, {
    databaseClass: "t4g.micro",
    databaseStorage: "20 GB",
    web: { cpu: "0.5 vCPU", memory: "1 GB", min: 1, max: 1 },
    worker: { cpu: "0.25 vCPU", memory: "1 GB", min: 1, max: 1 },
  });
  assert.deepEqual(DURABLE_CAPACITY.production, {
    databaseClass: "t4g.small",
    databaseStorage: "20 GB",
    web: { cpu: "1 vCPU", memory: "2 GB", min: 2, max: 3 },
    worker: { cpu: "0.5 vCPU", memory: "1 GB", min: 1, max: 2 },
  });
  assert.equal(capacityFor(classifyStage("pr-790")), DURABLE_CAPACITY.dev);
});

test("protects durable stages and removes derived stages", () => {
  assert.deepEqual(statePolicy(classifyStage("dev")), {
    protect: true,
    removal: "retain-all",
  });
  assert.deepEqual(statePolicy(classifyStage("production")), {
    protect: true,
    removal: "retain-all",
  });
  assert.deepEqual(statePolicy(classifyStage("pr-790")), {
    protect: false,
    removal: "remove",
  });
});
```

Add scripts to `infra/package.json`:

```json
"scripts": {
  "check": "tsc --noEmit",
  "test": "node --experimental-strip-types --test test/*.test.ts",
  "deploy": "sst deploy",
  "dev": "sst dev",
  "diff": "sst diff",
  "remove": "sst remove"
}
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
cd infra && npm test
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `infra/config.ts`.

- [ ] **Step 3: Implement the pure classifier and capacity table**

Create `infra/config.ts` with this initial content:

```ts
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
  databaseStorage: "20 GB";
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
    databaseStorage: "20 GB",
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
```

- [ ] **Step 4: Run the pure tests and TypeScript check and verify GREEN**

Run:

```bash
cd infra && npm test && npm run check
```

Expected: four passing Node subtests and a zero-exit TypeScript check.

- [ ] **Step 5: Commit the pure configuration contract**

```bash
git add infra/config.ts infra/test/config.test.ts infra/package.json infra/package-lock.json
git commit -m "Add SST stage and capacity contracts"
```

---

### Task 2: Centralize deploy environment parsing in a stage context

**Files:**
- Modify: `infra/config.ts`
- Modify: `infra/test/config.test.ts`

**Interfaces:**
- Produces: `createStageContext(stage: string, env?: Environment) -> StageContext`
- Produces: `StageContext.target`, `StageContext.capacity`, domain, image, release, asset, and provider inputs.
- Preserves: current legacy release ID calculation until the canonical-release follow-on plan.

- [ ] **Step 1: Add failing context normalization tests**

Extend the existing `../config.ts` import to include `createStageContext`:

```ts
import {
  DURABLE_CAPACITY,
  capacityFor,
  classifyStage,
  createStageContext,
  statePolicy,
} from "../config.ts";
```

Then append these tests:

```ts

test("normalizes the current dev defaults without reading the caller shell", () => {
  const context = createStageContext("dev", {});
  assert.equal(context.stage, "dev");
  assert.equal(context.rootDomain, "learngala.dev");
  assert.equal(context.previewHost, "dev.learngala.dev");
  assert.equal(context.baseUrl, "https://dev.learngala.dev");
  assert.equal(context.staticAssetsBucketName, "gala-static-assets-353760060567");
  assert.equal(context.mediaBucketName, "msc-gala");
  assert.equal(context.containerArchitecture, "arm64");
  assert.equal(context.productionDockerfile, "Dockerfile.production");
  assert.equal(context.capacity, DURABLE_CAPACITY.dev);
});

test("normalizes production and preserves explicit deploy metadata", () => {
  const context = createStageContext("production", {
    GALA_RELEASE_ID: "v-current",
    GALA_ASSET_PREFIX: "/releases/production/v-current/",
    GALA_APP_IMAGE_URI: "example.invalid/gala@sha256:abc",
    GALA_DOMAIN_NAME: "example.test",
    GITHUB_SHA: "abc123",
  });
  assert.equal(context.releaseId, "v-current");
  assert.equal(context.assetReleasePrefix, "releases/production/v-current");
  assert.equal(context.appImageUri, "example.invalid/gala@sha256:abc");
  assert.equal(context.baseUrl, "https://example.test");
  assert.equal(context.forceSsl, true);
  assert.equal(context.githubSha, "abc123");
  assert.equal(context.capacity, DURABLE_CAPACITY.production);
});

test("rejects invalid container architecture", () => {
  assert.throws(
    () => createStageContext("dev", { GALA_CONTAINER_ARCHITECTURE: "mips" }),
    /GALA_CONTAINER_ARCHITECTURE/,
  );
});
```

- [ ] **Step 2: Run the context tests and verify RED**

Run:

```bash
cd infra && npm test
```

Expected: FAIL because `createStageContext` is not exported.

- [ ] **Step 3: Implement the exact environment contract**

Append these types to `infra/config.ts`:

```ts
export type Environment = Record<string, string | undefined>;
export type ContainerArchitecture = "x86_64" | "arm64";

export type StageContext = {
  appName: "gala";
  stage: string;
  target: StageTarget;
  isProduction: boolean;
  capacity: DurableCapacity;
  releaseId: string;
  appCdnName: "GalaAppDistribution" | "GalaAppDistributionDev";
  rootDomain: string;
  devDomain: string;
  devWildcardDomain: string;
  sharedRouterDistributionId: string;
  previewHost: string;
  routePreviewHost: boolean;
  customDomainEnabled: boolean;
  cloudflareProxy: boolean;
  cloudflareZoneId?: string;
  assetReleasePrefix: string;
  baseUrl: string;
  forceSsl: boolean;
  mediaBucketName: "msc-gala";
  staticAssetsBucketName: string;
  importExistingStaticAssetsBucket: boolean;
  immutableStaticCacheControl: "public,max-age=31536000,immutable";
  appImageUri: string;
  containerArchitecture: ContainerArchitecture;
  productionDockerfile: string;
  releaseVersion: string;
  previewPrNumber?: string;
  githubRunId?: string;
  githubSha?: string;
  release: string;
  releaseUrl?: string;
};
```

Append the context builder:

```ts
export function createStageContext(
  stage: string,
  env: Environment = process.env,
): StageContext {
  const target = classifyStage(stage);
  const isProduction = target.kind === "production";
  const releaseId = (env.GALA_RELEASE_ID ?? env.GITHUB_RUN_ID ?? `${stage}.local`)
    .trim()
    .replace(/[^A-Za-z0-9._-]/g, "-")
    .slice(0, 96);
  const rootDomain = env.GALA_DOMAIN_NAME?.trim() || "learngala.dev";
  const devDomain = `dev.${rootDomain}`;
  const previewHost = env.GALA_PREVIEW_HOST?.trim() ||
    (isProduction ? rootDomain : devDomain);
  const explicitBaseUrl = env.GALA_BASE_URL ?? env.ALB_BASE_URL ?? "";
  const baseUrl = explicitBaseUrl.length > 0
    ? explicitBaseUrl
    : `https://${previewHost}`;
  const rawArchitecture = env.GALA_CONTAINER_ARCHITECTURE?.trim() || "arm64";
  if (rawArchitecture !== "x86_64" && rawArchitecture !== "arm64") {
    throw new Error("GALA_CONTAINER_ARCHITECTURE must be one of: x86_64, arm64");
  }

  return {
    appName: "gala",
    stage,
    target,
    isProduction,
    capacity: capacityFor(target),
    releaseId,
    appCdnName: isProduction
      ? "GalaAppDistribution"
      : "GalaAppDistributionDev",
    rootDomain,
    devDomain,
    devWildcardDomain: `*.${devDomain}`,
    sharedRouterDistributionId:
      env.GALA_ROUTER_DISTRIBUTION_ID?.trim() ||
      (isProduction ? "" : "E3FF4TTU9Q4XTY"),
    previewHost,
    routePreviewHost: env.GALA_ROUTE_PREVIEW_HOST === "true",
    customDomainEnabled: env.GALA_ENABLE_CUSTOM_DOMAIN !== "false",
    cloudflareProxy: env.GALA_CLOUDFLARE_PROXY === "true",
    cloudflareZoneId: env.CLOUDFLARE_ZONE_ID?.trim() || undefined,
    assetReleasePrefix: (env.GALA_ASSET_PREFIX || `releases/${stage}/${releaseId}`)
      .replace(/^\/+|\/+$/g, ""),
    baseUrl,
    forceSsl: isProduction || baseUrl.trim().startsWith("https://"),
    mediaBucketName: "msc-gala",
    staticAssetsBucketName:
      env.GALA_STATIC_ASSETS_BUCKET || "gala-static-assets-353760060567",
    importExistingStaticAssetsBucket:
      env.GALA_IMPORT_STATIC_ASSETS_BUCKET === "true" || !isProduction,
    immutableStaticCacheControl: "public,max-age=31536000,immutable",
    appImageUri:
      env.GALA_APP_IMAGE_URI?.trim() || env.GALA_WEB_IMAGE_URI?.trim() || "",
    containerArchitecture: rawArchitecture,
    productionDockerfile:
      env.GALA_PRODUCTION_DOCKERFILE?.trim() || "Dockerfile.production",
    releaseVersion: env.GALA_RELEASE_VERSION?.trim() || "v2.9.9",
    previewPrNumber: env.GALA_PREVIEW_PR_NUMBER,
    githubRunId: env.GITHUB_RUN_ID,
    githubSha: env.GITHUB_SHA,
    release: env.RELEASE?.trim() || releaseId,
    releaseUrl: env.GALA_RELEASE_URL,
  };
}
```

- [ ] **Step 4: Run tests and TypeScript check and verify GREEN**

Run:

```bash
cd infra && npm test && npm run check
```

Expected: seven passing Node subtests and a zero-exit TypeScript check.

- [ ] **Step 5: Commit centralized context parsing**

```bash
git add infra/config.ts infra/test/config.test.ts
git commit -m "Centralize SST stage context"
```

---

### Task 3: Make existing runtime contracts module-aware

**Files:**
- Modify: `scripts/ops/test-sst-dev-runtime-contracts.rb`

**Interfaces:**
- Produces: `infra_source() -> String`, the concatenated production TypeScript sources.
- Preserves: every existing runtime, secret, static asset, route, and bastion assertion during extraction.

- [ ] **Step 1: Add a failing assertion that the contract loader sees extracted modules**

Replace the single-file assignment:

```ruby
sst = repo_read("infra/sst.config.ts")
```

with:

```ruby
infra_paths = Dir.glob(File.join(ROOT, "infra", "**", "*.ts"))
  .reject { |path| path.include?("/.sst/") || path.include?("/test/") || path.end_with?("sst-env.d.ts") }
  .sort
sst = infra_paths.map { |path| File.read(path) }.join("\n")

assert("infra TypeScript contract loader must include modular sources") do
  %w[config.ts sst.config.ts].all? do |name|
    infra_paths.any? { |path| path.end_with?("/#{name}") }
  end
end
```

- [ ] **Step 2: Run the existing runtime contract and verify GREEN before moving resources**

Run:

```bash
ruby scripts/ops/test-sst-dev-runtime-contracts.rb
```

Expected: `PASS sst dev runtime contracts`.

- [ ] **Step 3: Rename assertion labels from one file to the module set**

Mechanically replace the label prefix `infra/sst.config.ts:` with `infra TypeScript:` in this test only. Do not change any assertion body in this step.

- [ ] **Step 4: Run the contract again and verify GREEN**

Run:

```bash
ruby scripts/ops/test-sst-dev-runtime-contracts.rb
```

Expected: `PASS sst dev runtime contracts`.

- [ ] **Step 5: Commit the module-aware contract loader**

```bash
git add scripts/ops/test-sst-dev-runtime-contracts.rb
git commit -m "Make SST contracts module aware"
```

---

### Task 4: Extract the existing asset resources without changing inputs

**Files:**
- Create: `infra/assets.ts`
- Modify: `infra/sst.config.ts`

**Interfaces:**
- Consumes: `StageContext`
- Produces: `createAssets(context) -> AssetResources`
- Produces fields: `staticAssetsBucket`, `staticAssetsDistribution`, `staticAssetResponseHeaders`

- [ ] **Step 1: Add a failing module-presence assertion**

Append to `scripts/ops/test-sst-dev-runtime-contracts.rb` before the Docker Compose assertions:

```ruby
assert("infra/assets.ts: static asset resources must have a focused module") do
  infra_paths.any? { |path| path.end_with?("/infra/assets.ts") }
end
```

- [ ] **Step 2: Run the contract and verify RED**

Run:

```bash
ruby scripts/ops/test-sst-dev-runtime-contracts.rb
```

Expected: FAIL with `static asset resources must have a focused module`.

- [ ] **Step 3: Create the asset module wrapper and move the exact current block**

Create `infra/assets.ts` with this wrapper:

```ts
import type { StageContext } from "./config";

export function createAssets(context: StageContext) {
  const {
    appName,
    stage,
    isProduction,
    mediaBucketName,
    staticAssetsBucketName,
    importExistingStaticAssetsBucket,
    immutableStaticCacheControl,
  } = context;
```

Perform the move mechanically, without formatting or changing resource arguments:

1. Cut from `aws.s3.BucketV2.get("GalaMediaBucket", mediaBucketName);` through the closing declaration of `GalaStaticAssetResponseHeaders`, and paste it immediately after the destructuring statement.
2. Leave `GalaBrowserCompressionHeaders` in `sst.config.ts`; it belongs to the current application edge distribution until Task 6.
3. Cut the complete `GalaStaticAssetsDistribution` declaration and paste it after `GalaStaticAssetResponseHeaders`.
4. Replace `$app.name` inside only the moved code with `appName`; this preserves the value `gala`.
5. Append this exact function footer after the distribution declaration:

```ts
  return {
    staticAssetsBucket,
    staticAssetsDistribution,
    staticAssetResponseHeaders,
  };
}

export type AssetResources = ReturnType<typeof createAssets>;
```

6. In `sst.config.ts`, import `createStageContext` from `./config` and `createAssets` from `./assets`. Immediately after `const stage = $app.stage`, add:

```ts
const context = createStageContext(stage);
const assets = createAssets(context);
```

7. Replace downstream static references with `assets.staticAssetsBucket`, `assets.staticAssetsDistribution`, and `assets.staticAssetResponseHeaders` as applicable.

- [ ] **Step 4: Run compile and contracts and verify GREEN**

Run:

```bash
cd infra && npm run check
cd .. && ruby scripts/ops/test-sst-dev-runtime-contracts.rb
```

Expected: zero-exit TypeScript check and `PASS sst dev runtime contracts`.

- [ ] **Step 5: Verify logical names were not duplicated or renamed**

Run:

```bash
rg -n '"GalaMediaBucket"|"GalaStaticAssets"|"GalaStaticAssetResponseHeaders"|"GalaStaticAssetsDistribution"' infra --glob '*.ts' --glob '!infra/test/**' --glob '!infra/.sst/**'
```

Expected: each logical name appears exactly once, all in `infra/assets.ts`.

- [ ] **Step 6: Commit the asset extraction**

```bash
git add infra/assets.ts infra/sst.config.ts scripts/ops/test-sst-dev-runtime-contracts.rb
git commit -m "Extract SST asset resources"
```

---

### Task 5: Extract the existing platform resources and use live capacity

**Files:**
- Create: `infra/platform.ts`
- Modify: `infra/sst.config.ts`

**Interfaces:**
- Consumes: `StageContext`
- Produces: `createPlatform(context) -> PlatformResources`
- Produces fields: `vpc`, `cluster`, `database`, `cache`, `databaseUrl`, `redisUrl`

- [ ] **Step 1: Add a failing platform-module assertion**

Append to the Ruby contract:

```ruby
assert("infra/platform.ts: durable AWS foundation must have a focused module") do
  infra_paths.any? { |path| path.end_with?("/infra/platform.ts") }
end
```

- [ ] **Step 2: Run the contract and verify RED**

Run:

```bash
ruby scripts/ops/test-sst-dev-runtime-contracts.rb
```

Expected: FAIL with `durable AWS foundation must have a focused module`.

- [ ] **Step 3: Create the platform wrapper and move the exact current block**

Create `infra/platform.ts`:

```ts
import type { StageContext } from "./config";

const encodeUriComponent = (value: unknown) =>
  $resolve([value]).apply((resolvedValues) =>
    encodeURIComponent(`${resolvedValues[0] ?? ""}`),
  );

export function createPlatform(context: StageContext) {
  const { isProduction, capacity } = context;
  const bastionAmi = isProduction
    ? "ami-0a2a049c945b84826"
    : "ami-08c28b6151a0ba92f";
```

Perform the move mechanically:

1. Cut from the existing `const vpc = new sst.aws.Vpc` through the `redisUrl` declaration.
2. Paste the VPC, cluster, database, cache, and URL declarations immediately after `bastionAmi`.
3. Keep the two approved AMI IDs byte-for-byte unchanged.
4. Replace database `instance` with `capacity.databaseClass`.
5. Replace database `storage` with `capacity.databaseStorage`. This intentionally changes source production storage from 50 GB to the verified live 20 GB baseline and prevents an accidental increase.
6. Append this exact footer after the `redisUrl` declaration:

```ts
  return { vpc, cluster, database, cache, databaseUrl, redisUrl };
}

export type PlatformResources = ReturnType<typeof createPlatform>;
```

7. In `sst.config.ts`, call `const platform = createPlatform(context)` and replace downstream references with destructuring:

```ts
const { vpc, cluster, database, cache, databaseUrl, redisUrl } = platform;
```

- [ ] **Step 4: Run tests and compile and verify GREEN**

Run:

```bash
cd infra && npm test && npm run check
cd .. && ruby scripts/ops/test-sst-dev-runtime-contracts.rb
```

Expected: all Node tests pass, TypeScript exits zero, and the Ruby contract passes.

- [ ] **Step 5: Verify platform logical-name uniqueness**

Run:

```bash
rg -n '"GalaVpc"|"GalaCluster"|"GalaDatabase"|"GalaCache"' infra --glob '*.ts' --glob '!infra/test/**' --glob '!infra/.sst/**'
```

Expected: each constructor name appears exactly once in `infra/platform.ts`.

- [ ] **Step 6: Commit the platform extraction**

```bash
git add infra/platform.ts infra/sst.config.ts scripts/ops/test-sst-dev-runtime-contracts.rb
git commit -m "Extract SST platform resources"
```

---

### Task 6: Extract runtime resources and reduce `sst.config.ts` to dispatch

**Files:**
- Create: `infra/runtime.ts`
- Create: `infra/stages/dev.ts`
- Create: `infra/stages/production.ts`
- Create: `infra/stages/index.ts`
- Modify: `infra/sst.config.ts`

**Interfaces:**
- Consumes: `createRuntime(context, platform, assets)`
- Produces: the existing SST output object without key changes.
- Produces: `runStage(context) -> ReturnType<typeof createRuntime>` for dev and production only in phase one.

- [ ] **Step 1: Add failing stage/runtime module assertions**

Append to the Ruby contract:

```ruby
assert("infra runtime and durable stage modules must exist") do
  %w[
    infra/runtime.ts
    infra/stages/dev.ts
    infra/stages/production.ts
    infra/stages/index.ts
  ].all? { |suffix| infra_paths.any? { |path| path.end_with?(suffix) } }
end
```

- [ ] **Step 2: Run the contract and verify RED**

Run:

```bash
ruby scripts/ops/test-sst-dev-runtime-contracts.rb
```

Expected: FAIL with `runtime and durable stage modules must exist`.

- [ ] **Step 3: Create the runtime wrapper and move all remaining resources**

Create `infra/runtime.ts` with the exact public boundary:

```ts
import type { AssetResources } from "./assets";
import type { StageContext } from "./config";
import type { PlatformResources } from "./platform";

export function createRuntime(
  context: StageContext,
  platform: PlatformResources,
  assets: AssetResources,
) {
  const {
    appName,
    stage,
    isProduction,
    capacity,
    releaseId,
    appCdnName,
    rootDomain,
    devDomain,
    devWildcardDomain,
    sharedRouterDistributionId,
    previewHost,
    routePreviewHost,
    customDomainEnabled,
    cloudflareProxy,
    cloudflareZoneId,
    assetReleasePrefix,
    baseUrl,
    forceSsl,
    mediaBucketName,
    staticAssetsBucketName,
    appImageUri,
    containerArchitecture,
    productionDockerfile,
    releaseVersion,
    previewPrNumber,
    githubRunId,
    githubSha,
    release,
    releaseUrl,
  } = context;
  const { vpc, cluster, database, cache, databaseUrl, redisUrl } = platform;
  const { staticAssetsDistribution } = assets;
```

Perform one mechanical move with these exact anchors:

1. Move `trimSecretValue` and `compactRuntimeEnvironment` into `runtime.ts` as private helpers.
2. Move `GalaBrowserCompressionHeaders` into `runtime.ts` unchanged.
3. Move from `const GOOGLE_SECRET_KEYS = [` through the current final output object into `createRuntime`; retain that output object's closing brace as the `createRuntime` function's closing brace.
4. Do not move VPC/cluster/database/cache declarations or static asset declarations already extracted.
5. Replace `$app.name` inside the moved code with `appName`.
6. Replace current conditional service CPU, memory, and min/max values with the equivalent live table values:

```ts
cpu: capacity.web.cpu,
memory: capacity.web.memory,
scaling: {
  min: capacity.web.min,
  max: capacity.web.max,
  cpuUtilization: 70,
  memoryUtilization: 80,
},
```

and:

```ts
cpu: capacity.worker.cpu,
memory: capacity.worker.memory,
scaling: {
  min: capacity.worker.min,
  max: capacity.worker.max,
  cpuUtilization: 70,
  memoryUtilization: 80,
},
```

7. Build `railsContainerImage` with `productionDockerfile` instead of reading `process.env`.
8. Populate Rails runtime metadata from the corresponding context fields; preserve existing environment variable names and values.
9. Keep every resource logical name and returned output key unchanged.

- [ ] **Step 4: Add the durable stage composers**

Create `infra/stages/dev.ts`:

```ts
import { createAssets } from "../assets";
import type { StageContext } from "../config";
import { createPlatform } from "../platform";
import { createRuntime } from "../runtime";

export function runDev(context: StageContext) {
  if (context.target.kind !== "dev") throw new Error("runDev requires stage dev");
  const assets = createAssets(context);
  const platform = createPlatform(context);
  return createRuntime(context, platform, assets);
}
```

Create `infra/stages/production.ts`:

```ts
import { createAssets } from "../assets";
import type { StageContext } from "../config";
import { createPlatform } from "../platform";
import { createRuntime } from "../runtime";

export function runProduction(context: StageContext) {
  if (context.target.kind !== "production") {
    throw new Error("runProduction requires stage production");
  }
  const assets = createAssets(context);
  const platform = createPlatform(context);
  return createRuntime(context, platform, assets);
}
```

Create `infra/stages/index.ts`:

```ts
import type { StageContext } from "../config";
import { runDev } from "./dev";
import { runProduction } from "./production";

export function runStage(context: StageContext) {
  if (context.target.kind === "dev") return runDev(context);
  if (context.target.kind === "production") return runProduction(context);
  throw new Error(`stage ${context.stage} is classified but not provisioned in phase one`);
}
```

- [ ] **Step 5: Replace the monolith with the phase-one dispatcher**

Replace `infra/sst.config.ts` with:

```ts
/// <reference path="./.sst/platform/config.d.ts" />

import { classifyStage, createStageContext } from "./config";
import { runStage } from "./stages";

export default $config({
  app(input) {
    const target = classifyStage(input?.stage || "");
    const customDomainEnabled = process.env.GALA_ENABLE_CUSTOM_DOMAIN !== "false";

    return {
      name: "gala",
      home: "aws",
      // Preserve the deployed phase-one policy until the clean structural
      // diff is accepted. Durable retain-all/protect is activated separately.
      removal: target.kind === "production" ? "retain" : "remove",
      providers: {
        aws: { region: "us-west-2" },
        ...(customDomainEnabled ? { cloudflare: "6.13.0" } : {}),
      },
    };
  },
  async run() {
    return runStage(createStageContext($app.stage));
  },
});
```

This temporary app policy is deliberate: it isolates structural equivalence from protection metadata. Do not activate `statePolicy` until the final clean-diff checkpoint.

- [ ] **Step 6: Run tests and compile and verify GREEN**

Run:

```bash
cd infra && npm test && npm run check
cd .. && ruby scripts/ops/test-sst-dev-runtime-contracts.rb
```

Expected: all Node tests pass, TypeScript exits zero, and all existing runtime contracts pass.

- [ ] **Step 7: Verify the dispatcher and logical names**

Run:

```bash
wc -l infra/sst.config.ts
rg -n 'new (sst|aws)\.' infra/sst.config.ts
rg --no-filename -o '"Gala[A-Za-z0-9]+"' infra/{assets,platform,runtime}.ts | sort | uniq -d
```

Expected: `sst.config.ts` is under 35 lines, contains no resource constructors, and the duplicate logical-name command prints nothing.

- [ ] **Step 8: Commit runtime extraction and dispatch**

```bash
git add infra/runtime.ts infra/stages infra/sst.config.ts scripts/ops/test-sst-dev-runtime-contracts.rb
git commit -m "Split SST runtime into stage modules"
```

---

### Task 7: Enforce module boundaries and activate durable safety policy

**Files:**
- Create: `scripts/ops/test-sst-module-boundaries.rb`
- Modify: `infra/sst.config.ts`
- Modify: `.github/workflows/ci.yml`
- Modify: `scripts/ops/test-workflow-architecture-defaults.rb`

**Interfaces:**
- Produces: fail-closed repository contract for module ownership and import-time purity.
- Activates: `protect: true` and `removal: "retain-all"` for dev and production source policy.

- [ ] **Step 1: Write the failing module-boundary contract**

Create `scripts/ops/test-sst-module-boundaries.rb`:

```ruby
#!/usr/bin/env ruby
# frozen_string_literal: true

ROOT = File.expand_path("../..", __dir__)

def read(path)
  File.read(File.join(ROOT, path))
end

def assert(message)
  raise message unless yield
end

dispatcher = read("infra/sst.config.ts")
config = read("infra/config.ts")
assets = read("infra/assets.ts")
platform = read("infra/platform.ts")
runtime = read("infra/runtime.ts")
stages = Dir.glob(File.join(ROOT, "infra/stages/*.ts")).sort.map { |path| File.read(path) }.join("\n")

assert("sst.config.ts must remain under 35 lines") { dispatcher.lines.length < 35 }
assert("sst.config.ts must not construct resources") { !dispatcher.match?(/new\s+(?:sst|aws)\./) }
assert("resource modules must not construct resources at import time") do
  [assets, platform, runtime].all? do |source|
    first_constructor = source.index(/new\s+(?:sst|aws)\./)
    function_start = source.index(/export function create/)
    first_constructor && function_start && first_constructor > function_start
  end
end
assert("only config.ts may read deploy environment variables") do
  [assets, platform, runtime, stages].none? { |source| source.include?("process.env") } &&
    config.include?("process.env")
end
assert("asset resources must have one owner") do
  assets.scan(/new sst\.aws\.Bucket\("GalaStaticAssets"/).length == 1 &&
    assets.scan(/new aws\.cloudfront\.Distribution\(\s*"GalaStaticAssetsDistribution"/).length == 1
end
assert("platform resources must have one owner") do
  %w[GalaVpc GalaCluster GalaDatabase GalaCache].all? do |name|
    platform.scan(/"#{name}"/).length == 1
  end
end
assert("runtime services and tasks must have one owner") do
  %w[GalaWeb GalaWorker GalaMigrate GalaSeedDatabase GalaRefreshIndices GalaWeeklyReport].all? do |name|
    runtime.scan(/new sst\.aws\.(?:Service|Task)\("#{name}"/).length == 1
  end
end

puts "PASS sst module boundaries"
```

- [ ] **Step 2: Run the boundary contract and verify RED on environment ownership**

Run:

```bash
ruby scripts/ops/test-sst-module-boundaries.rb
```

Expected: FAIL because `sst.config.ts` still reads `process.env.GALA_ENABLE_CUSTOM_DOMAIN`.

- [ ] **Step 3: Move provider environment parsing into `config.ts` and activate policy**

Add to `infra/config.ts`:

```ts
export function appSettings(
  stage: string,
  env: Environment = process.env,
) {
  const target = classifyStage(stage);
  const policy = statePolicy(target);
  return {
    name: "gala" as const,
    home: "aws" as const,
    ...policy,
    providers: {
      aws: { region: "us-west-2" as const },
      ...(env.GALA_ENABLE_CUSTOM_DOMAIN !== "false"
        ? { cloudflare: "6.13.0" }
        : {}),
    },
  };
}
```

Replace the `app` callback in `infra/sst.config.ts`:

```ts
import { appSettings, createStageContext } from "./config";

export default $config({
  app(input) {
    return appSettings(input?.stage || "");
  },
  async run() {
    return runStage(createStageContext($app.stage));
  },
});
```

Add Node assertions that `appSettings("dev", {})` and `appSettings("production", {})` return `protect: true`, `removal: "retain-all"`, AWS region `us-west-2`, and no Cloudflare provider when `GALA_ENABLE_CUSTOM_DOMAIN` is `false`.

- [ ] **Step 4: Add the new checks to non-mutating CI**

In `.github/workflows/ci.yml`, extend the existing `contracts` command so its SST portion is exactly:

```bash
cd infra && npm test && npm run check
cd ..
ruby scripts/ops/test-sst-dev-runtime-contracts.rb
ruby scripts/ops/test-sst-module-boundaries.rb
```

In `scripts/ops/test-workflow-architecture-defaults.rb`, assert that the contracts suite contains all four command fragments:

```ruby
%w[
  npm\ test
  npm\ run\ check
  test-sst-dev-runtime-contracts.rb
  test-sst-module-boundaries.rb
].each do |fragment|
  assert("ci.yml: contracts must run #{fragment.tr('\\', '')}") do
    ci_text.include?(fragment.tr("\\", ""))
  end
end
```

- [ ] **Step 5: Run all local contracts and verify GREEN**

Run:

```bash
cd infra && npm test && npm run check
cd ..
ruby scripts/ops/test-sst-dev-runtime-contracts.rb
ruby scripts/ops/test-sst-module-boundaries.rb
ruby scripts/ops/test-workflow-architecture-defaults.rb
```

Expected: all Node tests pass and all three Ruby scripts print `PASS`.

- [ ] **Step 6: Commit module boundaries and durable policy**

```bash
git add infra/config.ts infra/test/config.test.ts infra/sst.config.ts scripts/ops/test-sst-module-boundaries.rb .github/workflows/ci.yml scripts/ops/test-workflow-architecture-defaults.rb
git commit -m "Enforce SST module ownership"
```

---

### Task 8: Document operation and prove non-mutating structural equivalence

**Files:**
- Modify: `infra/README.md`
- Create: `docs/ops/infra-stacks.md`
- Modify: `docs/ops/workflows/ci.md`

**Interfaces:**
- Documents: module ownership, live capacity edit point, stage policy, and no-refresh diff rules.
- Produces: reviewed dev and production diff artifacts; no cloud apply.

- [ ] **Step 1: Write the operator documentation**

Add this directory map to `infra/README.md`:

```text
sst.config.ts       app policy and stage dispatch only
config.ts           stage parsing, deploy environment, and capacity
stages/dev.ts       durable dev composition
stages/production.ts durable production composition
platform.ts         VPC, bastion, RDS, cache, and ECS cluster
assets.ts           shared media lookup, static bucket, and static CDN
runtime.ts          secrets, services, tasks, routes, cron, and outputs
```

Document that an RDS class change edits only `DURABLE_CAPACITY`; allocated storage may increase but cannot decrease in place. Document the verified live CPU, memory, min, and max values. State that routine code releases are not yet changed by this phase.

Create `docs/ops/infra-stacks.md` with these exact headings:

```markdown
# Gala infrastructure stacks

## Stable platform versus rapid release
## Stage ownership
## External Heroku-shared resources
## Capacity changes
## Structural refactor safety diff
## Stop conditions
## Follow-on phases
```

Under stop conditions, list S3, SES, ALB, CloudFront, log-group, autoscaling, VPC, RDS, Redis/Valkey, bastion, router, and cross-stage operations. Explain that phase one performs no apply.

Update `docs/ops/workflows/ci.md` to list `npm test`, `npm run check`, and `test-sst-module-boundaries.rb` as non-mutating contracts.

- [ ] **Step 2: Run documentation and workflow contracts**

Run:

```bash
ruby scripts/ops/test-workflow-architecture-defaults.rb
git diff --check
```

Expected: workflow contracts pass and `git diff --check` prints nothing.

- [ ] **Step 3: Run the full phase-one local verification suite**

Run:

```bash
cd infra && npm ci && npm test && npm run check
cd ..
ruby scripts/ops/test-sst-dev-runtime-contracts.rb
ruby scripts/ops/test-sst-module-boundaries.rb
ruby scripts/ops/test-workflow-architecture-defaults.rb
ruby scripts/ops/test-deploy-sst-architecture-guard.sh
```

Expected: npm succeeds, Node tests pass, and every contract script prints its `PASS` result.

- [ ] **Step 4: Produce authenticated non-refreshing dev and production diffs**

Load the repository's ignored Cloudflare credentials through the documented `direnv` setup. From `infra/`, run each stage with local database/cache variables removed:

```bash
direnv exec .. env \
  -u DATABASE_URL \
  -u REDIS_HOST \
  -u REDIS_URL \
  -u CACHE_URL \
  AWS_PROFILE=gala \
  AWS_REGION=us-west-2 \
  AWS_DEFAULT_REGION=us-west-2 \
  npx sst diff --stage dev
```

and:

```bash
direnv exec .. env \
  -u DATABASE_URL \
  -u REDIS_HOST \
  -u REDIS_URL \
  -u CACHE_URL \
  AWS_PROFILE=gala \
  AWS_REGION=us-west-2 \
  AWS_DEFAULT_REGION=us-west-2 \
  npx sst diff --stage production
```

Do not run refresh before either diff. Save the complete logs as local review artifacts outside Git.

Expected acceptance:

- No resource create, delete, replace, import, or provider refresh caused by module extraction.
- No RDS storage increase; source now matches the live 20 GB production allocation.
- No S3 or SES operation.
- No VPC, database, cache, cluster, ALB, CloudFront, log-group, autoscaling, bastion, router, route, secret, task-definition, service, task, or cron mutation attributable to the refactor.
- App protection/removal metadata may reflect the approved durable `protect: true` and `retain-all` policy, but it must not produce an AWS provider mutation.
- Existing release-environment drift unrelated to this refactor is recorded separately and is not accepted as a structural change.

If either diff contains an unexpected operation, stop. Do not commit an “acceptance” note, do not apply, and diagnose the first differing resource before continuing.

- [ ] **Step 5: Commit documentation after clean diff review**

```bash
git add infra/README.md docs/ops/infra-stacks.md docs/ops/workflows/ci.md
git commit -m "Document SST stable platform modules"
```

- [ ] **Step 6: Run final repository verification and inspect scope**

Run:

```bash
git diff --check HEAD~8..HEAD
git status --short
git log --oneline -8
```

Expected: no whitespace errors; only the user's pre-existing unrelated worktree paths remain unstaged; the phase contains small, reviewable commits corresponding to Tasks 1–8.

---

## Phase-one completion gate

Phase one is complete only when:

- all local tests and contracts pass;
- `sst.config.ts` is under 35 lines and contains no resources;
- all resource logical names remain unique and unchanged;
- source capacity matches live RDS, ECS task, and autoscaling values;
- dev and production authenticated diffs contain no AWS mutation caused by the refactor;
- no deploy, refresh, remove, state edit, S3 mutation, or SES mutation occurred;
- documentation explains the new structure and capacity edit path.

After this gate, write the separate canonical-release implementation plan. Do not combine release behavior, preview migration, shared-resource reconciliation, or CloudFront deletion into the phase-one branch diff.
