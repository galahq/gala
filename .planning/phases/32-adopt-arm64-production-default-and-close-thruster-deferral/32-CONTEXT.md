---
phase: 32
title: Adopt ARM64 production default and close Thruster deferral
status: complete
created: 2026-06-02
completed: 2026-06-02
---

# Phase 32 Context

## Trigger

The operator changed the Phase 28 decision: Thruster should be dropped, and ARM64
should proceed for the SST-managed AWS production candidate because the AWS
environment is greenfield with no users and rollback to x86_64 is not required.

## Scope

- Make ARM64 the default for SST task definitions and deploy tooling.
- Keep `x86_64` only as an explicit manual override.
- Ensure GitHub workflows select a base image that matches the requested
  architecture.
- Keep the ECS-only architecture guard intact because ECS-only rollout cannot
  perform the first architecture transition.
- Update active planning and operator docs so the old deferral is closed.

## Explicit Non-Scope

- Do not add Thruster.
- Do not mutate Heroku production or `.com` DNS.
- Do not remove the existing ECS-only mismatch guard.
- Do not require rollback proof to x86_64 as an ARM64 adoption gate.
