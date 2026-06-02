# Phase 31 Validation

## Local Gates

| Gate | Status | Evidence |
| --- | --- | --- |
| Previous commit and planning audit | Passed | `git show HEAD~1..HEAD`, `.planning/STATE.md`, `.planning/ROADMAP.md`, and Phase 30 artifacts reviewed. |
| AWS CloudWatch diagnosis | Passed | Dev sign-in 422 showed HTTPS origin versus HTTP `request.base_url`; production had generic CSRF evidence without that mismatch. |
| AWS ECS runtime env inspection | Passed | Dev `GalaWeb:14` had HTTPS `BASE_URL` with `FORCE_SSL=false`; production `GalaWeb:17` had HTTPS `BASE_URL` with `FORCE_SSL=true`. |
| Targeted Devise request spec | Passed | `./run-rspec.sh spec/requests/devise_reader_routes_spec.rb` - 11 examples, 0 failures; sign-in origin is derived from `GALA_TEST_SIGN_IN_BASE_URL` or `BASE_URL`. |
| Deploy guard regression | Passed | `GALA_TEST_DEV_HTTPS_BASE_URL=<dev-https-base-url> bash scripts/ops/test-deploy-sst-architecture-guard.sh` - all architecture and payload guard cases passed, including dev HTTPS/HTTP `FORCE_SSL` cases. |
| F-03 CloudWatch diagnosis | Passed | Dev sign-up 500 showed `Net::SMTPAuthenticationError (535 Authentication Credentials Invalid)` from `Reader#send_devise_notification` after reader insert/commit. |
| F-03 targeted Ruby specs | Passed | `./run-rspec.sh spec/models/reader_spec.rb spec/requests/devise_reader_routes_spec.rb` - 23 examples, 0 failures; sign-up base URL is env-driven through `GALA_TEST_SIGN_UP_BASE_URL`, `GALA_TEST_AUTH_BASE_URL`, or `BASE_URL`. |
| Secret scan guard | Passed | `scripts/scan-staged-secrets` passed after narrowing the scanner false positive for generated token method references. |
| Infra TypeScript | Passed | `npm exec --prefix infra tsc -- --noEmit` |
| Diff hygiene | Passed | `git diff --check` |
| Planning consistency | Blocked | `node gsd-tools validate consistency` is not available in this repo (`MODULE_NOT_FOUND`); roadmap/state consistency is being checked manually with source review. |

## GitHub/AWS Gates

| Gate | Status | Evidence |
| --- | --- | --- |
| F-01 preview deploy | Passed | `.github/workflows/preview.yml` run `26794621365` deployed commit `64383a75e65236e6590ac1bbf0b4dcc5ed6cdefa` as release `26794621365.20260602022903.64383a75` with `dry_run=false`, `container_architecture=x86_64`. |
| F-01 dev runtime repair | Passed | Dev ECS stabilized with `GalaWeb:15` and `GalaWorker:14`; runtime env had `BASE_URL=https://infra-sst-aws-poc.dev.learngala.dev`, `FORCE_SSL=true`, and the F-01 commit SHA. |
| F-01 dev sign-in smoke | Passed | Fresh cookie/token POST to `/readers/sign_in` returned HTTP 200, not 4XX/422. |
| F-03 preview deploy | Passed | `.github/workflows/preview.yml` run `26795072027` deployed commit `63e17d6d12757d6db67e55064b2fd65b75febff6` as release `26795072027.20260602024317.63e17d6d` with `dry_run=false`, `container_architecture=x86_64`. |
| F-03 dev runtime repair | Passed | `aws ecs wait services-stable` returned success; dev ECS stabilized with `GalaWeb:16` and `GalaWorker:15`; both had the F-03 commit SHA, release metadata, `BASE_URL=https://infra-sst-aws-poc.dev.learngala.dev`, and `FORCE_SSL=true`. |
| Dev health smoke | Passed | `curl https://infra-sst-aws-poc.dev.learngala.dev/up` returned HTTP 200 after ECS reached stable state. |
| Dev sign-up smoke | Passed | Fresh cookie/token POST to `/readers` returned HTTP 302, not HTTP 500. The preview URL was supplied by the live target, not hard-coded into tests. |
| Dev sign-in regression smoke | Passed | Fresh cookie/token POST to `/readers/sign_in` returned HTTP 200 after the F-03 deploy, not 4XX/422. |
| CloudWatch post-fix check | Passed | Logs Insights query `7b305a77-dcb4-467c-873e-22ef682ab458` over recent dev logs matched zero `status.*500`, `InvalidAuthenticityToken`, `Origin header`, or `Net::SMTPAuthenticationError` records after the final smoke. |

## Production Handling

Production mutation is deferred behind the dev preview gate and a fresh reproduction. Current production runtime env already satisfies the HTTPS/SSL condition, so this fix targets the SST full deploy path that produced the dev preview regression.

## Follow-Up Warnings

- GitHub preview workflow success can precede ECS service stability; keep the explicit `aws ecs wait services-stable` post-run gate.
- The preview workflow emitted Node.js 20 deprecation warnings for GitHub Actions dependencies; upgrade workflow actions separately.
- Dev SMTP credentials still failed authentication during the F-03 reproduction. This phase prevents that failure from becoming a registration 500 when `RAISE_DELIVERY_ERRORS=false`; it does not prove confirmation email delivery.
