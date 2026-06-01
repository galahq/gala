# Phase 26: Simplify ECS Task Definitions And Add CI Validation Status Reporting - Context

**Gathered:** 2026-06-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 26 delivers two connected platform improvements:

1. Reduce duplicated SST/ECS task-definition configuration for the AWS app runtime, worker runtime, migrations, seed/import tasks, cache/index maintenance tasks, and scheduled report tasks.
2. Add an advisory GitHub Actions CI validation workflow that runs automatically on main pushes and PR commits, normalizes high-signal verification output, and updates GitHub commit status through the GitHub REST API.

This phase does not make deploys automatic. Deploy remains an explicit operator action through the existing deployment workflow boundary. CI output is decision support for CODEOWNERs and operators, not an automatic release gate. The phase must preserve the existing safety rules: no Heroku production mutation, no reuse of Heroku database or Redis, no production `.com` DNS cutover, no destructive retained S3 media bucket behavior, and no secret values in logs or reports.

</domain>

<decisions>
## Implementation Decisions

### ECS/SST Task Simplification
- **D-01:** Prefer a shared factory/helper for SST ECS task definitions covering web, worker, migration, seed/import, index refresh, cache maintenance, and scheduled report tasks.
- **D-02:** The helper should remove repeated environment, secret, image, IAM, logging, and resource defaults while keeping task-specific commands explicit and easy to audit.
- **D-03:** Do not create a full abstraction layer that hides production task behavior. Auditability beats maximal deduplication.
- **D-04:** Do not weaken the established runtime boundaries: AWS database/cache are SST-managed, Heroku database/cache are excluded, shared SES is reused only through approved credentials, and retained S3 media resources are not destructively changed.

### CI Trigger And Deploy Relationship
- **D-05:** CI must run automatically on every commit pushed to `main`.
- **D-06:** CI must run automatically on every commit pushed to a pull request branch regardless of PR state.
- **D-07:** Deploy remains `workflow_dispatch` / operator-driven. CI status is advisory only and must not automatically deploy, auto-promote, or mutate production.
- **D-08:** CI results may inform an operator's judgment, but a failed CI run does not by itself disable the deploy workflow.

### GitHub Commit Status And Report Shape
- **D-09:** Publish one advisory GitHub commit status per commit, with a `target_url` linking to the standardized validation report artifact.
- **D-10:** Use the GitHub REST API for commit status updates. The status context should be stable and recognizable, such as `gala/ci-validation`.
- **D-11:** Avoid separate statuses per suite unless a later phase proves the single advisory status is insufficient. The default should minimize noise for CODEOWNERs.
- **D-12:** Store the report as a GitHub Actions artifact, not as a committed generated file and not only as a PR comment.

### Standardized Test Categories
- **D-13:** Normalize results into fixed categories: `unit`, `integration`, and `system`.
- **D-14:** `unit` includes Jest/helper/reducer/component-unit checks and focused Ruby model/service/unit checks where applicable.
- **D-15:** `integration` includes RSpec request/controller/job/service flows that exercise Rails routing, persistence, cache behavior, or background integration boundaries.
- **D-16:** `system` includes Playwright/Capybara/browser/visual checks and any route-facing smoke that exercises the deployed or local app surface.
- **D-17:** If a suite is not run, the report must say `not run` with a reason rather than silently omitting the category.

### SST Refresh/Diff And Destructive Keyword Semantics
- **D-18:** CI should run and report `sst refresh` and `sst diff` evidence when safe credentials and stage context are available.
- **D-19:** `sst refresh` and `sst diff` must be report inputs only. They must not deploy or mutate Heroku, production DNS, or retained shared resources.
- **D-20:** Detect potentially destructive infrastructure keywords in `sst diff` output and summarize them as advisory warnings with a confidence score.
- **D-21:** Destructive keyword detection must not automatically fail deploy eligibility. It should raise operator attention inside the single status/report.
- **D-22:** The destructive keyword classifier should favor high-signal terms such as delete, destroy, replace, removal, drop, recreate, force, detach, policy removal, public access, bucket deletion, DNS alias changes, database replacement, cache replacement, secret removal, and IAM broadening.

### Report Content And Noise Budget
- **D-23:** The report should be terse and high signal. Include summarized evidence, links to detailed artifacts, and omit raw noisy logs unless they explain a failure.
- **D-24:** Include a single-line commit/change summary truncated to 80 characters.
- **D-25:** Include contributors, number of commits, changeset summary, test matrix, infra diff summary, release gates, destructive-action warnings, and confidence score.
- **D-26:** Use an ANSI/plain-text matrix format so the same report is readable in Actions logs, artifacts, and CODEOWNER handoffs.
- **D-27:** Failing tests must link to the relevant artifact, test file, or line-oriented failure excerpt where possible so CODEOWNERs can investigate without reading the full workflow log.

