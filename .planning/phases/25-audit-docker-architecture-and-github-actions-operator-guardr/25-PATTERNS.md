# Phase 25 Pattern Map

## Pattern Mapping Complete

## Files and Roles

| File | Role | Closest Pattern |
|------|------|-----------------|
| `.github/workflows/deploy.yml` | Existing manual deploy workflow | Keep `workflow_dispatch`, typed inputs, OIDC, release metadata, and step summaries; split operator intents where side effects differ. |
| `.github/workflows/preview.yml` | Existing preview deploy workflow | Reuse preview URL and PR comment logic, but reconcile automatic PR triggers with the manual-operator requirement. |
| `scripts/deploy-sst.sh` | Existing guardrail and deploy helper | Reuse validation functions, `run_ecs_task_from_outputs`, immutable asset sync, CloudFront invalidation, and release metadata normalization. |
| `infra/sst.config.ts` | SST service/task source of truth | Reuse `webImage`, task outputs, service names, shared env/secrets, and CloudFront distribution outputs. |
| `CODEOWNERS` | Review authority boundary | Extend existing CI/CD ownership to docs and any new ops helper paths. |
| `docs/aws-production-operator-runbook.md` | Historical long-form runbook | Mine for facts; do not preserve its long tutorial style in the new manpage pages. |
| `docs/aws-sst-secret-inventory.md` | Secret name inventory | Reference secret names and boundaries; do not duplicate secret values. |

## Established Patterns to Preserve

- Use GitHub OIDC and `id-token: write` for AWS access; do not introduce long-lived AWS keys.
- Scope `GITHUB_TOKEN` permissions to what each workflow needs.
- Validate actor permissions before AWS credentials or mutation-heavy steps where possible.
- Keep `dry_run` as a first-class input and publish results to `GITHUB_STEP_SUMMARY`.
- Use immutable release IDs and asset prefixes under `releases/<stage>/<release_id>/`.
- Keep Heroku production and `.com` DNS out of scope.
- Reject Heroku database/cache connection strings and secret-looking user payloads.
- Use ECS one-off tasks for Rails operations against AWS DB/Redis.

## Data Flow and Safety Flow

1. Operator dispatches a manual workflow with typed inputs.
2. Workflow validates actor, target stage, confirmation phrase, branch/ref/artifact, and dry-run mode.
3. Workflow assumes AWS role through OIDC only after authorization and input validation.
4. Dry run prints side effects, resolved resources, commands that would run, and verification/rollback paths.
5. Mutating path invokes SST, AWS CLI, or ECS task helpers with allowlisted operations.
6. Workflow writes summary links, resource IDs, preview URL or release URL, and post-run verification instructions.
7. Operator docs provide the terse one-page recipe for the same workflow.

## Implementation Landmines

- Do not make `maintenance.yml` an arbitrary shell runner. It must map operator inputs to hard-coded ECS task commands.
- Do not let production promotion and dev preview share a confusing side-effect surface. If they reuse internals, keep operator-facing workflows distinct.
- Do not remove preview PR comments; keep them when a preview environment is created and an open PR can be found.
- Do not turn PR merge-to-base into a mutating dispatch job. Document protected-branch expectations instead.
- Do not hide migrations under freeform `user_data` if a clearer maintenance operation can express them.
- Do not repeat secret values or encrypted credential contents in docs, summaries, or plan artifacts.

