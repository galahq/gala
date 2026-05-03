<!-- refreshed: 2026-05-03 -->
# Architecture

**Analysis Date:** 2026-05-03

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                     Rails HTTP Application                   │
├──────────────────┬──────────────────┬───────────────────────┤
│ REST Controllers │ Admin Controllers│ React Shell Views      │
│ `app/controllers`│ `app/controllers/admin` │ `app/views`     │
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Domain, Authorization, Serialization            │
│ `app/models`, `app/services`, `app/policies`,                │
│ `app/serializers`, `app/decorators`                          │
└─────────────────────────────────────────────────────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│       PostgreSQL, Active Storage, Sidekiq, Action Cable       │
│ `db/structure.sql`, `app/jobs`, `app/channels`                │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                Shakapacker React Frontend                    │
│ `app/javascript/packs`, `app/javascript/redux`,               │
│ `app/javascript/catalog`, `app/javascript/Case.jsx`           │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Route map | Defines Rails routes, React Router catch-all paths, admin namespace, Devise endpoints, Sidekiq mount, health check, and runtime stats endpoint | `config/routes.rb` |
| Application controller | Owns cross-request locale selection, Sentry context, ToS enforcement, Pundit rescue behavior, LTI validation helpers, and current user null-object fallback | `app/controllers/application_controller.rb` |
| Case controller | Owns case listing, case show bootstrap, case create/update/delete, eager loading, lock verification, and edit broadcasts | `app/controllers/cases_controller.rb` |
| Catalog controller | Owns root catalog shell and initial case scope for the catalog page | `app/controllers/catalog_controller.rb` |
| Domain models | Own persistence associations, scopes, callbacks, validations, and domain relationships | `app/models` |
| Services | Own multi-step operations, external API access, reports, stats queries, and orchestration that does not fit a model callback | `app/services` |
| Policies | Own authorization scopes and action predicates via Pundit | `app/policies` |
| Serializers | Own JSON shapes sent from Rails controllers and broadcast jobs to React | `app/serializers` |
| Decorators | Own view-facing model presentation through Draper | `app/decorators` |
| Jobs | Own async archive refreshes, clone operations, broadcasts, notification delivery, search index refreshes, and snapshots | `app/jobs` |
| Channels | Own Action Cable subscriptions for collaborative editing, forum updates, stats, and reader notifications | `app/channels` |
| React packs | Mount page-level React applications from Rails views through Shakapacker | `app/javascript/packs` |
| Case React app | Owns in-case routing, comment/forum fetch bootstrap, edit mode startup, Action Cable subscription lifecycle, and lazy subroutes | `app/javascript/Case.jsx` |
| Redux | Owns the case reader/editor state tree, reducers, actions, thunks, and Action Cable event mapping | `app/javascript/redux` |
| Catalog React app | Owns catalog search/home routing and client data contexts | `app/javascript/catalog` |

## Pattern Overview

**Overall:** Rails MVC with service objects and React islands.

**Key Characteristics:**
- Rails owns routing, authentication, authorization, server rendering shells, JSON endpoints, background jobs, Action Cable channels, and persistence.
- React is mounted per page through Shakapacker packs in `app/javascript/packs`; it is not a standalone SPA server.
- The primary case reader/editor is a React Router and Redux application seeded by `window.caseData` from `app/views/cases/show.html.erb`.
- Catalog UI uses React context providers rather than Redux and is mounted from `app/javascript/packs/catalog.entry.jsx`.
- Server mutations commonly return ActiveModelSerializer JSON and can broadcast changes through `BroadcastEdits`, `BroadcastEdit`, `EditBroadcastJob`, and `EditsChannel`.

## Layers

**Routing Layer:**
- Purpose: Convert HTTP paths to Rails controllers and delegate nested case/catalog paths to React Router when no explicit format is requested.
- Location: `config/routes.rb`
- Contains: REST resources, nested case resources, catalog catch-all, Devise routes, Sidekiq mount, health endpoint, runtime diagnostics endpoint.
- Depends on: Rails routing, Devise, Sidekiq Web.
- Used by: All controllers and Rails URL helpers.
- Use this layer for new public endpoints, admin resources, and React catch-all changes.

