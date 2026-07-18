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
- Do not implement image promotion, release rollback, or canonical `vN` artifacts in this plan. Isolate the current release/preview environment bridge so the follow-on plans can delete it without touching platform modules.
- ARM64 is the only supported container architecture. Keep it as a source invariant; do not add an architecture type or deploy-time override.
- Treat domain names, bucket names, Dockerfile, cache policy, and provider behavior as reviewed source constants, not environment variables.
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

- Create `infra/config.ts`: fixed Gala platform constants, pure stage classifier, live capacity table, deterministic hostname helpers, and a tiny stage context.
- Create `infra/test/config.test.ts`: Node tests for stage parsing, live capacity, fixed invariants, and deterministic hostnames.
- Create `infra/assets.ts`: current media/static bucket lookup, static bucket component, response policy, and static distribution.
- Create `infra/platform.ts`: current VPC, bastion, cluster, Postgres, Redis/Valkey, and generated connection URLs.
- Create `infra/runtime.ts`: current secrets, SSM parameters, ECS services/tasks, app edge distribution, router routes, cron, outputs, and the explicitly temporary phase-one release/preview compatibility reader.
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

### Task 2: Define fixed platform constants and a tiny stage context

**Files:**
- Modify: `infra/config.ts`
- Modify: `infra/test/config.test.ts`

**Interfaces:**
- Produces: `GALA` source constants for reviewed platform facts.
- Produces: `createStageContext(stage: string) -> { target, capacity }`.
- Produces: `publicHostFor(target) -> string | undefined`.
- Does not read `process.env` and does not create a generic `Environment` type.

- [ ] **Step 1: Add failing invariant and deterministic-host tests**

Extend the existing `../config.ts` import to include `createStageContext`:

```ts
import {
  DURABLE_CAPACITY,
  GALA,
  capacityFor,
  classifyStage,
  createStageContext,
  publicHostFor,
  statePolicy,
} from "../config.ts";
```

Then append these tests:

```ts

test("keeps Gala platform facts fixed in source", () => {
  assert.deepEqual(GALA, {
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
    currentSharedRouterDistributionId: "E3FF4TTU9Q4XTY",
  });
});

test("builds only target and capacity into stage context", () => {
  const context = createStageContext("dev");
  assert.deepEqual(Object.keys(context).sort(), ["capacity", "target"]);
  assert.deepEqual(context.target, { kind: "dev", stage: "dev", durable: true });
  assert.equal(context.capacity, DURABLE_CAPACITY.dev);
});

test("derives public hosts only from validated stage identity", () => {
  assert.equal(publicHostFor(classifyStage("production")), "learngala.dev");
  assert.equal(publicHostFor(classifyStage("dev")), "dev.learngala.dev");
  assert.equal(publicHostFor(classifyStage("pr-790")), "pr-790.dev.learngala.dev");
  assert.equal(publicHostFor(classifyStage("local-nathan")), undefined);
});
```

- [ ] **Step 2: Run the context tests and verify RED**

Run:

```bash
cd infra && npm test
```

Expected: FAIL because `GALA`, `createStageContext`, and `publicHostFor` are not exported.

- [ ] **Step 3: Implement the fixed configuration contract**

Append these constants and helpers to `infra/config.ts`:

```ts
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
```

- [ ] **Step 4: Run tests and TypeScript check and verify GREEN**

Run:

```bash
cd infra && npm test && npm run check
```

Expected: seven passing Node subtests and a zero-exit TypeScript check. `rg -n 'process\.env|ContainerArchitecture' infra/config.ts` returns no matches.

- [ ] **Step 5: Commit fixed platform configuration**

