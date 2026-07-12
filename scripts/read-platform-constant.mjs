#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const constants = JSON.parse(readFileSync(resolve(root, "infra/platform.constants.json"), "utf8"));
const required = ["appName", "awsAccountId", "awsRegion", "rootDomain", "architecture"];
for (const key of required) {
  if (typeof constants[key] !== "string" || constants[key].length === 0) {
    throw new Error(`invalid platform constant: ${key}`);
  }
}

const derived = {
  devDomain: `dev.${constants.rootDomain}`,
  devWildcardDomain: `*.dev.${constants.rootDomain}`,
  containerPlatform: `linux/${constants.architecture}`,
  containerArchitectureUpper: constants.architecture.toUpperCase(),
};
const allowed = new Set([
  "appName", "awsAccountId", "awsRegion", "rootDomain", "architecture",
  "mediaBucketName", "staticAssetsBucketName", "cloudflareZoneId",
  "cloudflareZoneName", "sharedRouterDistributionId", "devVpcId", "devClusterId",
  "devCloudMapNamespaceId", "devCloudMapNamespaceName",
  "devStaticAssetsDistributionId", "devStaticAssetsDistributionDomain",
  ...Object.keys(derived),
]);
const key = process.argv[2];
if (process.argv.length !== 3 || !allowed.has(key)) {
  throw new Error("usage: read-platform-constant.mjs <fixed-scalar-key>");
}
const value = Object.hasOwn(derived, key) ? derived[key] : constants[key];
if (typeof value !== "string" || value.length === 0 || value.includes("\n")) {
  throw new Error(`platform constant is not a scalar: ${key}`);
}
process.stdout.write(`${value}\n`);
