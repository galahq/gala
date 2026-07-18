# Task 1 Remote Infrastructure Report

## Status

BLOCKED

The Slice 1 stop gate is active because both durable stages have reproducible non-empty SST diffs. No deploy, apply, refresh, remove, state edit, import, or resource mutation was performed.

## Commits

- `b6372cee` — `feat(infra): add canonical platform constants`
- `0dfcac19` — `feat(ops): add sanitized SST diff capture`
- `dab8752b` — `test(infra): characterize modular SST contracts`
- `99d508ea` — `fix(ops): bind SST install to requested stage`
- `d6d7e48a` — `fix(ops): accept SST array diff envelope`
- `0de6e51b` — `fix(ops): exclude tests from constant inventory`

## Owned files

- `infra/platform.constants.json`
- `.work/sst-ergonomic-platform-refactor/evidence/dev-reference-capture.json` (ignored evidence; not forced into Git)
- `.work/sst-ergonomic-platform-refactor/evidence/sst-diff-{dev,dev-repeat,production,production-repeat}.json` (ignored evidence; not forced into Git)
- `scripts/read-platform-constant.mjs`
- `scripts/ops/test-platform-constants.mjs`
- `scripts/ops/capture-sst-diff.sh`
- `scripts/ops/test-capture-sst-diff.sh`
- `scripts/ops/test-sst-module-boundaries.rb`
- `scripts/ops/test-sst-dev-runtime-contracts.rb`
- `scripts/ops/test-canonical-release-source-contract.rb`
- `scripts/ops/test-rapid-release-contract.sh`

## TDD RED/GREEN record

1. Canonical constants
   - RED: `node scripts/ops/test-platform-constants.mjs schema`
   - Result: exit 1, `ENOENT` for missing `infra/platform.constants.json`.
   - GREEN: `node scripts/ops/test-platform-constants.mjs schema`
   - Result: exit 0, `PASS platform constants schema`.
   - Inventory: `node scripts/ops/test-platform-constants.mjs inventory`; exit 0, 128 current executable duplicate-literal records after required test/generated exclusions. Enforcement is intentionally deferred to Slice 4.

2. Durable diff wrapper
   - RED: `bash scripts/ops/test-capture-sst-diff.sh`
   - Result: exit 127 because `scripts/ops/capture-sst-diff.sh` did not exist.
   - GREEN: same command; exit 0, `PASS capture sst diff`.
   - RED stage-binding regression: same command after requiring `SST_STAGE=dev`; exit 1, environment-contract failure.
   - GREEN stage-binding regression: same command after exporting the requested durable stage; exit 0.
   - RED actual-envelope regression: same command with a top-level JSON array fixture; exit 1, `sst diff stdout was not valid operation JSONL`.
   - Root cause: SST 4.7.1 emits one complete top-level JSON array, while the original stub modeled a stream of standalone JSON objects. Both carry the required `op`/`urn` semantics.
   - GREEN actual-envelope regression: same command after canonicalizing either one array document or an object stream; exit 0. Strict object and `op`/`urn` validation remains in place.

3. Inventory exclusions
   - RED: `node scripts/ops/test-platform-constants.mjs inventory >/tmp/inv-red.json`
   - Result: exit 1, `test files must be excluded from literal inventory`.
   - GREEN: `node scripts/ops/test-platform-constants.mjs schema; node scripts/ops/test-platform-constants.mjs inventory >/tmp/inv-green.json`
   - Result: exit 0; schema pass and 128 non-test executable duplicate-literal records.

## Authenticated read-only evidence

All AWS calls used `AWS_PROFILE=gala` and region `us-west-2`. The authenticated account was `353760060567`.

- `infra/.sst/outputs.json` passed `jq -e '.stage == "dev"'`; SHA-256 `f394ef77b918e60d664f9ab10d86e50ecb3a57c9b54293863429204f9c54a4bd`.
- VPC `vpc-030eda5dfde37d35b` exists and is `available`.
- ECS cluster `arn:aws:ecs:us-west-2:353760060567:cluster/gala-dev-GalaClusterCluster-zeeusfkv` exists and is `ACTIVE`.
- Subnets `subnet-0bc99b9bf9f1b2c1c` and `subnet-0afa22ca0b93a0ff8` are available, public-IP-on-launch, and both belong to the exact dev VPC.
- Security group `sg-02a6d5e6fb950d67f` belongs to the exact dev VPC.
- Static distribution `EUWPHB77806X0` is enabled/deployed, domain `d1ksvw16me8njk.cloudfront.net`, comment `gala-dev static assets`.
- Router distribution `E3FF4TTU9Q4XTY` is enabled/deployed, domain `d1ky1nvgqyxj8z.cloudfront.net`, comment `GalaAppRouter app`, with exact aliases `dev.learngala.dev`, `*.dev.learngala.dev`, and `learngala.dev`.
- Exactly one private Cloud Map namespace named `sst` had a Route53 hosted-zone association to the exact dev VPC: `ns-72l4igov24fwh2uk` / `sst`. The other exact `sst` namespace was associated with a different VPC.
- Credentialed Cloudflare `GET /client/v4/zones?name=learngala.dev` returned `success: true` and exactly one active result: zone `b95aebc5cd4c107a97157de72bd75627`, name `learngala.dev`. Credentials were not logged or recorded.

