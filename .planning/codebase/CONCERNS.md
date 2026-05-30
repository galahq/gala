# Codebase Concerns

**Analysis Date:** 2026-05-30

## Tech Debt

**Frontend runner and type-system drift:**
- Issue: The active frontend test scripts use Jest 24 through `babel-jest`, formatting selects the Flow parser, and TypeScript is configured only as a non-emitting `allowJs` baseline with `checkJs: false`.
- Files: `package.json`, `jest.config.js`, `.prettierrc.json`, `tsconfig.json`, `app/javascript`
- Impact: Modern JavaScript packages can fail in Jest transforms, Flow-era formatting assumptions can leak into edited files, and the TypeScript baseline does not catch application type errors.
- Fix approach: Phase 16 work should make one pnpm-backed frontend test command canonical, replace the Flow parser setting, and enable type checking incrementally by folder or file type.

**React/Blueprint visual compatibility is global and order-sensitive:**
- Issue: The app uses React 16.8 and BlueprintJS 4.x packages while preserving a BlueprintJS 2.3.1-era visual target through global CSS and compatibility namespace behavior.
- Files: `package.json`, `app/assets/stylesheets/application.css`, `app/javascript/packs/styles.js`, `app/javascript/shared/blueprintLegacyNamespace.js`, `app/views/layouts/application.html.erb`
- Impact: Small dependency, CSS import, or layout changes can alter route appearance across catalog, case, admin, deployment, and editor surfaces.
- Fix approach: Keep route-facing UI fixes narrow, verify through `config/routes.rb` route groups, and use visual coverage before accepting global CSS or layout changes.

**Reading-list social images are wired but disabled:**
- Issue: `ReadingList#update_social_image` comments out `ReadingListSocialImageCreationJob`, while the job references `CaseGrid` and the related gem is commented out.
- Files: `Gemfile`, `app/models/reading_list.rb`, `app/jobs/reading_list_social_image_creation_job.rb`, `app/views/reading_lists/show.html.erb`
- Impact: Reading-list Open Graph image metadata is absent unless an image is manually attached, and the job is dead code that can fail if re-enabled without replacing `case_grid`.
- Fix approach: Replace `CaseGrid` with a maintained image compositor or remove the job/dashboard surface if generated social images are not a supported feature.

**Generic ActiveStorage deletion controller relies on subclass discipline:**
- Issue: `AttachmentsController` uses a small DSL around `instance_exec`, dynamic `send`, and subclass-provided authorization/allowlists.
- Files: `app/controllers/attachments_controller.rb`, `app/controllers/cases/attachments_controller.rb`, `app/controllers/edgenotes/attachments_controller.rb`
- Impact: A new attachment subclass can accidentally omit authorization or expose a non-attachment method through the dynamic attribute path.
- Fix approach: Make authorization and permitted attachment attributes required at class definition time, and keep negative request specs for invalid attributes and unauthorized readers.

**Deployment automation has two production-capable paths:**
- Issue: `.github/workflows/deploy.yml` and `scripts/deploy-sst.sh` are the SST deployment path, while `scripts/deploy-gala-aws-production.sh` is executable and includes Heroku secret sync, S3 sync, Docker push, and database seed behavior.
- Files: `.github/workflows/deploy.yml`, `scripts/deploy-sst.sh`, `scripts/deploy-gala-aws-production.sh`, `docs/aws-production-operator-runbook.md`
- Impact: Operators can run a script that does not enforce the same Phase 20/23 safety boundaries as the GitHub Actions SST workflow.
- Fix approach: Add an explicit refusal banner or archive gate to `scripts/deploy-gala-aws-production.sh`, and keep production deployment instructions pointed at `.github/workflows/deploy.yml`.

## Known Bugs

