# Roadmap: Gala Upgrade Stabilization

**Created:** 2026-05-03
**Milestone:** v1.0 Upgrade Stabilization
**Strategy:** Sequential route-group stabilization with QA and commit gates

## Overview

This milestone finishes the Ruby, Node.js, Shakapacker/Webpacker, and BlueprintJS upgrade by moving through route groups from `config/routes.rb`. Each phase must verify representative routes on `localhost:3000`, fix regressions, run targeted tests, and commit before moving forward.

| Phase | Name | Goal | Requirements |
|-------|------|------|--------------|
| 1 | Baseline Asset Gate | Establish the local QA harness and global BlueprintJS compatibility baseline | FOUND-01, FOUND-02, FOUND-03, FOUND-04, QA-01, QA-02, QA-03, QA-04 |
| 2 | Public and Utility Routes | Verify public errors, health, redirects, locale handling, and runtime surfaces | PUB-01, PUB-02, PUB-03, PUB-04, QA-01, QA-02, QA-03, QA-04 |
| 3 | Catalog Routes | Stabilize root catalog, catalog catch-all, search, libraries, and languages | CAT-01, CAT-02, CAT-03, CAT-04, QA-01, QA-02, QA-03, QA-04 |
| 4 | Core Case Shell | Stabilize case index/show/edit/settings/archive/translations and React Router shell | CASE-01, CASE-02, CASE-03, QA-01, QA-02, QA-03, QA-04 |
| 5 | Nested Case Interactions | Stabilize comments, cards, pages, edgenotes, podcasts, quizzes, stats, forums, locks, tags, and Wikidata-linked interactions | CASE-04, QA-01, QA-02, QA-03, QA-04 |
| 6 | Reader, Library, and Reading Lists | Stabilize Devise reader flows, profiles, enrollments, libraries, reading lists, saved lists, and management routes | READ-01, READ-02, READ-03, QA-01, QA-02, QA-03, QA-04 |
| 7 | Deployments and Integrations | Stabilize deployments, submissions, Canvas/LTI/content-item flows, SPARQL, and external integration route behavior | DEP-01, DEP-02, DEP-03, QA-01, QA-02, QA-03, QA-04 |
| 8 | Admin and Operations | Stabilize admin resources, admin case copy, Sidekiq, and operational access boundaries | ADM-01, ADM-02, ADM-03, QA-01, QA-02, QA-03, QA-04 |
| 9 | 1/1 | Complete    | 2026-05-11 |

## Phase Details

### Phase 1: Baseline Asset Gate

**Goal:** Establish repeatable local QA and fix global BlueprintJS asset loading issues before route-specific work begins.

**Plans:** 3 plans

Plans:
- [x] `01-01-PLAN.md` — Lock down global Blueprint asset loading ownership and layout order with focused tests.
- [x] `01-02-PLAN.md` — Test and preserve the runtime legacy Blueprint namespace bridge.
- [x] `01-03-PLAN.md` — Create and execute the local browser QA gate and phase evidence artifact. Oversized toolbar regression fixed and browser-verified.

**Primary files:**
- `app/views/layouts/application.html.erb`
- `app/assets/stylesheets/application.css`
- `app/javascript/packs/styles.js`
- `app/javascript/shared/blueprint.js`
- `app/javascript/shared/blueprintLegacyNamespace.js`
- `config/webpack/environment.js`
- `config/shakapacker.yml`

**Route sample:**
- `/`
- `/up`
- one authenticated route if test credentials exist

**Success criteria:**
1. Rails app is available at `localhost:3000` or startup blockers are documented and fixed.
2. Global BlueprintJS CSS loads once in the intended order and does not create obvious duplicate or missing styles.
3. Legacy Blueprint namespace compatibility is understood and covered by focused tests or browser checks.
4. QA checklist template exists for later phases and includes route, expected result, browser result, console/network issues, automated tests, and commit hash.

**UI hint:** yes

### Phase 2: Public and Utility Routes

**Goal:** Verify low-authentication public and utility surfaces before deeper app workflows.

**Status:** completed 2026-05-04

**Routes from `config/routes.rb`:**
- `GET /403`, `/404`, `/422`, `/500`
- `GET /up`
- legacy redirects `/read/1071`, `/read/862`, `/read/611`, `/read/497`
- locale redirects `/:locale/*path`
- `GET /runtime/stats`

**Success criteria:**
1. Error pages render without missing layout, broken fonts, or broken Blueprint assets.
2. Health endpoint returns expected plain text.
3. Redirect routes preserve destination behavior and do not accidentally request missing packs.
4. Runtime stats authorization and JSON behavior are unchanged.

**UI hint:** yes

### Phase 3: Catalog Routes

**Goal:** Restore and verify the catalog entry point and catalog React Router flows.

