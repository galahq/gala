# Codebase Structure

**Analysis Date:** 2026-05-30

## Directory Layout

```text
gala/
├── app/                         # Rails application code and frontend source
│   ├── assets/                  # Sprockets images, stylesheets, asset manifest
│   ├── channels/                # ActionCable channels and connection
│   ├── cloners/                 # Clowne case/content cloning classes
│   ├── controllers/             # Rails controllers and controller concerns
│   ├── dashboards/              # Administrate dashboard definitions
│   ├── decorators/              # Draper presentation decorators
│   ├── fields/                  # Custom Administrate field types
│   ├── forms/                   # Form objects
│   ├── helpers/                 # Rails view helpers and form builders
│   ├── javascript/              # Shakapacker React, Redux, Stimulus, shared JS
│   ├── jobs/                    # ActiveJob jobs executed by Sidekiq
│   ├── mailboxes/               # ActionMailbox inbound email handlers
│   ├── mailers/                 # ActionMailer classes
│   ├── models/                  # ActiveRecord models, null objects, concerns
│   ├── policies/                # Pundit policies and scopes
│   ├── serializers/             # ActiveModel Serializer JSON contracts
│   ├── services/                # Cross-model service objects
│   ├── validators/              # Custom ActiveModel validators
│   └── views/                   # ERB/Haml HTML, JSON, JS, mailer, admin views
├── bin/                         # Rails, Shakapacker, setup, update, test scripts
├── cable/                       # Standalone ActionCable Rack config
├── config/                      # Rails, Shakapacker, environment, initializer config
├── db/                          # SQL schema, migrations, seed data, seed dump
├── docs/                        # Operator and migration documentation
├── infra/                       # SST AWS/Cloudflare infrastructure package
├── lib/                         # Rake tasks and non-app Ruby helpers
├── public/                      # Static public files and compiled pack directories
├── scripts/                     # Deployment, secret scan, utility scripts
├── spec/                        # RSpec, factories, fixtures, support files
├── storage/                     # Local ActiveStorage disk files
├── tests/visual/                # Playwright visual regression specs/baselines
├── .github/workflows/           # GitHub Actions deployment workflow
├── .planning/                   # GSD project state, phases, research, codebase docs
├── Dockerfile                   # Multi-stage Rails/Node image
├── Gemfile                      # Ruby dependency manifest
├── package.json                 # Node dependency manifest and scripts
├── pnpm-lock.yaml               # pnpm lockfile
├── config.ru                    # Rack entrypoint
├── Procfile                     # Production web/worker process declarations
└── Procfile.dev                 # Local web/webpack/worker process declarations
```

## Directory Purposes

**`app/controllers`:**
- Purpose: HTTP request orchestration.
- Contains: Top-level resource controllers, `app/controllers/admin`, `app/controllers/cases`, `app/controllers/catalog`, Devise/OmniAuth namespaces, and reusable concerns under `app/controllers/concerns`.
- Key files: `app/controllers/application_controller.rb`, `app/controllers/catalog_controller.rb`, `app/controllers/cases_controller.rb`, `app/controllers/deployments_controller.rb`, `app/controllers/admin/application_controller.rb`.

**`app/models`:**
- Purpose: ActiveRecord domain model layer.
- Contains: Core records (`Case`, `Reader`, `Deployment`, `Card`, `Edgenote`, `Quiz`), nested model namespaces, custom attribute types, and concerns.
- Key files: `app/models/case.rb`, `app/models/reader.rb`, `app/models/deployment.rb`, `app/models/case_element.rb`, `app/models/card.rb`, `app/models/edgenote.rb`, `app/models/concerns/element.rb`, `app/models/concerns/lockable.rb`, `app/models/concerns/trackable.rb`.

**`app/views`:**
- Purpose: Server-rendered route shells, partials, mailers, and admin templates.
- Contains: ERB/Haml route views organized by controller, layout inheritance chain, Devise views, Administrate views, JSON/Jbuilder templates, JS responses.
- Key files: `app/views/layouts/application.html.erb`, `app/views/layouts/with_header.html.erb`, `app/views/layouts/admin.html.erb`, `app/views/catalog/home.html.haml`, `app/views/cases/show.html.erb`, `app/views/deployments/edit.html.haml`.

**`app/helpers`:**
- Purpose: View helper methods and custom form builders.
- Contains: Layout helpers, pack collection helpers, markdown helpers, nav button text helpers, field/form helpers.
- Key files: `app/helpers/application_helper.rb`, `app/helpers/blueprint_form_builder.rb`, `app/helpers/cases_helper.rb`, `app/helpers/deployments_helper.rb`.

