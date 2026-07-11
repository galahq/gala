# SST Canonical Rapid Releases Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace routine SST application deployments with canonical, immutable `v<GITHUB_RUN_NUMBER>` releases that roll ECS services safely and support dev-tested production promotion and rollback.

**Architecture:** Keep SST responsible only for stable platform provisioning and explicit infrastructure plans. A small release library derives one canonical version, writes a four-field immutable manifest beside versioned assets, registers paired digest-pinned ECS task definitions, verifies service health, and advances channel pointers only after success. The existing deploy entry point becomes a dispatcher for release, promotion, rollback, infrastructure diff/apply, and retained operator actions.

**Tech Stack:** Bash 5, AWS CLI v2, `jq`, Docker BuildKit, ECS/Fargate, ECR, S3, GitHub Actions, SST 4.7.1.

## Global Constraints

- AWS account `353760060567`, region `us-west-2`; local commands use `AWS_PROFILE=gala`.
- Runtime architecture is ARM64 only.
- `msc-gala` and SES are external Heroku-shared resources: never create, import, replace, delete, or mutate them.
- Routine releases never invoke `sst install`, `sst diff`, `sst deploy`, `sst refresh`, CloudFormation, Pulumi state editing, CloudFront invalidation, or DNS mutation.
- The static-assets bucket is `gala-static-assets-353760060567`; assets are immutable under `releases/vN/`.
- Only GitHub Actions creates promotable canonical versions. A retry may reuse a version only when commit, digest, and manifest match.
- Production requires explicit `promote:vN`, `rollback`, or `rollback:vN`; an empty production action fails closed.
- Channel pointers move only after ECS stability and HTTP/static-asset smoke checks.
- Existing dirty and untracked user files remain untouched unless named in this plan.
- The user explicitly required the current checkout; do not create a worktree.

---

### Task 1: Canonical release contract

**Files:**
- Create: `scripts/lib/canonical-release.sh`
- Create: `scripts/ops/test-canonical-release.sh`

**Interfaces:**
- Consumes: `GITHUB_RUN_NUMBER`, `GITHUB_SHA`, UTC clock, ECR digest.
- Produces: `canonical_version`, `release_manifest_json`, `validate_release_manifest`, and derived `releases/vN` keys.

- [ ] **Step 1: Write failing shell tests** for accepting `412 -> v412`, rejecting absent/non-numeric run numbers for build mode, producing exactly `version`, `commit`, `digest`, `created_at`, preserving an existing timestamp on retry, and rejecting a version collision with a different commit or digest.
- [ ] **Step 2: Run** `bash scripts/ops/test-canonical-release.sh` and confirm failures are caused by the missing library.
- [ ] **Step 3: Implement** pure functions in `scripts/lib/canonical-release.sh`; do not call AWS or mutate files from the library.
- [ ] **Step 4: Rerun** the test and require exit zero.
- [ ] **Step 5: Commit** only the library and test.

### Task 2: Immutable artifact publishing and retry safety

**Files:**
- Create: `scripts/lib/release-artifacts.sh`
- Create: `scripts/ops/test-release-artifacts.sh`
- Modify: `scripts/deploy-sst.sh`

**Interfaces:**
- Consumes: canonical version, commit, local image, static-assets directory, repository and bucket names.
- Produces: immutable ECR `vN`, digest, `releases/vN/manifest.json`, and extracted assets under `releases/vN/`.

- [ ] **Step 1: Write failing command-stub tests** proving first publish, identical retry reuse, conflict refusal, no `latest` write, ARM64-only build, and no SST/CloudFront/DNS command in routine mode.
- [ ] **Step 2: Run** `bash scripts/ops/test-release-artifacts.sh` and confirm the expected failures.
- [ ] **Step 3: Implement** immutable publishing with ECR digest resolution and conditional S3 manifest creation/readback. Upload assets before writing the manifest. Never overwrite a different release record.
- [ ] **Step 4: Make `scripts/deploy-sst.sh` dispatch empty dev input to this path** and remove legacy release-ID, asset-prefix, architecture, Dockerfile, cache-invalidation, and mutable-`latest` behavior from that path.
- [ ] **Step 5: Rerun** artifact and existing architecture tests.
- [ ] **Step 6: Commit** the artifact slice.

### Task 3: Paired ECS rollout and channel state

**Files:**
- Create: `scripts/lib/ecs-release.sh`
- Create: `scripts/ops/test-ecs-release.sh`
- Modify: `scripts/deploy-sst.sh`

**Interfaces:**
- Consumes: effective stage, canonical manifest, current web/worker services, stage URL.
- Produces: digest-pinned tagged task revisions and `channels/<stage>.json` containing only `current` and `previous`.

- [ ] **Step 1: Write failing stubbed-AWS tests** proving only image digest and canonical release environment change, both task definitions are registered before either service update, deployment circuit breaker is enabled, failures preserve the old channel, success writes `{current,previous}`, and task definitions receive stage/role/release tags.
- [ ] **Step 2: Run** `bash scripts/ops/test-ecs-release.sh` and confirm expected failures.
- [ ] **Step 3: Implement** task-definition cloning, paired registration, service updates, stable wait, `/up`, hostname, and manifest/static-asset checks.
- [ ] **Step 4: Implement rollback-on-partial-service-update** using the captured task-definition pair before returning failure.
- [ ] **Step 5: Rerun** focused and existing deploy tests.
- [ ] **Step 6: Commit** the ECS slice.

