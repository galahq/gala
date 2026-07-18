# Plan: sst-platform-stage-boundaries

## Approach

Implement three ordered slices. First, characterize the current durable `dev` and `production` source contracts without moving constructors. Second, add explicit `preview` and `local` composition backed by read-only references to the verified `dev` platform. Third, finish the constructor ownership split, deployment target contracts, and four-mode documentation.

Keep the safety model intentionally small: this ticket runs local tests, TypeScript checks, source contracts, and stubbed plan-shape tests. It performs no authenticated SST preview, deploy, refresh, import, state edit, or AWS/Heroku mutation. Existing durable drift remains external evidence, not an implementation gate. If a source move changes a durable logical name, parent, physical name, input, output, protection rule, or retention rule, stop and restore the original declaration rather than introducing reconciliation machinery.

## Changes (file by file)

### Slice 1 — pin stage and durable behavior

- `infra/config.ts` — retain the existing discriminated `StageTarget` union and strict regexes. Add one pure `stageFacts(target)` result with only `backingStage`, `publicHost`, `routeEnabled`, and `durable`; `dev` backs itself, `production` backs itself, `preview` backs `dev` with its exact PR host, and `local` backs `dev` with no host. Keep capacity, provider region, protection, and retention code-owned.
- `infra/test/config.test.ts` — TDD the full accepted/rejected stage table, stage facts, durable policy, preview host, local no-route behavior, and the rule that neither preview nor local can resolve to production.
- `scripts/ops/test-sst-stage-boundaries.rb` — add an aggregate source contract that records the current durable logical names, physical-name expressions, parent expressions, outputs, protection/retention policy, pinned bastion AMIs, and construction order. Require exactly one constructor occurrence for each durable logical name. Reject `nightly`, arbitrary fallback stages, SES constructors, media-bucket constructors/imports, and production fallback from derived stages.
- `scripts/ops/test-sst-module-boundaries.rb` — keep import-cycle and constructor-uniqueness checks, then require the stage dispatcher to cover all four target kinds explicitly.

Slice 1 is complete when the new tests pass against the current durable implementation. It changes no resource constructor.

### Slice 2 — explicit dev-backed preview and local stages

- `infra/platform.constants.json` — validate the existing non-secret dev VPC, ECS cluster, subnet, security-group, Cloud Map, static-distribution, and shared-router identifiers; do not change their values in this ticket.
- `infra/dev-reference.ts` — add one focused reference builder. It uses the existing constants to return an SST `Cluster.get` reference, the existing static CloudFront distribution reference, the shared router reference, and dev SSM parameter names. It contains no VPC, RDS, Redis, S3, SES, CloudFront, router, secret, or SSM constructor.
- `infra/runtime/durable.ts` — move the existing `createRuntime` implementation here without changing constructor names, arguments, parents, transforms, branches, commands, environment, permissions, routes, tasks, cron resources, or outputs.
- `infra/runtime/derived.ts` — create only PR/local application resources on the referenced dev cluster. Reuse dev SSM parameter names for Rails/database/cache/Google/SMTP inputs. Use stage-qualified physical service-discovery and load-balancer names. Create the web/worker/task definitions required by the application, but no durable platform, bucket, distribution, secret, parameter, cron, database, cache, VPC, bastion, or SES resource. Preview mode adds one exact router route; local mode adds none.
- `infra/runtime.ts` — become a constructor-free facade exporting `createDurableRuntime` and `createDerivedRuntime`.
- `infra/stages/preview.ts` — require `target.kind === "preview"`, resolve the dev reference once, call the derived runtime with the exact PR host, and return only preview outputs.
- `infra/stages/local.ts` — require `target.kind === "local"`, resolve the same dev reference, call the derived runtime with routing disabled, and return no public hostname.
- `infra/stages/dev.ts`, `infra/stages/production.ts` — switch only the imported runtime function name; preserve assets/platform/runtime construction order and returned outputs.
- `infra/stages/index.ts` — use one exhaustive `switch` for `dev`, `production`, `preview`, and `local`; include an unreachable `never` assertion and no fallback-to-dev branch.
- `infra/sst.config.ts` — retain the current two callbacks and dynamic imports. No resource constructor, environment-derived stage override, or deployment action is added.
- `infra/test/stages.test.ts` — TDD pure composition descriptors/stubs: durable stages call durable composition, preview/local call dev-reference composition, preview supplies one exact host, local supplies no host, and an unexpected kind cannot dispatch.
- `scripts/ops/test-sst-stage-boundaries.rb` — extend the contract to permit only the derived application graph under preview/local modules. Assert the preview host/PR number is used in every route and physical service name; assert local has no route; reject durable constructors beneath either derived stage.

Slice 2 stops if the durable source contract changes. It does not run SST against AWS.

### Slice 3 — one target path and four-mode documentation

