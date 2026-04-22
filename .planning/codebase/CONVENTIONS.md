# Coding Conventions

**Analysis Date:** 2026-04-22

## Naming Patterns

**Files:**
- Ruby files use Rails snake_case paths that mirror constants. Use `app/models/case.rb` for `Case`, `app/controllers/cases/stats_controller.rb` for `Cases::StatsController`, and `app/services/case_stats_service/query.rb` for `CaseStatsService::Query`.
- Specs mirror app paths and end in `_spec.rb`. Use `spec/models/case_spec.rb`, `spec/controllers/cases/stats_controller_spec.rb`, and `spec/services/case_stats_service_spec.rb`.
- React component files use PascalCase `.jsx` names such as `app/javascript/stats/StatsPage.jsx`, `app/javascript/stats/StatsSummary.jsx`, and `app/javascript/reading_list/HiddenFormInputs.jsx`.
- JavaScript helpers, reducers, controllers, and state modules use lower camelCase or snake_case names according to local framework conventions: `app/javascript/stats/state/statsStore.js`, `app/javascript/shared/functions.js`, and `app/javascript/controllers/case_stats_controller.js`.
- Jest files live in `__tests__` directories and use `.test.js` or `.test.jsx`: `app/javascript/stats/__tests__/StatsPage.test.jsx` and `app/javascript/shared/__tests__/functions.test.js`.
- Stylesheets are split between feature/component names and Rails asset conventions: `app/assets/stylesheets/Statistics.sass`, `app/assets/stylesheets/deployments.scss`, and `app/javascript/shared/blueprint.scss`.

**Functions:**
- Ruby instance methods and class methods use snake_case. Service objects expose a small public surface before `private`, as in `app/services/case_stats_service.rb`.
- Use query predicate methods with `?`, for example `Case#archive_needs_refresh?` in `app/models/case.rb`, policy predicates such as `CasePolicy#stats?` in `app/policies/case_policy.rb`, and state selectors such as `selectIsLoading` in `app/javascript/stats/state/statsStore.js`.
- JavaScript functions use lower camelCase and place the space before parentheses required by StandardJS/Prettier, for example `function buildValidatedRange (` in `app/javascript/stats/state/statsStore.js`.
- React event handlers and callbacks use action-oriented names such as `setFromDates`, `retry`, `handleReceived`, and `refreshOverview` in `app/javascript/stats/StatsPage.jsx` and `app/javascript/controllers/case_stats_controller.js`.

**Variables:**
- Ruby locals use snake_case, including domain words such as `kase` where `case` is reserved. See `spec/services/case_stats_service_spec.rb` and `app/services/case_stats_service.rb`.
- Instance variables are controller/view state only, such as `@case`, `@csv_rows`, and `@cached_overview_html` in `app/controllers/cases/stats_controller.rb`.
- JavaScript variables use lower camelCase, for example `initialState`, `hasMountedRef`, `dateRangeText`, and `mockFetchStats` in `app/javascript/stats/StatsPage.jsx` and `app/javascript/stats/__tests__/StatsPage.test.jsx`.
- Constants use uppercase snake case in JavaScript when they are module constants, such as `EMPTY_SUMMARY` in `app/javascript/stats/state/statsStore.js`.

**Types:**
- Flow type aliases use PascalCase: `Props`, `StatsState`, `StatsAction`, `StatsFetchStatus`, and `StatsDateRangeParams` in `app/javascript/stats/StatsPage.jsx` and `app/javascript/stats/state/statsStore.js`.
- Redux-style action union members use PascalCase names ending in `Action`, for example `FetchStartedAction` and `RetryRequestedAction` in `app/javascript/stats/state/statsStore.js`.
- Ruby model, service, policy, serializer, decorator, and controller constants use Rails PascalCase naming: `CaseStatsService`, `Cases::StatsController`, `CasePolicy`, and `ActivityCreatorSerializer`.

## Code Style

**Formatting:**
- Ruby formatting follows RuboCop in `.rubocop.yml` with `TargetRubyVersion: 3.2`. Use `# frozen_string_literal: true` at the top of Ruby files, matching `app/models/case.rb`, `app/controllers/application_controller.rb`, and `spec/rails_helper.rb`.
- RuboCop permits some project-specific Ruby idioms: `Style/Lambda` uses literal style, `Style/RescueModifier` is disabled, `Security/YAMLLoad` is disabled, and `Metrics/BlockLength` excludes `spec/**/*`.
- Class layout in Ruby should follow `.rubocop.yml` `Layout/ClassStructure`: includes/extends, constants, associations/attributes/macros, class methods, initializer, public methods, protected methods, private methods. `app/models/case.rb` is the clearest model example.
- JavaScript formatting is managed by `.prettierrc.json`: Flow parser, `printWidth: 80`, `semi: false`, `singleQuote: true`, and `trailingComma: es5`.
- JavaScript linting extends StandardJS, React, JSX accessibility, and Flow rules in `.eslintrc.json`. Use no semicolons, single quotes, object shorthand, multiline trailing commas, and one prop per line in multiline JSX.
- CSS color formatting is linted by `stylelint.config.js`; use HSL color format for new stylesheet colors where practical.

