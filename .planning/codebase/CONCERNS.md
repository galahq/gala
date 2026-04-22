# Codebase Concerns

**Analysis Date:** 2026-04-22

## Tech Debt

**Aging root JavaScript toolchain:**
- Issue: The Rails app root is pinned to Node `12.5` and Yarn `1.x` in `package.json`, while frontend dependencies include Webpack 4, Webpacker-era packages, React 16, Flow `0.87.0`, Jest 24, Blueprint 2, `node-sass 4.12.0`, and many Babel 7.2-era packages.
- Files: `package.json`, `yarn.lock`, `config/webpacker.yml`, `app/javascript/packs/case.entry.jsx`, `app/assets/javascripts/application.js`
- Impact: Security updates, modern browser tooling, Sass upgrades, and library updates are constrained by a legacy Node/runtime floor. Native package installs are especially fragile because `node-sass 4.12.0` is tied to old Node ABI support.
- Fix approach: Treat frontend modernization as its own phase. Upgrade runtime first, replace `node-sass` with Dart Sass, then move Webpacker/Webpack 4 paths incrementally. Keep Sprockets and Webpacker behavior covered with asset precompile checks.

**Split frontend architecture:**
- Issue: JavaScript is split across Sprockets globals and Webpacker packs. The runtime depends on globals such as `App` and `Sentry` while React/Stimulus code lives under `app/javascript/`.
- Files: `app/assets/javascripts/application.js`, `app/assets/javascripts/sentry.js.erb`, `app/javascript/Case.jsx`, `app/javascript/packs/*.js`, `config/webpacker.yml`
- Impact: New UI work must account for two asset pipelines, two module styles, and globally initialized services. Integration bugs can hide until assets are precompiled.
- Fix approach: Place new React/Stimulus code under `app/javascript/` and avoid adding more global Sprockets dependencies. When touching shared runtime services, verify with `rails assets:precompile` in addition to focused tests.

**Flow coverage escape hatches:**
- Issue: Many active frontend entrypoints and tests opt out of Flow with `@noflow`, including deprecated edgenote rendering, pack entrypoints, Stimulus controllers, and several Jest tests.
- Files: `app/javascript/deprecated/OldEdgenote.jsx`, `app/javascript/deprecated/EdgenoteContents.jsx`, `app/javascript/packs/case.entry.jsx`, `app/javascript/controllers/clipboard_controller.js`, `app/javascript/stats/__tests__/StatsPage.test.jsx`
- Impact: Refactors can break prop shapes and action payloads without type feedback, especially across Redux state and legacy components.
- Fix approach: Keep edits narrow in `@noflow` files. Add focused Jest coverage for behavior changes and only remove `@noflow` when the file and its imports can be typed in the same phase.

**Custom parameter filtering bypasses Rails strong-parameter shape guarantees:**
- Issue: `Sv.map_of` and `CardsController#camelize` call `permit!`, and `Sv.anything` accepts arbitrary nested structures for Draft.js entity data.
- Files: `lib/sieve.rb`, `app/controllers/cards_controller.rb`, `spec/controllers/cards_controller_spec.rb`
- Impact: The card editor intentionally accepts flexible Draft.js payloads, but future changes can accidentally persist large or unexpected nested payloads. Validation rules are spread across custom lambdas rather than Rails model/controller contracts.
- Fix approach: Keep `Sv.anything` restricted to known Draft.js escape hatches. Add request specs for maximum payload shape and rejected entity types before broadening card raw-content handling.

**Disabled social image generation path:**
- Issue: The reading-list social image hook is commented out because `galahq/case_grid` is disabled.
- Files: `app/models/reading_list.rb`, `app/jobs/reading_list_social_image_creation_job.rb`, `Gemfile`
- Impact: Social images for reading lists are not generated through the intended job path, and the job code can drift because the integration dependency is inactive.
- Fix approach: Either remove the unused job path or restore it behind a tested replacement for `case_grid`. Do not leave callbacks commented out without a tracked product decision.

## Known Bugs

