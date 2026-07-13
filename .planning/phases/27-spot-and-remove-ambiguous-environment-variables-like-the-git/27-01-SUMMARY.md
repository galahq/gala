---
phase: 27
plan: 27-01
subsystem: aws-sst-task-env
tags:
  - sst
  - ecs
  - environment
  - validation
key-files:
  - infra/sst.config.ts
metrics:
  plans_completed: 1
  files_modified: 1
  blank_env_count_in_sst_diff: 0
  sst_diff_exit: 0
---

# Phase 27 Plan 27-01 Summary

## Outcome

Implemented central blank-like plaintext runtime environment filtering for SST-generated ECS task definitions.

## Changes

- Added `compactRuntimeEnvironment` in `infra/sst.config.ts`.
- The helper omits `null`, `undefined`, `""`, and whitespace-only string values.
- Routed the shared `railsRuntimeEnvironment` through the helper before it reaches ECS service/task defaults.
- Removed empty-string fallback behavior for optional metadata env entries: `GITHUB_RUN_ID`, `COMMIT_SHA`, and `RELEASE_URL` now omit when absent.
- Preserved SSM/ECS secret bindings separately through `railsRuntimeSecrets`.
- Preserved explicit web, worker, migration, seed, refresh, and scheduled task commands.

## Validation

| Check | Result | Evidence |
| --- | --- | --- |
| Source helper assertion | PASS | `rg -n "compactRuntimeEnvironment|trim\(\)|railsRuntimeEnvironment|GITHUB_RUN_ID|COMMIT_SHA|RELEASE_URL" infra/sst.config.ts` found the helper and compacted env boundary. |
| Blank `GIT_*` assertion | PASS | `rg -n 'GIT_[A-Z0-9_]+.*(""|``)' infra/sst.config.ts || true` produced no matches. |
| Read-only SST diff | PASS | `sst diff --stage dev --json` exited 0 and wrote `/tmp/phase27-sst-diff.json`. |
| Rendered blank env scan | PASS | Parsed `containerDefinitions` in `/tmp/phase27-sst-diff.json`; blank env count was 0. |
| Mutation boundary | PASS | No `sst deploy`, Heroku mutation, or production DNS mutation was run. |

## Diff Warning

`/tmp/phase27-sst-diff.json` includes ECS task-definition replacement operations for dev task definitions (`GalaWebTask`, `GalaWorkerTask`, `GalaMigrateTask`, `GalaSeedDatabaseTask`, `GalaRefreshIndicesTask`, and `GalaWeeklyReportTask`). This is expected for rendered ECS task-definition environment changes, but remains operator-visible because Phase 27 uses diff evidence only and does not deploy.

## Commits

| Commit | Description |
| --- | --- |
| 62fad0fb | Filter blank ECS task env values. |

## Deviations

None.

## Self-Check: PASSED

- Must-haves MH-01 through MH-08 are satisfied.
- No secret values were copied into source, summary, or validation notes.
- No deploy, Heroku mutation, or production DNS mutation occurred.
