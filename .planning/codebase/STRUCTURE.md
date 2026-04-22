# Codebase Structure

**Analysis Date:** 2026-04-22

## Directory Layout

```text
gala/
+-- app/                 # Rails application code: MVC, services, policies, serializers, jobs, React, Stimulus, assets
+-- bin/                 # Rails, Webpacker, setup, and helper executables
+-- cable/               # ActionCable client-side/generated support files
+-- config/              # Rails, environment, initializers, routes, webpacker, puma, sidekiq, locales
+-- db/                  # SQL schema, migrations, seeds
+-- docs/                # Project documentation and release notes
+-- flow-typed/          # Flow library type stubs
+-- infra/               # Separate SST v4 Node project for AWS infrastructure
+-- lib/                 # Rake tasks and custom library files
+-- public/              # Static public files and generated asset pack output
+-- scripts/             # Project scripts
+-- spec/                # RSpec test suite and support files
+-- storage/             # Local ActiveStorage files
+-- Gemfile              # Ruby dependencies
+-- package.json         # Root JavaScript dependencies and Jest scripts
+-- Procfile             # Runtime web/worker process definitions
+-- Procfile.dev         # Local web/webpack/worker process definitions
+-- Dockerfile           # Container image for Rails app
+-- docker-compose.yml   # Local Docker app services
```

## Directory Purposes

**`app/controllers`:**
- Purpose: Rails request controllers and reusable controller concerns.
- Contains: Top-level resource controllers, nested namespaces, admin controllers, Devise overrides, LTI controllers, and concerns.
- Key files: `app/controllers/application_controller.rb`, `app/controllers/cases_controller.rb`, `app/controllers/cases/stats_controller.rb`, `app/controllers/deployments_controller.rb`, `app/controllers/admin/application_controller.rb`, `app/controllers/concerns/broadcast_edits.rb`

**`app/models`:**
- Purpose: ActiveRecord models, value objects, model concerns, and nested domain classes.
- Contains: Database-backed models, non-persistent model objects, polymorphic content models, and concerns.
- Key files: `app/models/application_record.rb`, `app/models/case.rb`, `app/models/reader.rb`, `app/models/deployment.rb`, `app/models/content_state.rb`, `app/models/concerns/lockable.rb`, `app/models/case/archive.rb`

**`app/services`:**
- Purpose: Plain Ruby objects for multi-step domain operations, search/stat queries, linking, broadcasting, and API integrations.
- Contains: Service classes with initializer dependencies and explicit methods such as `call`, `country_stats`, or query helpers.
- Key files: `app/services/deploy_case_service.rb`, `app/services/customize_deployment_service.rb`, `app/services/case_stats_service.rb`, `app/services/case_stats_service/query.rb`, `app/services/case_stats_service/formatter.rb`, `app/services/linker_service.rb`, `app/services/broadcast_edit.rb`

**`app/policies`:**
- Purpose: Pundit policies and scopes.
- Contains: Base policy, resource policies, and namespaced policies.
- Key files: `app/policies/application_policy.rb`, `app/policies/case_policy.rb`, `app/policies/deployment_policy.rb`, `app/policies/reader_policy.rb`, `app/policies/cases/feature_policy.rb`

**`app/serializers`:**
- Purpose: ActiveModelSerializers JSON payloads for frontend consumers.
- Contains: Base serializer, resource serializers, nested namespace serializers, and relation-by-id helpers.
- Key files: `app/serializers/application_serializer.rb`, `app/serializers/case_serializer.rb`, `app/serializers/cases/show_serializer.rb`, `app/serializers/cases/preview_serializer.rb`, `app/serializers/cases/stats_serializer.rb`, `app/serializers/comment_threads/index_serializer.rb`

