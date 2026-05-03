# Codebase Concerns

**Analysis Date:** 2026-05-03

## Tech Debt

**Legacy React/Flow frontend dependency stack:**
- Issue: The JavaScript app is built on React 16.8, Flow-era annotations, Redux 4, Blueprint 4, Stimulus 1, Jest 24, Babel/Jest/ESLint packages from the 2018-2019 era, and multiple deprecated packages. `package.json` also pins Node to `>=24 <25`, which can expose incompatibilities in old Babel/Jest tooling.
- Files: `package.json`, `app/javascript/redux/state.js`, `app/javascript/wikidata/SortableWikidataList.jsx`, `app/javascript/edgenotes/Edgenote.jsx`
- Impact: Upgrades are risky because runtime, test, transpilation, and component-library assumptions are tightly coupled. New frontend work must fit an older React lifecycle and testing stack unless the area is isolated.
- Fix approach: Upgrade in slices: test tooling first, then React/rendering libraries, then Blueprint and Flow removal. Keep compatibility wrappers around shared components in `app/javascript/shared/` during migration.

**Custom strong-parameter filtering bypasses Rails conventions:**
- Issue: The `Sv` helper accepts arbitrary nested data with `Sv.anything` and uses `permit!` when converting `ActionController::Parameters`. `CardsController#camelize` also calls `permit!` before key transformation.
- Files: `lib/sieve.rb`, `app/controllers/cards_controller.rb`
- Impact: Card Draft.js payloads can store arbitrary nested entity data. This is intentional for editor flexibility, but it makes security review and schema migration harder because important validation is outside Rails strong parameter declarations.
- Fix approach: Keep `Sv` for Draft.js shape filtering, but replace `Sv.anything` with explicit allowed entity data schemas for known entity types. Add regression specs in `spec/controllers/cards_controller_spec.rb` for rejected unexpected keys and unsafe entity payloads.

**Disabled reading-list social image generation:**
- Issue: Reading-list social image creation is present but intentionally disabled because `case_grid` is not compatible with the app’s image stack.
- Files: `Gemfile`, `app/models/reading_list.rb`, `app/jobs/reading_list_social_image_creation_job.rb`
- Impact: Reading lists never refresh OpenGraph/social images even though `ReadingList#update_social_image` and `ReadingListSocialImageCreationJob` imply support. Future work may assume a job path exists when it is inactive.
- Fix approach: Replace `case_grid` with direct `image_processing`/Vips composition or remove the dead job path. Add job coverage under `spec/jobs/reading_list_social_image_creation_job_spec.rb` when re-enabled.

**Deprecated frontend modules remain in the application tree:**
- Issue: `app/javascript/deprecated/EdgenoteContents.jsx` and `app/javascript/deprecated/OldEdgenote.jsx` still include old HTML-rendering paths and are shipped in the source tree.
- Files: `app/javascript/deprecated/EdgenoteContents.jsx`, `app/javascript/deprecated/OldEdgenote.jsx`
- Impact: Deprecated modules can be accidentally imported or used as examples for new work, preserving unsafe rendering patterns and old component design.
- Fix approach: Confirm no active imports, then remove the deprecated directory or quarantine it outside `app/javascript/`. If it remains for reference, add a lint/import rule that prevents production imports from `app/javascript/deprecated/`.

## Known Bugs

**Wikidata endpoints can raise 500s on malformed input:**
- Symptoms: `SparqlController` passes unchecked request params to `Wikidata#canned_query` and `Wikidata#search`. `Wikidata#search` calls `partial_label.downcase`; a missing `query` raises. `Wikidata#canned_query` calls `SCHEMAS[schema.to_sym] % ...`; an unknown or missing schema raises before returning `nil`.
- Files: `app/controllers/sparql_controller.rb`, `app/services/wikidata.rb`
- Trigger: Request `/sparql?schema=software` without `query`, or request `/sparql/not_a_schema/Q42`.
- Workaround: None detected in the controller. Add schema/query presence validation and return `400 Bad Request` for unsupported schemas or blank queries before constructing `Wikidata`.

