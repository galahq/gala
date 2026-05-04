# Phase 4: Core Case Shell - Research

**Researched:** 2026-05-04
**Status:** Ready for planning

## Research Goal

Answer what the planner needs to know to create an executable Phase 4 plan for stabilizing the primary case reader/editor shell.

## Phase Scope

Phase 4 covers the shell-level case routes from `config/routes.rb`:

- `cases#index`, `cases#show`, `cases#create`, `cases#edit`, `cases#update`, `cases#destroy`
- `cases/:slug/copy`
- `cases/:slug/archive`
- `cases/:slug/settings`
- `cases/:slug/translations`
- case React Router catch-all `cases/:case_slug/*react_router_location`

The phase boundary excludes the full nested interaction audit for cards, pages, edgenotes, comments, quizzes, stats, Wikidata, and SPARQL except where a nested route is needed as a shell suffix smoke sample.

## Key Code Paths

### Rails Routes and Controllers

- `config/routes.rb` defines the case REST routes, case nested routes, and the final `scope 'cases'` React Router handoff route.
- `app/controllers/cases_controller.rb` owns index/show/create/edit/update/destroy/copy.
- `CasesController#show` renders HTML with `layout: 'with_header'` and JSON through `Cases::ShowSerializer`.
- `CasesController#edit` redirects to `case_path(@case, edit: true)`; edit mode is a React-shell state, not a separate rendered edit page.
- `CasesController#destroy` currently redirects to `case_confirm_deletion_path` before the authorization/destroy path. Delete confirmation behavior is implemented through `cases/deletions`.

### Case Shell Mount

- `app/views/cases/show.html.erb` renders `#container`, serializes `window.caseData`, and appends the `case` pack.
- `app/javascript/packs/case.entry.jsx` creates the Redux store, loads locale messages, and renders `<Case />` into `#container`.
- `app/javascript/Case.jsx` builds the client router around:
  - `/` -> `CaseOverview`
  - content positions like `/1` -> `CaseElement`
  - `/conversation` -> `Conversation`
  - `/quiz/` -> `PostTest`
  - `/suggested_quizzes` -> `SuggestedQuizzes` when editing

### Toolbar and Editor Entry

- `app/javascript/overview/StatusBar.jsx` owns the shell toolbar actions: catalog/back, conversation, teach/deploy, edit/save, settings, translations, copy, publish/unpublish.
- `app/javascript/utility/Toolbar.jsx` wraps Blueprint `Button`, `Popover`, `Menu`, and `MenuItem`; it already mirrors `pt-*` class names to `bp4-*` for toolbar items through `withBlueprint4Classes`.
- The toolbar is the main Phase 4 React Blueprint risk because it sits above every case shell route and mixes legacy class expectations with Blueprint 4 components.

### Rails-Rendered Case Surfaces

- `app/views/cases/settings/edit.html.haml` already includes several `bp4-*` companions on card/sidebar/tag surfaces.
- `app/views/cases/settings/_slug_form.html.haml`, `_library_form.html.haml`, `_license_form.html.haml`, and `_featured_form.html.haml` already include many paired `pt-*`/`bp4-*` classes.
- `app/views/cases/deletions/new.html.haml` still has several unpaired legacy Blueprint classes:
  - `.admin-card.pt-card.pt-elevation-2`
  - `.pt-running-text`
  - `pt-input pt-fill`
  - `pt-fill pt-intent-danger`
- The planner should make delete-confirmation styling a likely inspection/fix target, but only patch after browser or request evidence shows the route surface needs it.

## Existing Test Coverage

### Ruby Specs

- `spec/controllers/cases_controller_spec.rb` already covers:
  - `POST #create`
  - `GET #show` for overview
  - `GET #show` for a React suffix route (`react_router_location: '1'`)
  - localized case suffix handling
- `spec/features/viewing_a_case_spec.rb` covers public case viewing, enrolled reader access, and editor-visible statistics.
- `spec/features/editing_a_case_spec.rb` covers edit mode entry, content changes, save behavior, and several nested editing flows.
- `spec/features/deleting_a_case_spec.rb` covers delete confirmation, title matching, and no-title behavior.
- `spec/features/publishing_a_case_spec.rb` covers publish/unpublish through the Options menu.
- Factories in `spec/factories/cases.rb` provide `:case`, `:published`, `:in_catalog`, `:case_with_elements`, and `:case_with_edgenotes`.

