<!-- refreshed: 2026-05-30 -->
# Architecture

**Analysis Date:** 2026-05-30

## System Overview

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                         Browser / Route Surfaces                             │
├─────────────────────┬─────────────────────┬──────────────────────────────────┤
│ Rails-rendered HTML │ React route islands  │ Stimulus enhancements            │
│ `app/views`         │ `app/javascript`     │ `app/javascript/controllers`      │
└──────────┬──────────┴──────────┬──────────┴──────────────┬───────────────────┘
           │                     │                         │
           ▼                     ▼                         ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Rails request layer                                                          │
│ `config/routes.rb` -> `app/controllers` -> `app/views/layouts`               │
└──────────┬──────────────────────┬─────────────────────────┬──────────────────┘
           │                      │                         │
           ▼                      ▼                         ▼
┌─────────────────────┐  ┌──────────────────────┐  ┌───────────────────────────┐
│ Domain layer         │  │ API serialization     │  │ Async/realtime layer       │
│ `app/models`         │  │ `app/serializers`     │  │ `app/jobs`, `app/channels`  │
│ `app/policies`       │  │ `app/decorators`      │  │ `app/services`             │
└──────────┬──────────┘  └──────────┬───────────┘  └──────────┬────────────────┘
           │                        │                         │
           ▼                        ▼                         ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Storage and infrastructure                                                   │
│ PostgreSQL schema `db/structure.sql`, ActiveStorage `storage`, Redis cable   │
│ and jobs `config/cable.yml` / `config/sidekiq.yml`, AWS SST `infra/`          │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Rails router | Defines public catalog, case, admin, deployment, authentication, Sidekiq, and runtime routes. | `config/routes.rb` |
| Base controller | Applies locale, Sentry context, Devise location storage, ToS enforcement, and Pundit failures. | `app/controllers/application_controller.rb` |
| Catalog controller | Serves the root catalog shell and policy-scoped case list. | `app/controllers/catalog_controller.rb` |
| Cases controller | Owns case index JSON, case shell HTML, case JSON state, authoring updates, locks, and public catalog cache behavior. | `app/controllers/cases_controller.rb` |
| Deployments controller | Owns instructor deployment screens and delegates creation/customization to services. | `app/controllers/deployments_controller.rb` |
| Domain models | Represent case studies, readers, deployments, case elements, cards, edgenotes, quizzes, libraries, roles, and enrollments. | `app/models/case.rb`, `app/models/reader.rb`, `app/models/deployment.rb` |
| Policies | Centralize authorization and policy scopes for controllers, channels, and serializers. | `app/policies/application_policy.rb`, `app/policies/case_policy.rb` |
| Serializers | Produce JSON contracts consumed by React islands and API endpoints. | `app/serializers/application_serializer.rb`, `app/serializers/cases/show_serializer.rb` |
| Service objects | Encapsulate workflows that cross models, such as search, deployment creation, quiz customization, broadcast payloads, and stats. | `app/services/find_cases.rb`, `app/services/deploy_case_service.rb`, `app/services/customize_deployment_service.rb` |
| React case app | Renders case reader/editor routes from serialized `window.caseData` and Redux state. | `app/javascript/Case.jsx`, `app/javascript/packs/case.entry.jsx` |
| React catalog app | Renders catalog home/search routes from context providers and JSON endpoints. | `app/javascript/catalog/index.jsx`, `app/javascript/packs/catalog.entry.jsx` |
| Shared JS API client | Wraps same-origin fetches, CSRF headers, JSON parsing, and session IDs. | `app/javascript/shared/orchard.js` |
| Realtime editing | Broadcasts persisted edits through ActiveJob and ActionCable to Redux actions. | `app/controllers/concerns/broadcast_edits.rb`, `app/jobs/edit_broadcast_job.rb`, `app/channels/edits_channel.rb` |
| Admin dashboard | Uses Administrate dashboards and controllers for editor-only admin surfaces. | `app/controllers/admin/application_controller.rb`, `app/dashboards/case_dashboard.rb` |
| Asset pipeline | Combines Sprockets global CSS with Shakapacker packs and Blueprint compatibility bridges. | `app/assets/stylesheets/application.css`, `app/javascript/packs/styles.js`, `app/javascript/shared/blueprintLegacyNamespace.js` |
| Deployment IaC | Provisions AWS web/worker services, database, cache, CDN, static assets, Cloudflare DNS, and one-off tasks. | `infra/sst.config.ts`, `.github/workflows/deploy.yml`, `scripts/deploy-sst.sh` |

