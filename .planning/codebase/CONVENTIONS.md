# Coding Conventions

**Analysis Date:** 2026-04-22

## Naming Patterns

**Files:**
- Use Rails snake_case paths that mirror constants for Ruby code: `app/models/case.rb` defines `Case`, `app/controllers/cases/stats_controller.rb` defines `Cases::StatsController`, and `app/services/case_stats_service/query.rb` defines `CaseStatsService::Query`.
- Place Ruby specs under the matching `spec/` layer and end names with `_spec.rb`: `spec/models/case_spec.rb`, `spec/controllers/cases/stats_controller_spec.rb`, `spec/services/case_stats_service/query_spec.rb`, and `spec/policies/case_policy_spec.rb`.
- Use PascalCase `.jsx` files for React components: `app/javascript/stats/StatsPage.jsx`, `app/javascript/stats/StatsSummary.jsx`, `app/javascript/stats/map/MapContainer.jsx`, and `app/javascript/reading_list/HiddenFormInputs.jsx`.
- Use lower camelCase or framework snake_case `.js` names for JavaScript helpers, reducers, state modules, and Stimulus controllers: `app/javascript/stats/state/statsStore.js`, `app/javascript/shared/functions.js`, `app/javascript/redux/reducers/cards.js`, and `app/javascript/controllers/case_stats_controller.js`.
- Put Jest files in colocated `__tests__` directories and name them `.test.js` or `.test.jsx`: `app/javascript/stats/__tests__/StatsPage.test.jsx`, `app/javascript/stats/__tests__/statsStore.test.js`, `app/javascript/reading_list/__tests__/HiddenFormInputs.test.jsx`, and `app/javascript/shared/__tests__/functions.test.js`.
- Match each stylesheet directory's existing convention. Sprockets styles live under `app/assets/stylesheets/` with mixed `.sass`, `.scss`, and `.css` files such as `app/assets/stylesheets/Statistics.sass` and `app/assets/stylesheets/deployments.scss`; Webpacker styles live near JS such as `app/javascript/shared/blueprint.scss`.

**Functions:**
- Ruby methods use snake_case and Rails predicate suffixes. Examples include `Case#archive_needs_refresh?` in `app/models/case.rb`, `CasePolicy#stats?` in `app/policies/case_policy.rb`, and `ConfirmDeletionForm#needs_confirmation?` in `app/forms/confirm_deletion_form.rb`.
- Ruby service objects expose a small public API before `private`; keep parsing, SQL construction, and collaborator setup private, as in `app/services/case_stats_service.rb`.
- JavaScript functions use lower camelCase and the repository's StandardJS spacing before parentheses, for example `function buildValidatedRange (` and `export function selectIsLoading (` in `app/javascript/stats/state/statsStore.js`.
- React hooks use `use` prefixes and lower camelCase filenames when they are custom hooks: `app/javascript/utility/hooks/useToggle.js`, `app/javascript/utility/hooks/useElementSize.js`, and `app/javascript/utility/hooks/useDocumentTitle.js`.
- Stimulus controller methods use lifecycle and action names such as `connect`, `disconnect`, `subscribeToChannel`, `handleReceived`, and `mountStatsPage` in `app/javascript/controllers/case_stats_controller.js`.

**Variables:**
- Ruby locals and methods use snake_case. Use domain-safe alternatives like `kase` where `case` is reserved, matching `app/services/case_stats_service.rb`, `spec/services/case_stats_service/query_spec.rb`, and `spec/controllers/cases/stats_controller_spec.rb`.
- Controller instance variables are request/view state only, such as `@case`, `@enrollment`, `@group`, and `@deployment` in `app/controllers/cases_controller.rb`.
- JavaScript locals, props, and callbacks use lower camelCase, such as `initialState`, `hasMountedRef`, `dateRangeText`, `mockFetchStats`, and `mockFetchWithTimeout` in `app/javascript/stats/StatsPage.jsx` and `app/javascript/stats/__tests__/StatsPage.test.jsx`.
- JavaScript module constants use uppercase snake case when they are true constants, such as `EMPTY_SUMMARY` in `app/javascript/stats/state/statsStore.js` and `CACHE_LIMIT` in `app/javascript/stats/http/statsHttp.js`.

