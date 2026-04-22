# Codebase Structure

**Analysis Date:** 2026-04-22

## Directory Layout

```text
/Users/nathanpapes/projects/gala/
├── app/                    # Rails application code: controllers, models, views, jobs, channels, frontend, services
├── app/assets/             # Sprockets images, stylesheets, and JavaScript loaded by Rails layouts
├── app/channels/           # Action Cable connection and channel classes
├── app/cloners/            # Clowne object cloning classes for cases and nested content
├── app/controllers/        # Rails controllers, namespaces, and controller concerns
├── app/dashboards/         # Administrate dashboard field definitions
├── app/decorators/         # Draper presentation decorators
├── app/fields/             # Custom Administrate field types
├── app/forms/              # Form objects
├── app/helpers/            # Rails view helpers and custom form builders
├── app/javascript/         # Webpacker React, Stimulus, Redux, Flow, shared frontend modules, and packs
├── app/jobs/               # ActiveJob jobs executed by Sidekiq
├── app/mailboxes/          # Action Mailbox inbound email handlers
├── app/mailers/            # Action Mailer classes
├── app/models/             # ActiveRecord models, null objects, domain concerns, and nested model namespaces
├── app/policies/           # Pundit policies and scopes
├── app/serializers/        # ActiveModelSerializers JSON serializers
├── app/services/           # Service objects and query/formatting helpers
├── app/validators/         # Custom ActiveModel validators
├── app/views/              # Rails ERB/Haml views, layouts, partials, mailer views, and React mount shells
├── bin/                    # Rails, RSpec, Webpacker, Yarn, setup, and utility executables
├── cable/                  # Standalone Action Cable Rack config
├── config/                 # Rails, environment, route, initializer, webpacker, database, storage, and runtime config
├── db/                     # SQL schema, migrations, and seeds
├── docs/                   # Project documentation and architecture/domain notes
├── flow-typed/             # Flow library definitions
├── infra/                  # Separate SST v4 AWS infrastructure Node package
├── lib/                    # Ruby support code, rake tasks, and Webpack support files
├── public/                 # Static public files and large public assets such as countries.geojson
├── scripts/                # Standalone Ruby scripts
├── spec/                   # RSpec tests, factories, fixtures, support, mailer previews, and feature specs
├── config.ru               # Rack entrypoint for Rails
├── Procfile                # Runtime process definitions for web and worker
├── Procfile.dev            # Local dev process definitions for Rails, Webpacker, and Sidekiq
├── Gemfile                 # Root Rails Ruby dependencies
├── package.json            # Root Webpacker/Jest/Yarn frontend dependencies
├── infra/package.json      # Separate SST infrastructure dependencies
└── jest.config.js          # Jest configuration for app/javascript tests
```

## Directory Purposes

**`app/controllers/`:**
- Purpose: Place Rails HTTP controllers, resource namespaces, and shared controller concerns here.
- Contains: Top-level controllers such as `app/controllers/cases_controller.rb`, namespaced controllers such as `app/controllers/cases/stats_controller.rb`, admin controllers under `app/controllers/admin/`, and concerns under `app/controllers/concerns/`.
- Key files: `app/controllers/application_controller.rb`, `app/controllers/cases_controller.rb`, `app/controllers/catalog_controller.rb`, `app/controllers/deployments_controller.rb`, `app/controllers/cases/stats_controller.rb`, `app/controllers/runtime_controller.rb`

**`app/models/`:**
- Purpose: Place ActiveRecord models, domain null objects, and model namespaces here.
- Contains: Core domain models, nested namespaces such as `app/models/case/`, custom value/type support under `app/models/content_state/`, and concerns under `app/models/concerns/`.
- Key files: `app/models/application_record.rb`, `app/models/case.rb`, `app/models/reader.rb`, `app/models/deployment.rb`, `app/models/case_element.rb`, `app/models/card.rb`, `app/models/page.rb`, `app/models/podcast.rb`, `app/models/edgenote.rb`, `app/models/anonymous_user.rb`

