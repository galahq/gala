---
phase: 04
slug: core-case-shell
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-04
updated: 2026-05-04T17:52:00Z
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
| 04-01-01 | 01 | 1 | CASE-01, CASE-02, QA-01 | T-04-01 | Auth boundaries remain intact while sampling protected routes. | request/browser/UAT | `docker compose exec web bundle exec rspec spec/controllers/cases_controller_spec.rb` | yes | green |
| 04-01-02 | 01 | 1 | CASE-03, QA-02 | T-04-02 | No unreviewed class/style changes are made without browser evidence. | browser/UI review/UAT | `yarn test app/javascript/utility/__tests__/Toolbar.test.jsx` when toolbar changes | yes | green |
| 04-01-03 | 01 | 1 | QA-03, QA-04 | T-04-03 | QA evidence distinguishes real app failures from known HMR tooling noise. | evidence/security | `docker compose exec web bundle exec rspec spec/controllers/cases_controller_spec.rb spec/features/viewing_a_case_spec.rb spec/features/deleting_a_case_spec.rb spec/features/publishing_a_case_spec.rb` | yes | green |

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
| Protected-route Blueprint parity | CASE-03, QA-02, QA-03 | Local feature specs are blocked by Selenium/Capybara driver setup, and protected-route visual state requires a browser session. | With Playwright/MCP, visit `http://host.docker.internal:3000/readers/sign_in`, click `a.oauth-icon-google`, wait for `config/initializers/mock_omniauth.rb` to sign in `dev@learnmsc.org`, then visit protected case routes and inspect BlueprintJS layout, spacing, icons, forms, popovers, and console/network output. |

## Validation Audit 2026-05-04

| Metric | Count |
|--------|-------|
| Requirements audited | 7 |
| Automated green | 1 |
| Evidence/UAT/security green | 6 |
| Manual-only | 3 |
| Open gaps | 0 |

Audit notes:

- `docker compose exec web bundle exec rspec spec/controllers/cases_controller_spec.rb` passed during security verification with `5 examples, 0 failures`.
- `.planning/phases/04-core-case-shell/04-QA.md` records route-derived browser QA, console/network classifications, known HMR/Mapbox/React local noise, and feature-spec Selenium setup blocker.
- `.planning/phases/04-core-case-shell/04-UAT.md` is complete with 5 passed and 0 issues.
- `.planning/phases/04-core-case-shell/04-SECURITY.md` is verified with `threats_open: 0`.
- `.planning/phases/04-core-case-shell/04-UI-REVIEW.md` records the protected-route Playwright/MCP mock-login gate using `a.oauth-icon-google`.
- No Phase 4 implementation files changed during execution, so no new implementation test files were needed for narrow compatibility fixes.

## Validation Audit 2026-05-04 — Playwright MCP Rerun

| Metric | Count |
|--------|-------|
| Previously PASS route gates rerun | 19 |
| HMR host/origin regressions | 0 |
| Authenticated protected routes rerun | 3 |
| Automated command groups rerun | 2 |
| Open gaps | 0 |

Audit notes:

- Playwright MCP reached the Dockerized app through `http://host.docker.internal:3000` after the Shakapacker `allowed_hosts` update.
- Fresh reruns across Phase 1, Phase 2, Phase 3, and Phase 4 browser gates recorded `invalidHostCount: 0`; the previous `Invalid Host/Origin header` note is now historical rather than active.
- Phase 4 protected-route visual prelude succeeded through the Google mock login. Edit mode, settings, and translations rendered as authenticated routes instead of stopping at anonymous redirects.
- Targeted RSpec rerun passed: `docker compose exec web bundle exec rspec spec/config/shakapacker_dev_server_spec.rb spec/requests/health_check_spec.rb spec/requests/public_utility_routes_spec.rb spec/requests/catalog_routes_spec.rb spec/controllers/cases_controller_spec.rb` — 27 examples, 0 failures.
- Targeted Jest rerun passed with the compose service explicitly set to test mode: `docker compose exec -e NODE_ENV=test web yarn jest app/javascript/utility/__tests__/Toolbar.test.jsx app/javascript/shared/__tests__/blueprintAssetContract.test.js app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js app/javascript/catalog/home/__tests__/helpers.test.js --runInBand` — 4 suites, 12 tests.
- Running the same Jest selection through `yarn test ...` without overriding `NODE_ENV` is not a valid Docker Compose gate because the service exports `NODE_ENV=development`, which prevents `babel-jest` from transforming ES module syntax.

---

## Validation Sign-Off

- [x] All tasks have automated or manual verification paths.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency target documented.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** approved 2026-05-04
