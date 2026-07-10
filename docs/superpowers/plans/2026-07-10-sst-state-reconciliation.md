# SST Google OAuth State Reconciliation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a deterministic, non-deploying SST preview for the staged Google OAuth resources after removing exactly two stale dev checkpoint pending operations.

**Architecture:** ECS receives deterministic same-region SSM parameter names while explicit Pulumi dependencies preserve creation order. Stage-specific transforms pin the existing bastion AMIs. A narrowly scoped JSON editor removes only the two approved pending-operation records, and a separate fail-closed verifier validates the machine-readable SST preview.

**Tech Stack:** SST 4.7.1, Pulumi TypeScript, AWS SSM/ECS/EC2/S3, Ruby 4, Bash, GitHub Actions

## Global Constraints

- AWS region is exactly `us-west-2`.
- Primary SST stages are exactly `dev` and `production`; dev-derived previews use the dev infrastructure configuration.
- Do not run `sst deploy`, `sst refresh`, `sst state repair`, or `sst state remove`.
- Do not edit production state.
- Do not mutate Heroku configuration, Google Cloud credentials, shared S3 resources, or SES resources.
- `msc-gala` and SES remain external/imported and must never be created, replaced, or destroyed by this work.
- Any S3, SES, ALB, CloudFront, log-group, autoscaling, VPC, database, cache, or bastion mutation in the final preview is a stop condition.
- Preserve unrelated working-tree paths, including `infra/sst-env.d.ts`, `.work/`, and `GCP_OAUTH.pdf`.
- Never print or decrypt secret values.
- The only authorized cloud mutation is removal of the two exact dev pending-operation records after a versioned backup and concurrency check.

## File map

- Modify `infra/sst.config.ts`: deterministic SSM names, explicit ECS task-definition dependencies, and stage-specific bastion AMI pins.
- Modify `scripts/ops/test-sst-dev-runtime-contracts.rb`: repository contract coverage for the resource graph and AMI pins.
- Create `scripts/ops/edit-sst-pending-operations.rb`: one-purpose editor and before/after checkpoint verifier.
- Create `scripts/ops/test-edit-sst-pending-operations.rb`: isolated JSON-state tests with no cloud access.
- Create `scripts/ops/verify-sst-google-oauth-preview.rb`: fail-closed validator for `sst diff --json` output.
- Create `scripts/ops/test-verify-sst-google-oauth-preview.rb`: synthetic allowlist and forbidden-mutation tests.
- Modify `.github/workflows/ci.yml`: run the two new operator-script tests in the existing contracts suite.
- Modify `scripts/ops/test-workflow-architecture-defaults.rb`: require both reconciliation tests in CI.
- Modify `docs/ops/staged-google-oauth-deployment-findings.md`: record the reconciled design, exact commands, and no-deploy boundary.

---

### Task 1: Make the SST resource graph deterministic

**Files:**
- Modify: `scripts/ops/test-sst-dev-runtime-contracts.rb:7-10,128-158`
- Modify: `infra/sst.config.ts:220-252,330-465`

**Interfaces:**
- Produces: `secretValueToParameter(name, value) -> { parameter: aws.ssm.Parameter, valueFrom: string }`
- Produces: `googleSecretParameterDependencies: aws.ssm.Parameter[]`
- Produces: `taskDefinitionSecretDependencyTransform(args, opts) -> undefined`
- Produces: stage-specific `bastionAmi` selected from the two approved IDs.

- [ ] **Step 1: Extend the contract test with the missing guarantees**

Add constants near `GOOGLE_SECRET_KEYS`:

```ruby
RAILS_TASK_DEFINITION_NAMES = %w[
  GalaWeb
  GalaWorker
  GalaMigrate
  GalaSeedDatabase
  GalaRefreshIndices
  GalaWeeklyReport
].freeze

APPROVED_BASTION_AMIS = {
  "dev" => "ami-08c28b6151a0ba92f",
  "production" => "ami-0a2a049c945b84826",
}.freeze
```

Replace the existing Google parameter assertion and append the resource-graph assertions:

