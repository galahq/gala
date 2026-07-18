# Context: sst-ergonomic-platform-refactor

## Intent

Make Gala's local development, continuous integration, and SST deployment paths read like a small declarative platform: one obvious command per operation, explicit stage ownership, scalar configuration, and safe defaults. The refactor must make routine AWS releases as predictable as the existing Heroku workflow without changing live resource identities or taking ownership of Heroku-shared resources.

## Acceptance criteria

- AC1: A reader can identify every infrastructure ownership domain from its `infra/` module name without tracing a general-purpose runtime builder.
- AC2: After every source-only infrastructure move, two no-refresh `dev` previews reproduce the frozen duplicate-preserving 37-operation array exactly, with canonical JSONL fingerprint `29629ae926e6e900253517d3e717b6adb887875e0dee8057163b30147c1654e5`, and add, remove, or change no operation; legacy audit label `9d05c269…` remains provenance only.
- AC3: After every source-only infrastructure move, two no-refresh `production` previews reproduce the frozen duplicate-preserving 100-operation array exactly, with canonical JSONL fingerprint `f8925b10e42bf8d732df7b8aea8de8b5350546f1267ae416ba8db858ba87f6a4`, and add, remove, or change no operation; legacy audit label `4479de82…` remains provenance only.
- AC4: Routine deployment code treats the existing `msc-gala` media bucket as reference-only.
- AC5: Routine deployment code treats existing SES/SMTP resources as reference-only.
- AC6: A `pr-*` release defaults to the `dev` runtime.
- AC7: A preview release publishes only its matching `pr-NUMBER.dev.learngala.dev` route.
- AC8: A routine preview release cannot remove or update a different pull request's route.
- AC9: An infrastructure-changing release requires an explicit operator-selected action.
- AC10: An infrastructure-changing release stops before apply when its preview contains a forbidden resource category.
- AC11: The GitHub deploy workflow passes only scalar release intent to one repository-owned dispatcher.
- AC12: AWS region, root domain, ARM64 architecture each resolve from exactly one code-owned value.
- AC13: Two GitHub deployments targeting the same effective stage cannot mutate that stage concurrently.
- AC14: A required CI suite failure makes the native GitHub Actions check fail after diagnostics are published.
- AC15: CI documentation lists exactly the required suites the workflow executes.
- AC16: A new developer can prepare the application with `bin/setup` using Docker as the application runtime.
- AC17: A new developer can start the prepared application with `bin/dev` without installing host Ruby or Node.
- AC18: Restarting the local web container performs no database seed or application-data mutation.
- AC19: Connecting local containers to the AWS `dev` database requires an explicitly named opt-in command.
- AC20: No local default targets `production` or a remote database.
- AC21: The release image is built through one production Docker target.
- AC22: Every published release image manifest is ARM64-only.
- AC23: Local Docker uses the host-native architecture.
- AC24: Each documented operator workflow has one canonical command path discoverable from the root README.
- AC25: Moving or renaming a TypeScript infrastructure module without changing resource declarations does not fail behavioral infrastructure contracts.
- AC26: The completed implementation has a net reduction in non-test lines across all in-scope entrypoints compared with the baseline recorded during planning.
- AC27: Every durable-stage behavior change is reported as a duplicate-preserving multiset delta against the frozen durable operation baseline; unchanged baseline operations are never treated as approved, and this ticket performs no `dev` or `production` apply.
- AC28: Every source-only infrastructure move produces identical before/after keyed fingerprints of the complete policy-visible desired resource definitions, including props, parent/provider identity, protection, aliases, ignore rules, replacement order, secret-output declarations, and custom timeouts, without persisting or printing plaintext values; the Google `dependsOn` transform remains pinned by its source contract because Pulumi policy options do not expose dependency sets.
- AC29: Every authenticated equivalence artifact identifies the exact evaluated source bundle, toolchain, stage, sanitized non-secret inputs, and unchanged SST checkpoint version rather than relying on `HEAD` alone.

## Files / modules in play

- `infra/sst.config.ts` — minimal SST app policy and durable-stage dispatch.
- `infra/config.ts` — flat scalar stage configuration and fixed platform values.
- `infra/platform.ts`, `infra/assets.ts`, `infra/runtime.ts`, `infra/stages/**` — current remote-infrastructure definitions to split by ownership without changing inputs or logical names.
- `infra/README.md` — architecture, ownership, state-safety, and operator workflow documentation.
- `.github/workflows/deploy.yml` — thin authenticated GitHub deployment entrypoint and stage concurrency.
- `.github/workflows/ci.yml` — native required checks and named suite orchestration.
- `scripts/deploy-sst.sh` — sole release/deploy dispatcher called by GitHub and operators.
- `scripts/ci/**` — CI suite runners, reporting, and behavior-focused contracts.
- `scripts/ops/**` — explicit read-only verifiers and separately gated mutating operator commands.
- `scripts/ops/sst-equivalence-policy/**` — pinned read-only Pulumi policy analyzer used only to produce secret-safe desired-resource fingerprints during durable previews.
- `Dockerfile`, `Dockerfile.production`, `docker-compose.yml`, `entrypoint.sh` — local and production container contracts.
- `bin/setup`, `bin/dev`, `bin/update`, `bin/sst-db`, `run-rspec.sh`, `bin/run_ci_tests` — canonical developer commands and redundant paths to consolidate.
- `mise.toml`, `Procfile`, `Procfile.dev` — optional host tooling plus retained Heroku/local process contracts.
- `README.md`, `docs/ops/workflows/**` — discoverable and accurate workflow documentation.