**LTI deployment creation guard is inverted:**
- Symptoms: `LinkerService::LTIStrategy#ensure_deployment_exists` returns when no deployment exists and attempts to create a deployment when one already exists. The existing unique index on `[group_id, case_id]` can turn repeat LTI launches into uniqueness errors, while first launches do not create the intended deployment.
- Files: `app/services/linker_service.rb`, `app/models/deployment.rb`, `db/migrate/20181030194657_add_unique_index_on_case_and_group_to_deployments.rb`, `spec/controllers/content_items_controller_spec.rb`
- Trigger: LTI launch with `case_slug` and `context_id`, especially a repeat launch for the same case/group.
- Workaround: Canvas deployment creation through `CanvasDeploymentsController#create` uses `Deployment.find_or_initialize_by`, but the LTI linker path itself has no spec for this duplicate/new behavior.
- Fix approach: Change the guard to `return if group.deployments.exists?(case: kase)` and add service specs for both first launch and repeat launch.

**Debug statements ship in application code:**
- Symptoms: JavaScript `debugger` statements execute in role-button replacement and Draft.js smart typography helper paths. They pause execution for users with DevTools open and make production bundles look like debug builds.
- Files: `app/views/roles/_replace_button.js.erb`, `app/javascript/shared/draftHelpers.js`
- Trigger: Role replacement JS response or editor smart-typography code when browser debugging is active.
- Workaround: None detected.
- Fix approach: Remove `debugger` statements and add lint rules or CI grep coverage for `debugger` in shipped assets.

**Statistics authorization is broader than the selected trackable object:**
- Symptoms: `StatisticsController#show` authorizes `Case, :index?` even when loading a specific card, podcast, or edgenote.
- Files: `app/controllers/statistics_controller.rb`, `app/models/concerns/trackable.rb`, `app/javascript/utility/Statistics.jsx`
- Trigger: Requests to per-trackable statistics endpoints for `card_id`, `podcast_id`, or `edgenote_slug`.
- Workaround: The UI only surfaces statistics in editor-oriented contexts, but the controller authorization does not enforce trackable ownership itself.
- Fix approach: Authorize the loaded trackable or its case with `:update?`/`:stats?`, then add controller specs for unauthorized readers.

## Security Considerations

**Sentry captures raw request parameters with minimal filtering:**
- Risk: `ApplicationController#set_sentry_context` sends `params.to_unsafe_h` and the full request URL to Sentry extras. The only configured Rails filter is `:password`, and Sentry enables `send_default_pii` in production.
- Files: `app/controllers/application_controller.rb`, `config/initializers/filter_parameter_logging.rb`, `config/initializers/sentry.rb`, `app/assets/javascripts/sentry.js.erb`
- Current mitigation: Rails parameter filtering includes `:password`; client-side Sentry strips non-serializable extras.
- Recommendations: Expand `filter_parameters` to include OAuth/LTI keys, tokens, emails as needed, `content_item_return_url`, `data`, `key`, and uploaded/content payload names. Pass filtered parameters to Sentry instead of `to_unsafe_h`.

**Public SPARQL endpoints interpolate user input into remote query strings:**
- Risk: `Wikidata#search` interpolates `params[:query]` into a quoted `mwapi:search` string, and `Wikidata#canned_query` interpolates `qid` into `BIND(wd:%{qid})`. Malformed input can cause SPARQL errors, expensive queries, or query manipulation against Wikidata.
- Files: `app/controllers/sparql_controller.rb`, `app/services/wikidata.rb`, `app/controllers/wikidata_links_controller.rb`
- Current mitigation: Schema filtering exists for known schema keys in `Wikidata#search`; authenticated case editing is required for persisted `WikidataLink` changes.
- Recommendations: Validate `schema` against `Wikidata::SCHEMAS.keys`, validate `qid` with `/\AQ\d+\z/`, escape search strings through a SPARQL-safe builder, add request throttling for `/sparql`, and add timeout handling around `SPARQL::Client`.

**Editor-controlled HTML is rendered directly in legacy edgenotes:**
- Risk: `EdgenotesController` permits `content`, `embed_code`, `instructions`, `photo_credit`, and `caption`; v1 edgenote components render several of those values with `dangerouslySetInnerHTML`.
- Files: `app/controllers/edgenotes_controller.rb`, `app/serializers/edgenote_serializer.rb`, `app/javascript/deprecated/EdgenoteContents.jsx`, `app/javascript/deprecated/OldEdgenote.jsx`, `app/models/edgenote.rb`
- Current mitigation: Edgenote updates require case update authorization through `ElementPolicy`; v2 rendering uses React text rendering for many fields.
- Recommendations: Add server-side sanitization or a strict allowlist for legacy HTML fields, especially `embed_code`. Prefer v2 rendering and add a migration/remediation path for remaining `v1` edgenotes.

