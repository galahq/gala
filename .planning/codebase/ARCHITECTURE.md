# Architecture

**Analysis Date:** 2026-04-22

## Pattern Overview

**Overall:** Layered Rails 7 monolith with server-rendered Rails shells, Webpacker React islands, ActiveRecord domain models, Pundit authorization, Devise authentication, Sidekiq-backed ActiveJob, and Action Cable real-time updates. Runtime entry points are `config.ru`, `config/application.rb`, `Procfile`, `Procfile.dev`, `config/puma.rb`, and `config/sidekiq.yml`.

**Key Characteristics:**
- Keep request routing in `config/routes.rb`, controller orchestration in `app/controllers/`, and persistent domain behavior in `app/models/`.
- Use service objects in `app/services/` for multi-step workflows such as `app/services/deploy_case_service.rb`, `app/services/customize_deployment_service.rb`, and `app/services/case_stats_service.rb`.
- Use serializers in `app/serializers/` to shape JSON payloads for React and API consumers, with shared serializer behavior in `app/serializers/application_serializer.rb` and camelCase output configured in `config/initializers/active_model_serializers.rb`.
- Use decorators in `app/decorators/` for presentation-only model behavior such as `app/decorators/case_decorator.rb`.
- Use Pundit policies in `app/policies/` for access control, with base behavior in `app/policies/application_policy.rb` and case-specific scopes in `app/policies/case_policy.rb`.
- Use React, Redux, Stimulus, Flow, and Webpacker under `app/javascript/`, with Rails mounting points in `app/views/` and packs in `app/javascript/packs/`.
- Use background jobs in `app/jobs/` and real-time channels in `app/channels/`, backed by Redis/Sidekiq configuration in `config/initializers/sidekiq.rb` and `config/cable.yml`.
- Treat `infra/` as a separate SST v4 AWS package, with infrastructure definition in `infra/sst.config.ts`.

## Layers

**Runtime Process Layer:**
- Purpose: Boot the Rails app, web process, Webpacker dev server, Sidekiq worker, and AWS ECS services.
- Location: `config.ru`, `config/application.rb`, `Procfile`, `Procfile.dev`, `Dockerfile`, `infra/sst.config.ts`
- Contains: Rails boot config, middleware, Puma command, Sidekiq command, Webpacker dev command, ECS service/task definitions.
- Depends on: Bundler setup from `Gemfile`, Rails boot from `config/boot.rb`, environment config from `config/environments/`, and SST resources from `infra/sst.config.ts`.
- Used by: Local `docker compose up`, Heroku-style process managers, and SST ECS services defined in `infra/sst.config.ts`.

**Routing Layer:**
- Purpose: Map HTTP routes to Rails controllers, mount Sidekiq UI, and provide React Router fallbacks.
- Location: `config/routes.rb`
- Contains: Resource routes for cases, catalog, deployments, comments, quizzes, readers, admin resources, stats, Sidekiq, and runtime diagnostics.
- Depends on: Controllers in `app/controllers/`, Devise route helpers, and Sidekiq Web.
- Used by: Browser requests, React clients through JSON endpoints, CSV exports, and editor-only operational pages.

**Controller Layer:**
- Purpose: Authenticate readers, authorize access, load records, call services, select response formats, and render Rails/JSON responses.
- Location: `app/controllers/`
- Contains: Resource controllers such as `app/controllers/cases_controller.rb`, namespaced controllers such as `app/controllers/cases/stats_controller.rb`, admin controllers such as `app/controllers/admin/application_controller.rb`, and shared concerns in `app/controllers/concerns/`.
- Depends on: `app/controllers/application_controller.rb`, Devise helpers, Pundit policies, ActiveRecord models, Draper decorators, serializers, and service objects.
- Used by: Routes in `config/routes.rb` and frontend fetch calls from `app/javascript/`.