**Controller Layer:**
- Purpose: Authenticate, authorize, load records, select response formats, call services, and render HTML/JSON/CSV.
- Location: `app/controllers`
- Contains: `ApplicationController`, resource controllers, namespaced controllers such as `app/controllers/cases/stats_controller.rb`, concerns in `app/controllers/concerns`.
- Depends on: Models, services, serializers, decorators, policies, Rails responders.
- Used by: Rails routes.
- Keep controller actions thin; move reusable multi-step operations to `app/services`.

**Domain Model Layer:**
- Purpose: Represent persisted entities and domain relationships.
- Location: `app/models`
- Contains: ActiveRecord models, concerns, null-object style models such as `app/models/anonymous_user.rb`, namespace models such as `app/models/case/archive.rb`.
- Depends on: ActiveRecord, Active Storage, gems such as FriendlyId, Rolify, Mobility, and domain concerns.
- Used by: Controllers, services, policies, serializers, jobs, decorators.
- Put associations, scopes, validations, and small domain methods here. Use services for long workflows or external calls.

**Service Layer:**
- Purpose: Encapsulate operations that coordinate multiple models, raw SQL, external APIs, reports, or side effects.
- Location: `app/services`
- Contains: `app/services/case_stats_service.rb`, `app/services/deploy_case_service.rb`, `app/services/wikidata.rb`, `app/services/find_cases.rb`, `app/services/quiz_updater.rb`.
- Depends on: Models, Rails cache, external clients, ActiveRecord connections.
- Used by: Controllers, jobs, and models when needed.
- Add new services as plain Ruby classes with explicit initializer dependencies and a narrow public method such as `call`, `execute`, or named query methods.

**Authorization Layer:**
- Purpose: Centralize user permissions and query scopes.
- Location: `app/policies`
- Contains: Pundit policy classes and scopes, including `app/policies/case_policy.rb`.
- Depends on: Reader roles, model associations, Pundit.
- Used by: Controllers, channels, serializers where permission-derived JSON is required.
- Add or update policies when a new controller action, channel subscription, admin view, or serializer exposes protected data.

**Serialization Layer:**
- Purpose: Shape JSON for REST endpoints, initial React bootstraps, and Action Cable broadcasts.
- Location: `app/serializers`
- Contains: ActiveModelSerializer classes, namespaced serializers such as `app/serializers/cases/show_serializer.rb`.
- Depends on: Models, decorators, Rails route helpers through `view_context`.
- Used by: Controllers and jobs.
- Prefer serializers over ad hoc controller hashes for model-backed responses.

**Presentation Layer:**
- Purpose: Render Rails HTML shells, HAML/ERB pages, layouts, mailer views, JSON builders, and model presentation helpers.
- Location: `app/views`, `app/decorators`, `app/helpers`
- Contains: React mount shells like `app/views/cases/show.html.erb`, catalog shell `app/views/catalog/home.html.haml`, layouts in `app/views/layouts`.
- Depends on: Controllers, decorators, serializers, helpers.
- Used by: Browser requests and mailers.
- Mount React by rendering a stable DOM target and appending a Shakapacker pack.

**Frontend Entry Layer:**
- Purpose: Mount page-level JavaScript bundles into Rails-rendered DOM nodes.
- Location: `app/javascript/packs`
- Contains: `case.entry.jsx`, `catalog.entry.jsx`, `deployment.entry.jsx`, `billboard.entry.jsx`, Stimulus/controller entrypoints.
- Depends on: Shakapacker, React, ReactDOM, locale loader, app modules.
- Used by: Rails views through `append_javascript_pack`.
- Add new React page bootstraps here only when a Rails view needs a separate bundle.

**Frontend Domain UI Layer:**
- Purpose: Implement browser interactions for cases, catalog, comments, edgenotes, quizzes, stats, reading lists, maps, and shared UI.
- Location: `app/javascript`
- Contains: feature folders such as `app/javascript/catalog`, `app/javascript/conversation`, `app/javascript/edgenotes`, `app/javascript/stats`, `app/javascript/wikidata`, and shared utilities.
- Depends on: React, styled-components, Blueprint, Flow types, local modules.
- Used by: Packs and other components.
- Use feature folders for page-specific UI and `app/javascript/shared` or `app/javascript/utility` for cross-feature helpers.

