---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Dependency Modernization, Test Coverage, and AWS Deployment
status: executing
stopped_at: Phase 33 preview Sidekiq and Devise confirmation delivery verification complete
last_updated: "2026-06-02T13:55:00Z"
last_activity: 2026-06-02 -- Phase 33 used GitHub CLI, AWS CLI, and CloudWatch logs to verify PR #785 dev preview Sidekiq health; ECS reported GalaWorker healthy/running 1 of 1, worker logs showed Sidekiq processing Ahoy jobs, web logs showed the reported Devise confirmation mail delivered inline with POST /readers HTTP 302, and SES metrics showed a send attempt with no reject, bounce, or complaint telemetry
progress:
  total_phases: 24
  completed_phases: 24
  total_plans: 35
  completed_plans: 35
  percent: 100
---

# GSD State

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-05-12)

**Core value:** Every important route must keep working and looking recognizably like the pre-upgrade Gala experience while the Ruby, Node.js, and BlueprintJS stack is modernized.
**Current focus:** Phase 33 preview worker and confirmation-delivery verification is complete; remaining milestone archive decision is still blocked by exact-head CI validation artifact debt.

## Current Position

Phase: 33
Plan: 1 of 1
Status: Complete and externally validated
Last activity: 2026-06-02 -- PR #785 dev preview worker validation passed: AWS ECS reported `GalaWorker` desired 1/running 1/pending 0 and healthy on task definition `GalaWorker:16`; CloudWatch worker logs showed Sidekiq boot and `Ahoy::GeocodeV2Job` processing; CloudWatch web logs showed the reported `papester1+99@gmail.com` signup created the reader, rendered `AuthenticationMailer#confirmation_instructions`, logged delivered mail, and completed `POST /readers` with HTTP 302; worker logs had no matching mailer job because this Devise notification delivered inline from the web process; SES was healthy with one send metric and no reject/bounce/complaint datapoints in the inspected window

## Milestone

**v1.1 Dependency Modernization, Test Coverage, and AWS Deployment**

Modernize Ruby and JavaScript dependencies toward current recommended stable versions, migrate Node package management from Yarn 1 to pnpm, remove Flow from the frontend toolchain in favor of TypeScript/JSDoc, evaluate Vitest/Vite as the modern frontend test/build direction, restore reliable frontend test execution, add Playwright visual regression coverage for high-value route groups, and execute an AWS deployment path through SST without mutating current Heroku production.

## Active Rules

- Use official package registries and project documentation when selecting dependency targets.
- Use pnpm for Node dependency installation and lockfile management.
- Keep current React and BlueprintJS major versions during v1.1.
- Remove Flow tooling and annotations rather than upgrading Flow.
- Prefer Vitest for frontend tests if a spike proves it is compatible; keep Jest modernization as fallback.
- Treat Vite production bundler replacement as optional and gated by feasibility evidence.
- Preserve route behavior and the approximate BlueprintJS 2.3.1-era visual baseline unless a requirement explicitly changes it.
- Deploy AWS production candidates only through SST IaC and `.github/workflows/deploy.yml`.
- Do not mutate Heroku production at `https://www.learngala.com`; Heroku CLI use is read-only for `msc-gala` config values.
- Do not copy Heroku `DATABASE_URL` or Redis connection strings into AWS runtime config; use freshly provisioned SST database/cache outputs.
- Use the generated AWS ALB URL as the test entrypoint until DNS cutover is separately approved.
- Treat `learngala.dev` and preview subdomains as Phase 23 Cloudflare DNS targets owned by SST; `https://www.learngala.com` remains out of scope.
- Derive deploy release IDs as `github_run_id.YYYYMMDDHHMMSS.shortsha`, and store assets under immutable `releases/<stage>/<release_id>/` prefixes.
- Reuse/import existing AWS resources, including SES, Gmail, and S3 credentials, without destructive actions.
- Prefix AWS/SST execution commands with `AWS_PROFILE=gala AWS_REGION=us-west-2 SST_STAGE=production`.
- Prefix every read-only Heroku CLI command with `heroku --app msc-gala`.
- Use `config/routes.rb` as the source of truth for route groups covered by browser and visual regression tests.
- Use `localhost:3000` for browser QA.
- Run targeted automated tests for touched Ruby and JavaScript files.
- Commit each phase after its verification gate passes.
- Use SST in `infra/sst.config.ts` as the infrastructure authority for AWS production candidates and preview environments.
- Use `arm64` as the production-capable default for SST-managed AWS environments; `x86_64` remains an explicit manual override only.
- Keep Thruster no-adopt for the current CloudFront/S3/ECS/Puma architecture.