**Application Controller Layer:**
- Purpose: Apply cross-request behavior including locale selection, current user abstraction, Terms of Service enforcement, Sentry context, LTI validation, and Pundit failures.
- Location: `app/controllers/application_controller.rb`
- Contains: `before_action` callbacks, `current_user` null-object fallback, `default_url_options`, authorization rescue handling, and helpers for downloads.
- Depends on: Devise, Pundit, `AnonymousUser` from `app/models/anonymous_user.rb`, LTI environment variables, and `TranslatedFlashMessages` from `app/controllers/concerns/translated_flash_messages.rb`.
- Used by: All non-Administrate controllers under `app/controllers/`.

**Domain Model Layer:**
- Purpose: Represent domain state, associations, validations, callbacks, attachments, scopes, and domain methods.
- Location: `app/models/`
- Contains: Core models such as `app/models/case.rb`, `app/models/reader.rb`, `app/models/deployment.rb`, `app/models/card.rb`, `app/models/case_element.rb`, `app/models/page.rb`, `app/models/podcast.rb`, and `app/models/edgenote.rb`.
- Depends on: ActiveRecord, ActiveStorage, FriendlyId, Rolify, Devise, Ahoy, concerns in `app/models/concerns/`, and database objects in `db/structure.sql`.
- Used by: Controllers, services, serializers, policies, decorators, jobs, and channels.

**Domain Concern Layer:**
- Purpose: Share model behavior for polymorphic content, locking, licensing, serialization, and tracking.
- Location: `app/models/concerns/`
- Contains: `app/models/concerns/element.rb`, `app/models/concerns/lockable.rb`, `app/models/concerns/trackable.rb`, `app/models/concerns/licensable.rb`, and `app/models/concerns/serializable.rb`.
- Depends on: ActiveSupport::Concern, ActiveRecord associations, Ahoy events, and model methods such as `case`.
- Used by: Content models including `app/models/page.rb`, `app/models/podcast.rb`, `app/models/card.rb`, `app/models/edgenote.rb`, and `app/models/case_element.rb`.

**Service Layer:**
- Purpose: Encapsulate workflows and complex queries that do not belong in controllers.
- Location: `app/services/`
- Contains: `app/services/deploy_case_service.rb`, `app/services/customize_deployment_service.rb`, `app/services/case_stats_service.rb`, `app/services/case_stats_service/query.rb`, `app/services/case_stats_service/formatter.rb`, `app/services/broadcast_edit.rb`, and finder/reporting services.
- Depends on: ActiveRecord transactions, jobs in `app/jobs/`, policies, models, Rails cache, and custom SQL.
- Used by: Controllers such as `app/controllers/deployments_controller.rb`, `app/controllers/cases/stats_controller.rb`, and edit broadcasting concerns.

**Serialization Layer:**
- Purpose: Convert models and service objects into frontend-oriented JSON.
- Location: `app/serializers/`
- Contains: Base serializer `app/serializers/application_serializer.rb`, case serializers under `app/serializers/cases/`, comment serializers under `app/serializers/comment_threads/`, quiz serializers under `app/serializers/quizzes/`, and reader serializers under `app/serializers/readers/`.
- Depends on: ActiveModelSerializers, route helpers, Rails view context, Pundit checks, and serializer key transform configuration in `config/initializers/active_model_serializers.rb`.
- Used by: JSON controller responses, Action Cable broadcast payloads, and Rails views that embed initial React state such as `app/views/cases/show.html.erb`.

**Presentation Decorator Layer:**
- Purpose: Keep view-specific computed values and asset URLs out of models.
- Location: `app/decorators/`
- Contains: Base decorator `app/decorators/application_decorator.rb` and resource decorators such as `app/decorators/case_decorator.rb`, `app/decorators/image_decorator.rb`, and `app/decorators/deployment_decorator.rb`.
- Depends on: Draper, Rails route helpers, ActiveStorage, and environment-derived base URL values.
- Used by: Controllers via `decorate`, views in `app/views/`, and serializers that receive decorated objects.

**Authorization Layer:**
- Purpose: Define resource permissions and scopes.
- Location: `app/policies/`
- Contains: Base policy `app/policies/application_policy.rb`, resource policies such as `app/policies/case_policy.rb`, `app/policies/deployment_policy.rb`, and namespaced policies under `app/policies/cases/`.
- Depends on: Pundit, role checks from Rolify on `app/models/reader.rb`, associations such as reader enrollments and libraries.
- Used by: Controllers through `authorize` and `policy_scope`, channels such as `app/channels/edits_channel.rb`, and serializers such as `app/serializers/cases/show_serializer.rb`.

