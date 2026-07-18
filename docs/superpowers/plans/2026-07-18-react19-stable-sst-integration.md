# React 19 on Stable SST Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce one verified commit above `c4151711` that combines PR #791's React 19 / Blueprint 6 application with the complete current SST and staged OAuth baseline, then deploy and verify only the durable dev stage.

**Architecture:** Use a three-way squash merge because `c4151711` and PR #791 head `37d39784` share `2b808a57`. Restore the current control plane wholesale, reconcile the small set of application conflicts by ownership, verify the application and production image locally, normalize temporary commits into one commit, review the dev SST diff, and deploy that exact commit.

**Tech Stack:** Rails 8, Ruby 4.0.3, React 19, Blueprint 6, Shakapacker/Webpack 5, Vitest, Playwright, pnpm 11.1.0, Docker, SST, AWS `us-west-2`.

## Global Constraints

- `c4151711` is the authoritative starting tree and infrastructure/control-plane source.
- PR #791 head is pinned to `37d39784e0394ab4993c68bb6d434e3f2f2593bd`.
- Work only on `integration/react19-stable-sst`; leave `oauth/staged-google-key-rotation` at `c4151711`.
- Finish with exactly one commit whose parent is `c4151711`.
- Preserve all staged Google OAuth behavior and tests while adopting Blueprint 6 classes and Vitest compatibility.
- Delete the root `CODEOWNERS` file so CODEOWNER approval cannot gate this dev release; this is the sole user-authorized deletion from the current baseline.
- Every AWS/SST command must include `AWS_PROFILE=gala SST_STAGE=dev` and target `--stage dev`.
- Do not deploy while any local build, test, protected-path comparison, or SST diff review is failing.
- Do not touch production or run any SST `remove`, `refresh`, or production-stage command.

---

### Task 1: Pin the integration inputs and safety baseline

**Files:**
- Modify: `docs/superpowers/plans/2026-07-18-react19-stable-sst-integration.md`
- Reference: `docs/superpowers/specs/2026-07-18-react19-stable-sst-integration-design.md`

**Interfaces:**
- Consumes: local refs `c4151711`, `37d39784`, and `oauth/staged-google-key-rotation`
- Produces: a clean integration checkout with immutable source SHAs confirmed

- [ ] **Step 1: Confirm the branch and clean working tree**

Run:

```sh
git status --short --branch
git branch --show-current
```

Expected: branch is `integration/react19-stable-sst`; only the plan document is modified before its temporary planning commit.

- [ ] **Step 2: Confirm the pinned graph**

Run:

```sh
git rev-parse c4151711
git rev-parse 37d39784
git rev-parse oauth/staged-google-key-rotation
git merge-base c4151711 37d39784
```

Expected, in order:

```text
c4151711102e39aa1c649e014d55f37d761064ed
37d39784e0394ab4993c68bb6d434e3f2f2593bd
c4151711102e39aa1c649e014d55f37d761064ed
2b808a57345f7cf1c975013c98c6e92da978bd64
```

- [ ] **Step 3: Temporarily commit the implementation plan**

Run:

```sh
git add docs/superpowers/plans/2026-07-18-react19-stable-sst-integration.md
git commit -m "docs: plan React 19 stable SST integration"
```

Expected: one temporary planning commit on the integration branch. It will be folded into the final single commit.

---

### Task 2: Squash PR #791 while restoring the current control plane

**Files:**
- Preserve exactly from `c4151711`: `.github/workflows/**`
- Preserve exactly from `c4151711`: `infra/**`
- Preserve exactly from `c4151711`: `scripts/ci/**`, `scripts/lib/**`, `scripts/ops/**`
- Preserve exactly from `c4151711`: `scripts/deploy-sst.sh`, `scripts/read-platform-constant.mjs`, `scripts/scan-staged-secrets`
- Preserve exactly from `c4151711`: `docs/agent-playbooks/**`, `docs/ops/**`, `docs/releases/**`, `RELEASE.md`, `ANALYTICS.md`
- Preserve exactly from `c4151711`: `bin/docker-clean-repl`, `bin/ecs-web-repl`, `bin/sst-db`
- Preserve exactly from `c4151711`: `.rspec`, `config/initializers/active_storage_cors.rb`, `spec/requests/active_storage_cors_spec.rb`
- Preserve and adapt: `playwright.smoke.config.mjs`, `spec/playwright/smoke/active-storage-media.spec.mjs`, `spec/playwright/smoke/auth-catalog.spec.mjs`
- Import from PR #791: `app/**`, application-facing `config/**`, `lib/**`, `spec/**`, `tests/visual/**`, root frontend/build configuration, and application dependency manifests

