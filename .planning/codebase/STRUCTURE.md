# Codebase Structure

**Analysis Date:** 2026-05-03

## Directory Layout

```
gala/
├── app/                    # Rails application code and Shakapacker frontend
│   ├── assets/             # Sprockets assets and static app images/styles
│   ├── channels/           # Action Cable channels and connection classes
│   ├── cloners/            # Clowne object cloning logic
│   ├── controllers/        # Rails controllers and controller concerns
│   ├── dashboards/         # Administrate dashboard definitions
│   ├── decorators/         # Draper presentation decorators
│   ├── fields/             # Administrate custom fields
│   ├── forms/              # Form objects
│   ├── helpers/            # Rails view helpers
│   ├── javascript/         # React, Redux, Stimulus, Flow types, frontend assets
│   ├── jobs/               # ActiveJob classes, executed by Sidekiq
│   ├── mailboxes/          # Action Mailbox handlers
│   ├── mailers/            # Action Mailer classes
│   ├── models/             # ActiveRecord models and model concerns
│   ├── policies/           # Pundit policies
│   ├── serializers/        # ActiveModelSerializer JSON contracts
│   ├── services/           # Service objects and external API clients
│   ├── validators/         # Custom validators
│   └── views/              # Rails HTML, HAML, ERB, Jbuilder, mailer, layout views
├── bin/                    # Rails and project executable scripts
├── cable/                  # Action Cable Rack entrypoint
├── config/                 # Rails, environment, initializer, locale, webpack config
├── db/                     # Migrations, seeds, SQL schema, dumps
├── docs/                   # Project docs and release notes
├── flow-typed/             # Flow library definitions
├── infra/                  # Infrastructure project files
├── lib/                    # Rake tasks, scripts, and webpack helpers
├── public/                 # Public static files and compiled packs
├── scripts/                # Operational scripts
├── spec/                   # RSpec tests and fixtures
├── storage/                # Local Active Storage files
├── Gemfile                 # Ruby dependencies
├── package.json            # JavaScript dependencies and scripts
├── Procfile                # Production process types
├── Procfile.dev            # Development process types
└── README.md               # Project setup and overview
```

## Directory Purposes

**`app/controllers`:**
- Purpose: HTTP entrypoints, request authorization, record loading, response rendering, and controller-specific orchestration.
- Contains: Resource controllers, namespaced controllers, concerns.
- Key files: `app/controllers/application_controller.rb`, `app/controllers/cases_controller.rb`, `app/controllers/catalog_controller.rb`, `app/controllers/cases/stats_controller.rb`, `app/controllers/admin/application_controller.rb`.

**`app/controllers/concerns`:**
- Purpose: Shared controller behavior.
- Contains: Concerns for edit broadcasts, locks, selection params, magic links, translated flash messages, and sign-in paths.
- Key files: `app/controllers/concerns/broadcast_edits.rb`, `app/controllers/concerns/verify_lock.rb`, `app/controllers/concerns/selection_params.rb`.

**`app/models`:**
- Purpose: ActiveRecord domain model layer.
- Contains: Top-level models, namespaced model classes, null objects, and model concerns.
- Key files: `app/models/case.rb`, `app/models/reader.rb`, `app/models/card.rb`, `app/models/page.rb`, `app/models/podcast.rb`, `app/models/edgenote.rb`, `app/models/comment_thread.rb`, `app/models/deployment.rb`, `app/models/library.rb`.

**`app/models/concerns`:**
- Purpose: Shared model behavior mixed into domain models.
- Contains: Locking, tracking, serialization, licensing, element behavior.
- Key files: `app/models/concerns/lockable.rb`, `app/models/concerns/trackable.rb`, `app/models/concerns/licensable.rb`, `app/models/concerns/element.rb`.

**`app/services`:**
- Purpose: Plain Ruby service objects for workflows, search, stats, reports, external calls, and orchestration.
- Contains: Top-level service classes and nested service modules.
- Key files: `app/services/case_stats_service.rb`, `app/services/case_stats_service/query.rb`, `app/services/case_stats_service/formatter.rb`, `app/services/deploy_case_service.rb`, `app/services/wikidata.rb`, `app/services/find_cases.rb`, `app/services/quiz_updater.rb`.