```ruby
assert("infra/sst.config.ts: retained Google OAuth secrets must project through deterministic SecureString names") do
  GOOGLE_SECRET_KEYS.all? do |key|
    sst.match?(%r{\[\s*"#{key}",\s*secretValueToParameter\(\s*"#{key}",\s*resolveSecret\("#{key}"\),?\s*\),?\s*\]}m)
  end &&
    sst.match?(%r{const secretValueToParameter = .*?type: "SecureString".*?valueFrom: parameterName}m) &&
    !sst.match?(%r{new aws\.ssm\.Parameter\(.*?\)\.arn}m)
end

assert("infra/sst.config.ts: all four Google parameters must be explicit task-definition dependencies") do
  sst.include?("const googleSecretParameterDependencies = GOOGLE_SECRET_KEYS.map") &&
    sst.include?("sharedSecretParameters[key].parameter") &&
    sst.include?("opts.dependsOn = [") &&
    sst.include?("...googleSecretParameterDependencies")
end

assert("infra/sst.config.ts: every Rails Fargate consumer must inherit the task-definition dependency transform") do
  sst.match?(%r{const railsTaskDefaults = \{.*?transform: \{\s*taskDefinition: taskDefinitionSecretDependencyTransform,\s*\}.*?\};}m) &&
    RAILS_TASK_DEFINITION_NAMES.all? { |name| sst.include?("\"#{name}\"") }
end

assert("infra/sst.config.ts: bastion AMIs must be pinned to the approved running images") do
  APPROVED_BASTION_AMIS.values.all? { |ami| sst.include?(ami) } &&
    sst.include?("bastionInstance: (args: any) =>") &&
    sst.include?("args.ami = bastionAmi")
end
```

- [ ] **Step 2: Run the focused contract test and verify RED**

Run:

```bash
ruby scripts/ops/test-sst-dev-runtime-contracts.rb
```

Expected: FAIL at the deterministic SecureString assertion because `secretValueToParameter` still returns `.arn`.

- [ ] **Step 3: Implement deterministic parameter names and retain resource handles**

In `infra/sst.config.ts`, define the Google key tuple before `retainedSecrets`, then replace `secretValueToParameter`:

```ts
    const GOOGLE_SECRET_KEYS = [
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "GOOGLE_MIGRATION_CLIENT_ID",
      "GOOGLE_MIGRATION_CLIENT_SECRET",
    ] as const;

    const secretParameterName = (name: string) =>
      `/${$app.name}/${stage}/${name}`;
    const secretValueToParameter = (name: string, value: any) => {
      const parameterName = secretParameterName(name);
      const parameter = new aws.ssm.Parameter(`${name}Parameter`, {
        name: parameterName,
        type: "SecureString",
        description: `${$app.name} ${stage} secret ${name}`,
        value: trimSecretValue(value),
        overwrite: true,
      });

      return { parameter, valueFrom: parameterName };
    };
```

Rename the current `sharedSecrets` object to `sharedSecretParameters`, leaving its key/value constructor array intact. Immediately after it, derive the ECS map and Google dependencies:

```ts
    const sharedSecrets = Object.fromEntries(
      Object.entries(sharedSecretParameters).map(([name, parameter]) => [
        name,
        parameter.valueFrom,
      ]),
    );
    const googleSecretParameterDependencies = GOOGLE_SECRET_KEYS.map(
      (key) => sharedSecretParameters[key].parameter,
    );
    const railsRuntimeSecrets = sharedSecrets;
```

- [ ] **Step 4: Add the explicit task-definition dependency transform**

Replace the deployment transform/default blocks with:

