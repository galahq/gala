# Phase 5: Nested Case Interactions - Context

Gathered: 2026-05-04T21:57:39Z
Status: ready for planning

## Phase Boundary

Phase 5 stabilizes high-risk nested case interactions after the core case shell is stable. The phase covers comments/conversation, cards, case elements, pages, podcasts, edgenotes, stats/map, quizzes, Wikidata/SPARQL, locks, forums, activities, taggings, and related JSON mutation endpoints from `config/routes.rb`.

This is an upgrade-stabilization phase, not a redesign or broad security-hardening phase. Fixes should stay narrow, route-driven, and tied to observed BlueprintJS 2-era parity or upgrade regressions.

## Decisions

### Mutation Depth

- Use broad read-only visual/API coverage plus a small number of reversible writes.
- Browser mutations should be limited to lower-risk reversible interactions: comments, tags, locks, and possibly Wikidata links when local data makes that safe.
- Prefer read/API/spec-first coverage for pages, cards, podcasts, edgenotes, and quizzes unless a safe interactive check is clearly needed.
- Create disposable test data only when needed and clean it up in the same QA pass when UI/API support deletion.
- Use existing local cases/readers first. Do not build seed-data infrastructure in this phase.

### QA Route Order

- Start with reader/editor-visible surfaces: comments/conversation, pages/cards, edgenotes, and podcasts.
- Then inspect stats/map, then quiz flows, then Wikidata/SPARQL.
- For each protected route group, sign in through `/readers/sign_in` and click `a.oauth-icon-google` before protected surface inspection.
- Cover JSON-only or hard-to-reach routes with request specs or direct API checks beside the nearest related UI route.

### Known Risk Boundaries

- Keep the phase focused on upgrade stabilization.
- Document, but do not fix unless blocking, these known concern-map risks:
  - SPARQL/Wikidata malformed input failures.
  - Broad lock class resolution via dynamic params.
  - Edgenote link expansion fetch safety and provider HTML rendering.
  - Stats overview HTML replacement behavior.
  - Accepted local Mapbox production-style noise.
  - Legacy React warnings.
- Treat a concern as blocking only if it causes route 500s, blank screens, broken expected JSON behavior, blocked visual QA, or protected data/action exposure.
- Record non-blocking risks in QA evidence with route, symptom, and suggested future hardening scope.

### Visual Parity

- Visual gates require usable, nonblank surfaces with no new blocking console or network errors.
- Key Blueprint states to inspect where present: dialogs, popovers, toasts, buttons, inputs, tags, and loading/progress indicators.
- Existing React 16 warnings, accepted local Mapbox production-style 404s, and third-party/browser noise should be classified rather than failed unless visible behavior breaks.
- Deeper interaction checks are required for interactive widgets: comment editor, edgenote editor/link expansion, stats date/map controls, quiz editor/show flow, Wikidata search/add, and lock/tag controls.
- Preserve the old Gala/Blueprint 2-era density and behavior. Do not redesign toward Blueprint 4 defaults unless required to resolve a verified regression.
- Capture Playwright screenshots only for ambiguous visual regressions, failures, or before/after fixes. Routine passing route checks do not need committed screenshots.

### Carried Forward

- `config/routes.rb` remains the source of truth for route coverage.
- Use `localhost:3000` for local app QA where appropriate; Playwright MCP running in Docker should reach the app through `http://host.docker.internal:3000`.
- The prior browser-container HMR host/origin issue is resolved by Shakapacker `allowed_hosts`; old invalid host notes are historical.
- Protected-route visual UAT uses mock Google login from `config/initializers/mock_omniauth.rb`, signing in the mock admin `dev@learnmsc.org`.
- The production Mapbox style `mapbox://styles/cbothner/cj5l9s2dg2aps2sqfrnidiq14` may fail locally. That is accepted unless map behavior visibly breaks.
- Docker is required for app tests because the host Ruby does not match the app runtime.
- For focused Jest inside compose, use `docker compose exec -e NODE_ENV=test web yarn jest ...`.
- Local Selenium feature specs are currently blocked by driver initialization; prefer controller/request specs, Jest, and Playwright MCP for Phase 5 verification.

## Canonical References

### Planning

- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/phases/04-core-case-shell/04-CONTEXT.md`
- `.planning/phases/04-core-case-shell/04-QA.md`
- `.planning/phases/04-core-case-shell/04-VALIDATION.md`
- `.planning/phases/04-core-case-shell/04-UI-REVIEW.md`

### Codebase Maps

- `.planning/codebase/ARCHITECTURE.md`
- `.planning/codebase/TESTING.md`
- `.planning/codebase/CONCERNS.md`

### Route Source

- `config/routes.rb`

Relevant Phase 5 route groups include `cards`, `case_elements`, `pages`, `podcasts`, `edgenotes`, `comment_threads`, `comments`, nested case `activities`, `forums`, `locks`, `quizzes`, `stats`, `taggings`, `wikidata_links`, quiz submissions, and `sparql#index/show`.

### Source Areas

- `app/javascript/Case.jsx`
- `app/javascript/shared/orchard.js`
- `app/controllers/concerns/broadcast_edits.rb`
- `app/controllers/cards_controller.rb`
- `app/controllers/case_elements_controller.rb`
- `app/controllers/comments_controller.rb`
- `app/controllers/edgenotes_controller.rb`
- `app/controllers/forums_controller.rb`
- `app/controllers/locks_controller.rb`
- `app/controllers/pages_controller.rb`
- `app/controllers/podcasts_controller.rb`
- `app/controllers/quizzes_controller.rb`
- `app/controllers/taggings_controller.rb`
- `app/controllers/wikidata_links_controller.rb`
- `app/controllers/sparql_controller.rb`
- `app/controllers/cases/stats_controller.rb`
- `app/javascript/comments`
- `app/javascript/conversation`
- `app/javascript/edgenotes`
- `app/javascript/page`
- `app/javascript/podcast`
- `app/javascript/quiz`
- `app/javascript/stats`
- `app/javascript/wikidata`

## Code Context

- The case app is a React island seeded from `window.caseData` in the Rails case view.
- Main case state flows through `app/javascript/Case.jsx` and Redux modules under `app/javascript/redux`.
- JSON mutations commonly use Orchard helpers from `app/javascript/shared/orchard.js` with CSRF and session headers.
- Controllers often mutate records and broadcast edits through `BroadcastEdits` and ActionCable.
- Stats flow through `Cases::StatsController`, `CaseStatsService`, `Cases::StatsSerializer`, and `app/javascript/stats`.
- Existing frontend code is legacy React/Flow with Blueprint compatibility shims. Prefer local patterns over new abstractions.

## Planning Guidance

- Plan route coverage directly from `config/routes.rb`.
- Use existing local records first and document any substitutions.
- Pair UI checks with targeted request/Jest coverage for touched surfaces.
- Keep browser writes minimal, reversible, and cleaned up.
- Classify console/network noise as blocking, accepted, or follow-up risk.
- Avoid broad Blueprint cleanup; defer cross-route visual modernization to later phases unless a Phase 5 route is broken.

## Deferred

- Broad SPARQL/Wikidata security hardening.
- Lock class allowlist refactor unless blocking protected action behavior.
- Link expansion SSRF/XSS hardening unless route QA reveals active exposure.
- Stats HTML replacement redesign.
- New seed-data infrastructure.
- Pixel-perfect screenshot regression suite.
- Broad Blueprint 4 cleanup not required by Phase 5 route QA.