**`app/policies`:**
- Purpose: Pundit authorization policies and scopes.
- Contains: One policy per protected resource, plus namespaced policies.
- Key files: `app/policies/application_policy.rb`, `app/policies/case_policy.rb`, `app/policies/library_policy.rb`, `app/policies/cases/feature_policy.rb`.

**`app/serializers`:**
- Purpose: JSON response and broadcast shape contracts.
- Contains: ActiveModelSerializer classes grouped by resource namespace.
- Key files: `app/serializers/case_serializer.rb`, `app/serializers/cases/show_serializer.rb`, `app/serializers/cases/stats_serializer.rb`, `app/serializers/card_serializer.rb`, `app/serializers/comment_threads/show_serializer.rb`.

**`app/decorators`:**
- Purpose: Draper decorators for view-facing presentation methods.
- Contains: Decorators corresponding to models and collections.
- Key files: `app/decorators/case_decorator.rb`, `app/decorators/card_decorator.rb`, `app/decorators/page_decorator.rb`, `app/decorators/reader_decorator.rb`.

**`app/jobs`:**
- Purpose: Background work executed through ActiveJob/Sidekiq.
- Contains: Broadcast jobs, clone/archive jobs, notification jobs, cleanup jobs, runtime snapshots.
- Key files: `app/jobs/application_job.rb`, `app/jobs/edit_broadcast_job.rb`, `app/jobs/case_clone_job.rb`, `app/jobs/case_archive_refresh_job.rb`, `app/jobs/refresh_indices_job.rb`.

**`app/channels`:**
- Purpose: Action Cable server channels.
- Contains: Connection and subscription classes.
- Key files: `app/channels/application_cable/connection.rb`, `app/channels/edits_channel.rb`, `app/channels/forum_channel.rb`, `app/channels/reader_notifications_channel.rb`, `app/channels/stats_channel.rb`.

**`app/views`:**
- Purpose: Rails-rendered views, layouts, React mount shells, JSON builders, mail templates.
- Contains: HAML, ERB, Jbuilder, markerb, layout files.
- Key files: `app/views/cases/show.html.erb`, `app/views/catalog/home.html.haml`, `app/views/layouts/application.html.erb`, `app/views/layouts/with_header.html.erb`, `app/views/cases/pdf.html.erb`.

**`app/javascript/packs`:**
- Purpose: Shakapacker entrypoints referenced by Rails views.
- Contains: Page-level JavaScript entry files.
- Key files: `app/javascript/packs/case.entry.jsx`, `app/javascript/packs/catalog.entry.jsx`, `app/javascript/packs/deployment.entry.jsx`, `app/javascript/packs/billboard.entry.jsx`, `app/javascript/packs/controllers.js`.

**`app/javascript/redux`:**
- Purpose: Redux state management for the case reader/editor frontend.
- Contains: Action creators, thunks, reducers, Flow state definitions.
- Key files: `app/javascript/redux/state.js`, `app/javascript/redux/reducers/index.js`, `app/javascript/redux/reducers/caseData.js`, `app/javascript/redux/actions/index.js`, `app/javascript/redux/actions/editsChannel.js`.

**`app/javascript/catalog`:**
- Purpose: Catalog React app for home and search experiences.
- Contains: Catalog root component, toolbar, data providers, home and search result views.
- Key files: `app/javascript/catalog/index.jsx`, `app/javascript/catalog/catalogData.jsx`, `app/javascript/catalog/readerData.jsx`, `app/javascript/catalog/home/index.jsx`, `app/javascript/catalog/search_results/index.jsx`.

**`app/javascript/stats`:**
- Purpose: Stats dashboard frontend code.
- Contains: Map components, state store, HTTP client modules, tests, and documentation.
- Key files: `app/javascript/stats/StatsPage.jsx`, `app/javascript/stats/state/statsStore.js`, `app/javascript/stats/http`, `app/javascript/stats/map/MapContainer.jsx`.

