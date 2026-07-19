# Repository Artifact Cleanup Design

## Goal

Remove generated repository artifacts and retired Nathan-authored scripts without deleting local work records or potentially useful manual AWS operations.

## Tracked artifact cleanup

- Remove `.work/` from Git tracking, retain the local directory, and add `/.work/` to `.gitignore`.
- Delete `.githooks/pre-commit`. Do not ignore `.githooks/`; a future hook should require an intentional tracked change.

## Script cleanup

Delete scripts that are superseded, one-time migration tools, broken because their required configuration no longer exists, or used only by the removed hook:

- `scripts/ci/post-commit-status.mjs`
- `scripts/ci/validation-report.mjs`
- `scripts/ci/validation-report.test.mjs`
- `scripts/deploy-gala-aws-production.sh`
- `scripts/fixA-namespace-codemod.mjs`
- `scripts/fixF-icon-codemod.mjs`
- `scripts/ops/test-platform-constants.mjs`
- `scripts/ops/validate-operator-docs.sh`
- `scripts/read-platform-constant.mjs`
- `scripts/scan-staged-secrets`

Keep active scripts, scripts authored by other contributors, and manual operational tools that remain useful even without code references. In particular, retain spend reporting and S3 CORS verification; this cleanup must not mutate AWS resources.

## Verification

- Confirm `.work/` still exists locally, has no tracked paths, and is ignored.
- Confirm `.githooks/` and every selected script are absent from the Git tree.
- Confirm retained scripts remain tracked.
- Search active code, workflows, package scripts, and documentation for broken references, excluding historical release notes.
- Run the SST configuration contract test, JavaScript tests, workflow YAML parsing, and `git diff --check`.
- Push only after the worktree is clean and the cleanup commit is verified.
