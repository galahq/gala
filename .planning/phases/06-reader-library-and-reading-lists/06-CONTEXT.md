# Phase 6: Reader, Library, and Reading Lists - Context

**Gathered:** 2026-05-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 6 stabilizes user account, profile, library, and reading-list workflows after the case route groups are stable. It covers Devise reader routes, profile/persona/TOS routes, reader index and roles, enrollments, editorships, my cases, libraries, managerships, case library requests, reading lists, saved reading lists, save/unsave behavior, and magic-link surfaces from `config/routes.rb`.

This is an upgrade-stabilization phase, not a redesign or new workflow phase. Fixes should preserve the approximate BlueprintJS 2.3.1-era Gala appearance and existing route behavior while addressing verified regressions.

</domain>

<decisions>
## Implementation Decisions

### Auth and Profile QA Depth
- **D-01:** Use representative browser flows for Devise and profile/TOS routes rather than visiting every low-risk form in browser.
- **D-02:** Browser QA should sign in through `/readers/sign_in` and click `a.oauth-icon-google`, using `config/initializers/mock_omniauth.rb` to authenticate the mock admin `dev@learnmsc.org`.
- **D-03:** Inspect representative signed-in account surfaces such as profile edit/show and terms-of-service handling, plus at least one public Devise form surface such as sign-in, password reset, confirmation, registration, or unlock depending on route availability.
- **D-04:** Backfill route behavior, redirects, and authorization branches with targeted request/controller specs where browser coverage would be repetitive or data-light.

### Reading-List Mutation Safety
- **D-05:** Use a disposable browser-created reading list for the main visual and functional reading-list QA path.
- **D-06:** Exercise create, edit, item selection, save/unsave, and delete/cleanup when the UI and local data make cleanup practical.
- **D-07:** Use existing local cases/enrollments first for list item selection. Do not build broad seed-data infrastructure just for this phase.
- **D-08:** Cover edge cases and hidden-field behavior with focused Jest/request specs, especially around `app/javascript/reading_list` and nested `reading_list_items_attributes`.

### Library and Management Authorization
- **D-09:** Use the mock admin session for reachable library, managership, case-library-request, reader, enrollment, editorship, and my-cases surfaces.
- **D-10:** If local data does not include manager-accessible libraries or pending case-library requests, document the browser gap and supplement manager/request paths with controller/request specs.
- **D-11:** Do not treat anonymous redirect behavior as sufficient for manager-focused routes when the route's visible affordance or authorization behavior is central to the phase.
- **D-12:** Create or modify local data only when it is narrow, disposable, and clearly safer than overbuilding seed setup.

### Visual Parity Focus
- **D-13:** Give the closest Blueprint parity attention to the reading-list editor, item chooser, hidden-form-backed item list, and save/unsave controls.
- **D-14:** Auth/profile forms are the second visual priority: verify form density, inputs, labels, button sizing, OAuth button presentation, flashes, and TOS flow.
- **D-15:** Library and management screens are the third visual priority: verify tables/lists, management buttons, destructive controls, confirmation flows, and visible authorization affordances.
- **D-16:** Keep visual fixes route-driven and narrow. Add `.bp4-*` companions or scoped compatibility styles only where Phase 6 surfaces visibly need them.

### Carried Forward
- **D-17:** `config/routes.rb` remains the source of truth for route coverage.
- **D-18:** Browser QA should use `localhost:3000` for the app and `http://host.docker.internal:3000` from Playwright MCP when running in the browser container.
- **D-19:** Check browser console and network errors before marking the route group complete.
- **D-20:** Existing React 16 warnings, accepted local Mapbox style noise, and unrelated third-party/browser noise should be classified rather than failed unless visible behavior breaks.
- **D-21:** Docker Compose is the preferred runtime for targeted app tests because the host Ruby does not match the app runtime.

### the agent's Discretion
- The agent may choose the exact representative Devise/profile forms based on route reachability and local data, as long as the QA evidence explains the sample.
- The agent may choose the disposable reading-list title/content and cleanup approach.
- The agent may decide whether a missing manager/library browser path is better covered by a narrow local record setup or a targeted spec, but must document the choice.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning
- `.planning/PROJECT.md` — milestone goal, route-driven upgrade rules, mock Google login guidance, and Blueprint compatibility target.
- `.planning/REQUIREMENTS.md` — `READ-01`, `READ-02`, `READ-03`, and shared QA requirements.
- `.planning/ROADMAP.md` — Phase 6 route list, UI areas, and success criteria.
- `.planning/STATE.md` — current milestone and phase position.
- `.planning/phases/05-nested-case-interactions/05-CONTEXT.md` — prior protected-route QA, Playwright MCP, Docker test, and visual-noise decisions.