**Types:**
- Flow type aliases use PascalCase: `StatsState`, `StatsAction`, `StatsFetchStatus`, `StatsDateRangeParams`, and `Props` in `app/javascript/stats/state/statsStore.js` and `app/javascript/stats/StatsPage.jsx`.
- Redux-style Flow action types end with `Action`, such as `FetchStartedAction`, `FetchSucceededAction`, and `RetryRequestedAction` in `app/javascript/stats/state/statsStore.js`.
- Ruby constants use Rails PascalCase naming for each layer: `CaseStatsService`, `Cases::StatsSerializer`, `CasePolicy`, `CleanupLocksJob`, and `ConfirmDeletionForm`.

## Code Style

**Formatting:**
- Ruby files start with `# frozen_string_literal: true`, matching `app/models/case.rb`, `app/controllers/application_controller.rb`, `app/jobs/application_job.rb`, and `spec/rails_helper.rb`.
- Ruby formatting is governed by `.rubocop.yml` with `TargetRubyVersion: 3.2`. Follow its `Layout/ClassStructure` order: includes/extends, constants, associations/attributes/macros, class methods, initializer, public methods, protected methods, private methods.
- Models group declarations before behavior. `app/models/case.rb` orders `include`/`extend`, defaults/attributes, associations, attachments, callbacks, validations, delegation, scopes, class methods, public methods, then private behavior.
- RuboCop allows several project idioms: literal lambda style, rescue modifiers, non-ASCII comments, YAML load, and long spec blocks. These settings are in `.rubocop.yml`.
- JavaScript formatting is governed by `.prettierrc.json`: Flow parser, `printWidth: 80`, no semicolons, single quotes, and trailing commas for ES5-compatible multiline constructs.
- JavaScript linting in `.eslintrc.json` extends StandardJS, React, JSX accessibility, and Flow rules. Use object shorthand, multiline trailing commas, JSX props on separate lines when multiline, and valid `/* @flow */` or `/* @noflow */` file annotations.
- Stylesheet color format is checked by `stylelint.config.js`; use HSL color notation for new colors where practical.

**Linting:**
- Ruby linting uses `rubocop` from `Gemfile` and `.rubocop.yml`.
- JavaScript linting uses `eslint` with `babel-eslint`, `eslint-config-standard`, `eslint-plugin-react`, `eslint-plugin-jsx-a11y`, and `eslint-plugin-flowtype` from `package.json`.
- Flow is pinned to `0.87.0` in `.flowconfig` and `package.json`. The root frontend is Flow-typed JavaScript, not TypeScript.
- `.flowconfig` resolves modules from both `node_modules` and `app/javascript`, which supports imports such as `shared/orchard`, `redux/state`, and `utility/ErrorBoundary`.

## Import Organization

**Order:**
1. External packages first, such as `react`, `react-intl`, `stimulus`, `draft-js`, and `ramda` in `app/javascript/stats/StatsPage.jsx`, `app/javascript/controllers/case_stats_controller.js`, and `app/javascript/redux/reducers/cards.js`.
2. App-level alias imports next when they cross feature boundaries, such as `utility/ErrorBoundary`, `shared/orchard`, `draft/config`, and `redux/state`.
3. Same-feature relative imports follow, such as `./dateHelpers`, `./urlParams`, `./http/statsHttp`, `./state/statsStore`, and `./StatsSummary` in `app/javascript/stats/StatsPage.jsx`.
4. Flow `import type` declarations are separated from value imports, as in `app/javascript/stats/state/statsStore.js` and `app/javascript/redux/reducers/cards.js`.