## Blockers

- None.

## Follow-Up Noise

- Browser tooling reaches the app via `host.docker.internal:3000`, which produces webpack-dev-server `Invalid Host/Origin header` HMR console errors.
- Root catalog browser QA observed an external Mapbox style `404` and React runtime warnings; defer to route-specific phases unless they block visible behavior.
- Phase 2 legacy redirect destinations can show missing local data after redirect; redirect targets are still preserved.
- Phase 3 search returns `[]` if the local `cases_search_index` materialized view is present but unpopulated; refresh the index for real local search data.
- Phase 4 feature-spec supplement coverage was blocked by local Selenium/Capybara setup: `Can't initialize Selenium::WebDriver::Chrome::Driver with :url`.
- Phase 4 had no existing local editor-accessible case; protected case routes were verified as anonymous sign-in redirects and controller specs supplemented route behavior.
- Phase 7 full `yarn test --runInBand` is blocked by existing Jest transform configuration failures on ES module imports; v1.1 should replace this with a reliable pnpm-backed frontend test command, preferably Vitest if feasible.
- Phase 7 browser QA on deployment routes showed existing local dev-server stale chunk 404/MIME noise and shared styled-components deprecation warnings, with no deployment-specific blocker.
- Phase 8 browser QA confirmed the routed admin and Sidekiq surfaces are stable; remaining public-shell React/styled-components warnings and a Mapbox style `404` were accepted as unrelated noise for this route group.
- Phase 13 removed Flow syntax/tooling with a mechanical strip. TypeScript is present as a non-emitting `allowJs`/JSDoc baseline with `skipLibCheck` until third-party React/webpack ambient types are addressed by a later typing phase.
- Phase 14 updated compatible Ruby runtime and dev/test gems. Runtime gates passed (`bundle check`, Rails boot, full RSpec, assets precompile), and dev/test gates passed (`bundle check`, full RSpec, `rake test:unit`). RSpec now forces `RAILS_ENV=test` because Docker exports `RAILS_ENV=development`.
- Phase 15 completed the conservative JavaScript dependency batch: `webpack` 5.107.2, `webpack-dev-server` 5.2.4, and `sass` 1.100.0. Shakapacker stayed aligned at 10.0.0, React/Blueprint majors stayed held, `pnpm install --frozen-lockfile`, `pnpm test -- --runInBand`, and Docker asset precompile passed.
- Phase 20 completed the AWS SST deployment through `.github/workflows/deploy.yml` run `26318968133` at commit `d6d99b940e0a51ffdada992d9951a9666b5b1c01`. The environment is available at `http://GalaWebLoadBala-chdmccbn-1073735116.us-west-2.elb.amazonaws.com`, seeded from `db/sqldump/seed.dump`, steady on ECS task definition revision `:7`, and Heroku production remains unchanged.
- Phase 21 addressed the AWS catalog bottleneck found on 2026-05-30: `/cases.json` was dominated by Rails serialization, not static asset delivery. The rollout adds a separate app CloudFront distribution with default caching disabled and short TTL behavior only for public anonymous catalog JSON paths, adds immutable static asset headers, increases production web CPU/memory, and raises Puma concurrency. Targeted catalog request specs passed in Docker compose.
- Phase 22 deployed and validated the app CloudFront distribution `EF4NIYHMN17KT` / `https://d3sn0yc7ms2w6o.cloudfront.net`. No-cookie anonymous catalog JSON now emits `max-age=300, s-maxage=300, stale-while-revalidate=60`; cookie-bearing, query, and private variants remain uncached; and anonymous root HTML no longer preloads `/profile.json` or `/enrollments.json`.
- Phase 23 adds a new deployment architecture layer: Cloudflare DNS for `learngala.dev`, branch preview subdomains, release-ID asset prefixes, GitHub releases for production deploys, PR comments for previews, and contributor-gated deploy workflow inputs.
- Phase 23 live breakpoint was resolved by later deploy work: production Router `E3FF4TTU9Q4XTY` / `d1ky1nvgqyxj8z.cloudfront.net` serves `learngala.dev`; `https://dev.learngala.dev/up` returned HTTP 200 during Phase 30 validation; ECS `GalaWeb` and `GalaWorker` were running 1/1 on `GalaWeb:13` and `GalaWorker:12`.
- Phase 30 CI validation warning: latest inspected remote `gala/ci-validation` status remained `failure` on `e2445ae9` even though workflow run `26755143627` concluded `success`; the downloaded validation report recorded failed integration, Ruby lint, ESLint, and Stylelint dimensions. Inspect the exact closeout head before milestone archive.
- Phase 31 planning warning: `node gsd-tools validate consistency` is not present in this checkout, so planning consistency was reviewed manually instead of through that unavailable command.
- Phase 31 deploy warning: `.github/workflows/preview.yml` can conclude success before ECS services are stable; keep the explicit `aws ecs wait services-stable` gate for preview validation.
- Phase 31 workflow warning: GitHub preview run `26795072027` emitted Node.js 20 deprecation warnings for GitHub Actions dependencies; upgrade actions separately.
- Phase 31 SMTP warning: dev SMTP credentials still failed authentication during reproduction; registration no longer returns 500 when `RAISE_DELIVERY_ERRORS=false`, but confirmation email delivery should be rotated/validated separately if required.
- Phase 31 CI warning: CI Validation run `26795428197` concluded success, but its downloaded `validation-report.json` recorded `state: failure`; Phase 31-owned Devise spec env fallback and RuboCop helper issues were fixed, while admin Sidekiq, broad RuboCop, ESLint, Stylelint, SST-evidence, and smoke-secret debt remain outside this auth fix.
- Phase 33 delivery warning: Sidekiq is healthy, but the tested Devise confirmation path did not enqueue a mailer job; Rails delivered it inline from the web process. AWS SES showed a send and no reject/bounce/complaint metrics, so missing Gmail inbox placement needs SES event publishing or recipient-side spam/quarantine/filter inspection if stronger proof is required.