**Interfaces:**
- Consumes: PR #791 application delta from merge base `2b808a57` to `37d39784`
- Produces: one staged application integration with no unresolved index entries and no control-plane drift

- [ ] **Step 1: Start the squash merge**

Run:

```sh
git merge --squash 37d39784e0394ab4993c68bb6d434e3f2f2593bd
```

Expected: Git stages the PR application delta and reports conflicts only where both branches changed or one branch removed a current file. Do not commit yet.

- [ ] **Step 2: Restore all protected control-plane paths**

Run:

```sh
git restore --source=c4151711 --staged --worktree -- .github/workflows infra scripts/ci scripts/lib scripts/ops scripts/deploy-sst.sh scripts/read-platform-constant.mjs scripts/scan-staged-secrets docs/agent-playbooks docs/ops docs/releases RELEASE.md ANALYTICS.md bin/docker-clean-repl bin/ecs-web-repl bin/sst-db .rspec config/initializers/active_storage_cors.rb spec/requests/active_storage_cors_spec.rb
```

Expected: current CI/deployment/SST/operator behavior is restored, including removal of PR-only replacement workflows and retention of the current shared-resource guards.

- [ ] **Step 3: Keep the current smoke-test contract**

Run:

```sh
git restore --source=c4151711 --staged --worktree -- playwright.smoke.config.mjs spec/playwright/smoke
```

Expected: `pnpm test:smoke` still resolves to the current smoke configuration and authentication/media specs. Later verification determines whether React 19 requires test-only adjustments.

- [ ] **Step 4: Accept the PR removal of obsolete frontend test infrastructure**

Run:

```sh
git rm -f jest.config.js spec/support/jest-setup.js app/javascript/shared/blueprintLegacyNamespace.js app/javascript/shared/__tests__/blueprintLegacyNamespace.test.js
```

Expected: obsolete Jest and Blueprint compatibility-shim files are absent; Vitest and native Blueprint 6 behavior replace them.

- [ ] **Step 5: Resolve application-owned delete/modify conflicts in favor of the upgrade**

Remove the PR-deleted legacy application files if they remain unresolved:

```sh
git rm -f app/javascript/catalog/home/ValueProposition.jsx
```

Retain `ANALYTICS.md` from the current baseline. Replace PR #791's PostHog
runtime adapter with the existing Sentry browser integration, retain Ahoy
event collection, and add focused Sentry analytics tests under
`app/javascript/shared/__tests__/`. Do not modify the protected SST PostHog
secret declarations; they remain control-plane state but are not consumed by
the application.

- [ ] **Step 6: Enumerate the remaining conflicts**

Run:

```sh
git diff --name-only --diff-filter=U
```

Expected remaining application conflicts only:

```text
.gitignore
app/helpers/application_helper.rb
app/models/reader.rb
app/views/devise/registrations/new.html.haml
app/views/devise/sessions/_sign_in.html.haml
config/application.rb
spec/helpers/application_helper_spec.rb
spec/models/reader_spec.rb
spec/requests/devise_reader_routes_spec.rb
```

If a protected path appears, restore it from `c4151711`. If a different application path appears, inspect all three blobs with `git show 2b808a57:<path>`, `git show c4151711:<path>`, and `git show 37d39784:<path>` before editing.

- [ ] **Step 7: Remove the dev release's CODEOWNER gate**

Run:

```sh
git rm CODEOWNERS
test ! -e CODEOWNERS
```

Expected: the root `CODEOWNERS` file is staged for deletion and absent from the working tree. Do not remove any other repository-policy file.

---

### Task 3: Reconcile staged OAuth and application conflicts test-first