**`app/views`:**
- Purpose: Rails HTML, Haml, ERB, mailer templates, layouts, and React mount shells.
- Contains: Layouts, resource views, admin views, mailer views, partials, and no-JS fallbacks.
- Key files: `app/views/layouts/application.html.erb`, `app/views/layouts/with_header.html.erb`, `app/views/cases/show.html.erb`, `app/views/catalog/home.html.haml`, `app/views/cases/stats/show.html.erb`

**`app/javascript`:**
- Purpose: Webpacker source tree for React, Redux, React Router, Stimulus, Flow types, feature modules, and browser utilities.
- Contains: Entrypoints in `packs`, React feature directories, Redux modules, Stimulus controllers, shared utilities, tests, and styles imported through Webpacker.
- Key files: `app/javascript/packs/case.entry.jsx`, `app/javascript/packs/catalog.entry.jsx`, `app/javascript/packs/deployment.entry.jsx`, `app/javascript/packs/controllers.js`, `app/javascript/Case.jsx`, `app/javascript/shared/orchard.js`, `app/javascript/redux/reducers/index.js`, `app/javascript/stats/StatsPage.jsx`

**`app/assets`:**
- Purpose: Sprockets assets for global JavaScript, stylesheets, and images.
- Contains: `application.js` manifest, global channel JS, CSS/SCSS, static images, SVGs.
- Key files: `app/assets/javascripts/application.js`, `app/assets/javascripts/channels`, `app/assets/stylesheets`, `app/assets/images`

**`app/jobs`:**
- Purpose: ActiveJob classes backed by Sidekiq.
- Contains: Background jobs for clones, locks, broadcasts, archive refresh, social images, memory snapshots, and search index refresh.
- Key files: `app/jobs/application_job.rb`, `app/jobs/case_clone_job.rb`, `app/jobs/refresh_indices_job.rb`, `app/jobs/comment_broadcast_job.rb`, `app/jobs/case_archive_refresh_job.rb`

**`app/channels`:**
- Purpose: ActionCable server channels and connection identification.
- Contains: Base channel, connection, edit/forum/notification/stats channels.
- Key files: `app/channels/application_cable/connection.rb`, `app/channels/application_cable/channel.rb`, `app/channels/edits_channel.rb`, `app/channels/forum_channel.rb`, `app/channels/stats_channel.rb`, `app/channels/reader_notifications_channel.rb`

**`app/mailers` and `app/mailboxes`:**
- Purpose: Outbound notification/report emails and inbound reply processing.
- Contains: Application mailer, reply/library/report mailers, ActionMailbox classes.
- Key files: `app/mailers/application_mailer.rb`, `app/mailers/reply_notification_mailer.rb`, `app/mailboxes/application_mailbox.rb`, `app/mailboxes/replies_mailbox.rb`

**`app/cloners`:**
- Purpose: Clowne clone definitions for cases and nested content.
- Contains: Case, page, card, edgenote, podcast, content state, and element cloners.
- Key files: `app/cloners/case_cloner.rb`, `app/cloners/page_cloner.rb`, `app/cloners/card_cloner.rb`, `app/cloners/edgenote_cloner.rb`, `app/cloners/content_state_cloner.rb`

**`app/decorators`:**
- Purpose: Draper presentation wrappers.
- Contains: Decorators for cases, deployments, libraries, readers, content elements, and image presentation.
- Key files: `app/decorators/application_decorator.rb`, `app/decorators/case_decorator.rb`, `app/decorators/deployment_decorator.rb`, `app/decorators/library_decorator.rb`

**`app/dashboards` and `app/fields`:**
- Purpose: Administrate configuration and custom admin fields.
- Contains: Dashboard classes per admin resource and custom field classes/views.
- Key files: `app/dashboards/case_dashboard.rb`, `app/dashboards/reader_dashboard.rb`, `app/fields/percent_field.rb`, `app/views/fields/percent_field`