### Codebase Maps
- `.planning/codebase/CONVENTIONS.md` — Rails, React, Flow, Blueprint, and test conventions.
- `.planning/codebase/STRUCTURE.md` — reader, library, reading-list, controller, view, and JavaScript locations.
- `.planning/codebase/TESTING.md` — RSpec, request/controller spec, feature spec, Jest, and Docker test patterns.

### Route Source
- `config/routes.rb` — source of truth for Phase 6 reader, profile, library, reading-list, saved-list, magic-link, enrollment, editorship, managership, role, and request routes.

### Source Areas
- `config/initializers/mock_omniauth.rb` — local Google mock login for protected-route visual QA.
- `app/controllers/readers_controller.rb` — profile, reader, and TOS actions.
- `app/controllers/readers/sessions_controller.rb` — Devise session behavior and magic-link handling.
- `app/controllers/readers/registrations_controller.rb` — reader registration behavior.
- `app/controllers/readers/confirmations_controller.rb` — confirmation and magic-link redirect behavior.
- `app/controllers/personas_controller.rb` — nested profile persona updates.
- `app/controllers/enrollments_controller.rb` — enrollment index JSON.
- `app/controllers/editorships_controller.rb` — case editor invitation and removal routes.
- `app/controllers/libraries_controller.rb` — library index/show/edit surfaces.
- `app/controllers/managerships_controller.rb` — library manager creation/index/destroy routes.
- `app/controllers/case_library_requests_controller.rb` — library request management routes.
- `app/controllers/my_cases_controller.rb` — signed-in reader case list.
- `app/controllers/magic_links_controller.rb` — magic-link show/create routes.
- `app/controllers/reading_lists_controller.rb` — reading-list show/new/create/edit/update/destroy.
- `app/controllers/reading_list_saves_controller.rb` — reading-list save/unsave behavior.
- `app/controllers/saved_reading_lists_controller.rb` — saved reading-list index JSON.
- `app/javascript/reading_list` — reading-list editor, item chooser, hidden form inputs, and tests.
- `app/javascript/controllers/reading_list_controller.js` — save/unsave Stimulus controller.
- `app/views/devise` — Devise form surfaces.
- `app/views/readers` — profile, reader index, and TOS surfaces.
- `app/views/libraries` — library and management surfaces.
- `app/views/reading_lists` — reading-list form, show, action, and save button surfaces.
- `app/views/magic_links/show.html.haml` — magic-link entry surface.
- `spec/requests/reader_spec.rb` — existing TOS route behavior coverage.
- `spec/requests/saved_reading_lists_index_spec.rb` — existing saved-list JSON coverage.
- `app/javascript/reading_list/__tests__/HiddenFormInputs.test.jsx` — existing reading-list hidden input coverage.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/javascript/reading_list/ReadingListEditor.jsx`: React editor mounted into Rails reading-list forms.
- `app/javascript/reading_list/CaseChooser.jsx`: existing case/enrollment chooser using Orchard data from `enrollments`.
- `app/javascript/reading_list/HiddenFormInputs.jsx`: converts React editor state into Rails nested attributes for list items.
- `app/javascript/controllers/reading_list_controller.js`: Stimulus save/unsave behavior using Orchard `graft` and `prune`.
- `BlueprintFormBuilder`: used by reading-list and reader forms for legacy Blueprint form presentation.
- `config/initializers/mock_omniauth.rb`: development/test mock admin login path for protected browser QA.

### Established Patterns
- Rails-rendered forms and HAML/ERB views still carry legacy Blueprint class names that may need `.bp4-*` companions only when visible Phase 6 regressions require them.
- Reading-list editing is a Rails form plus React island, so QA should check both browser-visible editor behavior and posted nested attribute structure.
- Catalog home already consumes enrollments, saved reading lists, and managerships JSON; Phase 6 route checks should avoid regressing those JSON contracts.
- Request specs are appropriate for protected route behavior and data-light authorization branches; Jest is appropriate for reading-list editor/hidden-input behavior.

### Integration Points
- Protected browser QA starts at `/readers/sign_in` and uses `a.oauth-icon-google`.
- Reading-list routes connect Rails form submissions to `ReadingListsController` and React editor state under `app/javascript/reading_list`.
- Save/unsave actions connect the reading-list show view, Stimulus controller, `ReadingListSavesController`, and current-reader saved lists.
- Library management connects `LibrariesController`, `ManagershipsController`, `CaseLibraryRequestsController`, and authorization/policy behavior.
- Reader/profile flows connect Devise controllers, `ReadersController`, `PersonasController`, and `ApplicationController#confirm_tos`.

</code_context>

<specifics>
## Specific Ideas

- Prefer the reading-list editor as the deepest visual parity target for Phase 6.
- Use a disposable reading-list title that makes cleanup obvious in QA evidence.
- Record exactly which Devise/profile forms were browser-inspected and which route branches were spec-covered.
- Record any missing local manager/request data as a documented non-blocking gap only when specs cover the intended behavior.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 6-Reader, Library, and Reading Lists*
*Context gathered: 2026-05-04*
