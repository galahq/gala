# Architecture

**Analysis Date:** 2026-04-22

## Pattern Overview

**Overall:** Rails 7 monolith with server-rendered layouts, Webpacker React applications, Stimulus controllers, ActiveRecord domain models, Pundit authorization, Sidekiq background work, and ActionCable realtime updates.

**Key Characteristics:**
- Keep the Rails app as the system boundary: `config.ru`, `config/routes.rb`, `app/controllers/application_controller.rb`, and `app/models/application_record.rb` define the primary request lifecycle.
- Use conventional Rails MVC directories plus domain-specific app directories: `app/services`, `app/policies`, `app/serializers`, `app/forms`, `app/cloners`, `app/decorators`, `app/dashboards`, and `app/validators`.
- Mount React from Rails views through Webpacker packs in `app/javascript/packs`, while Sprockets still loads global Rails UJS, Ahoy, and cable scripts from `app/assets/javascripts/application.js`.
- Treat `infra/` as a separate SST v4 AWS package, not part of the Rails runtime code path; deploy resources are declared in `infra/sst.config.ts`.

## Layers

**Runtime Process Layer:**
- Purpose: Start web, worker, and development processes.
- Location: `Procfile`, `Procfile.dev`, `config.ru`, `config/puma.rb`, `config/sidekiq.yml`
- Contains: Puma startup, Sidekiq queue config, Rack app boot, local webpack dev server process definitions.
- Depends on: `config/environment.rb`, `config/application.rb`, Bundler, Rails, Sidekiq.
- Used by: Local Docker/dev processes, Heroku-style runtime, and SST ECS services in `infra/sst.config.ts`.

**Routing Layer:**
- Purpose: Map HTTP routes to Rails controllers and mount Sidekiq UI.
- Location: `config/routes.rb`
- Contains: RESTful resources, nested case routes, admin namespace, Devise routes, LTI content item routes, React Router catch-all routes, `Sidekiq::Web` mount.
- Depends on: Rails router, Devise authentication helpers, `Sidekiq::Web`.
- Used by: Controllers under `app/controllers`, React Router fallback routes for cases and catalog.

**Controller Layer:**
- Purpose: Authenticate, authorize, load records, choose HTML/JSON/CSV responses, and coordinate domain operations.
- Location: `app/controllers`
- Contains: Resource controllers such as `app/controllers/cases_controller.rb`, namespaced controllers such as `app/controllers/cases/stats_controller.rb`, admin controllers in `app/controllers/admin`, and reusable concerns in `app/controllers/concerns`.
- Depends on: ActiveRecord models in `app/models`, Pundit policies in `app/policies`, serializers in `app/serializers`, services in `app/services`, decorators in `app/decorators`.
- Used by: Routes in `config/routes.rb`, Rails views in `app/views`, frontend clients via JSON endpoints.

**View And Layout Layer:**
- Purpose: Render server HTML shells, ERB/Haml templates, layouts, partials, and inline JSON boot data for React.
- Location: `app/views`, `app/helpers`, `app/assets`
- Contains: Layouts such as `app/views/layouts/application.html.erb` and `app/views/layouts/with_header.html.erb`, React mount shells such as `app/views/cases/show.html.erb`, Haml pages such as `app/views/catalog/home.html.haml`, and styles/images under `app/assets`.
- Depends on: Controllers, helpers, serializers, Webpacker helpers, Sprockets.
- Used by: Browser HTML requests and Webpacker entrypoints.

**Frontend Application Layer:**
- Purpose: Provide React, Redux, React Router, Stimulus, and browser-side API behavior.
- Location: `app/javascript`
- Contains: Webpacker packs in `app/javascript/packs`, feature modules such as `app/javascript/catalog`, `app/javascript/stats`, `app/javascript/conversation`, `app/javascript/overview`, shared utilities in `app/javascript/shared` and `app/javascript/utility`, Redux state in `app/javascript/redux`, and Stimulus controllers in `app/javascript/controllers`.
- Depends on: Webpacker config in `config/webpacker.yml` and `config/webpack/environment.js`, boot data from Rails views, JSON endpoints under `config/routes.rb`.
- Used by: Rails layouts and view templates through `javascript_pack_tag`.