## Pattern Overview

**Overall:** Rails monolith with server-rendered route shells, React/Shakapacker islands, service-object workflows, ActiveModel Serializer API contracts, ActionCable realtime updates, and SST-owned AWS infrastructure.

**Key Characteristics:**
- Use `config/routes.rb` as the source of truth for route groups and browser QA coverage.
- Render durable Rails shells in `app/views`, then mount route-specific React packs through `append_javascript_pack` and `collected_javascript_pack_tag`.
- Keep domain persistence in ActiveRecord models, authorization in Pundit policies, JSON shape in serializers, and cross-model commands in `app/services`.
- Use Redis-backed ActionCable and Sidekiq for collaborative editing, stats refresh, mailers, ActiveStorage work, and index refresh jobs.
- Keep AWS production and preview deployment topology in `infra/sst.config.ts` and `.github/workflows/deploy.yml`, with Rails runtime settings passed by environment variables.

## Layers

**Routing Layer:**
- Purpose: Map URL groups to Rails controllers and mount operational surfaces.
- Location: `config/routes.rb`
- Contains: REST resources, nested case routes, catalog React-router catch-alls, Devise routes, editor-only Sidekiq mount, runtime health/stats endpoints.
- Depends on: Rails routing, Devise, Sidekiq Web, constants `LOCALE_REGEX` and `REACT_ROUTER_LOCATION_REGEX`.
- Used by: Controllers in `app/controllers`, React catch-all routes in `app/javascript/Case.jsx` and `app/javascript/catalog/index.jsx`.

**Controller Layer:**
- Purpose: Authenticate, authorize, load records, choose HTML/JSON responses, coordinate service calls, and set cache/flash/session behavior.
- Location: `app/controllers`
- Contains: Resource controllers, namespaced route controllers, admin controllers, and reusable concerns.
- Depends on: `app/models`, `app/policies`, `app/services`, `app/serializers`, Devise, Pundit, Draper.
- Used by: Rails routes in `config/routes.rb` and browser/API clients.

**View and Layout Layer:**
- Purpose: Render route shells, metadata, shared navigation, flash messages, and React mount points.
- Location: `app/views`
- Contains: ERB/Haml route templates, layouts, Administrate views, Devise views, mailer views, field partials.
- Depends on: `app/helpers/application_helper.rb`, Shakapacker tag helpers, Sprockets assets, serializers for inline state.
- Used by: HTML controller actions such as `CatalogController#home`, `CasesController#show`, and `DeploymentsController#edit`.

**Frontend Pack Layer:**
- Purpose: Mount React apps and Stimulus controllers from Shakapacker entries.
- Location: `app/javascript/packs`
- Contains: `catalog.entry.jsx`, `case.entry.jsx`, `deployment.entry.jsx`, `controllers.js`, `styles.js`, `main-menu.entry.jsx`, and smaller utility packs.
- Depends on: React 16, React Router, Redux, Stimulus, styled-components, react-intl, Blueprint packages, local aliases under `app/javascript`.
- Used by: `app/views` through `append_javascript_pack` and `collected_javascript_pack_tag`.

**Frontend Feature Layer:**
- Purpose: Implement domain-specific browser experiences.
- Location: `app/javascript`
- Contains: Catalog, case reader/editor, deployment customizer, comments, edgenotes, stats, reading list, quiz, map, overview, shared UI, and utility modules.
- Depends on: Shared API client `app/javascript/shared/orchard.js`, route helpers `app/javascript/shared/routes.js`, Redux in `app/javascript/redux`, React Context providers.
- Used by: Route entry packs and Stimulus controllers.

**Domain Layer:**
- Purpose: Model case-study content, readers, deployments, community membership, assessment, comments, reading lists, and analytics.
- Location: `app/models`
- Contains: ActiveRecord models, null objects, model concerns, custom content-state types, FriendlyId slugs, ActiveStorage attachments, Ahoy models.
- Depends on: PostgreSQL schema in `db/structure.sql`, Rails ActiveRecord, ActiveStorage, rolify, FriendlyId, Ahoy.
- Used by: Controllers, policies, serializers, services, jobs, channels, and dashboards.