**`app/javascript/packs`:**
- Purpose: Shakapacker entrypoints loaded from Rails views.
- Contains: Route app entries, global style/controller entries, and utility entries.
- Key files: `app/javascript/packs/catalog.entry.jsx`, `app/javascript/packs/case.entry.jsx`, `app/javascript/packs/deployment.entry.jsx`, `app/javascript/packs/controllers.js`, `app/javascript/packs/styles.js`, `app/javascript/packs/main-menu.entry.jsx`, `app/javascript/packs/file_upload.js`.

**`app/javascript/catalog`:**
- Purpose: Catalog home and search React app.
- Contains: Catalog router, context providers, home widgets, search-results screens, catalog tests.
- Key files: `app/javascript/catalog/index.jsx`, `app/javascript/catalog/catalogData.js`, `app/javascript/catalog/readerData.js`, `app/javascript/catalog/search_results/index.jsx`, `app/javascript/catalog/home/index.jsx`.

**`app/javascript/redux`:**
- Purpose: Case reader/editor state management.
- Contains: Redux actions and reducers for cards, case data, comments, comment threads, edgenotes, forums, locks, pages, podcasts, quiz, statistics, suggested quizzes, UI, and edit state.
- Key files: `app/javascript/redux/reducers/index.js`, `app/javascript/redux/actions/index.js`, `app/javascript/redux/actions/editsChannel.js`, `app/javascript/redux/actions/case.js`.

**`app/javascript/controllers`:**
- Purpose: Stimulus controllers for progressive interactions on Rails-rendered views.
- Contains: Stats mounting, reading-list interactions, selection, spotlight, confirmation, clipboard, identicon, invite drawer, slug settings.
- Key files: `app/javascript/packs/controllers.js`, `app/javascript/controllers/case_stats_controller.js`, `app/javascript/controllers/deployments/invite_drawer_controller.js`, `app/javascript/controllers/cases/settings/slug_controller.js`.

**`app/javascript/shared`:**
- Purpose: Browser-side shared utilities and compatibility layers.
- Contains: API client, route builders, Blueprint compatibility, typography, drag/drop context, main menu, spotlight, shared tests.
- Key files: `app/javascript/shared/orchard.js`, `app/javascript/shared/routes.js`, `app/javascript/shared/blueprintLegacyNamespace.js`, `app/javascript/shared/blueprint.scss`, `app/javascript/shared/MainMenu.jsx`, `app/javascript/shared/GalaDragDropContext.jsx`.

**`app/javascript/utility`:**
- Purpose: Reusable React UI and hooks.
- Contains: Error boundaries, toolbar, lock UI, markdown, file upload, stats utility, accessibility helpers, async component loader, hooks.
- Key files: `app/javascript/utility/ErrorBoundary.jsx`, `app/javascript/utility/Toolbar.jsx`, `app/javascript/utility/Lock.jsx`, `app/javascript/utility/asyncComponent.jsx`, `app/javascript/utility/hooks`.

**`app/assets`:**
- Purpose: Sprockets-managed static assets and global styles.
- Contains: Images, CSS manifests, legacy stylesheets, ActionCable JS placeholder.
- Key files: `app/assets/stylesheets/application.css`, `app/assets/config/manifest.js`, `app/assets/images`.

**`app/serializers`:**
- Purpose: JSON shape for Rails API responses, inline React boot state, and ActionCable payloads.
- Contains: Base serializer, case/catalog serializers, comment/thread serializers, reader serializers, quiz serializers.
- Key files: `app/serializers/application_serializer.rb`, `app/serializers/case_serializer.rb`, `app/serializers/cases/show_serializer.rb`, `app/serializers/cases/preview_serializer.rb`.

**`app/services`:**
- Purpose: Multi-step domain workflows.
- Contains: Search, deployment creation/customization, edit broadcast, stats query/formatting, readers, reports, links, country reference, activity creation.
- Key files: `app/services/find_cases.rb`, `app/services/deploy_case_service.rb`, `app/services/customize_deployment_service.rb`, `app/services/broadcast_edit.rb`, `app/services/case_stats_service.rb`, `app/services/case_stats_service/query.rb`.

