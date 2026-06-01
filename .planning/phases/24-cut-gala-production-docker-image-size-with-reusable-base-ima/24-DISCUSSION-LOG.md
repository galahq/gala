# Phase 24: Cut Gala Production Docker Image Size With Reusable Base Ima - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-01
**Phase:** 24-cut-gala-production-docker-image-size-with-reusable-base-ima
**Areas discussed:** Size target and proof, Dockerfile split strategy, Base image cache strategy, Runtime pruning line

---

## Size Target and Proof

| Option | Description | Selected |
|--------|-------------|----------|
| Compressed ECR image `<=1.5GB` | Matches deploy push/pull impact; current evidence is about `1.67GB`. | yes |
| Local uncompressed image `<=1.5GB` | Stricter, likely requires aggressive removals and more regression risk. | |
| Gate on compressed, report local size | Practical gate plus full visibility. | |

**User's choice:** Compressed ECR image `<=1.5GB`.
**Notes:** Proof must come from dev ECR image-size evidence. Near misses are not accepted; keep trimming until the gate passes. Record before/after ECR sizes and commands in the phase summary only.

---

## Dockerfile Split Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Separate production Dockerfiles | Keep current `Dockerfile` for development/local compatibility; add `Dockerfile.production` and `Dockerfile.production-base`. | yes |
| Refactor current Dockerfile into targets | One file with development, base, build, and production targets. | |
| Only `Dockerfile.production` first | Defer a separate base Dockerfile until image reuse is proven. | |

**User's choice:** Add separate production Dockerfiles.
**Notes:** Dev deploy validation should use `Dockerfile.production` in this phase. Preserve runtime behavior exactly and keep production Dockerfiles production-only.

---

## Base Image Cache Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Explicit version tag | Tag by Ruby/Node/Debian/system-dependency version. | yes |
| Rolling `latest` | Simplest, but weak rollback/cache clarity. | |
| Date/commit tag only | Reproducible per build, less stable as shared cache base. | |

**User's choice:** Explicit version tags.
**Notes:** Rebuild the base image manually/infrequently when runtime dependencies change. Store it in the same AWS ECR account/repository family. Require `GALA_PRODUCTION_BASE_IMAGE`; fail clearly if it is missing.

---

## Runtime Pruning Line

| Option | Description | Selected |
|--------|-------------|----------|
| Remove Node/pnpm from final runtime | Keep JS tooling only in build stages; final image runs precompiled Rails assets. | yes |
| Keep Node only | Safer if runtime invokes JS unexpectedly, but larger. | |
| Keep Node and pnpm | Maximum compatibility, least slimming. | |

**User's choice:** Remove Node.js and pnpm from final runtime.
**Notes:** Keep proven runtime packages first, including PDF/image/font dependencies. Use conservative cleanup for caches, `.git`, `node_modules`, temporary build dirs, test dirs, and dev-only caches. Evaluate Thruster but do not require it.

## the agent's Discretion

- Choose exact ECR base-image repository naming inside the Gala AWS account/repository family.
- Choose exact build-arg/env wiring for `GALA_PRODUCTION_BASE_IMAGE`, provided missing configuration fails clearly.
- Identify additional safe cleanup targets during image inspection without changing runtime behavior.

---

## Request-Cache/Runtime Test Harness Follow-up

| Option | Description | Selected |
|--------|-------------|----------|
| Keep current test runner behavior | Require developers to pass test DB URL manually in each command and rely on environment defaults in `.env.dev`. | |
| Enforce canonical test DB targeting in project helpers | Add explicit `gala_test` URL and helper scripts for `RAILS_ENV=test` runs, and document host/container conventions in README/codebase testing guidance. | yes |

**User's choice:** Enforce canonical DB targeting in helpers.

**Notes:**  
Added:
- `./run-rspec.sh` defaults to `postgres://gala:alpine@db:5432/gala_test`, prepares schema, and supports additional rspec args.
- `bin/run_ci_tests` now enforces `DATABASE_URL` to a `gala_test` DB.
- planning documentation (`README.md`, `.planning/codebase/TESTING.md`, `.planning/STATE.md`) now captures deterministic test commands and the non-negotiable `gala_test` target.

## Deferred Ideas

None.