**`app/javascript/shared`:**
- Purpose: Shared frontend utilities, components, contexts, fetch helpers, drag/drop, spotlight UI.
- Contains: Shared React components and helpers.
- Key files: `app/javascript/shared/orchard.js`, `app/javascript/shared/GalaDragDropContext.jsx`, `app/javascript/shared/TitleCard.jsx`, `app/javascript/shared/spotlight/index.jsx`.

**`app/javascript/utility`:**
- Purpose: Generic browser utilities and reusable UI helpers.
- Contains: Error boundaries, async component loader, scrolling, accessibility, tracker, styled component helpers.
- Key files: `app/javascript/utility/ErrorBoundary.jsx`, `app/javascript/utility/asyncComponent.jsx`, `app/javascript/utility/styledComponents.js`, `app/javascript/utility/Tracker.jsx`.

**`config`:**
- Purpose: Rails application configuration, initializers, locales, webpack/shakapacker settings.
- Contains: Environment configs, initializers, locale files, storage/database/cable configs, webpack config.
- Key files: `config/application.rb`, `config/routes.rb`, `config/shakapacker.yml`, `config/webpack/environment.js`, `config/initializers/devise.rb`, `config/initializers/sidekiq.rb`, `config/locales/en.yml`.

**`db`:**
- Purpose: Database structure and migrations.
- Contains: SQL schema, migration files, seeds, dumps.
- Key files: `db/structure.sql`, `db/seeds.rb`, `db/migrate`.

**`spec`:**
- Purpose: RSpec test suite.
- Contains: Controller, request, model, service, job, serializer, policy, feature, and support specs.
- Key files: `spec/rails_helper.rb`, `spec/services/case_stats_service_spec.rb`, `spec/controllers/cases_controller_spec.rb`, `spec/services/case_stats_service/query_spec.rb`.

**`flow-typed`:**
- Purpose: Flow type stubs for JavaScript dependencies.
- Contains: Library definitions under `flow-typed/npm` and custom stubs.
- Key files: `flow-typed/npm/react-redux_v5.x.x.js`, `flow-typed/npm/redux_v3.x.x.js`, `flow-typed/sentry.js`.

## Key File Locations

**Entry Points:**
- `config/routes.rb`: Main Rails route table.
- `config.ru`: Rack entrypoint for Rails.
- `cable/config.ru`: Rack entrypoint for Action Cable.
- `app/controllers/catalog_controller.rb`: Root catalog page controller.
- `app/controllers/cases_controller.rb`: Main case REST and case React shell controller.
- `app/javascript/packs/case.entry.jsx`: Case React/Redux pack.
- `app/javascript/packs/catalog.entry.jsx`: Catalog React pack.
- `app/javascript/packs/controllers.js`: Stimulus controller pack.
- `Rakefile`: Rake task entrypoint.

**Configuration:**
- `Gemfile`: Ruby dependencies.
- `package.json`: JavaScript dependencies, Node/Yarn engines, Jest command.
- `config/application.rb`: Rails application defaults, schema format, middleware, global environment flags.
- `config/routes.rb`: Routes and mounted Sidekiq UI.
- `config/database.yml`: Database connection configuration.
- `config/storage.yml`: Active Storage services.
- `config/cable.yml`: Action Cable adapter configuration.
- `config/sidekiq.yml`: Sidekiq queues/concurrency configuration.
- `config/shakapacker.yml`: Shakapacker source, output, dev server, and production compile configuration.
- `config/webpack/environment.js`: Webpack customization.
- `Procfile`: Production process definitions.
- `Procfile.dev`: Development process definitions.
- `docker-compose.yml`: Local container services.

**Core Logic:**
- `app/models/case.rb`: Case aggregate root.
- `app/models/reader.rb`: User identity, roles, and associations.
- `app/controllers/cases_controller.rb`: Case HTML/JSON requests.
- `app/controllers/cases/stats_controller.rb`: Case analytics endpoint.
- `app/services/case_stats_service.rb`: Stats service boundary.
- `app/services/deploy_case_service.rb`: Case deployment workflow.
- `app/services/wikidata.rb`: Wikidata/SPARQL integration.
- `app/policies/case_policy.rb`: Case authorization.
- `app/serializers/cases/show_serializer.rb`: Case React bootstrap JSON.
- `app/jobs/edit_broadcast_job.rb`: Collaborative edit broadcast job.
- `app/channels/edits_channel.rb`: Collaborative edit Action Cable channel.