**`app/models/concerns/`:**
- Purpose: Place reusable ActiveRecord concern behavior here.
- Contains: Model concerns for content elements, locking, licensing, serialization, and tracking.
- Key files: `app/models/concerns/element.rb`, `app/models/concerns/lockable.rb`, `app/models/concerns/trackable.rb`, `app/models/concerns/licensable.rb`, `app/models/concerns/serializable.rb`

**`app/services/`:**
- Purpose: Place plain Ruby service objects, query objects, formatters, and workflow orchestration here.
- Contains: Single-file services and nested service namespaces.
- Key files: `app/services/deploy_case_service.rb`, `app/services/customize_deployment_service.rb`, `app/services/case_stats_service.rb`, `app/services/case_stats_service/query.rb`, `app/services/case_stats_service/formatter.rb`, `app/services/broadcast_edit.rb`, `app/services/find_cases.rb`, `app/services/wikidata.rb`

**`app/serializers/`:**
- Purpose: Place ActiveModelSerializers classes for JSON response shapes here.
- Contains: Shared serializer base class plus resource serializers and nested serializer namespaces.
- Key files: `app/serializers/application_serializer.rb`, `app/serializers/case_serializer.rb`, `app/serializers/cases/show_serializer.rb`, `app/serializers/cases/preview_serializer.rb`, `app/serializers/cases/stats_serializer.rb`, `app/serializers/reader_serializer.rb`

**`app/policies/`:**
- Purpose: Place Pundit policy classes and query scopes here.
- Contains: Base policy, resource policies, nested policy namespaces, and custom admin scopes.
- Key files: `app/policies/application_policy.rb`, `app/policies/case_policy.rb`, `app/policies/deployment_policy.rb`, `app/policies/reader_policy.rb`, `app/policies/cases/`

**`app/decorators/`:**
- Purpose: Place Draper decorators for presentation-only methods here.
- Contains: Base decorator and resource decorators for cases, deployments, media, libraries, readers, and reading lists.
- Key files: `app/decorators/application_decorator.rb`, `app/decorators/case_decorator.rb`, `app/decorators/image_decorator.rb`, `app/decorators/deployment_decorator.rb`

**`app/cloners/`:**
- Purpose: Place Clowne cloners for copying cases and nested content here.
- Contains: Case/content cloners and content state cloning helpers.
- Key files: `app/cloners/case_cloner.rb`, `app/cloners/card_cloner.rb`, `app/cloners/content_state_cloner.rb`, `app/cloners/element_cloner.rb`, `app/cloners/page_cloner.rb`, `app/cloners/podcast_cloner.rb`

**`app/jobs/`:**
- Purpose: Place ActiveJob classes for Sidekiq-backed asynchronous work here.
- Contains: Base retry/discard policy, broadcast jobs, clone jobs, index refresh jobs, notification jobs, archive refresh jobs, and reporting jobs.
- Key files: `app/jobs/application_job.rb`, `app/jobs/edit_broadcast_job.rb`, `app/jobs/case_clone_job.rb`, `app/jobs/refresh_indices_job.rb`, `app/jobs/comment_broadcast_job.rb`, `app/jobs/reply_notification_broadcast_job.rb`

**`app/channels/`:**
- Purpose: Place Action Cable connection and channel classes here.
- Contains: Authenticated Cable connection, application channel base, edit/stat/forum/reader notification channels.
- Key files: `app/channels/application_cable/connection.rb`, `app/channels/application_cable/channel.rb`, `app/channels/edits_channel.rb`, `app/channels/stats_channel.rb`, `app/channels/forum_channel.rb`, `app/channels/reader_notifications_channel.rb`