**Canvas deployment creation has no failure response path:**
- Symptoms: `CanvasDeploymentsController#create` redirects only when `@deployment.save` succeeds. On validation failure, the action falls through without an explicit response.
- Files: `app/controllers/canvas_deployments_controller.rb`
- Trigger: POST `/groups/:group_id/canvas_deployments` with valid selection session state but a deployment that fails validation.
- Workaround: None detected. Return `422 Unprocessable Entity` with errors or redirect with an alert when save fails.

**Stats overview refresh swaps raw HTML into the page:**
- Symptoms: `case_stats_controller.js` fetches an HTML fragment and assigns it directly to `overviewElement.innerHTML`.
- Files: `app/javascript/controllers/case_stats_controller.js`, `app/controllers/cases/stats_controller.rb`, `app/views/cases/stats/overview.html.haml`
- Trigger: Any successful stats broadcast for a case calls `refreshOverview` and replaces the overview DOM with the server response body.
- Workaround: Server-rendered templates are the current boundary. Prefer returning JSON and rendering through React, or sanitize/strictly scope the fetched partial before insertion.

## Security Considerations

**Unauthenticated CSRF-skipping LTI and Canvas flows require tight request validation:**
- Risk: LTI flows intentionally skip Rails CSRF protection. `Catalog::ContentItemsController#create` validates the LTI request, signs in a linked reader, and stores return URLs/data in session. `CanvasDeploymentsController#create` also skips CSRF and depends on selection params already being present.
- Files: `app/controllers/catalog/content_items_controller.rb`, `app/controllers/canvas_deployments_controller.rb`, `app/controllers/application_controller.rb`, `app/controllers/concerns/selection_params.rb`
- Current mitigation: `Catalog::ContentItemsController` calls `validate_lti_request!`; `CanvasDeploymentsController` calls `ensure_content_item_selection_params_set!`.
- Recommendations: Add request specs covering invalid signatures, missing session selection params, mismatched group/case combinations, and unsafe `content_item_return_url` values. Keep all CSRF skips isolated to LTI controllers.

**Dynamic class resolution from request params is broader than needed:**
- Risk: `LocksController#set_lockable` constantizes `params[:lock][:lockable_type]` and then authorizes the resolved record. Authorization occurs after class resolution and lookup.
- Files: `app/controllers/locks_controller.rb`
- Current mitigation: `NameError` and `ActiveRecord::RecordNotFound` return `422`; `authorize @lockable, :update?` runs before lock creation.
- Recommendations: Replace `constantize` with an allowlist of lockable classes such as `Card`, `Page`, `Edgenote`, or whichever models actually include lock behavior. Add controller specs in `spec/controllers/locks_controller_spec.rb`.

**OEmbed/OpenGraph link expansion fetches editor-supplied URLs and renders provider HTML:**
- Risk: Link previews call OpenGraph and OEmbed clients with request-provided or editor-provided URLs, then the frontend renders OEmbed HTML with `dangerouslySetInnerHTML`. This creates SSRF and XSS exposure if provider allowlists, URL schemes, redirects, and returned HTML are not tightly controlled.
- Files: `app/controllers/edgenotes/link_expansions_controller.rb`, `app/models/link_expansion.rb`, `app/models/link_expansion/preview.rb`, `app/models/link_expansion/embed.rb`, `config/initializers/oembed.rb`, `app/javascript/edgenotes/expansion/index.jsx`
- Current mitigation: OEmbed providers are registered in `config/initializers/oembed.rb`, but OpenGraph preview creation accepts the URL directly.
- Recommendations: Validate URL scheme/host before fetch, block private/link-local IP ranges after redirects, add timeouts, and sanitize or iframe-sandbox embed HTML. Add specs for private IP, localhost, non-HTTP schemes, and provider HTML handling.

**Sentry receives full request params:**
- Risk: `ApplicationController#set_sentry_context` sends `params.to_unsafe_h` into Sentry extras for every request. Login, OAuth/LTI, uploaded metadata, tokens, or personally identifiable fields can be captured unless Sentry filtering is configured elsewhere.
- Files: `app/controllers/application_controller.rb`, `config/initializers/filter_parameter_logging.rb`
- Current mitigation: Rails parameter filtering may redact configured keys before logs, but this method explicitly sends the full unsafe params hash to Sentry.
- Recommendations: Use `request.filtered_parameters` or a small allowlist of diagnostic fields. Add a test or initializer assertion that sensitive parameters are filtered before Sentry scope extras are populated.

## Performance Bottlenecks