**Reader role mutation lacks controller authorization:**
- Symptoms: `RolesController` only loads the target reader and role; it does not call `authenticate_reader!` or `authorize`.
- Files: `app/controllers/roles_controller.rb`, `config/routes.rb`, `spec/requests/reader_management_routes_spec.rb`
- Trigger: A signed-in non-editor with a valid CSRF token can call `POST /readers/:reader_id/roles` or `DELETE /readers/:reader_id/roles/:id`.
- Workaround: None in the controller. Admin UI links rely on surrounding access control, but the endpoint itself needs a guard.

**LTI deployment creation guard is inverted:**
- Symptoms: `LinkerService::LTIStrategy#ensure_deployment_exists` returns when no deployment exists and attempts to create a deployment when one already exists.
- Files: `app/services/linker_service.rb`, `app/controllers/catalog/content_items_controller.rb`, `app/controllers/canvas_deployments_controller.rb`, `spec/requests/deployment_integration_routes_spec.rb`
- Trigger: LTI launch paths with `case_slug` and `context_id` depend on deployment/group setup.
- Workaround: The Canvas deployment route creates a deployment after content-item selection state is present.

**Smart typography contains a browser debugger statement:**
- Symptoms: The Draft.js helper pauses execution when developer tools are open.
- Files: `app/javascript/shared/draftHelpers.js`, `.eslintrc.json`
- Trigger: Calling smart typography paths that invoke `getPrecedingCharacter`.
- Workaround: Keep developer tools closed during affected editor interactions.

**Wikidata editor code logs raw responses and errors:**
- Symptoms: Wikidata reorder/remove/search flows write response objects and errors to the browser console.
- Files: `app/javascript/wikidata/SortableWikidataList.jsx`, `app/javascript/wikidata/SearchWikidata.jsx`, `app/controllers/wikidata_links_controller.rb`
- Trigger: Editing Wikidata links and hitting SPARQL or Orchard API errors.
- Workaround: Treat the logs as known console noise during route QA until replaced with user-visible errors or structured debug logging.

**Catalog search silently returns empty results when the search index is not queryable:**
- Symptoms: `SearchController#index` rescues the `cases_search_index` prerequisite error and renders `[]`.
- Files: `app/controllers/search_controller.rb`, `app/services/find_cases.rb`, `app/jobs/refresh_indices_job.rb`, `lib/tasks/indices.rake`
- Trigger: Fresh or locally restored databases where `cases_search_index` is present but not populated.
- Workaround: Run `bundle exec rake indices:refresh` before validating search behavior.

## Security Considerations

**Role-management endpoint is privilege-sensitive:**
- Risk: Missing authentication and Pundit checks around role creation/removal can grant or revoke roles outside the intended admin flow.
- Files: `app/controllers/roles_controller.rb`, `config/routes.rb`, `app/policies/reader_policy.rb`, `spec/requests/reader_management_routes_spec.rb`
- Current mitigation: Rails CSRF protection applies to normal HTML form submissions; the request spec covers the editor happy path.
- Recommendations: Add `before_action :authenticate_reader!`, authorize role changes through an editor-only policy, and add request specs for anonymous and non-editor users.

**Secret-bearing files and Docker context need tighter exclusion:**
- Risk: Secret-named or environment files exist in the repo/worktree, and `.dockerignore` excludes `.env` and `config/master.key` but not `.env.dev`, `.envrc`, or `config/secrets.yml` before `Dockerfile` runs `COPY . ./`.
- Files: `.env.dev`, `.envrc`, `config/secrets.yml`, `config/credentials.yml.enc`, `.dockerignore`, `.gitignore`, `Dockerfile`, `scripts/scan-staged-secrets`, `SECURITY.md`
- Current mitigation: `.env`, `.env.dev`, `/tmp/*`, `/db/sqldump/`, and `config/master.key` are ignored in `.gitignore`; `scripts/scan-staged-secrets` reports candidate staged secrets without printing values.
- Recommendations: Verify tracked secret-named files contain no live values, rotate any value that has been committed, extend `.dockerignore`, and wire `scripts/scan-staged-secrets` into CI or a documented pre-commit path.

