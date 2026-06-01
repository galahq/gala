---
phase: 28
plan: 28-03
status: complete
completed: 2026-06-01
---

# Plan 28-03 Summary

## Completed

- Deployed the ARM64 candidate to the dev SST stage.
- Verified dev web, worker, migration, and one-off runtime surfaces on ARM64.
- Ran the rollback dry run from ARM64 web/worker task definitions back to captured X86_64 task definitions.
- Attempted the live dev task-definition rollback and recorded the failure mode.
- Recovered dev by re-registering active X86_64 task-definition copies.

## Key Evidence

- ARM64 release: `20260601153500.abcdef9`.
- App image: `353760060567.dkr.ecr.us-west-2.amazonaws.com/gala:20260601153500.abcdef9`.
- Web task definition: `GalaWeb:11`, `ARM64`, rollout `COMPLETED`.
- Worker task definition: `GalaWorker:10`, `ARM64`, rollout `COMPLETED`.
- Migration task definition: `GalaMigrate:11`, `ARM64`.
- `https://dev.learngala.dev/up` returned HTTP `200`.
- Safe one-off `db:version` task exited `0`.
- Safe runner task printed `ok` and exited `0`.

## Rollback Result

The direct rollback path failed because the captured X86_64 rollback task definitions were inactive:

```text
An error occurred (ClientException) when calling the UpdateService operation:
TaskDefinition is inactive
```

Recovery required manually re-registering active X86_64 copies:

- Web recovery task definition: `GalaWeb:12`, `X86_64`.
- Worker recovery task definition: `GalaWorker:11`, `X86_64`.
- Post-recovery `https://dev.learngala.dev/up` returned HTTP `200`.

## Decision Impact

ARM64 is technically viable in dev, but production ARM64 default remains blocked until the rollback workflow can preserve or re-register rollback task definitions without manual recovery.