### Frontend Specs

- `app/javascript/utility/__tests__/Toolbar.test.jsx` verifies shared toolbar contract classes:
  - `.Toolbar__bar`
  - `.MaxWidthContainer`
  - `.Toolbar__group`
  - `.Toolbar__item`
  - paired `.pt-minimal` and `.bp4-minimal` on buttons
- There is no direct `Case.jsx` or `StatusBar.jsx` unit test in the files surveyed. Existing route/browser QA is likely more valuable for this brownfield shell stabilization than adding broad React tests unless a concrete toolbar regression is found.

## Planning Implications

### Recommended Plan Shape

Use one focused Phase 4 plan rather than splitting into separate implementation plans before evidence exists:

1. Derive a route checklist from `config/routes.rb` and Phase 4 context.
2. Discover usable local case slug(s), preferring:
   - one published case for public shell and suffix coverage
   - one editor-accessible case for edit/settings/copy/delete/translation behavior
3. Run browser QA on the full core route sample at `localhost:3000`, including console and network inspection.
4. Run targeted existing specs before or after fixes:
   - `bundle exec rspec spec/controllers/cases_controller_spec.rb`
   - `bundle exec rspec spec/features/viewing_a_case_spec.rb`
   - `bundle exec rspec spec/features/deleting_a_case_spec.rb`
   - `bundle exec rspec spec/features/publishing_a_case_spec.rb`
   - `yarn test app/javascript/utility/__tests__/Toolbar.test.jsx`
5. Apply narrow fixes only for verified regressions.
6. Record Phase 4 QA evidence under `.planning/phases/04-core-case-shell/`.

This phase is route-driven QA plus narrow stabilization, not a pre-planned rewrite.

### Likely Fix Targets

- `app/views/cases/deletions/new.html.haml`: add `bp4-*` companions if delete confirmation renders with mismatched card/input/button styling.
- `app/javascript/overview/StatusBar.jsx`: inspect Options menu, edit/save/publish/settings/translation/copy controls for Blueprint 4 popover/menu/button regressions.
- `app/javascript/utility/Toolbar.jsx`: extend existing paired-class behavior only if toolbar QA reveals missing Blueprint 4 class coverage beyond what `Toolbar.test.jsx` already protects.
- `app/views/cases/settings/*.haml`: inspect before changing; most obvious controls already have paired classes.

### Data/Auth Strategy

The context decision is to use existing local data first. Planning should avoid mandatory seed-data work unless no practical local case route sample exists.

If existing local data is insufficient:

- document skipped/substituted route families in QA evidence
- use request/controller specs with factories to protect stable route behavior
- do not broaden Phase 4 into deterministic fixture engineering

Editor-authenticated browser coverage is required where available. If browser auth setup is not available, authenticated request/controller specs can supplement but should not silently replace all editor browser QA.

## Validation Architecture

Phase 4 should validate at three levels:

1. **Route behavior:** request/controller specs protect HTTP status, redirects, serializer bootstrapping, and React Router catch-all routing.
2. **Browser shell behavior:** Playwright/browser QA verifies the actual mounted shell on `localhost:3000`, including console and network errors.
3. **Blueprint compatibility:** targeted visual/DOM checks verify toolbar/settings/delete controls retain acceptable paired class behavior and layout.

Passing `yarn test` globally is not required unless shared frontend code changes broadly. Targeted tests are preferred for touched files.

## Risks and Watchpoints

- The case shell depends on serialized `window.caseData`; missing local case data or unpublished cases without authentication can turn route QA into auth/data debugging.
- Browser tooling may report webpack-dev-server host/origin noise when accessed through `host.docker.internal`; per prior decisions, treat that as tooling noise unless reproduced at normal `localhost:3000`.
- Some existing feature specs are broad and may be slower or more fragile than request specs. Use the narrowest targeted command that covers touched behavior.
- Do not pull Phase 5 nested interactions into Phase 4. `/conversation` and `/1` are shell suffix samples, not full nested behavior audits.

## RESEARCH COMPLETE
