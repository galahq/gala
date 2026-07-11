import assert from "node:assert/strict";
import test from "node:test";

import {
  DURABLE_CAPACITY,
  GALA,
  capacityFor,
  classifyStage,
  createStageContext,
  publicHostFor,
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