**Files:**
- Modify: `.gitignore`
- Modify: `app/helpers/application_helper.rb`
- Modify: `app/models/reader.rb`
- Modify: `app/views/devise/registrations/new.html.haml`
- Modify: `app/views/devise/sessions/_sign_in.html.haml`
- Modify: `config/application.rb`
- Modify: `spec/helpers/application_helper_spec.rb`
- Modify: `spec/models/reader_spec.rb`
- Modify: `spec/requests/devise_reader_routes_spec.rb`
- Preserve: `app/controllers/authentication_strategies/omniauth_callbacks_controller.rb`
- Preserve: `app/javascript/controllers/google_oauth_controller.js`
- Preserve and port: `app/javascript/controllers/__tests__/google_oauth_controller.test.js`
- Preserve: `app/services/google_oauth_setup.rb`
- Preserve: `spec/requests/google_oauth_migration_spec.rb`
- Preserve: `spec/services/google_oauth_setup_spec.rb`

**Interfaces:**
- Consumes: current staged OAuth contract and PR #791 Blueprint 6/Vitest contract
- Produces: OAuth behavior that is unchanged semantically but rendered and tested with the upgraded frontend

- [ ] **Step 1: Preserve the current OAuth/runtime assertions before implementation edits**

Restore current-side OAuth files that PR #791 did not intentionally supersede:

```sh
git restore --source=c4151711 --staged --worktree -- app/controllers/authentication_strategies/omniauth_callbacks_controller.rb app/javascript/controllers/google_oauth_controller.js app/javascript/controllers/__tests__/google_oauth_controller.test.js app/services/google_oauth_setup.rb config/initializers/devise.rb config/initializers/filter_parameter_logging.rb config/initializers/sentry.rb spec/requests/google_oauth_migration_spec.rb spec/services/google_oauth_setup_spec.rb
```

Expected: staged key rotation, migration allowlisting, secret filtering, and controller behavior remain present.

- [ ] **Step 2: Install the merged dependencies and run focused tests before resolving the conflicted implementations**

Run:

```sh
corepack pnpm install --lockfile-only
corepack pnpm install --frozen-lockfile
bundle install --jobs 4
docker compose up -d db redis
RAILS_ENV=test DATABASE_URL=postgres://gala:alpine@localhost:5432/gala_test bundle exec rails db:prepare
pnpm exec vitest run app/javascript/controllers/__tests__/google_oauth_controller.test.js
RAILS_ENV=test DATABASE_URL=postgres://gala:alpine@localhost:5432/gala_test bundle exec rspec spec/models/reader_spec.rb spec/requests/devise_reader_routes_spec.rb spec/requests/google_oauth_migration_spec.rb spec/services/google_oauth_setup_spec.rb
```

Expected: dependency installation and database preparation pass. The focused tests then FAIL because the conflict markers and old test globals prevent the combined suite from loading. Record the concrete failures; do not weaken assertions.

- [ ] **Step 3: Resolve the application helper and runtime configuration**

Edit `app/helpers/application_helper.rb` and `spec/helpers/application_helper_spec.rb` to retain the `c4151711` release-label and release-URL semantics because they are consumed by the current deployment contract. Do not accept PR #791's deletion of these helpers.

Edit `config/application.rb` to retain the current `temporary_unconfirmed_access` and staged OAuth configuration while applying only non-infrastructure application settings introduced by PR #791. Remove all conflict markers.

- [ ] **Step 4: Resolve the Reader model without dropping delivery hardening**

Edit `app/models/reader.rb` and `spec/models/reader_spec.rb` so the result retains:

```ruby
require 'net/smtp'
GOOGLE_OAUTH_MIGRATION_EMAILS = ['nathan.papes@gmail.com'].freeze
DEVISE_NOTIFICATION_DELIVERY_ERRORS = [
  IOError,
  Net::SMTPAuthenticationError,
  Net::SMTPFatalError,
  Net::SMTPServerBusy,
  Net::SMTPSyntaxError,
  Net::SMTPUnknownError,
  Timeout::Error
].freeze
```

Retain `google_oauth_migration_allowed?`, the normalized allowlist tests, and the delivery-error rescue/tests from `c4151711`. Apply unrelated PR model changes only when they do not remove those contracts.

- [ ] **Step 5: Resolve both Devise views with Blueprint 6 classes**