**Redis TLS certificate verification is disabled:**
- Risk: Production cache, Sidekiq, and ActionCable Redis clients use `OpenSSL::SSL::VERIFY_NONE` for `rediss://` connections.
- Files: `config/environments/production.rb`, `config/initializers/sidekiq.rb`, `config/cable.yml`, `infra/sst.config.ts`
- Current mitigation: SST provisions Redis/Valkey inside the AWS network and supplies `REDIS_URL`.
- Recommendations: Use verified TLS parameters for the managed Redis endpoint or document why network isolation is the accepted control.

**Frame protections are disabled globally:**
- Risk: `X-Frame-Options` is set to `ALLOWALL` for the whole Rails app, expanding clickjacking exposure beyond LTI embed routes.
- Files: `config/application.rb`, `config/initializers/new_framework_defaults_7_0.rb`, `app/controllers/catalog/content_items_controller.rb`, `app/controllers/canvas_deployments_controller.rb`
- Current mitigation: LTI content-item creation validates signed LTI requests before setting selection state.
- Recommendations: Replace the global header override with a route-aware Content Security Policy `frame-ancestors` allowlist for LMS hosts and keep non-LTI routes protected.

**Sentry and production logs can receive broad request parameters:**
- Risk: `set_sentry_context` sends `params.to_unsafe_h`, production log level is `debug`, and filtered parameters only include `password`.
- Files: `app/controllers/application_controller.rb`, `config/initializers/filter_parameter_logging.rb`, `config/environments/production.rb`, `app/controllers/catalog/content_items_controller.rb`, `app/controllers/magic_links_controller.rb`
- Current mitigation: Rails parameter filtering covers `password`.
- Recommendations: Filter token, key, secret, signature, OAuth, LTI, deployment, and return-url parameters; lower production log verbosity unless actively diagnosing an incident.

**AWS database/cache subnet placement conflicts with the IaC comment:**
- Risk: The comment says RDS/cache stay private, but Postgres and Redis are configured with `vpc.publicSubnets`.
- Files: `infra/sst.config.ts`
- Current mitigation: SST-managed security groups restrict service access.
- Recommendations: Move database/cache resources to private subnets or document the security group rules and public-subnet exposure rationale in `infra/sst.config.ts`.

**Application origin and task IAM permissions are broad:**
- Risk: CloudFront talks to the app origin with `originProtocolPolicy: "http-only"`, and the same S3 `GetObject`/`PutObject` media policy is attached to web, worker, migration, seed, refresh, and weekly-report tasks.
- Files: `infra/sst.config.ts`, `scripts/deploy-sst.sh`
- Current mitigation: CloudFront terminates viewer TLS, production resources use retained AWS identities, and SST deployment uses contributor authorization.
- Recommendations: Use HTTPS to the app origin when feasible and split S3 IAM policies so one-off operational tasks do not all receive write access to media and static asset buckets.

**Public Mapbox token is injected into every layout render:**
- Risk: `MAPBOX_ACCESS_TOKEN` is exposed in a meta tag and on `window`; this is appropriate only for a public Mapbox token.
- Files: `app/views/layouts/application.html.erb`, `app/javascript/map_view/index.jsx`, `app/javascript/stats/map/config.js`
- Current mitigation: Client-side config treats missing placeholder values as disabled map tokens.
- Recommendations: Validate production token shape as public-only and avoid placing secret Mapbox tokens in `MAPBOX_ACCESS_TOKEN` or `MapboxAccessToken`.

## Performance Bottlenecks

**Search index refresh is global and non-concurrent:**
- Problem: `RefreshIndicesJob` runs `REFRESH MATERIALIZED VIEW cases_search_index;` and `Case#refresh_indices` queues it on selected metadata saves.
- Files: `app/jobs/refresh_indices_job.rb`, `app/models/case.rb`, `app/services/find_cases.rb`, `lib/tasks/indices.rake`, `db/migrate/20241011080359_update_case_search_index_for_postgres16.rb`
- Cause: The materialized view covers case, page, podcast, and card content and refreshes as one object.
- Improvement path: Use `REFRESH MATERIALIZED VIEW CONCURRENTLY` where the unique index supports it, debounce refresh jobs, and keep search tests seeded with a refreshed view.