**Service and Workflow Layer:**
- Purpose: Keep multi-step operations outside controllers and models.
- Location: `app/services`
- Contains: Search (`app/services/find_cases.rb`), deployment creation (`app/services/deploy_case_service.rb`), quiz customization (`app/services/customize_deployment_service.rb`), edit broadcasting (`app/services/broadcast_edit.rb`), stats (`app/services/case_stats_service.rb`).
- Depends on: ActiveRecord transactions, models, policies, serializers, external APIs where relevant.
- Used by: Controllers, jobs, channels, Rake tasks.

**Serialization and Presentation Layer:**
- Purpose: Shape JSON and decorated view presentation.
- Location: `app/serializers`, `app/decorators`, `app/dashboards`, `app/fields`
- Contains: ActiveModel Serializers, Draper decorators, Administrate dashboards/fields.
- Depends on: Rails route helpers, `view_context`, Pundit, ActiveModel Serializer.
- Used by: JSON controllers, inline React boot data, broadcast jobs, admin pages.

**Async and Realtime Layer:**
- Purpose: Run background jobs and push updates to connected readers.
- Location: `app/jobs`, `app/channels`
- Contains: Sidekiq-backed ActiveJob jobs, ActionCable channels, broadcast jobs, archive/index/notification jobs.
- Depends on: Redis via `config/cable.yml` and Sidekiq via `config/sidekiq.yml`.
- Used by: Model callbacks, controller concerns, frontend subscriptions.

**Infrastructure Layer:**
- Purpose: Package and deploy Rails, worker, database, cache, CDN, DNS, and scheduled jobs.
- Location: `infra`, `.github/workflows`, `scripts`, `Dockerfile`, `Procfile`
- Contains: SST config, GitHub Actions deploy workflow, deploy shell script, Docker build/runtime image, local and production process declarations.
- Depends on: AWS, Cloudflare provider, SST, Docker, pnpm/npm, Ruby bundler.
- Used by: CI/CD, production deploys, preview deploys, local development.

## Data Flow

### Catalog HTML and JSON Path

1. `GET /` enters `CatalogController#home` through `config/routes.rb:35`.
2. `CatalogController#home` loads `policy_scope(Case).ordered` in `app/controllers/catalog_controller.rb:12`.
3. `app/views/catalog/home.html.haml:3` provides `#catalog-app` and `app/views/catalog/home.html.haml:4` appends the `catalog` pack.
4. `app/views/layouts/application.html.erb:34` emits default and appended packs through `collected_javascript_pack_tag`.
5. `app/javascript/packs/catalog.entry.jsx:33` mounts `Catalog` into `#catalog-app`.
6. `app/javascript/catalog/catalogData.js:30` fetches `cases.json` through `Orchard.harvest`.
7. `CasesController#index` in `app/controllers/cases_controller.rb:34` returns `Cases::PreviewSerializer` JSON, using public cache headers for anonymous JSON at `app/controllers/cases_controller.rb:41` and `app/controllers/cases_controller.rb:42`.
8. `app/controllers/concerns/public_catalog_cache.rb:26` stores anonymous catalog JSON in `Rails.cache` and `app/controllers/concerns/public_catalog_cache.rb:36` sets CDN-aware `Cache-Control`.

### Case Reader and Editor Path

1. `GET /cases/:slug` enters the case resource route at `config/routes.rb:84`; nested React locations fall through `config/routes.rb:134`.
2. `CasesController#set_case` eager-loads case content in `app/controllers/cases_controller.rb:120` and `app/controllers/cases_controller.rb:121`.
3. `CasesController#show` authorizes and responds with HTML or JSON in `app/controllers/cases_controller.rb:60`.
4. `app/views/cases/show.html.erb:8` serializes `Cases::ShowSerializer` into `window.caseData`.
5. `app/views/cases/show.html.erb:18` appends the `case` pack, and `app/javascript/packs/case.entry.jsx:50` mounts React into `#container`.
6. `app/javascript/Case.jsx:68` creates the React Router/Redux case app; `app/javascript/Case.jsx:115` initializes after mount.
7. `app/javascript/Case.jsx:125` parses serialized card content into Redux, then fetches comments/forums when the reader is enrolled.
8. `app/javascript/Case.jsx:96` subscribes to edit broadcasts so other editors' persisted changes update local Redux state.

### Case Edit Broadcast Path