In `app/views/devise/registrations/new.html.haml` and `app/views/devise/sessions/_sign_in.html.haml`, retain the `google-oauth` Stimulus controller, email target, authorize action, disabled-state logic, and routes from `c4151711`. Replace every `pt-` and `bp4-` class in the resolved views with the corresponding `bp6-` class from PR #791, including `bp6-disabled` for the disabled Google action.

Update `spec/requests/devise_reader_routes_spec.rb` so its selector uses `a.oauth-icon-google:not(.bp6-disabled)` while retaining the current form-controller, target, action, href, CSRF-origin, sign-up, and sign-in assertions.

- [ ] **Step 6: Port the OAuth controller test to Vitest without changing behavior**

Update `app/javascript/controllers/__tests__/google_oauth_controller.test.js` to import Vitest globals explicitly:

```javascript
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
```

Replace Jest-specific `jest.fn`, `jest.spyOn`, and `jest.restoreAllMocks` calls with `vi.fn`, `vi.spyOn`, and `vi.restoreAllMocks`. Keep every URL, email, event-prevention, and fallback assertion.

- [ ] **Step 7: Resolve `.gitignore` additively and stage all conflict resolutions**

Keep current worktree/infra ignores and PR #791's new Playwright/Vitest output ignores. Then run:

```sh
git add .gitignore app/helpers/application_helper.rb app/models/reader.rb app/views/devise/registrations/new.html.haml app/views/devise/sessions/_sign_in.html.haml config/application.rb spec/helpers/application_helper_spec.rb spec/models/reader_spec.rb spec/requests/devise_reader_routes_spec.rb app/javascript/controllers/__tests__/google_oauth_controller.test.js
git diff --name-only --diff-filter=U
```

Expected: the second command prints nothing.

- [ ] **Step 8: Run focused tests to verify the merged behavior passes**

Run:

```sh
pnpm exec vitest run app/javascript/controllers/__tests__/google_oauth_controller.test.js
RAILS_ENV=test DATABASE_URL=postgres://gala:alpine@localhost:5432/gala_test bundle exec rspec spec/helpers/application_helper_spec.rb spec/models/reader_spec.rb spec/requests/devise_reader_routes_spec.rb spec/requests/google_oauth_migration_spec.rb spec/services/google_oauth_setup_spec.rb
```

Expected: PASS with all staged OAuth and release-helper examples green.

---

### Task 4: Reconcile dependencies and the production build surface

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Preserve: `pnpm-workspace.yaml`
- Preserve: `infra/package.json`
- Preserve: `infra/package-lock.json`
- Import/adapt: `Dockerfile.production`
- Create from PR: `Dockerfile.production-base`
- Import: `vitest.config.mjs`
- Import: `tsconfig.json`
- Import from PR #791: `.babelrc.js`, `.eslintignore`, `.eslintrc.json`, `.rubocop.yml`, `stylelint.config.js`
- Preserve from `c4151711`: `.rspec`

**Interfaces:**
- Consumes: PR #791 root application dependencies and current SST workspace manifests
- Produces: reproducible root and infra dependency graphs plus a production image definition compatible with current SST

- [ ] **Step 1: Inspect manifest ownership before installation**

Run:

```sh
git diff -- package.json pnpm-lock.yaml pnpm-workspace.yaml infra/package.json infra/package-lock.json Dockerfile.production Dockerfile.production-base
```

Expected: root React/Blueprint/Vitest upgrades come from PR #791; `infra/package.json`, `infra/package-lock.json`, `pnpm-workspace.yaml`, and `.rspec` match `c4151711`; the production Dockerfiles contain the application build changes but no PR deployment orchestration.

- [ ] **Step 2: Regenerate the root lockfile against the preserved workspace**

Run:

```sh
corepack pnpm install --lockfile-only
corepack pnpm install --frozen-lockfile
npm --prefix infra ci
```

Expected: all commands exit 0, `pnpm-lock.yaml` reflects React 19/Blueprint 6 and the preserved infra importer, and `infra/package-lock.json` remains unchanged.

- [ ] **Step 3: Verify the production Docker entry point still matches current SST**

Run:

```sh
rg -n "Dockerfile.production|Dockerfile.production-base|docker build" infra scripts .github/workflows
git diff c4151711 -- infra scripts/deploy-sst.sh scripts/lib .github/workflows
```

