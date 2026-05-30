# Coding Conventions

**Analysis Date:** 2026-05-30

## Naming Patterns

**Files:**
- Ruby files use `snake_case.rb` and Rails autoloading. Put `CaseStatsService::Query` in `app/services/case_stats_service/query.rb`, `Cases::StatsSerializer` in `app/serializers/cases/stats_serializer.rb`, and `RepliesMailbox` in `app/mailboxes/replies_mailbox.rb`.
- Rails specs mirror the implementation path with `_spec.rb`: `app/services/case_stats_service.rb` maps to `spec/services/case_stats_service_spec.rb`; `app/policies/case_policy.rb` maps to `spec/policies/case_policy_spec.rb`.
- React components use `PascalCase.jsx`: `app/javascript/stats/StatsPage.jsx`, `app/javascript/reading_list/HiddenFormInputs.jsx`, and `app/javascript/utility/ErrorBoundary.jsx`.
- JavaScript helper modules use `camelCase.js` or domain names: `app/javascript/stats/http/statsHttp.js`, `app/javascript/stats/state/statsStore.js`, `app/javascript/shared/orchard.js`.
- Stimulus controllers use `snake_case_controller.js`: `app/javascript/controllers/clipboard_controller.js`, `app/javascript/controllers/case_stats_controller.js`, and `app/javascript/controllers/deployments/invite_drawer_controller.js`.
- Frontend tests live in colocated `__tests__` directories with `.test.js` or `.test.jsx`: `app/javascript/shared/__tests__/orchard.test.js`, `app/javascript/stats/__tests__/StatsPage.test.jsx`.
- Infrastructure TypeScript is isolated in `infra/` and uses `.ts` files such as `infra/sst.config.ts`; app code under `app/javascript/` remains JavaScript/JSX.

**Functions:**
- Ruby methods use `snake_case`, including predicate methods such as `archive_needs_refresh?` in `app/models/case.rb` and policy predicates such as `show?`, `update?`, and `stats?` in `app/policies/case_policy.rb`.
- JavaScript functions and hooks use lower camel case: `fetchStats`, `fetchWithTimeout`, `buildValidatedRange`, `selectCountries`, and `useDocumentTitle` in `app/javascript/stats/http/statsHttp.js`, `app/javascript/stats/state/statsStore.js`, and `app/javascript/utility/hooks/useDocumentTitle.js`.
- React components use PascalCase function or class names: `StatsPage` in `app/javascript/stats/StatsPage.jsx`, `HiddenFormInputs` in `app/javascript/reading_list/HiddenFormInputs.jsx`, and `ErrorBoundary` in `app/javascript/utility/ErrorBoundary.jsx`.
- Redux action creators use lower camel case and return plain actions or thunks: `updateCase`, `togglePublished`, and `enrollReader` in `app/javascript/redux/actions/case.js`.

**Variables:**
- Ruby locals and instance variables use `snake_case`: `from_date`, `to_date`, `time_range`, and `@country_stats` in `app/services/case_stats_service.rb`.
- Rails controllers use conventional instance variables for view/serializer state: `@case`, `@deployment`, and `@enrollment` in `app/controllers/cases_controller.rb`.
- JavaScript variables and props use lower camel case: `dataUrl`, `minDate`, `hasMountedRef`, `dateRangeText`, and `calendarMinDate` in `app/javascript/stats/StatsPage.jsx`.
- Constants use screaming snake case in JavaScript and Ruby when they are module-level configuration: `CACHE_LIMIT` in `app/javascript/stats/http/statsHttp.js`, `COUNTRY_STATS_SQL` in `app/services/case_stats_service/query.rb`, and `CASE_EAGER_LOADING_CONFIG` in `app/controllers/cases_controller.rb`.
- Redux action type strings use both existing all-caps names (`UPDATE_CASE` in `app/javascript/redux/actions/case.js`) and domain/action names (`fetch/started` in `app/javascript/stats/state/statsStore.js`). Match the local reducer/action family instead of mixing styles.

