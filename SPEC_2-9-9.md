# SPEC 2.9.9 Nightly SST Research Checklist

This checklist is for proving and then running the local SST path that brings up
the experimental `nightly` Gala environment without mutating Heroku or the
current `.com` production app.

## Non-Negotiables

- [ ] Use `AWS_PROFILE=gala`.
- [ ] Use `AWS_REGION=us-west-2` unless an explicit region migration is planned
  first. Read-only checks on 2026-06-05 found Gala ECS, RDS, Valkey, SSM, ECR,
  S3, SES configuration, and CloudFront routing in or tied to `us-west-2`; the
  same Gala resource queries in `us-east-2` returned no matching resources.
- [ ] Use the exact stage string `SST_STAGE=nightly`; `SST_STAGE=nighly` is a
  typo and must fail before any deploy.
- [ ] Do not run Heroku mutation commands. Heroku is read-only context only.
- [ ] Keep nightly database and cache behavior experimental but non-destructive:
  it may share the dev RDS/Valkey runtime, but it must not run migration/seed
  tasks against shared dev data without a separate approval.
- [ ] Nightly ECS must have only web and worker task-definition families. Do not
  create separate nightly migration, seed, refresh, weekly, or scheduler task
  definitions.
- [ ] Nightly must run on Fargate Spot.
- [ ] Nightly must pull the `gala:nightly` ECR image tag, with the same digest
  also tagged by immutable release id.
- [ ] Do not push `infra/rc_2-9-9` or move the Git tag `nightly` until the
  nightly SST infra is confirmed working locally.

## Current Evidence Snapshot

- [x] Current branch is `infra/rc_2-9-9`.
- [x] `.planning/` is absent in this checkout; use the prompt-provided AGENTS
  instructions plus repo docs/scripts as the active guidance.
- [x] Existing unrelated dirty files are present. Commit only this spec and the
  `do2-9er` skill artifacts unless the user explicitly expands scope.
- [x] `scripts/deploy-sst.sh` already accepts `dev|nightly|production`, rejects
  DB/cache env leakage, builds `Dockerfile.production`, pushes ECR images, and
  passes `GALA_NIGHTLY_DOMAIN_NAME` plus shared-dev IDs to SST.
- [x] `infra/sst.config.ts` already supports `stage === "nightly"` and imports
  shared dev VPC, cluster, database, and cache only when all four IDs are set.
- [x] `infra/sst.config.ts` originally created `GalaMigrate`,
  `GalaSeedDatabase`, `GalaRefreshIndices`, and `GalaWeeklyReport` task
  definitions for nightly too. The 2026-06-05 local pass now guards those
  management tasks behind `!isNightly`; nightly creates only web and worker.
- [x] `dev.learngala.global` contains `CF_ACCOUNT_ID` and `CF_ACCESS_TOKEN`.
  The local deploy path must map these to `CLOUDFLARE_ACCOUNT_ID` and
  `CLOUDFLARE_API_TOKEN`; do not print or commit values.
- [x] Cloudflare zone `learngala.dev` is active. Exact DNS records for
  `nightly.learngala.dev` and `nightly.dev.learngala.dev` are absent, but the
  existing `*.dev.learngala.dev` wildcard resolves `nightly.dev.learngala.dev`
  to the shared router.
- [x] Current ACM certificate in `us-east-1` covers `learngala.dev`,
  `dev.learngala.dev`, and `*.dev.learngala.dev`. It does not cover
  `nightly.learngala.dev`.
- [x] Current dev ECS web/worker services use `FARGATE_SPOT`; production uses
  regular `FARGATE`.
- [x] ECR repository `gala` exists; no `nightly` tag was present in the latest
  read-only check.
- [x] Dev Valkey replication group id is `gala-dev-galacachecluster-bbtxmett`;
  its member cache node is `gala-dev-galacachecluster-bbtxmett-001`.
- [x] `npx sst state list` shows only `dev` and `production`; `nightly` is not
  yet a deployed SST stage.
- [x] `npx sst diff --stage nightly` currently returns `Stage not found`. For
  the first nightly creation, the non-mutating SST CLI evidence is state-list
  plus this explicit missing-stage stop; the first create operation is
  `npx sst deploy --stage nightly` after the shape, image, and test gates pass.
- [x] 2026-06-06 SST CLI evidence was refreshed in the requested order with
  `DATABASE_URL`, `REDIS_URL`, `REDIS_HOST`, and `CACHE_URL` cleared:
  `npx sst refresh --stage nightly` returned `Stage not found`, then
  `npx sst diff --stage nightly` returned `Stage not found`. No deploy was run.
- [x] 2026-06-05 local image gate passed:
  `docker build --platform linux/arm64 -f Dockerfile.production -t gala:nightly .`
  completed, asset precompile ran under Propshaft, and
  `curl -i http://127.0.0.1:3005/up` returned `HTTP/1.1 200 OK` with body `OK`.
- [x] 2026-06-05 package cleanup removed the remaining Ruby Sprockets/SassC path
  by upgrading Administrate to `~> 1.0`; `rg
  "shakapacker|webpacker|sassc|sprockets" Gemfile Gemfile.lock package.json
  pnpm-lock.yaml config` returns no matches.
- [x] 2026-06-05 local Docker Compose stack now runs Rails through Thruster:
  `HTTP_PORT=3000`, `TARGET_PORT=3001`, and blank `HTTPS_PORT` because SST
  offloads TLS before the container. `curl -i http://127.0.0.1:3000/up`
  returned `HTTP/1.1 200 OK`; `web` resolves `db`/`valkey`, connects to
  Postgres as `gala`, and receives Valkey `PONG` over the Redis protocol.
- [x] 2026-06-05 local Docker Compose owns the dev process graph directly:
  `web`, `worker`, `js`, `css`, `ws`, `db`, and `valkey` are Compose services on
  an explicit Compose-scoped `app` network. `ws` runs AnyCable-Go on the
  Rails-style development port `3002`, with Valkey providing Redis-protocol
  pub/sub. The app source mount is an explicit delegated bind, while
  `node_modules`, `tmp`, and `app/assets/builds` are named volumes to keep
  high-churn dependency/runtime/build writes off the host bind mount.
  `Procfile.dev`/Foreman is no longer a required dev-process layer.
- [x] 2026-06-06 production image gate passed:
  `docker build --platform linux/amd64 -f Dockerfile.production -t gala:nightly .`
  completed, asset precompile ran under Propshaft, the image default command is
  `bundle exec thrust bin/rails server -b 0.0.0.0 -p 3001`, and image env sets
  `HTTP_PORT=3000`, blank `HTTPS_PORT`, and `TARGET_PORT=3001`. A disposable
  `gala:nightly` container on the local Compose network returned `HTTP/1.1 200
  OK` with body `OK` for `curl -i http://127.0.0.1:3005/up`.