**`config`:**
- Purpose: Rails app configuration, routes, initializers, environment configs, Webpacker, Puma, Sidekiq, storage, locales.
- Contains: Boot files, initializers, environment-specific settings, locale YAML/JS loader, webpack config, queue/server config.
- Key files: `config/application.rb`, `config/routes.rb`, `config/environments/production.rb`, `config/webpacker.yml`, `config/webpack/environment.js`, `config/puma.rb`, `config/sidekiq.yml`, `config/initializers/active_model_serializers.rb`

**`db`:**
- Purpose: Database schema, migrations, seeds.
- Contains: SQL schema dump, migration history, seeds.
- Key files: `db/structure.sql`, `db/seeds.rb`, `db/migrate/20241011080359_update_case_search_index_for_postgres16.rb`, `db/migrate/20250107000000_add_case_id_to_ahoy_events.rb`

**`lib`:**
- Purpose: Custom library files and Rake tasks.
- Contains: Rake tasks for factories, emails, docs, locks, tests, index refresh; custom Ruby files; webpack helper file.
- Key files: `lib/tasks/indices.rake`, `lib/tasks/emails.rake`, `lib/tasks/factory_bot.rake`, `lib/sieve.rb`, `lib/webpack/application.js`

**`spec`:**
- Purpose: RSpec test suite and fixtures.
- Contains: Specs mirroring app directories, factories, support helpers, fixtures, feature/request/model/controller/service/job/policy specs.
- Key files: `spec/rails_helper.rb`, `spec/spec_helper.rb`, `spec/factories`, `spec/support`, `spec/controllers/cases`, `spec/services/case_stats_service`

**`infra`:**
- Purpose: Separate Node/SST project for AWS deployment infrastructure.
- Contains: SST config, package metadata, TypeScript config, Node lockfile.
- Key files: `infra/sst.config.ts`, `infra/package.json`, `infra/package-lock.json`, `infra/tsconfig.json`

**`public`:**
- Purpose: Static public assets and compiled asset output.
- Contains: Public static files, generated `packs`, generated `packs-test`, generated Sprockets assets.
- Key files: `public/packs`, `public/packs-test`, `public/assets`

**`storage`:**
- Purpose: Local ActiveStorage file storage.
- Contains: Hash-sharded local files.
- Key files: `storage/*`

## Key File Locations

**Entry Points:**
- `config.ru`: Rack entrypoint for Puma/Rack servers.
- `Procfile`: Runtime web and worker processes.
- `Procfile.dev`: Local web, webpack dev server, and Sidekiq processes.
- `config/routes.rb`: HTTP route map and Sidekiq UI mount.
- `app/views/layouts/application.html.erb`: Global HTML layout and asset loading.
- `app/javascript/packs/case.entry.jsx`: Case reader/editor React app entrypoint.
- `app/javascript/packs/catalog.entry.jsx`: Catalog React app entrypoint.
- `app/javascript/packs/deployment.entry.jsx`: Deployment customization React app entrypoint.
- `app/javascript/packs/controllers.js`: Stimulus autoload entrypoint.
- `app/assets/javascripts/application.js`: Sprockets JavaScript manifest.
- `app/channels/application_cable/connection.rb`: ActionCable connection entrypoint.
- `app/mailboxes/application_mailbox.rb`: ActionMailbox base entrypoint.
- `infra/sst.config.ts`: AWS infrastructure entrypoint.

**Configuration:**
- `config/application.rb`: Rails defaults, app flags, middleware, schema format.
- `config/environments/development.rb`: Development environment config.
- `config/environments/test.rb`: Test environment config.
- `config/environments/production.rb`: Production environment config.
- `config/webpacker.yml`: Webpacker source path, pack path, dev server port, compile behavior.
- `config/webpack/environment.js`: Custom Webpacker loaders and split chunks.
- `config/sidekiq.yml`: Queue names, weights, timeouts, concurrency.
- `config/puma.rb`: Puma threads, workers, port, Barnes hook.
- `config/initializers/devise.rb`: Devise setup.
- `config/initializers/active_model_serializers.rb`: JSON key transform and serializer helper.
- `config/initializers/sentry.rb`: Sentry configuration.
- `config/initializers/lograge.rb`: Request logging configuration.
- `.env`, `.env.dev`, `.env.ignore`: Environment configuration files present; do not read or quote contents.

