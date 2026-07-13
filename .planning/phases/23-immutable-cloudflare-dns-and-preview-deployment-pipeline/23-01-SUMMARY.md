# Summary 23-01: Cloudflare DNS, Immutable Assets, and Minimal Deploy Workflow

## Status

Implemented locally. Live AWS/Cloudflare verification is still pending a GitHub Actions deploy run with the required secrets.

## Changes

- Added Phase 23 planning requirements for `learngala.dev`, preview subdomains, immutable release assets, minimal workflow inputs, production release notes, and contributor-gated deploy safety.
- Updated SST IaC to derive release metadata, set release-scoped asset hosts, use a shared SST Router distribution with Cloudflare DNS for the app edge, and expose deploy outputs needed for cache invalidation and operational hooks.
- Reworked the deploy workflow to accept only `branch`, `stage`, `dry_run`, `invalidate_cache`, and `user_data`.
- Added `.github/workflows/preview.yml` as a dev-only preview workflow for same-repository pull requests and manual branch previews.
- Reworked the deploy script to build release IDs, upload assets to `releases/<stage>/<release_id>/`, prune older asset namespaces, invalidate CloudFront on request, and run approved `user_data` hooks.
- Added CODEOWNERS, SECURITY.md, and RELEASE.md.
- Updated Rails release metadata and cloud architecture docs.
- Added gap notes to carry to the next phase: move container secrets from plaintext env to ECS task secrets and tighten Cloudflare secret variable expectations.

### Caching and authorization context mapping added

- Added role/association impact notes for case and catalog endpoints:
  - anonymous vs signed-in users on `/cases`, `/cases/:slug`, and catalog JSON endpoints.
  - role/persona paths that can alter payloads:
    - `:editor` users can trigger privileged response fields and access paths.
    - `:admin` is represented through `editor` role on `Role` and bypasses normal policy scope limits in admin gates.
    - `editorships` and `my_cases` change case-policy scope.
    - `library managers` (`managerships` + library policy) can access library-owned cases via request flow and case library requests.
    - `request_for_case` / `CaseLibraryRequest` for pending/accepted requests can expose additional unpublished/unavailable cases.
    - `enrollments` (including status and active group/deployment) changes show payload and quiz/deployment branches.
    - `GroupMembership` admin status can impact deployment scoping (group/community behavior) and therefore deployment-based content.
    - `reader.persona` (`learner`, `teacher`, `writer`) currently does not currently branch case show JSON payload, but is tracked for future split-cache strategy to avoid over-fragmentation.
  - No code change was made yet to alter cache keys; this is now tracked as a Phase 23 hardening follow-up for StaticSite/CloudFront and `Rails.cache.fetch` TTL/keys.
- Added explicit request-variance buckets for `/cases/:slug` and catalog JSON in plan:
  - anonymous shared buckets are allowed where payload is globally visible.
  - signed-in request buckets remain short TTL with reader-scoped variation because serialized HTML includes `reader` and `enrollment`-dependent values (`caseData` on page bootstraps).
  - editor/admin users are isolated by policy visibility and payload branches (`can_update_case`, `statistics`) from shared caches.
- Added brotli/readability note:
  - StaticSite/CloudFront behavior should keep `compress: true` and explicitly include `Accept-Encoding` in cache-safe request headers so browsers can receive Brotli (`br`) when supported.
  - Existing Vary `Accept-Encoding` response policy for cache objects should be retained; avoid removing this header from cacheable responses.

## Verification

- `bash -n scripts/deploy-sst.sh` — pass.
- `ruby -c config/application.rb` — pass.
- `ruby -e "require 'yaml'; YAML.load_file('.github/workflows/deploy.yml')"` — pass.
- `npx sst install` — pass after updating the Cloudflare provider pin to `6.13.0`.
- `npx tsc sst.config.ts --noEmit --skipLibCheck --target ES2022 --module NodeNext --moduleResolution NodeNext --ignoreConfig` — pass.
- `git diff --check` — pass.
- `sed -n`/`rg` of `infra/sst.config.ts` to confirm:
  - `/cases/*` cache allowlist exists with non-cacheable exclusions for comment/community/deployments/quizzes/stats/settings paths.
  - static/app CloudFront behaviors include `compress: true` and `Accept-Encoding`-aware compression policy for browser payload negotiation.

## Pending Live Gate