- [x] 2026-06-06 runtime logging defaults to information-level output:
  production Rails uses `RAILS_LOG_LEVEL` with default `info`, and Sidekiq
  verbose logging is opt-in through `SIDEKIQ_VERBOSE=true`.
- [x] 2026-06-06 frontend tests now run on Vitest instead of Jest:
  `pnpm test` invokes `NODE_ENV=test vitest run`, Jest runner packages and
  `jest.config.js` were removed, and the full frontend suite passed with 21
  files passed, 1 skipped, 116 tests passed, and 3 skipped.
- [x] Realtime websocket/AnyCable/Valkey separation is now part of the local
  runtime target: Rails exposes AnyCable HTTP RPC at `/_anycable`, AnyCable-Go
  owns `/cable` on port `3002`, and Valkey provides Redis-protocol pub/sub.
- [x] Development live reload uses the same websocket path instead of a separate
  dev server: Vite/Rollup watch posts to the dev-only HMR daemon endpoint `/hmrd`
  after a successful rebuild. The short URI intentionally reads like "hammered,"
  a tool-call pun that fits the orchard/farming development vocabulary.
  after a successful rebuild, Rails broadcasts through
  `DevelopmentLiveReloadChannel`, and the browser refreshes over AnyCable.
- [ ] PostHog API/project values are present as default secrets, but PostHog is
  intentionally not enabled yet. Activation remains a separate spec task.

## External Research Notes

- [x] SST `sst.aws.Service` supports `capacity: "spot"` for Fargate Spot and
  warns that changing capacity recreates the ECS service.
- [x] AWS ECS Fargate Spot can be interrupted with a two-minute warning and does
  not automatically fall back to on-demand capacity when Spot capacity is
  unavailable.
- [x] SST Router custom domains can use the Cloudflare DNS adapter, and
  CloudFront-backed custom-domain certificates must live in ACM `us-east-1`.
- [x] CloudFront alternate domain names must be covered by the attached
  certificate SAN. Therefore `nightly.learngala.dev` is a cert/router-alias
  change, not just a DNS record.
- [x] Cloudflare proxied records enable WAF/DDoS protections for HTTP(S)
  traffic, but Cloudflare also warns about proxying CNAMEs that point to other
  CDN/proxy providers. Keep `GALA_CLOUDFLARE_PROXY=false` until CloudFront plus
  Cloudflare proxy behavior is tested deliberately.
- [x] Cloudflare WAF custom rules can use Managed Challenge; Cloudflare
  recommends Managed Challenges for most WAF rules, but challenge pages can
  break non-HTML/XHR flows. Any human-verification experiment must start on a
  narrow HTML route and be validated with browser/network checks.
- [x] Rails 8's default asset pipeline is Propshaft. Propshaft fingerprints and
  serves browser-ready assets; it does not replace JavaScript page-props
  protocols like Inertia and it does not compile Sass or JSX by itself.
- [x] Use `jsbundling-rails` and `cssbundling-rails` with Propshaft for Gala's
  existing React/JSX and Sass needs. This keeps builds in Rails' asset
  precompile path while removing Shakapacker, Sprockets, SassC, and Stimulus.
- [x] Inertia is not required for this migration. Inertia remains a separate
  SPA navigation/page-props decision for replacing Gala's current data
  injection patterns such as `window.caseData`, `window.reader`, preload JSON,
  and `data-*` props.
- [x] Do not put all of `node_modules` on Propshaft's asset paths. Propshaft
  copies every asset in configured paths, so vendor CSS/fonts should enter
  through Vite/Rollup and cssbundling outputs under `app/assets/builds`.
- [x] Blueprint 6 uses the `bp6-*` namespace. This migration keeps legacy
  `pt-*`/`bp4-*` markup intact but mirrors it to `bp6-*` at runtime; a full
  server-rendered class cleanup is a later route-by-route UI pass.

## Asset Pipeline Decision

- [x] Replace Sprockets/SassC with Propshaft.
- [x] Replace Shakapacker/Webpack with Vite/Rollup under `jsbundling-rails`.
- [x] Replace Stimulus controllers with an explicit vanilla DOM bootstrap so
  controller behavior survives without the Stimulus runtime.
- [x] Keep CSS output intentionally small: `javascript-application.css` for
  Blueprint/vendor JavaScript-owned CSS, `application.css` for Gala Sass, and
  `print.css` for print.
- [x] Keep React islands as Rails-served bundles for now. The current migration
  is an asset-management boundary change, not an Inertia or SPA-router rewrite.

## Rails Runtime Decision

- [x] Keep Rails as the required application framework. Do not pivot this spec
  to ActiveRecord-only, Sinatra, Go services over a message broker, Cap'n Proto,
  or another application runtime.
- [ ] Audit the Rails middleware stack and remove or disable middleware only
  when Gala has no current use for it. Each removal must be covered by request
  or system evidence for routing, sessions, cookies, CSRF, uploads, asset
  delivery, cache headers, redirects, and error handling.
- [ ] Treat native speedups as targeted app-owned extensions, not a framework
  rewrite. Prefer maintained gems that already provide native extensions or
  compiled bindings before adding app-owned C code.
- [ ] Vendor compiled Ruby C bindings under an explicit `vendor/` directory only
  when no suitable maintained gem exists and tests, profiling, or
  missing-functionality evidence shows they are needed.
- [ ] Any vendored C binding must include source/build inputs, supported
  platform notes, CI/Docker build wiring, load-time failure behavior, and a
  minimal Ruby fallback or explicit skip path where practical.
- [ ] Do not use native bindings to hide slow request-path work. Slow CPU or I/O
  tasks, including PDF generation/writing, must move to an async background
  worker unless there is a measured reason they must remain synchronous.
- [ ] Keep middleware trimming and native bindings reversible until the nightly
  runtime has passing test, asset-precompile, and container smoke evidence.

## Ruby Dependency Pruning Decision

- [ ] Remove the remaining low-value Ruby gems from `Gemfile` and
  `Gemfile.lock`; do not replace them with equivalent gems unless a failing
  test or boot/runtime evidence proves Gala still needs the functionality.
- [ ] Prefer deletion over compatibility shims. If a removed gem exposes a tiny
  helper Gala still needs, vendor the helper as a narrow single-file
  implementation under an explicit `vendor/` directory or app-local namespace.
  Do not vendor whole gems.
- [ ] Prefer maintained gems that already provide required native extensions.
  Only vendor compiled Ruby C bindings when no suitable maintained gem exists
  and profiling or test evidence proves the slow path matters.
- [ ] Prefer the Rails/37signals-style test stack: Minitest, Rails' built-in
  test helpers, and plain Ruby assertions/scripts. Avoid retaining RSpec,
  Guard, Shoulda, or matcher-only gems unless a migration blocker is documented
  with a focused replacement plan.
- [ ] Remove Rack middleware gems and their configuration after route/session
  smoke evidence covers the replaced behavior:
  `rack-attack`, `rack-canonical-host`, and `rack-timeout`.