**Stats endpoints aggregate over event history:**
- Problem: Case stats query Ahoy events, visits, and invisible-reader roles for each case/date range.
- Files: `app/controllers/cases/stats_controller.rb`, `app/services/case_stats_service.rb`, `app/services/case_stats_service/query.rb`, `app/models/ahoy/event.rb`, `db/migrate/20250107000000_add_case_id_to_ahoy_events.rb`
- Cause: Cache keys depend on max event id, and cache misses run a grouped query over event tables.
- Improvement path: Keep `idx_ahoy_events_case_id_time`, consider periodic rollups for high-traffic cases, and add query-plan checks before raising event retention or traffic volume.

**Public catalog cache misses hit Rails serialization:**
- Problem: Anonymous catalog JSON has short Rails/CloudFront caching, but cold or invalidated requests execute policy scopes and serializers.
- Files: `app/controllers/concerns/public_catalog_cache.rb`, `app/controllers/catalog/libraries_controller.rb`, `app/controllers/catalog/languages_controller.rb`, `app/controllers/tags_controller.rb`, `infra/sst.config.ts`
- Cause: Cache keys use model timestamps and route-specific render strings; misses go through Rails.
- Improvement path: Profile serializer hotspots, keep cache TTLs anonymous-only, and add request specs for signed-in/private variants before increasing TTLs.

**Wikidata and SPARQL requests are synchronous external calls:**
- Problem: Public `/sparql` endpoints and case Wikidata link creation call Wikidata during the request.
- Files: `app/controllers/sparql_controller.rb`, `app/services/wikidata.rb`, `app/models/wikidata_link.rb`, `app/controllers/wikidata_links_controller.rb`
- Cause: `SPARQL::Client` is called directly, and only saved case links use `cached_json`.
- Improvement path: Add timeouts, short-lived search caching, and background refresh for saved links; keep request specs stubbing live Wikidata access.

**Production Docker builds compile assets inside a broad context:**
- Problem: `Dockerfile` copies the full repository into the image before asset precompile and app bootsnap precompile.
- Files: `Dockerfile`, `.dockerignore`, `package.json`, `pnpm-lock.yaml`, `Gemfile.lock`
- Cause: Rails/Shakapacker builds need source, Ruby gems, Node packages, and precompiled assets in one image pipeline.
- Improvement path: Keep generated artifacts out of the Docker context, expand `.dockerignore`, and preserve deterministic pnpm/bundle install layers.

## Fragile Areas

**Route catchalls and React route shells:**
- Files: `config/routes.rb`, `app/controllers/cases_controller.rb`, `app/controllers/catalog_controller.rb`, `app/javascript/Case.jsx`, `app/javascript/catalog`
- Why fragile: `config/routes.rb` mixes Rails resources, locale redirects, case React Router catchalls, catalog catchalls, and public JSON endpoints.
- Safe modification: Derive route groups from `config/routes.rb`, verify console/network errors on `localhost:3000`, and avoid catchall changes without request specs.
- Test coverage: Request specs exist under `spec/requests`, but Playwright route coverage is not route-complete.

**Global layout and asset loading:**
- Files: `app/views/layouts/application.html.erb`, `app/assets/stylesheets/application.css`, `app/javascript/packs/styles.js`, `config/webpack`, `lib/webpack/application.js`
- Why fragile: The layout injects release metadata, Mapbox configuration, Sentry CDN script, Shakapacker packs, asset-pipeline CSS/JS, and global Blueprint compatibility in one shared page shell.
- Safe modification: Change one asset source at a time and run browser QA for public catalog, case shell, admin, deployment, and editor routes.
- Test coverage: `app/javascript/shared/__tests__/blueprintAssetContract.test.js` and `app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js` cover part of the contract; visual baselines cover only the root screenshots.

