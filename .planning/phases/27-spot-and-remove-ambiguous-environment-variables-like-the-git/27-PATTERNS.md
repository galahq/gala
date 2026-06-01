---
phase: 27
status: complete
created: 2026-06-01
---

# Phase 27 Pattern Map

## Files to Modify

| File | Role | Pattern to Reuse |
| --- | --- | --- |
| `infra/sst.config.ts` | SST source of truth for ECS services/tasks and runtime environment | Reuse Phase 26 shared `railsRuntimeEnvironment`, `railsRuntimeSecrets`, `railsTaskDefaults`, and `railsServiceDefaults` structure. |

## Analog Patterns

### Shared Runtime Environment Boundary

Phase 26 centralized repeated task-definition defaults in `infra/sst.config.ts`. Phase 27 should add blank filtering at that shared boundary, not inside each individual web/worker/task declaration.

### Secrets Stay Separate

Sensitive values belong in the existing SSM/ECS secret binding path. The blank-env cleanup helper should operate only on plaintext runtime environment maps and must not stringify or inspect secret values.

### Auditability Over Abstraction

Task-specific commands must remain visible at their call sites. The helper should only normalize environment entries and should not hide service/task behavior.

## Data Flow

1. SST config builds a Rails runtime environment object.
2. Blank-like values are filtered out of the plaintext environment map.
3. ECS web, worker, migration, seed, refresh, and scheduled report task definitions receive the compacted environment.
4. SSM/ECS secret bindings are attached separately and unchanged.
5. `sst diff --stage dev` renders the changed task definitions without deploy.

## Landmines

- Do not filter `railsRuntimeSecrets`; those are not plaintext env values.
- Do not replace absent metadata with an empty string sentinel.
- Do not change commands for web, worker, migration, seed, refresh, or weekly report tasks.
- Do not run `sst deploy` as part of this phase.

## PATTERN MAPPING COMPLETE
