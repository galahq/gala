---
phase: 16
slug: frontend-test-runner-modernization
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-15
---

# Phase 16 Validation Strategy

## Validation Scope

- Enforce a single pnpm-backed frontend test command.
- Keep Vitest adoption decision aligned to Phase 12 evidence.
- Preserve Shakapacker/Webpack production behavior.
- Cover TEST-01..TEST-04 and QA-04.

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 24 baseline, Vitest spike artifacts in repo, pnpm 11 |
| **Config file** | `package.json`, `jest.config.js`, `spec/support/jest-setup.js` |
| **Quick run command** | `pnpm test -- --runInBand` |
| **Full phase command** | `pnpm test -- --runInBand && pnpm test -- --runInBand app/javascript/shared/__tests__/functions.test.js` |
| **Estimated runtime** | ~10-20 minutes |

## Sampling Rate

- **After every task commit:** run relevant command in task scope.
- **After every plan wave:** run baseline and representative suite commands.
- **Before `$gsd-verify-work`:** all task verify commands in this plan should have pass/fail evidence.
- **Max feedback latency:** 30 minutes.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------|-------------------|-------------|--------|
| 16-01-01 | 01 | 1 | VITE-03, TEST-01, TEST-02 | T-16-02 | baseline + evidence capture | `pnpm test -- --runInBand`<br>`pnpm test -- --runInBand app/javascript/shared/__tests__/functions.test.js` | yes | ⬜ pending |
| 16-01-02 | 01 | 1 | TEST-01, VITE-03 | T-16-01, T-16-02 | script contract | `node -e "const p=require('./package.json'); if(!p.scripts || !p.scripts.test) process.exit(1)" && pnpm install --frozen-lockfile && node -e "const p=require('./package.json'); console.log(p.scripts.test)"` | yes | ⬜ pending |
| 16-01-03 | 01 | 1 | TEST-03, TEST-04 | T-16-03 | env contract | `node -e "const cfg=require('./jest.config.js'); ['modulePathIgnorePatterns','modulePaths','setupFilesAfterEnv','transform'].forEach(k=>{ if(!cfg[k]) { throw new Error('missing ' + k) } })"`<br>`pnpm test -- --runInBand app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js` | yes | ⬜ pending |
| 16-01-04 | 01 | 1 | TEST-01, TEST-02, TEST-03, TEST-04, QA-04, VITE-02, VITE-03 | T-16-04 | runner result summary | `pnpm test -- --runInBand`<br>`rg -n "VITE-02|VITE-03|TEST-01|TEST-02|TEST-03|TEST-04|QA-04|runner" .planning/phases/16-frontend-test-runner-modernization/16-01-SUMMARY.md` | yes | ⬜ pending |

## Wave 0 Requirements

- [x] `16-01-SUMMARY.md` includes explicit runner selection outcome (Vitest vs Jest fallback).
- [x] Test command evidence uses reproducible `pnpm` execution.
- [x] `package.json` has a documented primary frontend command and no yarn fallback.

## Manual-Only Verifications

- Route-facing browser QA on `localhost:3000` is only required if test runner command changes impact production JS delivery behavior.
- If no such behavior changes occur, mark this as not required in summary.

## Validation Sign-Off

- [ ] All tasks have automated verify commands.
- [ ] No 3 consecutive tasks without automated verification.
- [ ] `nyquist_compliant: true` set in frontmatter.
- [ ] `wave_0_complete` includes the runner lane decision.

**Approval:** pending