**Core Logic:**
- `app/models/case.rb`: Central content aggregate.
- `app/models/reader.rb`: Authenticated reader/editor identity.
- `app/models/deployment.rb`: Case deployment and group/quiz relationships.
- `app/controllers/cases_controller.rb`: Main case HTML/JSON controller.
- `app/controllers/catalog_controller.rb`: Catalog home controller.
- `app/controllers/deployments_controller.rb`: Deployment management controller.
- `app/controllers/cases/stats_controller.rb`: Stats dashboard controller.
- `app/services/case_stats_service.rb`: Stats date normalization, caching, and formatting facade.
- `app/services/deploy_case_service.rb`: Deployment creation workflow.
- `app/services/linker_service.rb`: LTI reader/group linking workflow.
- `app/services/broadcast_edit.rb`: Edit broadcast payloads.
- `app/policies/application_policy.rb`: Default authorization behavior.
- `app/serializers/application_serializer.rb`: Shared JSON serializer behavior.

**Frontend Logic:**
- `app/javascript/Case.jsx`: Case React app root and case router.
- `app/javascript/catalog/index.jsx`: Catalog React app root and catalog router.
- `app/javascript/deployment/index.jsx`: Deployment UI root.
- `app/javascript/stats/StatsPage.jsx`: Stats dashboard React root.
- `app/javascript/shared/orchard.js`: Browser API client.
- `app/javascript/redux/actions`: Case editor Redux action creators.
- `app/javascript/redux/reducers`: Case editor Redux reducers.
- `app/javascript/controllers`: Stimulus controllers.
- `app/javascript/utility`: Shared React/browser utilities.
- `app/javascript/shared`: Cross-feature helpers, theme-adjacent components, route helpers, i18n helpers.

**Testing:**
- `spec`: RSpec suite.
- `spec/factories`: FactoryBot factories.
- `spec/support`: RSpec support helpers.
- `spec/features`: Feature specs.
- `spec/requests`: Request specs.
- `app/javascript/**/__tests__`: Jest tests near frontend modules.
- `jest.config.js`: Jest configuration.

## Naming Conventions

**Files:**
- Rails classes use snake_case filenames matching constant names: `CasesController` in `app/controllers/cases_controller.rb`, `CaseStatsService` in `app/services/case_stats_service.rb`.
- Namespaced Rails classes use nested directories: `Cases::StatsController` in `app/controllers/cases/stats_controller.rb`, `Cases::ShowSerializer` in `app/serializers/cases/show_serializer.rb`.
- Concerns use snake_case module files under concerns directories: `BroadcastEdits` in `app/controllers/concerns/broadcast_edits.rb`, `Lockable` in `app/models/concerns/lockable.rb`.
- React components use PascalCase filenames when the file exports a component: `app/javascript/Case.jsx`, `app/javascript/stats/StatsPage.jsx`, `app/javascript/overview/CaseOverview.jsx`.
- JavaScript utility modules use camelCase or descriptive lower-case filenames: `app/javascript/shared/orchard.js`, `app/javascript/stats/dateHelpers.js`, `app/javascript/stats/urlParams.js`.
- Webpacker entry files live in `app/javascript/packs` and use entry-oriented names: `case.entry.jsx`, `catalog.entry.jsx`, `deployment.entry.jsx`, plus global pack names such as `controllers.js` and `styles.js`.
- Stimulus controllers use the `*_controller.js` suffix: `app/javascript/controllers/case_stats_controller.js`, `app/javascript/controllers/clipboard_controller.js`.
- RSpec files use `_spec.rb` and mirror source directories: `spec/controllers/cases/stats_controller_spec.rb`, `spec/services/case_stats_service/query_spec.rb`.
- Jest files use `.test.js` or `.test.jsx` inside `__tests__` directories: `app/javascript/stats/__tests__/StatsPage.test.jsx`.

