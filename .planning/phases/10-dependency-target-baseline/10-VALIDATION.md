---
phase: 10
slug: dependency-target-baseline
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-12
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Documentation audit with `rg`; no Ruby or JavaScript runtime changes in this phase |
| **Config file** | none — Phase 10 creates planning documentation only |
| **Quick run command** | `rg -n "DEPS-01|React|Blueprint|pnpm|Ruby|Rails|Shakapacker|Recheck|holdback" .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` |
| **Full suite command** | `git diff -- Gemfile Gemfile.lock package.json yarn.lock pnpm-lock.yaml config/webpack config/shakapacker.yml jest.config.js` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `rg -n "DEPS-01|React|Blueprint|pnpm|Ruby|Rails|Shakapacker|Recheck|holdback" .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md`
- **After every plan wave:** Run `git diff -- Gemfile Gemfile.lock package.json yarn.lock pnpm-lock.yaml config/webpack config/shakapacker.yml jest.config.js`
- **Before `$gsd-verify-work`:** Documentation audit must find all Phase 10 requirement markers and manifest/config diff must show no Phase 10 edits
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | DEPS-01 | T-10-01 | Matrix uses official registry/doc source fields and recheck commands before later edits | documentation audit | `rg -n "Latest checked|Source|Recheck|npm view|rubygems.org|ruby-lang.org" .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` | no W0 | pending |
| 10-01-02 | 01 | 1 | DEPS-02 | T-10-02 | React 16.x hold prevents accidental React major upgrade during v1.1 | documentation audit | `rg -n "React.*16|react.*16|React.*19|React major upgrade" .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` | no W0 | pending |
| 10-01-03 | 01 | 1 | DEPS-03 | T-10-03 | BlueprintJS 4.x hold prevents accidental BlueprintJS 6/React 18 upgrade during v1.1 | documentation audit | `rg -n "BlueprintJS.*4|@blueprintjs.*4|BlueprintJS.*6|React 18" .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` | no W0 | pending |
| 10-01-04 | 01 | 1 | DEPS-04 | T-10-04 | Holdbacks include compatibility reasons and downstream owner phases | documentation audit | `rg -n "Holdback reason|Compatibility reason|Owner phase|v1.2" .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` | no W0 | pending |
| 10-01-05 | 01 | 1 | DEPS-01..04 | T-10-05 | No manifest, lockfile, package manager, build, or test-runner config changes are introduced by the baseline phase | diff audit | `git diff -- Gemfile Gemfile.lock package.json yarn.lock pnpm-lock.yaml config/webpack config/shakapacker.yml jest.config.js` | yes | pending |

---

## Wave 0 Requirements

- [ ] `.planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` — create the documentation artifact that covers DEPS-01 through DEPS-04.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Official-source freshness | DEPS-01 | Registry/doc versions can change after plan creation | Confirm the matrix records check date, source, and recheck command for each dependency family. |

---

## Validation Sign-Off

- [x] All tasks have automated verify commands or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all missing references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-12
