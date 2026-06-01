# Phase 26 Research: ECS Task Simplification and CI Validation Status Reporting

## RESEARCH COMPLETE

## Scope

Phase 26 needs an implementation plan for two connected changes:

- simplify duplicated SST/ECS task definitions while preserving production safety boundaries;
- add an advisory GitHub Actions CI workflow that publishes a terse validation report and updates one GitHub commit status through the REST API.

This research was run inline because the current Codex runtime does not allow automatic subagent spawning unless the user explicitly asks for delegated agents.

## Current Project Signals

- Existing AWS/SST deployment is centered on `infra/sst.config.ts`, `.github/workflows/deploy.yml`, `.github/workflows/preview.yml`, and `scripts/deploy-sst.sh`.
- Existing tests are split across RSpec, Jest, Capybara/Selenium, and Playwright visual checks.
- Phase 26 context locks one shared advisory status, report artifact link, fixed `unit` / `integration` / `system` categories, and advisory destructive-keyword warnings.
- Deploys remain operator driven; CI should inform, not deploy.

## Primary Source Findings

### GitHub commit status REST API

Source: https://docs.github.com/en/rest/commits/statuses

- Commit statuses are created with `POST /repos/{owner}/{repo}/statuses/{sha}`.
- The body supports `state`, `target_url`, `description`, and `context`.
- Allowed states are `error`, `failure`, `pending`, and `success`.
- `target_url` is intended to deep-link from the GitHub UI to the status output.
- The workflow needs `statuses: write` permission when using `GITHUB_TOKEN`.

Implication for this phase:

- Use one stable context, for example `gala/ci-validation`.
- Set `pending` early, then set a final status after the report artifact URL is known.
- Set `target_url` to the uploaded report artifact URL.
- Keep `description` short because GitHub UI truncates long text.

### GitHub Actions artifacts

Sources:

- https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts
- https://github.com/actions/upload-artifact

- Workflow artifacts persist files after a job completes and are suitable for logs, test results, failures, screenshots, and reports.
- `actions/upload-artifact` exposes `artifact-id`, `artifact-url`, and `artifact-digest` outputs.
- The artifact URL remains valid while the artifact/run/repository exist and requires GitHub login.
- Hidden files are excluded by default to reduce accidental sensitive uploads.
- Artifact names should be unique per job/run.

Implication for this phase:

- Generate a single report directory under `tmp/ci-validation/`.
- Upload `validation-report.txt`, `validation-report.json`, and selected suite artifacts.
- Use the `artifact-url` output as the commit status `target_url`.
- Avoid uploading `.env`, hidden files, or raw secret-bearing logs.

### GitHub workflow triggers

Source: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows

- `push` can trigger workflow runs on branch pushes.
- `pull_request` defaults include `opened`, `synchronize`, and `reopened` activity types.
- `synchronize` covers new commits pushed to a PR branch.
- Avoid `pull_request_target` for untrusted code execution unless the workflow is carefully designed, because it runs with base-repo context.

Implication for this phase:

- Use `on.push.branches: [main]`.
- Use `on.pull_request.types: [opened, synchronize, reopened, ready_for_review, converted_to_draft]` and avoid any `if: !github.event.pull_request.draft` condition.
- Keep status posting in the same normal `pull_request` workflow. Fork PRs may have restricted token behavior; the report should degrade clearly if status write is unavailable.

### SST CLI diff and refresh

Source: https://sst.dev/docs/reference/cli/

- `sst diff` compares local config to what would be deployed for a stage and reports resources that would be created, updated, or deleted.
- `sst diff --json` outputs machine-readable diff output suitable for CI scripts.
- SST CLI reads environment variables and passes them into `sst.config.ts` through `process.env`.
- `sst refresh` is available as a CLI command and should be treated as cloud-state evidence gathering, not deployment.

Implication for this phase:

- Prefer `SST_STAGE=dev` with `AWS_PROFILE=gala AWS_REGION=us-west-2` for advisory CI infra evidence unless production credentials are explicitly approved elsewhere.
- Use `sst diff --json` when available and retain raw output as an artifact.
- Summarize `sst refresh` / `sst diff` result as report evidence, not as a deploy gate.
- If AWS credentials or SST prereqs are unavailable, record `not run` with reason.

## Recommended Architecture

### Task definition simplification

Use one or more local helper functions in `infra/sst.config.ts` to centralize:

- shared Rails environment variables;
- ECS secret bindings;
- shared image URI selection;
- shared task role/IAM/log defaults;
- common CPU/memory defaults where they are currently repeated.

Keep explicit per-task differences visible:

- task name/resource name;
- command array;
- service vs one-off task vs scheduled task;
- web load balancer/domain wiring;
- worker-only concurrency or queue settings;
- migration/seed/index/report command semantics.

Avoid a deep abstraction that hides production behavior. The target is deduplication plus auditability.

### CI workflow structure

Add a new workflow such as `.github/workflows/ci-validation.yml`:

- triggers: `push` to `main`, `pull_request` for commit-bearing PR activity;
- permissions: `contents: read`, `statuses: write`, `actions: read`; `id-token: write` only if AWS OIDC is required for SST evidence;
- concurrency: cancel superseded runs per ref/PR to reduce noise;
- steps:
  - checkout;
  - post `pending` commit status;
  - install Ruby/Node/infra dependencies;
  - run unit/integration/system commands, collecting structured result JSON;
  - run `sst refresh` and `sst diff --json` when credentials/prereqs are present;
  - render `validation-report.txt` and `validation-report.json`;
  - upload report artifacts;
  - post final commit status with `target_url`.

### Report generator

A deterministic Node script is a good fit because CI already uses Node 24 and GitHub Actions can run it without booting Rails. Suggested files:

- `scripts/ci/validation-report.mjs` - render/merge test and infra result inputs.
- `scripts/ci/post-commit-status.mjs` - call GitHub REST status API.
- `scripts/ci/validation-report.test.mjs` - Node built-in test coverage for parsing, truncation, destructive keyword detection, and final status state mapping.

Avoid embedding secrets in JSON or text output. Redact common secret key patterns defensively.

## Suggested Status Semantics

- `pending`: posted at workflow start.
- `success`: all executed suites pass; missing suites are explicitly justified; destructive keywords are warnings only.
- `failure`: one or more executed unit/integration/system suites fail.
- `error`: report generation, artifact upload, or commit status posting infrastructure fails.

Destructive keyword findings should affect warning count and confidence, not status state by themselves.

## Destructive Keyword Classifier

Recommended warning terms and concepts:

- delete, deleted, deleting;
- destroy, destroyed, destroying;
- replace, replacement, recreate;
- remove, removal, detach;
- drop, truncate;
- public access, bucket policy, lifecycle;
- database replacement, cache replacement;
- DNS alias, alternate domain, certificate detach;
- secret removal, environment removal;
- IAM wildcard, administrator access, broad policy.

Confidence scoring can start simple:

- high: destructive term appears near a critical resource kind such as database, cache, bucket, DNS, IAM, secret, certificate, CloudFront alias;
- medium: destructive term appears near any SST/AWS resource name;
- low: destructive term appears only in unrelated text or comments.

## Validation Architecture

Automated gates for Phase 26 should cover:

- TypeScript/source validation for `infra/sst.config.ts` after helper extraction.
- Script unit tests for report rendering, 80-character commit summary truncation, status mapping, artifact URL handling, and destructive keyword scoring.
- Workflow syntax/static checks for `.github/workflows/ci-validation.yml`.
- A dry-run local report fixture command that proves `unit`, `integration`, `system`, `sst_refresh`, `sst_diff`, warnings, contributors, commit count, and confidence render into the ANSI matrix.
- Optional AWS-backed `sst refresh` / `sst diff --json` evidence when credentials are present; otherwise `not run` with reason is acceptable in CI but must be visible.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| CI accidentally becomes a deployment path | Keep deploy commands out of the CI workflow; only run `sst refresh` and `sst diff`, never `sst deploy`. |
| PR workflow token cannot write commit status for forks | Script should detect 403/permission failure and leave a clear job summary/artifact note. |
| Report artifact URL is unavailable if upload fails | Final status should become `error` with the workflow run URL as fallback `target_url`. |
| `sst refresh` has side effects beyond expected state refresh | Keep stage to `dev`, document command as advisory evidence, and skip if credentials/stage guard is absent. |
| Task helper hides important production differences | Preserve explicit command arrays and resource names in each task/service declaration. |

## Planning Recommendation

Use two plans:

1. Refactor SST/ECS task-definition duplication behind auditable helpers.
2. Add advisory CI validation workflow, report generator, artifact upload, and GitHub commit status publishing.

The second plan depends on the first because `sst diff` evidence should reflect the simplified infra shape.
