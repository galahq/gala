---
phase: 05
slug: nested-case-interactions
status: complete
completed: 2026-05-04
requirements:
  - CASE-04
  - QA-01
  - QA-02
  - QA-03
  - QA-04
---

# Phase 05 Summary - Nested Case Interactions

## Status

Phase 05 stabilized the nested case route groups for comments/forums, stats/map, quizzes/submissions, and metadata interactions covering Wikidata, SPARQL, locks, and tags.

## Changed Files

- `app/controllers/comment_threads_controller.rb` - normalized nested comment thread range params.
- `app/controllers/quizzes_controller.rb` - normalized frontend `correctAnswer` quiz payloads to `correct_answer`.
- `app/services/wikidata.rb` - returned controlled nil results for blank search/QID and unsupported SPARQL schemas.
- `spec/requests/nested_case_interactions_spec.rb` - covered comment, forum, and nested interaction JSON behavior.
- `spec/requests/quiz_routes_spec.rb` - covered quiz and submission JSON behavior.
- `spec/requests/wikidata_sparql_routes_spec.rb` - covered SPARQL search/show and Wikidata link create/delete behavior with remote calls stubbed.
- `spec/requests/locks_and_taggings_spec.rb` - covered lock and tag read/create/delete behavior.
- `.planning/phases/05-nested-case-interactions/05-QA.md` - recorded route evidence, substitutions, browser findings, temporary writes, cleanup results, and non-blocking risks.

## Commits

- `7fbc5915` - `fix: stabilize nested comment routes`
- `74e2cf35` - `docs: record stats route qa`
- `647d0b00` - `fix: stabilize quiz JSON routes`
- this commit - final Plan 04 Wikidata, SPARQL, locks, tags, and phase completion evidence

## Verification

- PASS: Plan 01 RSpec/Jest and browser route evidence for comments/forums.
- PASS: Plan 02 RSpec/Jest and browser route evidence for stats/map.
- PASS: Plan 03 RSpec/Jest and browser route evidence for quizzes/submissions.
- PASS: Plan 04 RSpec route evidence for Wikidata/SPARQL/locks/tags.
- PASS: Final combined RSpec gate -> 55 examples, 0 failures.
- PASS: Card controller focused gate -> 4 examples, 0 failures.
- PASS: Final combined Jest gate -> 9 suites, 37 tests, 0 failures.
- PASS: Protected browser UAT instructions and execution use `/readers/sign_in` with `a.oauth-icon-google` for mock admin access.

## Risk Notes

- SPARQL malformed input is now controlled for blank search and unsupported schema; deeper SPARQL validation remains future hardening.
- lock class resolution invalid input is 422-covered; allowlist replacement remains future security scope.
- edgenote link expansion fetch safety is unchanged and remains a follow-up hardening item.
- stats HTML replacement is accepted after Plan 02 route and test evidence.
- Mapbox local production style errors are accepted when visible route behavior is not blocked.
- legacy React warnings remain accepted global noise from the current Blueprint/React compatibility layer.

## Self-Check

- PASS: CASE-04 route families have QA evidence or documented non-blocking substitutions.
- PASS: QA-01 route checklist evidence is derived from `config/routes.rb` route groups.
- PASS: QA-02 protected browser UAT records console and network classifications.
- PASS: QA-03 targeted automated tests cover touched backend/frontend files.
- PASS: QA-04 phase artifacts distinguish blockers from accepted follow-up risks.