**`app/javascript/`:**
- Purpose: Place Webpacker-managed frontend source here.
- Contains: React apps, Stimulus controllers, Redux actions/reducers, Flow types, shared UI/utilities, images, and packs.
- Key files: `app/javascript/Case.jsx`, `app/javascript/catalog/index.jsx`, `app/javascript/deployment/index.jsx`, `app/javascript/stats/StatsPage.jsx`, `app/javascript/controllers/case_stats_controller.js`, `app/javascript/redux/actions/`, `app/javascript/redux/reducers/`, `app/javascript/packs/case.entry.jsx`, `app/javascript/packs/catalog.entry.jsx`, `app/javascript/packs/controllers.js`

**`app/javascript/packs/`:**
- Purpose: Place Webpacker entrypoints here; Rails views reference these names through `javascript_pack_tag`.
- Contains: Page/application entrypoints, shared style entrypoint, Stimulus controller boot entrypoint, and feature app bootstraps.
- Key files: `app/javascript/packs/case.entry.jsx`, `app/javascript/packs/catalog.entry.jsx`, `app/javascript/packs/deployment.entry.jsx`, `app/javascript/packs/main-menu.entry.jsx`, `app/javascript/packs/controllers.js`, `app/javascript/packs/styles.js`, `app/javascript/packs/onboarding.js`

**`app/javascript/controllers/`:**
- Purpose: Place Stimulus controllers here.
- Contains: DOM behavior controllers and React-island mount controllers.
- Key files: `app/javascript/controllers/case_stats_controller.js`, `app/javascript/controllers/clipboard_controller.js`, `app/javascript/controllers/confirmation_controller.js`, `app/javascript/controllers/reading_list_controller.js`, `app/javascript/controllers/spotlight_controller.js`

**`app/javascript/stats/`:**
- Purpose: Place the stats dashboard React implementation here.
- Contains: Stats page, table, summary, map, HTTP normalization, local reducer state, tests, and docs.
- Key files: `app/javascript/stats/StatsPage.jsx`, `app/javascript/stats/state/statsStore.js`, `app/javascript/stats/http/statsHttp.js`, `app/javascript/stats/map/MapContainer.jsx`, `app/javascript/stats/__tests__/StatsPage.test.jsx`, `app/javascript/stats/STATS.md`

**`app/views/`:**
- Purpose: Place Rails templates, layouts, partials, mailer views, admin views, and React mount shells here.
- Contains: Resource view folders, layout templates, mailer templates, Devise views, stats views, and catalog/case mount pages.
- Key files: `app/views/layouts/application.html.erb`, `app/views/layouts/with_header.html.erb`, `app/views/cases/show.html.erb`, `app/views/catalog/home.html.haml`, `app/views/cases/stats/show.html.erb`, `app/views/cases/stats/_overview.html.erb`

**`app/assets/`:**
- Purpose: Place Sprockets-managed assets here.
- Contains: Asset pipeline config, images, stylesheets, and Sprockets JavaScript.
- Key files: `app/assets/config/manifest.js`, `app/assets/javascripts/application.js`, `app/assets/stylesheets/application.scss`

**`app/dashboards/`:**
- Purpose: Place Administrate dashboard definitions here.
- Contains: One dashboard class per admin resource plus custom field configuration.
- Key files: `app/dashboards/case_dashboard.rb`, `app/dashboards/reader_dashboard.rb`, `app/dashboards/deployment_dashboard.rb`, `app/dashboards/visit_dashboard.rb`

**`app/helpers/`:**
- Purpose: Place Rails view helpers and custom builders here.
- Contains: General helpers, resource helpers, Blueprint form builder, translation helpers, and identicon helpers.
- Key files: `app/helpers/application_helper.rb`, `app/helpers/blueprint_form_builder.rb`, `app/helpers/cases_helper.rb`, `app/helpers/deployments_helper.rb`, `app/helpers/translations_helper.rb`