**Path Aliases:**
- Prefer existing `app/javascript` module aliases for shared frontend modules: `shared/orchard`, `redux/state`, `draft/config`, and `utility/ErrorBoundary`.
- Use relative imports inside a feature directory when the dependency is local to that feature, such as `../http/statsResponse` in `app/javascript/stats/__tests__/statsResponse.test.js`.
- Webpacker supports YAML and raw SVG imports through `config/webpack/environment.js`; do not replace those imports with ad hoc loaders.
- Do not introduce TypeScript syntax or `.ts` files in the app root; frontend source uses Flow annotations or `/* @noflow */`.

## Error Handling

**Patterns:**
- Centralize authorization failures in `ApplicationController` with `rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized` in `app/controllers/application_controller.rb`.
- Controller actions return explicit Rails responses with `render`, `redirect_to`, `head`, or `send_data`. Examples include JSON validation errors in `app/controllers/cases_controller.rb`, forbidden JSON responses in `app/controllers/application_controller.rb`, and lock conflicts in `app/controllers/locks_controller.rb`.
- Services should rescue narrow expected errors and keep callers on a stable contract. `CaseStatsService#parse_date` rescues `ArgumentError` and returns `nil` in `app/services/case_stats_service.rb`.
- Jobs should use ActiveJob retry/discard declarations for infrastructure failures. `app/jobs/application_job.rb` uses `retry_on Redis::ConnectionError`, `retry_on ActiveRecord::Deadlocked`, `retry_on StandardError`, and `discard_on ActiveJob::DeserializationError`.
- Operational cleanup that must continue across records may rescue locally and log context, as `CleanupLocksJob#unlock_single_resource` does in `app/jobs/cleanup_locks_job.rb`.
- Frontend async code catches expected failures, logs context, and updates state instead of leaving pending UI. `app/javascript/stats/StatsPage.jsx` ignores `AbortError`, logs fetch failures, and dispatches `fetch/failed`; `app/javascript/controllers/case_stats_controller.js` logs stats overview and mount failures.
- Use React `ErrorBoundary` around mount points that can fail independently, as in `app/javascript/stats/StatsPage.jsx` and `app/javascript/controllers/case_stats_controller.js`.

## Logging

**Framework:** Rails logger, browser console, and Sentry

**Patterns:**
- Attach request and user context to Sentry in `ApplicationController#set_sentry_context` at `app/controllers/application_controller.rb`.
- Use `Rails.logger.info`, `Rails.logger.warn`, or `Rails.logger.error` for server-side operational messages. Examples include invalid LTI requests in `app/controllers/application_controller.rb`, Wikidata failures in `app/services/wikidata.rb`, PDF failures in `app/models/case/pdf.rb`, and lock cleanup failures in `app/jobs/cleanup_locks_job.rb`.
- Use `Sentry.capture_message` for explicit server-side diagnostic snapshots, as in `app/services/memory_profile_logger.rb`.
- Use browser `console.error` sparingly for recoverable async failures in frontend integration points, such as `app/javascript/stats/StatsPage.jsx` and `app/javascript/controllers/case_stats_controller.js`.

## Comments

**When to Comment:**
- Comment domain behavior, non-obvious SQL, protocol integrations, cache behavior, and framework wiring. Examples include the `Case` attribute documentation in `app/models/case.rb`, the SQL-subquery note in `app/policies/case_policy.rb`, and the Stimulus mount explanation in `app/javascript/controllers/case_stats_controller.js`.
- Keep comments close to the behavior they explain and avoid restating syntax. The `NOTE: position is 1-indexed!` comment in `app/javascript/redux/reducers/cards.js` is a good concise invariant comment.
- Use comments to document intentional compatibility or framework constraints, such as `/* @noflow */` in `jest.config.js` and Jest specs that are intentionally not Flow-checked.

**JSDoc/TSDoc:**
- JavaScript uses Flow types instead of TSDoc. Put contracts in `type` aliases, exported Flow types, or `declare class` blocks, as in `app/javascript/stats/StatsPage.jsx`, `app/javascript/stats/state/statsStore.js`, and `app/javascript/stats/http/statsHttp.js`.
- Ruby uses YARD-style comments in domain-heavy classes and services. `app/models/case.rb` documents attributes with `@attr`, and `app/services/case_stats_service.rb` documents params, returns, and examples.

## Function Design

