---
phase: 26
slug: simplify-ecs-task-definitions-and-add-ci-validation-status-r
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-01
---

# Phase 26 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node built-in test, GitHub Actions workflow syntax/static checks, SST/TypeScript validation, existing RSpec/Jest/Playwright commands |
| **Config file** | `infra/package.json`, `.github/workflows/ci-validation.yml`, `package.json`, `jest.config.js`, `playwright.config.mjs` |
| **Quick run command** | `node --test scripts/ci/*.test.mjs` |
| **Full suite command** | `node --test scripts/ci/*.test.mjs && cd infra && npm exec tsc -- --noEmit` |
| **Estimated runtime** | ~90 seconds excluding optional AWS-backed `sst refresh` / `sst diff` |

---

## Sampling Rate

- **After every task commit:** Run `node --test scripts/ci/*.test.mjs` when CI scripts exist; otherwise run the relevant syntax/type check for the touched file.
- **After every plan wave:** Run `node --test scripts/ci/*.test.mjs && cd infra && npm exec tsc -- --noEmit`.
- **Before `$gsd-verify-work`:** Full suite must be green or have documented environment-only skips for AWS-backed SST evidence.
- **Max feedback latency:** 120 seconds for local deterministic checks.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 26-01-01 | 01 | 1 | CI-01 | T-26-01 | No Heroku DB/cache reuse or secret plaintext regression | static/type | `cd infra && npm exec tsc -- --noEmit` | pending | pending |
| 26-01-02 | 01 | 1 | CI-01 | T-26-01 | Task-specific commands remain explicit | static/type | `cd infra && npm exec tsc -- --noEmit` | pending | pending |
| 26-02-01 | 02 | 2 | CI-02, CI-03 | T-26-02 | CI triggers do not deploy and deploy workflows remain manual | static | `ruby -e 'require "yaml"; YAML.load_file(".github/workflows/ci-validation.yml")'` | pending | pending |
| 26-02-02 | 02 | 2 | CI-04, CI-06, CI-07 | T-26-03 | Report redacts secrets and classifies destructive terms advisory-only | unit | `node --test scripts/ci/*.test.mjs` | pending | pending |
| 26-02-03 | 02 | 2 | CI-05, CI-08 | T-26-04 | Status post uses one context and links to artifact/report URL | unit/static | `node --test scripts/ci/*.test.mjs` | pending | pending |

---

## Wave 0 Requirements

- [ ] `scripts/ci/validation-report.test.mjs` - tests for report rendering, status mapping, truncation, suite normalization, and destructive keyword scoring.
- [ ] `.github/workflows/ci-validation.yml` - workflow parses as YAML and declares `push` main and `pull_request` commit triggers.
- [ ] `scripts/ci/validation-report.mjs` - deterministic report generator exists before workflow wiring depends on it.
- [ ] `scripts/ci/post-commit-status.mjs` - status publisher has testable request payload construction before live GitHub REST use.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| GitHub commit status appears with artifact target URL | CI-08 | Requires GitHub Actions execution on a pushed commit | Push a branch/PR commit and inspect the `gala/ci-validation` commit status target URL. |
| AWS-backed `sst refresh` / `sst diff` evidence appears | CI-05 | Requires repository AWS OIDC/secrets availability | Inspect Actions artifact and confirm `sst_refresh` / `sst_diff` rows are `passed`, `warning`, or `not run` with reason. |
| Deploy remains operator-driven | CI-03 | Requires workflow UI/repo behavior review | Confirm `.github/workflows/deploy.yml` remains `workflow_dispatch` and CI workflow contains no `sst deploy` command. |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or explicit manual-only verification.
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify.
- [ ] Wave 0 covers report/status tests before workflow publication.
- [ ] No watch-mode flags.
- [ ] Feedback latency < 120s for deterministic local checks.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** pending
