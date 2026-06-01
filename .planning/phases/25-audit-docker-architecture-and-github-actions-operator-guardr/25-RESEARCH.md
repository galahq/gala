# Phase 25 Research: Docker Architecture and GitHub Actions Operator Guardrails

## Research Complete

Phase 25 should plan a small operator-control layer around the existing AWS/SST deploy path. The repository already has most low-level primitives: manual deploy inputs, OIDC AWS auth, immutable release metadata, SST ECS service/task outputs, Docker production image controls, user-data allowlists, and CloudFront invalidation. The gap is that several different operator intents are compressed into `deploy.yml` plus `scripts/deploy-sst.sh`, while the user wants CODEOWNER-held manual workflows with one-page manpage docs, explicit side effects, and clearer recovery paths.

## Current Repository Findings

### Existing Workflow Surface

- `.github/workflows/deploy.yml` is a manual `workflow_dispatch` workflow with inputs `branch`, `stage`, `dry_run`, `invalidate_cache`, and `user_data`.
- `.github/workflows/preview.yml` currently runs on `pull_request` events and also exposes `workflow_dispatch`; Phase 25 decisions require operator actions to be manual, so planning should explicitly decide whether to remove or narrow the automatic `pull_request` trigger.
- Both workflows authorize repository contributors with `gh api repos/$GITHUB_REPOSITORY/collaborators/$actor/permission`, then allow `admin|maintain|write`.
- Both workflows use GitHub OIDC through `aws-actions/configure-aws-credentials@v4` with `id-token: write`.
- `deploy.yml` has `contents: write`, `pull-requests: write`, and `issues: write` permissions because production releases and dev promotion comments are currently handled in the same workflow.
- `preview.yml` has `contents: read`, `pull-requests: write`, and `issues: write`.

### Existing Script Guardrails

- `scripts/deploy-sst.sh` rejects Heroku database/cache connection keys in `RETAINED_SECRET_KEYS` and refuses direct deploy environment variables such as `DATABASE_URL`, `REDIS_HOST`, `REDIS_URL`, and `CACHE_URL`.
- `USER_DATA` is already allowlisted to hard-coded hooks: `certificates`, `cloudflare_dns_cutover`, `database_migrate`, `seed_database`, `db_snapshot`, `db_backup`, `restart_ecs`, `refresh_indices`, and `rake:<task-name>`.
- `USER_DATA` rejects secret-looking values such as `DATABASE_URL`, `REDIS_URL`, `AWS_SECRET`, `SECRET_KEY`, `PASSWORD=`, `TOKEN=`, and `PRIVATE_KEY`.
- `run_ecs_task_from_outputs` runs ECS Fargate tasks using SST outputs for cluster, task definition, subnets, security groups, and assign-public-IP settings.
- `invalidate_caches` invalidates app router, app CDN, and static assets distributions when `--invalidate-cache` is set, but it is coupled to deploy completion.
- `DRY_RUN=true` runs `npx sst diff --stage "$STAGE"` and exits before Docker build, asset sync, SST deploy, cache invalidation, or user-data hooks.

### Existing SST Task Surface

- `infra/sst.config.ts` defines `GalaMigrate`, `GalaSeedDatabase`, `GalaRefreshIndices`, and `GalaWeeklyReport` as `sst.aws.Task` resources using the same `webImage`, shared environment, and shared secrets.
- SST outputs include migration and seed task cluster/task-definition/network values, but only seed outputs are currently exposed in the inspected return block alongside migration outputs. If one-off maintenance needs refresh or arbitrary allowlisted rake tasks, planning should confirm all required task outputs exist or intentionally reuse the migration task with command overrides.
- Web and worker services share the app image and export service names. This supports ECS task-definition rollback and service update workflows.

### Existing Documentation Surface

- `docs/aws-production-operator-runbook.md` is useful historical context but too long for the new operator manual constraint.
- `docs/aws-sst-secret-inventory.md` already documents secret names and boundaries and should remain the source for secret inventory rather than repeating secret values.
- `CODEOWNERS` already covers `.github/workflows/`, `infra/`, `scripts/deploy-sst.sh`, Docker, config, and `.planning/`. Phase 25 should extend it to `docs/ops/workflows/` and any new ops scripts if needed.

## Official Platform Research

- GitHub `workflow_dispatch` supports typed manual inputs and only triggers when the workflow file exists on the default branch. Inputs are available in the `inputs` context, and `boolean`, `choice`, `number`, `environment`, and `string` input types are supported. Source: GitHub workflow syntax docs, <https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions>.
- GitHub manual workflow runs can be started from the UI, CLI, or REST API, and require write access to the repository. Source: <https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow>.
- GitHub `permissions` should be scoped per workflow or per job so `GITHUB_TOKEN` only has the access required by that job. Source: GitHub workflow syntax docs.
- GitHub environments can enforce required reviewers, and environment reviewers can be used as an additional production gate. Source: <https://docs.github.com/en/actions/reference/deployments-and-environments>.
- GitHub OIDC lets workflows access AWS without long-lived AWS secrets, but trust conditions must constrain which repositories/refs/environments can receive cloud tokens. Source: <https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services>.
- `GITHUB_STEP_SUMMARY` can publish Markdown summaries to the workflow run page, which is a good place for dry-run side effects, validation outputs, and operator next steps. Source: <https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions>.
- AWS ECS `run-task` starts one-off tasks from a specified task definition and supports command overrides. Source: <https://docs.aws.amazon.com/cli/latest/reference/ecs/run-task.html>.
- AWS ECS `update-service` can update a service to a specific task definition revision, which triggers a new service deployment. This supports the immediate rollback lane. Source: <https://docs.aws.amazon.com/cli/latest/reference/ecs/update-service.html>.
- AWS CloudFront invalidation requests are explicit operations against a distribution and path set; using deterministic caller references makes repeat behavior easier to reason about. Source: <https://docs.aws.amazon.com/cli/latest/reference/cloudfront/create-invalidation.html>.