**Wikidata requests are synchronous and uncached:**
- Problem: Public `/sparql` endpoints perform remote Wikidata SPARQL calls during the request and log the full query. Failed remote calls are re-raised.
- Files: `app/controllers/sparql_controller.rb`, `app/services/wikidata.rb`
- Cause: `Wikidata#canned_query` and `Wikidata#search` instantiate `SPARQL::Client` and query Wikidata on demand without local caching or timeout handling in the service.
- Improvement path: Add request-level validation, client timeouts, and Rails cache keyed by locale/schema/qid/query. Convert repeated editor lookups to background refresh where practical.

**Large frontend modules concentrate rendering and state complexity:**
- Problem: Several React modules exceed 300 lines and combine data handling, rendering, drag/drop, and side effects.
- Files: `app/javascript/wikidata/SortableWikidataList.jsx`, `app/javascript/redux/state.js`, `app/javascript/edgenotes/Edgenote.jsx`, `app/javascript/stats/map/MapView.jsx`, `app/javascript/draft/helpers.js`, `app/javascript/wikidata/SearchWikidata.jsx`
- Cause: Legacy components are organized around feature pages rather than small hooks/selectors/components, and the app still uses older React/Redux patterns.
- Improvement path: When editing these areas, extract pure selectors/helpers first, then split UI subcomponents. Add focused Jest tests beside extracted helpers before changing behavior.

**Social image job loads all cover images into memory:**
- Problem: `ReadingListSocialImageCreationJob` maps every reading-list case cover image into tempfiles and then generates a composite blob in memory.
- Files: `app/jobs/reading_list_social_image_creation_job.rb`, `app/decorators/image_decorator.rb`
- Cause: `cover_images` processes all attached images eagerly and `image` returns a `StringIO` for the full generated blob.
- Improvement path: Keep the job disabled until the image generator is replaced. When re-enabled, cap the number of images, stream/process bounded variants, and add job memory/runtime assertions for large reading lists.

## Fragile Areas

**Draft.js card content serialization is schema-sensitive:**
- Files: `app/controllers/cards_controller.rb`, `lib/sieve.rb`, `app/javascript/draft/helpers.js`, `app/models/content_state.rb`, `app/models/content_state/block.rb`
- Why fragile: Backend filtering, camelCase preservation, Draft.js entity maps, and frontend rendering all need to agree on exact key names and nested shapes.
- Safe modification: Add fixture-backed round-trip tests before altering card content. Keep example payloads in controller/model specs and verify saved `raw_content` still renders through existing draft helpers.
- Test coverage: `spec/controllers/cards_controller_spec.rb` exists, but entity-type-specific validation coverage is limited by the open-ended `Sv.anything` field.

**LTI/linking session state spans multiple controllers:**
- Files: `app/controllers/catalog/content_items_controller.rb`, `app/controllers/canvas_deployments_controller.rb`, `app/controllers/concerns/selection_params.rb`, `app/services/linker_service.rb`, `app/controllers/deployments_controller.rb`
- Why fragile: Content item selection validates an external request, signs in a reader, creates or finds group context, stores selection params, and later creates deployments through another controller.
- Safe modification: Treat this as one workflow. Add request specs that exercise the full redirect/session path and invalid session state before changing any single controller.
- Test coverage: `spec/controllers/content_items_controller_spec.rb` exists; no direct spec for `CanvasDeploymentsController` was detected.

**Authorization is distributed across controller actions and channels:**
- Files: `app/controllers/*_controller.rb`, `app/policies/*.rb`, `app/channels/edits_channel.rb`, `app/channels/stats_channel.rb`
- Why fragile: Most controllers call `authorize` manually per action; channels perform their own policy checks; public endpoints rely on `current_user` falling back to `AnonymousUser`.
- Safe modification: For new endpoints, add both authentication and authorization specs. For ActionCable changes, test subscription rejection paths and policy coverage.
- Test coverage: Policy specs exist for core models, but only 18 controller/request specs cover 84 controllers. High-risk controllers such as `app/controllers/locks_controller.rb`, `app/controllers/sparql_controller.rb`, `app/controllers/canvas_deployments_controller.rb`, and `app/controllers/edgenotes/link_expansions_controller.rb` do not have detected direct specs.

## Scaling Limits

