# Phase 20: AWS Production Deployment Execution - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-22
**Phase:** 20-aws-production-deployment-execution
**Areas discussed:** Existing plan handling, isolated AWS environment intent, database dump source, Heroku production safety, command discipline

---

## Existing Plan Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Continue and replan after context is captured | Capture new context even though `20-01-PLAN.md` already exists, then update the plan afterward. | ✓ |
| View existing plan first | Inspect the existing plan before deciding how to capture context. | |
| Cancel | Stop without writing Phase 20 context. | |

**User's choice:** Continue and replan after context is captured.
**Notes:** Phase 20 already had a plan, but the user added new deployment context that should guide replanning.

---

## Isolated AWS Environment Intent

| Option | Description | Selected |
|--------|-------------|----------|
| Isolated cutover-prep environment | Bring the app up in AWS for validation after security/library maintenance, without replacing Heroku production. | ✓ |
| Immediate production cutover | Move `https://www.learngala.com` to AWS in this phase. | |
| Local-only deployment rehearsal | Avoid AWS runtime deployment and only validate locally. | |

**User's choice:** Isolated cutover-prep environment.
**Notes:** The user emphasized this is prep work for a later cutover test and the current Heroku-hosted app must not be altered.

---

## Database Dump Source

| Option | Description | Selected |
|--------|-------------|----------|
| Use `db/sqldump/seed.dump` | Treat `db/sqldump/seed.dump` as the corrected pg dump path for the AWS environment. | ✓ |
| Use Heroku database directly | Point AWS at Heroku production database for convenience. | |

**User's choice:** Use `db/sqldump/seed.dump`.
**Notes:** The user corrected the earlier path. `db/sqldump/seed.dump` is authoritative for this phase.

---

## Heroku Production Safety

| Option | Description | Selected |
|--------|-------------|----------|
| Read-only Heroku secret source | Use `heroku --app msc-gala` only for retained non-database/non-cache secrets. | ✓ |
| Mutate Heroku production config | Change Heroku config/releases/routing as part of AWS prep. | |
| Share Heroku database/cache URLs | Reuse Heroku `DATABASE_URL` or Redis/cache values in AWS. | |

**User's choice:** Read-only Heroku secret source.
**Notes:** Heroku production at `https://www.learngala.com` must remain untouched. AWS database and cache values must be freshly provisioned by SST.

---

## Command Discipline

| Option | Description | Selected |
|--------|-------------|----------|
| Locked prefixes | Prefix AWS/SST execution commands with `AWS_PROFILE=gala AWS_REGION=us-west-2 SST_STAGE=production` and Heroku reads with `heroku --app msc-gala`. | ✓ |
| Use ambient shell config | Rely on the operator shell or GitHub environment to supply profile, region, and stage implicitly. | |

**User's choice:** Locked prefixes.
**Notes:** This is final alignment before execution. The user corrected the stage and wants `SST_STAGE=production`.

## the agent's Discretion

- The planner can choose the exact implementation detail for restoring `db/sqldump/seed.dump` into the fresh AWS database.
- The planner can choose the SST stage naming as long as the environment remains isolated and ALB-tested.

## Deferred Ideas

- DNS cutover from Heroku production to AWS.
- Any destructive S3 migration or Heroku production mutation.