**`app/mailers/` and `app/mailboxes/`:**
- Purpose: Place outbound mailers and inbound email handlers here.
- Contains: Application mailer, Devise/auth mailer, report/reply/library request mailers, application mailbox, and replies mailbox.
- Key files: `app/mailers/application_mailer.rb`, `app/mailers/reply_notification_mailer.rb`, `app/mailers/report_mailer.rb`, `app/mailboxes/application_mailbox.rb`, `app/mailboxes/replies_mailbox.rb`

**`config/`:**
- Purpose: Place Rails app config, routes, initializers, Webpacker config, environment config, and storage/database config here.
- Contains: Rails boot files, environment files, initializers, locale files, Webpacker files, Puma/Sidekiq config, and route definitions.
- Key files: `config/application.rb`, `config/routes.rb`, `config/puma.rb`, `config/sidekiq.yml`, `config/webpacker.yml`, `config/webpack/environment.js`, `config/initializers/active_model_serializers.rb`, `config/initializers/sidekiq.rb`, `config/initializers/ahoy.rb`

**`config/initializers/`:**
- Purpose: Place boot-time configuration for framework behavior and gems here.
- Contains: ActiveModelSerializers, Ahoy, Devise, FriendlyId, Mobility, Sidekiq, Sentry, Rack::Attack, Lograge, PDFKit, and app-specific terms/configuration initializers.
- Key files: `config/initializers/active_model_serializers.rb`, `config/initializers/ahoy.rb`, `config/initializers/json_param_key_transform.rb`, `config/initializers/mobility.rb`, `config/initializers/sidekiq.rb`, `config/initializers/sentry.rb`

**`db/`:**
- Purpose: Place database schema, migrations, and seed data here.
- Contains: SQL schema, Rails migrations, and seed script.
- Key files: `db/structure.sql`, `db/migrate/`, `db/seeds.rb`

**`lib/`:**
- Purpose: Place Ruby support code and rake tasks that do not belong in `app/`.
- Contains: `Sv` parameter filtering helper, batch user script, rake tasks, and Webpack support file.
- Key files: `lib/sieve.rb`, `lib/tasks/indices.rake`, `lib/tasks/factory_bot.rake`, `lib/tasks/emails.rake`, `lib/tasks/locks.rake`

**`spec/`:**
- Purpose: Place RSpec test suites, factories, fixtures, support helpers, and feature specs here.
- Contains: Tests that mirror app layers, FactoryBot factories, fixtures, shared support, and mailer previews.
- Key files: `spec/rails_helper.rb`, `spec/spec_helper.rb`, `spec/controllers/`, `spec/models/`, `spec/services/`, `spec/policies/`, `spec/serializers/`, `spec/factories/`, `spec/support/`

**`infra/`:**
- Purpose: Place AWS infrastructure code in a separate Node/SST project here.
- Contains: SST config, TypeScript config, Node package files, and generated SST metadata.
- Key files: `infra/sst.config.ts`, `infra/package.json`, `infra/package-lock.json`, `infra/tsconfig.json`

**`flow-typed/`:**
- Purpose: Place Flow library definitions here.
- Contains: Third-party and project-specific Flow type stubs.
- Key files: `flow-typed/actioncable.js`, `flow-typed/sentry.js`, `flow-typed/npm/`

**`public/`:**
- Purpose: Place static files served directly by Rails/web server here.
- Contains: favicon/apple icons, robots file, and public geojson.
- Key files: `public/robots.txt`, `public/favicon.ico`, `public/countries.geojson`

## Key File Locations