**State and API Layer:**
- Purpose: Manage case app state, Redux actions/reducers, fetch helpers, and Action Cable event mapping.
- Location: `app/javascript/redux`, `app/javascript/shared/orchard.js`
- Contains: reducers in `app/javascript/redux/reducers`, thunks in `app/javascript/redux/actions`, Flow state shape in `app/javascript/redux/state.js`, fetch wrapper `Orchard`.
- Depends on: Redux, redux-thunk, fetch, CSRF meta tags, Action Cable global `App`.
- Used by: `app/javascript/Case.jsx` and case feature components.
- Use `Orchard.harvest/graft/espalier/prune` for JSON HTTP calls so CSRF and session-id broadcast suppression stay consistent.

**Async and Realtime Layer:**
- Purpose: Process background work and broadcast live updates.
- Location: `app/jobs`, `app/channels`, `app/controllers/concerns/broadcast_edits.rb`, `app/services/broadcast_edit.rb`
- Contains: ActiveJob classes, Action Cable channels, edit broadcast pipeline.
- Depends on: Sidekiq, Action Cable, ActiveModelSerializer, Pundit.
- Used by: Controllers, services, React Action Cable subscriptions.
- Use `BroadcastEdits` in controllers that mutate case components and need collaborative editor updates.

**Data Layer:**
- Purpose: Persist relational data and file attachments.
- Location: `db/structure.sql`, `db/migrate`, `config/database.yml`, `config/storage.yml`, `storage`
- Contains: PostgreSQL schema, migrations, Active Storage configuration and local storage.
- Depends on: ActiveRecord, PostgreSQL, Active Storage.
- Used by: Models, services, jobs.
- Add migrations under `db/migrate` and keep schema format as SQL.

## Data Flow

### Primary Case Page Load

1. Browser requests `/cases/:slug`; route maps to `CasesController#show` and React catch-all suffixes also route to `CasesController#show` (`config/routes.rb:84`, `config/routes.rb:134`).
2. `CasesController#set_case` loads a decorated case through FriendlyId and eager-loads cards, podcasts, edgenotes, pages, and attachments (`app/controllers/cases_controller.rb:104`).
3. `CasesController#show` authenticates unpublished cases, authorizes via Pundit, resolves enrollment/group/deployment, and renders HTML or JSON (`app/controllers/cases_controller.rb:44`).
4. `app/views/cases/show.html.erb` serializes `@case` through `Cases::ShowSerializer` into `window.caseData` and appends the `case` JavaScript pack (`app/views/cases/show.html.erb:7`, `app/views/cases/show.html.erb:18`).
5. `app/javascript/packs/case.entry.jsx` creates the Redux store, loads locale messages, wraps providers, and mounts `<Case />` into `#container` (`app/javascript/packs/case.entry.jsx:27`, `app/javascript/packs/case.entry.jsx:40`).
6. `app/javascript/Case.jsx` parses cards, fetches comments/forums when appropriate, starts edit mode from the `edit` query param, subscribes to Action Cable, and routes to overview, quiz, conversation, suggested quizzes, or case element screens (`app/javascript/Case.jsx:133`, `app/javascript/Case.jsx:181`).

### Catalog Page Load

1. Browser requests `/`; route maps to `CatalogController#home` (`config/routes.rb:35`).
2. `CatalogController#home` assigns `@cases = policy_scope(Case).ordered` and renders with the `with_header` layout (`app/controllers/catalog_controller.rb`).
3. `app/views/catalog/home.html.haml` renders `#catalog-app`, appends the `catalog` pack, and preloads JSON endpoints for profile, cases, features, enrollments, tags, and catalog libraries.
4. `app/javascript/packs/catalog.entry.jsx` loads locale messages and mounts `<Catalog />` into `#catalog-app`.
5. `app/javascript/catalog/index.jsx` uses React Router, catalog data contexts, reader data context, content selection context, and routes between catalog home and search results.

### JSON Mutation and Broadcast Flow