**Domain Model Layer:**
- Purpose: Represent database-backed domain state, associations, validations, callbacks, and persistence behavior.
- Location: `app/models`, `app/models/concerns`
- Contains: Core models such as `app/models/case.rb`, `app/models/reader.rb`, `app/models/deployment.rb`, `app/models/comment_thread.rb`, `app/models/comment.rb`, value/non-AR objects such as `app/models/content_state.rb`, and mixins such as `app/models/concerns/lockable.rb`.
- Depends on: ActiveRecord, ActiveStorage, FriendlyId, Mobility, Rolify, Ahoy, model concerns, jobs.
- Used by: Controllers, policies, serializers, services, jobs, mailers, channels.

**Authorization Layer:**
- Purpose: Centralize access rules and query scoping.
- Location: `app/policies`
- Contains: Base policy `app/policies/application_policy.rb`, resource policies such as `app/policies/case_policy.rb`, nested policies such as `app/policies/cases/feature_policy.rb`.
- Depends on: Pundit, role checks on `Reader`, model scopes.
- Used by: `ApplicationController`, controllers, ActionCable channels, mailboxes, serializers that expose capability flags.

**Serialization/API Layer:**
- Purpose: Shape Rails objects into camelCase JSON payloads and links for frontend consumers.
- Location: `app/serializers`, `config/initializers/active_model_serializers.rb`
- Contains: Base serializer `app/serializers/application_serializer.rb`, case payload serializers such as `app/serializers/cases/show_serializer.rb`, stats serializer `app/serializers/cases/stats_serializer.rb`, and feature-specific serializers.
- Depends on: ActiveModelSerializers, Rails route helpers, `view_context`, Pundit where capability data is included.
- Used by: JSON responses in controllers and boot payloads embedded in views.

**Service And Operation Layer:**
- Purpose: Encapsulate multi-step domain workflows, external lookups, and complex query/formatting work outside controllers.
- Location: `app/services`
- Contains: `app/services/deploy_case_service.rb`, `app/services/customize_deployment_service.rb`, `app/services/case_stats_service.rb`, `app/services/case_stats_service/query.rb`, `app/services/case_stats_service/formatter.rb`, `app/services/linker_service.rb`, `app/services/broadcast_edit.rb`.
- Depends on: ActiveRecord, Rails cache, service-specific models, Pundit-adjacent caller authorization.
- Used by: Controllers, jobs, callbacks, and frontend-facing workflows.

**Async Jobs Layer:**
- Purpose: Run background work through ActiveJob on Sidekiq.
- Location: `app/jobs`, `config/sidekiq.yml`
- Contains: `app/jobs/application_job.rb`, clone/archive/broadcast jobs such as `app/jobs/case_clone_job.rb`, `app/jobs/case_archive_refresh_job.rb`, `app/jobs/comment_broadcast_job.rb`, and index refresh job `app/jobs/refresh_indices_job.rb`.
- Depends on: ActiveJob, Sidekiq, ActiveRecord, services/cloners.
- Used by: Model callbacks, controllers, mailers, and background queue workers.

**Realtime Layer:**
- Purpose: Push edits, comments, notifications, and stats updates to authenticated readers.
- Location: `app/channels`, `app/assets/javascripts/channels`, `app/javascript/redux/actions`, `app/javascript/controllers/case_stats_controller.js`
- Contains: `app/channels/application_cable/connection.rb`, `app/channels/edits_channel.rb`, `app/channels/forum_channel.rb`, `app/channels/reader_notifications_channel.rb`, `app/channels/stats_channel.rb`.
- Depends on: ActionCable, Devise/Warden current reader, Pundit, broadcast jobs/services.
- Used by: React case editor, conversation UI, stats Stimulus controller.

**Email And Mailbox Layer:**
- Purpose: Send notifications and process inbound reply emails.
- Location: `app/mailers`, `app/mailboxes`, `app/views/*_mailer`
- Contains: `app/mailers/reply_notification_mailer.rb`, `app/mailboxes/replies_mailbox.rb`, mailer templates and previews.
- Depends on: ActionMailer, ActionMailbox, `ReplyNotification`, `CommentThread`, Pundit.
- Used by: Notification jobs and inbound email processing.

