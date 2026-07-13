# SST to Local Terraform Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add safe, local-only Terraform configurations that can adopt Gala's existing dev and production AWS resources without changing them, and remove Terraform/SST deployment authority from CI.

**Architecture:** Dev and production are independent Terraform roots backed by separate S3 state keys and one shared environment module. Declarative import files adopt only unambiguous live resources; shared and secret-bearing resources begin as data references. Guarded shell entry points enforce account, profile, region, local execution, saved plans, and non-destructive migration-plan summaries.

**Tech Stack:** Terraform 1.15.8, hashicorp/aws 6.54.x, Bash, AWS CLI v2, jq, GitHub Actions, ECS/Fargate, RDS PostgreSQL 16, ElastiCache Valkey 7.2, S3, CloudFront

## Global Constraints

- Use AWS account `353760060567`, `AWS_PROFILE=gala`, and `AWS_REGION=us-west-2` only.
- Do not run `terraform apply`, `terraform import`, SST deploy/remove/refresh, or mutating AWS CLI commands during implementation.
- Preserve all existing AWS resources; an adoption plan containing create, update, replacement, or delete is a failure.
- Use the live production RDS storage value of 20 GB.
- Manage `gala-dev-galacachecluster-zdbxebkm`; do not adopt or delete the second dev Valkey group.
- Keep `msc-gala`, SES, SSM values, shared CloudFront router, Cloudflare DNS, ECS task-definition revisions, and SST secrets reference-only in the first migration.
- CI must not install or invoke Terraform or SST.
- Preserve all unrelated working-tree changes.

---

### Task 1: Add contract tests for the local-only boundary

**Files:**
- Create: `infra/test/terraform-contracts.sh`
- Create: `infra/test/bin-contracts.sh`

**Interfaces:**
- Produces: executable static contract suites used by `infra/bin/check`

- [ ] **Step 1: Add failing checks**

Assert that both roots constrain Terraform/AWS versions, use distinct backend
keys, expose no secret variables, and that workflows contain neither
`terraform` nor `sst` commands. Assert every mutating wrapper calls the shared
guard and apply requires a saved plan.

- [ ] **Step 2: Run tests and verify RED**

Run: `bash infra/test/terraform-contracts.sh && bash infra/test/bin-contracts.sh`

Expected: FAIL because the Terraform roots and wrappers do not exist.

- [ ] **Step 3: Commit the contract tests with their implementation task**

Stage only files created by Tasks 1 and 2 after both suites pass.

### Task 2: Add guarded local Terraform commands

**Files:**
- Create: `infra/bin/_common`
- Create: `infra/bin/check`
- Create: `infra/bin/diff`
- Create: `infra/bin/apply`
- Create: `infra/bin/migrate`
- Create: `infra/bin/rollback`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `require_local_operator`, `require_stage`, `stack_dir`, and `backend_config` shell functions
- Consumes: `AWS_PROFILE=gala`, `AWS_REGION=us-west-2`, AWS CLI, jq, Terraform

- [ ] **Step 1: Implement the common guard**

The guard checks exact profile/region, rejects `CI`, verifies STS account
`353760060567`, requires Terraform 1.15.x, and never reads secret values.

- [ ] **Step 2: Implement diff and apply**

`diff STAGE` initializes the selected root from untracked backend configuration,
writes `.plans/STAGE-TIMESTAMP.tfplan`, renders JSON, and exits nonzero in
migration mode when any action other than import/no-op appears. `apply STAGE
PLAN` requires a real saved plan beneath `infra/.plans`, displays its summary,
requires an exact interactive confirmation, and applies only that file.

- [ ] **Step 3: Implement migrate and rollback**

`migrate STAGE` delegates to import-only diff validation and never applies.
`rollback STAGE VERSION_ID` validates that the state lock is absent, downloads a
selected prior S3 object version to a private temporary file, shows state lineage
and serial, and requires confirmation before `terraform state push`. The command
has no implicit latest/previous selection.

- [ ] **Step 4: Verify contracts**

Run: `bash infra/test/bin-contracts.sh`

Expected: PASS without AWS calls from the test harness.

### Task 3: Add Terraform roots, backend bootstrap, and references

**Files:**
- Create: `infra/.terraform-version`
- Create: `infra/bootstrap/main.tf`
- Create: `infra/bootstrap/variables.tf`
- Create: `infra/bootstrap/outputs.tf`
- Create: `infra/stacks/dev/versions.tf`
- Create: `infra/stacks/dev/backend.tf`
- Create: `infra/stacks/dev/main.tf`
- Create: `infra/stacks/dev/imports.tf`
- Create: `infra/stacks/dev/terraform.tfvars`
- Create: `infra/stacks/production/versions.tf`
- Create: `infra/stacks/production/backend.tf`
- Create: `infra/stacks/production/main.tf`
- Create: `infra/stacks/production/imports.tf`
- Create: `infra/stacks/production/terraform.tfvars`
- Create: `infra/modules/environment/variables.tf`
- Create: `infra/modules/environment/references.tf`
- Create: `infra/modules/environment/outputs.tf`

**Interfaces:**
- Produces: one `module "environment"` per durable stage
- Produces: data references for SSM parameters, media bucket, shared router, ECR repository, and active ECS task definitions