**Frontend Logic:**
- `app/javascript/Case.jsx`: Case React app root and client routes.
- `app/javascript/catalog/index.jsx`: Catalog React app root and client routes.
- `app/javascript/redux/state.js`: Flow state shape.
- `app/javascript/redux/reducers/index.js`: Redux reducer composition.
- `app/javascript/redux/actions/index.js`: Redux action exports.
- `app/javascript/shared/orchard.js`: Fetch, CSRF, and session helper.
- `app/javascript/stats/StatsPage.jsx`: Stats frontend root.

**Testing:**
- `spec/rails_helper.rb`: RSpec Rails setup.
- `spec/models`: Model specs.
- `spec/controllers`: Controller specs.
- `spec/requests`: Request specs.
- `spec/services`: Service specs.
- `spec/jobs`: Job specs.
- `spec/policies`: Pundit policy specs.
- `spec/serializers`: Serializer specs.
- `app/javascript/**/__tests__`: Jest frontend tests co-located with JavaScript features.

## Naming Conventions

**Files:**
- Ruby classes use Rails snake_case filenames matching class names: `CaseStatsService` in `app/services/case_stats_service.rb`, `Cases::StatsController` in `app/controllers/cases/stats_controller.rb`.
- Namespaced Ruby classes live in matching directories: `Cases::ShowSerializer` in `app/serializers/cases/show_serializer.rb`.
- React components use PascalCase filenames when exporting components: `app/javascript/Case.jsx`, `app/javascript/overview/StatusBar.jsx`, `app/javascript/stats/StatsPage.jsx`.
- JavaScript utility modules and Redux files use camelCase or domain names: `app/javascript/shared/orchard.js`, `app/javascript/redux/reducers/caseData.js`.
- Shakapacker entries use `*.entry.jsx` for React page apps: `case.entry.jsx`, `catalog.entry.jsx`, `deployment.entry.jsx`.
- Tests use RSpec `_spec.rb` for Ruby and Jest `.test.js`/`.test.jsx` inside `__tests__` for frontend code.

**Directories:**
- Rails resource namespaces use plural snake_case directories matching routes: `app/controllers/cases`, `app/serializers/cases`, `spec/controllers/cases`.
- Frontend feature folders use lower_snake_case or simple domain names: `app/javascript/reading_list`, `app/javascript/suggested_quizzes`, `app/javascript/wikidata`.
- Shared frontend utilities live under `app/javascript/shared` or `app/javascript/utility`.
- Redux action and reducer modules are grouped by domain under `app/javascript/redux/actions` and `app/javascript/redux/reducers`.

## Where to Add New Code

**New Rails Endpoint:**
- Primary code: `app/controllers`
- Route: `config/routes.rb`
- Authorization: `app/policies`
- JSON response: `app/serializers`
- Tests: `spec/controllers` or `spec/requests`

**New Nested Case Endpoint:**
- Primary code: `app/controllers/cases` for case-scoped controllers or `app/controllers` for top-level resources.
- Route: nested under `resources :cases` in `config/routes.rb`.
- Authorization: `app/policies/case_policy.rb` or a resource-specific policy in `app/policies`.
- Serializer: `app/serializers/cases` for case-scoped response shapes.
- Tests: `spec/controllers/cases` or `spec/requests`.

**New Domain Model:**
- Implementation: `app/models`
- Migration: `db/migrate`
- Policy: `app/policies` if user-visible or user-mutated.
- Serializer: `app/serializers` if exposed to JSON or broadcasts.
- Factory: `spec/factories`
- Tests: `spec/models`

**New Service Object:**
- Implementation: `app/services`
- Nested collaborator classes: subdirectory matching service name, such as `app/services/case_stats_service/query.rb`.
- Tests: `spec/services`
- Use services for raw SQL, external APIs, transactions, reports, multi-model workflows, and cache-heavy logic.

**New Background Job:**
- Implementation: `app/jobs`
- Enqueue from: controller, model callback, or service object that owns the triggering workflow.
- Tests: `spec/jobs`
- Use existing queue names from `app/jobs` and `config/sidekiq.yml`.