**Status:** completed 2026-05-04

**Routes from `config/routes.rb`:**
- `GET /`
- `catalog/content_items` and nested session destroy
- `catalog/libraries`
- `catalog/languages`
- catalog catch-all `catalog/*react_router_location`
- `search#index`
- `tags#index`

**Representative UI areas:**
- `app/views/catalog/home.html.haml`
- `app/javascript/packs/catalog.entry.jsx`
- `app/javascript/catalog`
- `app/javascript/catalog/search_results`
- Blueprint `InputGroup`, `Button`, `MenuItem`, `MultiSelect`, and `NonIdealState` usage

**Success criteria:**
1. Catalog home and search routes mount React without console errors.
2. Search controls, filters, menus, and empty states visually conform to the prior BlueprintJS-era layout.
3. Catalog catch-all routes remain handled by React Router, not Rails 404s.
4. Targeted catalog Jest tests or equivalent browser QA pass.

**UI hint:** yes

### Phase 4: Core Case Shell

**Goal:** Stabilize the primary case reader/editor shell before nested interactions.

**Status:** completed 2026-05-04

**Plans:** 1 plan

Plans:
- [x] `04-01-PLAN.md` — Derived the core case route checklist, browser-QAed public shell routes and protected redirects, documented editor-auth limitations, and passed the targeted controller spec.

**Routes from `config/routes.rb`:**
- `cases#index`, `cases#show`, `cases#create`, `cases#edit`, `cases#update`, `cases#destroy`
- `cases/:slug/copy`
- `cases/:slug/archive`
- `cases/:slug/settings`
- `cases/:slug/translations`
- case React Router catch-all `cases/:case_slug/*react_router_location`

**Representative UI areas:**
- `app/views/cases/show.html.erb`
- `app/javascript/packs/case.entry.jsx`
- `app/javascript/Case.jsx`
- `app/javascript/overview`
- Blueprint `EditableText`, `Button`, `Dialog`, `Popover`, `Tooltip`, and `Icon` usage

**Success criteria:**
1. Case shell loads seeded `window.caseData` and mounts the React app without runtime errors.
2. Case overview, edit mode entry points, settings, archive, and translations remain navigable.
3. Blueprint controls in overview/editor surfaces have acceptable spacing, icons, focus styles, and disabled/loading states.
4. Targeted case-related tests or browser QA pass before commit.

**UI hint:** yes

### Phase 5: Nested Case Interactions

**Goal:** Stabilize the high-risk nested case route groups and components after the case shell is stable.

**Status:** completed 2026-05-04

**Plans:** 4 plans

Plans:
- [x] `05-01-PLAN.md` — Stabilized nested comment/forum JSON routes with request specs, browser QA, and a comment thread range-param fix.
- [x] `05-02-PLAN.md` — Verified stats HTML/JSON/CSV/overview/map behavior with targeted specs and browser QA.
- [x] `05-03-PLAN.md` — Stabilized quiz/submission JSON routes with request specs, protected browser editor QA, and quiz payload normalization.
- [x] `05-04-PLAN.md` — Verified Wikidata, SPARQL, locks, tags, and final Phase 05 route evidence.

**Routes from `config/routes.rb`:**
- `cards`, `case_elements`, `pages`, `podcasts`, `edgenotes`, `comment_threads`, `comments`
- nested case `activities`, `forums`, `locks`, `quizzes`, `stats`, `taggings`, `wikidata_links`
- `quizzes#show/update/destroy` and nested submissions
- `sparql#index/show`

**Representative UI areas:**
- `app/javascript/comments`
- `app/javascript/conversation`
- `app/javascript/edgenotes`
- `app/javascript/page`
- `app/javascript/podcast`
- `app/javascript/quiz`
- `app/javascript/stats`
- `app/javascript/wikidata`

**Success criteria:**
1. Nested create/update/destroy interactions preserve JSON behavior and do not break Blueprint toasts/progress/dialogs.
2. Stats, map, quiz, Wikidata, edgenote, and comment surfaces render without new console errors.
3. Known security/performance concerns discovered during QA are documented separately unless they directly block upgrade stabilization.
4. Targeted Jest/RSpec coverage runs for touched feature areas.

**UI hint:** yes

### Phase 6: Reader, Library, and Reading Lists

**Goal:** Stabilize user account, profile, library, and reading-list workflows.

**Status:** completed 2026-05-05

**Routes from `config/routes.rb`:**
- Devise `readers` routes
- `profile`, nested `persona`
- `readers#index`, `edit_tos`, `update_tos`, nested roles
- `enrollments`, `editorships`, `my_cases`
- `libraries` and nested `managerships`
- `reading_lists`, nested `save`
- `saved_reading_lists`
- `case_library_requests`
- `magic_link`