- [ ] **Step 1: Add version and provider constraints**

Use `required_version = "~> 1.15.0"` and AWS provider `~> 6.54.0`. Provider
configuration sets region and allowed account IDs and applies default Gala tags.

- [ ] **Step 2: Add partial S3 backends**

Set fixed keys `gala/dev/terraform.tfstate` and
`gala/production/terraform.tfstate`, `encrypt = true`, and
`use_lockfile = true`; keep the bucket out of tracked HCL.

- [ ] **Step 3: Add bootstrap configuration**

Declare a versioned, encrypted, public-blocked state bucket with
`prevent_destroy`; do not apply it.

- [ ] **Step 4: Add reference-only resources**

Use data sources for the existing ECR repository, `msc-gala`, shared router
distribution, `/gala/<stage>/*` parameters, and active ECS task definitions.
Never request SSM values with decryption.

### Task 4: Model and import stable AWS resources

**Files:**
- Create: `infra/modules/environment/network.tf`
- Create: `infra/modules/environment/data.tf`
- Create: `infra/modules/environment/compute.tf`
- Create: `infra/modules/environment/load_balancing.tf`
- Create: `infra/modules/environment/autoscaling.tf`
- Create: `infra/modules/environment/schedules.tf`
- Create: `infra/modules/environment/static_assets.tf`
- Create: `infra/migrations/dev.auto.tfvars.json`
- Create: `infra/migrations/production.auto.tfvars.json`
- Modify: `infra/stacks/dev/imports.tf`
- Modify: `infra/stacks/production/imports.tf`

**Interfaces:**
- Consumes: exact live IDs recorded in migration manifests
- Produces: lifecycle-protected resource declarations and declarative imports

- [ ] **Step 1: Record sanitized live identifiers**

Use SST state export without `--decrypt` and read-only AWS describe/list calls.
Persist only resource IDs, names, ARNs, CIDRs, sizes, policies, and relationships;
never persist passwords, tokens, secret strings, or private keys.

- [ ] **Step 2: Model networking and data services**

Match the live VPC, four subnets, internet gateway, route tables/associations,
default security group, RDS subnet/parameter groups and instance, ElastiCache
subnet/parameter groups and chosen replication group. Protect VPC, RDS, cache,
and subnet resources from destroy.

- [ ] **Step 3: Model ECS and load balancing**

Match clusters, capacity providers, services, service discovery, ALBs, listeners,
target groups, security groups, autoscaling targets/policies, and log groups.
Ignore only ECS service task-definition revisions and desired-count changes that
belong to the release path.

- [ ] **Step 4: Model schedules and static distributions**

Match production EventBridge rules/targets and their roles. Match each stage's
static distribution and its response-header policy. Treat the shared application
router and Cloudflare DNS as data only.

- [ ] **Step 5: Generate explicit import blocks**

Every import uses one exact recorded physical ID. Do not include the extra dev
Valkey group, shared media bucket, shared router, SSM parameter resources, secret
versions, or ECS task definitions.

### Task 5: Make CI AWS-CLI-only for releases

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/deploy.yml`
- Modify: `scripts/deploy-sst.sh`
- Modify: `scripts/lib/rapid-release.sh`
- Add or modify focused tests under: `scripts/ops/`

**Interfaces:**
- Produces: image build/push, immutable static upload, migration task, ECS rollout, and rollback using AWS CLI
- Removes: all workflow and script SST/Terraform execution paths

- [ ] **Step 1: Write failing workflow contracts**

Assert no workflow invokes Terraform/SST, release jobs use GitHub OIDC plus AWS
CLI, images are digest-pinned, assets are immutable, and infrastructure actions
are absent.

- [ ] **Step 2: Replace preview/durable SST jobs**

Keep application validation in CI. Build ARM64 once, authenticate to ECR with
AWS CLI, push a versioned image, compile/upload release assets, run the migration
task, register web/worker tasks, update services, wait, smoke-test, and update
channel records. Keep production protected and manual.

- [ ] **Step 3: Preserve rollback**

Reuse retained digest-pinned task definitions and the matching release asset
prefix. Do not attempt database-schema rollback.

### Task 6: Document and verify

**Files:**
- Replace: `infra/README.md`
- Modify: `docs/ops/infra-stacks.md`
- Modify: `docs/ops/workflows/ci.md`
- Modify: `docs/ops/workflows/deploy.md`

**Interfaces:**
- Produces: exact local setup, import review, diff, apply, state recovery, release, and rollback runbooks

- [ ] **Step 1: Document commands and stop conditions**

Include profile/region exports, backend preparation, import-only plan criteria,
saved-plan apply, versioned state recovery, secret handling, and drift ownership.

- [ ] **Step 2: Run static verification**

Run:

```bash
bash infra/test/terraform-contracts.sh
bash infra/test/bin-contracts.sh
git diff --check
```

Expected: PASS with no AWS mutation.

- [ ] **Step 3: Run Terraform validation when available**

Run `infra/bin/check`. Expected: formatting and validation pass for bootstrap,
dev, and production without backend initialization or AWS mutation.

- [ ] **Step 4: Review the final diff**

Confirm no unrelated paths changed, no secret values appear, CI has no
Terraform/SST command, and no apply/import/deploy command was executed.