**Background Job Layer:**
- Purpose: Run asynchronous work through ActiveJob and Sidekiq.
- Location: `app/jobs/`
- Contains: Base retry/discard behavior in `app/jobs/application_job.rb`, clone jobs in `app/jobs/case_clone_job.rb`, broadcast jobs in `app/jobs/edit_broadcast_job.rb`, index refresh in `app/jobs/refresh_indices_job.rb`, and notification/report jobs.
- Depends on: Sidekiq adapter/configuration, Redis from `config/initializers/sidekiq.rb`, ActiveRecord models, serializers, channels, and database materialized views.
- Used by: Models such as `app/models/case.rb`, services such as `app/services/broadcast_edit.rb`, controllers, and scheduled SST tasks in `infra/sst.config.ts`.

**Real-Time Layer:**
- Purpose: Support authenticated WebSocket subscriptions for collaborative editing, forums, reader notifications, and stats invalidation.
- Location: `app/channels/`
- Contains: Cable authentication in `app/channels/application_cable/connection.rb`, edit stream in `app/channels/edits_channel.rb`, stats stream in `app/channels/stats_channel.rb`, forum stream in `app/channels/forum_channel.rb`, and reader notification stream in `app/channels/reader_notifications_channel.rb`.
- Depends on: Devise/Warden current reader, Pundit policies, Action Cable, Redis cable adapter, and frontend `window.App.cable` usage.
- Used by: React case app in `app/javascript/Case.jsx`, Stimulus stats controller in `app/javascript/controllers/case_stats_controller.js`, and broadcast jobs in `app/jobs/`.

**Rails View Layer:**
- Purpose: Render layouts, server-side pages, mount React apps, and provide fallback/no-JavaScript content.
- Location: `app/views/`
- Contains: Layouts in `app/views/layouts/`, case mounting page `app/views/cases/show.html.erb`, catalog mounting page `app/views/catalog/home.html.haml`, stats page `app/views/cases/stats/show.html.erb`, and partials for forms, mailers, admin, and resources.
- Depends on: Controllers, decorators, serializers, Rails helpers, Webpacker pack tags, Sprockets assets, and I18n.
- Used by: Browser HTML responses from controllers.

**Frontend Layer:**
- Purpose: Provide React apps, Stimulus controllers, Redux state, Flow types, Webpacker packs, and UI modules.
- Location: `app/javascript/`
- Contains: Entrypoints in `app/javascript/packs/`, case app root `app/javascript/Case.jsx`, catalog app `app/javascript/catalog/index.jsx`, deployment app `app/javascript/deployment/index.jsx`, stats app `app/javascript/stats/StatsPage.jsx`, Stimulus controllers in `app/javascript/controllers/`, Redux actions/reducers in `app/javascript/redux/`, and shared utilities in `app/javascript/shared/` and `app/javascript/utility/`.
- Depends on: Webpacker config in `config/webpacker.yml` and `config/webpack/environment.js`, Flow config in `.flowconfig`, Jest config in `jest.config.js`, Rails-generated globals from `app/views/layouts/application.html.erb`, and JSON endpoints in `config/routes.rb`.
- Used by: Rails views through `javascript_pack_tag`, `stylesheet_pack_tag`, and Stimulus `data-controller` attributes.

**Data Persistence Layer:**
- Purpose: Store relational domain data, attachments, visits/events, materialized search index, and schema-managed database objects.
- Location: `db/structure.sql`, `db/migrate/`, `config/database.yml`, `config/storage.yml`
- Contains: PostgreSQL tables for cases, readers, deployments, comments, Ahoy events, ActiveStorage, roles, reading lists, and `cases_search_index` materialized view.
- Depends on: Rails migrations, SQL schema format from `config/application.rb`, ActiveRecord models in `app/models/`, and rake tasks in `lib/tasks/indices.rake`.
- Used by: ActiveRecord queries, `RefreshIndicesJob` in `app/jobs/refresh_indices_job.rb`, search controllers, stats services, and application views.