1. A React action calls `Orchard.graft`, `Orchard.espalier`, or `Orchard.prune`, which sends JSON, CSRF token, credentials, and an `X-Session-ID` header (`app/javascript/shared/orchard.js:21`, `app/javascript/shared/orchard.js:38`, `app/javascript/shared/orchard.js:54`).
2. A Rails controller action authenticates, authorizes, verifies locks when required, and persists the model (`app/controllers/cases_controller.rb:24`, `app/controllers/cases_controller.rb:75`).
3. Controllers that include `BroadcastEdits` enqueue a broadcast after successful create/update/destroy responses (`app/controllers/concerns/broadcast_edits.rb:8`).
4. `BroadcastEdit` enqueues `EditBroadcastJob` with resource, case slug, cached params, action type, and session id (`app/services/broadcast_edit.rb`).
5. `EditBroadcastJob` serializes the changed resource and broadcasts to `EditsChannel` for that case (`app/jobs/edit_broadcast_job.rb:31`).
6. `app/javascript/redux/actions/editsChannel.js` maps incoming watchables to Redux actions and ignores messages from the same browser session.

### Stats Flow

1. Browser requests `/cases/:case_slug/stats` or `/cases/:case_slug/stats.json`; route maps to `Cases::StatsController#show` (`config/routes.rb:118`).
2. `Cases::StatsController#set_case` finds the case and authorizes `stats?` (`app/controllers/cases/stats_controller.rb:35`).
3. `CaseStatsService` resolves date ranges, queries `Ahoy::Event`, caches normalized country stats, and exposes API rows and totals (`app/services/case_stats_service.rb:17`, `app/services/case_stats_service.rb:24`).
4. The controller renders HTML with cached overview, JSON through `Cases::StatsSerializer`, or CSV via `send_data` (`app/controllers/cases/stats_controller.rb:11`).

**State Management:**
- Rails server state lives in ActiveRecord models under `app/models` and PostgreSQL schema `db/structure.sql`.
- Case app browser state lives in Redux under `app/javascript/redux`; initial state is seeded from `window.caseData` in `app/javascript/redux/reducers/caseData.js`.
- Catalog browser state uses React contexts under `app/javascript/catalog/catalogData` and `app/javascript/catalog/readerData`.
- Per-browser edit session identity comes from `sessionId()` in `app/javascript/shared/orchard.js` and is used to suppress echo broadcasts.
- Server-side cached stats use `Rails.cache` in `app/services/case_stats_service.rb` and `app/controllers/cases/stats_controller.rb`.

## Key Abstractions

**Case:**
- Purpose: Root content aggregate for teaching cases, metadata, pages, podcasts, cards, edgenotes, forums, deployments, quizzes, tags, translations, libraries, archives, and Wikidata links.
- Examples: `app/models/case.rb`, `app/controllers/cases_controller.rb`, `app/serializers/cases/show_serializer.rb`, `app/javascript/Case.jsx`.
- Pattern: ActiveRecord aggregate with nested REST resources and a React editor/reader frontend.

**Reader:**
- Purpose: Authenticated user identity, roles, enrollments, communities, editorships, library management, saved reading lists, and Devise account behavior.
- Examples: `app/models/reader.rb`, `app/controllers/readers_controller.rb`, `app/policies/application_policy.rb`.
- Pattern: Devise model with Rolify roles, Active Storage image, and association-derived permissions.

**Policy:**
- Purpose: Pundit authorization for controller actions, route access, channels, and serializer-derived permission flags.
- Examples: `app/policies/case_policy.rb`, `app/policies/library_policy.rb`, `app/channels/edits_channel.rb`.
- Pattern: One policy per resource with nested Scope classes for query visibility.

**Serializer:**
- Purpose: Shared contract for server-rendered JSON bootstraps, API responses, and broadcast payloads.
- Examples: `app/serializers/cases/show_serializer.rb`, `app/serializers/cases/stats_serializer.rb`, `app/serializers/card_serializer.rb`.
- Pattern: ActiveModelSerializer classes with route links and `view_context` scope.

**BroadcastEdits:**
- Purpose: Controller concern for broadcasting successful case-resource mutations.
- Examples: `app/controllers/concerns/broadcast_edits.rb`, `app/services/broadcast_edit.rb`, `app/jobs/edit_broadcast_job.rb`, `app/channels/edits_channel.rb`.
- Pattern: `after_action` concern plus service object plus ActiveJob plus Action Cable channel.

**Orchard:**
- Purpose: Browser-side HTTP client for Rails JSON endpoints.
- Examples: `app/javascript/shared/orchard.js`, `app/javascript/redux/actions/case.js`.
- Pattern: Static fetch helper methods named for GET/POST/PUT/DELETE and shared CSRF/session handling.

