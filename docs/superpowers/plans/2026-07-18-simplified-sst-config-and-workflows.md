# Simplified SST Configuration and Workflows Implementation Plan

> Execute this plan in the existing
> `integration/react19-stable-sst` worktree. Preserve one commit on top of
> `c4151711`; amend that commit only after all checks pass.

**Goal:** Serve Rails assets from the ECS image, make S3 and SES external and
untouched, move PR previews to SST Console, reduce GitHub CI to full RSpec plus
Vitest, deploy dev safely, and verify the live site.

**Architecture:** Keep the existing durable SST component identities and
preview topology, but remove the static bucket/distribution and PostHog runtime
configuration. Durable deploys remain manual GitHub Actions operations that
call the pinned SST CLI directly. SST Console alone maps pull requests to
ephemeral `pr-<number>` stages.

**Stack:** SST 4.7.1, TypeScript, AWS ECS/RDS/ElastiCache/SSM, Cloudflare DNS,
Rails 8/RSpec/Selenium, React 19/Vitest, GitHub Actions, SST Console.

---

## Task 1: Add failing configuration and workflow contracts

**Files:**

- Modify: `infra/sst-config-contract.test.mjs`
- Modify: `infra/package.json`

1. Replace the old media-bucket lookup expectation with assertions that neither
   external bucket is created, imported, or read as an SST/Pulumi resource.
2. Add failing assertions for the absence of `ASSET_HOST`,
   `releases/bootstrap`, `GALA_STATIC_ASSETS_BUCKET`, `GALA_RELEASE`, static
   CloudFront resources, static-bucket IAM, and PostHog runtime keys.
3. Add positive assertions for `RAILS_SERVE_STATIC_FILES`, the `msc-gala`
   runtime bucket name, media-only IAM, and both SES SMTP SSM mappings.
4. Add an assertion that `console.autodeploy.target` accepts only
   `pull_request` and returns `pr-${event.number}`.
5. Read `.github/workflows/ci.yml` and `.github/workflows/deploy.yml` from the
   same Node test. Assert that CI contains only `bundle exec rspec` and
   `pnpm test` as test-suite commands and has no summary/report/artifact/status,
   Playwright, SST, infrastructure, or deployed-smoke behavior. Assert that
   deploy has only `workflow_dispatch`, no preview/comment/user-data logic, and
   directly runs `npx sst deploy --stage "$SST_STAGE"` from `infra`.
6. Add `"test": "node --test sst-config-contract.test.mjs"` to
   `infra/package.json`.
7. Run `npm --prefix infra test` and confirm the new assertions fail for the
   expected old configuration and workflows.

## Task 2: Simplify `sst.config.ts`

**Files:**

- Modify: `infra/sst.config.ts`

1. Add the top-level `console.autodeploy.target` callback. Return
   `pr-${event.number}` for pull-request events, including removal events; return
   `undefined` for branch and tag events.
2. Remove `aws.s3.BucketV2.get`, `new sst.aws.Bucket`, the static CloudFront
   distribution, preview static-distribution lookup, and the `staticAssets`
   variable.
3. Remove `ASSET_HOST`, `GALA_STATIC_ASSETS_BUCKET`, and `GALA_RELEASE` from the
   shared ECS environment. Keep `RAILS_SERVE_STATIC_FILES=true` and
   `S3_BUCKET=msc-gala`.
4. Remove PostHog from durable secret creation, preview SSM mappings, and all
   runtime configuration. Keep Sentry application behavior unchanged.
5. Reduce task-role permissions to `s3:ListBucket` on
   `arn:aws:s3:::msc-gala` and `s3:GetObject`/`s3:PutObject` on
   `arn:aws:s3:::msc-gala/*`.
6. Preserve all durable component logical names, stage validation, base-image
   validation, SSM parameter names, router routes, services, tasks, schedules,
   capacity, and outputs.
7. Run `npm --prefix infra test` and `npm --prefix infra run check`; confirm both
   pass.

## Task 3: Reduce GitHub CI to RSpec and Vitest

**Files:**

- Replace: `.github/workflows/ci.yml`

1. Keep push, pull-request, and input-free manual triggers, read-only contents
   permission, and cancel-in-progress concurrency.
2. Use `ubuntu-24.04` x86-64 so the existing local Selenium Chrome driver is
   available. Keep PostgreSQL 16 and Redis 7 services plus the test database
   environment.
3. Set up pnpm, Node 24.15.0, required native packages, Ruby 4.0.3, Bundler
   cache, and frozen Node dependencies.
4. Prepare the Rails test database with `bundle exec rails db:prepare`.
5. Run the complete `bundle exec rspec`, including all feature specs.
6. Run `pnpm test` for Vitest.
7. Do not create validation directories, statuses, reports, summaries,
   artifacts, Playwright smoke runs, SST checks, or custom triage.
8. Run the local workflow contract tests and parse both workflow files with
   Ruby's YAML parser.

## Task 4: Make durable deploys call SST directly

**Files:**

- Replace: `.github/workflows/deploy.yml`
- Delete: `scripts/deploy-sst.sh`
- Delete: `scripts/lib/rapid-release.sh`
- Delete: `scripts/lib/release-artifacts.sh`
- Delete: `scripts/lib/ecs-release.sh`
- Delete: `scripts/lib/stage-target.sh`
- Modify: `infra/README.md`
- Modify: `docs/ops/workflows/deploy.md`
- Modify: `docs/aws-production-operator-runbook.md`