**Request throttling is only a broad per-IP limit:**
- Current capacity: `Rack::Attack` allows 500 requests per IP per minute and includes one blocklist for malformed case URL depth.
- Limit: Expensive unauthenticated endpoints such as search, tags, link expansion, and Wikidata share the same broad throttle as cheap requests.
- Scaling path: Add endpoint-specific throttles for `/sparql`, `/edgenotes/*/link_expansion`, authentication, and search. Keep the broad IP throttle as a backstop.

**ActionCable stats broadcasts scale by case ID but refresh HTML per client:**
- Current capacity: Clients subscribe to `"stats:#{case_id}"`; each `stats_updated` event triggers each browser to fetch an overview partial.
- Limit: Cases with many viewers can stampede `/cases/:case_slug/stats/overview` after Ahoy event broadcasts.
- Scaling path: Debounce client refreshes, broadcast aggregate payloads instead of invalidation-only messages, or cache overview fragments per case/date range.

## Dependencies at Risk

**Git-sourced and custom gems increase maintenance burden:**
- Risk: `omniauth-lti` and `markerb` are sourced from GitHub forks, and the commented `case_grid` dependency already blocks a feature.
- Impact: Framework upgrades can break private/forked dependencies outside normal RubyGems release workflows.
- Migration plan: Prefer maintained RubyGems releases or vendor explicit compatibility patches. Track these dependencies in upgrade plans before Rails/Ruby version bumps.

**Frontend packages include deprecated or unmaintained libraries:**
- Risk: `@babel/polyfill`, proposal plugins, `babel-eslint`, `react-beautiful-dnd`, `recompose`, Flow-era tooling, and older React ecosystem libraries are likely to accumulate security and compatibility issues.
- Impact: Installing or testing under Node 24 can fail in packages that predate current Node behavior, and vulnerability fixes may require major rewrites.
- Migration plan: Replace deprecated packages during feature-area work: move from `babel-eslint` to the maintained parser, replace `@babel/polyfill` with targeted `core-js`/runtime usage, and migrate drag/drop code away from `react-beautiful-dnd`.

## Missing Critical Features

**No detected automated dependency/security audit command:**
- Problem: `package.json` exposes only `yarn test`; no repository script was detected for `bundle audit`, `brakeman`, `yarn audit`, or similar security checks.
- Blocks: Security regressions in Rails controllers, Rack middleware, and legacy JS dependencies can reach review without an automated gate.

**No detected direct tests for external fetch safety:**
- Problem: Link expansion and Wikidata services make external network calls from request paths, but no direct specs were detected for URL validation, timeout behavior, private network blocking, or malformed inputs.
- Blocks: Hardening OEmbed/OpenGraph/Wikidata behavior without regressions.

## Test Coverage Gaps

**High-risk controllers without direct specs:**
- What's not tested: Lock creation class allowlisting, unauthenticated Canvas deployment creation, Wikidata input validation, and link expansion URL safety.
- Files: `app/controllers/locks_controller.rb`, `app/controllers/canvas_deployments_controller.rb`, `app/controllers/sparql_controller.rb`, `app/controllers/edgenotes/link_expansions_controller.rb`
- Risk: Security, authorization, and malformed-input regressions can ship unnoticed.
- Priority: High

**Runtime diagnostics endpoint coverage is not detected:**
- What's not tested: Editor-only authorization, Redis/Postgres/Sidekiq error handling, and whether sensitive runtime metadata is exposed.
- Files: `app/controllers/runtime_controller.rb`, `app/models/runtime_stats_snapshot.rb`, `app/serializers/runtime_stats_serializer.rb`
- Risk: Operational diagnostics can leak environment details or break under partial infrastructure outages.
- Priority: Medium

**Frontend HTML insertion paths need explicit safety tests:**
- What's not tested: OEmbed HTML rendering, server-returned sign-in form insertion, stats overview HTML replacement, and deprecated edgenote HTML rendering.
- Files: `app/javascript/edgenotes/expansion/index.jsx`, `app/javascript/utility/SignInForm.jsx`, `app/javascript/controllers/case_stats_controller.js`, `app/javascript/deprecated/EdgenoteContents.jsx`
- Risk: XSS vulnerabilities can be introduced by changing server-rendered HTML or embed provider behavior.
- Priority: High

---

*Concerns audit: 2026-05-03*