**Admin Layer:**
- Purpose: Provide editor-only operational CRUD/read surfaces using Administrate.
- Location: `app/controllers/admin/`, `app/dashboards/`, `app/views/admin/`
- Contains: Base admin authorization in `app/controllers/admin/application_controller.rb`, dashboards such as `app/dashboards/case_dashboard.rb`, and admin views under `app/views/admin/`.
- Depends on: Administrate, Devise current reader, Rolify editor role, and dashboard field definitions.
- Used by: Admin routes under `namespace :admin` in `config/routes.rb`.

**Infrastructure Layer:**
- Purpose: Define AWS production/staging infrastructure apart from the Rails app package.
- Location: `infra/`
- Contains: SST app in `infra/sst.config.ts`, Node package files in `infra/package.json` and `infra/package-lock.json`, and TypeScript config in `infra/tsconfig.json`.
- Depends on: SST v4, AWS ECS/Fargate, RDS PostgreSQL, Valkey/Redis, S3, IAM, Secrets Manager-style SST secrets, and GitHub workflow deploy commands.
- Used by: Deployment automation and AWS runtime resources.

## Data Flow

**Case Read Flow:**

1. `config/routes.rb` routes `/cases/:slug` to `app/controllers/cases_controller.rb#show`, with a React Router fallback for nested case paths.
2. `app/controllers/cases_controller.rb` loads a friendly-id case with eager-loaded cards, podcasts, edgenotes, and pages, then authorizes it through `app/policies/case_policy.rb`.
3. HTML requests render `app/views/cases/show.html.erb` inside `app/views/layouts/with_header.html.erb`; JSON requests render `app/serializers/cases/show_serializer.rb`.
4. `app/views/cases/show.html.erb` embeds serialized case data into `window.caseData` and mounts `app/javascript/packs/case.entry.jsx`.
5. `app/javascript/packs/case.entry.jsx` creates the Redux store from `app/javascript/redux/reducers/`, loads locale messages from `config/locales/index.js`, and renders `app/javascript/Case.jsx`.
6. `app/javascript/Case.jsx` uses React Router to show overview, content element, quiz, conversation, and suggested quiz routes without returning to Rails for each nested route.

**State Management:**
- Server state for a case starts from `window.caseData` in `app/views/cases/show.html.erb`, then React/Redux state is managed by `app/javascript/redux/reducers/` and updated by actions in `app/javascript/redux/actions/`.

**Catalog Flow:**

1. `config/routes.rb` routes `/` and catalog fallbacks to `app/controllers/catalog_controller.rb#home`.
2. `app/controllers/catalog_controller.rb` uses `policy_scope(Case)` from `app/policies/case_policy.rb` and renders `app/views/catalog/home.html.haml`.
3. `app/views/catalog/home.html.haml` preloads JSON endpoints and mounts `app/javascript/packs/catalog.entry.jsx` into `#catalog-app`.
4. `app/javascript/catalog/index.jsx` wraps routes with catalog/reader data providers from `app/javascript/catalog/catalogData.js` and `app/javascript/catalog/readerData.js`.
5. Catalog data is fetched from Rails JSON endpoints such as `cases_path(format: :json)`, `profile_path(format: :json)`, and `catalog_libraries_path(format: :json)`.

**State Management:**
- Catalog state uses React context providers in `app/javascript/catalog/catalogData.js`, `app/javascript/catalog/readerData.js`, and `app/javascript/deployment/contentItemSelectionContext.jsx`.

**Case Edit And Broadcast Flow:**

1. A mutating controller such as `app/controllers/cases_controller.rb` includes `BroadcastEdits` from `app/controllers/concerns/broadcast_edits.rb`.
2. On successful create/update/destroy, `BroadcastEdits` calls `BroadcastEdit.to` in `app/services/broadcast_edit.rb`.
3. `app/services/broadcast_edit.rb` queues `app/jobs/edit_broadcast_job.rb` with the edited resource, case slug, cached params, action type, and session id.
4. `app/jobs/edit_broadcast_job.rb` serializes the resource with `ActiveModel::Serializer.for` and broadcasts to `app/channels/edits_channel.rb`.
5. `app/javascript/Case.jsx` subscribes to the edits channel through Redux action helpers from `app/javascript/redux/actions/`.