**Shakapacker Pack:**
- Purpose: Page-level JavaScript entry mounted by Rails views.
- Examples: `app/javascript/packs/case.entry.jsx`, `app/javascript/packs/catalog.entry.jsx`, `config/shakapacker.yml`.
- Pattern: Rails view creates DOM target and appends named pack.

**CaseStatsService:**
- Purpose: Stats query and formatting boundary for case analytics.
- Examples: `app/services/case_stats_service.rb`, `app/services/case_stats_service/query.rb`, `app/services/case_stats_service/formatter.rb`, `app/controllers/cases/stats_controller.rb`.
- Pattern: Service object with nested query/formatter classes and cache key helpers.

## Entry Points

**Rails Boot:**
- Location: `config/application.rb`, `config/environment.rb`, `config.ru`
- Triggers: Puma, Rails console, jobs, tests.
- Responsibilities: Load Rails, gems, defaults, middleware, schema format, and global app flags.

**HTTP Routes:**
- Location: `config/routes.rb`
- Triggers: Browser and API requests.
- Responsibilities: Route REST, HTML, JSON, CSV, Devise, admin, Sidekiq, health, runtime, and React Router catch-all requests.

**Root Catalog:**
- Location: `app/controllers/catalog_controller.rb`, `app/views/catalog/home.html.haml`, `app/javascript/packs/catalog.entry.jsx`
- Triggers: `GET /` and catalog catch-all routes.
- Responsibilities: Render the catalog shell and mount the catalog React app.

**Case Reader/Editor:**
- Location: `app/controllers/cases_controller.rb`, `app/views/cases/show.html.erb`, `app/javascript/packs/case.entry.jsx`, `app/javascript/Case.jsx`
- Triggers: `GET /cases/:slug`, `GET /cases/:slug/*.html-compatible-path`, and `GET /cases/:slug.json`.
- Responsibilities: Load case data, authorize, serialize bootstrap state, mount React, and manage client routes.

**Admin UI:**
- Location: `app/controllers/admin/application_controller.rb`, `app/dashboards`
- Triggers: `/admin` routes.
- Responsibilities: Administrate dashboard access for editor users.

**Action Cable:**
- Location: `cable/config.ru`, `app/channels`, `app/javascript/redux/actions/*Channel.js`
- Triggers: Browser WebSocket subscriptions.
- Responsibilities: Collaborative edit updates, forums, stats, and reader notifications.

**Background Jobs:**
- Location: `app/jobs`, `config/sidekiq.yml`, `config/initializers/sidekiq.rb`
- Triggers: ActiveJob enqueues from controllers, models, and services.
- Responsibilities: Broadcasts, cloning, archive refreshes, notifications, cleanup, snapshots, and search index refreshes.

**JavaScript Build:**
- Location: `config/shakapacker.yml`, `config/webpack/environment.js`, `app/javascript/packs`
- Triggers: Shakapacker compile/dev server/precompile.
- Responsibilities: Compile React, Flow-era JavaScript, Sass/CSS, images, YAML locale imports, and Webpack chunks into `public/packs`.

## Architectural Constraints

- **Threading:** Rails request handling is Puma-based; background work is ActiveJob with Sidekiq, and Action Cable uses Redis-backed subscriptions. Runtime diagnostics read thread counts in `app/controllers/runtime_controller.rb`.
- **Global state:** Browser code relies on globals `window.caseData`, `window.i18n`, `window.Orchard`, `window.sessionId`, and Action Cable global `App`; see `app/views/cases/show.html.erb`, `app/javascript/shared/orchard.js`, and `app/javascript/Case.jsx`.
- **Global constants:** Routes define `LOCALES`, `LOCALE_REGEX`, and `REACT_ROUTER_LOCATION_REGEX` in `config/routes.rb`; app boot defines `STAGING_ENV` and `TEMPORARY_UNCONFIRMED_ACCESS` in `config/application.rb`.
- **Circular imports:** Not detected during static mapping. Keep Redux action imports through `redux/actions/index.js` and avoid feature components importing reducers.
- **React Router integration:** Rails must route HTML-compatible nested case/catalog paths back to Rails shell actions; update `config/routes.rb` when adding top-level React routes.
- **Serialization contract:** `window.caseData` and broadcast payloads depend on ActiveModelSerializer output. Frontend state shape changes require coordinated updates in `app/serializers`, `app/javascript/redux/state.js`, and reducers.
- **Schema format:** ActiveRecord schema is SQL, configured in `config/application.rb`; rely on `db/structure.sql` rather than `schema.rb`.

