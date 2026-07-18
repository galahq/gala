# Plan: sst-ergonomic-platform-refactor

## Approach

Execute seven ordered slices with a stop gate after each one. First characterize the deployed durable stages, then extract SST modules without changing their resource graph. Only after both durable diffs are empty may the implementation add an isolated preview composition that references verified existing dev identifiers without creating a sharing resource. Release/CI simplification precedes Docker consolidation; Docker consumers switch only after old/new image parity passes. The final live preview UAT is a separate, explicit approval gate. No `dev` or `production` apply, refresh, state edit, shared-resource import, Heroku mutation, or production cutover is authorized by this plan.

`infra/platform.constants.json` is the sole machine-readable owner of platform identity: app/account, AWS region, root domain, release architecture (`arm64`), bucket names, Cloudflare zone ID, shared router ID, and the verified existing dev cluster/VPC/network/static-distribution identifiers. TypeScript imports it with a JSON module import; `scripts/read-platform-constant.mjs` emits one named scalar for shell consumers. Workflows receive derived outputs from `scripts/deploy-sst.sh`; Dockerfiles contain no architecture choice. Tests and prose may state expected values, but executable code outside this file may not duplicate `us-west-2`, `learngala.dev`, `arm64`/`ARM64`, or `linux/arm64` literals.

Implementation remains delegated with exclusive file ownership:

- Remote-infrastructure owner: `infra/**`, `scripts/deploy-sst.sh`, `scripts/lib/**`, SST diff/plan tools, and SST contract tests.
- CI/workflow owner: `.github/workflows/**`, `scripts/ci/**`, workflow contract tests, and `docs/ops/workflows/**`.
- Local-runtime owner: `Dockerfile*`, `docker-compose.yml`, `entrypoint.sh`, local `bin/**`, `run-rspec.sh`, `mise.toml`, and `Procfile.dev`.
- Integration owner: `README.md`, the line-budget manifest/check, cross-slice verification, and conflict resolution. `Procfile` is read-only.

Shared work is linear: the remote and CI owners finish Slice 4 without changing the production Dockerfile path; the local owner proves Slice 5 image parity while retaining `Dockerfile.production`; the remote owner performs the consumer switch in Slice 6; only then may the local owner delete the old file. The integration owner edits root documentation last.

AC26 uses the already recorded 4,214-line baseline. A source-controlled manifest makes the exact non-test path set reproducible and includes replacement files while excluding tests, `.work`, and generated artifacts.

## Changes (file by file)

## Task 1 — reproducible characterization

