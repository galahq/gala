# Simplified SST Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the multi-module SST layer and signed infrastructure plans with one declarative config, automatic dev-backed PR previews, and direct operator diff/deploy actions.

**Architecture:** `infra/sst.platform.json` is the one tracked source of non-secret platform values. `infra/sst.config.ts` imports it and owns every SST resource in four explicit stage cases. GitHub CI checks code only; `deploy.yml` deploys exact PR stages on updates and provides protected manual durable operations.

**Tech Stack:** SST 4.7, TypeScript, AWS ECS/Fargate/RDS/Valkey/S3/CloudFront, Cloudflare, GitHub Actions.

## Global Constraints

- Do not use the Heroku CLI.
- Never construct, import, replace, delete, or configure lifecycle behavior for `msc-gala` or SES.
- All non-secret platform values live in `infra/sst.platform.json`; existing SST Secrets/SSM remain the secret source.
- Use ARM64 and `us-west-2` only.
- Do not add source-contract, Ruby, shell, or TypeScript tests. Remove SST contract-test wiring from CI.
- Do not push or deploy during implementation. The operator runs `sst diff` and `sst deploy` afterward.

---

## File structure

- Create: `infra/sst.platform.json` — account, region, domains, capacity, names, AMIs, and dev reference IDs.
- Rewrite: `infra/sst.config.ts` — the sole SST resource definition file.
- Delete: `infra/config.ts`, `infra/assets.ts`, `infra/platform.ts`, `infra/dev-reference.ts`, `infra/runtime.ts`, `infra/runtime/`, `infra/stages/`, `infra/test/`, and `infra/platform.constants.json`.
- Modify: `infra/tsconfig.json`, `infra/package.json`, `scripts/deploy-sst.sh`, `scripts/lib/rapid-release.sh`, `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `infra/README.md`, and `docs/ops/workflows/deploy.md`.
- Delete: SST-specific contract scripts that are no longer invoked.

### Task 1: Flatten configuration and resource ownership

**Files:** `infra/sst.platform.json`, `infra/sst.config.ts`, `infra/tsconfig.json`, `infra/package.json`; delete all former infra modules and tests.

**Consumes:** Exact deployed values from `platform.constants.json`; existing resource arguments from assets, platform, and durable runtime modules.

**Produces:** A single JSON-backed config with explicit durable, preview, and local stage branches.

- [x] **Step 1: Create the sole non-secret platform object**

Create `infra/sst.platform.json` with this exact key layout, retaining the current live values rather than introducing environment variables:

```json
{
  "aws": { "accountId": "353760060567", "region": "us-west-2", "architecture": "arm64", "imageRepository": "gala" },
  "domains": { "root": "learngala.dev", "dev": "dev.learngala.dev", "cloudflareZoneId": "b95aebc5cd4c107a97157de72bd75627", "sharedRouterDistributionId": "E3FF4TTU9Q4XTY" },
  "storage": { "mediaBucket": "msc-gala", "staticAssetsBucket": "gala-static-assets-353760060567", "staticAssetsDistributionId": "EUWPHB77806X0" },
  "capacity": { "dev": { "database": "t4g.micro", "storage": "20 GB", "web": { "cpu": "0.5 vCPU", "memory": "1 GB", "min": 1, "max": 1 }, "worker": { "cpu": "0.25 vCPU", "memory": "1 GB", "min": 1, "max": 1 } }, "production": { "database": "t4g.small", "storage": "50 GB", "web": { "cpu": "1 vCPU", "memory": "2 GB", "min": 2, "max": 3 }, "worker": { "cpu": "0.5 vCPU", "memory": "1 GB", "min": 1, "max": 2 } } },
  "devReference": { "vpcId": "vpc-030eda5dfde37d35b", "clusterId": "arn:aws:ecs:us-west-2:353760060567:cluster/gala-dev-GalaClusterCluster-zeeusfkv", "containerSubnetIds": ["subnet-0bc99b9bf9f1b2c1c", "subnet-0afa22ca0b93a0ff8"], "loadBalancerSubnetIds": ["subnet-0bc99b9bf9f1b2c1c", "subnet-0afa22ca0b93a0ff8"], "securityGroupIds": ["sg-02a6d5e6fb950d67f"], "cloudMapNamespaceId": "ns-72l4igov24fwh2uk", "cloudMapNamespaceName": "sst" },
  "bastionAmi": { "dev": "ami-08c28b6151a0ba92f", "production": "ami-0a2a049c945b84826" }
}
```

- [x] **Step 2: Rewrite `sst.config.ts` with four direct stage cases**

Import only the JSON file, validate `dev`, `production`, `pr-NUMBER`, and `local-NAME`, and use one resource graph per case:

```ts
import platform from "./sst.platform.json";

