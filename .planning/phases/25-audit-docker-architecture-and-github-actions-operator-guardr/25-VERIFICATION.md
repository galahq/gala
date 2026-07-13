---
phase: 25-audit-docker-architecture-and-github-actions-operator-guardr
status: passed
verified: 2026-06-01
plans: 3
---

# Phase 25 Verification

## Goal

Audit Docker/ECS operator guardrails, implement manual GitHub Actions operator
workflows, and add concise CODEOWNER-held manpage documentation.

## Result

Passed. Phase 25 produced:

- Operator guardrails audit at `docs/ops/workflows/operator-guardrails.md`.
- Manual dev deploy, preview, production promotion, rollback, and maintenance workflows.
- Shared ops helper for typed confirmation, CODEOWNER actor checks, ECS task execution,
  ECS task-definition rollback, AWS discovery fallback, and CloudFront invalidation.
- One-page manpage-style docs for dev deploy, production promotion, rollback,
  maintenance, and PR merge-to-base.
- Static docs validator and CODEOWNERS coverage for ops docs/helpers.

## Automated Checks

```bash
ruby -e 'require "yaml"; Dir[".github/workflows/*.yml"].sort.each { |f| YAML.load_file(f); puts "#{f}: ok" }'
bash -n scripts/deploy-sst.sh && bash -n scripts/ops/operator-common.sh && bash -n scripts/ops/validate-operator-docs.sh
bash scripts/ops/validate-operator-docs.sh
rg -n "workflow_dispatch|dry_run|GITHUB_STEP_SUMMARY|confirmation|CODEOWNER|environment:" .github/workflows
rg -n "ecs run-task|run-task|update-service|task-definition" .github/workflows scripts
rg -n "bundle exec rails|rails runner|bundle exec rake" .github/workflows scripts
```

## Evidence

- Workflow YAML parse passed for all current workflows.
- Shell syntax passed for `scripts/deploy-sst.sh`, `scripts/ops/operator-common.sh`,
  and `scripts/ops/validate-operator-docs.sh`.
- Operator docs validator passed.
- Workflow scans show manual dispatch, dry-run, summaries, confirmation, environment,
  ECS `run-task`, and ECS `update-service` coverage.
- Direct Rails runner/rake scan has no new workflow/helper violations. It reports only
  existing legacy `scripts/deploy-gala-aws-production.sh` asset precompile.

## Non-Mutation

No AWS, GitHub release/comment, Cloudflare, CloudFront, RDS, Redis, Rails cache, or
Heroku mutation was performed during verification.

## Review

`25-REVIEW.md` status is `clean`. One reliability issue found during review was fixed
in commit `5398b30f`: maintenance and rollback no longer depend on `.sst/outputs.json`
being present on a fresh GitHub runner.