## Accumulated Context

### Roadmap Evolution

- Phase 26 added: Simplify ECS task definitions and add CI validation status reporting
- Phase 25 added: Audit Docker architecture and GitHub Actions operator guardrails for secure reliable platform operations
- Phase 24 added: Cut Gala production Docker image size with reusable base image and slimmer production Dockerfiles
- Phase 24 follow-up added: canonical test DB/run command documentation and deterministic `run-rspec.sh` DB prepare path
- Phase 22 added: AWS Edge Cache Validation and Catalog Load Optimization
- Phase 23 added: Immutable Cloudflare DNS and preview deployment pipeline
- Phase 27 added: spot and remove ambiguous environment variables like the GIT_* ones defined in the task definitions if the value is empty or blank then it shall be removed
- Phase 28 added: Verify ARM ECS Fargate runtime architecture and resolve Thruster AWS fit
- Phase 28 completed: dev ARM64 runtime was proven for web, worker, migration, and one-off tasks; the original x86 rollback gate failed because captured X86_64 task definitions became inactive; Phase 32 supersedes that gate for the greenfield AWS environment and adopts ARM64 as the default. Thruster decision is `no-adopt`.
- Phase 29 added: Produce SPEND.md report for SST-tracked AWS infrastructure capex/opex migration decisioning
- Phase 29 completed: root `SPEND.md` now records SST-tracked AWS inventory, May 2026 account-wide spend evidence, capex/opex framing, growth scenarios, cost-cut recommendations, Heroku stay/hybrid/migrate thresholds, drift, and unknowns.
- Phase 30 added and completed: dirty cache/deploy closeout artifacts were audited and committed, focused cache specs passed, GitHub/AWS/SST guardrails were inspected, Heroku remained untouched, ARM64/Thruster deferrals were preserved, and milestone archive remains gated on exact-head CI validation.
- Phase 31 added and completed: SST dev preview sign-in origin handling now derives `FORCE_SSL=true` from HTTPS `BASE_URL`, Devise sign-up no longer returns 500 on preview SMTP authentication failures when delivery errors are disabled, preview workflow run `26795072027` deployed commit `63e17d6d12757d6db67e55064b2fd65b75febff6`, ECS stabilized on `GalaWeb:16`/`GalaWorker:15`, live `/up`, sign-up, and sign-in smokes passed, recent CloudWatch bad-pattern query `7b305a77-dcb4-467c-873e-22ef682ab458` returned zero matches, and exact-head CI artifact inspection caught and drove a Devise request-spec env fallback repair.
- Phase 32 added and completed: ARM64 is now the default for SST task definitions, deploy tooling, and GitHub deploy/preview/promote workflows; workflows select architecture-matched immutable base images; production ARM64 deploys use full SST instead of ECS-only for the first transition; rollback release redeploy defaults to ARM64; x86_64 rollback proof is no longer a gate for the greenfield AWS environment; Thruster remains no-adopt; and GitHub/AWS/live auth validation passed on dev run `26797189665`.
- Phase 33 added and completed: PR #785 dev preview Sidekiq verification passed through read-only AWS CLI and CloudWatch checks; `GalaWorker` was healthy and processing jobs, the reported Devise signup completed HTTP 302, the confirmation email was delivered inline by the web process rather than Sidekiq, and SES telemetry showed a send with no reject, bounce, or complaint datapoints.

