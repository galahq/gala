# Phase 26 Pattern Map

## Source Context

This map is derived from Phase 26 CONTEXT.md, Phase 26 RESEARCH.md, and the existing codebase maps for stack, integrations, and testing.

## Files and Closest Analogs

| Target | Role | Closest existing analogs | Notes for executor |
| --- | --- | --- | --- |
| `infra/sst.config.ts` | SST/ECS task simplification | Existing web/worker/task definitions in the same file | Keep resource names, commands, generated DB/cache values, SSM secrets, IAM policies, domains, and schedules auditable. |
| `.github/workflows/ci-validation.yml` | Advisory CI workflow | `.github/workflows/deploy.yml`, `.github/workflows/preview.yml` | Follow existing AWS/GitHub permissions style but do not deploy. Keep deploy workflow operator-driven. |
| `scripts/ci/validation-report.mjs` | Report generator | `scripts/deploy-sst.sh` for guarded operational output; `bin/run_ci_tests` for test orchestration | Produce deterministic JSON and ANSI/plain-text output. Redact sensitive key patterns. |
| `scripts/ci/post-commit-status.mjs` | GitHub REST commit status publisher | Existing GitHub release/PR comment workflow patterns | Build one status payload with `state`, `target_url`, `description`, and `context`. |
| `scripts/ci/validation-report.test.mjs` | Unit tests for CI scripts | Existing Jest helper tests and Node 24 runtime availability | Use Node built-in `node:test` to avoid expanding the legacy Jest app-only scope. |

## Established Patterns to Preserve

- AWS deploy operations are guarded by explicit stage/profile inputs.
- Heroku production and Heroku DB/Redis strings are excluded from AWS runtime config.
- Shared SES and retained S3 media resources must not be destructively changed.
- Preview and production deploy workflows are separate from advisory CI validation.
- CI reports should link to artifacts instead of committing generated output.

## Data Flow

1. CI workflow runs test commands and optional SST evidence commands.
2. Command results are normalized into JSON records with category, command, status, duration, summary, and artifact path.
3. Report generator merges test, changeset, contributor, commit count, SST diff, destructive warning, and release gate inputs.
4. Artifact upload returns a report URL.
5. Status publisher posts one GitHub commit status pointing to the report URL.