- `infra/platform.constants.json` — add the canonical source described above. Populate `devVpcId`, `devClusterId`, provider-required `devContainerSubnetIds`/`devLoadBalancerSubnetIds`/`devSecurityGroupIds`, `devCloudMapNamespaceId`/name, `devStaticAssetsDistributionId`/domain, and `sharedRouterDistributionId` only through the exact capture procedure below. A missing/mismatched value stops the ticket; the builder may not guess or broaden a lookup.
- `.work/sst-ergonomic-platform-refactor/evidence/dev-reference-capture.json` — derive only `vpcId`, `clusterId`, `migrationSubnets`, `migrationSecurityGroups`, `staticAssetsDistributionId`, and `appRouterDistributionId` from `infra/.sst/outputs.json` after `jq -e '.stage == "dev"'`. Validate each exact ID with `aws ec2 describe-vpcs --vpc-ids`, `aws ecs describe-clusters --clusters`, and `aws cloudfront get-distribution --id`; require active/existing results, the VPC ID on every subnet/security group, static comment `gala-dev static assets`, router comment `GalaAppRouter app`, and the expected dev/root/wildcard aliases. Find the Cloud Map namespace by listing only `DNS_PRIVATE` namespaces named `sst`, fetching each namespace/hosted zone, and require exactly one whose Route53 hosted-zone VPC association equals `devVpcId`; record its ID/name. Resolve the non-secret Cloudflare zone with `GET /client/v4/zones?name=learngala.dev`, require success and exactly one result, and record its ID/name. Record only these non-secret identifiers, CloudFront domains/comments, source timestamps, and the outputs-file SHA-256. Never record state, parameter values, URLs with credentials, or provider credentials.
- `scripts/read-platform-constant.mjs` — accept one fixed key, read/validate the JSON, derive domain/platform forms from `rootDomain` and `architecture`, emit exactly one newline-terminated scalar, and reject unknown keys.
- `scripts/ops/test-platform-constants.mjs` — provide `schema`, `inventory`, and `enforce` modes. Slice 1 runs `schema` plus non-failing `inventory`, which records duplicate executable literals that later slices must remove. Slice 4 runs `enforce`, which fails on region, root-domain, or architecture literals outside the canonical JSON. Documentation, tests, generated files, and `.work` are excluded; every other executable source is scanned.
- `scripts/ops/capture-sst-diff.sh` — add the sole read-only durable-diff wrapper. It accepts only `dev` or `production`; `--profile` is an explicit local credential selector defaulting to `gala` only outside GitHub/OIDC and is not platform identity. Read region from the constants helper and unset `DATABASE_URL`, `REDIS_HOST`, `REDIS_URL`, `CACHE_URL`, `GALA_EFFECTIVE_STAGE`, and legacy image/release/route/domain/architecture overrides. Run `npm ci --prefer-offline --no-audit --no-fund` and `npx sst install` first, each with stdout/stderr captured to separate redacted diagnostic files and statuses checked. Then capture only `(cd infra && npx sst diff --stage "$stage" --json)` stdout as JSONL and stderr separately. Normalize JSONL with `jq -s` to select objects containing `op` and `urn`, project `{op,urn,type,parent}`, and sort by all four fields. Store the commit, constants-file SHA-256, stage, three exit statuses, and normalized operations. Reject non-JSON diff stdout, missing operation fields, stderr indicating refresh/apply, or any nonzero status. Never record secrets, parameter values, URLs, provider credentials, or state payloads.
- `scripts/ops/test-capture-sst-diff.sh` — use command stubs to prove stage rejection, fixed region/profile, environment sanitization, no refresh/apply path, redaction, and nonzero propagation.
- `scripts/ops/test-sst-module-boundaries.rb` — characterize ownership without hard-coding future filenames. Discover modules imported by the runtime facade, require an acyclic one-way import graph, forbid constructors in the facade, forbid SES constructors across `infra/**/*.ts`, and require each existing logical resource name exactly once in the aggregate source.
- `scripts/ops/test-sst-dev-runtime-contracts.rb` — assert behavior over concatenated `infra/**/*.ts`: existing logical and physical names, SSM paths, commands, sizes, scaling, architecture, AMIs, router ID, and Docker build contract. Module moves must not fail this contract.
- `scripts/ops/test-canonical-release-source-contract.rb` — discover runtime modules rather than assuming one source path; preserve one canonical release environment value.
- `scripts/ops/test-rapid-release-contract.sh` — add failing fixtures for durable/preview target resolution and safe infra-plan validation.
- `Dockerfile.production`, `Dockerfile` — build and inspect tagged before-images without edits; record architecture, UID/GID, entrypoint, default command, assets, runtime binaries, and excluded development content.
- `scripts/ops/platform-line-manifest.txt` — copy the frozen planning manifest exactly: `infra/{sst.config.ts,config.ts,platform.ts,assets.ts,runtime.ts}`, `infra/stages/{dev.ts,production.ts,index.ts}`, `.github/workflows/{deploy.yml,ci.yml}`, `scripts/deploy-sst.sh`, `scripts/ci/{post-commit-status.mjs,validation-report.mjs}`, `Dockerfile`, `Dockerfile.production`, `docker-compose.yml`, `entrypoint.sh`, `bin/{setup,dev,update,sst-db,run_ci_tests}`, `run-rspec.sh`, `README.md`, `infra/README.md`, and `docs/ops/workflows/{ci.md,deploy.md}`. The 2026-07-11 planning snapshot of those non-test paths is 4,214 lines. The final total additionally charges `infra/{platform.constants.json,preview.ts,tsconfig.json}`, `infra/runtime/*.ts`, `infra/stages/preview.ts`, `scripts/read-platform-constant.mjs`, `scripts/ops/{capture-sst-diff.sh,generate-spend-report.mjs,sync-media-bucket-cors.sh}`, `scripts/lib/{rapid-release.sh,infra-plan.sh}`, `scripts/ci/run`, `bin/test`, `mise.toml`, `Procfile.dev`, and `docs/releases/v2.9.9.md`; deleted paths contribute zero. No path may be added/removed from the accounting policy without returning to plan/review.
- `scripts/ops/test-platform-line-budget.sh` — expand the manifest deterministically, report baseline/final totals, and compare `git diff --name-only` plus untracked files against the in-scope roots. Fail when a new/changed non-test platform file is not classified by the manifest; tests, generated files, `.work`, and preserved unrelated files are the only exclusions.