- [ ] Remove storage/image/list/pagination/cache/form-compatibility gems after
  replacing app references or documenting deletion of the feature path:
  `aws-sdk-s3`, `bootsnap`, `connection_pool`, `image_processing`,
  `active_storage_validations`, `acts_as_list`, `kaminari`, `memoist`,
  `time_for_a_boolean`, and `virtus`.
- [ ] Remove legacy integration/auth/JSON/rendering/reporting/search gems after
  replacing app references or deleting dead code paths: `ims-lti`,
  `omniauth-facebook`, `multi_json`, `oj`, `oj_mimic_json`, `pdfkit`,
  `redcarpet`, `rexml`, `administrate-field-active_storage`, `lograge`, and
  `sparql-client`.
- [x] Remove all Sentry integration gems and initializers/config references:
  `sentry-ruby`, `sentry-rails`, and `sentry-sidekiq`.
- [ ] Remove Heroku-era runtime/profiling gems and any related boot hooks:
  `vernier` and `barnes`.
- [ ] Remove development/test-only dependency stack where possible:
  `pry`, `pry-rails`, `dotenv-rails`, `factory_bot_rails`, `faker`,
  `guard-rspec`, `rspec`, `rspec-composable_json_matchers`,
  `rspec_junit_formatter`, `rspec-rails`, `rubocop`, `rubocop-faker`, `ffi`,
  `shoulda-matchers`, and `sqlite3`.
- [ ] Remove stdlib gems listed in the Gemfile once Ruby 4/Rails boot confirms
  they are unnecessary as explicit dependencies: `benchmark` and `csv`.
- [ ] Before marking the dependency-pruning lane complete, verify no boot-time,
  initializer, middleware, task, job, model, controller, view, or test reference
  still requires the removed gems; update Docker image build, asset precompile,
  and container smoke evidence after the lockfile changes.

## Preferred Hostname Gate

- [ ] Preferred: `https://nightly.learngala.dev`.
- [ ] Stop early if the team is not ready to mutate the shared router
  certificate/aliases. The current cert does not cover this host.
- [ ] To use the preferred host, research and implement the smallest safe
  router-domain change that adds `nightly.learngala.dev` to the shared
  CloudFront alias/certificate set without touching `learngala.com` or Heroku.
- [ ] Fallback: `https://nightly.dev.learngala.dev`.
- [ ] The fallback is already covered by the existing `*.dev.learngala.dev`
  wildcard DNS and cert shape. Use it when cert work would delay the experiment.

## Required Local Inputs

Current fallback-host input set, used until `nightly.learngala.dev` cert/router
coverage is implemented:

```sh
export AWS_PROFILE=gala
export AWS_REGION=us-west-2
export SST_STAGE=nightly
export GALA_DOMAIN_NAME=learngala.dev
export GALA_NIGHTLY_DOMAIN_NAME=nightly.dev.learngala.dev
export GALA_ROUTER_DISTRIBUTION_ID=E3FF4TTU9Q4XTY
export GALA_SHARED_DEV_VPC_ID=vpc-030eda5dfde37d35b
export GALA_SHARED_DEV_CLUSTER_ID=arn:aws:ecs:us-west-2:353760060567:cluster/gala-dev-GalaClusterCluster-zeeusfkv
export GALA_SHARED_DEV_DATABASE_ID=gala-dev-galadatabaseinstance-vfkaokum
export GALA_SHARED_DEV_CACHE_CLUSTER_ID=gala-dev-galacachecluster-bbtxmett
export GALA_ENABLE_CUSTOM_DOMAIN=true
export GALA_CLOUDFLARE_PROXY=false
export GALA_CONTAINER_ARCHITECTURE=arm64
export SST_IMAGE_NAME=gala
export SST_IMAGE_TAG=nightly
```

Credential mapping, without echoing values:

```sh
set -a
source ./dev.learngala.global
set +a
export CLOUDFLARE_ACCOUNT_ID="${CF_ACCOUNT_ID}"
export CLOUDFLARE_API_TOKEN="${CF_ACCESS_TOKEN}"
export CLOUDFLARE_ZONE_ID=b95aebc5cd4c107a97157de72bd75627
```

Before running SST, clear deploy-sensitive connection overrides:

```sh
unset DATABASE_URL REDIS_URL REDIS_HOST CACHE_URL
```

## Phase 1: Research And SST State

- [x] Re-read `scratch.md`, `scripts/deploy-sst.sh`, `infra/sst.config.ts`,
  `docs/ops/workflows/deploy.md`, `docs/ops/workflows/infra.md`,
  `docs/aws-sst-secret-inventory.md`, and `docs/releases/v2.9.9.md`.
- [x] Verify AWS identity with read-only `aws sts get-caller-identity`.
  2026-06-05 result: account `353760060567`, user `nate.papes`.
- [x] Verify `msc-gala` bucket region remains `us-west-2`.
- [x] Verify dev SSM parameter names exist under `/gala/dev/` without printing
  values.
- [x] Verify dev shared resources remain active: VPC, cluster, RDS, Valkey, and
  router distribution.
- [x] Verify `nightly.learngala.dev` cert coverage before attempting the
  preferred hostname. If still absent, use the fallback or implement cert/router
  alias work first.
- [x] Run non-mutating SST state evidence through the SST CLI. Do not push or tag
  first:

```sh
env AWS_PROFILE=gala \
  AWS_REGION=us-west-2 \
  AWS_DEFAULT_REGION=us-west-2 \
  npx sst state list
```

- [x] If `nightly` is absent, record that `npx sst diff --stage nightly` is
  expected to stop with `Stage not found` and do not treat the infra as
  confirmed yet.
- [ ] If `nightly` already exists, run `sst refresh` first, then run the SST
  diff and review it before any deploy:

```sh
env -u DATABASE_URL -u REDIS_URL -u REDIS_HOST -u CACHE_URL \
  AWS_PROFILE=gala \
  AWS_REGION=us-west-2 \
  AWS_DEFAULT_REGION=us-west-2 \
  SST_STAGE=nightly \
  GALA_DOMAIN_NAME=learngala.dev \
  GALA_NIGHTLY_DOMAIN_NAME=nightly.dev.learngala.dev \
  GALA_ROUTER_DISTRIBUTION_ID=E3FF4TTU9Q4XTY \
  GALA_SHARED_DEV_VPC_ID=vpc-030eda5dfde37d35b \
  GALA_SHARED_DEV_CLUSTER_ID=arn:aws:ecs:us-west-2:353760060567:cluster/gala-dev-GalaClusterCluster-zeeusfkv \
  GALA_SHARED_DEV_DATABASE_ID=gala-dev-galadatabaseinstance-vfkaokum \
  GALA_SHARED_DEV_CACHE_CLUSTER_ID=gala-dev-galacachecluster-bbtxmett \
  GALA_ENABLE_CUSTOM_DOMAIN=true \
  GALA_CLOUDFLARE_PROXY=false \
  GALA_CONTAINER_ARCHITECTURE=arm64 \
  GALA_APP_IMAGE_URI=353760060567.dkr.ecr.us-west-2.amazonaws.com/gala:nightly \
  GALA_WEB_IMAGE_URI=353760060567.dkr.ecr.us-west-2.amazonaws.com/gala:nightly \
  CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID}" \
  CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN}" \
  CLOUDFLARE_ZONE_ID="${CLOUDFLARE_ZONE_ID}" \
  npx sst refresh --stage nightly
```