Expected: the first command shows the current SST build entry point can consume the imported Dockerfile structure; the second command prints no diff.

- [ ] **Step 4: Run static configuration checks**

Run:

```sh
git diff --check
pnpm exec eslint app/javascript
pnpm exec stylelint "app/assets/stylesheets/**/*.scss" "app/assets/stylesheets/**/*.css"
bundle exec rubocop --fail-level error
```

Expected: all commands exit 0. Fix upgrade-caused errors without weakening existing lint rules unless PR #791 already documents and tests the rule change.

- [ ] **Step 5: Create a temporary integration commit**

Run:

```sh
git add --all
git commit -m "feat: integrate React 19 app with stable SST"
```

Expected: the squash merge and all reconciliations are recoverable in a temporary implementation commit.

---

### Task 5: Run the complete local verification gate

**Files:**
- Verify: `scripts/ci/*.test.mjs`
- Verify: `app/javascript/**`
- Verify: `spec/**`
- Verify: `infra/**`
- Verify: `Dockerfile.production`, `Dockerfile.production-base`

**Interfaces:**
- Consumes: reconciled application tree and dependency graph
- Produces: local evidence that the exact candidate commit is buildable, testable, and deployable

- [ ] **Step 1: Run CI tooling and frontend tests**

Run:

```sh
node --test scripts/ci/*.test.mjs
pnpm test
```

Expected: CI unit tests pass; Vitest passes the PR suite plus the preserved OAuth test. PR #791's baseline was 98 passed and 3 skipped before the preserved test was added.

- [ ] **Step 2: Start isolated local data services**

Run:

```sh
docker compose up -d db redis
docker compose ps
```

Expected: PostgreSQL and Redis report running/healthy before Rails tests.

- [ ] **Step 3: Prepare the test database and run the full Rails suite**

Run:

```sh
RAILS_ENV=test DATABASE_URL=postgres://gala:alpine@localhost:5432/gala_test bundle exec rails db:prepare
RAILS_ENV=test DATABASE_URL=postgres://gala:alpine@localhost:5432/gala_test bundle exec rspec --format progress --color
RAILS_ENV=test DATABASE_URL=postgres://gala:alpine@localhost:5432/gala_test bundle exec rake factory_bot:lint
```

Expected: database preparation, the full RSpec suite, and factory lint all exit 0.

- [ ] **Step 4: Run the production asset build locally**

Run:

```sh
RAILS_ENV=production SECRET_KEY_BASE_DUMMY=1 bundle exec rails assets:precompile
```

Expected: webpack/Shakapacker production compilation exits 0. Record but do not treat PR #791's two known bundle-size warnings as failures.

- [ ] **Step 5: Run the preserved infrastructure contract suite**

Run:

```sh
npm --prefix infra test
npm --prefix infra run check
ruby scripts/ops/test-sst-dev-runtime-contracts.rb
ruby scripts/ops/test-sst-module-boundaries.rb
ruby scripts/ops/test-workflow-architecture-defaults.rb
```

Expected: every current SST, type, module-boundary, runtime, and workflow contract passes without AWS mutation.

- [ ] **Step 6: Build the production image locally**

Run:

```sh
docker build --platform linux/arm64 --file Dockerfile.production --tag gala:react19-stable-sst .
docker image inspect gala:react19-stable-sst
```

Expected: ARM64 production image build and inspection exit 0.

- [ ] **Step 7: Run local HTTP and Playwright smoke checks**

Run:

```sh
docker compose up -d --build
curl --fail --show-error --silent http://localhost:3000/up
PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm test:smoke
```

Expected: `/up` responds successfully and the preserved authenticated catalog/media smoke suite passes. Diagnose any environmental credential skip separately from application failures.

- [ ] **Step 8: Recheck protected paths after all fixes**

Run:

```sh
git diff c4151711 -- .github/workflows infra scripts/ci scripts/lib scripts/ops scripts/deploy-sst.sh scripts/read-platform-constant.mjs scripts/scan-staged-secrets docs/agent-playbooks docs/ops docs/releases RELEASE.md ANALYTICS.md bin/docker-clean-repl bin/ecs-web-repl bin/sst-db config/initializers/active_storage_cors.rb spec/requests/active_storage_cors_spec.rb
```

