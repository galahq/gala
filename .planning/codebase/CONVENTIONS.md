# Coding Conventions

**Analysis Date:** 2026-05-03

## Naming Patterns

**Files:**
- Ruby application files use Rails snake_case conventions matching class names: `app/models/case.rb` defines `Case`, `app/services/case_stats_service.rb` defines `CaseStatsService`, and `app/controllers/application_controller.rb` defines `ApplicationController`.
- Ruby specs use `*_spec.rb` under type-specific `spec/` directories: `spec/services/case_stats_service/query_spec.rb`, `spec/controllers/cases/stats_controller_spec.rb`, and `spec/models/case/pdf_spec.rb`.
- JavaScript and React files use PascalCase for components and camelCase for plain modules: `app/javascript/stats/StatsPage.jsx`, `app/javascript/utility/ErrorBoundary.jsx`, `app/javascript/stats/state/statsStore.js`, and `app/javascript/stats/dateHelpers.js`.
- Frontend tests live under `__tests__/` and use `.test.js` or `.test.jsx`: `app/javascript/stats/__tests__/StatsPage.test.jsx` and `app/javascript/shared/__tests__/functions.test.js`.
- Flow type stubs live under `flow-typed/`, and source files should keep `/* @flow */` or `/* @noflow */` annotations consistent with `.eslintrc.json`.

**Functions:**
- Ruby methods use snake_case and clear predicate/bang suffixes: `Case#archive_needs_refresh?`, `Case#refresh_archive!`, `ApplicationController#set_locale`, and `CaseStatsService#country_stats`.
- Ruby class methods use `self.method_name`: `Case.with_locale_or_fallback` in `app/models/case.rb`.
- JavaScript functions use camelCase: `renderPage`, `flushPromises`, `buildValidatedRange`, `createInitialState`, `selectDateRangeParams`, and `statsReducer`.
- React component functions and classes use PascalCase: `StatsPage` in `app/javascript/stats/StatsPage.jsx`, `ErrorBoundary` and `InfoBox` in `app/javascript/utility/ErrorBoundary.jsx`.

**Variables:**
- Ruby local variables and ivars use snake_case: `from_date`, `to_date`, `time_range`, `@country_stats`, and `@cache_key` in `app/services/case_stats_service.rb`.
- Ruby domain variables often use `kase` when referring to the `Case` model to avoid the reserved word: `let(:kase)` in `spec/services/case_stats_service/query_spec.rb` and `attr_reader :kase` in `app/services/case_stats_service.rb`.
- JavaScript locals, props, and selectors use camelCase: `dataUrl`, `minDate`, `mockFetchStats`, `dateRangeText`, `hasMountedRef`, and `selectIsInitialLoad`.
- JavaScript constants use SCREAMING_SNAKE_CASE when representing module-level constants: `EMPTY_SUMMARY` in `app/javascript/stats/state/statsStore.js`.

**Types:**
- Ruby classes/modules use PascalCase and Rails namespaces: `CaseStatsService::Query`, `ApplicationController`, `Ahoy::Store`, and `Orchard::Integration::TestHelpers::Authentication`.
- Flow types use PascalCase and are exported from dedicated state/type modules: `StatsState`, `StatsAction`, `StatsDateRange`, and `StatsSummary` in `app/javascript/stats/state/statsStore.js` and `app/javascript/stats/state/types.js`.
- React props types are named `Props` locally when scoped to a component, as in `app/javascript/stats/StatsPage.jsx`.

## Code Style

**Formatting:**
- JavaScript formatting uses Prettier via `.prettierrc.json`.
- Use 80-column print width, Flow parser, no semicolons, single quotes, and ES5 trailing commas as configured in `.prettierrc.json`.
- Ruby files consistently start with `# frozen_string_literal: true`, as shown in `app/models/case.rb`, `spec/rails_helper.rb`, and `spec/services/case_stats_service/query_spec.rb`.
- Ruby style follows standard Rails formatting plus RuboCop. Long Rails calls are wrapped with aligned continuations, as in `app/models/case.rb` validations and `app/controllers/application_controller.rb` redirects.
- CSS linting uses `stylelint.config.js`; colors should be expressed in HSL format under the `stylelint-color-format` rule.

**Linting:**
- Ruby linting uses RuboCop configured in `.rubocop.yml`.
- `.rubocop.yml` targets Ruby 3.2 and enables `Layout/ClassStructure`; model and service classes should order module inclusion, constants, associations, validations, public class methods, initializers, public methods, protected methods, and private methods in that sequence.
- `.rubocop.yml` excludes `spec/**/*` from `Metrics/BlockLength`, so long spec contexts are acceptable when they preserve readable scenario grouping.
- JavaScript linting uses ESLint configured in `.eslintrc.json` with `babel-eslint`, `standard`, `plugin:react/recommended`, `plugin:jsx-a11y/recommended`, and `plugin:flowtype/recommended`.
- ESLint requires Flow annotations in source files through `flowtype/require-valid-file-annotation`; use `/* @flow */` for checked files and `/* @noflow */` only where needed, as in `jest.config.js` and `app/javascript/stats/__tests__/StatsPage.test.jsx`.
- JSX props should be sorted with shorthand props first and callbacks last per `react/jsx-sort-props`; multiline JSX should place one prop per line per `react/jsx-max-props-per-line`.

## Import Organization

**Order:**
1. Third-party imports first: `React`, `react-intl`, `styled-components`, `@blueprintjs/core`, and testing libraries.
2. Absolute app imports next using `app/javascript` module paths: `utility/ErrorBoundary`, `redux/actions`, `conversation/CommentThreadItem`, and `shared/Identicon`.
3. Relative feature imports next: `./dateHelpers`, `./urlParams`, `./state/statsStore`, and `../http/statsHttp`.
4. Flow `import type` declarations appear after runtime imports in many frontend modules, as in `app/javascript/stats/state/statsStore.js` and `app/javascript/conversation/RecentCommentThreads.jsx`.