**State Management:**
- Edit state is client-side Redux state in `app/javascript/redux/reducers/`, with persistence through Rails JSON update endpoints and live reconciliation through Action Cable.

**Stats Dashboard Flow:**

1. `config/routes.rb` routes `/cases/:case_slug/stats` and `/cases/:case_slug/stats/overview` to `app/controllers/cases/stats_controller.rb`.
2. `app/controllers/cases/stats_controller.rb` authorizes `stats?` through `app/policies/case_policy.rb`, renders cached overview HTML, and returns JSON/CSV through `app/services/case_stats_service.rb`.
3. `app/services/case_stats_service.rb` resolves date ranges, caches results, delegates SQL execution to `app/services/case_stats_service/query.rb`, and normalizes output with `app/services/case_stats_service/formatter.rb`.
4. `app/views/cases/stats/show.html.erb` mounts `app/javascript/controllers/case_stats_controller.js` using `data-controller="case-stats"`.
5. `app/javascript/controllers/case_stats_controller.js` renders `app/javascript/stats/StatsPage.jsx`, subscribes to `app/channels/stats_channel.rb`, and refreshes the overview partial when stats are updated.
6. `app/javascript/stats/http/statsHttp.js` fetches JSON via `shared/orchard`, normalizes payloads, and keeps a small in-memory LRU cache.

**State Management:**
- Stats page state uses `useReducer` in `app/javascript/stats/state/statsStore.js`; Rails cache stores backend country stats in `app/services/case_stats_service.rb`.

**Deployment Creation Flow:**

1. `config/routes.rb` routes deployment pages to `app/controllers/deployments_controller.rb`.
2. `app/controllers/deployments_controller.rb#create` initializes `app/services/deploy_case_service.rb` with permitted params and `current_reader`.
3. `app/services/deploy_case_service.rb` runs an ActiveRecord transaction to save a `Deployment`, create/build a `Group`, add the reader as group administrator, invite the reader to CaseLog, and upsert instructor enrollment.
4. `app/controllers/deployments_controller.rb#edit` mounts the deployment customizer through `app/javascript/packs/deployment.entry.jsx`.
5. `app/controllers/deployments_controller.rb#update` delegates quiz/customization changes to `app/services/customize_deployment_service.rb`.

**State Management:**
- Deployment persistence is ActiveRecord state in `app/models/deployment.rb`, `app/models/group.rb`, and `app/models/enrollment.rb`; frontend form state lives in `app/javascript/deployment/`.

**Case Clone And Translation Flow:**

1. `config/routes.rb` maps `/cases/:slug/copy` to `app/controllers/cases_controller.rb#copy`.
2. `app/controllers/cases_controller.rb#copy` enqueues `app/jobs/case_clone_job.rb`.
3. `app/jobs/case_clone_job.rb` wraps cloning in an ActiveRecord transaction and calls `app/cloners/case_cloner.rb`.
4. `app/cloners/case_cloner.rb` clones editorships, attachments, locale metadata, and each `CaseElement` by dispatching to element-specific cloners in `app/cloners/`.
5. `app/cloners/card_cloner.rb` clones Draft.js content through `app/cloners/content_state_cloner.rb`.

**State Management:**
- Clone state is persisted as new ActiveRecord records under `app/models/` and is intentionally asynchronous through `app/jobs/case_clone_job.rb`.

## Key Abstractions

**Case Aggregate:**
- Purpose: Represent a published or editable case study with metadata, translation grouping, content elements, editors, library membership, deployments, forums, comments, search indexing, and attachments.
- Examples: `app/models/case.rb`, `app/controllers/cases_controller.rb`, `app/serializers/cases/show_serializer.rb`, `app/decorators/case_decorator.rb`
- Pattern: ActiveRecord aggregate root with FriendlyId slugging, ActiveStorage attachments, callbacks, scopes, and policy-controlled access.