**Dynamic constantization from request params:**
- Risk: `LocksController#set_lockable` calls `params[:lock][:lockable_type].constantize` before finding a record and authorizing it.
- Files: `app/controllers/locks_controller.rb`, `app/models/lock.rb`, `app/validators/only_polymorphic_validator.rb`, `app/javascript/utility/Lock.jsx`
- Current mitigation: `authorize @lockable, :update?` runs after lookup, and model validation restricts persisted polymorphic locks.
- Recommendations: Replace free-form `constantize` with an explicit allowlist such as `Card`, `Case`, `Edgenote`, `Page`, and `Podcast`. Add controller specs for rejected classes and missing/invalid `lock` params.

**Canvas deployment create skips CSRF without revalidating LTI:**
- Risk: `CanvasDeploymentsController#create` skips CSRF and relies on session `content_item_selection_params` presence rather than validating the incoming POST as an LTI request.
- Files: `app/controllers/canvas_deployments_controller.rb`, `app/controllers/catalog/content_items_controller.rb`, `app/controllers/concerns/selection_params.rb`, `app/javascript/deployment/contentItemSelectionContext.jsx`
- Current mitigation: `Catalog::ContentItemsController#create` validates the initial LTI request and stores selection params in the session.
- Recommendations: Treat the session token as a one-time capability. Clear it after create, verify `group_id`/`case_slug` against stored context, and add request specs for forged or replayed Canvas deployment posts.

## Performance Bottlenecks

**Search index refresh is a full materialized-view refresh:**
- Problem: `RefreshIndicesJob` runs `REFRESH MATERIALIZED VIEW cases_search_index` and is enqueued after selected case metadata saves.
- Files: `app/jobs/refresh_indices_job.rb`, `app/models/case.rb`, `app/services/find_cases.rb`, `db/migrate/20241011080359_update_case_search_index_for_postgres16.rb`
- Cause: The materialized view aggregates case, page, podcast, and card text for all cases. Refresh is not `CONCURRENTLY` and no job deduplication is present.
- Improvement path: Use `REFRESH MATERIALIZED VIEW CONCURRENTLY` where possible, coalesce duplicate refresh jobs, or move to an incremental search table updated per case.

**Case stats query does high-cardinality aggregation on Ahoy events:**
- Problem: Stats use distinct visit/user counts, joins to visits, and invisible-reader filtering over `ahoy_events`.
- Files: `app/services/case_stats_service/query.rb`, `app/services/case_stats_service.rb`, `app/models/ahoy/event.rb`, `db/migrate/20250107000000_add_case_id_to_ahoy_events.rb`, `app/controllers/cases/stats_controller.rb`
- Cause: The query is intentionally aggregate-heavy. Indexes exist for `case_id,time`, but cache invalidation uses `MAX(id)` and every case event broadcasts a stats update.
- Improvement path: Keep the current SQL path for correctness, but add load tests before expanding dashboard usage. Consider daily rollups or debounced ActionCable broadcasts for high-traffic cases.

**Per-trackable statistics run multiple event queries per rendered item:**
- Problem: `Trackable#views`, `#uniques`, and `#average_time` each execute separate queries against Ahoy events.
- Files: `app/models/concerns/trackable.rb`, `app/controllers/statistics_controller.rb`, `app/javascript/utility/Statistics.jsx`
- Cause: Statistics are computed per object through convenience methods rather than batched query results.
- Improvement path: Batch statistics for cards/edgenotes/podcasts displayed on a page, or cache each trackable aggregate with event-based invalidation.

## Fragile Areas

**Collaborative editing locks:**
- Files: `app/models/concerns/lockable.rb`, `app/controllers/locks_controller.rb`, `app/controllers/concerns/verify_lock.rb`, `app/javascript/utility/Lock.jsx`, `app/jobs/cleanup_locks_job.rb`, `spec/features/editing_a_case_spec.rb`
- Why fragile: Lock ownership spans browser state, polymorphic params, ActionCable broadcasts, and cleanup jobs. The feature spec for simultaneous editing is explicitly skipped.
- Safe modification: Add controller specs for lock creation/destruction and unskip or replace the multi-session feature spec before changing lock semantics.
- Test coverage: `spec/jobs/cleanup_locks_job_spec.rb` covers cleanup. Controller-level lock authorization and concurrent browser behavior are weakly covered.