1. A JSON update reaches `CasesController#update` at `app/controllers/cases_controller.rb:91`.
2. `app/controllers/cases_controller.rb:29` registers `broadcast_edits to: :@case`.
3. `app/controllers/concerns/broadcast_edits.rb:9` runs an after-action for successful create/update/destroy responses.
4. `app/services/broadcast_edit.rb:17` enqueues `EditBroadcastJob` with resource, case slug, cached params, action type, and browser session id.
5. `app/jobs/edit_broadcast_job.rb:32` broadcasts serialized payloads through `EditsChannel`.
6. `app/channels/edits_channel.rb:6` streams only when Pundit allows the current reader to read the case.
7. `app/javascript/redux/actions/editsChannel.js:72` subscribes on the frontend and `app/javascript/redux/actions/editsChannel.js:90` ignores echoes from the same browser session.

### Deployment Customization Path

1. Deployment routes are declared at `config/routes.rb:159`.
2. `DeploymentsController#create` uses `DeployCaseService` in `app/controllers/deployments_controller.rb:34` and `app/controllers/deployments_controller.rb:35`.
3. `DeployCaseService` wraps deployment creation, group administrator assignment, Caselog invitation, and instructor enrollment in `app/services/deploy_case_service.rb:4`.
4. `DeploymentsController#edit` renders the customizer mount at `app/views/deployments/edit.html.haml:9` and appends `deployment` at `app/views/deployments/edit.html.haml:13`.
5. `app/javascript/packs/deployment.entry.jsx` reads JSON from the mount element and renders the deployment React app.
6. `DeploymentsController#update` delegates quiz changes to `CustomizeDeploymentService` at `app/controllers/deployments_controller.rb:55` and `app/controllers/deployments_controller.rb:113`.
7. `CustomizeDeploymentService` creates/reuses quizzes and questions transactionally in `app/services/customize_deployment_service.rb:5`.

### AWS Deploy Path

1. Operators start deploys through `workflow_dispatch` in `.github/workflows/deploy.yml:4`.
2. The workflow builds release metadata in `.github/workflows/deploy.yml:103`, validates input safety, installs infra dependencies, and runs the SST deploy script at `.github/workflows/deploy.yml:180`.
3. `scripts/deploy-sst.sh` validates release IDs, secret-sync constraints, user-data hooks, and runs SST commands.
4. `infra/sst.config.ts:186` provisions PostgreSQL and `infra/sst.config.ts:199` provisions Redis/Valkey.
5. `infra/sst.config.ts:250` runs the Rails web service and `infra/sst.config.ts:289` runs the Sidekiq worker service.
6. `infra/sst.config.ts:343` defines the app CDN and cache behaviors for public catalog JSON.
7. `infra/sst.config.ts:394`, `infra/sst.config.ts:404`, `infra/sst.config.ts:428`, and `infra/sst.config.ts:438` define one-off migrate, seed, refresh-index, and weekly-report tasks.

**State Management:**
- Persistent state lives in PostgreSQL tables recorded by `db/structure.sql`; major domains include `cases`, `case_elements`, `cards`, `edgenotes`, `readers`, `deployments`, `quizzes`, `comments`, `libraries`, `roles`, `active_storage_*`, and `ahoy_events`.
- Sessions hold Devise login state and LTI content-item selection data through concerns such as `app/controllers/concerns/selection_params.rb`.
- Case reader/editor client state lives in Redux reducers under `app/javascript/redux/reducers`.
- Catalog client state lives in React Context providers at `app/javascript/catalog/catalogData.js` and `app/javascript/catalog/readerData.js`.
- Realtime connection state is globalized on `window.App` for ActionCable subscriptions and `window.sessionId` for edit echo suppression in `app/javascript/shared/orchard.js:172`.
- Deploy/runtime configuration is environment-driven through `config/application.rb`, `infra/sst.config.ts`, and `.github/workflows/deploy.yml`.

## Key Abstractions

**Case:**
- Purpose: Central teaching-case aggregate with metadata, locale, publication state, translations, library membership, editors, enrollments, content elements, comments, deployments, quizzes, and attachments.
- Examples: `app/models/case.rb`, `app/controllers/cases_controller.rb`, `app/serializers/case_serializer.rb`.
- Pattern: ActiveRecord aggregate with FriendlyId slugs, model concerns, serializer-backed React state, and policy-scoped access.