**SST deployment release mechanics:**
- Files: `.github/workflows/deploy.yml`, `scripts/deploy-sst.sh`, `infra/sst.config.ts`, `.github/CODEOWNERS`, `SECURITY.md`
- Why fragile: Release IDs, preview hostnames, Cloudflare DNS, immutable asset prefixes, CloudFront alias detachment, S3 pruning, and GitHub releases are coupled across workflow YAML, Bash, and SST TypeScript.
- Safe modification: Use dry-run first, keep contributor authorization in place, preserve `https://www.learngala.com` isolation, and require owner review for deployment-sensitive paths.
- Test coverage: No dedicated automated tests exercise `scripts/deploy-sst.sh`, `.github/workflows/deploy.yml`, or `infra/sst.config.ts`.

**Realtime editing and locks:**
- Files: `app/controllers/locks_controller.rb`, `app/controllers/concerns/verify_lock.rb`, `app/models/concerns/lockable.rb`, `app/jobs/edit_broadcast_job.rb`, `app/channels/edits_channel.rb`, `app/channels/forum_channel.rb`
- Why fragile: Editing depends on dynamic lockable class names, ActionCable streams, Pundit checks, and cleanup jobs.
- Safe modification: Add lock request specs before changing lockable params, channel subscriptions, or broadcast serialization.
- Test coverage: `spec/models/concerns/lockable_spec.rb`, `spec/requests/locks_and_taggings_spec.rb`, and `spec/jobs/cleanup_locks_job_spec.rb` cover core lock paths, but channel rejection/error paths are thin.

**LTI and magic-link workflow state:**
- Files: `app/controllers/concerns/selection_params.rb`, `app/controllers/concerns/magic_link.rb`, `app/controllers/catalog/content_items_controller.rb`, `app/controllers/canvas_deployments_controller.rb`, `app/controllers/magic_links_controller.rb`, `app/services/linker_service.rb`
- Why fragile: External launches intentionally skip CSRF in selected controllers and store deployment/selection state in session.
- Safe modification: Keep LTI signature validation and deployment-key paths separated, and add request specs for invalid state before changing redirects.
- Test coverage: `spec/requests/deployment_integration_routes_spec.rb` and `spec/features/following_a_magic_link_spec.rb` cover happy and some invalid paths; the inverted deployment guard lacks direct unit coverage.

## Scaling Limits

**AWS production capacity is small and single-region/single-AZ oriented:**
- Current capacity: Production web service uses 2 to 3 Fargate tasks, worker uses 1 to 2 tasks, Postgres is `t4g.small`, Redis is `t4g.micro`, and `multiAz`/proxy are disabled.
- Limit: Higher traffic, large catalog caches, Sidekiq bursts, or database failover events can exhaust headroom.
- Scaling path: Increase SST service scaling, move database/cache to private HA-ready topology, enable RDS proxy or Multi-AZ when traffic justifies cost, and add CloudWatch alarms.
- Files: `infra/sst.config.ts`, `config/puma.rb`, `config/sidekiq.yml`

**Sidekiq queues share one worker service:**
- Current capacity: Critical, high, default, mailers, ActiveStorage, and Ahoy queues are all handled by `GalaWorker`.
- Limit: Slow archive, email, ActiveStorage, or index jobs can compete with realtime broadcast jobs.
- Scaling path: Split high/critical queues into a separate worker service or tune Sidekiq queues per workload.
- Files: `infra/sst.config.ts`, `config/sidekiq.yml`, `app/jobs/application_job.rb`