**`app/jobs`:**
- Purpose: Background work run through ActiveJob/Sidekiq.
- Contains: Edit/comment/thread broadcasts, archive refresh, index refresh, cloning, notifications, cleanup, memory snapshot.
- Key files: `app/jobs/application_job.rb`, `app/jobs/edit_broadcast_job.rb`, `app/jobs/refresh_indices_job.rb`, `app/jobs/case_clone_job.rb`, `app/jobs/case_archive_refresh_job.rb`.

**`app/channels`:**
- Purpose: ActionCable realtime subscriptions.
- Contains: Cable connection, base channel, edits, forum, reader notifications, stats.
- Key files: `app/channels/application_cable/connection.rb`, `app/channels/edits_channel.rb`, `app/channels/stats_channel.rb`, `app/channels/forum_channel.rb`, `app/channels/reader_notifications_channel.rb`.

**`app/policies`:**
- Purpose: Pundit authorization for controllers, scopes, serializers, and channels.
- Contains: Base policy, resource policies, nested case feature policy.
- Key files: `app/policies/application_policy.rb`, `app/policies/case_policy.rb`, `app/policies/deployment_policy.rb`, `app/policies/element_policy.rb`, `app/policies/cases/feature_policy.rb`.

**`app/dashboards` and `app/fields`:**
- Purpose: Administrate admin UI definitions.
- Contains: One dashboard per admin resource, custom field classes.
- Key files: `app/dashboards/case_dashboard.rb`, `app/dashboards/reader_dashboard.rb`, `app/dashboards/deployment_dashboard.rb`, `app/fields`.

**`config`:**
- Purpose: Rails boot, environments, routes, initializers, assets, Shakapacker, database/storage/cable/Sidekiq config.
- Contains: `config/routes.rb`, `config/application.rb`, `config/environments`, `config/initializers`, `config/webpack`, `config/shakapacker.yml`, YAML config.
- Key files: `config/routes.rb`, `config/application.rb`, `config/shakapacker.yml`, `config/webpack/environment.js`, `config/cable.yml`, `config/sidekiq.yml`, `config/storage.yml`, `config/puma.rb`.

**`db`:**
- Purpose: Database schema, migrations, seed data, seed dump.
- Contains: SQL schema, migration files, Rails seeds, AWS seed dump.
- Key files: `db/structure.sql`, `db/migrate`, `db/seeds.rb`, `db/sqldump/seed.dump`.

**`lib`:**
- Purpose: Rake tasks and low-level helper Ruby not owned by Rails autoload directories.
- Contains: Task files and helper scripts.
- Key files: `lib/tasks/indices.rake`, `lib/tasks/emails.rake`, `lib/tasks/tests.rake`, `lib/sieve.rb`, `lib/batch-add-users.rb`.

**`infra`:**
- Purpose: SST infrastructure project for AWS/Cloudflare deployment.
- Contains: SST config, TypeScript config, npm manifest/lock, generated SST type file.
- Key files: `infra/sst.config.ts`, `infra/package.json`, `infra/package-lock.json`, `infra/tsconfig.json`, `infra/sst-env.d.ts`.

**`.github/workflows`:**
- Purpose: GitHub Actions automation.
- Contains: Manual AWS deploy workflow.
- Key files: `.github/workflows/deploy.yml`.

**`scripts`:**
- Purpose: Operator and deployment helper scripts.
- Contains: SST deploy wrapper, AWS/Ruby utility scripts, staged secret scan, Docker helpers.
- Key files: `scripts/deploy-sst.sh`, `scripts/scan-staged-secrets`, `scripts/deploy-gala-aws-production.sh`, `scripts/docker`.

**`spec`:**
- Purpose: Ruby test suite.
- Contains: RSpec specs organized by Rails layer, factories, fixtures, support modules.
- Key files: `spec/rails_helper.rb`, `spec/spec_helper.rb`, `spec/factories`, `spec/requests`, `spec/controllers`, `spec/models`, `spec/services`, `spec/support`.

**`tests/visual`:**
- Purpose: Playwright visual regression coverage.
- Contains: Visual specs and screenshot baselines.
- Key files: `playwright.config.mjs`, `tests/visual`, `tests/visual/__screenshots__`.

**`.planning`:**
- Purpose: GSD project memory and execution artifacts.
- Contains: Project state, roadmap, requirements, research, phase artifacts, codebase maps.
- Key files: `.planning/PROJECT.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`, `.planning/codebase`.

## Key File Locations