```sh
env -u DATABASE_URL -u REDIS_URL -u REDIS_HOST -u CACHE_URL \
  AWS_PROFILE=gala \
  AWS_REGION=us-west-2 \
  AWS_DEFAULT_REGION=us-west-2 \
  SST_STAGE=nightly \
  GALA_DOMAIN_NAME=learngala.dev \
  GALA_NIGHTLY_DOMAIN_NAME=nightly.dev.learngala.dev \
  GALA_ROUTER_DISTRIBUTION_ID=E3FF4TTU9Q4XTY \
  GALA_SHARED_DEV_VPC_ID=vpc-030eda5dfde37d35b \
  GALA_SHARED_DEV_CLUSTER_ID=arn:aws:ecs:us-west-2:353760060567:cluster/gala-dev-GalaClusterCluster-zeeusfkv \
  GALA_SHARED_DEV_DATABASE_ID=gala-dev-galadatabaseinstance-vfkaokum \
  GALA_SHARED_DEV_CACHE_CLUSTER_ID=gala-dev-galacachecluster-bbtxmett \
  GALA_ENABLE_CUSTOM_DOMAIN=true \
  GALA_CLOUDFLARE_PROXY=false \
  GALA_CONTAINER_ARCHITECTURE=arm64 \
  GALA_APP_IMAGE_URI=353760060567.dkr.ecr.us-west-2.amazonaws.com/gala:nightly \
  GALA_WEB_IMAGE_URI=353760060567.dkr.ecr.us-west-2.amazonaws.com/gala:nightly \
  CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID}" \
  CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN}" \
  CLOUDFLARE_ZONE_ID="${CLOUDFLARE_ZONE_ID}" \
  npx sst diff --stage nightly
```

- [ ] For an existing `nightly` stage, confirm `sharedDevRuntime: true` appears
  in SST outputs or diff evidence.
- [ ] For an existing `nightly` stage, confirm the diff creates/updates only
  nightly web/worker services and their task definitions. Stop if it includes
  nightly migration/seed/refresh/weekly task definitions.

## Phase 2: Fix Nightly Shape

- [x] Update `infra/sst.config.ts` so nightly creates only `GalaWeb` and
  `GalaWorker`.
- [x] Keep production scheduled jobs and production one-off task definitions
  intact unless a separate production change is requested.
- [x] Keep dev behavior intact unless dev intentionally shares the same
  web/worker-only experiment.
- [ ] Ensure nightly web/worker task definition families are stage-specific and
  do not reuse dev task definition family names.
- [x] Ensure web command remains Puma and worker command remains Sidekiq.
- [x] Ensure both web and worker use `capacity: "spot"` or the equivalent
  capacity provider strategy with `FARGATE_SPOT` weight greater than zero and
  `FARGATE` weight zero.
- [ ] Ensure `S3_BUCKET=msc-gala`, shared SES SMTP secrets, shared dev
  `DATABASE_URL`, and shared dev `REDIS_URL` are injected through SST/SSM, not
  copied from Heroku config.
- [ ] Ensure `BASE_URL` and Action Cable settings resolve to the selected
  nightly hostname.

## Phase 3: Trust The Image Locally

- [x] Build the production multi-stage image fresh:

```sh
docker build --no-cache --platform linux/arm64 \
  -f Dockerfile.production \
  -t gala:nightly \
  --build-arg rails_env=production \
  .
```

- [x] Record image size and fail if it exceeds `GALA_MAX_IMAGE_SIZE_BYTES`.
  2026-06-05 local result: `gala:nightly` is ARM64 Linux, about 1.20 GB,
  below the 1.5 GB wrapper limit.
- [ ] Confirm final runtime image has no dev/test source payload such as
  `spec/`, `test/`, `node_modules/`, or `.git`.
- [x] Run a container-level boot check with production env placeholders only,
  not Heroku URLs.

## Phase 4: Docker Compose And Local Tests

- [x] Start or rebuild the local Docker stack:

```sh
docker compose up --build
```

- [x] 2026-06-05 local result: `docker compose up -d --build` rebuilt
  `gala_ruby4-0-3_rails8-1_node24:latest`, started `db`, `redis`, and `web`,
  and verified `/up`, Postgres, and Redis through the compose network.
- [x] Open `http://localhost:3000` and check browser console and network errors
  before treating local UI as healthy.
  2026-06-06 local evidence used the Docker-mapped web port
  `http://host.docker.internal:13000` because this checkout already had
  `APP_HOST_PORT=13000` in use. Root and sign-in pages load with no page
  errors, no failed external requests, and no failed local requests after the
  browser-shim fixes. Known remaining non-app smoke noise: the Docker-backed
  browser reports `ws://localhost:13002/cable` refused because `localhost`
  resolves inside the browser container; the host endpoint is listening
  (`curl -i http://127.0.0.1:13002/cable` returns HTTP 400 Bad Request from
  AnyCable for a non-websocket request). Root still emits an existing React 19
  list-key warning from `FormattedMessage`.
- [x] Run focused checks for touched files:

```sh
bash -n scripts/deploy-sst.sh
ruby scripts/ops/test-workflow-architecture-defaults.rb
pnpm test
./run-rspec.sh
bundle exec rake test:unit
```
  2026-06-06 local evidence: `bash -n scripts/deploy-sst.sh`,
  `ruby scripts/ops/test-workflow-architecture-defaults.rb`, and
  `corepack pnpm test` passed. The first `./run-rspec.sh` exposed local Docker
  state (`gala-redis-1` orphan holding port 6380) and Rails migration misses;
  after `docker compose up -d --remove-orphans`, explicit Action Cable
  broadcast payload hashes, converted-template fixes, Administrate 1.0 helper
  compatibility, and direct `FastJson` case-show JSON cache rendering,
  `./run-rspec.sh` passed with 502 examples and 0 failures. Host
  `bundle exec rake test:unit` passed with 502 examples and 0 failures after
  rebinding Compose Valkey to `localhost:6379`, matching the existing
  `REDIS_URL`.

- [x] If infra TypeScript is touched, run `npm exec --prefix infra tsc -- --noEmit`
  and document any known baseline noise separately from new failures.
  2026-06-05 corrected note: `cd infra && npx tsc --noEmit` finds the current
  `infra/tsconfig.json` but fails in SST-generated/Bun/Node declaration
  baseline noise, not in the touched SST config. The repo workflow-architecture
  test passed.

## Phase 4b: React 19 + Blueprint + Unified Stylesheet Chunk

