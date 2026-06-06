---
name: do2-9er
description: "Use for Gala `infra/rc_2-9-9` nightly SST iteration work: researching, planning, fixing, validating, or deploying the `nightly` stage through local SST CLI evidence, with shared dev DB/cache, Fargate Spot web/worker services only, Cloudflare `.dev` routing, Docker image tag `nightly`, no branch push/tag move until infra is confirmed working, and no Heroku mutation."
---

# DO2-9er

## Overview

Use this skill when the task is about the Gala v2.9.9 nightly SST experiment.
It keeps the work narrow: local research first, local build/test trust gate,
then local SST CLI evidence. Do not push the branch or move the `nightly` Git tag
until the SST infra is confirmed working.

## Context To Load

- Read `SPEC_2-9-9.md` first.
- Read `references/DO2-9er.md` for the current live IDs and stop conditions.
- Read `scratch.md`, `scripts/deploy-sst.sh`, `infra/sst.config.ts`,
  `docs/ops/workflows/deploy.md`, and `docs/ops/workflows/infra.md`.
- If tests or workflows are touched, read
  `scripts/ops/test-workflow-architecture-defaults.rb`.

## Hard Rules

- Use `AWS_PROFILE=gala`.
- Treat `AWS_REGION=us-west-2` as the current correct region unless the user
  explicitly approves a region migration.
- Use exact `SST_STAGE=nightly`; do not normalize `nighly`.
- Do not mutate Heroku.
- Do not print or commit secret values.
- Clear `DATABASE_URL`, `REDIS_URL`, `REDIS_HOST`, and `CACHE_URL` before SST
  CLI dry-runs or deploys.
- Keep nightly web/worker-only. Stop if a diff creates separate nightly
  migration, seed, refresh, weekly, or scheduler task definitions.
- Use direct SST CLI evidence for this iteration: `npx sst state list` first,
  then `npx sst diff --stage nightly` only if the stage already exists.
- For first `nightly` creation, `npx sst diff --stage nightly` currently returns
  `Stage not found`; deploy only after the shape, image, and test gates pass.
- Do not push `infra/rc_2-9-9` or move Git tag `nightly` until nightly SST infra
  is working.

## Workflow

1. Inspect current repo state with `git status --short --branch`; preserve
   unrelated dirty files.
2. Do read-only AWS and Cloudflare checks before planning mutations.
3. Resolve the hostname gate:
   - Preferred `nightly.learngala.dev` requires cert/router alias work.
   - Fallback `nightly.dev.learngala.dev` is already covered by the wildcard
     cert/routing shape.
4. Run SST state evidence through `npx sst state list` from `infra/`.
5. If `nightly` already exists, run `npx sst diff --stage nightly`; if it does
   not, record the `Stage not found` stop and continue without pushing.
6. Patch only narrow files needed to satisfy the spec.
7. Build `Dockerfile.production` locally as `gala:nightly` and run Docker
   Compose local QA.
8. Run targeted tests for touched files.
9. Commit locally only if requested or after the QA gate passes; do not push yet.
10. Deploy locally through `npx sst deploy --stage nightly` only after the gates
    show shared dev runtime intent and web/worker-only task definitions.
11. Verify ECR tags, ECS services, task definitions, `/up`, browser console,
    network errors, CloudWatch logs, Cloudflare DNS, and CI smoke.

## Native Codex Subagent Behavior

Use Codex native subagents only when the user explicitly asks for subagents,
parallel agents, or delegated parallel work. Do not spawn subagents implicitly.
Do not use workmux or coordinator-style worktree orchestration for this skill.

Keep the parent thread focused on requirements, lane assignment, fan-in
decisions, and final verification. Subagents should do the noisy exploration,
implementation, test, or log-analysis work and return summaries instead of raw
intermediate output. Prefer subagents for read-heavy or clearly bounded lanes;
be conservative with parallel write-heavy work because it can create conflicts.

Before spawning subagents:

- Re-read `SPEC_2-9-9.md`, `references/DO2-9er.md`, `scratch.md`, and the
  current `git status --short --branch`.
- Include the hard rules, current dirty/untracked-file caveats, and lane
  ownership in every subagent prompt. Assume repo-local `.agents` or spec files
  may be untracked, so prompts must be self-contained when needed.
- Use relative repo paths in subagent prompts.
- Assign only one subagent as owner for any file likely to be edited. If two
  lanes need the same file, serialize that work in the parent thread.

Default `SPEC_2-9-9.md` fan-out lanes:

1. `nightly-infra-shape`: `infra/sst.config.ts` and directly related
   infra/type/test coverage. Ensure nightly is web/worker-only, stage-specific,
   shared-dev-backed, and Fargate Spot.
2. `nightly-deploy-guards`: `scripts/deploy-sst.sh`,
   `scripts/ops/test-workflow-architecture-defaults.rb`, and terse operator
   docs. Ensure exact `nightly` stage handling, typo rejection, DB/cache env
   guards, Cloudflare env mapping, and first-stage SST evidence flow.
3. `nightly-image-qa`: `Dockerfile.production`, image payload checks, image size
   evidence, and narrow local runtime QA helpers. Avoid broad dependency or
   frontend-toolchain experiments unless the user explicitly expands scope.

Every subagent must inherit the hard rules above: no Heroku mutation, no secret
printing, no branch push, no `nightly` tag move, no SST deploy without explicit
approval, and clear `DATABASE_URL`, `REDIS_URL`, `REDIS_HOST`, and `CACHE_URL`
before SST CLI commands.

Wait for all requested subagents unless the user explicitly asks for a
fire-and-forget spawn. Fan in by reviewing each subagent's diff and summary,
then adopt or merge one lane at a time. Each subagent summary must include files
changed, validation commands and outcomes, commit SHA if committed, baseline
failures versus regressions, and any stop condition.

## Validation Commands

Prefer the smallest command set that matches touched files:

```sh
bash -n scripts/deploy-sst.sh
ruby scripts/ops/test-workflow-architecture-defaults.rb
pnpm test
./run-rspec.sh
bundle exec rake test:unit
npm exec --prefix infra tsc -- --noEmit
```

If `npm exec --prefix infra tsc -- --noEmit` fails in generated SST/Bun/Node
types, separate that known baseline from regressions in touched files.
