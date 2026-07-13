# UAT Audit Fix - 2026-06-01

Scope: follow-up on the extended UAT audit gaps after the canonical `gsd-sdk query audit-uat --raw` returned zero indexed UAT items.

## Fixed / Verified

| Area | Result | Evidence |
| --- | --- | --- |
| Phase 10 dependency baseline stale rows | Verified stale, no code fix required | Matrix has latest-checked/source/recheck fields, React 16/BlueprintJS 4 compatibility holdbacks, and later owner phases for React 18/19 + BlueprintJS 6. |
| Phase 11 pnpm migration stale rows | Verified stale, no code fix required | `packageManager` is `pnpm@11.1.0`, Node engine is `>=24 <25`, pnpm engine matches, `pnpm-lock.yaml` exists, Dockerfile/Semaphore use pnpm, scoped docs/bin/assets config do not reference Yarn. |
| Phase 16 frontend test runner | Passed | `pnpm test -- --runInBand app/javascript/shared/__tests__/functions.test.js app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js` completed with 20 passed suites, 103 passed tests, 3 skipped tests. |
| Phase 24 case route cache validation | Passed after local runner fix | `./run-rspec.sh spec/requests/case_routes_spec.rb` completed with 13 examples, 0 failures. |

## Local Fix Applied

`run-rspec.sh` changed `ROOT_DIR` from the parent directory to the repository directory so Docker Compose can find `docker-compose.yml` when invoked from the repo root.

## Not Auto-Closed

| Area | Reason |
| --- | --- |
| Phase 23 stale dev-unhealthy summary row | Existing phase 23 planning files already have unrelated local modifications; avoid overwriting or committing mixed changes. |
| Phase 17 visual regression baseline | Still requires a Rails/browser visual baseline run against the selected target. |
| Phase 18 final route smoke | Still requires explicit target selection or approval for the final route-smoke pass. |
| Production dry-run / cutover candidate | Remains an explicit separate gate; no `.com` or Heroku mutation is permitted. |

## Known Non-Blocking Noise

- Jest emitted the existing React list-key warning from `FormattedList`.
- RSpec emitted Rails/Ruby deprecation warnings during boot.