**Admin Layer:**
- Purpose: Provide Administrate-backed admin screens for editors.
- Location: `app/controllers/admin`, `app/dashboards`, `app/views/admin`, `app/fields`
- Contains: `app/controllers/admin/application_controller.rb`, dashboards such as `app/dashboards/case_dashboard.rb`, custom fields such as `app/fields/percent_field.rb`.
- Depends on: Administrate, Devise, role checks on `Reader`.
- Used by: Routes under the `admin` namespace in `config/routes.rb`.

**Infrastructure Layer:**
- Purpose: Define AWS deployment resources separately from the Rails app code.
- Location: `infra`
- Contains: SST config `infra/sst.config.ts`, Node package metadata `infra/package.json`, lockfile `infra/package-lock.json`, TypeScript config `infra/tsconfig.json`.
- Depends on: SST v4, AWS provider, Rails Docker image from the repository root.
- Used by: Deploy workflow and ECS services for web, worker, migration, index refresh, and weekly report tasks.

## Data Flow

**Case Show And Editor Flow:**

1. `config/routes.rb` routes `GET /cases/:slug` to `app/controllers/cases_controller.rb#show` and also routes nested React Router paths back to `cases#show`.
2. `CasesController#set_case` loads a decorated `Case` with eager loading defined by `CASE_EAGER_LOADING_CONFIG` in `app/controllers/cases_controller.rb`.
3. `CasesController#show` authenticates unpublished cases, authorizes with `app/policies/case_policy.rb`, computes enrollment/deployment context, and renders `app/views/cases/show.html.erb`.
4. `app/views/cases/show.html.erb` embeds `window.caseData` from `app/serializers/cases/show_serializer.rb` and mounts `app/javascript/packs/case.entry.jsx`.
5. `app/javascript/Case.jsx` initializes React Router routes, Redux subscriptions, comment/forum loading, edit mode, and ActionCable subscriptions.
6. Frontend mutations use `Orchard` in `app/javascript/shared/orchard.js` to send JSON requests to Rails endpoints.
7. Controllers with `BroadcastEdits` from `app/controllers/concerns/broadcast_edits.rb` call `app/services/broadcast_edit.rb` after successful create/update/destroy responses.
8. `app/channels/edits_channel.rb` streams authorized edit messages back to connected case readers.

**Catalog Flow:**

1. `config/routes.rb` maps `root` to `app/controllers/catalog_controller.rb#home`.
2. `CatalogController#home` loads `policy_scope(Case).ordered` and renders `app/views/catalog/home.html.haml` with layout `app/views/layouts/with_header.html.erb`.
3. `app/views/catalog/home.html.haml` mounts `#catalog-app`, preloads JSON endpoints, and loads `app/javascript/packs/catalog.entry.jsx`.
4. `app/javascript/catalog/index.jsx` uses React Router, catalog data context, reader data context, and content item selection context to render home and search results.
5. JSON endpoints such as `cases#index`, `tags#index`, `catalog/libraries#index`, and `enrollments#index` provide serialized data through controllers and serializers.

**Stats Dashboard Flow:**

1. `config/routes.rb` maps `GET /cases/:case_slug/stats` and `GET /cases/:case_slug/stats/overview` to `app/controllers/cases/stats_controller.rb`.
2. `Cases::StatsController#set_case` loads the case, decorates it, and authorizes `stats?` with Pundit.
3. `Cases::StatsController#show` serves HTML, JSON, and CSV; JSON uses `app/serializers/cases/stats_serializer.rb`.
4. `app/services/case_stats_service.rb` normalizes dates, caches country stats, delegates SQL to `app/services/case_stats_service/query.rb`, and delegates output formatting to `app/services/case_stats_service/formatter.rb`.
5. A Stimulus controller in `app/javascript/controllers/case_stats_controller.js` mounts `app/javascript/stats/StatsPage.jsx` and subscribes to `StatsChannel`.
6. `StatsPage` fetches filtered JSON data with `app/javascript/stats/http/statsHttp.js`, manages reducer state in `app/javascript/stats/state/statsStore.js`, and renders map/table components under `app/javascript/stats`.

**Deployment And LTI Selection Flow:**