- `scripts/deploy-sst.sh` — keep `dev` and `production` as the only operator-selected durable inputs. Validate `GALA_EFFECTIVE_STAGE` when present: it must equal the durable input, or be an exact `pr-NUMBER` derived from `dev`; reject local stages in GitHub/release execution. Do not change release, promotion, rollback, image, asset, or infrastructure-apply behavior.
- `.github/workflows/deploy.yml` — retain the two durable workflow choices. Keep exact open-PR resolution to `pr-NUMBER`, stage-scoped concurrency, production environment protection, and one call to `scripts/deploy-sst.sh`; pass the resolved effective stage without adding free-form stage input.
- `scripts/ops/test-deploy-workflow-contract.rb` — add fixtures proving PR 790 resolves only to `pr-790`, production never becomes a preview, malformed/closed/no-PR branches remain dev, and local stages cannot enter GitHub deployment.
- `infra/README.md` — document the stage module tree, ownership table, dev-reference boundary, derived-resource allowlist, shared-resource exclusions, and no-state/no-apply rule.
- `docs/ops/workflows/deploy.md` — map each stage form to one canonical command and result: durable dev URL, durable production URL, exact PR preview URL, or local no-route `sst dev`. State that preview/local use dev backing and that local mode is never accepted by GitHub deployment.
- `scripts/ops/validate-operator-docs.sh` — require all four stage forms, their backing/hostname results, and the external ownership warning for `msc-gala`/SES.

## Test strategy

- (AC1) Accepted and rejected stage forms fail or resolve before composition — Node unit tests; TDD yes.
- (AC2) Durable stage descriptors plus aggregate constructor contracts preserve identity, policies, outputs, hostname, and construction order — characterization tests; TDD no, pin before moves.
- (AC3) Preview composition consumes only the dev-reference interface and rejects durable constructors — Node stub tests plus aggregate Ruby contract; TDD yes.
- (AC4) PR 790 produces one `pr-790.dev.learngala.dev` route and PR-qualified service names, with no PR 787 string or foreign-route path — unit/stub and workflow contract tests; TDD yes.
- (AC5) Local composition selects dev backing with routing disabled and cannot enter the GitHub dispatcher — unit/stub and shell/workflow contract tests; TDD yes.
- (AC6) `sst.config.ts` stays constructor-free and the stage import graph is acyclic/exhaustive — aggregate source contract; TDD no.
- (AC7) Aggregate TypeScript and shell scans reject S3 media-bucket lifecycle ownership and every SES constructor/import/apply path — source contract; TDD yes for negative fixtures.
- (AC8) Operator-doc validation finds one command plus the expected hostname/no-route result for every supported stage form — documentation contract; TDD yes.

Required local verification is `npm test` and `npm run check` from `infra/`, followed by `ruby scripts/ops/test-sst-stage-boundaries.rb`, `ruby scripts/ops/test-sst-module-boundaries.rb`, `ruby scripts/ops/test-sst-dev-runtime-contracts.rb`, `ruby scripts/ops/test-deploy-workflow-contract.rb`, `bash scripts/ops/validate-operator-docs.sh`, and `git diff --check`. No authenticated command is part of this ticket.

## Definition of done

- [ ] (AC1) The four accepted stage forms resolve deterministically; malformed, unknown, empty, mixed-case, zero-number, and fallback names fail before composition.
- [ ] (AC2) `dev` and `production` retain their exact characterized constructor identities, policies, outputs, hostnames, and construction order.
- [ ] (AC3) Preview composition references the verified dev platform and contains no durable-platform constructor.
- [ ] (AC4) A `pr-NUMBER` composition owns only its exact route and PR-qualified application resources.
- [ ] (AC5) A `local-NAME` composition uses dev references, emits no public hostname/route, and is rejected by GitHub deployment.
- [ ] (AC6) `infra/sst.config.ts` contains only app policy plus exhaustive stage dispatch; module-boundary tests pass.
- [ ] (AC7) Source and workflow contracts prove no lifecycle path exists for `msc-gala` or SES.
- [ ] (AC8) Documentation lists one canonical command and expected hostname/no-route result for all four stage forms.
- [ ] All required local verification commands pass without an AWS, Cloudflare, Heroku, or GitHub write.
- [ ] No SST deploy/refresh/import/state edit, durable apply, shared-resource mutation, or production cutover occurred.
- [ ] Unrelated working-tree changes and generated `infra/sst-env.d.ts` remain untouched.

## Risks & mitigations

- Durable URN drift during the runtime move — characterize every logical name, parent expression, physical-name expression, output, and constructor order before moving code; stop on any contract change.
- Incomplete dev references cause derived stages to construct durable resources — expose one `dev-reference.ts` interface and reject durable constructor types under preview/local modules.
- Preview cross-talk — derive the stage, hostname, route, service-discovery names, and physical application names from the validated PR number; test PR 790 against foreign PR 787.
- Local stage reaches production or public DNS — make `backingStage: "dev"` plus `routeEnabled: false` code-owned facts and reject local stages in GitHub deployment.
- Shared Heroku resource ownership leaks into SST — permit media/SES names and credentials as references only; static contracts reject constructors, imports, and mutating operator paths.
- Existing durable drift distracts or blocks the source refactor — run no authenticated SST command in this ticket and make state reconciliation explicitly out of scope.