## Constraints

- Preserve SST app name `gala`, AWS region `us-west-2`, stages `dev` and `production`, protection policy, retention policy, every existing Pulumi/SST logical name, component parent, physical name, and output until consumer auditing proves a change safe.
- Run source-only infrastructure moves before any behavior change and require two identical no-refresh previews per durable stage whose complete normalized arrays equal the approved frozen baselines exactly.
- Preserve `dev` as the backing infrastructure for preview releases; preview-specific application infrastructure changes remain explicit and diff-gated.
- Treat `msc-gala` and SES as externally owned by the surviving Heroku production system. Reference them only; never make their lifecycle part of SST.
- Preserve the current static-assets bucket and router ownership semantics during the code-only refactor even though their cross-stage ownership must be reconciled separately.
- Do not use `sst refresh`, edit SST state, mutate AWS, deploy, or alter Heroku as part of the source refactor.
- Keep production ARM64-only. Do not add an architecture environment variable.
- Keep real dev-database access explicit, opt-in, and clearly separated from the default local database.
- Keep `Procfile` as the Heroku production contract until a separately approved cutover retires Heroku.
- Preserve unrelated working-tree changes, including current modifications under `docs/` and generated `infra/sst-env.d.ts`.
- Delegate implementation by non-overlapping ownership: remote infra/deploy, CI/docs, and local Docker/Rails commands. Shared integration files require a single owner or sequential edits.

## Risks

- Moving or renaming an SST constructor, changing a parent, or changing an import option can alter a Pulumi URN and replace a live resource.
- The static assets bucket currently has ambiguous ownership across `dev` and `production` state; cleanup requires a separately approved state migration.
- The production-owned router is mutated by `dev`; changing ownership can remove preview routes or aliases.
- The legacy application CloudFront distribution may appear unused but deleting it is a real infrastructure deletion that requires traffic and consumer evidence.
- RDS subnet, storage, identifier, or parent changes can replace or damage the database; capacity changes require an exact reviewed preview.
- Simplifying CI can hide failures if diagnostics and the final native job result are not handled independently.
- Consolidating Dockerfiles can accidentally ship development gems, Node, compilers, test source, or mutable assets in the production image.
- Changing local database startup can seed or mutate real dev data if the opt-in boundary is unclear.
- A non-empty equivalence baseline can normalize dangerous operations — compare complete normalized arrays rather than counts, bind them to immutable fingerprints, report later behavior as a set delta, and never apply either durable baseline in this ticket.
- A policy analyzer can receive decrypted secrets during preview — use only pinned repository-owned code, HMAC complete resource definitions with one ephemeral 256-bit key, write fingerprints atomically to restricted temporary files, and stop before refactoring unless synthetic leakage/unknown-value tests pass.

## Out of scope

- Any deployment, refresh, state edit, AWS mutation, Heroku mutation, or shared-resource mutation during this framing and source-refactor slice.
- Reassigning static-assets bucket ownership between SST stages.
- Reassigning router/distribution ownership between SST stages.
- Removing any CloudFront distribution, DNS alias, ALB, log group, autoscaling resource, bastion, RDS resource, or cache resource.
- Moving RDS or Valkey between subnets.
- Production URL cutover from `dev.learngala.dev` to `learngala.dev`.
- Rotating or changing Google OAuth credentials.
- Retiring Heroku, its `Procfile`, its S3 uploads, or its SES integration.
- Changing application features or Rails business behavior.
- Reconciling, refreshing, applying, or otherwise resolving the frozen durable-stage baseline operations.

## Sensitivity

- authorization
- money
- data-integrity
- migrations

## Open questions

- [x] None. Nathan explicitly selected exact non-empty baseline equivalence on 2026-07-12. The baseline is evidence only, never an apply allowlist; reconciliation remains separate work.

## Research basis

- SST recommends small imported infrastructure modules for monorepos and stage-specific resources for isolated environments.
- SST recommends sharing only expensive or data-bearing resources, which supports `dev` backing for preview releases rather than duplicating the database.
- SST distinguishes referencing an externally managed resource from importing it; importing transfers lifecycle ownership and is therefore incorrect for Heroku-shared S3/SES.
- SST state locking and no-refresh previews are the normal safety mechanisms; state repair remains an incident-only operation.
- GitHub Actions concurrency should key on the effective deployment target, and AWS authentication should continue using short-lived OIDC credentials.
- SST's public examples cover compact Rails, Rust, Go, and container deployments, but the research found no credible, well-documented public example of a very large Rails/Django/Laravel monolith on current SST. The design therefore applies current official SST/GitHub guidance and this repository's observed constraints rather than claiming an unverified industry pattern.