### Task 4: Promotion, rollback, and previews

**Files:**
- Modify: `scripts/deploy-sst.sh`
- Create: `scripts/ops/test-release-actions.sh`

**Interfaces:**
- Consumes: empty dev action, `diff`, `promote:vN`, `rollback`, `rollback:vN`, `infra:diff`, `infra:apply:PLAN_ID`.
- Produces: safe action routing and stage-specific ECS channel transitions.

- [ ] **Step 1: Write failing action grammar tests** for valid/invalid actions, empty-production refusal, promotion requiring a healthy dev channel at the same version/digest, rollback selection, and `pr-NNN` derivation from an open PR without addressing any other preview stage.
- [ ] **Step 2: Run** the tests and confirm the current dispatcher fails them.
- [ ] **Step 3: Implement promotion** by loading the immutable manifest and creating production task revisions with production's existing environment/secret references.
- [ ] **Step 4: Implement immediate and explicit rollback** from retained tagged task definitions and verify health before moving channel pointers.
- [ ] **Step 5: Implement exact preview identity validation** and comment output; preview infrastructure provisioning remains an explicit `infra:*` action rather than a side effect of release.
- [ ] **Step 6: Rerun** action and ECS tests.
- [ ] **Step 7: Commit** the action slice.

### Task 5: Thin workflow and stable-infrastructure gate

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Create: `scripts/ops/test-deploy-workflow-contract.sh`
- Modify: `scripts/ops/test-workflow-architecture-defaults.rb`

**Interfaces:**
- Consumes: workflow `stage` and `user_data` only.
- Produces: one call to `scripts/deploy-sst.sh`, canonical version from `GITHUB_RUN_NUMBER`, OIDC AWS credentials, artifacts, and preview comments.

- [ ] **Step 1: Write failing workflow contract tests** proving one deploy-script call, no workflow-built release aliases, no routine SST install, no media-bucket mutation, ARM runner, minimal permissions, protected production action grammar, and preview URL comment.
- [ ] **Step 2: Run** the tests and confirm failures against the current 332-line workflow.
- [ ] **Step 3: Reduce the workflow** to authorization, checkout/tooling, OIDC, one script invocation, artifact upload, preview comment, and summary.
- [ ] **Step 4: Keep `infra:diff` non-refreshing** and require an immutable plan artifact before `infra:apply:PLAN_ID`; the implementation must reject apply when commit, stage, state version, or operation fingerprint differs.
- [ ] **Step 5: Run** workflow and YAML validation tests.
- [ ] **Step 6: Commit** the workflow slice.

### Task 6: Documentation, compatibility removal, and verification

**Files:**
- Modify: `infra/runtime.ts`
- Modify: `infra/config.ts`
- Modify: `infra/README.md`
- Modify: `docs/ops/infra-stacks.md`
- Modify: `docs/ops/workflows/deploy.md`
- Modify: `docs/ops/workflows/ci.md`
- Modify: `scripts/ops/test-sst-module-boundaries.rb`
- Modify: `scripts/ops/test-sst-dev-runtime-contracts.rb`

**Interfaces:**
- Consumes: completed release behavior.
- Produces: one `GALA_RELEASE` runtime identity and operator runbooks.

- [ ] **Step 1: Write failing source-contract tests** prohibiting legacy `GALA_RELEASE_ID`, `GALA_ASSET_PREFIX`, `GALA_RELEASE_VERSION`, mutable image aliases, runtime architecture choices, and routine release environment switches.
- [ ] **Step 2: Run** the focused contract tests and confirm expected failures.
- [ ] **Step 3: Remove phase-one compatibility inputs** from SST runtime configuration while preserving stable-resource logical names and inputs.
- [ ] **Step 4: Document** build, dev rollout, preview rollout, promotion, rollback, retry collision behavior, capacity changes, infrastructure diff/apply, database expand/contract rules, and external `msc-gala`/SES ownership.
- [ ] **Step 5: Run** every release/infra contract test, shell syntax checks, workflow validation, JavaScript/Ruby tests affected by `GALA_RELEASE`, and `git diff --check`.
- [ ] **Step 6: Inspect the final diff** for shared-resource mutation paths, secret output, unrelated user changes, and accidental production operations.
- [ ] **Step 7: Commit** only the intended part-two files and request code review before branch completion.

## Self-review

- Spec coverage: canonical identity, manifest, retry safety, digest pinning, assets, channels, paired ECS rollout, health-gated pointers, promotion, rollback, previews, thin workflow, stable-infrastructure gate, documentation, and shared-resource constraints are assigned to explicit tasks.
- Scope split: static-bucket state reconciliation and CloudFront deletion remain independent infrastructure phases and are deliberately not performed by this release plan.
- Placeholder scan: no implementation step delegates unspecified behavior; exact observable contracts and commands are named.
- Type consistency: `version` is the sole release identity; manifests always use `version`, `commit`, `digest`, `created_at`; channels always use `current`, `previous`.