**Entry Points:**
- `config.ru`: Rack entrypoint for the Rails application.
- `config/application.rb`: Rails application boot defaults, environment flag normalization, SQL schema format, and middleware setup.
- `config/routes.rb`: HTTP route map, React Router fallbacks, Sidekiq mount, admin namespace, and runtime stats route.
- `Procfile`: Runtime web and worker process definitions.
- `Procfile.dev`: Local Rails, Webpacker dev server, and Sidekiq process definitions.
- `app/javascript/packs/case.entry.jsx`: Case React app boot entrypoint.
- `app/javascript/packs/catalog.entry.jsx`: Catalog React app boot entrypoint.
- `app/javascript/packs/deployment.entry.jsx`: Deployment React app boot entrypoint.
- `app/javascript/packs/controllers.js`: Stimulus controller auto-loader.
- `infra/sst.config.ts`: AWS infrastructure entrypoint for SST.

**Configuration:**
- `Gemfile`: Root Ruby dependencies for the Rails app.
- `package.json`: Root Webpacker/Jest/Yarn dependencies.
- `yarn.lock`: Root Yarn 1 lockfile.
- `infra/package.json`: Infrastructure package dependencies and scripts.
- `infra/package-lock.json`: Infrastructure npm lockfile.
- `config/webpacker.yml`: Webpacker source root, pack path, and dev server settings.
- `config/webpack/environment.js`: Custom Webpack loaders for SVG/YAML/assets and split chunks.
- `.flowconfig`: Flow configuration for `app/javascript/`.
- `jest.config.js`: Jest configuration for frontend tests.
- `.eslintrc.json`: ESLint configuration for Flow JavaScript.
- `.prettierrc.json`: Prettier configuration for Flow parser, single quotes, and no semicolons.
- `config/database.yml`: Rails database configuration.
- `config/storage.yml`: ActiveStorage service configuration.
- `config/cable.yml`: Action Cable adapter configuration.
- `config/sidekiq.yml`: Sidekiq queue/concurrency configuration.

**Core Logic:**
- `app/models/case.rb`: Case aggregate, publication/translation metadata, content associations, search index callback, and attachment validation.
- `app/models/case_element.rb`: Ordered polymorphic join for the case table of contents.
- `app/models/card.rb`: Draft.js card content, tracking, locking, and direct case association.
- `app/models/page.rb`: Narrative element with ordered cards.
- `app/models/podcast.rb`: Audio element with one associated card.
- `app/models/edgenote.rb`: Curated media/reference model attached to a case and referenced from card content.
- `app/models/reader.rb`: Devise-authenticated user, roles, enrollments, libraries, deployments, and notification preferences.
- `app/models/deployment.rb`: Case/group/quiz assignment model.
- `app/controllers/cases_controller.rb`: Case index/show/create/update/destroy/copy request orchestration.
- `app/controllers/cases/stats_controller.rb`: Case stats HTML/JSON/CSV dashboard endpoint.
- `app/services/case_stats_service.rb`: Date range resolution, caching, stats query orchestration, and output API.
- `app/services/case_stats_service/query.rb`: Country stats SQL query.
- `app/services/deploy_case_service.rb`: Transactional deployment creation workflow.
- `app/services/broadcast_edit.rb`: Service entrypoint for edit broadcast jobs.
- `app/jobs/edit_broadcast_job.rb`: Serialized edit broadcast to Action Cable.
- `app/jobs/refresh_indices_job.rb`: PostgreSQL materialized search index refresh.

**Frontend:**
- `app/javascript/Case.jsx`: Case React router and top-level case app orchestration.
- `app/javascript/catalog/index.jsx`: Catalog React router and provider composition.
- `app/javascript/deployment/index.jsx`: Deployment customization React app.
- `app/javascript/stats/StatsPage.jsx`: Stats dashboard React page.
- `app/javascript/stats/state/statsStore.js`: Stats reducer/selectors/range state.
- `app/javascript/stats/http/statsHttp.js`: Stats HTTP fetching, payload normalization, timeout, abort, and cache logic.
- `app/javascript/controllers/case_stats_controller.js`: Stimulus bridge that mounts stats React and subscribes to stats channel.
- `app/javascript/redux/actions/`: Case app Redux actions.
- `app/javascript/redux/reducers/`: Case app Redux reducers.
- `app/javascript/shared/`: Shared React/frontend helpers.
- `app/javascript/utility/`: Shared frontend utility modules.

