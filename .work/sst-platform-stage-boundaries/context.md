# Context: sst-platform-stage-boundaries

## Intent

Make Gala's SST configuration easy to understand by defining four explicit stage modes: durable `dev`, durable `production`, isolated `pr-NUMBER` previews backed by `dev`, and `local-NAME` development backed by `dev`. This ticket is a source-organization and stage-boundary refactor; it does not reconcile existing state or redesign releases, CI, Docker, or shared resources.

## Acceptance criteria

- AC1: SST accepts exactly four stage forms—`dev`, `production`, `pr-NUMBER`, `local-NAME`—with every other value failing before resource construction.
- AC2: Dispatching `dev` or `production` preserves the stage's existing durable resource identities, policies, outputs, public hostname.
- AC3: A `pr-NUMBER` stage references the existing `dev` durable graph without constructing replacements for it.
- AC4: A `pr-NUMBER` stage owns only its matching `pr-NUMBER.dev.learngala.dev` route plus PR-qualified services.
- AC5: A `local-NAME` stage produces a no-public-route development graph backed exclusively by `dev` resources.
- AC6: `infra/sst.config.ts` contains only app policy plus exhaustive stage dispatch.
- AC7: SST performs no lifecycle operation on the externally owned `msc-gala` bucket or SES resources.
- AC8: Infrastructure documentation maps each supported stage form to one command plus its expected hostname or no-route result.

## Files / modules in play

- `infra/sst.config.ts` — retain only app policy and the call into stage dispatch.
- `infra/config.ts` — classify the four supported stage forms and expose flat stage facts.
- `infra/stages/index.ts` — exhaustively dispatch the four stage kinds with no fallback.
- `infra/stages/dev.ts` — compose the existing durable dev graph.
- `infra/stages/production.ts` — compose the existing durable production graph.
- `infra/stages/preview.ts` — compose the isolated preview graph from dev references.
- `infra/stages/local.ts` — compose the no-public-route local graph from dev references.
- `infra/runtime.ts` and focused `infra/runtime/*.ts` modules — move existing constructors by ownership while preserving names, inputs, parents, and ordering.
- `infra/test/config.test.ts` and focused infrastructure contract tests — prove stage classification, dispatch, dev backing, route isolation, and shared-resource exclusions.
- `scripts/deploy-sst.sh` — resolve explicit durable, PR preview, and local development targets through the same stage rules.
- `.github/workflows/deploy.yml` — continue deriving an exact `pr-NUMBER` from a pull request while exposing only `dev` and `production` as operator-selected durable targets.
- `infra/README.md` and `docs/ops/workflows/deploy.md` — document the four modes and their ownership boundaries.

## Constraints

- Preserve SST app name `gala`, AWS account `353760060567`, AWS region `us-west-2`, root domain `learngala.dev`, and ARM64 production architecture.
- Preserve all existing durable Pulumi/SST logical names, physical names, parents, inputs, outputs, protection, and retention during source moves.
- `dev` remains the only backing environment for previews and local remote-data development.
- `production` is never a fallback for an unknown, preview, or local stage.
- Preserve the existing static-assets and shared-router ownership semantics; ownership migration is separate work.
- Treat `msc-gala` and SES as externally owned because Heroku production still depends on them.
- Do not deploy, refresh, edit SST state, reconcile pending operations, mutate Heroku, or mutate shared resources while implementing this refactor.
- Preserve unrelated working-tree changes and generated `infra/sst-env.d.ts` changes.

## Risks

- Moving an SST constructor can change a Pulumi URN if its logical name, parent, or component boundary changes.
- A preview or local stage can accidentally construct a second durable network, database, cache, bucket, or router if dev references are incomplete.
- An imprecise preview hostname or stage lookup can modify another pull request's route.
- A local stage can expose a public route or target production if fallback behavior remains implicit.
- Existing live `dev` and `production` previews contain unrelated drift; this ticket must not normalize, apply, or reconcile that drift.

## Out of scope

- Frozen 37-operation and 100-operation durable baselines, semantic HMAC analyzers, Pulumi policy packs, checkpoint fingerprint protocols, and state reconciliation.
- Any `dev` or `production` apply, refresh, import, deletion, ownership transfer, or production URL cutover.
- Dockerfile consolidation, image tag/version redesign, asset publication redesign, or rollback redesign.
- GitHub CI suite/reporting redesign and line-count budget enforcement.
- Changing database or cache class, scaling, networking, bastion, CloudFront behavior, DNS ownership, or shared router ownership.
- Google OAuth changes, Rails application behavior changes, and Heroku configuration changes.
- Retiring or importing `msc-gala`, SES, the Heroku `Procfile`, or any Heroku-owned integration.

## Sensitivity

- authorization
- data-integrity

## Open questions

- [x] Which simplification approach should the new ticket use? Resolved: Nathan approved the stage-first refactor (Approach A) on 2026-07-12.