**Content Element Model:**
- Purpose: Model the ordered table of contents and polymorphic case content.
- Examples: `app/models/case_element.rb`, `app/models/concerns/element.rb`, `app/models/page.rb`, `app/models/podcast.rb`, `app/models/card.rb`, `app/models/edgenote.rb`
- Pattern: `CaseElement` is the ordered polymorphic join; `Page` and `Podcast` include `Element`; `Card` belongs to a polymorphic element; `Edgenote` attaches to a case and is referenced from Draft.js content.

**Reader/User Model:**
- Purpose: Represent authenticated readers, roles, personas, enrollments, comments, deployments, libraries, and invitations.
- Examples: `app/models/reader.rb`, `app/models/anonymous_user.rb`, `app/controllers/application_controller.rb`
- Pattern: Devise-authenticated ActiveRecord model with Rolify roles, `AnonymousUser` null object, and domain helper methods for enrollments and permissions.

**Deployment Model:**
- Purpose: Connect a case to an instructional group and optional quiz customization.
- Examples: `app/models/deployment.rb`, `app/controllers/deployments_controller.rb`, `app/services/deploy_case_service.rb`
- Pattern: ActiveRecord join/domain model with nested group attributes, uniqueness constraints, and service-driven setup flow.

**Policy Scope:**
- Purpose: Centralize user-specific query visibility and write permissions.
- Examples: `app/policies/application_policy.rb`, `app/policies/case_policy.rb`, `app/policies/deployment_policy.rb`
- Pattern: Pundit policy classes with nested `Scope` and custom `AdminScope` classes; controllers call `authorize` and `policy_scope`.

**Serializer Resource:**
- Purpose: Produce normalized JSON payloads with links, type/table/param metadata, and view-context-aware fields.
- Examples: `app/serializers/application_serializer.rb`, `app/serializers/cases/show_serializer.rb`, `app/serializers/cases/stats_serializer.rb`
- Pattern: ActiveModelSerializers with camelCase key transformation from `config/initializers/active_model_serializers.rb`.

**Decorator Resource:**
- Purpose: Provide view URLs, display strings, and presentation helpers without adding presentation responsibilities to models.
- Examples: `app/decorators/application_decorator.rb`, `app/decorators/case_decorator.rb`, `app/decorators/image_decorator.rb`
- Pattern: Draper decorators with `delegate_all`, route helpers, and per-resource computed methods.

**Service Object:**
- Purpose: Isolate multi-step orchestration, transactional workflows, custom SQL, and external-ish operations.
- Examples: `app/services/deploy_case_service.rb`, `app/services/case_stats_service.rb`, `app/services/broadcast_edit.rb`, `app/services/wikidata.rb`
- Pattern: Plain Ruby objects initialized with domain inputs and called from controllers, concerns, or jobs.

**Cloner:**
- Purpose: Copy cases, content, and nested records for translation/copy workflows.
- Examples: `app/cloners/case_cloner.rb`, `app/cloners/card_cloner.rb`, `app/jobs/case_clone_job.rb`, `config/initializers/clowne.rb`
- Pattern: Clowne cloners plus an ActiveJob wrapper and ActiveRecord transactions.

**Trackable Concern:**
- Purpose: Provide view/unique/average-time stats based on Ahoy events.
- Examples: `app/models/concerns/trackable.rb`, `app/models/case_element.rb`, `app/models/card.rb`, `app/models/podcast.rb`, `app/models/edgenote.rb`
- Pattern: Models override `event_name` and `event_properties`; the concern queries `Ahoy::Event.interesting`.

**Lockable Concern:**
- Purpose: Prevent conflicting edits by associating lockable resources with a single editor lock.
- Examples: `app/models/concerns/lockable.rb`, `app/controllers/concerns/verify_lock.rb`, `app/models/lock.rb`
- Pattern: ActiveRecord concern plus controller guard that returns HTTP 423 locked when another reader holds the lock.