```ts
    const taskDefinitionSecretDependencyTransform = (
      _args: any,
      opts: any,
    ) => {
      const existingDependencies = opts.dependsOn == null
        ? []
        : Array.isArray(opts.dependsOn)
          ? opts.dependsOn
          : [opts.dependsOn];

      opts.dependsOn = [
        ...existingDependencies,
        ...googleSecretParameterDependencies,
      ];
    };
    const singleTaskDeploymentTransform = isProduction
      ? {}
      : {
          service: (args: any) => {
            args.deploymentMinimumHealthyPercent = 0;
            args.deploymentMaximumPercent = 200;
          },
        };

    const railsTaskDefaults = {
      cluster,
      image: railsContainerImage,
      architecture: containerArchitecture,
      environment: railsRuntimeEnvironment,
      permissions: mediaAccessPermissions,
      ssm: railsRuntimeSecrets,
      transform: {
        taskDefinition: taskDefinitionSecretDependencyTransform,
      },
    };

    const railsServiceDefaults = {
      ...railsTaskDefaults,
      capacity: serviceCapacity,
      transform: {
        taskDefinition: taskDefinitionSecretDependencyTransform,
        ...singleTaskDeploymentTransform,
      },
    };
```

- [ ] **Step 5: Pin the existing stage-specific bastion images**

Immediately before the VPC declaration, select the approved image and add the transform:

```ts
    const bastionAmi = isProduction
      ? "ami-0a2a049c945b84826"
      : "ami-08c28b6151a0ba92f";
    const vpc = new sst.aws.Vpc("GalaVpc", {
      az: 2,
      bastion: true,
      transform: {
        bastionInstance: (args: any) => {
          args.ami = bastionAmi;
        },
      },
    });
```

- [ ] **Step 6: Run contracts and TypeScript checks and verify GREEN**

Run:

```bash
ruby scripts/ops/test-sst-dev-runtime-contracts.rb
cd infra && npx tsc --noEmit
```

Expected: `PASS sst dev runtime contracts`, followed by a zero-exit TypeScript check.

- [ ] **Step 7: Commit the resource-graph fix**

```bash
git add infra/sst.config.ts scripts/ops/test-sst-dev-runtime-contracts.rb
git commit -m "Stabilize SST OAuth secret resource graph"
```

---

### Task 2: Build the exact pending-operation editor

**Files:**
- Create: `scripts/ops/edit-sst-pending-operations.rb`
- Create: `scripts/ops/test-edit-sst-pending-operations.rb`

**Interfaces:**
- Consumes editor mode: `edit-sst-pending-operations.rb CHECKPOINT_PATH`
- Consumes verification mode: `edit-sst-pending-operations.rb --verify BEFORE_PATH AFTER_PATH`
- Produces exit 0 only when the exact two pending operations are removed and all other JSON fields are structurally equal.

- [ ] **Step 1: Write isolated failing tests for exact-match, rejection, and preservation behavior**

Create `scripts/ops/test-edit-sst-pending-operations.rb` using `JSON`, `Open3`, and `Dir.mktmpdir`. Build checkpoints under `checkpoint.latest` and cover these cases:

```ruby
cases = {
  "exact operations are removed" => [EXPECTED_OPERATIONS, true],
  "missing operation is rejected" => [EXPECTED_OPERATIONS.take(1), false],
  "additional operation is rejected" => [EXPECTED_OPERATIONS + [{ "type" => "deleting", "resource" => { "urn" => "urn:unexpected" } }], false],
  "wrong operation type is rejected" => [EXPECTED_OPERATIONS.map.with_index { |op, index| index.zero? ? op.merge("type" => "updating") : op }, false],
}.freeze
```

For the success case, assert `pending_operations == []` and that a deep copy with `pending_operations` removed equals the original. Add `--verify` tests that accept the exact before/after pair and reject a changed `resources` array.

- [ ] **Step 2: Run the state-editor test and verify RED**

Run:

```bash
ruby scripts/ops/test-edit-sst-pending-operations.rb
```

Expected: FAIL because `scripts/ops/edit-sst-pending-operations.rb` does not exist.

- [ ] **Step 3: Implement the guarded editor and verifier**

Create `scripts/ops/edit-sst-pending-operations.rb` with these exact constants and rules:

