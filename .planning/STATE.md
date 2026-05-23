---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Dependency Modernization, Test Coverage, and AWS Deployment
status: complete
stopped_at: Phase 20 complete
last_updated: "2026-05-23T01:06:13Z"
last_activity: 2026-05-23 -- Phase 20 AWS SST production deployment completed through GitHub Actions, seeded from db/sqldump/seed.dump, validated through the generated ALB URL, and left Heroku production unchanged
progress:
  total_phases: 11
  completed_phases: 10
  total_plans: 13
  completed_plans: 12
  percent: 92
---

# GSD State

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-05-12)

**Core value:** Every important route must keep working and looking recognizably like the pre-upgrade Gala experience while the Ruby, Node.js, and BlueprintJS stack is modernized.
**Current focus:** Phase 20 AWS production deployment completed via SST and GitHub Actions

## Current Position

Phase: 20 — AWS Production Deployment Execution
Plan: 20-01
Status: Complete
Last activity: 2026-05-23 -- Phase 20 AWS SST production deployment completed through GitHub Actions, seeded from db/sqldump/seed.dump, validated through the generated ALB URL, and left Heroku production unchanged

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
- Reuse/import existing AWS resources, including SES, Gmail, and S3 credentials, without destructive actions.
- Prefix AWS/SST execution commands with `AWS_PROFILE=gala AWS_REGION=us-west-2 SST_STAGE=production`.
- Prefix every read-only Heroku CLI command with `heroku --app msc-gala`.
- Use `config/routes.rb` as the source of truth for route groups covered by browser and visual regression tests.
- Use `localhost:3000` for browser QA.
- Run targeted automated tests for touched Ruby and JavaScript files.
- Commit each phase after its verification gate passes.

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
- Phase 20 completed the AWS SST deployment through `.github/workflows/deploy.yml` run `26318968133` at commit `d6d99b940e0a51ffdada992d9951a9666b5b1c01`. The environment is available at `http://GalaWebLoadBala-chdmccbn-1073735116.us-west-2.elb.amazonaws.com`, seeded from `db/sqldump/seed.dump`, steady on ECS task definition revision `:7`, and Heroku production remains unchanged.

## Notes

- `.planning/codebase/` contains the current codebase map.
- v1.0 archives live in `.planning/milestones/`.
- v1.1 research is captured in `.planning/research/`.
- v1.1 roadmap starts at Phase 10, continuing the regular phase sequence after v1.0 Phase 9.

## Session Continuity

Last session: 2026-05-23T01:06:13Z
Stopped at: Phase 20 complete
Resume file: .planning/phases/20-aws-production-deployment-execution/20-VALIDATION.md

## Quick Tasks Completed

| Date | Task | Status | Commit |
| --- | --- | --- | --- |
| 2026-05-05 | Remove legacy automation residue | complete | this commit |
| 2026-05-05 | Fix missing reading-list UUID nil title error | complete | this commit |
| 2026-05-04 | Restore production Mapbox style fallback | complete | this commit |
| 2026-05-04 | Document Google mock login for protected-route visual QA | complete | this commit |

## Operator Next Steps

- Use the generated ALB URL for any additional AWS smoke testing.
- Keep `https://www.learngala.com` on Heroku until a separate DNS cutover phase is explicitly approved.
- If rollback is needed, update ECS services back to task definition revision `:6` or redeploy image tag `831d5293bc53b5af0b5a641ac04a6d2ef50a4fa0`.