**Materialized Search Index:**
- Purpose: Provide full-text case search using a PostgreSQL materialized view.
- Examples: `db/structure.sql`, `app/jobs/refresh_indices_job.rb`, `lib/tasks/indices.rake`
- Pattern: SQL materialized view `cases_search_index` refreshed by `RefreshIndicesJob` and `rake indices:refresh`.

## Entry Points

**Rails Boot:**
- Location: `config.ru`, `config/application.rb`, `config/environment.rb`
- Triggers: Rack/Puma web process from `Procfile`, `Procfile.dev`, `infra/sst.config.ts`, or local Docker process.
- Responsibilities: Load Rails, Bundler groups, app defaults, middleware, SQL schema format, environment flags, and Rack compression.

**Web Process:**
- Location: `Procfile`, `config/puma.rb`, `infra/sst.config.ts`
- Triggers: `bundle exec puma -C config/puma.rb` from process manager or SST service command.
- Responsibilities: Serve Rails HTML, JSON, CSV, Action Cable, and static asset responses.

**Worker Process:**
- Location: `Procfile`, `config/sidekiq.yml`, `app/jobs/application_job.rb`, `infra/sst.config.ts`
- Triggers: `bundle exec sidekiq -C config/sidekiq.yml` from process manager or SST service command.
- Responsibilities: Execute ActiveJob workloads, broadcasts, clone jobs, report jobs, and index refresh jobs.

**Webpack Dev Server:**
- Location: `Procfile.dev`, `bin/webpack-dev-server`, `config/webpacker.yml`
- Triggers: Local development process.
- Responsibilities: Serve Webpacker packs from `app/javascript/packs/` during development.

**Rails Routes:**
- Location: `config/routes.rb`
- Triggers: HTTP requests.
- Responsibilities: Dispatch to resource controllers, mount admin resources, expose React fallback routes, mount Sidekiq UI for editors, and expose runtime stats.

**Case React App:**
- Location: `app/views/cases/show.html.erb`, `app/javascript/packs/case.entry.jsx`, `app/javascript/Case.jsx`
- Triggers: Case show HTML response.
- Responsibilities: Hydrate the case data payload, initialize Redux, route case subpages, subscribe to Action Cable, and render case reading/editing UI.

**Catalog React App:**
- Location: `app/views/catalog/home.html.haml`, `app/javascript/packs/catalog.entry.jsx`, `app/javascript/catalog/index.jsx`
- Triggers: Catalog/root HTML response.
- Responsibilities: Render catalog home/search routes, fetch catalog/reader/libraries data, and coordinate content item selection context.

**Deployment React App:**
- Location: `app/javascript/packs/deployment.entry.jsx`, `app/javascript/deployment/index.jsx`, `app/views/deployments/`
- Triggers: Deployment edit/customization views.
- Responsibilities: Render deployment quiz/content customization and submit updates to `app/controllers/deployments_controller.rb`.

**Stimulus Controllers:**
- Location: `app/javascript/packs/controllers.js`, `app/javascript/controllers/`
- Triggers: Rails views with `data-controller` attributes.
- Responsibilities: Mount small client behaviors and React islands such as stats via `app/javascript/controllers/case_stats_controller.js`.

**Action Cable:**
- Location: `app/channels/application_cable/connection.rb`, `app/channels/`
- Triggers: WebSocket connections from authenticated readers.
- Responsibilities: Authenticate readers with Warden, authorize streams with Pundit, and broadcast live updates.

**Admin Dashboard:**
- Location: `app/controllers/admin/application_controller.rb`, `app/dashboards/`, `app/views/admin/`
- Triggers: `/admin` routes from `config/routes.rb`.
- Responsibilities: Provide editor-only Administrate views for operational data inspection and constrained CRUD.

**Runtime Diagnostics:**
- Location: `app/controllers/runtime_controller.rb`, `config/routes.rb`
- Triggers: `/runtime/stats` JSON route.
- Responsibilities: Return editor-only process, GC, heap, cache, Redis, PostgreSQL, Sidekiq, and Action Cable diagnostics.