## Anti-Patterns

### Bypassing Orchard for Case JSON Mutations

**What happens:** Frontend code calls `fetch` directly for Rails JSON mutations.
**Why it's wrong:** It can omit CSRF headers, credentials, JSON handling, and `X-Session-ID`, which breaks same-session broadcast suppression.
**Do this instead:** Use `Orchard.graft`, `Orchard.espalier`, or `Orchard.prune` from `app/javascript/shared/orchard.js`.

### Returning Ad Hoc JSON for Model-backed UI State

**What happens:** Controllers hand-build JSON for data that React also receives through serializers or broadcasts.
**Why it's wrong:** It creates competing contracts between REST responses, `window.caseData`, and Action Cable payloads.
**Do this instead:** Add or update serializers in `app/serializers`; follow `app/serializers/cases/show_serializer.rb` and controller rendering in `app/controllers/cases_controller.rb`.

### Putting Multi-step Workflows in Controllers

**What happens:** Controllers perform many model updates, external calls, caching, or raw SQL inline.
**Why it's wrong:** It makes actions hard to authorize, test, reuse, and cache.
**Do this instead:** Move orchestration to `app/services`; follow `app/services/deploy_case_service.rb` for transactional workflows and `app/services/case_stats_service.rb` for query/caching workflows.

### Mutating Case Components Without BroadcastEdits

**What happens:** A case component create/update/destroy action persists successfully but does not broadcast to other editors.
**Why it's wrong:** Collaborative editor clients can show stale case state.
**Do this instead:** Include `BroadcastEdits` and declare `broadcast_edits` in the controller, as in `app/controllers/cases_controller.rb` and `app/controllers/wikidata_links_controller.rb`.

## Error Handling

**Strategy:** Use framework-level rescue and format-specific responses on the server, and typed fetch errors in the frontend.

**Patterns:**
- Pundit authorization failures are rescued in `ApplicationController#user_not_authorized`, redirecting HTML and returning `403` for JSON.
- Validation failures commonly return model errors with `:unprocessable_entity`, as in `app/controllers/cases_controller.rb`.
- `Orchard.handleResponse` parses successful JSON/text, raises `OrchardInputError` for 422 responses, and raises `OrchardError` for other failures.
- Jobs can handle deleted records during async broadcast through `rescue_from ActiveJob::DeserializationError` in `app/jobs/edit_broadcast_job.rb`.
- External API failures in `app/services/wikidata.rb` log to Rails and re-raise.

## Cross-Cutting Concerns

**Logging:** Rails logger is used for server logs; Lograge is configured in `config/initializers/lograge.rb`; Wikidata logs query and error messages in `app/services/wikidata.rb`.

**Validation:** ActiveRecord validations live in models such as `app/models/case.rb` and `app/models/reader.rb`; strong parameters live in controllers such as `app/controllers/cases_controller.rb`; frontend fetch 422 handling lives in `app/javascript/shared/orchard.js`.

**Authentication:** Devise authenticates readers through `app/models/reader.rb`, Devise routes in `config/routes.rb`, and reader controllers under `app/controllers/readers`.

**Authorization:** Pundit policies in `app/policies` gate controller actions, policy scopes, admin access, channel subscriptions, and serializer-derived permission flags.

**Internationalization:** Rails locale selection lives in `ApplicationController#set_locale`; locale files live under `config/locales`; React packs dynamically import `react-intl` locale data and load messages through `config/locales/index.js`.

**Realtime:** Action Cable channels live in `app/channels`; browser subscription lifecycle lives in `app/javascript/Case.jsx` and Redux channel actions; server broadcast jobs live in `app/jobs`.

**Caching:** Rails cache is used for stats payloads and stats overview HTML in `app/services/case_stats_service.rb` and `app/controllers/cases/stats_controller.rb`.

**File Attachments:** Active Storage associations live in models such as `app/models/case.rb`, and direct upload support is used from JavaScript in `app/javascript/edgenotes/editor/Attachment.js`.

---

*Architecture analysis: 2026-05-03*