**Types:**
- Ruby classes and modules use CamelCase and Rails namespaces: `ApplicationPolicy` in `app/policies/application_policy.rb`, `CasePolicy::Scope` in `app/policies/case_policy.rb`, `Cases::StatsSerializer` in `app/serializers/cases/stats_serializer.rb`.
- JavaScript application code does not enforce TypeScript types. `tsconfig.json` enables `allowJs`, disables `checkJs`, and sets `strict` to `false`.
- TypeScript types are limited to infrastructure code in `infra/sst.config.ts` and `infra/sst-env.d.ts`; keep SST-specific typing in `infra/`.

## Code Style

**Formatting:**
- Ruby files start with `# frozen_string_literal: true`; follow this in new Ruby files under `app/`, `lib/`, `config/`, and `spec/`.
- Ruby uses two-space indentation, Rails keyword arguments, and multiline method calls for readability, as in `app/controllers/cases_controller.rb` and `app/services/case_stats_service/query.rb`.
- RuboCop configuration lives in `.rubocop.yml`. It sets `TargetRubyVersion: 3.2`, disables several style cops, excludes `spec/**/*` from `Metrics/BlockLength`, and enables `Layout/ClassStructure`.
- Rails class bodies should follow the `.rubocop.yml` class structure order: module inclusion, constants, attributes, associations, validations, hooks, class methods, initializer, public methods, protected methods, private methods.
- JavaScript app formatting follows `.prettierrc.json`: `printWidth: 80`, `semi: false`, `singleQuote: true`, `trailingComma: es5`, and `parser: flow`.
- App JavaScript uses the StandardJS no-semicolon style configured in `.eslintrc.json`; preserve the existing extra blank-line spacing around imports and major local sections when touching nearby files.
- Infrastructure TypeScript in `infra/sst.config.ts` uses a separate style with double quotes and semicolons. Match the file-local TypeScript/SST style inside `infra/`, not the app JavaScript style.
- CSS and SCSS live in `app/assets/stylesheets/` and `app/javascript/shared/`. `stylelint.config.js` enforces HSL color formatting through `stylelint-color-format`.

**Linting:**
- Ruby linting is configured by `.rubocop.yml`; run RuboCop directly with `bundle exec rubocop` when changing Ruby style-sensitive code.
- JavaScript linting is configured by `.eslintrc.json` with `babel-eslint`, `standard`, `plugin:react/recommended`, and `plugin:jsx-a11y/recommended`.
- `.eslintignore` ignores `flow-typed/*`; no package script wraps ESLint in `package.json`.
- Prettier is configured in `.prettierrc.json`; no package script wraps Prettier in `package.json`.
- TypeScript configuration for app JavaScript is in `tsconfig.json`; it is a no-emit project used for compatibility checking, not strict typing.

## Import Organization

**Order:**
1. Third-party packages first: React, Blueprint, Ramda, Redux, React Intl, DraftJS, and styled-components. Examples: `app/javascript/stats/StatsPage.jsx`, `app/javascript/conversation/SelectedCommentThread.jsx`.
2. App-level absolute imports from the `app/javascript` root next, using paths such as `utility/ErrorBoundary`, `shared/orchard`, `redux/actions`, and `conversation/Response`.
3. Relative imports from the local feature directory last, such as `./dateHelpers`, `./http/statsHttp`, and `./state/statsStore` in `app/javascript/stats/StatsPage.jsx`.
4. Component imports generally follow helper imports inside a file, as in `app/javascript/stats/StatsPage.jsx`.