- [x] Record and pin current npm baseline (`react`, `react-dom`, `@blueprintjs/*`) before mutation.
  2026-06-05 current baseline: Node `v24.15.0`, pnpm `11.5.2`,
  `react@19.2.7`, `react-dom@19.2.7`, `@blueprintjs/core@6.15.0`,
  `@blueprintjs/icons@6.10.0`, `@blueprintjs/select@6.2.1`, and
  `@blueprintjs/datetime@6.1.1`.
- [x] Update dependency manifest entries to `react`/`react-dom` at v19 and the latest
  Blueprint packages approved for the app’s migration path.
- [x] Refresh `pnpm-lock.yaml` with the selected versions and re-run `pnpm install`
  in the app context before QA.
  2026-06-06 local evidence: `corepack pnpm install --frozen-lockfile`
  returned `Already up to date`.
- [x] Run the Blueprint and legacy-bridge unit tests and adjust expectations as needed:

```sh
pnpm test app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js app/javascript/shared/__tests__/blueprintAssetContract.test.js
```

  2026-06-05 local result: the focused Jest command passed the app JavaScript
  suite (`112` passed tests, `3` skipped), with an existing React
  `FormattedList` key warning in `react-intl.test.js` and Node `fs.F_OK`
  deprecation warnings.

- [ ] Add a temporary migration pass to remove `pt-*` usage in server-rendered markup and
  JS-visible helpers where practical, then narrow `app/javascript/shared/blueprintLegacyNamespace.js`
  accordingly.
- [ ] Create/refresh a single unified stylesheet chunk for Blueprint + app-global variables
  so Blueprint component styles and custom overrides are imported consistently from one entry.
- [x] Update runtime class-namespace risk points (`app/helpers/blueprint_form_builder.rb`,
  legacy layouts, and route-specific overrides) so the migration can complete without
  `pt-*` fallback behavior.
  2026-06-05 local result: helper-generated Blueprint classes now emit `bp6-*`
  mirrors beside legacy `pt-*`/`bp4-*`; ActiveStorage upload selectors and
  generated progress markup support `bp6-*`; `axioms.scss` spacing resets cover
  `bp6-*`.
- [x] Run `pnpm test` and focused visual smoke (`pnpm exec playwright` in CI-compatible form) after
  the stylesheet migration before marking the dependency lane complete.
  2026-06-06 local evidence: `corepack pnpm test` passed with 21 files passed,
  1 skipped, 117 tests passed, and 3 skipped. Browser smoke against the
  Compose-served root and sign-in pages found and fixed two real bundle issues:
  `object-inspect` importing Vite's browser external for Node `util.inspect`,
  and `draft-js`/`fbjs` expecting a browser `global`. It also fixed catalog map
  rendering with placeholder `MAPBOX_ACCESS_TOKEN=CHANGEME` so local smoke no
  longer calls Mapbox with a fake token.
- [x] Capture any regressions and keep the lane separate from SST infra gates until style/class
  migration stabilizes.
  2026-06-06 captured remaining non-blocking browser noise: React 19 list-key
  warning on the root page and Docker-browser-only websocket refusal described
  in Phase 4 above.

## Phase 4c: Haml Removal Codemod

- [x] Add a repo-owned codemod script that converts Rails Haml templates to ERB
  and writes converted files as `*.html.erb` beside the original template path.
  Prefer `scripts/ops/convert-haml-to-erb` unless an existing scripts namespace
  is a better fit.
- [x] The codemod must be repeatable and reviewable: skip files that already have
  a matching `*.html.erb`, log each converted path, and avoid deleting `.haml`
  files until the converted ERB renders and tests pass.
- [x] Run the codemod across app templates:

```sh
scripts/ops/convert-haml-to-erb app/views
```

- [x] Manually review converted ERB for helper/block syntax, translation calls,
  whitespace-sensitive inline content, and form builder output. Fix conversion
  misses in the generated ERB, not by keeping mixed Haml/ERB templates.
  2026-06-06 follow-up fixed Haml helper remnants (`succeed`), malformed ERB
  comment expressions in `libraries/index`, and Administrate 1.0 show/index
  helper compatibility discovered by the full Rails suite.
- [x] Remove the original `.haml` templates after review, then remove the `haml`
  gem from `Gemfile` and refresh `Gemfile.lock`.
- [x] Verify no app template or dependency references remain:

```sh
rg -n "\.haml|Haml|haml" app config Gemfile Gemfile.lock
```

- [x] Run Rails boot and focused render coverage after the conversion:

```sh
bundle exec rails runner 'puts "haml removal boot ok"'
./run-rspec.sh
```

- [x] 2026-06-05 local evidence:

```sh
find app/views -name '*.html.haml' -o -name '*.jbuilder' -print
# no output
bundle exec rails runner 'puts "haml removal boot ok"'
# haml removal boot ok
bundle info haml
# Could not find gem 'haml'.
```

## Phase 4d: Jbuilder and Serializer Runtime Removal

- [x] Add a repo-owned codemod script that converts Rails Jbuilder templates to
  `*.json.erb` templates and can delete the original `.jbuilder` files after
  review.
- [x] Remove `jbuilder` and `active_model_serializers` from `Gemfile`, refresh
  `Gemfile.lock`, and avoid replacing them with a new serializer gem unless the
  app proves it needs a full DSL again.
- [x] Vendor only a narrow compatibility layer under `app/serializers/` for the
  existing `ActiveModel::Serializer` class declarations while controllers and
  views migrate to explicit JSON rendering.
- [x] Back the compatibility layer with `Oj`, keep `render json: @model` working,
  and pass request-local user state through `Current.user` instead of controller
  globals.
- [x] Prefer endpoint-specific JSON templates or explicit controller JSON over a
  general-purpose serializer DSL:
  - use `show.json.erb` / partial JSON ERB where view composition is clearer;
  - use direct `render json:` for simple objects and hashes;
  - consider Alba or Blueprinter only if a real serializer DSL becomes necessary.
- [x] 2026-06-05 local evidence:

```sh
bundle exec rails runner 'puts ApplicationController.renderer.render(json: Announcement.new(content: "hello", url: "/announcements")); puts Current.user.inspect'
# {"type":"Announcement","table":"announcements","param":null,"content":"hello","url":"/announcements"}
# nil
bundle exec rails runner 'puts ActiveModel::Serializer.for([]).as_json.inspect; puts FastJson.dump({ok: true})'
# []
# {"ok":true}
bundle info active_model_serializers; bundle info jbuilder
# Could not find gem 'active_model_serializers'. Could not find gem 'jbuilder'.
```

## Phase 4e: Vendor Small View Runtime Gems

- [x] Vendor the small runtime surface currently provided by `markerb` and
  `inline_svg` so production boot does not depend on those gems for view
  rendering.
  2026-06-05 implementation: `app/lib/gala/view_runtime/markerb.rb` registers
  the app-local Markerb template handler and
  `app/lib/gala/view_runtime/inline_svg.rb` provides the app-local
  `inline_svg_tag` / `inline_svg` helpers through `config/initializers/view_runtime.rb`.