## Notes

- `.planning/codebase/` contains the current codebase map.
- v1.0 archives live in `.planning/milestones/`.
- v1.1 research is captured in `.planning/research/`.
- v1.1 roadmap starts at Phase 10, continuing the regular phase sequence after v1.0 Phase 9.

## Session Continuity

Last session: 2026-06-02T13:55:00Z
Stopped at: Phase 33 preview Sidekiq and Devise confirmation delivery verification complete
Resume file: .planning/phases/33-verify-preview-sidekiq-and-devise-confirmation-delivery/33-CONTEXT.md

## Quick Tasks Completed

| Date | Task | Status | Commit |
| --- | --- | --- | --- |
| 2026-05-30 | Add root CODEOWNERS file | complete | this commit |
| 2026-05-05 | Remove legacy automation residue | complete | this commit |
| 2026-05-05 | Fix missing reading-list UUID nil title error | complete | this commit |
| 2026-05-04 | Restore production Mapbox style fallback | complete | this commit |
| 2026-05-04 | Document Google mock login for protected-route visual QA | complete | this commit |
| 2026-06-01 | Standardize test DB URL selection and update `run-rspec.sh` / `bin/run_ci_tests` | complete | this change |
| 2026-06-01 | Close dirty GSD cache/deploy artifacts and validate guardrails | complete | this change |

## Operator Next Steps

- Use `https://learngala.dev` and branch subdomains under `*.dev.learngala.dev` for Phase 23 AWS/Cloudflare validation after SST deploy succeeds.
- Use the generated ALB URL as the direct-origin comparison path.
- Keep `https://www.learngala.com` on Heroku until a separate `.com` DNS cutover phase is explicitly approved.
- If rollback is needed, redeploy the previous known-good branch or commit through `.github/workflows/deploy.yml`; retained release asset namespaces preserve the prior static assets during the rollback window.
- Before rerunning Rails request specs, use `./run-rspec.sh <specs>` or `RAILS_ENV=test DATABASE_URL=postgres://gala:alpine@<host>:5432/gala_test bundle exec rspec ...` so tests target the dedicated test DB.
- Before archiving v1.1, push the Phase 30 closeout commit and inspect the exact-head `gala-ci-validation` artifact with `gh run download`; do not trust workflow conclusion alone.