**Views:**
- `app/views/layouts/application.html.erb`: Base HTML layout, global JavaScript data, Sprockets/Webpacker includes, fonts, and global meta.
- `app/views/layouts/with_header.html.erb`: Header/footer layout wrapper.
- `app/views/cases/show.html.erb`: Case React app mount and serialized `window.caseData`.
- `app/views/catalog/home.html.haml`: Catalog React app mount and preload links.
- `app/views/cases/stats/show.html.erb`: Stats page shell and Stimulus mount.
- `app/views/cases/stats/_overview.html.erb`: Cached stats overview partial.
- `app/views/cases/stats/show.csv.erb`: Stats CSV export template.

**Testing:**
- `spec/rails_helper.rb`: RSpec Rails setup.
- `spec/spec_helper.rb`: Shared RSpec setup.
- `spec/factories/`: FactoryBot factories.
- `spec/support/`: Shared RSpec support helpers.
- `spec/controllers/`: Controller specs.
- `spec/models/`: Model specs.
- `spec/services/`: Service specs.
- `spec/serializers/`: Serializer specs.
- `spec/features/`: Feature specs.
- `app/javascript/**/__tests__/`: Jest tests colocated with frontend modules.

## Naming Conventions

**Files:**
- Rails models use singular snake_case names under `app/models/`, such as `app/models/case.rb`, `app/models/reader.rb`, and `app/models/deployment.rb`.
- Rails controllers use plural snake_case names ending in `_controller.rb`, such as `app/controllers/cases_controller.rb` and `app/controllers/deployments_controller.rb`.
- Namespaced Rails classes mirror directory paths, such as `Cases::StatsController` in `app/controllers/cases/stats_controller.rb` and `Cases::ShowSerializer` in `app/serializers/cases/show_serializer.rb`.
- Pundit policies use singular resource names ending in `_policy.rb`, such as `app/policies/case_policy.rb` and `app/policies/deployment_policy.rb`.
- ActiveJob classes use snake_case filenames ending in `_job.rb`, such as `app/jobs/case_clone_job.rb` and `app/jobs/edit_broadcast_job.rb`.
- Service objects use snake_case filenames ending in `_service.rb` when workflow-oriented, such as `app/services/deploy_case_service.rb`, and nested helper files when they belong to a service namespace, such as `app/services/case_stats_service/query.rb`.
- Draper decorators use snake_case filenames ending in `_decorator.rb`, such as `app/decorators/case_decorator.rb`.
- ActiveModelSerializers use snake_case filenames ending in `_serializer.rb`, such as `app/serializers/case_serializer.rb`.
- React components use PascalCase `.jsx` filenames, such as `app/javascript/stats/StatsPage.jsx` and `app/javascript/catalog/CatalogToolbar.jsx`.
- Frontend helpers/state modules use camelCase `.js` filenames, such as `app/javascript/stats/dateHelpers.js` and `app/javascript/stats/state/statsStore.js`.
- Webpacker packs use descriptive entry filenames under `app/javascript/packs/`, with React entries ending in `.entry.jsx`, such as `app/javascript/packs/case.entry.jsx`.
- Jest frontend tests live in `__tests__` directories and use `.test.js` or `.test.jsx`, such as `app/javascript/stats/__tests__/StatsPage.test.jsx`.
- RSpec tests use `_spec.rb`, such as `spec/controllers/cases/stats_controller_spec.rb` and `spec/services/case_stats_service_spec.rb`.