```ruby
#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"

EXPECTED_OPERATIONS = [
  {
    "type" => "creating",
    "urn" => "urn:pulumi:dev::gala::sst:aws:Redis$aws:elasticache/replicationGroup:ReplicationGroup::GalaCacheCluster",
  },
  {
    "type" => "creating",
    "urn" => "urn:pulumi:dev::gala::sst:aws:Service$docker-build:index:Image::GalaWorkerImageGalaWorker",
  },
].freeze

def load_checkpoint(path)
  JSON.parse(File.binread(path))
end

def pending_operations(checkpoint)
  checkpoint.fetch("checkpoint").fetch("latest").fetch("pending_operations")
end

def operation_identity(operation)
  {
    "type" => operation.fetch("type"),
    "urn" => operation.fetch("resource").fetch("urn"),
  }
end

def require_expected_pending!(checkpoint)
  actual = pending_operations(checkpoint).map { |operation| operation_identity(operation) }
  return if actual.sort_by { |item| [item.fetch("type"), item.fetch("urn")] } ==
    EXPECTED_OPERATIONS.sort_by { |item| [item.fetch("type"), item.fetch("urn")] }

  raise "refusing state edit: pending operation set does not exactly match the approved two records"
end

def without_pending(checkpoint)
  copy = Marshal.load(Marshal.dump(checkpoint))
  copy.fetch("checkpoint").fetch("latest").delete("pending_operations")
  copy
end

def verify_pair!(before, after)
  require_expected_pending!(before)
  raise "refusing verification: edited pending_operations is not empty" unless pending_operations(after).empty?
  raise "refusing verification: state changed outside pending_operations" unless without_pending(before) == without_pending(after)
end

if ARGV.first == "--verify"
  raise "usage: #{$PROGRAM_NAME} --verify BEFORE AFTER" unless ARGV.length == 3
  verify_pair!(load_checkpoint(ARGV[1]), load_checkpoint(ARGV[2]))
  puts "PASS exact pending-operation reconciliation"
  exit 0
end

raise "usage: #{$PROGRAM_NAME} CHECKPOINT" unless ARGV.length == 1
path = ARGV.fetch(0)
before = load_checkpoint(path)
require_expected_pending!(before)
after = Marshal.load(Marshal.dump(before))
after.fetch("checkpoint").fetch("latest")["pending_operations"] = []
verify_pair!(before, after)
File.open(path, "wb", 0o600) { |file| file.write(JSON.pretty_generate(after) << "\n") }
puts "Removed exactly two approved pending-operation records; no other state field changed."
```

Make only the new editor executable:

```bash
chmod 0755 scripts/ops/edit-sst-pending-operations.rb
```

- [ ] **Step 4: Run editor tests and verify GREEN**

Run:

```bash
ruby scripts/ops/test-edit-sst-pending-operations.rb
```

Expected: a PASS line for each rejection/preservation case and final exit 0.

- [ ] **Step 5: Commit the state editor**

```bash
git add scripts/ops/edit-sst-pending-operations.rb scripts/ops/test-edit-sst-pending-operations.rb
git commit -m "Guard SST pending operation reconciliation"
```

---

### Task 3: Build the fail-closed SST preview verifier

**Files:**
- Create: `scripts/ops/verify-sst-google-oauth-preview.rb`
- Create: `scripts/ops/test-verify-sst-google-oauth-preview.rb`

**Interfaces:**
- Consumes: `verify-sst-google-oauth-preview.rb DIFF_JSON OLD_PREVIEW_HOST NEW_PREVIEW_HOST`
- Consumes SST 4.7.1 `sst diff --json` output as a JSON array.
- Produces: exit 0 plus a value-free resource summary only for the approved diff.

- [ ] **Step 1: Write synthetic verifier tests**

Create a minimal accepted JSON array containing:

- One `create` event for each Google `sst:sst:Secret`, `sst:sst:LinkRef`, and `aws:ssm/parameter:Parameter` URN.
- `create-replacement`, `replace`, and `delete-replaced` events for each of the six expected task-definition names; require `diffs == ["containerDefinitions"]` on the first two operations.
- `update` events for `GalaWebService` and `GalaWorkerService` with `diffs == ["taskDefinition"]`.
- Secret-link metadata updates for the four standalone tasks only, with diffs limited to `include` and `properties`; these are treated as internal state metadata belonging to the six task-definition revisions, not extra cloud mutations.
- Route creations whose URNs contain `NEW_PREVIEW_HOST` and route deletions whose URNs contain `OLD_PREVIEW_HOST`.
- Read-only events for the external `GalaMediaBucket` and shared router distribution.

