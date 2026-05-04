---
phase: 06
slug: reader-library-and-reading-lists
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-04
---

# Phase 06 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | RSpec Rails 7.1.0; Jest 24.9.0; Playwright MCP for browser UAT |
| **Config file** | `.rspec`, `spec/rails_helper.rb`, `jest.config.js` |
| **Quick run command** | `docker compose exec -e NODE_ENV=test web yarn jest app/javascript/reading_list/__tests__/HiddenFormInputs.test.jsx --runInBand` |
| **Full suite command** | `./run-rspec.sh spec/requests/reader_spec.rb spec/requests/persona_update_spec.rb spec/requests/saved_reading_lists_index_spec.rb spec/requests/reading_lists_spec.rb spec/requests/reading_list_saves_spec.rb spec/requests/libraries_management_spec.rb && docker compose exec -e NODE_ENV=test web yarn jest app/javascript/reading_list/__tests__/HiddenFormInputs.test.jsx --runInBand` |
| **Estimated runtime** | ~120 seconds once Docker services are warm |

---

## Sampling Rate

- **After every task commit:** Run the targeted command named in the task verify block.
- **After every plan wave:** Run all focused RSpec/Jest files touched by that wave.
- **Before `$gsd-verify-work`:** Browser QA evidence must include representative signed-in routes plus targeted RSpec/Jest results.
- **Max feedback latency:** 120 seconds for automated gates; browser QA may take longer but must be recorded in `06-QA.md`.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | READ-01, READ-02, QA-01 | T-06-01 / T-06-02 | Protected account routes require mock-authenticated reader/admin state where expected | artifact | `rg -n "Plan 01 - Auth and profile|/readers/sign_in|/profile/edit|edit_tos|magic_link" .planning/phases/06-reader-library-and-reading-lists/06-QA.md` | ✅ | ⬜ pending |
| 06-01-02 | 01 | 1 | READ-01, READ-02, QA-03 | T-06-01 / T-06-02 | TOS/profile/persona routes keep expected auth/update behavior | request | `./run-rspec.sh spec/requests/reader_spec.rb spec/requests/persona_update_spec.rb spec/requests/devise_reader_routes_spec.rb` | ❌ W0 | ⬜ pending |
| 06-01-03 | 01 | 1 | READ-01, READ-02, QA-02 | T-06-01 | Browser sign-in uses `a.oauth-icon-google` and console/network issues are classified | manual/browser | `rg -n "a.oauth-icon-google|console errors|network errors|Devise|profile|TOS" .planning/phases/06-reader-library-and-reading-lists/06-QA.md` | ✅ | ⬜ pending |
| 06-02-01 | 02 | 1 | READ-03, QA-01 | T-06-03 / T-06-04 | Reading-list CRUD/save routes are covered before mutation QA | artifact | `rg -n "Plan 02 - Reading lists|/reading_lists/new|/reading_lists/:uuid/save|/saved_reading_lists|cleanup" .planning/phases/06-reader-library-and-reading-lists/06-QA.md` | ✅ | ⬜ pending |
| 06-02-02 | 02 | 1 | READ-03, QA-03 | T-06-03 / T-06-04 | Nested attributes permit only intended reading-list item fields | jest/request | `docker compose exec -e NODE_ENV=test web yarn jest app/javascript/reading_list/__tests__/HiddenFormInputs.test.jsx --runInBand && ./run-rspec.sh spec/requests/reading_lists_spec.rb spec/requests/reading_list_saves_spec.rb spec/requests/saved_reading_lists_index_spec.rb` | ❌ W0 | ⬜ pending |
| 06-02-03 | 02 | 1 | READ-03, QA-02 | T-06-03 / T-06-04 | Disposable browser-created reading list is cleaned up or documented | manual/browser | `rg -n "disposable reading list|save/unsave|cleanup|console errors|network errors" .planning/phases/06-reader-library-and-reading-lists/06-QA.md` | ✅ | ⬜ pending |
| 06-03-01 | 03 | 2 | READ-02, READ-03, QA-01 | T-06-05 | Library/management routes are listed from `config/routes.rb` | artifact | `rg -n "Plan 03 - Library and management|/libraries|/managerships|/case_library_requests|/my_cases|/enrollments|/editorships" .planning/phases/06-reader-library-and-reading-lists/06-QA.md` | ✅ | ⬜ pending |
| 06-03-02 | 03 | 2 | READ-02, READ-03, QA-03 | T-06-05 / T-06-06 | Missing browser manager data is supplemented by authorization specs | request | `./run-rspec.sh spec/requests/libraries_management_spec.rb spec/requests/reader_management_routes_spec.rb` | ❌ W0 | ⬜ pending |
| 06-03-03 | 03 | 2 | READ-02, READ-03, QA-02, QA-04 | T-06-05 / T-06-06 | Browser QA records reachable admin/library surfaces and non-blocking gaps | manual/browser | `rg -n "mock admin|library management|manager data gap|supplemented by specs|console errors|network errors" .planning/phases/06-reader-library-and-reading-lists/06-QA.md` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠ flaky*

---

## Wave 0 Requirements

- [ ] `spec/requests/devise_reader_routes_spec.rb` — representative Devise/session form and redirect branches for READ-01.
- [ ] `spec/requests/reading_lists_spec.rb` — reading-list create/update/destroy nested attribute behavior for READ-03 if controller behavior lacks request coverage.
- [ ] `spec/requests/reading_list_saves_spec.rb` — save/unsave mutation behavior for READ-03.
- [ ] `spec/requests/libraries_management_spec.rb` — library/managership/case-library-request manager behavior when browser local data is thin.
- [ ] `spec/requests/reader_management_routes_spec.rb` — reader index, roles, enrollments, editorships, my-cases, or magic-link branches not covered by existing specs.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mock Google login and protected page visual state | READ-01, READ-02, QA-02 | OAuth button styling, redirects, flashes, and protected visual surfaces require browser inspection | Visit `http://host.docker.internal:3000/readers/sign_in`, click `a.oauth-icon-google`, confirm signed-in admin state, then inspect profile/TOS and record console/network findings. |
| Disposable reading-list editor flow | READ-03, QA-02 | React editor, item chooser, hidden inputs, save/unsave, and cleanup are visual/interactive | Create a temporary reading list, add/edit/remove items where local cases allow, save/unsave from show page, delete or document cleanup, and record console/network findings. |
| Library management visible affordances | READ-03, QA-02 | Manager-only affordances depend on local policy/data state | Inspect reachable `/libraries`, library edit, managership, and case-library-request surfaces as mock admin; document any missing local manager data and matching spec supplement. |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies.
- [x] Sampling continuity: no 3 consecutive tasks without automated verify.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency target < 120s for automated gates.
- [x] `nyquist_compliant: true` set in frontmatter.

**Approval:** approved 2026-05-04