Baseline gates include infra tests/typecheck, all existing source contracts, Docker Compose rendering, the ARM64 production build, constants `schema`/`inventory`, the line manifest, and clean `dev`/`production` results from `capture-sst-diff.sh`. Duplicate-literal `enforce` is intentionally deferred until Slice 4 has migrated every consumer. The current rendered image URI, release, asset prefix, routes, and capacity are code-owned; the wrapper test proves no remaining environment variable can change them. A non-empty baseline is classified as live drift only after the normalized command is rerun from a clean dependency install with the same commit/constants hashes and produces the identical operations twice.

## Task 2 — source-only declarative SST modules

- `infra/runtime.ts` — become a constructor-free composition/output facade under 100 lines; preserve construction order and output keys.
- `infra/runtime/secrets.ts` — own explicit `sst.Secret` and deterministic SSM parameter declarations. Use one narrow parameter helper, plain scalar declarations, and provider-required maps only. Preserve every name/path/value transformation and the Google parameter dependency edge.
- `infra/runtime/services.ts` — own Rails environment scalars, provider-required permissions, `GalaWeb`, and `GalaWorker`. Remove dead fallbacks and optional-value compaction while preserving resolved inputs, transforms, health checks, scaling, commands, ports, and dependencies.
- `infra/runtime/routing.ts` — own compression headers, existing app-distribution branches, router create/get logic, and routes. Preserve current CloudFront arguments and cache behavior in this no-op slice.
- `infra/runtime/tasks.ts` — own migration/seed/index/report tasks and production cron resources with unchanged commands, sizes, schedules, and guards.
- `infra/runtime/types.ts` — define only values that cross the domain boundaries; add no registry, generic context, plugin system, or resource array.
- `scripts/ops/generate-spend-report.mjs` — discover the module aggregate and derive capacity facts from config rather than constructor file locations; keep a no-AWS source-only test path.
- `infra/README.md` — document constructor ownership and why small provider-schema arrays remain.
- `infra/sst-env.d.ts` — preserve the developer's generated Google-secret changes without editing them.

After every domain move, run infra tests/typecheck and source contracts. After the complete extraction, rerun the identical durable diff wrapper. Both operation lists must remain empty.

## Task 3 — flat durable stages and an explicit preview resource graph

- `infra/tsconfig.json` — enable `resolveJsonModule`; keep Bundler module resolution and no-emit behavior unchanged.
- `infra/config.ts` — replace nested target/capacity objects with flat, code-owned `dev` and `production` records and scalar capacity fields. Import `platform.constants.json` as the JSON module without a runtime filesystem read. Use an obvious exhaustive branch for `dev`, `production`, and strict `pr-NUMBER`; reject arbitrary/local durable stages. Keep only capacity, AMIs, protection, and retention as TypeScript-owned configuration.
- `infra/test/config.test.ts` — pin every scalar and prove previews inherit `dev`; reject malformed PR and fallback stage names.
- `infra/stages/dev.ts` — explicitly compose dev assets, platform, and runtime. It creates no preview-sharing contract or new durable resource.
- `infra/stages/production.ts` — explicitly compose production assets, platform, and runtime; publish no preview contract.
- `infra/stages/preview.ts` — compose the only ephemeral graph. Call `lookupDevPlatform()` to reference the exact dev ECS cluster/network, static-assets distribution, and shared router from the canonical constants; reference dev SSM names for application/database/cache secrets. Create stage-qualified web/worker/tasks and a per-preview public ALB, then publish only `pr-NUMBER.dev.learngala.dev`. Do not create or reference a VPC component, RDS, Valkey, parameters, buckets, SES, durable secrets, app CloudFront distribution, cron, or bastion resources.
- `infra/stages/index.ts` — use one exhaustive `runDev`/`runProduction`/`runPreview` switch with no registry, dynamic import, map, or fallback.
- `infra/preview.ts` — implement `lookupDevPlatform()` without `Vpc.get`. Call `Cluster.get("GalaDevClusterReference", { id, vpc: { id, securityGroups, containerSubnets, loadBalancerSubnets, cloudmapNamespaceId, cloudmapNamespaceName } })`, `Router.get("GalaAppRouterReference", distributionId)`, and `aws.cloudfront.Distribution.get("GalaDevStaticAssetsDistributionReference", id)` using only canonical constants. Validate resolved IDs/domain against those constants and stop on mismatch. Installed SST source confirms this graph creates state-only SST component entries for Cluster/Router/CDN and provider `read` entries for the existing ECS cluster and CloudFront distributions; it creates no VPC reference and never reads the bastion/private-key parameter.
- `infra/sst.config.ts` — remain a small dispatcher: durable stages are protected/retained and strict `pr-NUMBER` stages are removable.
- `infra/runtime/secrets.ts` — add an obvious preview branch that references dev parameter names and constructs no secret/parameter.
- `infra/runtime/services.ts` — accept the referenced dev cluster and create preview services with stage-qualified physical discovery names.
- `infra/runtime/routing.ts` — reference the shared router and add exactly one preview host; never include the dev apex, wildcard, or another PR host.
- `scripts/ops/test-sst-module-boundaries.rb` — assert architecture/import direction and forbidden durable constructors by behavior, independent of module filenames.
- `scripts/ops/test-sst-dev-runtime-contracts.rb` — prove the preview composition consumes dev references without constructing Google, SES, media, database, cache, network, cron, or bastion resources.