```bash
git add infra/config.ts infra/test/config.test.ts
git commit -m "Fix SST platform configuration"
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
import { GALA, type StageContext } from "./config";

export function createAssets(context: StageContext) {
  const { target } = context;
  const stage = target.stage;
  const isProduction = target.kind === "production";
  const {
    appName,
    mediaBucketName,
    staticAssetsBucketName,
    immutableStaticCacheControl,
  } = GALA;
  // Matches current ownership during phase one. The later reconciliation
  // makes production the sole owner and converts dev to a plain lookup.
  const importExistingStaticAssetsBucket = !isProduction;
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
  const { target, capacity } = context;
  const isProduction = target.kind === "production";
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
import { GALA, publicHostFor, type StageContext } from "./config";
import type { PlatformResources } from "./platform";

// Phase-one compatibility only. Keeping these values byte-for-byte stable is
// what makes the module extraction a no-op. Canonical release and preview
// isolation delete this reader instead of promoting it into public config.
function readLegacyRuntimeBridge(context: StageContext) {
  const { target } = context;
  const stage = target.stage;
  const isProduction = target.kind === "production";
  const releaseId = (
    process.env.GALA_RELEASE_ID ?? process.env.GITHUB_RUN_ID ?? `${stage}.local`
  ).trim().replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 96);
  const previewHost = process.env.GALA_PREVIEW_HOST?.trim() || publicHostFor(target)!;
  const explicitBaseUrl = process.env.GALA_BASE_URL ?? process.env.ALB_BASE_URL ?? "";

  return {
    releaseId,
    assetReleasePrefix: (process.env.GALA_ASSET_PREFIX || `releases/${stage}/${releaseId}`)
      .replace(/^\/+|\/+$/g, ""),
    previewHost,
    baseUrl: explicitBaseUrl || `https://${previewHost}`,
    routePreviewHost: process.env.GALA_ROUTE_PREVIEW_HOST === "true",
    sharedRouterDistributionId:
      process.env.GALA_ROUTER_DISTRIBUTION_ID?.trim() ||
      (isProduction ? "" : GALA.currentSharedRouterDistributionId),
    appImageUri:
      process.env.GALA_APP_IMAGE_URI?.trim() ||
      process.env.GALA_WEB_IMAGE_URI?.trim() ||
      "",
    releaseVersion: process.env.GALA_RELEASE_VERSION?.trim() || "v2.9.9",
    previewPrNumber: process.env.GALA_PREVIEW_PR_NUMBER,
    githubRunId: process.env.GITHUB_RUN_ID,
    githubSha: process.env.GITHUB_SHA,
    release: process.env.RELEASE?.trim() || releaseId,
    releaseUrl: process.env.GALA_RELEASE_URL,
    cloudflareZoneId: process.env.CLOUDFLARE_ZONE_ID?.trim(),
  };
}

export function createRuntime(
  context: StageContext,
  platform: PlatformResources,
  assets: AssetResources,
) {
  const { target, capacity } = context;
  const stage = target.stage;
  const isProduction = target.kind === "production";
  const {
    appName,
    rootDomain,
    devDomain,
    devWildcardDomain,
    mediaBucketName,
    staticAssetsBucketName,
    containerArchitecture,
    productionDockerfile,
    cloudflareProxy,
  } = GALA;
  const appCdnName = isProduction
    ? "GalaAppDistribution"
    : "GalaAppDistributionDev";
  const {
    releaseId,
    sharedRouterDistributionId,
    previewHost,
    routePreviewHost,
    cloudflareZoneId,
    assetReleasePrefix,
    baseUrl,
    appImageUri,
    releaseVersion,
    previewPrNumber,
    githubRunId,
    githubSha,
    release,
    releaseUrl,
  } = readLegacyRuntimeBridge(context);
  const forceSsl = true;
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

7. Build `railsContainerImage` with fixed `GALA.productionDockerfile` and set every ECS runtime platform to fixed `GALA.containerArchitecture` (`arm64`). Remove architecture validation and never read `GALA_CONTAINER_ARCHITECTURE`.
8. Custom domains remain enabled and Cloudflare proxying remains fixed `false`; remove the conditional resource branch but preserve the resulting resources. `CLOUDFLARE_ZONE_ID` is read only as provider identity metadata during the no-op phase.
9. Populate Rails runtime metadata from `readLegacyRuntimeBridge`; preserve existing environment variable names and values during this phase only.
10. Keep every resource logical name and returned output key unchanged.

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
  throw new Error(
    `stage ${context.target.stage} is classified but not provisioned in phase one`,
  );
}
```

- [ ] **Step 5: Replace the monolith with the phase-one dispatcher**

Replace `infra/sst.config.ts` with:

```ts
/// <reference path="./.sst/platform/config.d.ts" />

import { GALA, classifyStage, createStageContext } from "./config";
import { runStage } from "./stages";