**Representative UI areas:**
- Devise layouts and reader views
- `app/javascript/reading_list`
- shared menu, sign-in, toaster, and form utilities

**Success criteria:**
1. Authentication and profile forms keep expected layout and input/button styling.
2. Reading-list creation/edit/show/save flows remain usable.
3. Library and management routes preserve authorization and visible affordances.
4. Targeted tests or browser QA pass before commit.

**UI hint:** yes

### Phase 7: Deployments and Integrations

**Goal:** Stabilize deployment workflows and integration surfaces without weakening validation boundaries.

**Status:** completed 2026-05-05

**Plans:** 1 plan

Plans:
- [x] `07-01-PLAN.md` — Stabilized deployment views/pack classes, added integration route specs, browser-QAed deployment surfaces, and passed targeted route/build gates.

**Routes from `config/routes.rb`:**
- `deployments#index/show/new/create/edit/update`
- nested deployment submissions
- `groups/:group_id/canvas_deployments`
- `authentication_strategies/config/lti`
- Devise omniauth callbacks for authentication strategies
- `catalog/content_items` and content-item session destroy
- `sparql`

**Representative UI areas:**
- `app/javascript/packs/deployment.entry.jsx`
- `app/javascript/deployment`
- Canvas/LTI controllers and views

**Success criteria:**
1. Deployment screens render Blueprint controls correctly and preserve submit/edit behavior.
2. Integration routes preserve existing request validation and redirect behavior.
3. Any malformed-input issues found in SPARQL or integration routes are documented and either fixed narrowly or deferred explicitly.
4. Targeted deployment/integration tests or browser QA pass before commit.

**UI hint:** yes

### Phase 8: Admin and Operations

**Goal:** Stabilize admin dashboards and operational routes after public/user-facing flows are stable.

**Status:** completed 2026-05-11

**Plans:** 2 plans

Plans:
- [x] `08-01-PLAN.md` — Built the routed admin checklist, dataset recipe, and targeted request/controller coverage for admin access, Ahoy ordering, copy behavior, and `/sidekiq`.
- [x] `08-02-PLAN.md` — Browser-QAed representative admin routes, fixed shared admin field rendering regressions, validated the live copy flow and Ahoy ordering, and passed the final targeted spec gate.

**Routes from `config/routes.rb`:**
- `admin` root and all Administrate resources
- `admin/cases/:id/copy`
- `admin/ahoy/events`
- authenticated `Sidekiq::Web` mount at `/sidekiq`

**Representative UI areas:**
- `app/views/layouts/admin.html.erb`
- `app/controllers/admin`
- `app/dashboards`
- Administrate-generated forms and tables

**Success criteria:**
1. Admin index/show/new/edit pages are usable and do not inherit broken Blueprint/global app styles.
2. Admin copy and resource mutations preserve authorization and routing behavior.
3. Sidekiq remains restricted to editor users and does not expose operational UI publicly.
4. Targeted admin specs or browser QA pass before commit.

**UI hint:** yes

### Phase 9: Deslopification and Final Regression

**Goal:** Clean up upgrade leftovers after all route groups have passed.

**Status:** next

**Primary files:**
- Any compatibility CSS/JS touched in earlier phases
- `app/javascript/shared`
- `app/javascript/packs`
- `app/assets/stylesheets/application.css`
- `app/views/layouts`
- planning QA notes from earlier phases

**Success criteria:**
1. Duplicate Blueprint imports, stale bundle assumptions, dead shims, and misleading comments are removed or consolidated.
2. Final broad smoke pass covers the representative routes from every previous phase.
3. `yarn test` and the most relevant RSpec command pass, or failures are documented as pre-existing/non-blocking with evidence.
4. Final commit leaves the codebase cleaner than the start of the milestone and records any remaining risks.

**UI hint:** yes

## Backlog

### Phase 999.8: Follow-up — Phase 8 incomplete plans (BACKLOG)

**Goal:** Resolve execution gap from Phase 8 before finalization.
**Source phase:** 8
**Deferred at:** 2026-05-11 during $gsd-progress --next advancement to Phase 9
**Plans:**
1/1 plans complete

## Execution Rules

- Work phases sequentially.
- Before each phase, derive the route checklist from `config/routes.rb` and update phase notes if new routes are discovered.
- Use browser tooling against `localhost:3000` for route QA whenever the route has a visual surface.
- Inspect browser console and network failures before declaring a route group clean.
- Run targeted automated tests for files touched in the phase.
- Commit after each phase gate with a message that identifies the phase and route group.
- Do not perform broad redesigns or unrelated dependency upgrades during route stabilization.

## Phase 1 Next Step

Run:

```bash
$gsd-discuss-phase 1
```

---
*Roadmap created: 2026-05-03*
