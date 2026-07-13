---
phase: 11
slug: pnpm-package-manager-migration
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-12
---

# Phase 11 - Validation Strategy

> Per-phase validation contract for pnpm migration feedback sampling.

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pnpm 11 install checks, Jest 24 frontend tests, Rails/Shakapacker build gate |
| **Config file** | `package.json`, `pnpm-lock.yaml`, `jest.config.js`, `config/shakapacker.yml`, `Dockerfile`, `.semaphore/semaphore.yml` |
| **Quick run command** | `pnpm install --frozen-lockfile` |
| **Full suite command** | `pnpm install --frozen-lockfile && pnpm test -- --runInBand && bundle exec rails assets:precompile`, or the same install/build gates plus `11-JEST-BASELINE.md` documenting an exact pre-existing Yarn/pnpm Jest baseline match if Jest remains red |
| **Estimated runtime** | ~5-15 minutes depending on install/cache state |

## Sampling Rate

- **After every task commit:** Run the narrow command affected by that task, with `pnpm install --frozen-lockfile` after manifest or lockfile changes.
- **After every plan wave:** Run `pnpm test -- --runInBand` and `bundle exec rails assets:precompile`.
- **Before `$gsd-verify-work`:** Full install/build/test parity should be green or documented with a pre-existing baseline comparison.
- **Max feedback latency:** 15 minutes.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | PNPM-01, PNPM-05 | T-11-03 | Pre-existing manifest/lockfile diffs are classified before mutation and not misattributed | diff audit | `git diff -- package.json yarn.lock | sed -n '1,220p'` | yes | pending |
| 11-01-02 | 01 | 1 | PNPM-02, PNPM-03 | T-11-01, T-11-02 | Exact pnpm pin is selected, pnpm lockfile exists, and install is frozen | config/install | `node -e "const p=require('./package.json'); if (!/^pnpm@[0-9]+\\.[0-9]+\\.[0-9]+$/.test(p.packageManager)) process.exit(1); const v=p.packageManager.split('@')[1]; if (!p.engines || p.engines.node !== '>=24 <25' || p.engines.pnpm !== v || p.engines.yarn) process.exit(1)" && test -f pnpm-lock.yaml && pnpm install --frozen-lockfile` | no: `pnpm-lock.yaml` absent before implementation | pending |
| 11-01-03 | 01 | 1 | PNPM-01, PNPM-03, PNPM-05 | T-11-02, T-11-04 | pnpm install/build/test parity is proven before removing `yarn.lock` | parity | `sh -lc 'pnpm install --frozen-lockfile && if pnpm test -- --runInBand; then :; else test -f .planning/phases/11-pnpm-package-manager-migration/11-JEST-BASELINE.md && rg -n "pre-existing|Yarn|pnpm|Jest|baseline" .planning/phases/11-pnpm-package-manager-migration/11-JEST-BASELINE.md; fi && bundle exec rails assets:precompile && test ! -f yarn.lock'` | yes | pending |
| 11-02-01 | 02 | 2 | PNPM-01, PNPM-04, PNPM-05 | T-11-05, T-11-06 | Docker and Semaphore install/test paths use pnpm and the pnpm lockfile | static audit | `test -f pnpm-lock.yaml && ! rg -n "yarn|Yarn|yarn.lock" Dockerfile .semaphore/semaphore.yml && rg -n "pnpm install --frozen-lockfile|pnpm test|checksum pnpm-lock.yaml" Dockerfile .semaphore/semaphore.yml` | yes | pending |
| 11-02-02 | 02 | 2 | PNPM-01, PNPM-04 | T-11-07, T-11-08 | Docs, bin files, and asset comments no longer instruct root Yarn while preserving `infra/` npm | static audit | `! rg -n "yarn|Yarn|yarn.lock|bin/yarn" README.md docs/asset-pipeline.md docs/aws-sst-phase-1-preflight.md bin config/initializers/assets.rb && rg -n "pnpm|Corepack|corepack|node_modules|infra.*npm|npm.*infra" README.md docs/asset-pipeline.md docs/aws-sst-phase-1-preflight.md bin config/initializers/assets.rb` | yes | pending |
| 11-02-03 | 02 | 2 | PNPM-01, PNPM-04, PNPM-05 | T-11-05, T-11-06, T-11-07, T-11-08 | Final pnpm validation and static Yarn-reference audits pass without changing `infra/` npm workflow | parity/static audit | `sh -lc 'pnpm install --frozen-lockfile && if pnpm test -- --runInBand; then :; else test -f .planning/phases/11-pnpm-package-manager-migration/11-JEST-BASELINE.md && rg -n "pre-existing|Yarn|pnpm|Jest|baseline" .planning/phases/11-pnpm-package-manager-migration/11-JEST-BASELINE.md; fi && bundle exec rails assets:precompile && ! rg -n "yarn|Yarn|yarn.lock|yarn@" package.json Dockerfile .semaphore README.md docs/asset-pipeline.md docs/aws-sst-phase-1-preflight.md bin config/initializers/assets.rb && test -z "$(git diff --name-only -- infra/package.json infra/package-lock.json .github/workflows/deploy.yml)"'` | yes | pending |

## Wave 0 Requirements

- [ ] `pnpm-lock.yaml` - generated from `yarn.lock` with `pnpm import` during implementation.
- [ ] No `.npmrc` is required unless default pnpm layout fails with concrete tool-resolution evidence.

## Manual-Only Verifications

All phase behaviors have automated verification. If Docker or Semaphore cannot be executed locally, their config changes must be verified by static command audits plus a clear summary note.

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency target documented.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** approved 2026-05-12
