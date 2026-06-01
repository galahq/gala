# Phase 25-02 Summary: Manual Operator Workflows and Guarded Maintenance

## Objective

Implement manual GitHub Actions workflows for dev deploy, production promotion,
rollback, and maintenance, with dry-run summaries and guarded production mutation.

## Changes

- Made `.github/workflows/deploy.yml` a dev-only manual `workflow_dispatch` deploy.
- Kept `.github/workflows/preview.yml` manual only and preserved PR comments for open PRs on the deployed branch.
- Added `.github/workflows/promote-production.yml` with production environment, OIDC, dry-run, CODEOWNER actor check, and typed confirmation.
- Added `.github/workflows/rollback.yml` with ECS task-definition rollback and release redeploy lanes.
- Added `.github/workflows/maintenance.yml` for migrations, allowlisted one-offs, Rails cache clear, CloudFront invalidation, and `both`.
- Added `scripts/ops/operator-common.sh` for shared confirmation, CODEOWNER, SST output, ECS task, rollback, and CloudFront helper logic.

## Validation

Commands run locally:

```bash
ruby -e 'require "yaml"; Dir[".github/workflows/*.yml"].sort.each { |f| YAML.load_file(f); puts "#{f}: ok" }'
bash -n scripts/deploy-sst.sh && bash -n scripts/ops/operator-common.sh
rg -n "workflow_dispatch|dry_run|GITHUB_STEP_SUMMARY|confirmation|CODEOWNER|environment:" .github/workflows
rg -n "ecs run-task|run-task|update-service|task-definition" .github/workflows scripts
rg -n "bundle exec rails|rails runner|bundle exec rake" .github/workflows scripts
```

Results:

- All workflow YAML files parse.
- `scripts/deploy-sst.sh` and `scripts/ops/operator-common.sh` pass shell syntax checks.
- Workflow scans show manual dispatch, dry-run, summary, confirmation, environment, ECS task, and ECS update-service evidence.
- The direct Rails command scan only finds existing legacy `scripts/deploy-gala-aws-production.sh` asset precompile; new workflows and ops helpers do not run production Rails commands directly on the GitHub runner.

## Notes

- No AWS, GitHub, Cloudflare, or Heroku mutation was performed.
- `infra/sst.config.ts` was not changed because existing migration and distribution outputs are enough for the guarded workflows.