1. Remove the pull-request trigger and preview job from `deploy.yml`.
2. Keep the manual `dev|production` stage choice, environment gate, operator
   authorization, OIDC credentials, Node 24.15.0, `npm ci`, region, and
   Cloudflare environment variables.
3. Remove `user_data`, `GALA_EFFECTIVE_STAGE`, preview URL construction,
   promotion, rollback, and script dispatch.
4. Run `npx sst deploy --stage "$SST_STAGE"` with
   `working-directory: infra`.
5. Delete the now-unreferenced deployment dispatcher and release libraries;
   this also removes dormant S3-writing release-channel code.
6. Update active operator documentation to describe direct SST durable deploys
   and SST Console-owned PR previews. Do not rewrite historical Superpowers
   design/plan documents.
7. Run `rg` to prove no active workflow or operator documentation invokes the
   deleted dispatcher, then run workflow and SST contract checks.

## Task 5: Create the private read-only secret recovery snapshot

**Files:**

- Create outside Git only: `/private/tmp/<generated>/dev.env`
- Create outside Git only: `/private/tmp/<generated>/production.env`
- Create outside Git only: `/private/tmp/<generated>/inventory.json`

1. Create a `mktemp -d` directory under `/private/tmp` with `umask 077`; verify
   directory mode `0700` and file modes `0600`.
2. With `AWS_PROFILE=gala` and `SST_STAGE=dev`, decrypt all parameters under
   `/gala/dev/` and `/gala/production/` without printing values.
3. Capture the four Google OAuth values from SST's production secret store
   without printing them. Read the same four approved keys from Heroku
   `msc-gala` only for hash comparison: accept the two matching legacy values
   and record that the migration pair is empty there. Do not call any Heroku or
   SST secret write command.
4. Serialize dotenv values safely and write a value-free inventory containing
   stage, key, source, string length, and SHA-256 only.
5. Parse both dotenv files, confirm every required ECS key is non-empty and not
   the known placeholder, and verify inventory hashes without emitting values.
6. Report only path, modes, counts, and missing-key count.

## Task 6: Verify locally

**Files:** none unless a real defect requires a narrowly scoped fix.

1. Run `mise trust` if the worktree is not already trusted.
2. Run `npm --prefix infra test`, `npm --prefix infra run check`, workflow YAML
   parsing, `pnpm test`, and the complete `bundle exec rspec` with local
   PostgreSQL, Redis, and Chrome.
3. Resolve the current ARM64 production base-image digest from ECR/read-only
   ECS metadata. Build `Dockerfile.production` for `linux/arm64` with BuildKit.
4. Start the built image locally with non-production test settings when
   practical and confirm `/up` plus representative `/assets` and `/packs`
   requests return 200.
5. Run `git diff --check` and review the complete working-tree diff.

## Task 7: Prove the dev plan cannot mutate S3 or SES

**Files:**

- Write sensitive/raw plan output only under the private temp directory.

1. Re-export filtered dev SST state and verify every `GalaStaticAssets`
   component/child has `retainOnDelete: true` before removal from state.
2. Record read-only before metadata for `msc-gala` and
   `gala-static-assets-353760060567`, including identity, versioning, public
   access block, CORS, and policy digests without exposing policy contents.
3. Run the JSON dev diff with exactly `AWS_PROFILE=gala SST_STAGE=dev` and the
   verified production base image.
4. Mechanically reject any S3 or SES create, update, replace, or physical-delete
   operation. Allow only state retirement of resources whose persisted
   `retainOnDelete` flag was proven true.
5. Review all remaining replacements/deletions and stop if a durable VPC,
   cluster, database, cache, router, bucket, or SES resource could mutate.

## Task 8: Deploy and verify dev

**Files:** none unless verification identifies a code defect.

1. Deploy exactly once with `AWS_PROFILE=gala SST_STAGE=dev`; do not invoke
   Heroku deployment or any release-channel script.
2. Wait for the web and worker ECS services to stabilize, then verify desired,
   running, pending, and failed task counts.
3. Confirm `https://dev.learngala.dev/` and `/up` return 200. Extract live
   fingerprinted `/assets/*` and `/packs/*` URLs from HTML and verify each
   returns 200 without `bootstrap` in the URL.
4. Run Playwright invariants with
   `GALA_BASE_URL=https://dev.learngala.dev` and inspect browser console/network
   failures.
5. Run a final zero-change JSON diff and repeat bucket metadata checks; compare
   before/after digests and fail if S3 or SES changed.
6. Confirm the SST outputs include the preview-compatible stage URL for Console
   and document the Console settings required for repo path `/infra` and stage
   pattern `pr-*`.

## Task 9: Finalize the single commit

**Files:** all intended changes.

1. Run the entire verification matrix once more after any fixes.
2. Confirm no secret value or private temp path content is tracked by Git.
3. Confirm `CODEOWNERS` remains deleted and application PostHog integration
   remains absent while Sentry remains configured.
4. Stage only intended files and amend the existing integration commit.
5. Verify `git rev-list --count c4151711..HEAD` is `1`, the worktree is clean,
   and record the final commit SHA and live dev verification evidence.
