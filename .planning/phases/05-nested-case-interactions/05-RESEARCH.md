# Phase 5: Nested Case Interactions - Research

Gathered: 2026-05-04T22:10:00Z
Status: complete

## Research Complete

Phase 5 should be planned as route-driven stabilization across four execution slices:

1. Reader/editor-visible nested content: comments, comment threads, pages/cards, edgenotes, podcasts, forums, activities, and case element ordering.
2. Stats/map: stats HTML, JSON, CSV, overview refresh, date filtering, and Mapbox rendering.
3. Quiz flows: suggested quiz index/create/update/destroy, show, and submissions.
4. Wikidata/SPARQL and low-risk case metadata writes: taggings, Wikidata links, SPARQL search/show.

The phase should prefer focused request/controller/Jest coverage plus Playwright MCP visual UAT. Browser writes should stay minimal and reversible.

## Source Route Map

Route source: `config/routes.rb`

- `GET /sparql`, `GET /sparql/:schema/:qid` -> `SparqlController#index/show`.
- Global `activities#update/destroy`; nested `POST /cases/:case_slug/activities`.
- Case nested `comment_threads#index/create`; card nested `comment_threads#create`; global `comment_threads#show/destroy`; nested `comments#create`; global `comments#update/destroy`.
- Case nested `forums#index`.
- Case nested `locks#index`; global `locks#create/destroy`.
- Case nested `quizzes#index/create`; global `quizzes#show/update/destroy`; quiz nested `submissions#index/create`.
- Global `cards#update/destroy`; page nested `cards#create`.
- Global `case_elements#update`.
- Case nested `edgenotes#create`; global `edgenotes#update/destroy`; edgenote attachment destroy; edgenote link expansion show/update.
- Case nested `podcasts#create`; global `podcasts#update/destroy`.
- Case nested `pages#create`; global `pages#update/destroy`.
- Case `stats#show`; case `stats/overview`.
- Case nested `taggings#create/destroy`.
- Case nested `wikidata_links#create/destroy`.

## Backend Patterns

- Mutating nested content commonly uses `authenticate_reader!`, Pundit authorization, `BroadcastEdits`, and sometimes `VerifyLock`.
- JSON mutations return either the changed model/serializer, errors with `422`, `201` on create, or `204` on destroy depending on controller.
- `CardsController`, `PagesController`, `PodcastsController`, `EdgenotesController`, `ActivitiesController`, `TaggingsController`, and `WikidataLinksController` broadcast edits to the case app.
- `LocksController#create` dynamically constantizes `params[:lock][:lockable_type]`; this is a known risk to document unless route QA finds active exposure or breakage.
- `SparqlController` has no auth and delegates to `Wikidata`; malformed/remote failures are known risks to document unless route QA is blocked.
- `Cases::StatsController#show` handles `html`, `json`, and `csv`; `overview` renders raw partial HTML for refresh.

## Frontend Patterns

- Case shell is seeded from `window.caseData` and routed through `app/javascript/Case.jsx`.
- Nested case interactions share Redux modules under `app/javascript/redux` and Orchard HTTP helpers in `app/javascript/shared/orchard.js`.
- Comment UI lives in `app/javascript/comments` and `app/javascript/conversation`.
- Content editing surfaces live in `app/javascript/page`, `app/javascript/podcast`, and `app/javascript/edgenotes`.
- Quiz editor/show components live in `app/javascript/suggested_quizzes` and `app/javascript/quiz`.
- Stats React mount is `app/javascript/controllers/case_stats_controller.js`, with page logic in `app/javascript/stats/StatsPage.jsx` and map logic under `app/javascript/stats/map`.
- Wikidata UI lives in `app/javascript/wikidata` and is rendered from overview/case metadata surfaces.

## Existing Tests

Useful backend coverage already exists:

- `spec/controllers/cards_controller_spec.rb`
- `spec/controllers/cases/stats_controller_spec.rb`
- `spec/controllers/edgenotes/attachments_controller_spec.rb`
- `spec/requests/forums_index_spec.rb`
- `spec/services/case_stats_service_spec.rb`
- `spec/services/case_stats_service/query_spec.rb`
- `spec/services/case_stats_service/formatter_spec.rb`
- `spec/services/quiz_updater_spec.rb`
- `spec/serializers/cases/stats_serializer_spec.rb`
- `spec/jobs/cleanup_locks_job_spec.rb`
- `spec/policies/quiz_policy_spec.rb`