**Linting:**
- Ruby linting uses `rubocop` configured by `.rubocop.yml`; Hound reads the same config through `.hound.yml`.
- JavaScript linting uses `eslint` with `babel-eslint`, `eslint-config-standard`, `eslint-plugin-react`, `eslint-plugin-jsx-a11y`, and `eslint-plugin-flowtype` from `package.json`.
- Code Climate runs RuboCop and ESLint according to `.codeclimate.yml`, excluding generated or bulky areas such as `config/`, `db/`, `vendor/`, `flow-typed/`, and specs.
- Flow is pinned to `0.87.0` in `.flowconfig` and `package.json`; root app Node is `12.5.0` from `.node-version`.

## Import Organization

**Order:**
1. External packages first. `app/javascript/stats/StatsPage.jsx` imports `React`, `react-intl`, and `utility/ErrorBoundary` before local modules.
2. Local same-feature helpers and state modules next. Use relative imports inside feature folders such as `./dateHelpers`, `./urlParams`, and `./state/statsStore`.
3. Local component imports follow helper imports. `app/javascript/stats/StatsPage.jsx` imports `DatePicker`, `MapContainer`, `StatsTable`, and loading/error components after state helpers.
4. Flow type imports are separated with `import type`, as in `app/javascript/stats/state/statsStore.js` and `app/javascript/redux/reducers/cards.js`.

**Path Aliases:**
- Flow and Jest resolve modules from `app/javascript` through `.flowconfig` and `jest.config.js`; prefer existing absolute-style imports such as `shared/orchard`, `redux/state`, `draft/config`, and `utility/ErrorBoundary`.
- Webpacker supports raw SVG and YAML imports in `config/webpack/environment.js`; imports of `.svg`, `.yaml`, and `.yml` are valid in Webpacker code.
- Avoid TypeScript syntax. Frontend code is Flow-typed or explicitly annotated `/* @noflow */`.

## Error Handling

**Patterns:**
- Controllers centralize authorization failures with `rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized` in `app/controllers/application_controller.rb`.
- Controller actions should return HTTP responses through Rails helpers: `head :forbidden`, `redirect_to`, `render`, or `send_data`, as shown in `app/controllers/application_controller.rb` and `app/controllers/cases/stats_controller.rb`.
- Services should rescue narrow errors and normalize input instead of raising for user-provided invalid values. `CaseStatsService#parse_date` in `app/services/case_stats_service.rb` rescues `ArgumentError` and returns `nil`.
- JavaScript API helpers throw typed domain errors where callers need structured failure handling. Use `OrchardError` and `OrchardInputError` from `app/javascript/shared/orchard.js` for Orchard fetch calls.
- React and Stimulus async effects should catch errors, log useful context, and keep the UI mounted where possible. `app/javascript/stats/StatsPage.jsx` dispatches `fetch/failed`; `app/javascript/controllers/case_stats_controller.js` logs mount and refresh failures.
- Use `ErrorBoundary` for React mount points that can fail independently, as in `app/javascript/stats/StatsPage.jsx` and `app/javascript/controllers/case_stats_controller.js`.

## Logging

**Framework:** Rails logger, browser console, and Sentry

**Patterns:**
- Rails request context is attached to Sentry in `ApplicationController#set_sentry_context` at `app/controllers/application_controller.rb`.
- Server-side operational logs use `Rails.logger.info`, `Rails.logger.warn`, or `Rails.logger.error`; examples include invalid LTI requests in `app/controllers/application_controller.rb`, Rack Attack warnings in `config/initializers/rack_attack.rb`, and PDF failures in `app/models/case/pdf.rb`.
- Client-side exceptions should be captured through `ErrorBoundary` in `app/javascript/utility/ErrorBoundary.jsx` when the error reaches React rendering boundaries.
- Browser console logging is used for recoverable client-side async failures, such as stats fetch failures in `app/javascript/stats/StatsPage.jsx`, stats controller mount failures in `app/javascript/controllers/case_stats_controller.js`, and map errors in `app/javascript/stats/map/MapContainer.jsx`.

## Comments