**Directories:**
- Rails domain namespaces mirror route/module namespaces: `app/controllers/cases`, `app/views/cases`, `app/serializers/cases`, `app/policies/cases`.
- Frontend feature directories group by product area: `app/javascript/catalog`, `app/javascript/deployment`, `app/javascript/stats`, `app/javascript/conversation`, `app/javascript/overview`.
- Shared frontend code belongs in `app/javascript/shared` for cross-feature domain helpers and `app/javascript/utility` for generic UI/browser utilities.
- Redux code belongs in `app/javascript/redux/actions`, `app/javascript/redux/reducers`, and `app/javascript/redux/state.js`.
- Admin resource configuration belongs in `app/controllers/admin`, `app/dashboards`, `app/views/admin`, and `app/fields`.

## Where to Add New Code

**New Rails Resource:**
- Primary code: add model in `app/models`, controller in `app/controllers`, policy in `app/policies`, serializer in `app/serializers` when JSON is exposed, views in `app/views/<resource>`, and routes in `config/routes.rb`.
- Tests: add specs under matching `spec/models`, `spec/controllers` or `spec/requests`, `spec/policies`, `spec/serializers`, and `spec/factories`.
- Example pattern: `app/controllers/reading_lists_controller.rb`, `app/models/reading_list.rb`, `app/policies/reading_list_policy.rb`, `app/serializers/reading_list_serializer.rb`, `app/views/reading_lists`.

**New Case-Scoped Endpoint:**
- Primary code: place controller under `app/controllers/cases` if it is nested under `/cases/:case_slug/...`, add route inside the `resources :cases` block in `config/routes.rb`, and authorize via `app/policies/case_policy.rb` or a specific nested policy.
- Tests: mirror namespace under `spec/controllers/cases` or use request specs under `spec/requests`.
- Example pattern: `app/controllers/cases/stats_controller.rb`, `app/views/cases/stats`, `app/serializers/cases/stats_serializer.rb`.

**New Frontend Pack:**
- Primary code: add an entrypoint under `app/javascript/packs`, a feature root under `app/javascript/<feature>`, and mount markup in the matching Rails view under `app/views`.
- Tests: place Jest tests in `app/javascript/<feature>/__tests__`.
- Example pattern: `app/javascript/packs/catalog.entry.jsx` mounting `app/javascript/catalog/index.jsx` from `app/views/catalog/home.html.haml`.

**New React Component Inside Existing Feature:**
- Implementation: add the component to the relevant feature directory such as `app/javascript/stats`, `app/javascript/catalog`, `app/javascript/deployment`, or `app/javascript/conversation`.
- Shared implementation: place cross-feature components in `app/javascript/shared` or generic UI helpers in `app/javascript/utility`.
- Tests: use co-located `__tests__` when the feature already has one, such as `app/javascript/stats/__tests__`.

**New Stimulus Behavior:**
- Implementation: add `app/javascript/controllers/<name>_controller.js`.
- Wiring: `app/javascript/packs/controllers.js` autoloads controllers through `require.context`, so Rails markup only needs matching `data-controller` attributes.
- Example pattern: `app/javascript/controllers/case_stats_controller.js`.

**New Redux Case Editor Behavior:**
- Primary code: add action creators to `app/javascript/redux/actions`, reducer logic to `app/javascript/redux/reducers`, and state shape updates in `app/javascript/redux/state.js`.
- Tests: add reducer/action tests near existing reducer tests under `app/javascript/redux/reducers/__tests__`.
- Example pattern: `app/javascript/redux/actions/case.js`, `app/javascript/redux/reducers/caseData.js`.

**New Multi-Step Backend Operation:**
- Primary code: add a service object to `app/services`.
- Controller usage: instantiate the service from the controller and keep authorization in the controller/policy layer.
- Tests: add service specs under `spec/services`.
- Example pattern: `app/services/deploy_case_service.rb`, `app/services/customize_deployment_service.rb`.

