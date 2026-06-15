# AWS Deploy Notes

This public note intentionally omits private topology, account, credential, and
recovery details. Use `docs/ops/workflows/deploy.md` as the contributor-facing
workflow contract.

## Public Contract

- Deploys run through `.github/workflows/deploy.yml`.
- Supported stages are `dev` and `production`.
- The deploy wrapper is `scripts/deploy-sst.sh`.
- The production image path is `Dockerfile.production`.
- ActiveStorage uses the Rails `amazon` storage service and AWS task-role
  credentials in hosted stages.

## Verify

After a deploy, check:

- workflow summary and release metadata
- `/up`
- web and worker health
- static asset loading
- a route with existing ActiveStorage media

Keep private credentials, recovery commands, account identifiers, and secret
inventories out of public docs, issues, PRs, and workflow summaries.