- [x] Keep the vendored code narrow and app-specific:
  - `markerb`: support the current `.markerb` mailer template use case and
    Markdown-to-HTML rendering path used by this app.
  - `inline_svg`: support the existing helper call shapes, asset lookup path,
    and HTML-safe SVG output the app currently renders.
- [x] Put the code under a repo-owned namespace such as `app/lib/gala/view_runtime/`
  or the closest existing app-local helper namespace. Do not vendor whole gem
  repositories unless the app actually needs that full surface.
- [x] Add focused regression coverage before removing the gems:
  - render an existing `.markerb` mailer template;
  - render an existing `inline_svg` helper call with the same attributes/classes
    used by the app.
- [x] Remove `markerb` and `inline_svg` from `Gemfile`, refresh `Gemfile.lock`,
  and verify no remaining boot-time references require the gems:

```sh
rg -n "markerb|inline_svg|InlineSvg|Markerb" app config Gemfile Gemfile.lock
bundle exec rails runner 'puts "vendored view runtime boot ok"'
```

- [x] 2026-06-05 local evidence:

```sh
bundle exec rspec spec/lib/gala/view_runtime/inline_svg_spec.rb spec/mailers/reply_notification_mailer_spec.rb
# 3 examples, 0 failures
bundle exec rails runner 'puts "vendored view runtime boot ok"'
# vendored view runtime boot ok
bundle exec rails zeitwerk:check
# Otherwise, all is good! Existing warning: spec/mailers/previews is not eager loaded.
bundle info inline_svg; bundle info markerb
# Could not find gem 'inline_svg'. Could not find gem 'markerb'.
```

## Phase 4f: Pundit Authorization Query Watch

- [x] Keep Pundit for the current nightly pass and do not replace the policy
  layer during the React/Propshaft/runtime cleanup.
- [x] Add a lightweight app-owned hook around Pundit policy predicates and
  policy scopes so development can surface authorization-driven N+1 queries
  without adding another runtime dependency.
- [x] Scope the hook to observability only: it must not change authorization
  return values, policy classes, controller redirects, or channel behavior.
- [x] Enable by default in development with app-owned defaults only; do not add
  environment-variable configuration for the watcher.
- [x] Add Rails-facing usage docs in `docs/authorization-query-watch.md`.
- [x] Run focused coverage and a Rails boot check:

```sh
bundle exec rspec spec/lib/gala/pundit_query_watch_spec.rb
# 2 examples, 0 failures
bundle exec rspec spec/policies
# 80 examples, 0 failures
bundle exec rails runner 'puts "pundit query watch boot ok"'
# pundit query watch boot ok
```

## Phase 5: Commit Locally Only

- [ ] Inspect dirty files and stage only files changed for this phase.
- [ ] Commit locally to `infra/rc_2-9-9` only after the QA gate and applicable
  SST CLI evidence gate pass.
- [ ] Do not push the branch.
- [ ] Do not move or push the `nightly` Git tag.
- [ ] Record the local commit SHA that proved the SST infra working.

## Phase 6: Local SST CLI Deploy

- [ ] Use `npx sst deploy --stage nightly` from `infra/` after non-mutating SST
  CLI state evidence is reviewed. For the first `nightly` creation, there is no
  passing diff because the stage is absent.
- [ ] Keep `GALA_ECS_ONLY_DEPLOY=false` for the first nightly service creation so
  SST can create the new web/worker task definitions.
- [ ] Deploy only after the state evidence, hostname gate, image gate, and tests
  are reviewed:

```sh
env -u DATABASE_URL -u REDIS_URL -u REDIS_HOST -u CACHE_URL \
  AWS_PROFILE=gala \
  AWS_REGION=us-west-2 \
  AWS_DEFAULT_REGION=us-west-2 \
  SST_STAGE=nightly \
  GALA_DOMAIN_NAME=learngala.dev \
  GALA_NIGHTLY_DOMAIN_NAME=nightly.dev.learngala.dev \
  GALA_ROUTER_DISTRIBUTION_ID=E3FF4TTU9Q4XTY \
  GALA_SHARED_DEV_VPC_ID=vpc-030eda5dfde37d35b \
  GALA_SHARED_DEV_CLUSTER_ID=arn:aws:ecs:us-west-2:353760060567:cluster/gala-dev-GalaClusterCluster-zeeusfkv \
  GALA_SHARED_DEV_DATABASE_ID=gala-dev-galadatabaseinstance-vfkaokum \
  GALA_SHARED_DEV_CACHE_CLUSTER_ID=gala-dev-galacachecluster-bbtxmett \
  GALA_ENABLE_CUSTOM_DOMAIN=true \
  GALA_CLOUDFLARE_PROXY=false \
  GALA_CONTAINER_ARCHITECTURE=arm64 \
  GALA_APP_IMAGE_URI=353760060567.dkr.ecr.us-west-2.amazonaws.com/gala:nightly \
  GALA_WEB_IMAGE_URI=353760060567.dkr.ecr.us-west-2.amazonaws.com/gala:nightly \
  CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID}" \
  CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN}" \
  CLOUDFLARE_ZONE_ID="${CLOUDFLARE_ZONE_ID}" \
  npx sst deploy --stage nightly
```

- [ ] Confirm ECR `gala:nightly` and the immutable release-id tag have the same
  digest.
- [ ] Confirm nightly web/worker ECS services are stable on Fargate Spot.
- [ ] Confirm task definitions reference `gala:nightly`, `SST_STAGE=nightly`,
  selected `BASE_URL`, `S3_BUCKET=msc-gala`, and `AWS_REGION=us-west-2`.
- [ ] Confirm no Heroku command appears in operator logs.
- [ ] Only after this phase is healthy, decide whether to push
  `infra/rc_2-9-9` and move the remote `nightly` tag.

## Phase 7: Acceptance

- [ ] `curl -I https://nightly.learngala.dev/up` returns a healthy status, or the
  documented fallback hostname does.
- [ ] Browser QA confirms homepage load, login page load, static asset loads,
  Action Cable handshake behavior, and no critical console/network errors.
- [ ] CloudWatch logs show web boot, Sidekiq boot, and no repeated
  `PostHog disabled`, mail, S3, DB, or Redis connection failures.
- [ ] Cloudflare DNS record state matches the selected hostname strategy and no
  `learngala.com` zone mutation occurred.
- [ ] CI smoke is dispatched against the final nightly URL.
- [ ] Rollback target is known: previous Git tag, previous ECR digest, and
  previous ACTIVE web/worker task-definition revisions.

## Source Links

- SST Service Fargate Spot capacity:
  https://sst.dev/docs/component/aws/service/
- SST Router custom domains and Cloudflare DNS:
  https://sst.dev/docs/component/aws/router/
- AWS ECS Fargate Spot behavior:
  https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-capacity-providers.html
