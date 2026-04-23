---
phase: 01-infra-safety-baseline
plan: "03"
subsystem: infra
tags: [active-storage, s3, iam, ecs, preflight]
requires:
  - phase: 01-infra-safety-baseline
    provides: SST secret inventory and Phase 1 preflight checklist
provides:
  - IAM-friendly Active Storage S3 config
  - Storage provider-chain preflight guidance
  - Production image and storage validation boundaries for Phase 2
affects: [staging-runtime-parity, data-migration-rehearsal, production-cutover]
tech-stack:
  added: []
  patterns: [aws-sdk-provider-chain, ecs-task-role-storage]
key-files:
  created: []
  modified:
    - config/storage.yml
    - docs/aws-sst-phase-1-preflight.md
key-decisions:
  - "Remove explicit static AWS key fields from the Active Storage amazon service so ECS can use task-role credentials through the AWS SDK provider chain."
  - "Keep S3 region and bucket configurable through AWS_REGION and S3_BUCKET with current us-west-2/msc-gala defaults."
patterns-established:
  - "AWS runtime credentials should come from task roles/provider chain, not required static key env vars in Rails config."
requirements-completed: [DPLY-04, STOR-01, STOR-02]
duration: 8min
completed: 2026-04-23
---

# Phase 1 Plan 03 Summary

**Active Storage S3 config now supports ECS task-role credentials through the AWS SDK provider chain**

## Performance

- **Duration:** 8 min
- **Completed:** 2026-04-23T08:45:18Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Removed required `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` fields from the `amazon` Active Storage service.
- Added `AWS_REGION` and `S3_BUCKET` environment-backed storage settings with current safe defaults.
- Added storage provider-chain checks to the Phase 1 preflight doc and kept full upload/download validation deferred to Phase 2.

## Task Commits

1. **Task 1 and 2: IAM-friendly storage config plus preflight guidance** - `a1ed4ebe` (fix)

**Plan metadata:** `20727b1e` (docs)

## Files Created/Modified

- `config/storage.yml` - Uses provider-chain-compatible S3 settings.
- `docs/aws-sst-phase-1-preflight.md` - Adds storage/provider-chain verification and Phase 2 boundary notes.

## Decisions Made

The verification command in the preflight doc uses a minimal Rails stub because `storage.yml` includes existing ERB references to `Rails.root` and `Rails.application.credentials` outside the changed S3 block.

## Deviations from Plan

The original plan's standalone Ruby YAML parse command was adjusted in the documentation and verification because it fails on existing Rails ERB references when run outside a Rails process. The adjusted command still evaluates ERB and parses the full YAML file.

## Issues Encountered

`rg -n 'AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY' config/storage.yml` exits 1 by design now because there are no matches. That no-match result is the expected verification outcome.

## Verification

- `ruby -rpathname -rerb -ryaml -e 'class NullCredentials; def dig(*); nil; end; end; class NullApplication; def credentials; NullCredentials.new; end; end; module Rails; def self.root; Pathname.new(Dir.pwd); end; def self.application; NullApplication.new; end; end; YAML.safe_load(ERB.new(File.read("config/storage.yml")).result, aliases: true); puts "storage yaml ok"'` - passed.
- `rg -n 'AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY' config/storage.yml` - no matches, expected exit 1.
- `rg -n 'storage.yml|provider chain|task role|docker build|assets:precompile|Phase 2' docs/aws-sst-phase-1-preflight.md` - passed.

## User Setup Required

None for this plan. Stage secret setup remains covered by `docs/aws-sst-secret-inventory.md`.

## Next Phase Readiness

Phase 2 can validate actual Active Storage upload/download behavior in AWS using the ECS task role and existing `msc-gala` bucket policy.

---
*Phase: 01-infra-safety-baseline*
*Completed: 2026-04-23*