**Route coverage does not scale with the Rails route surface:**
- Current capacity: Visual route matrix includes 10 route definitions and two committed root screenshots.
- Limit: Admin, deployment, editor, case nested, LTI, stats, and reading-list regressions can land without screenshot coverage.
- Scaling path: Expand `tests/visual/visual-route-helpers.mjs` from route groups in `config/routes.rb`, commit baselines deliberately, and classify route noise.
- Files: `config/routes.rb`, `playwright.config.mjs`, `tests/visual/visual-route-helpers.mjs`, `tests/visual/visual-routes.spec.mjs`, `tests/visual/__screenshots__`

**Search and stats depend on unbounded historical tables:**
- Current capacity: Search uses one materialized view, stats use Ahoy event history with indexes.
- Limit: Larger content and event tables make refreshes and cache misses slower.
- Scaling path: Add retention/rollup strategy for `ahoy_events`, schedule index refreshes, and monitor query plans.
- Files: `app/jobs/refresh_indices_job.rb`, `app/services/case_stats_service/query.rb`, `app/models/ahoy/event.rb`, `db/structure.sql`

## Dependencies at Risk

**Legacy frontend runtime and test dependencies:**
- Risk: React 16.8, React Router 4, Redux 4, styled-components 4, Jest 24, Babel ESLint, jsdom 11, core-js 2, uuid 3, lodash 4.17.15, and Mapbox GL 0.54 create compatibility and vulnerability-audit pressure.
- Impact: Modern package upgrades can require test transforms, React API changes, CSS behavior changes, or browser polyfill changes.
- Migration plan: Keep React and Blueprint major-version holds during v1.1, run `pnpm audit` before release, and upgrade test tooling before broad runtime dependency changes.
- Files: `package.json`, `pnpm-lock.yaml`, `jest.config.js`, `.planning/REQUIREMENTS.md`

**Ruby dependencies include pinned and git-sourced libraries:**
- Risk: `administrate` is pinned, `haml` is pinned, `omniauth-google-oauth2` is pinned, `omniauth-lti` and `markerb` come from git sources, and `virtus` is a model dependency with limited upgrade headroom.
- Impact: Ruby/Rails upgrades can be blocked by APIs that lag current Rails and Ruby behavior.
- Migration plan: Track each pinned or git-sourced gem with a compatibility reason, add focused specs before replacing gems, and avoid unplanned major jumps.
- Files: `Gemfile`, `Gemfile.lock`, `app/dashboards`, `app/controllers/authentication_strategies/omniauth_callbacks_controller.rb`, `app/models`

**Production includes factory and faker tooling:**
- Risk: `factory_bot_rails` and `faker` are loaded outside development/test because Heroku review app seeding uses them.
- Impact: Production boot surface and dependency audit scope include test-data libraries.
- Migration plan: Move review seeding behind a task-specific group or separate seed image once AWS review/preview seeding no longer needs runtime factory dependencies.
- Files: `Gemfile`, `db/seeds.rb`, `.github/workflows/deploy.yml`, `infra/sst.config.ts`

**Infra package management is separate from the app package manager:**
- Risk: App JavaScript uses pnpm, while `infra` uses npm and `infra/package-lock.json`.
- Impact: Dependency audit and install commands differ between application and SST infrastructure work.
- Migration plan: Keep `infra/package-lock.json` isolated and document npm-only infra commands; do not mix `pnpm-lock.yaml` assumptions into `infra`.
- Files: `package.json`, `pnpm-lock.yaml`, `infra/package.json`, `infra/package-lock.json`, `.github/workflows/deploy.yml`

## Missing Critical Features

**No general CI test workflow is present:**
- Problem: `.github/workflows` contains only the deploy workflow.
- Blocks: Pull requests do not have an in-repo GitHub Actions gate for RSpec, frontend tests, linting, build, visual tests, or secret scanning.
- Files: `.github/workflows/deploy.yml`, `scripts/scan-staged-secrets`, `package.json`, `Gemfile`, `run-rspec.sh`

**Visual regression coverage is not route-complete:**
- Problem: Playwright is configured, but the route matrix and committed baselines are small.
- Blocks: Route-driven UI compatibility cannot be enforced automatically across the surface described by `config/routes.rb`.
- Files: `playwright.config.mjs`, `tests/visual/visual-route-helpers.mjs`, `tests/visual/visual-routes.spec.mjs`, `tests/visual/noise-allowlist.json`, `tests/visual/__screenshots__`