**Path Aliases:**
- `jest.config.js` sets `modulePaths: ['<rootDir>/app/javascript']`; tests can import from app-root aliases such as `utility/ErrorBoundary` and `shared/orchard`.
- Shakapacker resolves modules from `app/javascript`; production code uses app-root aliases such as `overview/CommunityChooser`, `conversation/CommentThreadItem`, and `utility/ScrollView`.
- Relative imports are preferred for same-folder helpers, especially in newer feature directories such as `app/javascript/stats/`.
- Ruby uses Rails autoloading; do not add manual `require` calls for app classes unless the code is outside Rails autoload paths. Examples of explicit external requires are `require 'sieve'` in `app/controllers/application_controller.rb` and `require 'cgi'` / `require 'uri'` in `spec/support/integration/lti_launch.rb`.

## Error Handling

**Patterns:**
- Rails authorization errors are centralized in `ApplicationController` through `rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized` in `app/controllers/application_controller.rb`.
- Controllers should return the existing Rails response shape for failed writes: render validation errors as JSON with `status: :unprocessable_entity`, as in `app/controllers/cases_controller.rb`.
- Services that intentionally return invalid records follow the `CustomizeDeploymentService#customize` pattern in `app/services/customize_deployment_service.rb`: wrap writes in `ActiveRecord::Base.transaction`, use bang saves, rescue `ActiveRecord::RecordInvalid`, and return `e.record`.
- Jobs should isolate per-record failures and log through `Rails.logger`, as `CleanupLocksJob#unlock_single_resource` does in `app/jobs/cleanup_locks_job.rb`.
- JavaScript API failures flow through `OrchardError` and `OrchardInputError` in `app/javascript/shared/orchard.js`; use `handleResponse` for fetch response parsing instead of duplicating status handling.
- React UI errors should be caught with `ErrorBoundary` from `app/javascript/utility/ErrorBoundary.jsx`, which reports to Sentry when available.
- Async React flows should handle aborts and network failures explicitly. `app/javascript/stats/StatsPage.jsx` ignores `AbortError`, logs real fetch errors with `console.error`, stores an `Error`, and renders `StatsErrorState`.

## Logging

**Framework:** Rails logger, Sentry, and limited browser console logging.

**Patterns:**
- Server-side operational messages use `Rails.logger` in files such as `app/jobs/cleanup_locks_job.rb`, `app/services/wikidata.rb`, `config/initializers/rack_attack.rb`, and `config/initializers/sentry.rb`.
- Sentry context is set per request in `ApplicationController#set_sentry_context` in `app/controllers/application_controller.rb`; do not duplicate user/context setup in individual controllers.
- React runtime exceptions are reported in `app/javascript/utility/ErrorBoundary.jsx` through `sentryLog` and `Sentry.captureException` when those globals exist.
- Browser logging should be reserved for actionable error paths. Existing diagnostic `console.log` calls appear in `app/javascript/wikidata/SearchWikidata.jsx` and `app/javascript/wikidata/SortableWikidataList.jsx`; prefer structured UI error state or Sentry for new code.

## Comments

**When to Comment:**
- Use short comments for domain rules, compatibility constraints, or non-obvious framework behavior. Good examples are `CASE_EAGER_LOADING_CONFIG` context in `app/controllers/cases_controller.rb`, Blueprint namespace bridge notes in `app/javascript/shared/blueprintLegacyNamespace.js`, and PDFKit URL comments in `spec/models/case/pdf_spec.rb`.
- Avoid comments that restate the method name. Prefer extraction to comments for simple procedural steps.
- Keep route annotations where they already exist on controller actions, such as `# @route [GET]` comments in `app/controllers/cases_controller.rb` and `app/mailboxes/replies_mailbox.rb`.

**JSDoc/TSDoc:**
- Ruby public APIs often use YARD comments, especially model/service boundaries: `app/models/case.rb`, `app/services/case_stats_service.rb`, and `app/serializers/cases/stats_serializer.rb`.
- JavaScript files contain sparse block headers and some `@providesModule` comments, for example `app/javascript/reading_list/HiddenFormInputs.jsx` and `app/javascript/shared/orchard.js`. Preserve nearby headers when editing, but do not add new empty documentation blocks.
- Infrastructure TypeScript in `infra/sst.config.ts` uses inline comments to document deployment and resource-retention constraints.

