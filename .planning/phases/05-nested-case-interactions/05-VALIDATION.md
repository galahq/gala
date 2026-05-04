---
phase: 05
slug: nested-case-interactions
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-04
---

# Phase 05 - Validation Strategy

Per-phase validation contract for nested case route stabilization.

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | RSpec, Jest 24, Playwright MCP UAT |
| Config file | `spec/rails_helper.rb`, `jest.config.js`, Docker compose service env |
| Quick run command | `docker compose exec web bundle exec rspec spec/controllers/cards_controller_spec.rb spec/controllers/cases/stats_controller_spec.rb spec/requests/forums_index_spec.rb` |
| Full suite command | `docker compose exec web bundle exec rspec spec/controllers/cards_controller_spec.rb spec/controllers/cases/stats_controller_spec.rb spec/controllers/edgenotes/attachments_controller_spec.rb spec/requests/forums_index_spec.rb spec/services/quiz_updater_spec.rb spec/services/case_stats_service_spec.rb spec/serializers/cases/stats_serializer_spec.rb` plus focused Jest commands from `05-RESEARCH.md` |
| Estimated runtime | 60-180 seconds for focused suites, excluding manual Playwright UAT |

## Sampling Rate

- After each backend route/spec task: run the focused RSpec command for touched controllers/services.
- After each frontend task: run the focused Jest command for touched components/reducers with `NODE_ENV=test`.
- After each route group QA task: run Playwright MCP console/network checks for the route group.
- Before `$gsd-verify-work`: all focused RSpec/Jest commands and the Playwright route evidence table must be green or explicitly classified.
- Max feedback latency: one task; no more than two consecutive implementation tasks without an automated or Playwright verification step.

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | CASE-04, QA-01 | T-05-01 | Protected nested writes require mock admin auth and preserve expected JSON status/body behavior. | RSpec/request or controller | `docker compose exec web bundle exec rspec spec/controllers/cards_controller_spec.rb spec/requests/forums_index_spec.rb` | existing | pending |
| 05-01-02 | 01 | 1 | CASE-04, QA-02 | T-05-02 | Comment/editor routes remain nonblank after mock Google login and do not expose protected actions when unauthenticated. | Playwright MCP | Manual MCP route pass via `http://host.docker.internal:3000` | existing | pending |
| 05-02-01 | 02 | 1 | CASE-04, QA-02 | T-05-03 | Stats JSON/HTML/CSV remain authorized and render without new blocking map or console failures. | RSpec/Jest/Playwright | `docker compose exec web bundle exec rspec spec/controllers/cases/stats_controller_spec.rb spec/services/case_stats_service_spec.rb spec/serializers/cases/stats_serializer_spec.rb` | existing | pending |
| 05-02-02 | 02 | 1 | CASE-04, QA-02 | T-05-04 | Stats map/date controls keep usable Blueprint-era interactions; local Mapbox production-style noise is classified. | Jest/Playwright | `docker compose exec -e NODE_ENV=test web yarn jest app/javascript/stats/__tests__/DatePicker.test.jsx app/javascript/stats/__tests__/StatsPage.test.jsx app/javascript/stats/__tests__/mapInternals.test.js app/javascript/stats/__tests__/statsResponse.test.js app/javascript/stats/__tests__/statsStore.test.js --runInBand` | existing | pending |
| 05-03-01 | 03 | 2 | CASE-04, QA-01 | T-05-05 | Quiz create/update/destroy and show/submission routes preserve auth and expected JSON/HTML behavior. | RSpec/Jest/Playwright | `docker compose exec web bundle exec rspec spec/services/quiz_updater_spec.rb spec/policies/quiz_policy_spec.rb` | existing | pending |
| 05-04-01 | 04 | 2 | CASE-04, QA-03 | T-05-06 | Wikidata/SPARQL/tag/lock risks are either fixed if blocking or documented as follow-up concerns. | Request specs/Playwright | Focused request specs added or existing specs for touched files | to be planned | pending |
| 05-04-02 | 04 | 3 | QA-01, QA-02, QA-03, QA-04 | T-05-07 | Final QA evidence covers every Phase 5 route group and classifies console/network findings. | Documentation + commands | Focused RSpec/Jest commands from plan plus Playwright MCP evidence | to be planned | pending |

## Wave 0 Requirements

- Existing RSpec/Jest infrastructure covers Phase 5; no framework install is expected.
- Plans should add missing focused request/controller specs only when a route group lacks automated coverage and is impractical to verify safely through the browser.
- Plans should not add Selenium feature-spec dependency unless the local driver blocker is resolved first.

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Protected route visual UAT | QA-02 | Blueprint parity and console/network classification require browser inspection. | Use Playwright MCP at `http://host.docker.internal:3000`, sign in through `/readers/sign_in`, click `a.oauth-icon-google`, inspect target protected routes, then record console/network findings. |
| Mapbox local rendering classification | QA-02, QA-03 | Production style may fail locally by design. | Inspect `/cases/:slug/stats`; verify map container/date controls are usable and classify production-style errors as accepted only if visible behavior is not broken. |
| Reversible low-risk browser writes | CASE-04, QA-01 | Existing local data differs by developer environment. | Use existing local data first, perform only comments/tags/locks/possibly Wikidata writes, and clean up immediately where supported. |

## Validation Sign-Off

- [ ] All plans include targeted RSpec/Jest verification for touched backend/frontend files.
- [ ] All protected Playwright UAT instructions include mock Google login via `a.oauth-icon-google`.
- [ ] Route evidence table is derived from `config/routes.rb`.
- [ ] Non-blocking risks are documented separately from upgrade blockers.
- [ ] No watch-mode test commands.
- [ ] `nyquist_compliant: true` is set after execution evidence confirms coverage.

Approval: pending