Then derive rejection cases by adding one forbidden event for each of these types:

```ruby
FORBIDDEN_TYPES = %w[
  aws:s3/bucket:Bucket
  aws:ses/domainIdentity:DomainIdentity
  aws:lb/loadBalancer:LoadBalancer
  aws:cloudfront/distribution:Distribution
  aws:cloudwatch/logGroup:LogGroup
  aws:appautoscaling/target:Target
  aws:ec2/instance:Instance
  aws:rds/instance:Instance
  aws:elasticache/replicationGroup:ReplicationGroup
].freeze
```

Also reject: a seventh task definition, `volumes` in task-definition diffs, a third ECS service, a base `dev.learngala.dev` route deletion, the wrong old/new preview host, an extra Google resource, and malformed JSON.

- [ ] **Step 2: Run verifier tests and verify RED**

Run:

```bash
ruby scripts/ops/test-verify-sst-google-oauth-preview.rb
```

Expected: FAIL because the verifier does not exist.

- [ ] **Step 3: Implement exact-set validation**

In `scripts/ops/verify-sst-google-oauth-preview.rb`, define exact Google keys and task names, parse the three arguments, and validate in this order:

```ruby
GOOGLE_KEYS = %w[
  GOOGLE_CLIENT_ID
  GOOGLE_CLIENT_SECRET
  GOOGLE_MIGRATION_CLIENT_ID
  GOOGLE_MIGRATION_CLIENT_SECRET
].freeze

TASKS = %w[
  GalaWebTask
  GalaWorkerTask
  GalaMigrateTask
  GalaSeedDatabaseTask
  GalaRefreshIndicesTask
  GalaWeeklyReportTask
].freeze

SERVICES = %w[GalaWebService GalaWorkerService].freeze
STANDALONE_LINK_REFS = %w[
  GalaMigrateLinkRef
  GalaSeedDatabaseLinkRef
  GalaRefreshIndicesLinkRef
  GalaWeeklyReportLinkRef
].freeze
READ_ONLY_OPS = %w[read read-replacement same].freeze
```

Use the final URN segment as the logical name. Require the 12 exact Google `(type, name, op)` triples. Require every task to have exactly the three replacement lifecycle operations and no diff key except `containerDefinitions`. For each `create-replacement`, parse old and new `containerDefinitions`, remove only the four newly added Google secret entries and the approved `BASE_URL`/`GALA_PREVIEW_PR_NUMBER` host turnover, and require the remaining structures to be equal. Require exactly the two service pointer updates. Allow only the four exact standalone LinkRef metadata updates with diff keys from `include` and `properties`. Derive route markers from the first DNS label (`pr-787` and `pr-790`); require every created route URN to contain the new marker, every deleted route URN to contain the old marker, at least one event in each direction, and no other route mutation. Ignore only read-only operations after confirming their operation name. Reject every remaining event with its operation, type, and logical name; do not print inputs, outputs, or detailed secret-bearing properties.

End success output with:

```ruby
puts "PASS approved SST Google OAuth preview"
puts "Google creates: 12; task revisions: 6; service pointers: 2; preview route turnover: approved"
```

- [ ] **Step 4: Run verifier tests and verify GREEN**

Run:

```bash
ruby scripts/ops/test-verify-sst-google-oauth-preview.rb
```

Expected: all accepted/rejected cases pass and the process exits 0.

- [ ] **Step 5: Commit the preview verifier**

```bash
git add scripts/ops/verify-sst-google-oauth-preview.rb scripts/ops/test-verify-sst-google-oauth-preview.rb
git commit -m "Verify the SST OAuth reconciliation diff"
```

---

### Task 4: Integrate repository verification and document the operator boundary

**Files:**
- Modify: `.github/workflows/ci.yml:209`
- Modify: `docs/ops/staged-google-oauth-deployment-findings.md`

**Interfaces:**
- Consumes the two new Ruby test scripts from Tasks 2 and 3.
- Produces a CI contracts command that exercises all reconciliation safety checks without cloud credentials.

- [ ] **Step 1: Add a failing workflow contract assertion**

