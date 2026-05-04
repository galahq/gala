---
phase: 04
slug: core-case-shell
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-04
---

# Phase 04 — Validation Strategy

Per-phase validation contract for Core Case Shell execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | RSpec, Jest 24, browser QA |
| **Config file** | `spec/rails_helper.rb`, `jest.config.js` |
| **Quick run command** | `bundle exec rspec spec/controllers/cases_controller_spec.rb` |
| **Full suite command** | `bundle exec rspec spec/controllers/cases_controller_spec.rb spec/features/viewing_a_case_spec.rb spec/features/deleting_a_case_spec.rb spec/features/publishing_a_case_spec.rb && yarn test app/javascript/utility/__tests__/Toolbar.test.jsx` |
| **Estimated runtime** | route/controller quick check under 60s; full targeted gate may be several minutes |

---

## Sampling Rate

- **After every task commit:** Run the narrowest relevant automated command for touched files.
- **After every plan wave:** Run the full targeted Phase 4 gate where practical.
- **Before `$gsd-verify-work`:** Browser QA evidence and targeted automated tests must be recorded.
- **Max feedback latency:** Prefer under 60 seconds for request/controller changes; browser and feature specs may exceed this.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | CASE-01, CASE-02, QA-01 | T-04-01 | Auth boundaries remain intact while sampling protected routes. | request/browser | `bundle exec rspec spec/controllers/cases_controller_spec.rb` | yes | pending |
| 04-01-02 | 01 | 1 | CASE-03, QA-02 | T-04-02 | No unreviewed class/style changes are made without browser evidence. | browser/Jest | `yarn test app/javascript/utility/__tests__/Toolbar.test.jsx` | yes | pending |
| 04-01-03 | 01 | 1 | QA-03, QA-04 | T-04-03 | QA evidence distinguishes real app failures from known HMR tooling noise. | evidence | `bundle exec rspec spec/controllers/cases_controller_spec.rb spec/features/viewing_a_case_spec.rb spec/features/deleting_a_case_spec.rb spec/features/publishing_a_case_spec.rb` | yes | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test framework or install step is required.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual shell compatibility | CASE-03, QA-02 | Approximate Blueprint 2-era visual compatibility is not captured by current automated tests. | Visit selected case shell routes on `localhost:3000`, inspect console/network output, and record visual/browser results in Phase 4 QA evidence. |
| Existing local slug selection | CASE-01, CASE-02, QA-01 | Local data varies by developer database. | Identify usable local case slug(s), record why they cover the route sample, and document substitutions. |

---

## Validation Sign-Off

- [x] All tasks have automated or manual verification paths.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency target documented.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** approved 2026-05-04
