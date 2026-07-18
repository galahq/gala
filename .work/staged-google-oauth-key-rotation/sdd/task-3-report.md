# Task 3 report: SST Google secrets and deploy workflow contracts

## Status

BLOCKED / NEEDS_CONTEXT. The contract-first source changes are GREEN, but the required tracked `infra/sst-env.d.ts` regeneration cannot complete safely because SST config evaluation requires a Cloudflare credential that is not available through the repository's standard environment loading. No generated type was hand-edited and no commit was created.

## TDD evidence

The two contract scripts were changed before the SST or workflow sources.

RED:

- `ruby scripts/ops/test-sst-dev-runtime-contracts.rb` exited 1 with `infra/sst.config.ts: SST must declare every retained Google OAuth secret without a fallback`.
- `ruby scripts/ops/test-workflow-architecture-defaults.rb` exited 1 with `deploy.yml: retained secret inventory must include every Google OAuth secret`.

GREEN after the minimal source changes:

- `ruby scripts/ops/test-sst-dev-runtime-contracts.rb` exited 0 with `PASS sst dev runtime contracts`.
- `ruby scripts/ops/test-workflow-architecture-defaults.rb` exited 0 with `PASS workflow architecture defaults`.
- `ruby -c scripts/ops/test-sst-dev-runtime-contracts.rb` and `ruby -c scripts/ops/test-workflow-architecture-defaults.rb` both reported `Syntax OK`.

## Type generation and validation

- `npm ci --prefer-offline --no-audit --no-fund` in `infra/` installed the lockfile-pinned dependencies, including SST 4.7.1.
- `AWS_PROFILE=gala SST_STAGE=dev npx sst install --stage dev` in `infra/` completed successfully with `✓ Installed providers` when run with approved network access.
- Provider installation did not change tracked `infra/sst-env.d.ts`; a name-only check confirmed the four Google resource names are still absent.
- `AWS_PROFILE=gala SST_STAGE=dev npx sst diff --stage dev` in `infra/` exited 1: `cloudflare: Cloudflare API not initialized. Please provide CLOUDFLARE_API_TOKEN or CLOUDFLARE_API_KEY and CLOUDFLARE_EMAIL...`.
- `direnv exec .. env AWS_PROFILE=gala SST_STAGE=dev npx sst diff --stage dev` in `infra/` loaded the repository `.envrc`, then exited 1 with the same Cloudflare initialization error.
- `npx tsc --noEmit` in `infra/` exited 2. Its first failure was `.sst/platform/config.d.ts(2,8): error TS2882: Cannot find module or type declarations for side-effect import of '../types.generated'`, followed by existing generated-platform/root dependency declaration conflicts. The missing generated types are consistent with SST config evaluation not completing.

No credential values were read or recorded. No deploy, AWS mutation, secret mutation/read, Heroku command, or Google Cloud action was run.

## Current tracked changes

- `.github/workflows/deploy.yml`: adds the four exact Google names to `RETAINED_SECRET_KEYS`.
- `infra/sst.config.ts`: declares four no-fallback retained `sst.Secret` resources and projects them through the existing `secretValueToParameter` SecureString map inherited by Rails service/task defaults.
- `scripts/ops/test-sst-dev-runtime-contracts.rb`: checks declarations, SecureString projections, both Rails services, and every Rails task.
- `scripts/ops/test-workflow-architecture-defaults.rb`: checks the deploy workflow retained-secret inventory.

Tracked `infra/sst-env.d.ts` is unchanged because safe regeneration is blocked. Root untracked `sst-env.d.ts`, `.env.google`, `.omx/`, `.work/` state files, `GCP_OAUTH.pdf`, and other untracked files were not staged or modified by this task.

## Self-review

- The four required names are exact and have no SST fallback argument.
- Every new projection calls `secretValueToParameter` with the same exact name and `resolveSecret` key.
- The existing `railsRuntimeSecrets -> railsTaskDefaults -> railsServiceDefaults` chain reaches both Rails services, while every Rails task spreads `railsTaskDefaults`.
- Workflow inventory coverage is additive and retains existing keys.
- The Ruby tests are data-driven from a single four-name inventory in each contract and fail on missing declarations/inventory.
- No unrelated tracked file is changed, and no intended tracked file was staged or committed.

## Blocker / required context

Provide the Cloudflare credential through the repository's approved standard environment mechanism, or provide an approved credential-free SST type-generation path. Then rerun `AWS_PROFILE=gala SST_STAGE=dev npx sst diff --stage dev`, verify only the four expected resource declarations appear in tracked `infra/sst-env.d.ts`, rerun focused contracts and TypeScript validation, review, and commit only the five intended tracked files.