In `scripts/ops/test-workflow-architecture-defaults.rb`, add:

```ruby
ci_text = workflow_text("ci.yml")
assert("ci.yml: contracts must test SST state reconciliation and preview allowlisting") do
  ci_text.include?("ruby scripts/ops/test-edit-sst-pending-operations.rb") &&
    ci_text.include?("ruby scripts/ops/test-verify-sst-google-oauth-preview.rb")
end
```

- [ ] **Step 2: Run the workflow contract and verify RED**

Run:

```bash
ruby scripts/ops/test-workflow-architecture-defaults.rb
```

Expected: FAIL at the new CI reconciliation assertion.

- [ ] **Step 3: Add both tests to the existing CI contracts suite**

Replace the contracts command in `.github/workflows/ci.yml` with:

```yaml
          run_suite contracts "ops contracts" "ruby scripts/ops/test-workflow-architecture-defaults.rb && ruby scripts/ops/test-sst-dev-runtime-contracts.rb && ruby scripts/ops/test-edit-sst-pending-operations.rb && ruby scripts/ops/test-verify-sst-google-oauth-preview.rb" 120
```

- [ ] **Step 4: Update the findings document with exact operational rules**

Append a `## Approved reconciliation slice` section to `docs/ops/staged-google-oauth-deployment-findings.md` recording:

- The deterministic parameter-name plus explicit-dependency solution.
- Dev AMI `ami-08c28b6151a0ba92f` and production AMI `ami-0a2a049c945b84826`.
- The two exact pending-operation URNs.
- The versioned-backup, concurrent-version check, `sst state edit`, readback, and `sst diff --json` sequence.
- The explicit prohibition on deploy, refresh, production-state edits, S3/SES changes, and automatic rollback.

- [ ] **Step 5: Run all repository-level safety checks**

Run:

```bash
ruby scripts/ops/test-workflow-architecture-defaults.rb
ruby scripts/ops/test-sst-dev-runtime-contracts.rb
ruby scripts/ops/test-edit-sst-pending-operations.rb
ruby scripts/ops/test-verify-sst-google-oauth-preview.rb
git diff --check
```

Expected: both existing scripts print their PASS lines, all new cases pass, and `git diff --check` is silent.

- [ ] **Step 6: Commit CI and operator documentation**

```bash
git add .github/workflows/ci.yml scripts/ops/test-workflow-architecture-defaults.rb docs/ops/staged-google-oauth-deployment-findings.md
git commit -m "Test SST reconciliation safety controls"
```

---

### Task 5: Reconcile the dev checkpoint and prove the clean preview

**Files:**
- Read: `scripts/ops/edit-sst-pending-operations.rb`
- Read: `scripts/ops/verify-sst-google-oauth-preview.rb`
- Create outside repository: the permission-restricted directory stored in `$BACKUP_DIR`.
- Do not stage: `infra/sst-env.d.ts`

**Interfaces:**
- Consumes AWS profile `gala`, region `us-west-2`, bucket `sst-state-zdasdfxbxnba`, key `app/gala/dev.json`.
- Consumes old preview host `pr-787.dev.learngala.dev` and intended host `pr-790.dev.learngala.dev`.
- Produces a versioned state backup, value-free metadata evidence, before/after structural verification, and accepted JSON diff. Produces no deployment.

- [ ] **Step 1: Run verification-before-mutation checks**

Run the complete focused suite again and require zero exits:

```bash
ruby scripts/ops/test-workflow-architecture-defaults.rb
ruby scripts/ops/test-sst-dev-runtime-contracts.rb
ruby scripts/ops/test-edit-sst-pending-operations.rb
ruby scripts/ops/test-verify-sst-google-oauth-preview.rb
cd infra && npx tsc --noEmit
```

Expected: all PASS and TypeScript exits 0.

- [ ] **Step 2: Create a permission-restricted backup directory and capture the current version**

From the repository root:

```bash
umask 077
BACKUP_DIR="/private/tmp/gala-sst-reconciliation-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -m 700 "$BACKUP_DIR"
aws --region us-west-2 --profile gala s3api head-object --bucket sst-state-zdasdfxbxnba --key app/gala/dev.json > "$BACKUP_DIR/before-head.json"
VERSION_ID="$(jq -er '.VersionId' "$BACKUP_DIR/before-head.json")"
aws --region us-west-2 --profile gala s3api list-object-versions --bucket sst-state-zdasdfxbxnba --prefix app/gala/dev.json > "$BACKUP_DIR/before-versions.json"
aws --region us-west-2 --profile gala s3api get-object --bucket sst-state-zdasdfxbxnba --key app/gala/dev.json --version-id "$VERSION_ID" "$BACKUP_DIR/dev-state.before.json" > "$BACKUP_DIR/get-object.json"
shasum -a 256 "$BACKUP_DIR/dev-state.before.json" > "$BACKUP_DIR/dev-state.before.sha256"
cd infra
AWS_REGION=us-west-2 AWS_DEFAULT_REGION=us-west-2 AWS_PROFILE=gala npx sst state export --stage dev > "$BACKUP_DIR/dev-state.before-export.json"
cd ..
```

Expected: all files are mode 0600 or stricter and `VERSION_ID` is non-empty. Print only version ID, ETag, content length, last-modified timestamp, and SHA-256; do not print checkpoint JSON.

- [ ] **Step 3: Assert the exact original pending-operation set**

Run the editor against a disposable copy, then verify it against the untouched backup:

```bash
cp "$BACKUP_DIR/dev-state.before.json" "$BACKUP_DIR/dev-state.expected-after.json"
ruby scripts/ops/edit-sst-pending-operations.rb "$BACKUP_DIR/dev-state.expected-after.json"
ruby scripts/ops/edit-sst-pending-operations.rb --verify "$BACKUP_DIR/dev-state.before.json" "$BACKUP_DIR/dev-state.expected-after.json"
```

Expected: `PASS exact pending-operation reconciliation` with no state content printed.

- [ ] **Step 4: Recheck the current S3 version immediately before mutation**

```bash
aws --region us-west-2 --profile gala s3api head-object --bucket sst-state-zdasdfxbxnba --key app/gala/dev.json > "$BACKUP_DIR/pre-edit-head.json"
test "$(jq -er '.VersionId' "$BACKUP_DIR/pre-edit-head.json")" = "$VERSION_ID"
```

Expected: `test` exits 0. Any mismatch is a hard stop.

- [ ] **Step 5: Perform the single authorized state edit**

From `infra/`, run SST with the one-purpose editor and no decrypt flag:

```bash
cd infra
EDITOR="../scripts/ops/edit-sst-pending-operations.rb" AWS_REGION=us-west-2 AWS_DEFAULT_REGION=us-west-2 AWS_PROFILE=gala npx sst state edit --stage dev
```

Expected: the editor reports removal of exactly two approved records and SST exits 0. Do not run another state command that mutates state.

- [ ] **Step 6: Read back and structurally verify the new state version**

From the repository root:

```bash
aws --region us-west-2 --profile gala s3api head-object --bucket sst-state-zdasdfxbxnba --key app/gala/dev.json > "$BACKUP_DIR/after-head.json"
AFTER_VERSION_ID="$(jq -er '.VersionId' "$BACKUP_DIR/after-head.json")"
test "$AFTER_VERSION_ID" != "$VERSION_ID"
aws --region us-west-2 --profile gala s3api list-object-versions --bucket sst-state-zdasdfxbxnba --prefix app/gala/dev.json > "$BACKUP_DIR/after-versions.json"
aws --region us-west-2 --profile gala s3api get-object --bucket sst-state-zdasdfxbxnba --key app/gala/dev.json --version-id "$AFTER_VERSION_ID" "$BACKUP_DIR/dev-state.after.json" > "$BACKUP_DIR/get-object-after.json"
ruby scripts/ops/edit-sst-pending-operations.rb --verify "$BACKUP_DIR/dev-state.before.json" "$BACKUP_DIR/dev-state.after.json"
cd infra
AWS_REGION=us-west-2 AWS_DEFAULT_REGION=us-west-2 AWS_PROFILE=gala npx sst state export --stage dev > "$BACKUP_DIR/dev-state.after-export.json"
cd ..
ruby scripts/ops/edit-sst-pending-operations.rb --verify "$BACKUP_DIR/dev-state.before-export.json" "$BACKUP_DIR/dev-state.after-export.json"
jq -n \
  --slurpfile before "$BACKUP_DIR/before-versions.json" \
  --slurpfile after "$BACKUP_DIR/after-versions.json" \
  --arg key app/gala/dev.json \
  --arg after_id "$AFTER_VERSION_ID" \
  '([($before[0].Versions // [])[] | select(.Key == $key) | .VersionId] | unique) as $old | ([($after[0].Versions // [])[] | select(.Key == $key) | .VersionId] | unique) as $new | (($new - $old) == [$after_id])' | rg -x true
```