**Infrastructure Deployment:**
- Location: `infra/sst.config.ts`
- Triggers: SST deploy/remove/install commands.
- Responsibilities: Create AWS VPC, ECS cluster, Rails web/worker services, PostgreSQL, Redis-compatible cache, migration/index/report tasks, schedules, load balancer, and media bucket IAM policies.

## Error Handling

**Strategy:** Controllers use Rails response status handling, Pundit rescue paths, model validation errors, service result checks, ActiveJob retry policies, frontend error boundaries, and explicit fetch failure states.

**Patterns:**
- Authorization failures from Pundit are rescued in `app/controllers/application_controller.rb` and return `/403`, sign-in redirect, or JSON `:forbidden`.
- Controller validation failures return unprocessable entity JSON in controllers such as `app/controllers/cases_controller.rb` and render forms in controllers such as `app/controllers/deployments_controller.rb`.
- Lock conflicts are handled by `app/controllers/concerns/verify_lock.rb` with HTTP `:locked`.
- Background job retries and discards are centralized in `app/jobs/application_job.rb` for timeouts, Redis connection errors, deadlocks, standard errors, and deserialization failures.
- Broadcast deserialization fallbacks are handled in `app/jobs/edit_broadcast_job.rb` by broadcasting cached params as destroy payloads.
- Stats backend date parsing tolerates invalid dates in `app/services/case_stats_service.rb` by falling back to case creation date or current date.
- Stats frontend fetch errors are shown by `app/javascript/stats/StatsPage.jsx` and `app/javascript/stats/StatsError.jsx`.
- React mount/render failures are contained by `app/javascript/utility/ErrorBoundary` and used in `app/javascript/packs/case.entry.jsx`, `app/javascript/packs/catalog.entry.jsx`, and `app/javascript/controllers/case_stats_controller.js`.

## Cross-Cutting Concerns

**Logging:** Rails logging is used in `app/controllers/application_controller.rb`, `app/jobs/application_job.rb`, and `app/javascript/stats/StatsPage.jsx`; structured request logging is configured by `config/initializers/lograge.rb`.

**Validation:** ActiveRecord validations live in models such as `app/models/case.rb`, `app/models/reader.rb`, `app/models/deployment.rb`, and `app/models/edgenote.rb`; controller params use strong parameters in controllers and functional parameter filters in `lib/sieve.rb`.

**Authentication:** Reader authentication uses Devise in `app/models/reader.rb`, route configuration in `config/routes.rb`, callbacks in `app/controllers/application_controller.rb`, and Action Cable Warden lookup in `app/channels/application_cable/connection.rb`.

**Authorization:** Pundit policies in `app/policies/` gate controller actions, Action Cable subscriptions, admin scopes, and serializer-derived capability flags.

**Internationalization:** Locale selection is handled in `app/controllers/application_controller.rb`, locale data lives in `config/locales/`, frontend messages load through `config/locales/index.js`, and Mobility is configured in `config/initializers/mobility.rb`.

**Serialization:** JSON request keys are transformed from camelCase to snake_case in `config/initializers/json_param_key_transform.rb`, and JSON response keys are transformed to camelCase in `config/initializers/active_model_serializers.rb`.

**Caching:** Rails cache is used by stats service and stats overview rendering in `app/services/case_stats_service.rb` and `app/controllers/cases/stats_controller.rb`; frontend stats payloads use an in-memory LRU cache in `app/javascript/stats/http/statsHttp.js`.

**Search Indexing:** Case search depends on `cases_search_index` in `db/structure.sql`, refresh job `app/jobs/refresh_indices_job.rb`, and rake task `lib/tasks/indices.rake`.

**Assets:** Rails layouts combine Webpacker packs from `app/javascript/packs/`, Sprockets assets from `app/assets/`, and Webpacker loader configuration from `config/webpack/environment.js`.

**Background Work:** Asynchronous execution uses ActiveJob subclasses in `app/jobs/`, Sidekiq Redis configuration in `config/initializers/sidekiq.rb`, process definitions in `Procfile`, and ECS worker services in `infra/sst.config.ts`.

---

*Architecture analysis: 2026-04-22*