**Entry Points:**
- `config.ru`: Rack entrypoint for the Rails app.
- `config/routes.rb`: HTTP route source of truth.
- `app/controllers/application_controller.rb`: Base controller for request-wide behavior.
- `app/views/layouts/application.html.erb`: Top-level HTML layout and global asset tags.
- `app/javascript/packs/catalog.entry.jsx`: Catalog React island entry.
- `app/javascript/packs/case.entry.jsx`: Case reader/editor React island entry.
- `app/javascript/packs/deployment.entry.jsx`: Deployment customizer React island entry.
- `app/javascript/packs/controllers.js`: Stimulus controller loader.
- `Procfile`: Production web/worker process declarations.
- `Procfile.dev`: Local Rails/Shakapacker/Sidekiq process declarations.
- `Dockerfile`: Container image entrypoint and asset precompile path.

**Configuration:**
- `config/application.rb`: Rails application defaults, schema format, env flag normalization, middleware.
- `config/environments`: Environment-specific Rails config.
- `config/initializers`: Devise, Sentry, Ahoy, Sidekiq, assets, sessions, security, logging, serializers, Mobility, FriendlyId, and app-specific initializers.
- `config/shakapacker.yml`: Shakapacker source paths, output paths, dev server, compilation mode.
- `config/webpack/environment.js`: Webpack 5/Shakapacker custom rules, aliases, fallbacks, split chunks, global process shim.
- `config/cable.yml`: ActionCable Redis/async adapters.
- `config/sidekiq.yml`: Sidekiq queues and concurrency.
- `config/storage.yml`: ActiveStorage disk and S3 service config.
- `config/puma.rb`: Puma worker/thread setup.
- `jest.config.js`: Jest module path and transforms.
- `playwright.config.mjs`: Visual regression runner config.
- `tsconfig.json`: Non-emitting TypeScript/JSDoc baseline for JS files.

**Core Logic:**
- `app/models/case.rb`: Primary case aggregate.
- `app/models/case_element.rb`: Ordered polymorphic case table-of-contents join.
- `app/models/card.rb`: Narrative card content.
- `app/models/edgenote.rb`: Case media/annotation content.
- `app/models/reader.rb`: Devise user and role-bearing reader identity.
- `app/models/deployment.rb`: Instructor deployment aggregate.
- `app/controllers/cases_controller.rb`: Case HTML/JSON and authoring API.
- `app/controllers/catalog_controller.rb`: Root catalog shell.
- `app/controllers/deployments_controller.rb`: Deployment workflow.
- `app/services/find_cases.rb`: Catalog search/filter query builder.
- `app/services/deploy_case_service.rb`: Deployment creation workflow.
- `app/services/customize_deployment_service.rb`: Quiz/deployment customization workflow.
- `app/serializers/cases/show_serializer.rb`: Case reader/editor boot JSON.
- `app/javascript/Case.jsx`: Case reader/editor app shell.
- `app/javascript/catalog/index.jsx`: Catalog app shell.
- `app/javascript/shared/orchard.js`: Shared browser API client.

**Realtime and Background:**
- `app/controllers/concerns/broadcast_edits.rb`: Controller hook for successful edits.
- `app/services/broadcast_edit.rb`: Broadcast job enqueue wrapper.
- `app/jobs/edit_broadcast_job.rb`: Edit broadcast serializer/job.
- `app/channels/edits_channel.rb`: Case edit channel.
- `app/channels/stats_channel.rb`: Case stats update channel.
- `app/jobs/refresh_indices_job.rb`: Search index refresh job.

**Deployment and Operations:**
- `infra/sst.config.ts`: AWS/Cloudflare infrastructure definition.
- `.github/workflows/deploy.yml`: Manual deploy workflow.
- `scripts/deploy-sst.sh`: SST deploy wrapper and safety checks.
- `Dockerfile`: Production image build/runtime.
- `db/sqldump/seed.dump`: Seed dump used by AWS deployment tasks.
- `docs/aws-production-operator-runbook.md`: Production operator guidance.
- `docs/aws-sst-migration-plan.md`: AWS/SST migration planning context.

**Testing:**
- `spec/rails_helper.rb`: Rails RSpec setup.
- `spec/spec_helper.rb`: RSpec baseline setup.
- `spec/factories`: FactoryBot definitions.
- `spec/requests`: Request specs.
- `spec/controllers`: Controller specs.
- `spec/models`: Model specs.
- `spec/services`: Service specs.
- `app/javascript/**/__tests__`: Co-located Jest tests.
- `tests/visual`: Playwright visual tests.

## Naming Conventions