const stage = $app.stage;
const preview = /^pr-([1-9][0-9]*)$/.exec(stage);
const local = /^local-([a-z0-9][a-z0-9-]{0,31})$/.exec(stage);
const durable = stage === "dev" || stage === "production";
if (!durable && !preview && !local) throw new Error(`Unsupported SST stage: ${stage}`);
```

`app()` returns fixed AWS provider configuration and durable retention. `run()` creates VPC, cluster, database, cache, static assets, secrets, services, tasks, and production cron only for durable stages. It uses `Cluster.get`, `Router.get`, CloudFront `Distribution.get`, and deterministic dev SSM ARNs for preview/local. Preview adds exactly `pr-NUMBER.dev.learngala.dev`; local starts dev-mode services and does not route publicly.

- [x] **Step 3: remove application cache complexity and protect shared resources**

Keep only:

```ts
aws.s3.BucketV2.get("GalaMediaBucket", platform.storage.mediaBucket);
```

Never instantiate SES. Keep the separate static-assets distribution with one immutable default cache behavior. Delete the app CloudFront distribution, response-header policy, route lists, and ordered cache behaviors; route the SST Router directly to `web.url`.

- [x] **Step 4: remove old modules and test tooling**

Set `resolveJsonModule: true`, compile only `sst.config.ts`, remove the `infra` test script, then delete the old modules and `infra/test/`. Do not replace them with tests.

- [x] **Step 5: syntax-check and commit**

```sh
cd infra && npm run check
git diff --check
git add infra
git commit -m "refactor(infra): consolidate SST configuration"
```

Expected: TypeScript and whitespace checks exit zero; do not run SST against AWS.

### Task 2: Make infrastructure actions visible and direct

**Files:** `scripts/deploy-sst.sh`, `scripts/lib/rapid-release.sh`; delete obsolete plan/fingerprint helpers.

**Consumes:** `SST_STAGE`, `GALA_EFFECTIVE_STAGE`, `USER_DATA`, and the new config.

**Produces:** Direct `infra:diff` and `infra:apply` actions, while preserving existing release promotion and rollback actions.

- [x] **Step 1: replace signed plan dispatch with direct SST commands**

In `scripts/deploy-sst.sh`, retain durable `--stage`, region validation, and effective-stage validation. Replace plan IDs with:

```bash
case "$USER_DATA" in
  infra:diff) (cd infra && npx sst diff --stage "$STAGE") ;;
  infra:apply) (cd infra && npx sst deploy --stage "$STAGE") ;;
  "") (cd infra && npx sst deploy --stage "${GALA_EFFECTIVE_STAGE:-$STAGE}") ;;
  promote:v[1-9][0-9]*|rollback|rollback:v[1-9][0-9]*) rapid_release_main "$STAGE" "$USER_DATA" ;;
  *) echo "Unsupported deploy action: $USER_DATA" >&2; exit 1 ;;