1. `config/routes.rb` maps LTI content item POSTs to `app/controllers/catalog/content_items_controller.rb#create`.
2. `Catalog::ContentItemsController#create` validates LTI, signs in a linked reader when present, runs `app/services/linker_service.rb`, stores selection params, and redirects to the catalog.
3. `app/controllers/deployments_controller.rb#create` uses `app/services/deploy_case_service.rb` to create a deployment, group, administrator membership, invitation, and instructor enrollment inside a transaction.
4. `app/controllers/deployments_controller.rb#edit` renders an embedded or admin layout and mounts `app/javascript/packs/deployment.entry.jsx`.
5. `app/services/customize_deployment_service.rb` handles quiz/deployment customization from the React deployment UI.

**Search Index Refresh Flow:**

1. `app/models/case.rb` calls `RefreshIndicesJob.perform_later` after metadata changes that affect search.
2. `app/jobs/refresh_indices_job.rb` runs `REFRESH MATERIALIZED VIEW cases_search_index`.
3. `lib/tasks/indices.rake` exposes `bundle exec rake indices:refresh` for manual or scheduled refreshes.
4. `infra/sst.config.ts` declares `GalaRefreshIndices` and, in production, schedules `GalaRefreshIndicesSchedule`.

**State Management:**
- Server request state lives in Rails sessions, Devise `current_reader`, controller instance variables, and ActiveRecord transactions in files such as `app/controllers/application_controller.rb` and `app/services/deploy_case_service.rb`.
- Persistent domain state lives in PostgreSQL tables defined by `db/structure.sql` and models under `app/models`.
- Case editor state uses Redux reducers/actions under `app/javascript/redux`, with boot data from `window.caseData` in `app/views/cases/show.html.erb`.
- Catalog and deployment screens use React context and component-local state under `app/javascript/catalog` and `app/javascript/deployment`.
- Stats state uses a local reducer in `app/javascript/stats/state/statsStore.js`.
- Cross-request derived data uses `Rails.cache` in `app/services/case_stats_service.rb` and `app/controllers/cases/stats_controller.rb`.
- Background state transitions run through Sidekiq queues configured in `config/sidekiq.yml`.

## Key Abstractions

**ApplicationController:**
- Purpose: Central request behavior for locale, Sentry context, Terms of Service enforcement, Pundit errors, and current user fallback.
- Examples: `app/controllers/application_controller.rb`, `app/controllers/concerns/translated_flash_messages.rb`, `app/controllers/concerns/magic_link.rb`
- Pattern: Rails controller inheritance plus small concerns for reusable filters.

**Case Aggregate:**
- Purpose: Central content unit with metadata, pages, cards, edgenotes, podcasts, comments, deployments, quizzes, tags, translations, locks, files, and search indexing behavior.
- Examples: `app/models/case.rb`, `app/models/case_element.rb`, `app/models/page.rb`, `app/models/card.rb`, `app/models/edgenote.rb`, `app/models/podcast.rb`
- Pattern: ActiveRecord aggregate with associations, concerns, callbacks, ActiveStorage attachments, FriendlyId slugs, and specialized nested classes under `app/models/case`.

**Reader Identity:**
- Purpose: Authenticated actor for readers, editors, deployers, commenters, and administrators.
- Examples: `app/models/reader.rb`, `app/models/role.rb`, `app/controllers/readers/sessions_controller.rb`, `app/controllers/authentication_strategies/omniauth_callbacks_controller.rb`
- Pattern: Devise authentication, Rolify roles, Omniauth/LTI authentication strategies, Pundit user object.

**Pundit Policies:**
- Purpose: Gate controller actions, channel subscriptions, mailbox writes, and serialized capability flags.
- Examples: `app/policies/application_policy.rb`, `app/policies/case_policy.rb`, `app/channels/edits_channel.rb`, `app/mailboxes/replies_mailbox.rb`
- Pattern: `authorize`, `policy_scope`, and policy checks against `Reader` roles and record relationships.

**ActiveModel Serializers:**
- Purpose: Provide frontend JSON shape and hypermedia links.
- Examples: `app/serializers/application_serializer.rb`, `app/serializers/cases/show_serializer.rb`, `app/serializers/cases/preview_serializer.rb`, `config/initializers/active_model_serializers.rb`
- Pattern: Camel-lower JSON, serializer-level `link` methods, view-context-backed helpers, nested serializer composition.