**Files:**
- Rails Ruby files use snake_case names matching class/module names: `app/controllers/cases_controller.rb`, `app/models/case_element.rb`, `app/services/deploy_case_service.rb`.
- Namespaced Rails classes mirror directory nesting: `app/controllers/cases/settings_controller.rb`, `app/policies/cases/feature_policy.rb`, `app/serializers/cases/show_serializer.rb`.
- ActiveModel Serializers end in `_serializer.rb`: `app/serializers/case_serializer.rb`, `app/serializers/cases/preview_serializer.rb`.
- Service objects end in `_service.rb` when they represent commands: `app/services/deploy_case_service.rb`, `app/services/customize_deployment_service.rb`.
- React component files use PascalCase `.jsx`: `app/javascript/Case.jsx`, `app/javascript/catalog/CatalogToolbar.jsx`, `app/javascript/utility/ErrorBoundary.jsx`.
- JavaScript utility modules use camelCase or descriptive lower-case names: `app/javascript/catalog/catalogData.js`, `app/javascript/shared/orchard.js`, `app/javascript/shared/routes.js`.
- Shakapacker React entrypoints use `.entry.jsx` for route apps: `app/javascript/packs/catalog.entry.jsx`, `app/javascript/packs/case.entry.jsx`, `app/javascript/packs/deployment.entry.jsx`.
- Stimulus controllers end in `_controller.js`: `app/javascript/controllers/case_stats_controller.js`, `app/javascript/controllers/deployments/invite_drawer_controller.js`.
- RSpec files end in `_spec.rb`; frontend tests are co-located under `__tests__` and usually end in `.test.js` or `.test.jsx`.

**Directories:**
- Rails resource directories use plural nouns for controllers/views and singular class files for models: `app/controllers/cases_controller.rb`, `app/views/cases`, `app/models/case.rb`.
- Namespaced route groups use matching directories under controllers, serializers, policies, views, and JavaScript when applicable: `app/controllers/catalog`, `app/views/catalog`, `app/javascript/catalog`.
- Frontend features live under domain folders in `app/javascript`: `app/javascript/catalog`, `app/javascript/deployment`, `app/javascript/edgenotes`, `app/javascript/stats`.
- Shared frontend code lives in `app/javascript/shared` or `app/javascript/utility`; avoid placing domain code there unless multiple features use it.

## Where to Add New Code

**New Rails Route Group:**
- Routes: `config/routes.rb`
- Controller: `app/controllers/<resource>_controller.rb` or a namespace under `app/controllers/<namespace>`
- Views: `app/views/<resource>`
- Policy: `app/policies/<resource>_policy.rb`
- Request/controller specs: `spec/requests` or `spec/controllers`

**New Case-Related Feature:**
- Domain model or concern: `app/models`, `app/models/concerns`, or the existing case namespaces under `app/models/case`
- Controller endpoints: `app/controllers/cases` for case-nested routes or `app/controllers/cases_controller.rb` for core case behavior
- Serializer fields: `app/serializers/case_serializer.rb` or `app/serializers/cases/show_serializer.rb`
- Frontend state/actions: `app/javascript/redux/actions`, `app/javascript/redux/reducers`
- React UI: existing feature folders under `app/javascript/overview`, `app/javascript/elements`, `app/javascript/card`, `app/javascript/edgenotes`, or `app/javascript/utility` for truly shared UI
- Tests: matching `spec/controllers/cases`, `spec/models/case`, `spec/services`, and co-located JS tests

**New Catalog Feature:**
- Rails endpoint: `app/controllers/catalog` or a top-level controller if the route is not catalog-namespaced
- Serializer: `app/serializers`
- React UI: `app/javascript/catalog/home`, `app/javascript/catalog/search_results`, or `app/javascript/catalog`
- Catalog data fetch/state: `app/javascript/catalog/catalogData.js` or `app/javascript/catalog/readerData.js`
- Tests: `spec/requests`, `spec/controllers`, and `app/javascript/catalog/__tests__`

**New React Island:**
- Pack entry: `app/javascript/packs/<feature>.entry.jsx`
- Mount view: route template under `app/views/<resource>`
- Pack loading: call `append_javascript_pack '<feature>'` from the view
- Shared provider/theme pattern: follow `app/javascript/packs/catalog.entry.jsx`, `app/javascript/packs/case.entry.jsx`, or `app/javascript/packs/deployment.entry.jsx`
- Avoid direct `javascript_pack_tag` calls in route views; use `app/helpers/application_helper.rb` collection helpers

