# ci(7)

## NAME
ci - validate Gala pull requests and deployed smoke targets

## SYNOPSIS
`ci` is `.github/workflows/ci.yml`. It runs on `pull_request` and can be
manually dispatched against a deployed smoke URL:

```sh
gh workflow run ci.yml --ref REF -f smoke_url=https://dev.learngala.dev
```

## INPUTS
- `smoke_url`: optional deployed URL. If blank, CI falls back to
  `vars.GALA_CI_SMOKE_URL`.

## DRY RUN
CI is non-mutating by contract. It does not deploy, promote, roll back, or run
Rails commands against production database or cache resources. SST evidence is
disabled unless `CI_RUN_SST_EVIDENCE=true`, and that path is constrained to the
dev stage.

## SIDE EFFECTS
The workflow name is `ci`, the job id is `ci`, and the runner is
`ubuntu-24.04-arm`. The workflow starts local Postgres 16 and Redis 7 services
for test isolation. It posts an advisory commit status, uploads the rendered
validation report artifact, and may run Playwright smoke only when a smoke URL
and `GALA_SMOKE_READER_EMAIL` / `GALA_SMOKE_READER_PASSWORD` are configured.

Main suites:

- `node --test scripts/ci/*.test.mjs`
- `bundle exec rails assets:precompile`
- `bundle exec rails db:prepare`
- `bundle exec rspec --format progress --color`
- `bundle exec rubocop --fail-level error`
- `pnpm exec eslint app/javascript`
- `pnpm exec stylelint "app/assets/stylesheets/**/*.scss" "app/assets/stylesheets/**/*.css"`
- `bundle exec rake factory_bot:lint`
- `pnpm test`
- Optional `pnpm test:smoke`

## VERIFY
Check the workflow summary, validation artifact, advisory commit status, and
failing suite logs. For smoke runs, verify the target URL, Playwright
console/network output, and the deployed `/up` endpoint when the failure looks
environmental.

Merge still requires branch protection, CODEOWNER approval, reviewed diffs,
resolved threads, and any required dev preview evidence.

## ROLLBACK
CI has no runtime rollback. Fix the branch, rerun `ci`, or revert the offending
commit through a normal PR. Production recovery applies only after a separate
`deploy` promotion or explicit operator action.

## EXAMPLES
Run smoke against a deployed dev or preview URL:

```sh
gh workflow run ci.yml --ref feature/ref -f smoke_url=https://feature-ref.dev.learngala.dev
```

## SEE ALSO
`deploy(7)`