**Frontend Pack Entrypoints:**
- Purpose: Mount distinct browser applications into server-rendered shells.
- Examples: `app/javascript/packs/case.entry.jsx`, `app/javascript/packs/catalog.entry.jsx`, `app/javascript/packs/deployment.entry.jsx`, `app/javascript/packs/controllers.js`
- Pattern: Each pack imports feature root components, locale messages from `config/locales`, and common providers such as `IntlProvider`, `ThemeProvider`, Redux `Provider`, or Stimulus `Application`.

**Orchard Browser API Client:**
- Purpose: Standardize browser fetch calls, CSRF headers, JSON response handling, and edit session IDs.
- Examples: `app/javascript/shared/orchard.js`, `app/javascript/redux/actions/case.js`
- Pattern: Static methods map domain verbs to HTTP methods: `harvest` GET, `graft` POST, `espalier` PUT, `prune` DELETE.

**BroadcastEdits And ActionCable:**
- Purpose: Broadcast persisted edits to readers viewing the same case.
- Examples: `app/controllers/concerns/broadcast_edits.rb`, `app/services/broadcast_edit.rb`, `app/channels/edits_channel.rb`, `app/javascript/Case.jsx`
- Pattern: Controller after_action hook, service object for broadcast payloads, Pundit-protected cable streams.

**Service Objects:**
- Purpose: Keep multi-step workflows and complex queries out of controllers.
- Examples: `app/services/deploy_case_service.rb`, `app/services/case_stats_service.rb`, `app/services/linker_service.rb`, `app/services/quiz_updater.rb`, `app/services/comment_thread_range_calculator.rb`
- Pattern: Plain Ruby objects with initializer dependencies and an explicit `call` or query method.

**Cloners:**
- Purpose: Clone case content for copies and translations.
- Examples: `app/cloners/case_cloner.rb`, `app/cloners/page_cloner.rb`, `app/cloners/card_cloner.rb`, `app/jobs/case_clone_job.rb`
- Pattern: Clowne cloner classes invoked inside ActiveRecord transactions.

**Decorators:**
- Purpose: Add presentation behavior to models without putting view logic directly in models.
- Examples: `app/decorators/case_decorator.rb`, `app/decorators/deployment_decorator.rb`, `app/decorators/library_decorator.rb`
- Pattern: Draper decorators loaded by controller `decorates_assigned` or explicit `decorate` calls.

**Admin Dashboards:**
- Purpose: Configure Administrate resource screens.
- Examples: `app/controllers/admin/application_controller.rb`, `app/dashboards/case_dashboard.rb`, `app/dashboards/reader_dashboard.rb`
- Pattern: Administrate controllers plus dashboard classes; editor role gates access.

## Entry Points

**Rack App:**
- Location: `config.ru`
- Triggers: Puma/Rack process boot.
- Responsibilities: Load `config/environment.rb`, optionally install `Rack::CanonicalHost`, run `Rails.application`.

**Rails Application Configuration:**
- Location: `config/application.rb`
- Triggers: Rails boot.
- Responsibilities: Load Rails defaults, set release/staging flags, configure schema format, middleware, and application-level config flags.

**Development Processes:**
- Location: `Procfile.dev`
- Triggers: Local Foreman/Docker-style dev startup.
- Responsibilities: Start `bin/rails s`, `bin/webpack-dev-server`, and Sidekiq.

**Production Runtime Processes:**
- Location: `Procfile`
- Triggers: App runtime process manager.
- Responsibilities: Start Puma with `config/puma.rb` and Sidekiq with `config/sidekiq.yml`.

**HTTP Routes:**
- Location: `config/routes.rb`
- Triggers: Browser/API HTTP requests.
- Responsibilities: Route catalog, case, deployment, admin, Devise, LTI, Sidekiq, stats, and React Router fallback paths.

**Rails Layout And Global Assets:**
- Location: `app/views/layouts/application.html.erb`, `app/assets/javascripts/application.js`
- Triggers: HTML rendering.
- Responsibilities: Load CSRF metadata, i18n globals, Mapbox globals, Webpacker runtime/vendor/styles/controllers/onboarding packs, Sprockets application JS, and shared styles.