The preview validator has two disjoint policies. Reference policy permits `create` only for exact state-only component URNs `sst:aws:Cluster`/`GalaDevClusterReference`, `sst:aws:Router`/`GalaAppRouterReference`, and its exact `sst:aws:CDN` child; it permits `read` only for the exact `aws:ecs/cluster:Cluster` child, the router CDN's `aws:cloudfront/distribution:Distribution` child, and the stack-parented `GalaDevStaticAssetsDistributionReference`, with provider IDs equal to canonical constants. It rejects every provider create/update/delete/replace/import below reference parents. Ephemeral policy permits the known service graph under `GalaWeb`, `GalaWorker`, `GalaMigrate`, `GalaSeedDatabase`, `GalaRefreshIndices`, `GalaWeeklyReport`, and the single matching router-route owner: ECS task definitions/services, IAM roles/policies, CloudWatch log groups, EC2 security groups, ELBv2 load balancer/target group/listener/listener rule, Application Auto Scaling targets/policies, service-discovery services, SST service/task components, and one SST router URL route plus its router key-value update. An unknown parent, child, ID, or operation is a hard stop back to plan/review and may not be added during build.

Slice 3 must leave both durable diffs empty and may produce a read-only `pr-NUMBER` plan containing only the enumerated ephemeral graph. It applies nothing.

## Task 4 — release/CI simplification without Docker cutover

