# Phase 31 Validation

## Local Gates

| Gate | Status | Evidence |
| --- | --- | --- |
| Previous commit and planning audit | Passed | `git show HEAD~1..HEAD`, `.planning/STATE.md`, `.planning/ROADMAP.md`, and Phase 30 artifacts reviewed. |
| AWS CloudWatch diagnosis | Passed | Dev sign-in 422 showed HTTPS origin versus HTTP `request.base_url`; production had generic CSRF evidence without that mismatch. |
| AWS ECS runtime env inspection | Passed | Dev `GalaWeb:14` had HTTPS `BASE_URL` with `FORCE_SSL=false`; production `GalaWeb:17` had HTTPS `BASE_URL` with `FORCE_SSL=true`. |
| Targeted Devise request spec | Passed | `./run-rspec.sh spec/requests/devise_reader_routes_spec.rb` - 11 examples, 0 failures; sign-in origin is derived from `GALA_TEST_SIGN_IN_BASE_URL` or `BASE_URL`. |
| Deploy guard regression | Passed | `GALA_TEST_DEV_HTTPS_BASE_URL=<dev-https-base-url> bash scripts/ops/test-deploy-sst-architecture-guard.sh` - all architecture and payload guard cases passed, including dev HTTPS/HTTP `FORCE_SSL` cases. |
| Infra TypeScript | Passed | `npm exec --prefix infra tsc -- --noEmit` |
| Diff hygiene | Passed | `git diff --check` |
| Planning consistency | Blocked | `node gsd-tools validate consistency` is not available in this repo (`MODULE_NOT_FOUND`); roadmap/state consistency is being checked manually with source review. |

## GitHub/AWS Gates

| Gate | Status | Evidence |
| --- | --- | --- |
| Preview deploy | Pending | Dispatch `.github/workflows/preview.yml` after commit/push using `dry_run=false`, `container_architecture=x86_64`. |
| Dev runtime repair | Pending | Confirm dev `GalaWeb` task definition has `BASE_URL=<dev-https-base-url>` from workflow metadata and `FORCE_SSL=true`. |
| Dev sign-in smoke | Pending | Fresh cookie/token POST to `/readers/sign_in` should not return 422. |
| CloudWatch post-fix check | Pending | Query recent dev sign-in logs for absence of origin mismatch on the smoke request. |

## Production Handling

Production mutation is deferred behind the dev preview gate and a fresh reproduction. Current production runtime env already satisfies the HTTPS/SSL condition, so this fix targets the SST full deploy path that produced the dev preview regression.