**Wikidata integration UI and service:**
- Files: `app/javascript/wikidata/SortableWikidataList.jsx`, `app/javascript/wikidata/SearchWikidata.jsx`, `app/services/wikidata.rb`, `app/controllers/sparql_controller.rb`, `app/controllers/wikidata_links_controller.rb`
- Why fragile: The largest frontend file is `SortableWikidataList.jsx` at 687 lines, it handles querying, validation, persistence, sorting, and styling together. The Ruby service logs and raises remote errors rather than translating them to stable API responses.
- Safe modification: Extract query/persistence helpers first, add service/controller tests around invalid schema/qid/query, and mock Wikidata network calls in UI tests.
- Test coverage: No RSpec coverage detected for `Wikidata` or `SparqlController`; no Jest tests detected under `app/javascript/wikidata/`.

**Deprecated v1 edgenote rendering:**
- Files: `app/models/edgenote.rb`, `app/javascript/deprecated/OldEdgenote.jsx`, `app/javascript/deprecated/EdgenoteContents.jsx`, `app/javascript/edgenotes/index.jsx`, `app/javascript/elements/CaseElement.jsx`
- Why fragile: v1 edgenotes remain in the reader path, bypass Flow, and render raw HTML fields. v2 and v1 behavior diverge in routing, display, and security posture.
- Safe modification: Prefer migrations from `v1` to `v2` over feature work in deprecated components. Add snapshot/interaction tests for any remaining v1 display changes.
- Test coverage: No dedicated Jest tests detected for deprecated edgenote rendering.

**Runtime diagnostics endpoint:**
- Files: `app/controllers/runtime_controller.rb`, `app/serializers/runtime_stats_serializer.rb`, `app/models/runtime_stats_snapshot.rb`, `config/routes.rb`
- Why fragile: The endpoint gathers process, Redis, Sidekiq, ActionCable, cache, object, and Postgres data from a single request path. Most failures are swallowed into JSON error fields.
- Safe modification: Keep access limited to editors, avoid adding secret-bearing environment values, and add request specs for authorization and failure shaping before expanding fields.
- Test coverage: No spec detected for `RuntimeController`.

**Feature specs depend on sleeps and retries:**
- Files: `spec/spec_helper.rb`, `spec/features/editing_a_case_spec.rb`, `spec/features/leaving_a_comment_spec.rb`, `spec/features/publishing_a_case_spec.rb`, `spec/features/viewing_a_case_spec.rb`
- Why fragile: Feature specs run with `rspec-retry` and several scenarios use `sleep(1)` around asynchronous UI updates.
- Safe modification: Replace sleeps with deterministic Capybara expectations or ActionCable/job synchronization before using feature specs as release blockers.
- Test coverage: The coverage exists, but retry and sleep patterns mask timing regressions.

## Scaling Limits

**Ahoy event volume:**
- Current capacity: Event data is stored in `ahoy_events` with indexes on `case_id,time`, `name,time`, `user_id,name`, `visit_id,name`, and JSONB properties.
- Limit: Stats, cache invalidation, and broadcast paths scale with event insert rate and historical aggregate size.
- Scaling path: Add rollup tables for case/day/country metrics, batch ActionCable notifications, and keep raw Ahoy data for audit/drill-down only.

**Search materialized view size:**
- Current capacity: `cases_search_index` stores one row per case with text aggregated from cases, pages, podcasts, and cards.
- Limit: Full refresh cost grows with all case content and can block fresh search visibility.
- Scaling path: Move from full materialized refresh to per-case indexed documents or a dedicated search backend.

**Collaborative editing locks:**
- Current capacity: One lock per lockable resource, with cleanup after eight hours and ActionCable edit broadcasts.
- Limit: Stale locks and dropped browser sessions can block editing until cleanup runs or users override locks.
- Scaling path: Add heartbeat-based locks with shorter expiry and explicit stale-lock UI states.

## Dependencies at Risk

**`node-sass 4.12.0`:**
- Risk: Native bindings target old Node versions and are a common install failure point.
- Impact: Frontend dependency installation and asset compilation break during Node upgrades.
- Migration plan: Replace with Dart Sass and update `sass-loader`/Webpack configuration in a dedicated frontend tooling phase.