- `scripts/lib/infra-plan.sh` — extract version/fingerprint/record/apply verification. Bind every preview URN to `urn:pulumi:pr-NUMBER::gala::`, the exact PR target, and an enumerated parent from Slice 3. Reject foreign stages/PRs, unknown parents/children, delete/replace/import, and all S3, SES, VPC, RDS, cache, bastion, durable CloudFront, shared log-group, or shared autoscaling mutation. Store target, commit, state version, normalized fingerprint, operations, and ISO timestamp. Revalidate the exact record immediately before apply.
- `scripts/lib/rapid-release.sh` — retain immutable build/rollout/promotion/rollback/smoke behavior, map previews to the dev cluster with PR-qualified services, source the plan library, and obtain region/domain/architecture through the constants helper. Continue using `Dockerfile.production` in this slice. Replace the split `docker build`/`docker push` publication with one `docker buildx build --platform "linux/${architecture}" --push` path. After push, inspect the tag with `docker buildx imagetools inspect`: reject a manifest list/index containing any platform other than `linux/arm64`; for a single manifest, inspect its image config and require OS `linux` and architecture `arm64`. Resolve the immutable digest, `docker pull "${repository}@${digest}"`, and pass that digest reference—not the mutable tag—to asset extraction. Only after successful digest-pinned extraction may the release record be written. Existing-tag reuse performs the same registry check and digest pull/extraction preconditions before returning.
- `scripts/deploy-sst.sh` — remain the sole dispatcher. Resolve target once: production stays production, an open PR request on dev becomes its exact `pr-NUMBER`, and non-PR dev stays dev. Accept only scalar `--stage`, `--branch`, and action intent; expose scalar target/PR/URL outputs. Only `infra:diff` and exact `infra:apply:PLAN_ID` enter SST.
- `scripts/ops/test-rapid-release-contract.sh` — prove PR 790 can address only `pr-790`, never PR 787; test dev cluster lookup, PR-qualified services, exact reference/ephemeral state/URN/parent/ID binding, stale record rejection, and every forbidden category before deploy. Stub buildx/ECR/Docker to prove publication has one fixed derived platform, multi-architecture indexes and wrong single-image configs fail before release-record/asset writes, assets are extracted from the verified digest after a pull, a tag change cannot alter extraction, and no alternate push command exists.
- `.github/workflows/deploy.yml` — reduce to authorization, checkout/setup/OIDC, one dispatcher call, optional PR comment, and summary. Keep only `stage` and `user_data` inputs. Serialize with `deploy-${{ inputs.stage }}`, cancellation disabled, and consume dispatcher outputs rather than recomputing stage/URL.
- `.github/workflows/ci.yml` — use direct named fail-fast steps backed one-for-one by `scripts/ci/run`: `assets`, `database`, `rspec`, `rubocop`, `eslint`, `stylelint`, `factories`, `frontend`, `infra`, `contracts`, and optional `smoke`. Remove custom status/report/artifact collection; retain a terse always-run summary.
- `scripts/ci/run` — implement exactly those named subcommands with fixed argv and `set -euo pipefail`; permit no free-form shell input or AWS calls.
- `scripts/ci/validation-report.mjs`, `scripts/ci/validation-report.test.mjs`, `scripts/ci/post-commit-status.mjs` — delete after a final read-only required-check/ruleset verification and consumer search.
- `scripts/ops/test-deploy-workflow-contract.rb` — assert one deploy invocation, two inputs, production environment gate, stage concurrency, scalar outputs, direct suite steps, and no direct SST/media write or swallowed exit code.
- `scripts/ops/test-workflow-architecture-defaults.rb` — retain only unique architecture invariants; delete if the consolidated contract fully supersedes it.
- `scripts/ops/test-edit-sst-pending-operations.rb`, `scripts/ops/test-verify-sst-google-oauth-preview.rb` — remove from routine CI while leaving the incident tools unchanged.
- `scripts/ops/sync-media-bucket-cors.sh` — remove its apply/write path and leave read-only drift verification.
- `docs/ops/workflows/ci.md`, `docs/ops/workflows/deploy.md`, `docs/releases/v2.9.9.md` — document the exact suite names, native result model, scalar deploy interface, preview isolation/allowlist, approval flow, and native logs.

## Task 5 — consolidate local/production Docker while retaining the old image path

- `Dockerfile` — provide explicit `runtime`, `toolchain`, `development`, `build`, and `production` targets. Production contains only production gems/runtime libraries/compiled immutable assets, runs UID/GID 1000 on ARM64, deterministically loads jemalloc, and defaults to Puma. Development retains host-native Node/pnpm, all gem groups, bind mounts, and debugging tools.
- `Dockerfile.production` — retain unchanged as the parity reference throughout this slice.
- `entrypoint.sh` — retain jemalloc setup, stale PID cleanup, and `exec`; remove seed/index/content mutations and fix jemalloc detection.
- `docker-compose.yml` — build the host-native development target with no platform override, use healthy local Postgres/Redis by default, remove versioned image naming and unnecessary environment variables, and never default to remote data.
- `bin/setup`, `bin/dev`, `bin/update`, `bin/run_ci_tests`, `bin/test`, `run-rspec.sh` — establish the canonical Docker commands. Setup/update prepare but do not seed unless explicitly requested; dev execs Compose; test supports focused RSpec arguments without eval; the compatibility shim delegates.
- `bin/sst-db` — preserve host `sst tunnel`, `connect`, and `check`. Add an explicit dev-only SSM port-forward path: discover the running dev SSM/bastion target read-only, fetch/parse the dev database URL without printing it, and invoke `aws ssm start-session` with `AWS-StartPortForwardingSessionToRemoteHost` from remote RDS port 5432 to host port 5432. `dev-console --use-real-dev-data -- COMMAND...` requires that separate tunnel, rejects production, verifies the local port, and runs a one-shot no-deps web container with the URL inherited through environment and the RDS hostname mapped to `host-gateway`. Stub tests prove the secret never appears in argv/logs.
- `mise.toml`, `Procfile.dev` — keep host tooling optional and preserve the explicit local process contract where still needed. Do not edit `Procfile`.