- CloudFront certificate requirements:
  https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html
- Cloudflare proxy status:
  https://developers.cloudflare.com/dns/proxy-status/
- Cloudflare WAF custom rules and challenges:
  https://developers.cloudflare.com/waf/custom-rules/
  https://developers.cloudflare.com/cloudflare-challenges/challenge-types/challenge-pages/

## Asset Pipeline Implementation Notes - Shakapacker/Stimulus removal

- Implemented the Rails 8.1 asset direction as Propshaft for digesting/serving browser-ready assets, with `jsbundling-rails` running Vite/Rollup and `cssbundling-rails` running Sass into `app/assets/builds`.
- Removed Shakapacker and Webpack as application dependencies and removed the Shakapacker/Webpack bin/config/spec surface. Vite/Rollup is the `jsbundling-rails` compiler, with outputs owned by Propshaft under `app/assets/builds`.
- Removed Stimulus as an application dependency and replaced the previous DOM controllers with a small vanilla bootstrap in `app/javascript/controllers/index.jsx`.
- Kept Inertia out of this pass. Propshaft does not provide Inertia's page-props/navigation model, and the current app still uses Rails-rendered data injection plus React islands rather than an SPA shell boundary.
- Consolidated global CSS through a small number of outputs: `application.css` from `cssbundling-rails`, `print.css` from `cssbundling-rails`, and optional `javascript-*` CSS emitted only for JS bundle-owned package CSS.
- Updated Blueprint ownership for the Blueprint 6 namespace (`bp6-*`) and switched the local toaster singleton to the Blueprint 6 `OverlayToaster` API.
- Direct Vite/Rollup plus pnpm strictness exposed previously implicit runtime dependencies from legacy React packages. Those dependencies are now explicit in `package.json` rather than being masked by Shakapacker/hoisting behavior.
- No repo-owned `/vendor` code was required by the asset migration failures; missing functionality resolved to explicit npm package dependencies.

### Asset live rebuild follow-up

- Development JavaScript live rebuilds use Vite/Rollup native watch through `pnpm run build:js:watch` and `bin/vite-build-watch`. This keeps the build graph warm, remains close to the Rails/Vite platform convention, and avoids OS-specific watcher dependencies.
- Vite writes logical entry bundles into `app/assets/builds`, preserving Propshaft as the single Rails serving/fingerprinting boundary.
- In Compose development, `app/assets/builds` is a named volume shared by `web`, `js`, and `css`, so asset IPC remains in-container and avoids macOS bind-mount write latency.
- `vite_rails` was researched and intentionally deferred because it introduces a separate `public/vite` manifest/helper surface that duplicates the Propshaft boundary for this app.
- Rails always emits the Vite application bundle as a module script because both development and production Vite outputs are ESM.

#### Asset live rebuild boundary correction

- Vite/Rollup must not enumerate individual packs in configuration. There is one source entry, `app/javascript/application.js`, and route-specific behavior is discovered by the Rails directory router under `app/javascript/routes`.
- The dev watcher registers `app/javascript` as the rebuild ownership boundary, so touching JavaScript-side source files invalidates the Vite watch graph without enumerating packs.
- `app/assets/builds` is the dev asset IPC boundary between the fast JS transpiler and Rails/Propshaft. A browser refresh in development loads the latest emitted bundles from that directory.

#### Single application entry correction

- The Webpack/Shakapacker-era `packs` namespace is removed from the target architecture.
- `app/javascript/application.js` is the only JavaScript source entry. It owns global Rails setup, CSS-side imports, analytics/onboarding, direct-upload behavior, and DOM-conditional React mounts.
- Views no longer append page-specific JavaScript bundles. Rails includes one logical `application` bundle, and Propshaft refreshes that bundle from `app/assets/builds` in development.
- Vite/Rollup uses the same single application entry for fast dev rebuilds and production precompile.

#### Rails directory router convention

- Client-side page behavior follows a Rails-aware directory router, similar in spirit to React Router/Next filesystem routing while keeping Rails as the request router.
- `app/javascript/router/index.js` reads `data-rails-controller`, `data-rails-action`, and `data-rails-layout` from `<body>` and loads matching route modules through Vite `import.meta.glob`.
- Route modules live under `app/javascript/routes/<controller_path>/<action>.jsx`; layout modules live under `app/javascript/routes/layouts/<layout>.jsx`.
- Route files export `mount(context)`, where context includes `locale` and `loadMessages`. Each route owns only its DOM-specific mount, while `app/javascript/application.js` owns global Rails setup.
- This keeps the JavaScript entry count at one while avoiding a central hard-coded page mount registry. Adding a Rails page script is a file placement operation, not an asset-manifest edit.

#### Vite ownership correction

- `build:js` is Vite/Rollup-backed. The previous direct webpack fallback is removed because the route filesystem loader uses Vite's `import.meta.glob` and should not be constrained by webpack compatibility.
- `build:js:watch` and `build:js` share the same single-entry Vite configuration so development refresh behavior and production precompile behavior compile the same graph.

#### Development rebuild speed guard

- Dev build/watch commands force `NODE_ENV=development` so Vite/Rollup skips production minification and source-map work during live rebuilds.
- Live reload notification is a small Vite plugin in `vite.config.mjs`, not a separate watcher process. It posts to Rails after successful watch rebuilds, then Rails broadcasts through AnyCable.
- Vite resolves both app/javascript directory aliases and top-level file aliases, matching the historical Rails/Webpack import ergonomics while keeping the single application entry.

#### Webpack/Shakapacker removal guardrail

- Webpack is no longer a dependency, build command, config path, CSS output prefix, or dev port concept.
- Shakapacker pack helpers are removed from app helper compatibility shims because route-specific behavior now belongs in the Rails directory router under `app/javascript/routes`.
- JavaScript-owned package CSS is emitted as `javascript-application.css`, avoiding stale `webpack-*` naming while preserving a distinct boundary from Sass-owned `application.css`.
- Stimulus-shaped DOM hooks were migrated to app-owned `data-gala-controller`, `data-gala-action`, and `data-gala-target` attributes so the vanilla bootstrap no longer depends on Stimulus naming conventions.

#### JavaScript build output cleanup

- Vite uses a repo-owned cleanup hook instead of `emptyOutDir` because cssbundling also writes `application.css` and `print.css` into `app/assets/builds`.
- Before each Vite build/watch rebuild, the hook removes old JavaScript-owned outputs from `app/assets/builds` while preserving Sass-owned CSS outputs and `.keep`.
- This prevents stale route chunks and old Webpack artifacts from remaining in the Propshaft input directory.

### Ruby dependency pruning pass 1

Checkpoint before pruning: `4c1baae5` (`Checkpoint Rails asset runtime migration`).

Removed in the first light chunk:

