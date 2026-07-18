# Task 3: SST Google secrets and deploy workflow contracts

Implement the approved infrastructure source slice with contract tests first.

## Requirements

- In `infra/sst.config.ts`, add retained `sst.Secret` resources named exactly
  `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_MIGRATION_CLIENT_ID`, and
  `GOOGLE_MIGRATION_CLIENT_SECRET`.
- Project all four through the existing `secretValueToParameter` SecureString
  map inherited by both Rails services and every Rails task. Do not define an
  SST fallback value.
- Add all four exact names to `.github/workflows/deploy.yml`'s
  `RETAINED_SECRET_KEYS`.
- Extend `scripts/ops/test-sst-dev-runtime-contracts.rb` to prove all four
  retained declarations, all four SecureString projections, and inheritance by
  both Rails services and every Rails task.
- Extend `scripts/ops/test-workflow-architecture-defaults.rb` to prove the
  workflow inventory includes all four names.
- Regenerate tracked `infra/sst-env.d.ts` with the repository's normal SST
  generation/install command, with `AWS_PROFILE=gala SST_STAGE=dev` and an
  explicit dev stage if that command invokes SST. Inspect/resource-check names
  only. Never touch the pre-existing untracked root `sst-env.d.ts`.

## Tests and TDD evidence

- Change the two Ruby contract scripts first and capture their expected RED
  failures before source/workflow changes.
- Implement minimally, then run both contract scripts GREEN.
- Run any repository type/TypeScript validation that does not provision,
  deploy, or mutate secrets. If normal type generation needs external auth and
  cannot run safely, stop and report the exact blocker rather than guessing or
  hand-editing generated types.

## Scope and safety

- No `sst secret set`, AWS mutation, deploy, Heroku command, Google Cloud
  action, secret read, or secret output.
- Every AWS CLI or SST CLI command must have `AWS_PROFILE=gala SST_STAGE=dev`;
  this task should need only read-only/type-generation commands.
- Preserve all existing untracked paths and never stage `.work/`.