Useful frontend coverage already exists:

- `app/javascript/conversation/__tests__/SelectedCommentThread.test.jsx`
- `app/javascript/stats/__tests__/DatePicker.test.jsx`
- `app/javascript/stats/__tests__/StatsPage.test.jsx`
- `app/javascript/stats/__tests__/mapInternals.test.js`
- `app/javascript/stats/__tests__/statsResponse.test.js`
- `app/javascript/stats/__tests__/statsStore.test.js`
- `app/javascript/suggested_quizzes/__tests__/helpers.test.js`
- `app/javascript/redux/reducers/__tests__/cards.test.js`
- `app/javascript/redux/reducers/__tests__/pagesById.test.js`

Feature specs for suggested quizzes exist but local Selenium is currently blocked by driver initialization, so Phase 5 should not depend on feature specs for automated verification.

## Test Commands

Use Docker compose for app tests:

- Backend focused set:
  `docker compose exec web bundle exec rspec spec/controllers/cards_controller_spec.rb spec/controllers/cases/stats_controller_spec.rb spec/controllers/edgenotes/attachments_controller_spec.rb spec/requests/forums_index_spec.rb spec/services/quiz_updater_spec.rb spec/services/case_stats_service_spec.rb spec/serializers/cases/stats_serializer_spec.rb`
- Stats frontend set:
  `docker compose exec -e NODE_ENV=test web yarn jest app/javascript/stats/__tests__/DatePicker.test.jsx app/javascript/stats/__tests__/StatsPage.test.jsx app/javascript/stats/__tests__/mapInternals.test.js app/javascript/stats/__tests__/statsResponse.test.js app/javascript/stats/__tests__/statsStore.test.js --runInBand`
- Nested content frontend set:
  `docker compose exec -e NODE_ENV=test web yarn jest app/javascript/conversation/__tests__/SelectedCommentThread.test.jsx app/javascript/redux/reducers/__tests__/cards.test.js app/javascript/redux/reducers/__tests__/pagesById.test.js --runInBand`
- Quiz frontend set:
  `docker compose exec -e NODE_ENV=test web yarn jest app/javascript/suggested_quizzes/__tests__/helpers.test.js --runInBand`

If new tests are added, keep commands focused on touched files. Use `NODE_ENV=test` for Jest inside compose because the compose service defaults to development.

## Playwright MCP UAT Notes

- Browser UAT from the MCP container should use `http://host.docker.internal:3000`.
- For protected routes, navigate to `/readers/sign_in` and click `a.oauth-icon-google`; mock OmniAuth signs in `dev@learnmsc.org`.
- Check console and network output before marking a route group complete.
- Treat legacy React 16 warnings, accepted local Mapbox production-style 404s, and third-party noise as classified noise unless visible behavior breaks.
- Capture screenshots only for ambiguous visual regressions, failures, or before/after fixes.

## Risk Register

Document these in QA evidence unless they block route stabilization:

- `SparqlController` and `Wikidata` malformed input/remote failure behavior.
- `LocksController#set_lockable` dynamic constantization from request params.
- Edgenote link expansion URL fetching and provider HTML rendering.
- Stats overview raw HTML replacement.
- Local Mapbox style failures from the production `cbothner` style.
- Legacy React warnings on old components.

## Validation Architecture

Plan verification should require:

- Route coverage table derived from `config/routes.rb`.
- Backend JSON behavior checks for representative create/update/destroy endpoints, using request/controller specs where browser writes are too risky.
- Playwright MCP UAT evidence for protected route groups after mock Google login.
- Console/network classification for each route group: blocking, accepted noise, or follow-up risk.
- Focused Jest/RSpec command output for touched files.
- QA notes documenting any known risk that is not fixed in Phase 5.

## Planning Recommendation

Create four plans:

1. Nested reader/editor content and JSON mutation baseline.
2. Stats/map route and frontend stabilization.
3. Quiz and submission route stabilization.
4. Wikidata/SPARQL, taggings, locks, and final QA evidence.

Keep all plans compatible with the Phase 5 context decisions: existing data first, minimal reversible browser writes, immediate cleanup, mock Google login for protected routes, Blueprint 2-era density, and no broad redesign.