- `rack-canonical-host`: no active app/config references found.
- `rack-timeout`: no active middleware use; Puma timeout comment removed.
- `bootsnap`: boot require and Docker precompile steps removed.
- `connection_pool`: explicit dependency removed; keep any transitive pool dependency owned by the gem that needs it.
- `active_storage_validations`: no active app/config references found.
- `memoist`: replaced with local memoization in `UsageReportsService`.
- `virtus`: replaced `CreditsList` with a plain Ruby value object.
- `omniauth-facebook`: removed the unused Devise Facebook provider while keeping Google and LTI providers.
- `multi_json`, `oj`, `oj_mimic_json`: removed; `FastJson` now uses stdlib `JSON.generate` after serializer normalization.
- `rexml`, `benchmark`, `sqlite3`: removed as explicit low-value direct dependencies for this app path.
- `barnes`: removed Puma memory profiler hook with the Heroku-era gem.

Deferred because removal is behavioral or too large for a single-file vendor replacement:

- `rack-attack`: currently owns request throttles/blocklists and has specs.
- `aws-sdk-s3`: Active Storage/S3 deployment scripts still imply production storage coupling.
- `image_processing`: Active Storage variants can depend on it; remove only with an explicit variant policy.
- `acts_as_list`: ordering behavior exists across multiple models and cloners.
- `kaminari`: reader/admin pagination helpers and deployment progress pagination depend on it.
- `time_for_a_boolean`: model scopes/helpers are generated in multiple models.
- `ims-lti` and LTI omniauth support: protocol behavior is not a tiny replacement.
- `pdfkit`: PDF generation should move to a background worker or explicit replacement path.
- `redcarpet`: rich Markdown rendering is used by helpers and Markerb runtime.
- `administrate-field-active_storage`: dashboard fields need a local Administrate field replacement first.
- `lograge`: replace only after adding a tiny Rails notification subscriber or accepting default Rails logs.
- `sparql-client`: replace with a small HTTP SPARQL client only after preserving Wikidata behavior.
- RSpec/factory/faker/shoulda/rubocop dev-test stack: defer until the Minitest/plain-Ruby test migration is planned.
- `csv`: active CSV import/export code remains; do not remove until Ruby bundled-gem availability and boot behavior are confirmed.

### Ruby dependency pruning pass 2

Removed the Sentry and Heroku-era profiler lane:

- Deleted the Rails Sentry initializer and removed `sentry-ruby`, `sentry-rails`, and `sentry-sidekiq`.
- Removed `vernier`; `barnes` was removed in pass 1.
- Removed server-side Sentry request context wiring and Sentry-specific error dialog data.
- Removed the browser Sentry CDN loader, JavaScript Sentry shim, React error-boundary Sentry reporting, and Sentry feedback buttons.
- Deleted the Sentry-only memory snapshot logger/job.

No local vendor shim was added because retaining a fake `Sentry` API would preserve the dependency concept instead of removing it. Server error visibility should come from Rails logs, structured app events, and the existing analytics lane.

### Ruby dependency pruning pass 3

Removed `lograge` after confirming it was isolated to one initializer and one local payload formatter. No replacement shim was kept; Rails default tagged/request logging remains the baseline, with Rails 8.1 structured event reporting available as the future native path if richer event logs are required.

### Ruby dependency pruning pass 4

Vendored `time_for_a_boolean` as one small Ruby file at `vendor/ruby/time_for_a_boolean.rb` and registered it from `config/initializers/time_for_a_boolean.rb`. The local implementation preserves the gem behavior used by `Announcement`, `Case`, and `Library`: timestamp-backed boolean readers, `?` aliases, false-value clearing, and bang setters. Removed the gem from the bundle.

### Ruby dependency pruning pass 5

Removed `sparql-client` by adding `vendor/ruby/sparql_json_client.rb`, a tiny Net::HTTP client for Wikidata's SPARQL JSON endpoint. `Wikidata` keeps the same public `canned_query` and `search` API while receiving flattened symbol-key bindings compatible with the former client usage.

### Ruby dependency pruning pass 6

Removed unused direct development/test dependencies while leaving the still-active RSpec stack in place:

- Removed `pry` and `pry-rails`; no app/spec references remain.
- Removed `dotenv-rails`; local/dev env now depends on explicit Docker, shell, credentials, and compose env wiring rather than implicit `.env` loading.
- Removed `guard-rspec` and deleted the unused `Guardfile` watcher.
- Removed direct `rspec`; `rspec-rails` continues to own the active suite until the Minitest/plain-Ruby migration happens.
- Removed `rspec_junit_formatter`; CI uses progress/color output and the repo's JSONL suite summary instead.
- Removed `rubocop-faker`; RuboCop remains active, but no project RuboCop config enables the Faker extension.
- Removed direct `ffi`; keep any transitive native FFI dependency owned by the gem that actually needs it.

Deferred active test dependencies until the larger 37signals-style Minitest/plain-Ruby migration: `rspec-rails`, `factory_bot_rails`, `faker`, `rspec-composable_json_matchers`, `shoulda-matchers`, and `rubocop`.

### Ruby dependency pruning pass 7

Removed explicit `csv` from the Gemfile. CSV import/export code remains and continues to use `require 'csv'`; this keeps usage explicit at call sites while avoiding a direct app dependency entry for Ruby's CSV library.

Confirmed deferrals:

- `aws-sdk-s3`: production Active Storage is configured with the `amazon` S3 service, so removing the gem would break media storage until storage is moved or adapter behavior changes.
- `image_processing`: Active Storage variants/previews are used and the app config selects the Vips variant processor, so removal needs a separate variant policy.

### Ruby dependency pruning pass 8

Removed Administrate and replaced the generated admin namespace with a lightweight polymorphic `AdminsController`:

- Kept existing `/admin/...` paths and common route helpers for the existing admin resources.
- Added an explicit admin model allowlist and generic `index`, `show`, `new`, `create`, `edit`, `update`, and `destroy` actions.
- Preserved editor-only access, case copy behavior, Case friendly lookup, ReadingList UUID lookup, Ahoy event newest-first ordering, comment newest-first ordering, and comment-thread eager loading.
- Deleted Administrate controllers, dashboards, generated admin views, field partials, and the custom Administrate percent field.
- Removed `administrate` and `administrate-field-active_storage` from the bundle.

Repaired the earlier Active Storage validator gap after removing `active_storage_validations`:

- Added local `ContentTypeValidator` and `SizeValidator` implementations for the exact validators used by `Case` and `Library` attachment validations.

Removed `aws-sdk-s3` without changing the Active Storage service name:

- `config/storage.yml` remains `service: S3`; this is mandatory to preserve the Active Storage media contract.
- Added a repo-owned `ActiveStorage::Service::S3Service` at `lib/active_storage/service/s3_service.rb` that uses S3 REST + SigV4 signing.
- The local S3 adapter supports object upload/download/chunk download/delete/existence checks, direct-upload presigned URLs, and prefixed deletes.
- The adapter intentionally does not create, configure, mutate, lifecycle, CORS, or policy-manage any S3 bucket.