**Case Element:**
- Purpose: Ordered table-of-contents entry that points to polymorphic content such as `Page` or `Podcast`.
- Examples: `app/models/case_element.rb`, `app/models/concerns/element.rb`, `app/models/page.rb`, `app/models/podcast.rb`.
- Pattern: Polymorphic join model plus `acts_as_list`, with direct `case` access for efficient eager loading and tracking.

**Card and Edgenote:**
- Purpose: Narrative content and attached media/annotation entities inside a case.
- Examples: `app/models/card.rb`, `app/models/edgenote.rb`, `app/javascript/card`, `app/javascript/edgenotes`.
- Pattern: ActiveRecord content records with `Lockable` and `Trackable` concerns, rendered and edited by the case React app.

**Reader and AnonymousUser:**
- Purpose: Signed-in identity and anonymous null-object identity used by authorization and serializers.
- Examples: `app/models/reader.rb`, `app/models/anonymous_user.rb`, `app/controllers/application_controller.rb`.
- Pattern: Devise model with rolify roles, onboarding/persona state, and null object fallback from `current_user`.

**Deployment:**
- Purpose: Instructor-specific connection between a case, group, quiz, enrollments, and magic-link access.
- Examples: `app/models/deployment.rb`, `app/controllers/deployments_controller.rb`, `app/services/deploy_case_service.rb`.
- Pattern: ActiveRecord workflow aggregate with service-object commands for creation and customization.

**Serializer Contract:**
- Purpose: Keep frontend state shape stable across Rails HTML boot data, JSON endpoints, and ActionCable broadcasts.
- Examples: `app/serializers/application_serializer.rb`, `app/serializers/case_serializer.rb`, `app/serializers/cases/show_serializer.rb`.
- Pattern: ActiveModel Serializer with `view_context`, route links, normalized `has_many_by_id` collections, and conditional reader data.

**Orchard API Client:**
- Purpose: Shared browser wrapper for GET/POST/PUT/DELETE JSON calls.
- Examples: `app/javascript/shared/orchard.js`, `app/javascript/redux/actions/case.js`, `app/javascript/catalog/catalogData.js`.
- Pattern: Same-origin fetch wrapper with CSRF headers, `X-Session-ID`, URL resolution, and typed error classes.

**BroadcastEdits:**
- Purpose: Reconcile collaborative authoring state after successful persisted changes.
- Examples: `app/controllers/concerns/broadcast_edits.rb`, `app/services/broadcast_edit.rb`, `app/jobs/edit_broadcast_job.rb`, `app/javascript/redux/actions/editsChannel.js`.
- Pattern: Controller concern -> service -> ActiveJob -> ActionCable -> Redux action mapping.

**SST Runtime:**
- Purpose: Codify AWS production and preview infrastructure.
- Examples: `infra/sst.config.ts`, `scripts/deploy-sst.sh`, `.github/workflows/deploy.yml`.
- Pattern: Infrastructure-as-code config with explicit environment inputs, retained production resources, immutable release asset prefixes, and service/task outputs.

## Entry Points

**Rack/Rails App:**
- Location: `config.ru`, `config/environment.rb`, `config/application.rb`
- Triggers: Puma, Rails server, Docker container, SST web service.
- Responsibilities: Boot Rails, middleware, routes, controllers, ActiveRecord, assets, and Rack app.

**Local Dev Processes:**
- Location: `Procfile.dev`
- Triggers: Local foreman-style process manager or equivalent.
- Responsibilities: Run Rails on `localhost:3000`, Shakapacker dev server, and Sidekiq.

**Production Processes:**
- Location: `Procfile`, `Dockerfile`, `config/puma.rb`, `config/sidekiq.yml`
- Triggers: Heroku-style process managers or SST ECS services.
- Responsibilities: Run Puma web process and Sidekiq worker process.

**Route Table:**
- Location: `config/routes.rb`
- Triggers: Every HTTP request.
- Responsibilities: Dispatch Rails resources, React-router catch-alls, Devise auth routes, Sidekiq Web, runtime stats, and health check.

**Shakapacker Packs:**
- Location: `app/javascript/packs`
- Triggers: `app/views/layouts/application.html.erb` plus route-level `append_javascript_pack`.
- Responsibilities: Mount React apps, global styles, Stimulus controllers, file upload widgets, main menu, onboarding behavior.