**Case React App:**
- Location: `app/javascript/packs/case.entry.jsx`
- Triggers: `javascript_pack_tag "case"` in `app/views/cases/show.html.erb`.
- Responsibilities: Create Redux store, load locale messages, mount `app/javascript/Case.jsx`.

**Catalog React App:**
- Location: `app/javascript/packs/catalog.entry.jsx`
- Triggers: `javascript_pack_tag "catalog"` in `app/views/catalog/home.html.haml`.
- Responsibilities: Load locale messages and mount `app/javascript/catalog/index.jsx`.

**Stimulus App:**
- Location: `app/javascript/packs/controllers.js`
- Triggers: Global layout `app/views/layouts/application.html.erb`.
- Responsibilities: Start Stimulus and autoload controllers from `app/javascript/controllers`.

**ActionCable Connection:**
- Location: `app/channels/application_cable/connection.rb`
- Triggers: Browser WebSocket connection.
- Responsibilities: Identify `current_reader` through Warden or reject the connection.

**ActionMailbox:**
- Location: `app/mailboxes/application_mailbox.rb`, `app/mailboxes/replies_mailbox.rb`
- Triggers: Inbound emails routed to ActionMailbox.
- Responsibilities: Convert email replies into comments when Pundit allows creation.

**SST Infrastructure App:**
- Location: `infra/sst.config.ts`
- Triggers: SST deploy/remove/install commands from `infra/`.
- Responsibilities: Define AWS VPC, ECS web/worker services, Postgres, Redis-compatible cache, secrets, tasks, cron jobs, and S3 media access policies.

## Error Handling

**Strategy:** Use Rails exceptions and response negotiation for request errors, model validations for domain errors, Pundit for authorization failures, and Sentry for production observability.

**Patterns:**
- `ApplicationController` rescues `Pundit::NotAuthorizedError` and redirects HTML users or returns `403` JSON in `app/controllers/application_controller.rb`.
- Controllers return validation errors with `status: :unprocessable_entity`, as in `app/controllers/cases_controller.rb#update`.
- Services wrap multi-record writes in transactions and return persisted/errored objects, as in `app/services/deploy_case_service.rb`.
- Date parsing and invalid inputs are normalized rather than raised in `app/services/case_stats_service.rb`.
- Frontend API errors are normalized into `OrchardError` and `OrchardInputError` in `app/javascript/shared/orchard.js`.
- React feature roots are wrapped with `app/javascript/utility/ErrorBoundary.jsx`.
- Sentry is configured for production/staging in `config/initializers/sentry.rb` and request context is set in `app/controllers/application_controller.rb`.

## Cross-Cutting Concerns

**Logging:** Rails uses Lograge from `config/initializers/lograge.rb`, Sidekiq logs background work configured by `config/sidekiq.yml`, and Sentry logs/errors are configured in `config/initializers/sentry.rb`.

**Validation:** ActiveRecord validations live on models such as `app/models/case.rb`, custom validators live in `app/validators`, strong parameters live in controllers such as `app/controllers/cases_controller.rb`, and frontend/date validation lives in feature modules such as `app/javascript/stats/state/statsStore.js`.

**Authentication:** Devise handles reader sessions in `app/models/reader.rb` and `config/routes.rb`; controller filters call `authenticate_reader!`; ActionCable identifies users in `app/channels/application_cable/connection.rb`; LTI requests are validated in `app/controllers/application_controller.rb`.

**Authorization:** Use Pundit policies in `app/policies` through `authorize`, `policy_scope`, and direct `Pundit.policy` checks. Do not duplicate role checks in controllers unless matching established admin behavior in `app/controllers/admin/application_controller.rb`.

**Internationalization:** Rails locale selection is centralized in `app/controllers/application_controller.rb`; frontend locale data loads from `config/locales` through packs such as `app/javascript/packs/case.entry.jsx` and `app/javascript/packs/catalog.entry.jsx`.

**Caching:** Use `Rails.cache` for derived stats/overview data in `app/services/case_stats_service.rb` and `app/controllers/cases/stats_controller.rb`; use HTTP freshness helpers such as `stale?` for HTML responses.

**Assets:** Use Sprockets for `app/assets` and Webpacker for `app/javascript`; raw SVG and YAML imports are explicitly supported by `config/webpack/environment.js`.

---

*Architecture analysis: 2026-04-22*
