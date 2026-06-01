---
phase: 27
slug: spot-and-remove-ambiguous-environment-variables-like-the-git
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-01
---

# Phase 27 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Source assertions plus SST CLI diff |
| **Config file** | `infra/sst.config.ts`, `infra/package.json` |
| **Quick run command** | `rg -n "compactRuntimeEnvironment|blank|trim\(\)" infra/sst.config.ts` |
| **Full suite command** | `cd infra && AWS_PROFILE=gala AWS_REGION=us-west-2 SST_STAGE=dev GALA_PRODUCTION_BASE_IMAGE=353760060567.dkr.ecr.us-west-2.amazonaws.com/gala-production-base:ruby4.0.3-bookworm-pg17-runtime-v1 GALA_ROUTER_DISTRIBUTION_ID=E3FF4TTU9Q4XTY npx sst diff --stage dev --json > /tmp/phase27-sst-diff.json` |
| **Estimated runtime** | ~60-180 seconds for SST diff |

---

## Sampling Rate

- **After every task commit:** Run the quick source assertion command.
- **After every plan wave:** Run the full read-only `sst diff --stage dev` command.
- **Before `$gsd-verify-work`:** Source assertions and read-only dev diff must pass.
- **Max feedback latency:** 180 seconds.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 27-01-01 | 01 | 1 | Phase goal | T-27-01 | No secret values printed or persisted | source review | `rg -n "GIT_|environment|compactRuntimeEnvironment" infra/sst.config.ts` | yes | pending |
| 27-01-02 | 01 | 1 | Phase goal | T-27-02 | Blank-like plaintext env entries omitted before ECS emission | source assertion | `rg -n "compactRuntimeEnvironment|trim\(\)|value == null|value != null" infra/sst.config.ts` | yes | pending |
| 27-01-03 | 01 | 1 | Phase goal | T-27-03 | Rendered dev infrastructure diff is read-only and non-deploying | rendered diff | `cd infra && AWS_PROFILE=gala AWS_REGION=us-west-2 SST_STAGE=dev GALA_PRODUCTION_BASE_IMAGE=353760060567.dkr.ecr.us-west-2.amazonaws.com/gala-production-base:ruby4.0.3-bookworm-pg17-runtime-v1 GALA_ROUTER_DISTRIBUTION_ID=E3FF4TTU9Q4XTY npx sst diff --stage dev --json > /tmp/phase27-sst-diff.json` | yes | pending |

---

## Wave 0 Requirements

Existing infrastructure covers this phase. No new test framework is required.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Operator interpretation of SST diff | Phase goal | Diff content can contain provider-level noise requiring judgment | Confirm `/tmp/phase27-sst-diff.json` does not show destructive replacement caused by blank env cleanup. |

---

## Validation Sign-Off

- [x] All tasks have automated or source-level verify commands.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency < 180s.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** pending execution