export default $config({
  app(input) {
    const target = classifyStage(input?.stage || "");

    return {
      name: GALA.appName,
      home: "aws",
      // Preserve the deployed phase-one policy until the clean structural
      // diff is accepted. Durable retain-all/protect is activated separately.
      removal: target.kind === "production" ? "retain" : "remove",
      providers: {
        aws: { region: GALA.awsRegion },
        cloudflare: "6.13.0",
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
assert("stable configuration and platform modules must not read deploy environment") do
  [dispatcher, config, assets, platform, stages].none? do |source|
    source.include?("process.env")
  end
end
legacy_runtime_keys = runtime.scan(/process\.env\.([A-Z0-9_]+)/).flatten.uniq.sort
assert("runtime may read only the documented phase-one compatibility bridge") do
  legacy_runtime_keys == %w[
    ALB_BASE_URL
    CLOUDFLARE_ZONE_ID
    GALA_APP_IMAGE_URI
    GALA_ASSET_PREFIX
    GALA_BASE_URL
    GALA_PREVIEW_HOST
    GALA_PREVIEW_PR_NUMBER
    GALA_RELEASE_ID
    GALA_RELEASE_URL
    GALA_RELEASE_VERSION
    GALA_ROUTER_DISTRIBUTION_ID
    GALA_ROUTE_PREVIEW_HOST
    GALA_WEB_IMAGE_URI
    GITHUB_RUN_ID
    GITHUB_SHA
    RELEASE
  ].sort
end
assert("fixed platform facts must not be environment knobs") do
  forbidden = %w[
    GALA_CONTAINER_ARCHITECTURE
    GALA_DOMAIN_NAME
    GALA_ENABLE_CUSTOM_DOMAIN
    GALA_CLOUDFLARE_PROXY
    GALA_IMPORT_STATIC_ASSETS_BUCKET
    GALA_PRODUCTION_DOCKERFILE
    GALA_STATIC_ASSETS_BUCKET
  ]
  forbidden.none? { |name| [dispatcher, config, assets, platform, runtime, stages].join.include?(name) }
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

- [ ] **Step 2: Run the boundary contract and verify RED on the provider toggle**

Run:

```bash
ruby scripts/ops/test-sst-module-boundaries.rb
```

Expected: FAIL until the dispatcher no longer reads `GALA_ENABLE_CUSTOM_DOMAIN` and the runtime reader contains exactly the documented compatibility keys.

- [ ] **Step 3: Add fixed app settings and activate durable policy**

Add to `infra/config.ts`:

```ts
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

Add Node assertions that `appSettings("dev")` and `appSettings("production")` return `protect: true`, `removal: "retain-all"`, AWS region `us-west-2`, and the Cloudflare provider. Also assert that `appSettings.length === 1`; app settings accept no environment override object.

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
config.ts           fixed platform facts, stage parsing, and capacity
stages/dev.ts       durable dev composition
stages/production.ts durable production composition
platform.ts         VPC, bastion, RDS, cache, and ECS cluster
assets.ts           shared media lookup, static bucket, and static CDN
runtime.ts          secrets, services, tasks, routes, cron, and outputs
```

Document that an RDS class change edits only `DURABLE_CAPACITY`; allocated storage may increase but cannot decrease in place. Document the verified live CPU, memory, min, and max values. State that routine code releases are not yet changed by this phase. Include an environment-variable table that distinguishes provider credentials from the temporary runtime compatibility bridge, identifies each bridge variable's deletion phase, and states that ARM64, domains, bucket names, Dockerfile, cache policy, and provider behavior are source invariants.

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
GALA_TEST_DEV_HTTPS_BASE_URL=https://dev.example.test \
  bash scripts/ops/test-deploy-sst-architecture-guard.sh
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

Supply the currently deployed image and release metadata when reproducing these
commands. Omitting those values causes SST to build a local image and creates
false task-definition drift. Preserve the active preview host and route flag on
dev so a structural diff cannot imply preview-route turnover.

Expected acceptance:

- No resource create, delete, replace, import, or provider refresh caused by module extraction.
- No RDS storage change; source preserves the existing 50 GB production allocation.
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
- `StageContext` contains only `target` and `capacity`;
- ARM64, domains, bucket names, Dockerfile, cache policy, and provider behavior are fixed source values rather than deploy environment knobs;
- only the documented compatibility keys are read, and only inside `runtime.ts`;
- all resource logical names remain unique and unchanged;
- source capacity matches live RDS, ECS task, and autoscaling values;
- dev and production authenticated diffs contain no AWS mutation caused by the refactor;
- no deploy, refresh, remove, state edit, S3 mutation, or SES mutation occurred;
- documentation explains the new structure and capacity edit path.

After this gate, write the separate canonical-release implementation plan. Do not combine release behavior, preview migration, shared-resource reconciliation, or CloudFront deletion into the phase-one branch diff.