**Directories:**
- Rails namespaces map to directory names under the layer directory, such as `app/controllers/cases/`, `app/serializers/cases/`, and `app/policies/cases/`.
- Frontend feature folders group components by product area, such as `app/javascript/catalog/`, `app/javascript/deployment/`, `app/javascript/conversation/`, `app/javascript/overview/`, and `app/javascript/stats/`.
- Frontend shared code belongs in `app/javascript/shared/` for reusable UI/domain helpers and `app/javascript/utility/` for lower-level utility modules.
- Nested service collaborators belong under a service-named directory, such as `app/services/case_stats_service/`.

## Where to Add New Code

**New Rails Resource:**
- Primary code: Add the model in `app/models/`, controller in `app/controllers/`, policy in `app/policies/`, serializer in `app/serializers/` when JSON is needed, and view templates in `app/views/<resource>/`.
- Routes: Add route declarations in `config/routes.rb`.
- Tests: Add model specs in `spec/models/`, controller/request specs in `spec/controllers/` or `spec/requests/`, policy specs in `spec/policies/`, serializer specs in `spec/serializers/`, and factories in `spec/factories/`.

**New Case Subresource:**
- Primary code: Add nested route under `resources :cases` in `config/routes.rb`, controller under `app/controllers/cases/` when case-specific, and views under `app/views/cases/<feature>/`.
- Authorization: Add or extend policy behavior in `app/policies/case_policy.rb` or `app/policies/cases/`.
- Tests: Add focused specs under `spec/controllers/cases/`, `spec/policies/`, and any relevant service/model spec directory.

**New Service Workflow:**
- Primary code: Add a plain Ruby object under `app/services/`, following `app/services/deploy_case_service.rb` for transactional workflow or `app/services/case_stats_service.rb` for query/formatting collaborators.
- Tests: Add service specs under `spec/services/`, with nested directories when the service has nested collaborators such as `spec/services/case_stats_service/`.

**New Background Job:**
- Primary code: Add an ActiveJob subclass under `app/jobs/`, inheriting retry behavior from `app/jobs/application_job.rb`.
- Queue config: Use queue names compatible with `config/sidekiq.yml`.
- Tests: Add job specs under `spec/jobs/`.

**New Action Cable Channel:**
- Primary code: Add the channel class under `app/channels/`, use `app/channels/application_cable/connection.rb` for authenticated `current_reader`, and gate subscription access with Pundit policies in `app/policies/`.
- Frontend: Subscribe from the relevant React/Stimulus module under `app/javascript/`.
- Tests: Add channel or integration coverage under `spec/` where existing channel test patterns apply.

**New React Feature App:**
- Primary code: Add feature modules under `app/javascript/<feature>/`, a Webpacker pack under `app/javascript/packs/<feature>.entry.jsx`, and a Rails view mount shell under `app/views/`.
- Rails wiring: Include the pack with `javascript_pack_tag` from the relevant view, following `app/views/cases/show.html.erb` and `app/views/catalog/home.html.haml`.
- Tests: Add Jest tests under `app/javascript/<feature>/__tests__/`.

**New Stimulus Behavior:**
- Primary code: Add controller file under `app/javascript/controllers/`; `app/javascript/packs/controllers.js` auto-loads controllers from that directory.
- Rails wiring: Add `data-controller="<name>"` and data attributes in the relevant `app/views/` template.
- Tests: Add Jest coverage under the closest frontend `__tests__` directory when the behavior has logic beyond DOM glue.

**New Serializer:**
- Primary code: Add serializer under `app/serializers/` or a matching namespace such as `app/serializers/cases/`.
- Base behavior: Reuse `app/serializers/application_serializer.rb` for links, route helpers, `type`, `table`, `param`, and view context support.
- Tests: Add serializer specs under `spec/serializers/`.

**New Policy:**
- Primary code: Add policy under `app/policies/`, with nested `Scope` when query visibility is needed and `AdminScope` when admin/editor views differ from public/user visibility.
- Tests: Add policy specs under `spec/policies/`.