## Function Design

**Size:** Keep public methods small and push details into private helpers.
- Service objects expose a narrow public API and private helper methods. Follow `CaseStatsService` in `app/services/case_stats_service.rb`: public query/format methods call private `query`, `parse_date`, and `time_range` helpers.
- Controllers should keep request orchestration in actions and move repeated setup into private methods such as `set_case`, `slug`, `set_group_and_deployment`, and strong parameter methods in `app/controllers/cases_controller.rb`.
- Reducers should use switch statements and pure state transitions, as in `app/javascript/stats/state/statsStore.js` and `app/javascript/redux/reducers/cards.js`.

**Parameters:**
- Ruby services prefer explicit constructor arguments plus keyword options: `CaseStatsService.new(kase, from: nil, to: nil)` in `app/services/case_stats_service.rb`.
- Rails strong params should stay private and close to the controller action, as `create_case_params` and `update_case_params` do in `app/controllers/cases_controller.rb`.
- React components destructure props at the function boundary: `StatsPage ({ dataUrl, minDate, intl })` in `app/javascript/stats/StatsPage.jsx` and `HiddenFormInputs ({ initialItems, items })` in `app/javascript/reading_list/HiddenFormInputs.jsx`.
- JavaScript functions with multiple related options should accept an object, as `fetchStats({ dataUrl, params, signal, bypassCache })` does in `app/javascript/stats/http/statsHttp.js`.

**Return Values:**
- Rails controller actions return redirects, renders, or `head` responses; preserve response shapes tested by request specs under `spec/requests/`.
- Service methods return domain objects or simple hashes/arrays. Examples: `CustomizeDeploymentService#customize` returns a `Deployment` or invalid `Quiz` in `app/services/customize_deployment_service.rb`; `CaseStatsService#country_stats` returns a hash in `app/services/case_stats_service.rb`.
- JavaScript selectors return derived values and safe defaults: `selectCountries`, `selectSummary`, and `selectHasData` in `app/javascript/stats/state/statsStore.js`.
- API helpers should throw typed errors instead of returning mixed success/error tuples. Follow `OrchardError` / `OrchardInputError` in `app/javascript/shared/orchard.js`.

## Module Design

**Exports:**
- Rails files should define one primary class/module that matches the path. Use nested classes when the namespace is tightly owned, such as `CaseStatsService::Query` in `app/services/case_stats_service/query.rb`.
- React component files normally default-export the connected/injected component: `app/javascript/stats/StatsPage.jsx`, `app/javascript/conversation/SelectedCommentThread.jsx`, and `app/javascript/utility/ErrorBoundary.jsx`.
- Pure JavaScript helper modules should use named exports for testable units: `app/javascript/shared/functions.js`, `app/javascript/shared/routes.js`, `app/javascript/stats/http/statsHttp.js`, and `app/javascript/stats/state/statsStore.js`.
- Redux reducers default-export reducer functions, as in `app/javascript/redux/reducers/cards.js`; action modules named-export action creators, as in `app/javascript/redux/actions/case.js`.
- Side-effect modules should keep side effects obvious at the bottom of the file, as `app/javascript/shared/blueprintLegacyNamespace.js` does with DOM startup logic.

**Barrel Files:**
- Existing barrel files are used for established shared areas: `app/javascript/redux/actions/index.js` re-exports Redux action modules, and `app/javascript/utility/hooks/index.js` re-exports hook helpers.
- Add to a barrel only when the local package already imports through that barrel. Do not introduce a new barrel for one or two files.
- Rails concerns belong under `app/controllers/concerns/` or `app/models/concerns/`; include them from the owning class as `ApplicationController` and `Case` do in `app/controllers/application_controller.rb` and `app/models/case.rb`.

---

*Convention analysis: 2026-05-30*