**Stimulus Controllers:**
- Location: `app/javascript/packs/controllers.js`, `app/javascript/controllers`
- Triggers: DOM elements with matching data-controller attributes in Rails views.
- Responsibilities: Progressive interactions around stats, reading lists, confirmations, clipboard, invite drawer, and settings.

**ActionCable:**
- Location: `app/channels`, `config/cable.yml`
- Triggers: Browser ActionCable subscriptions through `window.App.cable`.
- Responsibilities: Reader notifications, edit broadcasts, forum updates, and stats updates.

**Background Jobs:**
- Location: `app/jobs`, `config/sidekiq.yml`
- Triggers: ActiveJob enqueue calls from models, controllers, services, or tasks.
- Responsibilities: Broadcasts, archive refresh, index refresh, notifications, memory snapshots, ActiveStorage queues, mailers.

**Rake Tasks:**
- Location: `Rakefile`, `lib/tasks`
- Triggers: `bundle exec rake ...`, SST tasks, or operator commands.
- Responsibilities: Indices refresh, email reports, tests, local DB utilities, locks cleanup, docs/factory helpers.

**CI/CD and SST:**
- Location: `.github/workflows/deploy.yml`, `scripts/deploy-sst.sh`, `infra/sst.config.ts`
- Triggers: Manual GitHub Actions workflow dispatch or local deploy script.
- Responsibilities: Build release metadata, validate deploy inputs, run SST diff/deploy, create preview comments, create production GitHub releases, deploy AWS/Cloudflare resources.

## Architectural Constraints

- **Threading:** Rails web uses Puma threads and workers configured in `config/puma.rb`; Sidekiq concurrency and queue priorities are configured in `config/sidekiq.yml`; browser JavaScript runs on the single browser event loop with async fetches and ActionCable callbacks.
- **Global state:** Rails route constants live in `config/routes.rb`; environment flags are normalized in `config/application.rb`; frontend globals include `window.i18n` and `window.MAPBOX_*` in `app/views/layouts/application.html.erb`, `window.caseData` in `app/views/cases/show.html.erb`, `window.Orchard` and `window.sessionId` in `app/javascript/shared/orchard.js`, and ActionCable subscriptions under `window.App` in `app/javascript/Case.jsx`.
- **Default scopes:** `Case` orders catalog visibility in `app/models/case.rb`, `Deployment` orders newest first in `app/models/deployment.rb`, and `Reader` orders by name in `app/models/reader.rb`; new queries must account for these defaults when order matters.
- **Circular imports:** Not detected in the focused source scan. JavaScript aliases rely on `jest.config.js` module paths and Shakapacker resolution, so prefer existing alias imports such as `catalog/...`, `shared/...`, and `redux/...`.
- **Route catch-alls:** `config/routes.rb` sends catalog and case subpaths without explicit formats to React Router; do not add conflicting Rails routes after catch-alls without checking order.
- **Secrets:** Runtime secrets are named in `infra/sst.config.ts`, `.github/workflows/deploy.yml`, `config/storage.yml`, and initializers; documents and logs must name env vars only and never include values.
- **Blueprint compatibility:** Raw Blueprint CSS is loaded through Sprockets in `app/assets/stylesheets/application.css`; the Shakapacker `styles` pack adds JS behavior and the legacy namespace bridge in `app/javascript/shared/blueprintLegacyNamespace.js`.
- **Database schema:** Rails uses SQL schema format via `config/application.rb`, so `db/structure.sql` is the schema source rather than `db/schema.rb`.

## Anti-Patterns

### Bypassing Collected Pack Loading

**What happens:** A route view directly emits Shakapacker tags instead of appending pack names through `append_javascript_pack`.
**Why it's wrong:** `app/views/layouts/application.html.erb` centralizes global packs and route packs through `collected_javascript_pack_tag`; bypassing it can duplicate packs, omit matching stylesheet packs, or skip shared defaults.
**Do this instead:** Add the mount point in the route view and call `append_javascript_pack` as shown in `app/views/catalog/home.html.haml:4`, `app/views/cases/show.html.erb:18`, and `app/views/deployments/edit.html.haml:13`.

### Duplicating Blueprint CSS

