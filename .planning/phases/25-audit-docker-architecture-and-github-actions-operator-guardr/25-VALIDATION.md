---
phase: 25
slug: audit-docker-architecture-and-github-actions-operator-guardr
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-01
---

# Phase 25 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Ruby/YAML static checks, shell syntax, grep-based policy checks |
| **Config file** | `.github/workflows/*.yml`, `scripts/deploy-sst.sh`, `CODEOWNERS` |
| **Quick run command** | `ruby -e 'require "yaml"; Dir[".github/workflows/*.yml"].each { |f| YAML.load_file(f); puts f }' && bash -n scripts/deploy-sst.sh` |
| **Full suite command** | `ruby -e 'require "yaml"; Dir[".github/workflows/*.yml"].each { |f| YAML.load_file(f); puts f }' && bash -n scripts/deploy-sst.sh && rg -n "workflow_dispatch|dry_run|GITHUB_STEP_SUMMARY|confirmation|CODEOWNER|run-task|update-service" .github/workflows scripts docs/ops` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run the quick command.
- **After every plan wave:** Run the full suite command.
- **Before `$gsd-verify-work`:** Full suite must be green, and docs must be manually scanned for one-page manpage style.
- **Max feedback latency:** 60 seconds.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 25-01-01 | 01 | 1 | Phase 25 SC1 | T-25-01 | Current deploy/Docker/SST state is audited before workflow edits | static/docs | `test -f docs/ops/workflows/operator-guardrails.md` | W1 | pending |
| 25-02-01 | 02 | 2 | Phase 25 SC2-4 | T-25-02 | Mutating operator workflows are manual, dry-run aware, and gated | static | `rg -n "workflow_dispatch|dry_run|GITHUB_STEP_SUMMARY|confirmation" .github/workflows` | W2 | pending |
| 25-02-02 | 02 | 2 | Phase 25 SC3 | T-25-03 | Migrations and one-off scripts run through ECS tasks, not runner Rails commands | static | `rg -n "ecs run-task|run-task|bundle exec rails|rails runner" .github/workflows scripts` | W2 | pending |
| 25-03-01 | 03 | 3 | Phase 25 SC5 | T-25-04 | Each core workflow has a terse manpage-style doc | docs | `for f in docs/ops/workflows/*.md; do rg -q "^## (NAME|SYNOPSIS|INPUTS|DRY RUN|SIDE EFFECTS|VERIFY|ROLLBACK|EXAMPLES)$" "$f"; done` | W3 | pending |
| 25-03-02 | 03 | 3 | Phase 25 SC6 | T-25-05 | CODEOWNER and docs coverage include operator workflow paths | static | `rg -n "docs/ops/workflows|.github/workflows|scripts/ops|scripts/deploy-sst.sh" CODEOWNERS` | W3 | pending |

*Status: pending, green, red, flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| One printed page per workflow doc | Phase 25 SC5 | Print pagination depends on renderer and local print settings | Open or print-preview each `docs/ops/workflows/*.md`; each core workflow doc must fit on one printed page without shrinking below readable text. |
| Production confirmation language | Phase 25 SC4 | Exact wording is a product/operator judgment | Confirm production workflows require a typed phrase containing environment, operation, and target ref/artifact. |
| Rollback clarity | Phase 25 SC3 | Operator recovery semantics need human review | Read rollback doc and confirm task-definition rollback vs release/image redeploy are distinct and state what is not rolled back. |

---

## Validation Sign-Off

- [x] All tasks have automated or manual verify coverage.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers missing validation infrastructure.
- [x] No watch-mode flags.
- [x] Feedback latency target is under 60 seconds.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** pending