Expected: the version changes once and structural verification passes. Preserve both version IDs. If verification fails, stop; do not automatically restore.

- [ ] **Step 7: Generate a workflow-equivalent, non-refreshing machine-readable preview**

Use the current deployed image/release inputs gathered read-only during diagnosis, changing only the intended PR preview metadata. From `infra/`, run:

```bash
AWS_REGION=us-west-2 \
AWS_DEFAULT_REGION=us-west-2 \
AWS_PROFILE=gala \
SST_STAGE=dev \
CLOUDFLARE_DEFAULT_ACCOUNT_ID="$CLOUDFLARE_ACCOUNT_ID" \
GALA_CONTAINER_ARCHITECTURE=arm64 \
GALA_APP_IMAGE_URI=353760060567.dkr.ecr.us-west-2.amazonaws.com/gala:27522834795.20260615035015.2b808a57 \
GALA_RELEASE_ID=27522834795.20260615035015.2b808a57 \
GALA_ASSET_PREFIX=releases/dev/27522834795.20260615035015.2b808a57 \
GALA_PREVIEW_HOST=pr-790.dev.learngala.dev \
GALA_BASE_URL=https://pr-790.dev.learngala.dev \
GALA_ROUTE_PREVIEW_HOST=true \
GALA_PREVIEW_PR_NUMBER=790 \
GITHUB_RUN_ID=27522834795 \
GITHUB_SHA=2b808a57345f7cf1c975013c98c6e92da978bd64 \
RELEASE=latest \
npx sst diff --stage dev --json > "$BACKUP_DIR/sst-diff.json"
```

Expected: SST exits 0 and writes valid JSON. This command must not be preceded by `sst refresh` and must not be followed by `sst deploy`.

- [ ] **Step 8: Run the fail-closed preview verifier**

From the repository root:

```bash
ruby scripts/ops/verify-sst-google-oauth-preview.rb \
  "$BACKUP_DIR/sst-diff.json" \
  pr-787.dev.learngala.dev \
  pr-790.dev.learngala.dev
```

Expected:

```text
PASS approved SST Google OAuth preview
Google creates: 12; task revisions: 6; service pointers: 2; preview route turnover: approved
```

Any other result is a stop condition. Report the value-free `(operation, type, logical name, diff keys)` summary and do not deploy.

- [ ] **Step 9: Run final repository verification and inspect scope**

```bash
ruby scripts/ops/test-workflow-architecture-defaults.rb
ruby scripts/ops/test-sst-dev-runtime-contracts.rb
ruby scripts/ops/test-edit-sst-pending-operations.rb
ruby scripts/ops/test-verify-sst-google-oauth-preview.rb
cd infra && npx tsc --noEmit
git diff --check
git status --short
```

Expected: tests pass; only intentional repository files plus the user's pre-existing paths appear. Do not stage or commit generated `infra/sst-env.d.ts` without separately comparing it and obtaining approval.

## Completion evidence

The handoff must include:

- Commit IDs for Tasks 1 through 4.
- Original and new S3 state version IDs, metadata, and SHA-256 values without checkpoint contents.
- Confirmation that the before/after state verifier passed.
- The value-free accepted preview summary.
- Explicit confirmation that no deploy, refresh, production-state edit, Heroku write, S3 resource mutation, SES mutation, or automatic rollback occurred.