**New Action Cable Channel:**
- Implementation: `app/channels`
- Authorization: Pundit policy or reader role check inside `subscribed`.
- Client subscription: feature action module under `app/javascript/redux/actions` or feature folder under `app/javascript`.
- Tests: `spec/channels` if added; otherwise add request/job coverage around broadcast triggers.

**New Case React UI:**
- Primary code: feature folder under `app/javascript` such as `app/javascript/edgenotes`, `app/javascript/conversation`, or a new domain folder.
- Route integration: `app/javascript/Case.jsx` for case subroutes.
- State changes: `app/javascript/redux/actions`, `app/javascript/redux/reducers`, and `app/javascript/redux/state.js`.
- Server data contract: `app/serializers/cases/show_serializer.rb` or resource serializers under `app/serializers`.
- Tests: `app/javascript/<feature>/__tests__`.

**New Catalog React UI:**
- Primary code: `app/javascript/catalog`
- Route integration: `app/javascript/catalog/index.jsx`.
- Data provider changes: `app/javascript/catalog/catalogData.jsx` or `app/javascript/catalog/readerData.jsx`.
- Server endpoints: `app/controllers/catalog` or existing REST controllers.
- Tests: `app/javascript/catalog/**/__tests__` when adding tested components.

**New Page-level React App:**
- Pack: `app/javascript/packs/<name>.entry.jsx`
- Rails mount shell: `app/views/<resource>/<view>.html.*`
- Route/controller: `config/routes.rb`, `app/controllers`
- Reuse providers from `app/javascript/packs/case.entry.jsx` or `app/javascript/packs/catalog.entry.jsx` as appropriate.

**New Redux State:**
- State shape: `app/javascript/redux/state.js`
- Reducer: `app/javascript/redux/reducers/<domain>.js`
- Root reducer registration: `app/javascript/redux/reducers/index.js`
- Actions/thunks: `app/javascript/redux/actions/<domain>.js`
- Export actions: `app/javascript/redux/actions/index.js`

**New Shared Frontend Utility:**
- Shared app-level helper: `app/javascript/shared`
- Generic UI or browser helper: `app/javascript/utility`
- Feature-specific helper: keep inside the feature folder under `app/javascript/<feature>`.

**New Admin Dashboard Resource:**
- Dashboard: `app/dashboards/<resource>_dashboard.rb`
- Admin route: `config/routes.rb` under `namespace :admin`.
- Controller override only if needed: `app/controllers/admin/<resources>_controller.rb`.
- Authorization remains editor-only through `app/controllers/admin/application_controller.rb`.

**New View Helper or Decorator:**
- Helper: `app/helpers` for template helper methods.
- Decorator: `app/decorators` for presentation logic tied to a model.
- Tests: `spec/decorators` for decorator behavior.

**Utilities:**
- Shared Ruby helpers: `lib`
- Rake tasks: `lib/tasks`
- Operational scripts: `scripts`
- Browser shared helpers: `app/javascript/shared` or `app/javascript/utility`

## Special Directories

**`.planning`:**
- Purpose: GSD planning and codebase intelligence artifacts.
- Generated: Yes
- Committed: Project-dependent.

**`.omx`:**
- Purpose: Workflow/spec/state artifacts from OMX automation.
- Generated: Yes
- Committed: Project-dependent.

**`public/packs` and `public/packs-test`:**
- Purpose: Compiled Shakapacker assets.
- Generated: Yes
- Committed: Usually no unless deployment process requires it.

**`storage`:**
- Purpose: Local Active Storage blobs.
- Generated: Yes
- Committed: No for normal application data.

**`tmp`, `log`:**
- Purpose: Rails runtime cache, PID, socket, and log output.
- Generated: Yes
- Committed: No, except placeholder files.

**`flow-typed`:**
- Purpose: Flow type definitions for frontend dependencies.
- Generated: Partly
- Committed: Yes

**`db/migrate`:**
- Purpose: Database migration history.
- Generated: No
- Committed: Yes

**`db/structure.sql`:**
- Purpose: Current database schema in SQL format.
- Generated: Yes
- Committed: Yes

---

*Structure analysis: 2026-05-03*
