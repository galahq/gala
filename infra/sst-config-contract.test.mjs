import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./sst.config.ts", import.meta.url), "utf8");
const productionConfig = readFileSync(
  new URL("../config/environments/production.rb", import.meta.url),
  "utf8",
);
const ciWorkflow = readFileSync(
  new URL("../.github/workflows/ci.yml", import.meta.url),
  "utf8",
);
const deployWorkflow = readFileSync(
  new URL("../.github/workflows/deploy.yml", import.meta.url),
  "utf8",
);

test("production Docker builds receive the required base image", () => {
  assert.match(source, /process\.env\.GALA_PRODUCTION_BASE_IMAGE/);
  assert.match(source, /GALA_PRODUCTION_BASE_IMAGE:\s*productionBaseImage/);
});

test("both application buckets remain external to SST", () => {
  assert.match(source, /S3_BUCKET:\s*platform\.storage\.mediaBucket/);
  assert.doesNotMatch(source, /(?:new\s+)?sst\.aws\.Bucket/);
  assert.doesNotMatch(source, /aws\.s3\.BucketV2(?:\.get)?/);
  assert.doesNotMatch(source, /aws\.cloudfront\.Distribution(?:\.get)?/);
  assert.doesNotMatch(source, /GalaStaticAssets/);
});

test("Rails serves image-bundled assets without release URLs", () => {
  assert.match(source, /RAILS_SERVE_STATIC_FILES:\s*"true"/);
  assert.doesNotMatch(source, /ASSET_HOST/);
  assert.doesNotMatch(source, /releases\/bootstrap/);
  assert.doesNotMatch(source, /GALA_STATIC_ASSETS_BUCKET/);
  assert.doesNotMatch(source, /GALA_RELEASE/);
});

test("ECS roles can access only the external media bucket", () => {
  assert.match(source, /actions:\s*\["s3:ListBucket"\]/);
  assert.match(source, /actions:\s*\["s3:GetObject",\s*"s3:PutObject"\]/);
  assert.match(source, /arn:aws:s3:::\$\{platform\.storage\.mediaBucket\}/);
  assert.doesNotMatch(source, /platform\.storage\.staticAssetsBucket/);
});

test("SST secrets write their plaintext value to SSM parameters", () => {
  assert.match(
    source,
    /secretNames\.map\(\(name\) => \[name, new sst\.Secret\(name\)\.value\]\)/,
  );
});

test("SES SMTP stays in SSM while PostHog stays out of the runtime", () => {
  assert.match(source, /"SES_SMTP_PASSWORD"/);
  assert.match(source, /"SES_SMTP_USERNAME"/);
  assert.doesNotMatch(source, /POSTHOG/);
});

test("SST Console owns PR-only preview stages", () => {
  assert.match(source, /console:\s*\{[\s\S]*autodeploy:\s*\{/);
  assert.match(source, /event\.type\s*===\s*"pull_request"/);
  assert.match(source, /stage:\s*`pr-\$\{event\.number\}`/);
  assert.doesNotMatch(source, /event\.type\s*===\s*"branch"/);
  assert.doesNotMatch(source, /event\.type\s*===\s*"tag"/);
});

test("CI runs only non-browser RSpec and Vitest suites", () => {
  assert.match(ciWorkflow, /run:\s*bundle exec rspec --tag '~type:feature'\s*$/m);
  assert.match(ciWorkflow, /run:\s*pnpm test\s*$/m);
  assert.doesNotMatch(
    ciWorkflow,
    /GITHUB_STEP_SUMMARY|upload-artifact|post-commit-status|playwright|smoke|sst\s+(?:diff|deploy)|suite-results|validation-report|statuses:\s*write/i,
  );
});

test("durable deploys invoke SST directly and never create previews", () => {
  assert.match(deployWorkflow, /on:\s*\n\s+workflow_dispatch:/);
  assert.match(deployWorkflow, /working-directory:\s*infra/);
  assert.match(deployWorkflow, /run:\s*npx sst deploy --stage "\$SST_STAGE"/);
  assert.doesNotMatch(
    deployWorkflow,
    /pull_request|preview|deploy-sst\.sh|user_data|GALA_EFFECTIVE_STAGE|gh pr comment/i,
  );
});

test("Rails trusts HTTPS terminated by the SST router", () => {
  assert.match(productionConfig, /config\.assume_ssl\s*=\s*FORCE_SSL/);
});