**What happens:** A route-specific pack imports raw Blueprint package CSS or adds local CSS shims for `pt-*`/`bp4-*` classes.
**Why it's wrong:** Global Blueprint CSS is already loaded in `app/assets/stylesheets/application.css`, while `app/javascript/shared/blueprintLegacyNamespace.js` mirrors legacy class names for JS-rendered DOM without creating another Blueprint CSS copy.
**Do this instead:** Keep Blueprint package CSS in `app/assets/stylesheets/application.css`; add shared compatibility behavior in `app/javascript/packs/styles.js` or `app/javascript/shared/blueprintLegacyNamespace.js` only when route QA proves a shared need.

### Returning Ad Hoc React State

**What happens:** Controllers render custom hashes for case/catalog state outside the serializer contract.
**Why it's wrong:** React reducers and context providers expect normalized keys, `links`, `type`, `table`, and `param` fields from `ApplicationSerializer` and related serializers.
**Do this instead:** Extend the relevant serializer under `app/serializers`, then consume the new field through `app/javascript/redux` or the matching React Context provider.

## Error Handling

**Strategy:** Use Rails conventions at the boundary, service-object transactions for workflow failures, serializer/API error shapes for JavaScript, and narrow rescue paths for expected operational gaps.

**Patterns:**
- Pundit authorization failures redirect HTML users or return `403` JSON in `app/controllers/application_controller.rb`.
- `SearchController#index` returns `[]` for an unpopulated `cases_search_index` while re-raising unrelated database failures in `app/controllers/search_controller.rb`.
- `DeployCaseService` and `CustomizeDeploymentService` wrap multi-record writes in ActiveRecord transactions in `app/services/deploy_case_service.rb` and `app/services/customize_deployment_service.rb`.
- `VerifyLock` returns HTTP `423 Locked` JSON when another reader owns a lock in `app/controllers/concerns/verify_lock.rb`.
- `Orchard` throws `OrchardInputError` for HTTP `422` and `OrchardError` for other failed responses in `app/javascript/shared/orchard.js`.
- `EditBroadcastJob` handles `ActiveJob::DeserializationError` by broadcasting a destroy payload with cached params in `app/jobs/edit_broadcast_job.rb`.

## Cross-Cutting Concerns

**Logging:** Rails logging is primary; `SearchController#index` logs missing search-index state, `config/initializers/lograge.rb` configures request logging, `config/initializers/sentry.rb` enables Sentry logs outside development/test, and `app/services/memory_profile_logger.rb` supports memory diagnostics.

**Validation:** Strong params live in controllers such as `app/controllers/cases_controller.rb` and `app/controllers/deployments_controller.rb`; ActiveRecord validations live on models such as `app/models/case.rb`, `app/models/card.rb`, `app/models/edgenote.rb`, and `app/models/quiz.rb`; deploy input validation lives in `.github/workflows/deploy.yml` and `scripts/deploy-sst.sh`.

**Authentication:** Devise authenticates `Reader` records from `app/models/reader.rb`; OmniAuth/LTI callbacks live under `app/controllers/authentication_strategies`; `ApplicationController` exposes `current_user` as `current_reader || AnonymousUser.new`; Sidekiq Web is mounted only for editor readers in `config/routes.rb:243`.

**Authorization:** Pundit policies in `app/policies` gate controllers, policy scopes, ActionCable subscriptions, and serializer-visible actions. `ApplicationPolicy::Scope` defaults to editor-only data access unless a resource policy expands it.

**Internationalization:** `ApplicationController#set_locale` selects locale from route params, reader preference, or Accept-Language; route locale stripping is defined in `config/routes.rb`; frontend packs load messages from `config/locales`.

**Assets:** Sprockets serves global CSS/images under `app/assets`; Shakapacker builds JS/CSS packs from `app/javascript`; Webpack customization lives in `config/webpack/environment.js`; production static asset delivery is fronted by SST CloudFront resources in `infra/sst.config.ts`.

**Caching:** Rails anonymous catalog JSON caching lives in `app/controllers/concerns/public_catalog_cache.rb`; app CDN catalog cache paths live in `infra/sst.config.ts`; immutable static asset prefixes are set by `.github/workflows/deploy.yml` and `infra/sst.config.ts`.

**Analytics and Stats:** Ahoy setup is in `config/initializers/ahoy.rb`; trackable models use `app/models/concerns/trackable.rb`; stats requests and realtime refresh use `app/controllers/cases/stats_controller.rb`, `app/services/case_stats_service.rb`, `app/channels/stats_channel.rb`, and `app/javascript/controllers/case_stats_controller.js`.

---

*Architecture analysis: 2026-05-30*