- Run `.github/workflows/preview.yml` against the target branch, first with `dry_run=true` for manual dispatch or automatically through a same-repository pull request.
- Promote with `stage=production`, `dry_run=true` first because production attach/detach of stage DNS aliases occurs during deploy.

## Breakpoint: 2026-05-30 AWS/Cloudflare live experiment

Another agent should continue from here.

Live production is deployed through SST Router and Cloudflare DNS without changing Heroku `.com` production:

- Production SST deploy completed with pinned image `353760060567.dkr.ecr.us-west-2.amazonaws.com/gala:3f2a0394b42b954a9bd27c44f1269fd69885b6a3`.
- Shared Router distribution: `E3FF4TTU9Q4XTY` / `d1ky1nvgqyxj8z.cloudfront.net`.
- Router aliases: `learngala.dev`, `dev.learngala.dev`, `*.dev.learngala.dev`.
- `https://learngala.dev/up` returned `200` when pinned to a Cloudflare-resolved edge IP, and `https://d1ky1nvgqyxj8z.cloudfront.net/` with `Host: learngala.dev` returned the Gala HTML.
- Cloudflare `learngala.dev` record points to `d1ky1nvgqyxj8z.cloudfront.net`.
- Existing production app CDN remained `EF4NIYHMN17KT` / `https://d3sn0yc7ms2w6o.cloudfront.net`.
- Heroku production `https://www.learngala.com/up` still returned through `server: Heroku` / `via: heroku-router`.

Permanent dev stage is deployed but not healthy yet:

- Dev deploy completed with preview URL `https://pr-745.dev.learngala.dev`.
- Dev ALB: `http://GalaWebLoadBala-bamvarum-1787662264.us-west-2.elb.amazonaws.com`.
- Dev app CDN: `EO8V10J0LC0GE` / `https://d3rweervkhwlx9.cloudfront.net`.
- Dev static CDN: `EUWPHB77806X0` / `https://d1ksvw16me8njk.cloudfront.net`.
- Dev database: `gala-dev-galadatabaseinstance-vfkaokum`.
- Dev ECS cluster: `gala-dev-GalaClusterCluster-zeeusfkv`.
- Dev web service is running but unhealthy; ALB target health reports `Target.Timeout`.
- Dev web logs in `/sst/cluster/gala-dev-GalaClusterCluster-zeeusfkv/gala-dev-GalaWeb-bcxhrofd/GalaWeb` show Puma starts, then worker boot fails with `key must be 16 bytes` while decrypting Rails credentials in `config/initializers/oembed.rb`.
- `aws ecs describe-task-definition` snapshots for dev and production confirm secrets are still passed through `environment` (`secrets: []`), so this should be part of the next hardening pass before broader preview/stability work.
- Likely next diagnostic: compare production task definition `RAILS_MASTER_KEY` secret source/value handling with dev, then reseed dev `RAILS_MASTER_KEY` correctly and force a dev ECS redeploy. Do not print secret values. The interrupted command was about to inspect production task-definition secret wiring read-only.

## Carry-forward for the next phase

- Migrate sensitive runtime variables in ECS task definitions from `environment` to `secrets` (`DATABASE_URL`, `REDIS_URL`, `RAILS_MASTER_KEY`, `SECRET_KEY_BASE`, `LTI_*`, `SES_*`) so task metadata does not contain plaintext values.
- Consolidate Cloudflare secrets/vars to the minimal required set in deploy workflow and docs (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`, optional `CLOUDFLARE_ACCOUNT_ID`) and remove legacy `CLOUDFLARE_DEFAULT_ACCOUNT_ID`.

Code changes already made locally:

- `infra/sst.config.ts` uses one shared SST Router for `learngala.dev`, `dev.learngala.dev`, and `*.dev.learngala.dev`; production creates it, dev references it through `GALA_ROUTER_DISTRIBUTION_ID`.
- Existing production app CloudFront distribution was restored to the raw `aws.cloudfront.Distribution` shape to avoid delete/recreate.
- Non-production imports the shared static assets bucket by default to avoid trying to create `gala-static-assets-353760060567`.
- `scripts/deploy-sst.sh` makes CloudFront alias detachment opt-in, includes Router invalidation, discovers the Router for dev, and only requires `seed.dump` when `user_data` includes `seed_database`.
- `.github/workflows/deploy.yml` now generates dev preview hosts as `<branch>.dev.learngala.dev`.