**New Background Job:**
- Primary code: add an ActiveJob class to `app/jobs` inheriting from `app/jobs/application_job.rb`.
- Queue configuration: use queues declared in `config/sidekiq.yml` or add queue config deliberately.
- Tests: add job specs under `spec/jobs`.
- Example pattern: `app/jobs/case_clone_job.rb`, `app/jobs/refresh_indices_job.rb`.

**New Realtime Channel:**
- Primary code: add a channel under `app/channels`, authorize subscriptions with Pundit or explicit reader checks, and add frontend subscription code in the consuming feature.
- Tests: add channel or integration coverage matching existing ActionCable conventions.
- Example pattern: `app/channels/edits_channel.rb` plus subscription behavior in `app/javascript/Case.jsx`.

**New Serializer/API Payload:**
- Primary code: add serializer under `app/serializers`, use camel-lower JSON behavior from `config/initializers/active_model_serializers.rb`, and include route links through `app/serializers/application_serializer.rb` helpers.
- Tests: add serializer specs under `spec/serializers`.
- Example pattern: `app/serializers/cases/show_serializer.rb`, `app/serializers/comment_threads/index_serializer.rb`.

**New Admin Resource:**
- Primary code: add dashboard in `app/dashboards`, controller override in `app/controllers/admin` only when behavior differs from Administrate defaults, and views/fields only when custom rendering is needed.
- Routes: add resource under the `admin` namespace in `config/routes.rb`.
- Example pattern: `app/dashboards/case_dashboard.rb`, `app/controllers/admin/cases_controller.rb`, `app/views/admin/cases`.

**New Database Change:**
- Primary code: add migration under `db/migrate`.
- Schema: this app uses SQL schema format, so verify resulting changes in `db/structure.sql`.
- Model updates: add associations/validations/scopes to the relevant `app/models` file.

**New Infrastructure Change:**
- Primary code: edit `infra/sst.config.ts` and keep Node package changes inside `infra/package.json` and `infra/package-lock.json`.
- Boundary: do not mix root Yarn/Webpacker dependencies with `infra` npm dependencies.

**Utilities:**
- Shared Ruby helpers: use `app/services` for domain operations, `app/models/concerns` for reusable model behavior, `app/controllers/concerns` for reusable controller behavior, and `lib` for Rake tasks or non-autoloaded library support.
- Shared frontend helpers: use `app/javascript/shared` for app/domain helpers and `app/javascript/utility` for reusable UI/browser helpers.

## Special Directories

**`public/packs`:**
- Purpose: Webpacker compiled development/production pack output.
- Generated: Yes.
- Committed: No files detected in git for `public/packs`.

**`public/packs-test`:**
- Purpose: Webpacker compiled test pack output.
- Generated: Yes.
- Committed: No files detected in git for `public/packs-test`.

**`public/assets`:**
- Purpose: Sprockets compiled asset output.
- Generated: Yes.
- Committed: No files detected in git for `public/assets`.

**`storage`:**
- Purpose: Local ActiveStorage file store.
- Generated: Yes.
- Committed: No files detected in git for `storage`.

**`infra/node_modules`:**
- Purpose: Installed dependencies for the separate SST project.
- Generated: Yes.
- Committed: No files detected in git for `infra/node_modules`.

**`flow-typed`:**
- Purpose: Flow type stubs for JavaScript dependencies.
- Generated: Partially, through Flow tooling.
- Committed: Yes.

**`db/migrate`:**
- Purpose: Rails migration history.
- Generated: No; migration files are source-controlled application changes.
- Committed: Yes.

**`.planning/codebase`:**
- Purpose: GSD codebase intelligence documents consumed by planning/execution commands.
- Generated: Yes, by mapper agents.
- Committed: Managed by the GSD orchestrator.

---

*Structure analysis: 2026-04-22*