**New Decorator:**
- Primary code: Add decorator under `app/decorators/` only for presentation-specific methods used by views or serializers.
- Usage: Decorate in controllers with `decorate` or `decorates_assigned`, following `app/controllers/cases_controller.rb` and `app/controllers/deployments_controller.rb`.
- Tests: Add decorator specs under `spec/decorators/`.

**New Case Content Type:**
- Primary code: Add the model under `app/models/`, include `app/models/concerns/element.rb` when it belongs in the case table of contents, add a cloner under `app/cloners/`, add serializers/decorators/policies as needed, and add UI modules under `app/javascript/elements/` or a feature folder.
- Database: Add migrations under `db/migrate/` and confirm `db/structure.sql` reflects the SQL schema.
- Tests: Add model, cloner, serializer, policy, and frontend tests in the matching `spec/` and `app/javascript/**/__tests__/` locations.

**Utilities:**
- Ruby shared helpers: Add general support code to `lib/` only when it is not app-layer domain code, following `lib/sieve.rb`.
- Rails concerns: Add reusable controller concerns to `app/controllers/concerns/` and model concerns to `app/models/concerns/`.
- Frontend shared helpers: Add reusable frontend helpers to `app/javascript/shared/` or `app/javascript/utility/` depending on scope.

**Infrastructure:**
- Primary code: Add AWS/SST infrastructure changes in `infra/sst.config.ts` and dependency changes in `infra/package.json`.
- Boundary: Keep infra package dependency management in `infra/package-lock.json`; root app dependency management stays in `Gemfile`, `Gemfile.lock`, `package.json`, and `yarn.lock`.

## Special Directories

**`infra/`:**
- Purpose: Separate SST v4 Node project for AWS infrastructure.
- Generated: Partially; `infra/.sst/` is generated metadata, while `infra/sst.config.ts`, `infra/package.json`, `infra/package-lock.json`, and `infra/tsconfig.json` are source/config files.
- Committed: Source/config files are committed; generated SST cache content under `infra/.sst/` is project tooling output.

**`app/javascript/packs/`:**
- Purpose: Webpacker entrypoint directory referenced by Rails `javascript_pack_tag`.
- Generated: No.
- Committed: Yes.

**`app/assets/`:**
- Purpose: Sprockets asset pipeline source for Rails-managed assets.
- Generated: No.
- Committed: Yes.

**`db/structure.sql`:**
- Purpose: Canonical SQL schema for PostgreSQL-specific database objects, including `cases_search_index`.
- Generated: Yes, by Rails database schema dump.
- Committed: Yes.

**`db/migrate/`:**
- Purpose: Rails migration history.
- Generated: No.
- Committed: Yes.

**`flow-typed/`:**
- Purpose: Flow type definitions for third-party packages and project stubs.
- Generated: Partially, depending on `flow-typed` usage.
- Committed: Yes.

**`spec/fixtures/`:**
- Purpose: Test fixture files for RSpec.
- Generated: No.
- Committed: Yes.

**`.planning/codebase/`:**
- Purpose: Generated codebase intelligence consumed by GSD planning/execution commands.
- Generated: Yes.
- Committed: Project-dependent; update only requested documents such as `.planning/codebase/ARCHITECTURE.md` and `.planning/codebase/STRUCTURE.md` during mapping.

**`.env`, `.env.dev`, `.env.ignore`, `.envrc`:**
- Purpose: Environment configuration files at the project root.
- Generated: No.
- Committed: Project-dependent; do not read or quote contents because these files may contain secrets.

**`config/credentials.yml.enc` and `config/secrets.yml`:**
- Purpose: Rails credential/secret configuration files.
- Generated: No.
- Committed: Project-dependent; do not read or quote contents because these files may contain secrets.

**`tmp/` and `log/`:**
- Purpose: Runtime temporary files and logs.
- Generated: Yes.
- Committed: Only placeholder/control files such as `log/.keep` and `tmp/restart.txt` should be treated as source-adjacent.

---

*Structure analysis: 2026-04-22*