### the agent's Discretion
- The planner may choose exact workflow file names, script names, artifact naming, JSON schema fields, and status context naming, provided the public behavior above is preserved.
- The planner may choose whether the report generator is Ruby, JavaScript, or shell, but it should be deterministic, easy to run locally, and not require secret-bearing input.
- The planner may decide which existing test commands are practical for the first CI pass, provided the report preserves the fixed `unit`/`integration`/`system` categories and marks missing suites explicitly.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Scope and Requirements
- `.planning/ROADMAP.md` - Phase 26 goal, success criteria, and dependency on Phase 25 guardrail work.
- `.planning/REQUIREMENTS.md` - existing test, QA, AWS/SST, Cloudflare DNS, no-Heroku-mutation, and deployment safety requirements.
- `.planning/PROJECT.md` - milestone context and project-level deployment boundaries.
- `.planning/STATE.md` - current milestone state and AWS deployment safety rules.

### Prior AWS/SST Decisions
- `.planning/phases/24-cut-gala-production-docker-image-size-with-reusable-base-ima/24-CONTEXT.md` - production Docker image, reusable base image, dev-stage validation, and SST task reuse constraints.
- `.planning/phases/23-immutable-cloudflare-dns-and-preview-deployment-pipeline/23-CONTEXT.md` - Cloudflare DNS, preview subdomain, release ID, immutable asset, and `.com` out-of-scope decisions.
- `.planning/phases/22-aws-edge-cache-validation-and-catalog-load-optimization/22-CONTEXT.md` - CloudFront validation, media bucket non-mutation, and AWS validation boundaries.

### Codebase Maps
- `.planning/codebase/STACK.md` - Rails, pnpm, Jest, Playwright, SST, Docker, AWS, and workflow stack map.
- `.planning/codebase/INTEGRATIONS.md` - AWS, GitHub, Heroku, Cloudflare, S3, SES, Sentry, Mapbox, and deployment integration boundaries.
- `.planning/codebase/TESTING.md` - RSpec, Jest, Playwright, Capybara, test DB, and canonical test command map.

### Implementation Files
- `infra/sst.config.ts` - SST app, service, task, secret, CloudFront, database/cache, and scheduled task definitions to simplify.
- `.github/workflows/deploy.yml` - existing operator-driven production-capable deploy workflow; must remain manual/operator-driven.
- `.github/workflows/preview.yml` - existing preview workflow and PR preview comment integration point.
- `scripts/deploy-sst.sh` - existing guarded deploy helper and SST command wrapper behavior.
- `Dockerfile` and `Dockerfile.production` - current app image build surfaces used by CI/deploy.
- `run-rspec.sh` and `bin/run_ci_tests` - existing Ruby test runner/helper surfaces that may feed normalized CI categories.
- `package.json`, `jest.config.js`, `playwright.config.mjs`, and `tests/visual/` - frontend/unit/system test command and visual test configuration.
- `spec/`, especially `spec/requests/` and `spec/features/` - integration/system test source directories.
- `CODEOWNERS` - owner routing for failure investigation links if present.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `infra/sst.config.ts`: existing source of duplicated ECS service/task environment, secrets, image, role, command, and resource configuration.
- `.github/workflows/deploy.yml`: existing GitHub Actions workflow for operator-driven production-capable deployment and GitHub release metadata.
- `.github/workflows/preview.yml`: existing preview workflow and PR comment behavior that can inform report/link patterns.
- `scripts/deploy-sst.sh`: existing safety gates and SST command wrapper behavior for stage/profile validation, dry runs, and deployment operations.
- `run-rspec.sh` and `bin/run_ci_tests`: existing Ruby test execution surfaces and test DB conventions.
- `package.json`: pnpm-backed frontend, Jest, Playwright, and visual command source of truth.

### Established Patterns
- AWS/SST changes must use `AWS_PROFILE=gala AWS_REGION=us-west-2` and explicit `SST_STAGE` context.
- Heroku production at `https://www.learngala.com` and Heroku database/cache strings are out of bounds for mutation or AWS reuse.
- `learngala.dev` and `*.dev.learngala.dev` are the AWS/Cloudflare validation domains; `.com` cutover is deferred to a later explicit phase.
- Deploy workflows should expose minimal inputs and keep production mutation operator-controlled.
- Generated reports should avoid secret values and should prefer names, counts, URLs, hashes, and statuses over raw environment dumps.

### Integration Points
- GitHub commit statuses require REST API calls against the checked commit SHA and should link to the uploaded report artifact.
- GitHub Actions artifacts can carry the standardized report and detailed suite outputs without committing generated files.
- `sst refresh` and `sst diff` can feed the infra matrix, but must be guarded so they do not turn into deploy or destructive cloud operations.
- CODEOWNER investigation routing can use failing file paths and artifacts rather than dumping complete logs into the commit status description.

</code_context>

<specifics>
## Specific Ideas

- Keep the status surface intentionally small: one advisory commit status with a linked artifact, not many noisy status contexts.
- The report should look like an operator handoff, not a raw CI transcript.
- Use a compact ANSI/plain-text matrix with rows for test categories, infra diff, destructive warnings, release gates, contributors, commit count, and confidence.
- Report generated-file or suite omissions explicitly as `not run` or `not available`, with the reason.

</specifics>

<deferred>
## Deferred Ideas

- Making CI a hard production deploy gate is deferred. The current phase explicitly keeps CI advisory and deploy operator-driven.
- Expanding into a full release-management system is deferred. This phase standardizes validation reporting and status publication only.

</deferred>

---

*Phase: 26-simplify-ecs-task-definitions-and-add-ci-validation-status-r*
*Context gathered: 2026-06-01*