esac
```

`infra:diff` and `infra:apply` reject preview/local stages. They create no S3 record and perform no fingerprint, signature, or state-version comparison.

- [x] **Step 2: delete unused plan machinery**

Delete `rapid_state_version`, `rapid_diff_fingerprint`, `rapid_run_infra_diff`, and `rapid_apply_infra_plan` once no dispatch calls them. Retain only promotion/rollback artifact code.

- [x] **Step 3: syntax-check and commit**

```sh
bash -n scripts/deploy-sst.sh scripts/lib/rapid-release.sh scripts/lib/stage-target.sh
git diff --check
git add scripts/deploy-sst.sh scripts/lib
git commit -m "refactor(deploy): expose direct SST actions"
```

### Task 3: Separate CI checks from automatic preview deployment

**Files:** `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`.

**Consumes:** GitHub OIDC, Cloudflare secrets, `scripts/deploy-sst.sh`, and `stage-target.sh`.

**Produces:** CI-only validation plus a PR update trigger that deploys only the exact preview stage.

- [x] **Step 1: remove SST contract chains from `ci.yml`**

Replace the SST portion of the contracts suite with:

```bash
cd infra
npm ci --prefer-offline --no-audit --no-fund
SST_TELEMETRY_DISABLED=1 npx sst install --stage dev
npm run check
```

Keep existing application test suites. CI must not call `sst diff`, `sst deploy`, `scripts/deploy-sst.sh`, or Heroku.

- [x] **Step 2: add a PR preview deployment job**

Add `pull_request` actions `opened`, `synchronize`, and `reopened`. The preview job uses:

```yaml
if: github.event.pull_request.head.repo.full_name == github.repository
env:
  SST_STAGE: dev
  GALA_EFFECTIVE_STAGE: pr-${{ github.event.pull_request.number }}
  USER_DATA: ""
```

It checks out the PR SHA, configures existing OIDC/Cloudflare credentials, invokes `bash scripts/deploy-sst.sh --stage dev`, and comments only `https://pr-${{ github.event.pull_request.number }}.dev.learngala.dev`. It has no production environment and no free-form stage input.

- [x] **Step 3: retain manual durable operations**

Keep workflow dispatch for `dev` and `production`, protected production environment, and `infra:diff`/`infra:apply`. Production never derives a PR target.

- [x] **Step 4: parse-check and commit**

```sh
ruby -e 'require "yaml"; YAML.load_file(".github/workflows/ci.yml"); YAML.load_file(".github/workflows/deploy.yml")'
git diff --check
git add .github/workflows/ci.yml .github/workflows/deploy.yml
git commit -m "feat(deploy): deploy previews on PR updates"
```

### Task 4: Document exact workflow and action boundaries

**Files:** `infra/README.md`, `docs/ops/workflows/deploy.md`.

**Consumes:** Final config, final `USER_DATA` syntax, and final workflows.

**Produces:** A short local/operator guide.

- [x] **Step 1: rewrite `infra/README.md`**

Document this workflow table:

| Workflow | Trigger | Responsibility | Cannot do |
|---|---|---|---|
| `ci.yml` | push/PR | application checks | deploy or mutate AWS |
| `deploy.yml` | PR update/manual dispatch | PR preview deployment; reviewed durable actions | use Heroku; own `msc-gala` or SES |

Add the four stage forms and commands: `npx sst diff --stage dev`, `npx sst deploy --stage dev`, `npx sst deploy --stage pr-790`, and `npx sst dev --stage local-name`. State that non-secrets live in `sst.platform.json`, secrets remain SST/SSM, and a diff touching `msc-gala` or SES is a stop condition.

- [x] **Step 2: document every `user_data` action in `deploy.md`**

| `user_data` | Allowed stage | Effect |
|---|---|---|
| blank | dev / PR stage | deploy current app/config |
| `infra:diff` | dev / production | print SST diff for operator review |
| `infra:apply` | dev / production | apply selected durable stage after review |
| `promote:vN` | production | promote retained dev release `vN` |
| `rollback` | dev / production | restore immediate previous release |
| `rollback:vN` | dev / production | restore retained release `vN` |

State explicitly that the diff has no cryptographic proof: the operator decides whether to run `infra:apply`.

- [x] **Step 3: review and commit**

```sh
git diff --check
git status --short
git add infra/README.md docs/ops/workflows/deploy.md
git commit -m "docs: explain SST deployment boundaries"
```

## Implementation handoff verification

Run only local, non-mutating checks:

```sh
cd infra && npm run check
cd .. && bash -n scripts/deploy-sst.sh scripts/lib/rapid-release.sh scripts/lib/stage-target.sh
ruby -e 'require "yaml"; YAML.load_file(".github/workflows/ci.yml"); YAML.load_file(".github/workflows/deploy.yml")'
git diff --check
```

The operator then runs `npx sst diff --stage dev` and decides whether to run `npx sst deploy --stage dev`. Do not deploy or push during implementation.