Build both ARM64 production images and compare UID, entrypoint, Puma startup, asset contents, runtime libraries, gems, and negative development-content checks. Do not switch consumers or delete the old file until parity passes.

## Task 6 — consumer switch, deletion, and documentation

- `infra/runtime/services.ts`, `scripts/lib/rapid-release.sh`, and Docker contract tests — change the production build reference together to `Dockerfile --target production`; preserve the single buildx publication path and rerun both the durable SST diff wrapper and rapid-release/registry fixtures.
- `Dockerfile.production` — delete only after every consumer uses the new target and parity plus durable no-op gates remain green.
- `README.md` — publish one command each for setup, dev, test, update, release, rollback, infra change, preview, and explicit real-dev-data access. Remove host/tmux and global-prune guidance; explain Heroku's shared S3/SES dependency during migration.
- `infra/README.md` — link to the canonical DB command and document state safety, capacity changes, stage ownership, exact plan/apply procedure, and preview ALB lifecycle.
- `scripts/ops/platform-line-manifest.txt`, `scripts/ops/test-platform-line-budget.sh` — update only for actual replacement paths and require a final non-test count below 4,214.

Run a repository-wide search for deleted filenames, duplicate deployment constants, `linux/amd64`, host Rails setup, direct media writes, routine `sst deploy|refresh`, and obsolete status contexts. Preserve all unrelated worktree changes.

## Task 7 — separately approved live preview UAT

- Read-only preview plan — generate the exact current PR's normalized plan and record its state version/fingerprint. Require the Slice 3 resource graph, exact `pr-NUMBER` URN prefix/parents, one matching route, no foreign PR, and no forbidden operation.
- Human gate — stop and present the exact operation summary. Apply only after Nathan explicitly approves that recorded plan. This approval authorizes only that `pr-NUMBER` UAT, never `dev`, `production`, refresh, or shared mutation.
- Preview verification — run the normal preview release, verify the pushed ECR image is ARM64-only, verify ECS health and `https://pr-NUMBER.dev.learngala.dev/up`, confirm the PR comment URL, and read back routes/services to prove any other existing preview (including PR 787 when present) is unchanged.
- Preview lifecycle — leave the verified environment attached to its open PR. Removal occurs only on PR close using a separately planned and reviewed `sst remove --stage pr-NUMBER`; it is not implicitly authorized by the UAT apply.

## Test strategy

- (AC1, AC25) Aggregate behavioral contracts plus import-graph checks survive arbitrary module renames/moves while pinning logical ownership and resource names.
- (AC2, AC3) The same exact sanitized command, constants hash, and normalization records repeatable empty before/after `dev` and `production` operation lists.
- (AC4, AC5) Aggregate source and shell contracts reject media constructors/writes and every SES constructor while preserving references.
- (AC6, AC7, AC8, AC9, AC10) Resolver/validator fixtures and the exact live UAT bind preview state, URNs, parents, children, route, and PR number; forbidden operations cannot reach apply.
- (AC11, AC12, AC13, AC14, AC15) YAML/source/doc contracts prove scalar intent, one dispatcher, one JSON constants owner with no executable duplicate literals, stage serialization, one native failing subcommand per suite, and matching documentation. A local stubbed failure proves propagation; the PR itself uses a normal green run rather than an intentionally failing commit.
- (AC16, AC17, AC18) A clean Compose project completes setup/dev/health/test and restart checks without host Ruby/Node or application-data mutation.
- (AC19, AC20) Stub SSM/session/Docker commands to prove explicit opt-in, dev-only enforcement, redaction, host-gateway routing, and local database defaults; perform a read-only dev connection query only when separately authorized.
- (AC21, AC22, AC23) Compare old/new ARM64 production images before the consumer switch; inspect the final image and host-native Compose rendering; stub rejected multi-platform pushes and inspect the actual preview ECR manifest before rollout.
- (AC24) Validate every documented command against one executable/operator path.
- (AC26) Use the committed exact path manifest and require the final non-test total below 4,214.