**New Stimulus Enhancement:**
- Controller: `app/javascript/controllers/<name>_controller.js`
- Loader: no manual registration needed if it is under `app/javascript/controllers`, because `app/javascript/packs/controllers.js` loads the directory
- View hook: add data-controller attributes in the relevant `app/views` partial/template
- Tests: add JS tests under the closest `__tests__` folder or targeted browser/visual coverage when behavior is route-facing

**New Background Job:**
- Job: `app/jobs/<name>_job.rb`
- Queue choice: align with `config/sidekiq.yml`
- Trigger: model callback, controller, service object, or Rake task
- Tests: `spec/jobs/<name>_job_spec.rb`

**New Cross-Model Workflow:**
- Implementation: `app/services/<verb_or_domain>_service.rb`
- Controller usage: instantiate/call from `app/controllers`
- Tests: `spec/services/<verb_or_domain>_service_spec.rb`
- Keep ActiveRecord transaction ownership inside the service when the workflow spans multiple writes

**New API/JSON Contract:**
- Serializer: `app/serializers/<resource>_serializer.rb` or nested namespace serializer
- Controller render call: use `render json:` with serializer options in `app/controllers`
- Frontend consumer: `app/javascript/shared/orchard.js` consumers in the relevant feature folder
- Tests: serializer specs under `spec/serializers` and request/controller specs for response shape

**New Admin Resource:**
- Controller: `app/controllers/admin/<resources>_controller.rb`
- Dashboard: `app/dashboards/<resource>_dashboard.rb`
- Views/fields: `app/views/admin` or `app/fields` only when Administrate defaults are insufficient
- Authorization: keep editor gating in `app/controllers/admin/application_controller.rb`

**New Infrastructure Change:**
- SST resources: `infra/sst.config.ts`
- Deployment workflow inputs/steps: `.github/workflows/deploy.yml`
- Local/CI deploy behavior: `scripts/deploy-sst.sh`
- Runtime image changes: `Dockerfile`
- Operator docs: `docs/aws-production-operator-runbook.md` or another focused file under `docs`

**Utilities:**
- Shared Ruby view helpers: `app/helpers`
- Shared Ruby domain logic: prefer `app/services` or `app/models/concerns` over `lib` when it is app-domain behavior
- Rake/operator tasks: `lib/tasks`
- Shared frontend functions: `app/javascript/shared`
- Shared React UI/hooks: `app/javascript/utility`

## Special Directories

**`.planning`:**
- Purpose: GSD project metadata, roadmap, phase artifacts, research, and codebase map.
- Generated: Partly
- Committed: Yes

**`.planning/codebase`:**
- Purpose: Generated architecture, stack, convention, testing, integration, and concerns maps consumed by GSD planning/execution.
- Generated: Yes
- Committed: Yes

**`public/packs` and `public/packs-test`:**
- Purpose: Compiled Shakapacker assets for development/test or committed build artifacts when present.
- Generated: Yes
- Committed: Present in working tree; treat as generated build output.

**`storage`:**
- Purpose: Local ActiveStorage disk service files.
- Generated: Yes
- Committed: No for normal app data; existing local files should not guide code changes.

**`tmp` and `log`:**
- Purpose: Rails temporary files, caches, sockets, PID files, and logs.
- Generated: Yes
- Committed: No

**`infra/.sst`:**
- Purpose: SST generated state, outputs, and type/config artifacts.
- Generated: Yes
- Committed: No, except generated type references already represented by `infra/sst-env.d.ts`.

**`infra/node_modules` and `.pnpm-store`:**
- Purpose: Installed JavaScript dependencies and pnpm store.
- Generated: Yes
- Committed: No

**`.ruby-lsp`:**
- Purpose: Ruby LSP local dependency/index state.
- Generated: Yes
- Committed: No for operational output; do not treat as app source.

**`tests/visual/__screenshots__`:**
- Purpose: Playwright visual baseline screenshots.
- Generated: Yes
- Committed: Yes when baselines are intentionally updated.

**`db/sqldump`:**
- Purpose: Database dump artifacts used by deployment/seed workflows.
- Generated: Yes
- Committed: `db/sqldump/seed.dump` is deployment input and should be changed only intentionally.

**`.env` and `.env.dev`:**
- Purpose: Local environment configuration files.
- Generated: No
- Committed: Present in working tree listing; contents must not be read or quoted.

**`config/credentials.yml.enc`:**
- Purpose: Rails encrypted credentials.
- Generated: No
- Committed: Yes; do not decrypt or quote secret values in codebase docs.

---

*Structure analysis: 2026-05-30*