**Size:** Prefer small public methods with private helpers for parsing, normalization, and side effects.
- `app/services/case_stats_service.rb` exposes date range, cache key, aggregate readers, and API formatting methods while keeping date parsing and query construction private.
- `app/services/case_stats_service/query.rb` isolates raw SQL execution and binding construction inside a nested query object.
- `app/controllers/cases_controller.rb` keeps request actions short and moves lookup and strong-parameter logic to private methods.
- `app/javascript/stats/StatsPage.jsx` delegates state transitions and selectors to `app/javascript/stats/state/statsStore.js` and HTTP behavior to `app/javascript/stats/http/statsHttp.js`.

**Parameters:** Use keyword arguments and explicit object contracts when options matter.
- Ruby services use keyword options, such as `CaseStatsService.new(kase, from: '2024-01-01', to: '2024-12-31')` in `app/services/case_stats_service.rb`.
- Rails controller parameter whitelists live in private methods, such as `create_case_params` and `update_case_params` in `app/controllers/cases_controller.rb`.
- React components use Flow `Props` objects, such as `{ dataUrl: string, minDate: ?string, intl: any }` in `app/javascript/stats/StatsPage.jsx`.
- FactoryBot transient attributes model optional setup counts, as in `spec/factories/cases.rb`.

**Return Values:** Return stable booleans, hashes, arrays, relations, or React nodes that match caller needs.
- Policies return booleans and scope relations, as in `app/policies/application_policy.rb` and `app/policies/case_policy.rb`.
- Services return stable hashes and arrays with named keys, such as `country_stats`, `api_data`, and `date_range` in `app/services/case_stats_service.rb`.
- Selectors return derived state without mutation, such as `selectCountries`, `selectSummary`, `selectError`, and `selectHasData` in `app/javascript/stats/state/statsStore.js`.

## Module Design

**Exports:** Match existing local patterns.
- Ruby service classes live under `app/services/`. Use subdirectories for nested collaborators when a service has separable responsibilities, as with `app/services/case_stats_service.rb`, `app/services/case_stats_service/query.rb`, and `app/services/case_stats_service/formatter.rb`.
- Rails concerns live under `app/models/concerns/` or `app/controllers/concerns/`, extend `ActiveSupport::Concern`, and are included by concrete classes. `app/models/concerns/lockable.rb` is the model pattern.
- React components usually default-export the component or wrapped component, such as `export default injectIntl(StatsPage)` in `app/javascript/stats/StatsPage.jsx`.
- JavaScript utility/state modules use named exports for independently testable helpers and selectors, such as `buildValidatedRange`, `createInitialState`, and `statsReducer` in `app/javascript/stats/state/statsStore.js`.
- Redux reducers default-export the reducer and keep local helper functions private unless they are shared, as in `app/javascript/redux/reducers/cards.js`.

**Barrel Files:** Use only feature-local barrels.
- `index.jsx` files act as feature entry points or aggregate exports inside feature folders, such as `app/javascript/conversation/index.jsx`, `app/javascript/deployment/index.jsx`, `app/javascript/card/index.jsx`, and `app/javascript/edgenotes/index.jsx`.
- Avoid broad root-level barrels; imports rely on explicit `app/javascript` aliases and local feature paths.

**View and CSS Conventions:**
- Rails views use the template style already present in the target directory. Stats views use ERB under `app/views/cases/stats/`; many legacy Rails views use Haml in directories such as `app/views/deployments/`.
- Stimulus controller names derive from snake_case files as kebab-case data-controller values. `app/javascript/controllers/case_stats_controller.js` maps to `data-controller="case-stats"`.
- CSS class names are mostly component-prefixed and BEM-like, with Blueprint classes used where Blueprint components are present. Follow examples such as `c-stats-map-table__heading`, `c-stats-map-container--min`, `deployment__invite__drawer`, and `pt-card` in `app/assets/stylesheets/Statistics.sass`, `app/assets/stylesheets/deployments.scss`, and `app/javascript/stats/StatsPage.jsx`.

---

*Convention analysis: 2026-04-22*