Required static/local commands include `git diff --check`, infra test/typecheck, every shell/Ruby contract named above, operator-doc validation, the line-budget check, all `scripts/ci/run` subcommands, Compose config/setup/health/restart/test/update, and the ARM64 before/after image inspections. Required authenticated checks are limited to read-only durable diffs until Slice 7's explicit preview-only approval.

## Definition of done

- [ ] (AC1, AC25) Runtime composition is a constructor-free facade under 100 lines; aggregate behavior and import-direction contracts pass after module renames/moves.
- [ ] (AC2, AC3) Reproducible post-extraction `dev` and `production` SST diffs contain zero operations.
- [ ] (AC4, AC5) `msc-gala` and SES remain reference/read-only with no create/import/delete/CORS-write/lifecycle path.
- [ ] (AC6) Every preview references the canonical verified dev VPC/cluster/static/router IDs and dev SSM names without creating or mutating a durable sharing resource.
- [ ] (AC7) After explicit approval, the live current-PR UAT serves its exact `https://pr-NUMBER.dev.learngala.dev` URL.
- [ ] (AC8) Plan and live readback show no service/route mutation for any other PR.
- [ ] (AC9, AC10) Only recorded exact-plan apply can enter SST, and destructive/shared/foreign operations stop first.
- [ ] (AC11, AC12, AC13) Deploy CI has two scalar inputs, one dispatcher, one machine-readable source for region/domain/ARM64 with no executable duplicate literals, and durable-stage serialization.
- [ ] (AC14, AC15) Each required CI suite has one matching subcommand, workflow step, and documented name; failure propagates to the native job result.
- [ ] (AC16, AC17, AC18) Canonical Docker setup/dev/restart/test works without host Ruby/Node or implicit data mutation.
- [ ] (AC19, AC20) Real dev data requires the explicit dev-only SSM tunnel/console acknowledgement; every default command uses local Postgres.
- [ ] (AC21, AC22, AC23) Every production consumer uses the single target, every pushed/reused ECR image is registry-verified ARM64-only before rollout, the old Dockerfile is deleted, and local Compose is host-native.
- [ ] (AC24) Root docs expose one canonical path for each developer/operator job.
- [ ] (AC26) The manifest reports fewer than 4,214 non-test lines.
- [ ] All listed static, infra, shell, Ruby, Rails, frontend, Docker, documentation, workflow, and approved preview-UAT checks pass.
- [ ] No unapproved deploy, durable-stage apply, refresh, state edit, Heroku mutation, shared-resource mutation, production URL cutover, or foreign-preview change occurred.
- [ ] `git diff --check` passes and unrelated developer changes remain intact.

## Risks & mitigations

- Pulumi identity drift during module moves — preserve logical names, parentage, order, inputs, and transforms; gate with identical empty durable diffs.
- Baseline live drift or false drift — use one exact command and constants hash, require two identical normalized results, stop before editing, and never absorb drift with refresh/state reconciliation in this ticket.
- Preview ALB expands the ephemeral graph and cost — enumerate its exact child graph, bind parentage/state/PR, require explicit UAT approval, and remove only through PR lifecycle review.
- A pinned dev reference becomes stale — compare each live readback to the canonical ID and stop; update it only through a separate reviewed plan, never by fuzzy discovery or a dev apply in this ticket.
- Preview cross-talk — isolate SST state, physical service discovery, route host, validator prefix, and readback checks per PR.
- Shared media/SES loss — forbid constructors/imports/writes and reject those types/names in every plan.
- Static/router/legacy CloudFront ambiguity — preserve current durable ownership; retirement remains a separate migration.
- CI simplification masks failures — one named fail-fast native step per suite plus an always-run summary; no advisory parallel result model.
- Docker cutover regression — retain the old file through parity, switch all consumers atomically, rerun durable diffs, then delete it.
- Dev database exposure or mutation — require explicit dev-only SSM port forwarding, redact secrets, keep defaults local, and document that the credential may permit writes even when verification uses only a read-only query.
- Large-ticket overlap — retain exclusive owners and the explicit Slice 4 → Slice 5 → Slice 6 handoff sequence.