**Frontend test modernization is not complete:**
- Problem: `pnpm test` runs Jest 24, and Vitest is present only as a spike command.
- Blocks: Modern package module formats and React 16 component tests do not have a durable selected runner configuration.
- Files: `package.json`, `jest.config.js`, `spec/support/jest-setup.js`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`

**Secrets scanning exists but is not wired into the visible workflow:**
- Problem: `scripts/scan-staged-secrets` is present, but no GitHub workflow invokes it.
- Blocks: Secret hygiene depends on local operator discipline.
- Files: `scripts/scan-staged-secrets`, `.github/workflows/deploy.yml`, `SECURITY.md`, `.gitignore`, `.dockerignore`

**Deployment preview branch input is constrained to a fixed choice list:**
- Problem: The deploy workflow `branch` input only lists selected branches.
- Blocks: Arbitrary branch preview subdomains under `*.learngala.dev` require workflow edits or branch-list expansion.
- Files: `.github/workflows/deploy.yml`, `scripts/deploy-sst.sh`, `infra/sst.config.ts`

## Test Coverage Gaps

**Role endpoint authorization:**
- What's not tested: Anonymous and non-editor attempts to add or remove roles.
- Files: `app/controllers/roles_controller.rb`, `spec/requests/reader_management_routes_spec.rb`, `app/policies/reader_policy.rb`
- Risk: Privilege escalation can pass the existing editor happy-path spec.
- Priority: High

**LTI deployment guard:**
- What's not tested: `LinkerService::LTIStrategy#ensure_deployment_exists` when a deployment is absent and when one already exists.
- Files: `app/services/linker_service.rb`, `spec/requests/deployment_integration_routes_spec.rb`, `spec/support/integration/lti_launch.rb`
- Risk: LTI launches can fail to create required deployments or attempt duplicates unnoticed.
- Priority: High

**Security configuration regression tests:**
- What's not tested: Redis TLS verification expectations, frame ancestor policy, broad Sentry parameter filtering, and Docker context exclusions.
- Files: `config/environments/production.rb`, `config/initializers/sidekiq.rb`, `config/cable.yml`, `config/application.rb`, `app/controllers/application_controller.rb`, `.dockerignore`
- Risk: Security posture can regress during deployment or layout changes without a failing test.
- Priority: High

**SST deploy script and workflow behavior:**
- What's not tested: `user_data` allowlist parsing, secret-looking input rejection, production remove refusal, release ID validation, asset pruning, CloudFront alias detachment, and GitHub release notes generation.
- Files: `scripts/deploy-sst.sh`, `.github/workflows/deploy.yml`, `infra/sst.config.ts`
- Risk: Operational errors are discovered only in dry-run or live deploys.
- Priority: Medium

**Frontend editor and Wikidata behavior:**
- What's not tested: Draft smart typography debugger path, Wikidata search error handling, reorder persistence, and console-noise suppression.
- Files: `app/javascript/shared/draftHelpers.js`, `app/javascript/wikidata/SortableWikidataList.jsx`, `app/javascript/wikidata/SearchWikidata.jsx`, `app/javascript/wikidata`
- Risk: Browser QA and editor workflows can break without frontend test failures.
- Priority: Medium

**Visual route matrix breadth:**
- What's not tested: Most route groups from `config/routes.rb`, including nested case, deployment, stats, admin details, LTI, reading-list, and protected reader surfaces.
- Files: `config/routes.rb`, `tests/visual/visual-route-helpers.mjs`, `tests/visual/visual-routes.spec.mjs`, `tests/visual/__screenshots__`
- Risk: Blueprint-era visual compatibility can regress outside root and the small Playwright matrix.
- Priority: Medium

---
*Concerns audit: 2026-05-30*