## Durable diff summaries

Commands (each wrapper run performed `npm ci --prefer-offline --no-audit --no-fund`, `npx sst install`, then only `npx sst diff --stage STAGE --json`):

- `scripts/ops/capture-sst-diff.sh dev --profile gala --output .work/sst-ergonomic-platform-refactor/evidence/sst-diff-dev.json`
- Exact repeat to `sst-diff-dev-repeat.json`
- `scripts/ops/capture-sst-diff.sh production --profile gala --output .work/sst-ergonomic-platform-refactor/evidence/sst-diff-production.json`
- Exact repeat to `sst-diff-production-repeat.json`

All successful captures recorded commit `d6d7e48a7a071f5cd4a492f971b89df4743c2c78`, constants SHA-256 `ddf2329522d3648943c0fd1cad3f040f10dea692632eea032fff04ddd263237d`, and zero statuses for dependency install, SST install, and SST diff. The later `0de6e51b` commit changes only the inventory test's exclusion rules and does not change infrastructure inputs.

- Dev: 37 operations on both runs; normalized operation SHA-256 `9d05c269d2d1755d349b8526d1fc73f18a1e2944315841397063ef862ff92b0f` on both runs. Counts: create 4, create-replacement 6, delete 3, delete-replaced 6, read 2, replace 6, update 10.
- Production: 100 operations on both runs; normalized operation SHA-256 `4479de82918ef71286fec4d66657e89507be6300e749a4f2501677b662d43bca` on both runs. Counts: create 30, create-replacement 7, delete 19, delete-replaced 9, read 1, remove-pending-replace 2, replace 7, update 25.

The identical repeats classify these as live baseline drift. No resource action was taken.

## Final local verification

The combined verification command exited 0:

- constants schema pass; non-failing inventory recorded
- diff wrapper stub suite pass
- SST module boundaries pass
- SST dev runtime contracts pass
- canonical release source contract pass
- rapid-release contract pass; Slice 4 malicious infra-plan fixtures emitted their explicit precondition skip because `scripts/lib/infra-plan.sh` does not yet exist
- infra Node tests: 8/8 pass
- infra TypeScript check: pass
- `git diff --check`: pass

## Concerns / stop gate

- AC2/AC3 clean durable baselines are not met: dev has 37 reproducible operations and production has 100 reproducible operations.
- The production plan includes destructive/replacement categories, including load balancer and ECS task-definition replacements plus deletes. It must not be applied.
- Source-only infrastructure refactoring must not proceed as though these are clean baselines. The drift requires separate review/reconciliation under the ticket's plan/review gate.
- Slice 4 infra-plan rejection fixtures are committed but intentionally skip until the library exists; once created, they execute automatically and fail if unsafe behavior is accepted.

## Important-review fixes

Commit `f51b9308aaccdd89cd79f4c1797959de1d6e8725` fixes both Important findings from `task-1-remote-review.md`.

### RED

- Command: `bash scripts/ops/test-capture-sst-diff.sh`
- Result: exit 1 with `FAIL: diagnostics leaked provider credential or signed URL value`.
- The hostile fixtures demonstrated that AWS access/session assignments, a Cloudflare API token assignment, and AWS/Google signed-URL credential/signature parameters could reach persisted diagnostics.

### GREEN

- Command: `bash scripts/ops/test-capture-sst-diff.sh`
- Result: exit 0 with `PASS capture sst diff`.
- The sanitizer now redacts provider access keys, secret keys, session/security tokens, API keys/tokens, credential assignments, and AWS/Google signed-URL credential/signature/security-token query parameters while retaining non-secret diagnostic structure.
- The suite proves every wrapper-handled unset: `DATABASE_URL`, `REDIS_HOST`, `REDIS_URL`, `CACHE_URL`, `GALA_EFFECTIVE_STAGE`, all image overrides, all release overrides, route/preview/domain overrides, architecture/Dockerfile overrides, and the remaining legacy custom-domain/Cloudflare/import toggles.
- The suite separately proves `AWS_REGION` and `AWS_DEFAULT_REGION`, explicit profile selection, local default `gala`, and profileless OIDC behavior.
- Separate fixtures prove exact nonzero propagation for npm ci (23), SST install (24), and SST diff (25), with no result publication.
- A hostile stderr fixture proves rejection when diagnostics indicate `refresh` and `apply`.

### Final check

- Command: `bash scripts/ops/test-capture-sst-diff.sh && git diff --check`
- Result: exit 0; wrapper suite passed and the diff check was clean.
- No authenticated SST diff was rerun. No deploy, apply, refresh, remove, state edit, import, or resource mutation occurred. Existing dev/production live-drift classification and operation parsing are unchanged.