Expected: no output.

---

### Task 6: Normalize the branch into one verified commit

**Files:**
- Include: approved design, implementation plan, application integration, dependency reconciliation, and test adjustments

**Interfaces:**
- Consumes: all temporary planning and implementation commits above `c4151711`
- Produces: exactly one release-candidate commit with parent `c4151711`

- [ ] **Step 1: Confirm verification fixes are committed temporarily**

Run:

```sh
git status --short
git add --all
git commit -m "test: verify React 19 stable SST integration"
```

Expected: either a temporary verification commit is created or Git reports nothing to commit after a clean status.

- [ ] **Step 2: Fold all temporary commits into the final commit**

Run:

```sh
git reset --soft c4151711
git diff --cached --check
git commit -m "feat: run React 19 app on stable SST infrastructure"
```

Expected: one commit contains the complete approved result.

- [ ] **Step 3: Prove final history and source-branch safety**

Run:

```sh
git rev-list --count c4151711..HEAD
git rev-parse HEAD^
git rev-parse oauth/staged-google-key-rotation
test ! -e CODEOWNERS
git status --short --branch
```

Expected:

```text
1
c4151711102e39aa1c649e014d55f37d761064ed
c4151711102e39aa1c649e014d55f37d761064ed
```

The status line must show a clean `integration/react19-stable-sst` checkout.
The `test` command must exit 0, proving the final commit has no root
`CODEOWNERS` file.

- [ ] **Step 4: Re-run immutable candidate checks after history normalization**

Run:

```sh
git diff --check c4151711..HEAD
pnpm test
npm --prefix infra test
npm --prefix infra run check
```

Expected: all checks exit 0 against the exact final commit.

---

### Task 7: Review and deploy only the durable dev stage

**Files:**
- Execute from: `infra/`
- Verify against: `https://dev.learngala.dev`

**Interfaces:**
- Consumes: exact verified single commit and AWS profile `gala`
- Produces: reviewed SST dev diff, deployed application, and post-deploy evidence

- [ ] **Step 1: Confirm AWS identity and explicit stage variables**

Run:

```sh
AWS_PROFILE=gala aws sts get-caller-identity
AWS_PROFILE=gala SST_STAGE=dev aws configure get region
```

Expected: authenticated Gala AWS identity and region `us-west-2`. Stop if the account or region is unexpected.

- [ ] **Step 2: Generate the dev SST diff without mutation**

Run from `infra/`:

```sh
AWS_PROFILE=gala SST_STAGE=dev npx sst diff --stage dev
```

Expected: stage is `dev`. Review every operation. Stop on unexpected replacements/deletions, `msc-gala` or SES ownership/lifecycle operations, production references, or control-plane drift. Application image/release updates and expected dev runtime changes are acceptable.

- [ ] **Step 3: Deploy the reviewed candidate to dev**

Run from `infra/`:

```sh
AWS_PROFILE=gala SST_STAGE=dev npx sst deploy --stage dev
```

Expected: deployment exits 0 and reports only the durable dev stage outputs.

- [ ] **Step 4: Verify health and application assets**

Run:

```sh
curl --fail --show-error --silent https://dev.learngala.dev/up
curl --fail --show-error --silent --location --output /dev/null --write-out 'status=%{http_code} url=%{url_effective}\n' https://dev.learngala.dev
GALA_BASE_URL=https://dev.learngala.dev pnpm test:invariants
```

Expected: `/up` succeeds, the application resolves with HTTP 200, and Blueprint theme/asset invariants pass.

- [ ] **Step 5: Run the deployed smoke suite**

Run:

```sh
PLAYWRIGHT_BASE_URL=https://dev.learngala.dev pnpm test:smoke
```

Expected: deployed catalog/auth/media smoke checks pass. If credentials are absent, report the exact skipped authentication coverage and complete unauthenticated health/asset checks; do not claim authenticated verification.

- [ ] **Step 6: Record the deployed commit and final state**

Run:

```sh
git rev-parse HEAD
git log -1 --oneline --decorate
git status --short --branch
```

Expected: the deployed SHA is the single clean integration commit. Report local verification results, SST diff assessment, deploy output, dev URLs, and any benign warnings.
