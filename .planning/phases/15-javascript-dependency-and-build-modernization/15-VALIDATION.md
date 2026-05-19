---
phase: 15
slug: javascript-dependency-and-build-modernization
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-15
---

# Phase 15 Validation Strategy

## Validation Scope

Phase 15 is a conservative JavaScript dependency modernization phase.
The validation strategy confirms:

- no framework compatibility migration,
- Shakapacker/NPM alignment (`JS-02`),
- production asset/build behavior stability (`JS-03`),
- and Blueprint compatibility baseline retention (`JS-04`).

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pnpm + Jest (Rails/Shakapacker precompile checks) |
| **Config file** | `package.json`, `pnpm-lock.yaml`, `config/shakapacker.yml`, `config/webpack/environment.js` |
| **Quick run command** | `pnpm install --frozen-lockfile` |
| **Full suite command** | `pnpm install --frozen-lockfile && pnpm test -- --runInBand && docker compose exec web sh -lc 'SECRET_KEY_BASE=build-placeholder DATABASE_URL=postgresql://placeholder/placeholder bundle exec rails assets:precompile'` |
| **Estimated runtime** | ~10-25 minutes |

## Sampling Rate

- **After every task commit:** run quick and scoped checks that task touched (at minimum `pnpm install --frozen-lockfile`).
- **After every plan wave:** run full suite command above.
- **Before `$gsd-verify-work`:** full suite should pass or include explicit blocker notes.
- **Max feedback latency:** 30 minutes.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|----------|-------------------|-------------|--------|
| 15-01-01 | 01 | 1 | JS-01 | T-15-01 | manifest audit | `rg -n "candidate|hold|webpack|shakapacker|React 16|Blueprint" .planning/phases/15-javascript-dependency-and-build-modernization/15-RESEARCH.md` | yes | ⬜ pending |
| 15-01-02 | 01 | 1 | JS-02 | T-15-03 | dependency gates | `pnpm install --frozen-lockfile && git diff -- package.json pnpm-lock.yaml` | yes | ⬜ pending |
| 15-01-03 | 01 | 1 | JS-01, JS-03, JS-04 | T-15-01, T-15-02, T-15-03 | automated tests/precompile | `pnpm test -- --runInBand && docker compose exec web sh -lc 'pnpm install --frozen-lockfile && SECRET_KEY_BASE=build-placeholder DATABASE_URL=postgresql://placeholder/placeholder bundle exec rails assets:precompile'` | yes | ⬜ pending |
| 15-01-04 | 01 | 1 | JS-01, JS-02, JS-03, JS-04 | T-15-01 | completion evidence | `test -f .planning/phases/15-javascript-dependency-and-build-modernization/15-01-SUMMARY.md` | no | ⬜ pending |

## Wave 0 Requirements

- [ ] Route QA checklist for production-bundle-affecting edits is in `15-CONTEXT.md` and `AGENTS.md`.
- [ ] `15-01-SUMMARY.md` captures package-level hold/defer notes and gate outcomes.

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Route-facing JS behavior regressions after bundler changes | JS-03 / JS-04 | Automated precompile proves build output but not visual behavior | Run affected route groups on `localhost:3000` and check browser console + network error logs only when batch edits touch production pack entrypoints or manifest behavior. |

*If none: "No manual-only verification required for this wave unless bundling behavior changes."*

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies.
- [ ] No 3 consecutive tasks without an automated verify command.
- [ ] Feedback latency target documented and enforced.
- [ ] `nyquist_compliant: true` set in frontmatter.

**Approval:** pending