**When to Comment:**
- Use comments for domain behavior, cache invalidation, non-obvious SQL, external protocol details, and framework integration. Examples: `Case` attribute documentation in `app/models/case.rb`, stats controller overview-cache comments in `app/controllers/cases/stats_controller.rb`, and the Stimulus mount comment in `app/javascript/controllers/case_stats_controller.js`.
- Keep comments concise and tied to behavior that is not obvious from method names. `CasePolicy::Scope` in `app/policies/case_policy.rb` documents the SQL-subquery choice.
- Do not add comments that restate direct Rails or JavaScript syntax.

**JSDoc/TSDoc:**
- JavaScript uses Flow types instead of TSDoc. Component props and state contracts belong in `type Props`, exported Flow types, or `declare class` blocks, as in `app/javascript/stats/StatsPage.jsx` and `app/javascript/stats/state/statsStore.js`.
- Ruby uses YARD-style comments in domain-heavy files. `app/models/case.rb` documents attributes with `@attr`; `app/services/case_stats_service.rb` documents params, returns, and examples.

## Function Design

**Size:** Prefer small public methods with private helpers for normalization and side effects.
- `app/services/case_stats_service.rb` exposes date range, cache key, aggregate readers, and API formatting methods, with parsing and query construction private.
- `app/controllers/cases/stats_controller.rb` keeps `show` format dispatch short and moves cache key, serializers, CSV preparation, and partial locals into private methods.
- Long React components should extract pure state logic into helpers or reducers. `app/javascript/stats/StatsPage.jsx` delegates reducer and selectors to `app/javascript/stats/state/statsStore.js`.

**Parameters:** Use keyword arguments for Ruby service options and explicit Flow object props for React.
- Ruby service example: `CaseStatsService.new(@case, from: params[:from], to: params[:to])` in `app/controllers/cases/stats_controller.rb`.
- React props example: `type Props = { dataUrl: string, minDate: ?string, intl: any }` in `app/javascript/stats/StatsPage.jsx`.
- FactoryBot transient attributes should model optional setup counts, as in `spec/factories/cases.rb` and `spec/factories/pages.rb`.

**Return Values:** Prefer explicit hashes, arrays, relations, or booleans matching caller needs.
- Service data methods return hashes and arrays with stable keys, such as `country_stats`, `stats_rows`, `api_data`, and `date_range` in `app/services/case_stats_service.rb`.
- Selectors return primitive view state and never mutate state, as in `selectCountries`, `selectSummary`, and `selectHasData` in `app/javascript/stats/state/statsStore.js`.
- Policies return booleans and scope relations, as in `app/policies/case_policy.rb`.

## Module Design

**Exports:** Match existing local patterns.
- Ruby service classes live under `app/services/` and may use subfiles for nested classes. `app/services/case_stats_service.rb` coordinates `app/services/case_stats_service/query.rb` and `app/services/case_stats_service/formatter.rb`.
- Rails concerns live under `app/models/concerns/` or `app/controllers/concerns/`, extend `ActiveSupport::Concern`, and are included by concrete classes.
- React components usually default-export the rendered component or HOC-wrapped component, for example `export default injectIntl(StatsPage)` in `app/javascript/stats/StatsPage.jsx`.
- JavaScript utility modules export named pure helpers when callers need independent functions, such as `reorder`, `ensureHttp`, and `normalize` in `app/javascript/shared/functions.js`.
- Redux reducers default-export the reducer and keep helper functions local unless tests or other modules need them, as in `app/javascript/redux/reducers/cards.js`.

**Barrel Files:** Limited, feature-specific barrels exist.
- Use `index.jsx` for feature mount components or aggregate exports inside folders such as `app/javascript/conversation/index.jsx`, `app/javascript/deployment/index.jsx`, and `app/javascript/card/index.jsx`.
- Do not introduce broad root-level barrels; existing imports rely on `app/javascript` module resolution and explicit feature paths.

**View and CSS conventions:**
- Rails views use a mix of ERB and Haml. Match the directory’s existing template format: stats uses `app/views/cases/stats/show.html.erb`, deployments use Haml files under `app/views/deployments/`.
- Stimulus data attributes use kebab-case controller names derived from snake_case files, such as `data-controller="case-stats"` for `app/javascript/controllers/case_stats_controller.js`.
- CSS class names are mostly BEM-like with component prefixes and Blueprint classes. Follow local examples such as `c-stats-map-table__heading`, `c-stats-map-container--min`, `deployment__invite__drawer`, and `admin-card--wide` in `app/assets/stylesheets/Statistics.sass`, `app/assets/stylesheets/deployments.scss`, and `app/views/cases/stats/show.html.erb`.

---

*Convention analysis: 2026-04-22*