## Recommended Planning Shape

### Plan 25-01: Operator Contract and Audit

Create a concise operator contract from the current deploy/Docker/SST surface before changing workflows. The executor should audit:

- Existing deploy and preview triggers.
- OIDC and `GITHUB_TOKEN` permissions.
- CODEOWNER coverage.
- Docker image reuse across web, worker, migration, and maintenance tasks.
- ECS output availability for rollback and one-off tasks.
- Current `USER_DATA` hooks and whether any should become explicit maintenance operations.
- Existing runbook material that should be superseded by manpage docs.

The output should be a short audit/contract document, not a sprawling runbook.

### Plan 25-02: Manual Operator Workflows

Implement or adjust workflows around the locked hybrid model:

- Dev deploy from feature branch remains manual and posts a PR comment if a matching open PR exists.
- Production promotion is a separate manual workflow with CODEOWNER/typed confirmation and release metadata.
- Rollback is a separate manual workflow with ECS task-definition rollback first and release/image redeploy guidance.
- Maintenance is one manual workflow with modes `migration`, `one_off`, `rails_cache_clear`, `cloudfront_invalidate`, and `both` as appropriate. If the executor chooses more precise names, they must map to the Phase 25 context decisions.

Keep direct production Rails commands off GitHub runners. All Rails work against production DB/Redis must run through ECS tasks.

### Plan 25-03: Manpage Docs and Validation

Create `docs/ops/workflows/*.md`, one page per core workflow, using the mandatory sections from context:

`NAME`, `SYNOPSIS`, `INPUTS`, `DRY RUN`, `SIDE EFFECTS`, `VERIFY`, `ROLLBACK`, `EXAMPLES`.

Docs should be terse and operational. Each page must name the workflow, inputs, side effects, validation commands/links, rollback route, and examples. Avoid tutorial prose.

## Security Threat Model

- **Unauthorized production mutation:** A write-permission contributor may currently trigger workflows. Production paths need CODEOWNER or environment approval plus exact typed confirmation.
- **Confused side effects:** A single deploy workflow with `user_data` can hide migrations, cache invalidations, snapshots, or restarts behind comma-separated hooks. Maintenance modes should make side effects explicit in inputs and summaries.
- **Secret leakage:** Workflow summaries and logs must not echo secrets, user-data must remain allowlisted, and docs must reference secret names only.
- **Runner-to-production direct access:** GitHub-hosted runners must not run Rails commands directly against production DB/Redis. ECS one-off tasks keep network, image, and secret context aligned with production.
- **Rollback ambiguity:** Operators need to know whether they are rolling back ECS task definitions, release assets, images, environment variables, database state, Rails cache, or CloudFront cache. These are separate state surfaces.
- **Preview automation drift:** Existing automatic PR preview deploys may conflict with the locked manual-operator model. The plan must make the trigger decision explicit.

## Validation Architecture

Phase 25 validation should be mostly static and dry-run oriented. No live AWS mutation is required to plan or implement the phase.

Recommended gates:

- Parse workflow YAML with Ruby's YAML parser or an equivalent local check.
- Run `bash -n scripts/deploy-sst.sh` and any new shell helper scripts.
- Grep workflow files to prove operator workflows use `workflow_dispatch` and do not introduce production mutation on `push`.
- Grep workflows/scripts to prove production Rails commands are not executed directly from the GitHub runner against DB/Redis.
- Grep workflows/docs for `dry_run`, typed confirmation, CODEOWNER/environment gate references, `GITHUB_STEP_SUMMARY`, and explicit side-effect summaries.
- Check docs contain the mandatory manpage sections and stay concise. A lightweight word/line limit is acceptable if exact print pagination is not practical.
- Run targeted docs/workflow tests if the repository has or gains a small validation script.

## Open Planning Questions

- Whether to remove the `pull_request` trigger from `.github/workflows/preview.yml` or leave it as a non-operator preview automation while adding a separate manual dev deploy workflow. The user's Phase 25 decision says all operator actions must be manual, so the safer plan is to make preview deployment manual unless a previous requirement forces otherwise.
- Whether Rails cache clearing should use an existing rake task, a new allowlisted Rails runner command, or a small application service. Whatever mechanism is chosen must execute inside ECS.
- Whether rollback should be implemented entirely in GitHub Actions/AWS CLI or reuse a shared shell helper. A helper is likely cleaner if both dry-run summaries and mutation paths need the same resolution logic.

