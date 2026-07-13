# Phase 24 Follow-up Summary: Test Harness and Request-Cache Continuation

**Date:** 2026-06-01
**Phase:** 24-cut-gala-production-docker-image-size-with-reusable-base-ima
**Wave:** Follow-up
**Status:** Incomplete / handoff

## Carryover Context

Phase 24 has delivered the image-size execution work (24-01 + 24-02). The project now needs a continuity pass to prevent DB-related test breaks and to carry the request-cache hardening pattern from catalog routes into case detail routes.

## Completed in this workstream

- Added deterministic test command defaults for a non-production test database:
  - `run-rspec.sh` now defaults to `postgres://gala:alpine@db:5432/gala_test`, supports additional rspec args, and runs DB prepare unless `SKIP_DB_PREPARE=1`.
  - `bin/run_ci_tests` now enforces `RAILS_ENV=test` targeting `gala_test` by default and normalizes any non-`gala_test` URL away.
- Removed a global test bootstrap skip that masked DB-connection failures in shared spec helper setup (`spec/spec_helper.rb`).
- Documented canonical testing conventions in
  - `.planning/codebase/TESTING.md`
  - `.planning/STATE.md`
  - `README.md` (host/container command conventions)
- Maintained the `/cases.json` and `/cases` cache work in Rails and infra (ETag/Last-Modified, TTL segmentation by reader role, and shared cache policy wiring) and added request spec updates to validate anonymous and signed-in cache semantics.

## Why this follow-up exists

The next validation step (`spec/requests/case_routes_spec.rb`) and cache-hardening work should not be repeatedly blocked by environment mismatch. The next agent should run request specs through `./run-rspec.sh` so they always target `gala_test` and can validate:

- role-aware response variance for `/cases/:slug` routes,
- anonymous/private cache compatibility,
- and CloudFront-level allowlist behavior for non-cacheable endpoints.

## Immediate next actions

1. Continue the case-detail cache hardening pass:
   - apply reader/locale-aware cache keying and etag/last-modified logic on `/cases/:slug` where safe,
   - keep sensitive/private variants uncached,
   - keep anonymous cache headers aligned with existing catalog policy, including short TTL for signed-in readers.
2. Keep CloudFront routing conservative:
   - allowlist cacheable `/cases` JSON endpoints,
   - leave community/comment/deployments/quizzes and similarly personalized endpoints uncacheable.
3. Verify by rerunning the focused request specs with canonical test DB targeting:
   - `./run-rspec.sh spec/requests/case_routes_spec.rb`
   - targeted catalog/request specs as needed for regression coverage.

## Notes

This file is the handoff anchor so `$gsd-progress` has an explicit Phase 24 Wave 2 continuation point without ambiguity.
