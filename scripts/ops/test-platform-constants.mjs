#!/usr/bin/env node

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const constantsPath = join(root, "infra/platform.constants.json");
const mode = process.argv[2];
const expectedKeys = [
  "appName", "awsAccountId", "awsRegion", "rootDomain", "architecture",
  "mediaBucketName", "staticAssetsBucketName", "cloudflareZoneId",
  "cloudflareZoneName", "sharedRouterDistributionId", "devVpcId",
  "devClusterId", "devContainerSubnetIds", "devLoadBalancerSubnetIds",
  "devSecurityGroupIds", "devCloudMapNamespaceId", "devCloudMapNamespaceName",
  "devStaticAssetsDistributionId", "devStaticAssetsDistributionDomain",
];

function schema() {
  const data = JSON.parse(readFileSync(constantsPath, "utf8"));
  assert.deepEqual(Object.keys(data).sort(), expectedKeys.sort(), "canonical constants keys");
  assert.equal(data.appName, "gala");
  assert.match(data.awsAccountId, /^\d{12}$/);
  assert.equal(data.awsRegion, "us-west-2");
  assert.equal(data.rootDomain, "learngala.dev");
  assert.equal(data.architecture, "arm64");
  assert.equal(data.cloudflareZoneName, data.rootDomain);
  assert.equal(data.devCloudMapNamespaceName, "sst");
  assert.match(data.devVpcId, /^vpc-[0-9a-f]+$/);
  assert.match(data.devClusterId, /^arn:aws:ecs:/);
  assert.match(data.cloudflareZoneId, /^[0-9a-f]{32}$/);
  for (const key of ["devContainerSubnetIds", "devLoadBalancerSubnetIds", "devSecurityGroupIds"]) {
    assert.ok(Array.isArray(data[key]) && data[key].length > 0, `${key} must be non-empty`);
    assert.equal(new Set(data[key]).size, data[key].length, `${key} must be unique`);
  }
  const scalarCases = {
    awsRegion: "us-west-2", rootDomain: "learngala.dev", architecture: "arm64",
    devDomain: "dev.learngala.dev", devWildcardDomain: "*.dev.learngala.dev",
    containerPlatform: "linux/arm64", containerArchitectureUpper: "ARM64",
  };
  for (const [key, expected] of Object.entries(scalarCases)) {
    const value = execFileSync("node", [join(root, "scripts/read-platform-constant.mjs"), key], { encoding: "utf8" });
    assert.equal(value, `${expected}\n`, `${key} scalar output`);
  }
  let rejected = false;
  try { execFileSync("node", [join(root, "scripts/read-platform-constant.mjs"), "notAKey"], { stdio: "ignore" }); }
  catch { rejected = true; }
  assert.ok(rejected, "unknown scalar key must be rejected");
  console.log("PASS platform constants schema");
}

const excluded = (path) => /(^|\/)(\.git|\.work|node_modules|docs|test|tests|fixtures|generated)(\/|$)/.test(path) ||
  /(^|\/)(?:test[-_.]|[^/]+\.(?:test|spec)\.)/.test(path) ||
  path.endsWith("package-lock.json") || path.endsWith("infra/sst-env.d.ts") ||
  path === "infra/platform.constants.json";
function executableFiles(dir = root) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    const rel = relative(root, path);
    if (excluded(rel)) return [];
    if (entry.isDirectory()) return executableFiles(path);
    if (!entry.isFile()) return [];
    return /\.(?:[cm]?[jt]s|tsx|rb|sh|ya?ml|json)$/.test(path) || (statSync(path).mode & 0o111) ? [rel] : [];
  });
}
function inventory(enforce) {
  const patterns = ["us-west-2", "learngala.dev", "linux/arm64", "ARM64", "arm64"];
  const hits = [];
  for (const path of executableFiles()) {
    const source = readFileSync(join(root, path), "utf8");
    source.split("\n").forEach((line, index) => {
      if (patterns.some((literal) => line.includes(literal))) hits.push(`${path}:${index + 1}:${line.trim()}`);
    });
  }
  assert.ok(!hits.some((hit) => /(^|\/)test[^/]*:/.test(hit)), "test files must be excluded from literal inventory");
  console.log(JSON.stringify({ duplicateLiteralCount: hits.length, duplicates: hits }, null, 2));
  if (enforce && hits.length) process.exitCode = 1;
}

if (mode === "schema") schema();
else if (mode === "inventory") inventory(false);
else if (mode === "enforce") inventory(true);
else throw new Error("usage: test-platform-constants.mjs schema|inventory|enforce");
