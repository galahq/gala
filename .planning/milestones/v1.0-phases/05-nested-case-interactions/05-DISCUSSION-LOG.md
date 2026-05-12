# Phase 5: Nested Case Interactions - Discussion Log

Gathered: 2026-05-04T21:57:39Z
Phase: 5 - Nested Case Interactions
Status: complete

## Selected Gray Areas

The user selected all gray areas for discussion:

- Mutation depth.
- QA route order.
- Known risk boundaries.
- Visual parity strictness.

## Mutation Depth

Question: How deep should Phase 5 mutation testing go?

Selected: read plus light writes.

Decision: Cover the route group broadly with read-only visual/API checks and perform only a small number of reversible create/update/delete checks where local data and the mock admin make the interaction safe.

Question: How should temporary mutation data be handled?

Selected: clean up immediately.

Decision: Disposable test data should be deleted during the same QA pass when the UI/API supports deletion.

Question: Which browser writes are acceptable?

Selected: lowest-risk writes only.

Decision: Limit browser mutations to comments, tags, locks, and possibly Wikidata links. Prefer read/API/spec-first checks for pages, cards, podcasts, edgenotes, and quizzes unless a safe need emerges.

Question: Should Phase 5 create a seed-data strategy?

Selected: existing data first.

Decision: Use current local cases/readers and document substitutions. Do not add seed-data infrastructure in Phase 5.

## QA Route Order

Question: Which UI surfaces should be inspected first?

Selected: reader/editor visible first.

Decision: Start with comments/conversation, pages/cards, edgenotes, and podcasts.

Question: How should specialized surfaces be ordered?

Selected: stats/map, then quiz, then Wikidata/SPARQL.

Decision: After visible content surfaces, inspect stats/map, then quiz, then Wikidata/SPARQL.

Question: How should protected routes handle auth?

Selected: login prelude before protected route groups.

Decision: For each protected route group, sign in through `/readers/sign_in` and click `a.oauth-icon-google` before protected surface inspection.

Question: Where should JSON-only routes be tested?

Selected: API/spec alongside nearby UI.

Decision: Test JSON-only or hard-to-reach routes with request specs or direct API checks alongside the related UI surface.

## Known Risk Boundaries

Question: Should known concern-map risks be fixed in Phase 5?

Selected: document unless blocking.

Decision: Keep Phase 5 focused on upgrade stabilization. Document SPARQL malformed input, lock class resolution, link expansion fetch safety, and stats HTML replacement unless they directly block route QA.

Question: What counts as blocking?

Selected: route breakage or unsafe exposure.

Decision: Blocking means a route 500 or blank screen, broken expected JSON behavior, blocked visual QA, or protected data/action exposure.

Question: Where should non-blocking risks be captured?

Selected: separate risk notes in QA.

Decision: Record non-blocking known concerns in Phase 5 QA evidence with route, symptom, and suggested future hardening scope.

Question: Which known risks should planning watch?

Selected: all current concern-map risks.

Decision: Planning should account for SPARQL malformed input, lock class resolution, link expansion fetch safety, stats HTML replacement, Mapbox local style noise, and legacy React warnings.

## Visual Parity Strictness

Question: What is the visual pass threshold?

Selected: usable plus key Blueprint states.

Decision: Visual gates require usable, nonblank surfaces with no new blocking console/network errors and acceptable key Blueprint states: dialogs, popovers, toasts, buttons, inputs, tags, and loading/progress.

Question: How should known console noise be handled?

Selected: classify, don't fail.

Decision: Existing React 16 warnings, accepted local Mapbox production-style 404s, and third-party/browser noise should be recorded but should not fail the route unless visible behavior breaks.

Question: Which surfaces need deeper widget checks?

Selected: interactive widgets only.

Decision: Deeper interaction checks are required for comment editor, edgenote editor/link expansion, stats date/map controls, quiz editor/show flow, Wikidata search/add, and lock/tag controls.

Question: What visual compatibility target should guide fixes?

Selected: compatibility over redesign.

Decision: Preserve old Gala/Blueprint 2-era density and behavior for spacing, icons, button density, menus, dialogs, and forms. Do not redesign to Blueprint 4 defaults unless required by a verified regression.

Question: When should screenshots be captured?

Selected: evidence when ambiguous.

Decision: Capture Playwright screenshots only for ambiguous visual regressions, failures, or before/after fixes. Do not commit routine screenshots for passing checks.

## Outcome

Phase 5 has enough context to proceed to planning. The plan should be route-driven, use mock Google login for protected surfaces, keep write checks reversible and minimal, and separate upgrade blockers from documented future hardening risks.
