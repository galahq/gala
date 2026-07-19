# Repository Artifact Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove generated repository artifacts and retired Nathan-authored scripts while retaining local work records and useful operational tools.

**Architecture:** Treat `.work/` as local-only state by untracking and ignoring it, while deleting the unused Git hook outright. Delete only the scripts approved in the design; preserve active, third-party-authored, and manually useful AWS operations.

**Tech Stack:** Git, Bash, Ruby YAML parser, Node.js test runner, SST configuration contract tests

## Global Constraints

- Preserve the local `.work/` directory while removing every `.work/` path from Git tracking.
- Do not mutate AWS resources, S3 buckets, SES, Heroku, or SST state.
- Retain `scripts/ops/generate-spend-report.mjs` and `scripts/ops/sync-media-bucket-cors.sh`.
- Retain every script authored by another contributor.
- Keep the cleanup as one focused implementation commit after the already committed design record.

---

### Task 1: Remove generated repository artifacts

**Files:**
- Modify: `.gitignore`
- Remove from tracking only: `.work/**`
- Delete: `.githooks/pre-commit`

**Interfaces:**
- Consumes: Git's ignore and index behavior.
- Produces: A local-only `.work/` directory and no tracked `.githooks/` content.

- [ ] **Step 1: Record the preconditions**

Run:

```bash
test -d .work
test -n "$(git ls-files '.work/**')"
test "$(git ls-files '.githooks/**')" = '.githooks/pre-commit'
```

Expected: exit 0, proving the local work directory exists and both targets are currently tracked.

- [ ] **Step 2: Add the local work directory to `.gitignore`**

Add this entry beside the existing local workflow artifact exclusions:

```gitignore
/.work/
```

- [ ] **Step 3: Remove generated work records from the index and delete the hook**

Run:

```bash
git rm -r --cached -- .work
git rm -- .githooks/pre-commit
```

Expected: `.work/` remains on disk but is staged as deleted; `.githooks/pre-commit` is removed from disk and staged as deleted.

- [ ] **Step 4: Verify artifact behavior**

Run:

```bash
test -d .work
test -z "$(git ls-files '.work/**')"
git check-ignore -q .work/sst-ergonomic-platform-refactor/context.md
test -z "$(git ls-files '.githooks/**')"
```

Expected: exit 0.

### Task 2: Delete the approved retired scripts

**Files:**
- Delete: `scripts/ci/post-commit-status.mjs`
- Delete: `scripts/ci/validation-report.mjs`
- Delete: `scripts/ci/validation-report.test.mjs`
- Delete: `scripts/deploy-gala-aws-production.sh`
- Delete: `scripts/fixA-namespace-codemod.mjs`
- Delete: `scripts/fixF-icon-codemod.mjs`
- Delete: `scripts/ops/test-platform-constants.mjs`
- Delete: `scripts/ops/validate-operator-docs.sh`
- Delete: `scripts/read-platform-constant.mjs`
- Delete: `scripts/scan-staged-secrets`

**Interfaces:**
- Consumes: The exact approved deletion list from the design spec.
- Produces: A smaller `scripts/` tree with active and manual operations retained.

- [ ] **Step 1: Reconfirm that no active consumer uses a deletion candidate**

Run:

```bash
git grep -n -E 'deploy-gala-aws-production|post-commit-status|validation-report|fixA-namespace|fixF-icon|test-platform-constants|validate-operator-docs|read-platform-constant|scan-staged-secrets' -- ':!.work/**' ':!docs/superpowers/**' ':!docs/releases/**' ':!scripts/**'
```

Expected: only `infra/sst-config-contract.test.mjs` may match because it explicitly rejects legacy CI reporting behavior; no active consumer invokes a candidate.

- [ ] **Step 2: Delete the exact approved set**

Run:

```bash
git rm -- \
  scripts/ci/post-commit-status.mjs \
  scripts/ci/validation-report.mjs \
  scripts/ci/validation-report.test.mjs \
  scripts/deploy-gala-aws-production.sh \
  scripts/fixA-namespace-codemod.mjs \
  scripts/fixF-icon-codemod.mjs \
  scripts/ops/test-platform-constants.mjs \
  scripts/ops/validate-operator-docs.sh \
  scripts/read-platform-constant.mjs \
  scripts/scan-staged-secrets
```

Expected: all ten paths are staged as deleted.

- [ ] **Step 3: Verify retained script boundaries**

Run:

```bash
git ls-files --error-unmatch \
  scripts/baseline-from-prod.mjs \
  scripts/docker/db-init-restore.sh \
  scripts/ops/operator-common.sh \
  scripts/ops/generate-spend-report.mjs \
  scripts/ops/sync-media-bucket-cors.sh \
  scripts/copy_images.rb \
  scripts/test_aws.rb
```

Expected: all seven retained paths print and the command exits 0.

### Task 3: Verify, commit, and publish the cleanup

**Files:**
- Test: `.github/workflows/ci.yml`
- Test: `.github/workflows/deploy.yml`
- Test: `infra/sst-config-contract.test.mjs`
- Test: the staged Git tree

**Interfaces:**
- Consumes: Tasks 1 and 2 staged changes.
- Produces: One verified cleanup commit on `integration/react19-stable-sst` pushed to its matching remote branch.

- [ ] **Step 1: Parse workflow YAML and run the SST contract test**

Run:

```bash
ruby -e 'require "yaml"; YAML.parse_file(".github/workflows/ci.yml"); YAML.parse_file(".github/workflows/deploy.yml")'
node --test infra/sst-config-contract.test.mjs
```

Expected: both commands exit 0 and the Node test reports zero failures.

- [ ] **Step 2: Run JavaScript tests and diff validation**

Run:

```bash
mise exec -- pnpm test
git diff --cached --check
```

Expected: Vitest reports zero failures and the staged diff check exits 0.

- [ ] **Step 3: Verify the deletion and retention checklist**

Run:

```bash
test -d .work
test -z "$(git ls-files '.work/**' '.githooks/**')"
git check-ignore -q .work/sst-ergonomic-platform-refactor/context.md
test -z "$(git ls-files 'scripts/ci/**' 'scripts/deploy-gala-aws-production.sh' 'scripts/fixA-namespace-codemod.mjs' 'scripts/fixF-icon-codemod.mjs' 'scripts/ops/test-platform-constants.mjs' 'scripts/ops/validate-operator-docs.sh' 'scripts/read-platform-constant.mjs' 'scripts/scan-staged-secrets')"
```

Expected: exit 0.

- [ ] **Step 4: Review and commit the exact scope**

Run:

```bash
git status --short
git diff --cached --stat
git commit -m 'chore: remove retired repository tooling'
```

Expected: only `.gitignore`, `.work/`, `.githooks/pre-commit`, and the ten approved scripts are included in the implementation commit.

- [ ] **Step 5: Push and verify remote parity**

Run:

```bash
git push origin integration/react19-stable-sst
git fetch origin integration/react19-stable-sst
test "$(git rev-parse HEAD)" = "$(git rev-parse origin/integration/react19-stable-sst)"
```

Expected: push succeeds and the local and remote commit IDs match.