**Path Aliases:**
- Jest and runtime module resolution use `app/javascript` as an absolute module root via `modulePaths` in `jest.config.js`.
- Prefer existing absolute frontend imports for shared modules: `utility/ErrorBoundary`, `redux/actions`, `shared/spotlight`, and `overview/CommunityChooser`.
- Use relative imports inside tightly scoped feature subtrees: `./map/MapContainer`, `./StatsTable`, and `../dateHelpers` under `app/javascript/stats/`.

## Error Handling

**Patterns:**
- Rails controllers centralize authorization failures with `rescue_from Pundit::NotAuthorizedError` in `app/controllers/application_controller.rb`; new controller authorization errors should use this path instead of ad hoc redirects.
- Rails actions and services rescue specific exception classes where possible: `ActiveRecord::RecordNotFound` in `app/channels/edits_channel.rb`, `ActiveRecord::RecordInvalid` in `app/services/quiz_updater.rb`, and `ArgumentError` in `app/services/case_stats_service.rb`.
- Service objects should return safe fallback values for invalid user input when the domain supports it; `CaseStatsService#parse_date` returns `nil` for invalid ISO8601 date strings in `app/services/case_stats_service.rb`.
- External service code logs and re-raises when callers need failure visibility, as in `app/services/wikidata.rb`.
- React async flows should catch errors, ignore aborts explicitly, log useful context, and store an `Error` object in state, as in `app/javascript/stats/StatsPage.jsx`.
- React rendering failures should be contained with `ErrorBoundary` from `app/javascript/utility/ErrorBoundary.jsx`, which reports to `sentryLog` and browser `Sentry` when available.

## Logging

**Framework:** Rails logger, browser console, and Sentry.

**Patterns:**
- Use `Rails.logger` for backend operational events and failures: `Rails.logger.info` in `app/controllers/application_controller.rb`, `Rails.logger.warn` in `config/initializers/rack_attack.rb`, and `Rails.logger.error` in `app/jobs/cleanup_locks_job.rb`.
- Sentry backend context is set in `ApplicationController#set_sentry_context` in `app/controllers/application_controller.rb`; request-scoped metadata should be added there or in similarly scoped code.
- Sentry initialization lives in `config/initializers/sentry.rb`; do not initialize Sentry in feature code.
- Frontend code uses `console.error` and `console.warn` for local diagnostics where user-facing recovery exists, such as `app/javascript/stats/StatsPage.jsx` and `app/javascript/stats/map/MapContainer.jsx`.
- Avoid leaving raw `console.log` in new frontend code; existing examples in `app/javascript/wikidata/SearchWikidata.jsx` and `app/javascript/wikidata/SortableWikidataList.jsx` are not the preferred pattern for new work.

## Comments

**When to Comment:**
- Use YARD-style comments for important Ruby domain models and public service APIs, as in `app/models/case.rb` and `app/services/case_stats_service.rb`.
- Use comments to explain domain constraints or compatibility reasons, not restate code. Examples include the universal community forum note in `Case#create_forum_for_universal_communities` and the `Lockable` compatibility note in `app/models/case.rb`.
- Keep test comments focused on scenario setup that would otherwise be surprising, as in `spec/services/quiz_updater_spec.rb`.

**JSDoc/TSDoc:**
- JavaScript does not use broad JSDoc. Prefer Flow type annotations and exported type definitions, as in `app/javascript/stats/state/statsStore.js`.
- File-level pragmas are important in JS: use `/* @flow */`, `/* @noflow */`, and special pragmas such as `/** @jsx React.createElement */` only when required by the file.

## Function Design

**Size:** Ruby methods should stay focused and small, with private helpers for parsing and query construction as in `app/services/case_stats_service.rb`. React components may be larger when they coordinate state/effects, but extract reducers, selectors, HTTP helpers, and display components into sibling modules like `app/javascript/stats/state/statsStore.js`, `app/javascript/stats/http/statsHttp.js`, and `app/javascript/stats/StatsSummary.jsx`.

**Parameters:** Ruby service objects should accept domain objects positionally and options by keyword, as in `CaseStatsService.new(kase, from: nil, to: nil)`. JavaScript components should destructure props in the function signature and annotate with Flow, as in `function StatsPage ({ dataUrl, minDate, intl }: Props): React$Node`.

**Return Values:** Use explicit domain-shaped returns. Ruby service methods return hashes and arrays with stable keys, such as `CaseStatsService#date_range`, `#stats_rows`, and `#api_data`. JS selectors return typed primitives or safe defaults, such as `selectCountries`, `selectSummary`, and `selectError` in `app/javascript/stats/state/statsStore.js`.

## Module Design

**Exports:** Prefer one default export for React components and named exports for pure helpers, reducers, selectors, and data functions. Examples: default `StatsPage` in `app/javascript/stats/StatsPage.jsx`; named `buildValidatedRange`, `createInitialState`, `statsReducer`, and selectors in `app/javascript/stats/state/statsStore.js`.

**Barrel Files:** Barrel/index files exist for feature entry points and package-style modules, such as `app/javascript/edgenotes/expansion/index.jsx`, `app/javascript/shared/spotlight/index.jsx`, and `app/javascript/redux/actions/index.js`. Add barrel exports only when a directory already uses an index entry point or when the module is intended as a public feature boundary.

---

*Convention analysis: 2026-05-03*
