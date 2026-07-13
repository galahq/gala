---
phase: 27
status: complete
created: 2026-06-01
---

# Phase 27 Research: Blank Task-Definition Environment Cleanup

## Research Question

What needs to be known to plan a safe cleanup of ambiguous blank environment variables emitted into ECS task definitions by the SST configuration?

## Findings

### Task-definition environment values should be absent when semantically unset

Blank environment values in ECS task definitions are valid from the container scheduler's perspective, but they are ambiguous for operators and runtime code. A variable such as `GIT_BRANCH=""` or `GIT_COMMIT_SHA=""` looks intentionally configured while conveying no useful metadata. For deploy/audit surfaces, absence is clearer than a blank value.

### Phase 26 created the right centralization point

Phase 26 centralized Rails runtime environment, runtime secrets, container image, service defaults, and task defaults in `infra/sst.config.ts`. That structure makes this phase a narrow source cleanup: filter blank-like runtime env values once at the shared environment construction boundary rather than editing every ECS web, worker, migration, seed, refresh, and scheduled task definition independently.

### Scope should stay source-first and non-mutating

The user selected `infra/sst.config.ts` as the source of truth and `sst diff --stage dev` as read-only rendered evidence. This phase does not require live ECS task-definition inspection and does not perform deploys. The diff should be used to confirm that SST can render the changed infrastructure and that no unexpected destructive change is introduced by the source cleanup.

### Filtering rule should be explicit and broad

The selected cleanup rule is categorical: remove `""`, whitespace-only strings, `null`, and `undefined` from generated task-definition environment entries. The rule applies to all task-definition env entries, not only `GIT_*`. There is no allowlist for intentionally blank variables.

## Candidate Implementation Approach

1. Add a small helper in `infra/sst.config.ts`, for example `compactRuntimeEnvironment`, that accepts a `Record<string, string | null | undefined>` and returns a `Record<string, string>` containing only values where `value != null` and `value.trim().length > 0`.
2. Apply the helper at the shared Rails runtime environment object boundary, before that environment is attached to ECS service/task defaults.
3. Keep task-specific commands, secrets, image, architecture, and capacity configuration explicit and unchanged.
4. Remove any hard-coded blank `GIT_*` entries if they are currently present, or route them through the helper if the value is computed and may be blank.
5. Verify with source assertions and read-only `sst diff --stage dev`.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Accidentally removing a value Rails expects to exist but blank | User selected no allowlist; if a future runtime truly needs a blank value, it should use an explicit non-blank sentinel in a separate phase. |
| Filtering secrets accidentally | Apply the helper only to plaintext runtime environment entries, not the SSM/ECS secrets map. |
| TypeScript inference gets weaker around env object values | Keep the helper typed and return the concrete environment shape expected by SST. |
| `sst diff` needs stage/base-image/router env context | Use the known dev-stage context and existing Phase 26 diff invocation pattern; do not deploy. |

## Validation Architecture

### Static Source Assertions

- `infra/sst.config.ts` defines a named blank-filter helper such as `compactRuntimeEnvironment`.
- The helper rejects `null`, `undefined`, `""`, and whitespace-only strings using a trim-based predicate.
- The shared Rails runtime environment is passed through the helper before ECS service/task definitions consume it.
- No blank-value allowlist is introduced.
- No task-specific command is changed as part of the cleanup.

### Rendered Read-Only Evidence

Run `sst diff --stage dev` from `infra/` with explicit AWS/stage context and no deploy. The diff should complete successfully and should not report destructive infrastructure replacement attributable to this cleanup.

Recommended command shape:

```sh
cd infra && \
  AWS_PROFILE=gala \
  AWS_REGION=us-west-2 \
  SST_STAGE=dev \
  GALA_PRODUCTION_BASE_IMAGE=353760060567.dkr.ecr.us-west-2.amazonaws.com/gala-production-base:ruby4.0.3-bookworm-pg17-runtime-v1 \
  GALA_ROUTER_DISTRIBUTION_ID=E3FF4TTU9Q4XTY \
  npx sst diff --stage dev --json > /tmp/phase27-sst-diff.json
```

### Out of Scope for Validation

- No `sst deploy`.
- No Heroku CLI mutation.
- No production DNS mutation.
- No live ECS task-definition inspection unless `sst diff` cannot provide enough rendered evidence.

## RESEARCH COMPLETE