**`@rails/webpacker` / `webpacker`:**
- Risk: Webpacker is no longer the standard Rails frontend path and the repo mixes gem `webpacker ~> 5.4` with npm `@rails/webpacker ^4.0.2`.
- Impact: Asset behavior can differ between Ruby and JS package expectations, especially during upgrades.
- Migration plan: Align package versions first, then plan a move to jsbundling-rails, Propshaft/Sprockets-only, or a modern bundler path.

**Git-sourced gems:**
- Risk: `omniauth-lti` and `markerb` are sourced from GitHub repositories rather than released gem versions.
- Impact: Reproducibility and security review depend on pinned lockfile SHAs and external repository availability.
- Migration plan: Pin and periodically review SHAs in `Gemfile.lock`; replace with maintained released gems where available.

**Legacy React ecosystem packages:**
- Risk: `react-beautiful-dnd`, `react-router-dom` v4, `react-intl` v2, Blueprint 2, Flow 0.87, and Jest 24 are all upgrade-sensitive.
- Impact: UI refactors and dependency security updates require multi-package migrations.
- Migration plan: Do not upgrade these opportunistically inside feature work. Plan migration slices with Jest and Flow checks per slice.

## Missing Critical Features

**Input validation boundary for Wikidata/SPARQL:**
- Problem: Public SPARQL routes lack strict input validation, timeout handling, and stable error response tests.
- Blocks: Safe exposure of Wikidata search at larger traffic volumes and reliable UI handling for malformed or slow remote responses.

**HTML sanitization policy for editor-authored embeds:**
- Problem: Legacy edgenote rendering accepts and displays raw HTML without a documented allowlist.
- Blocks: Clear security guarantees for case editors, imported content, and any future self-service authoring expansion.

**Operational controls for search refreshes:**
- Problem: Search refresh jobs have no deduplication, concurrency guard, or operational status surface.
- Blocks: Confident scaling of catalog search and quick diagnosis when search appears stale.

## Test Coverage Gaps

**LTI linker service deployment behavior:**
- What's not tested: First-launch deployment creation, repeat-launch idempotency, and duplicate avoidance in `LinkerService::LTIStrategy`.
- Files: `app/services/linker_service.rb`, `spec/controllers/content_items_controller_spec.rb`
- Risk: LMS launches can fail or silently skip deployment setup.
- Priority: High

**SPARQL/Wikidata API boundary:**
- What's not tested: Invalid schema, invalid qid, escaped search strings, remote timeout/error handling, and controller status codes.
- Files: `app/controllers/sparql_controller.rb`, `app/services/wikidata.rb`, `app/controllers/wikidata_links_controller.rb`
- Risk: Public endpoints can raise 500s or send unsafe/expensive queries to Wikidata.
- Priority: High

**Lock controller and concurrent editing:**
- What's not tested: Lock create/destroy request authorization, invalid lockable types, stale lock behavior, and the multi-user browser flow.
- Files: `app/controllers/locks_controller.rb`, `app/javascript/utility/Lock.jsx`, `spec/features/editing_a_case_spec.rb`
- Risk: Collaborative editing regressions can overwrite work or block editors.
- Priority: High

**Runtime diagnostics authorization and failure shaping:**
- What's not tested: Editor-only access, non-editor rejection, Redis/Sidekiq/Postgres failure serialization, and absence of secrets in diagnostics.
- Files: `app/controllers/runtime_controller.rb`, `app/serializers/runtime_stats_serializer.rb`
- Risk: Operational endpoint changes can leak data or break under partial infrastructure outages.
- Priority: Medium

**Deprecated edgenote rendering and sanitization:**
- What's not tested: v1 edgenote raw HTML rendering, upgrade path behavior, and unsafe field handling.
- Files: `app/javascript/deprecated/OldEdgenote.jsx`, `app/javascript/deprecated/EdgenoteContents.jsx`, `app/controllers/edgenotes_controller.rb`
- Risk: XSS and display regressions can persist in cases that still use v1 edgenotes.
- Priority: Medium

**Frontend dependency and asset pipeline compatibility:**
- What's not tested: CI-equivalent asset compilation for Sprockets plus Webpacker under dependency changes.
- Files: `package.json`, `config/webpacker.yml`, `app/assets/javascripts/application.js`, `app/javascript/packs/case.entry.jsx`
- Risk: JS/CSS changes can pass Jest while failing Rails asset precompile or runtime pack loading.
- Priority: Medium

---

*Concerns audit: 2026-04-22*
