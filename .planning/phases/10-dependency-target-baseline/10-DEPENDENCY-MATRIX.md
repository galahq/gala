# Phase 10: Dependency Target Baseline Matrix

**Phase goal:** Establish exact dependency targets, compatibility holds, and verification policy before changing lockfiles.
**Checked:** 2026-05-12
**Scope:** Documentation-only baseline for `DEPS-01`, `DEPS-02`, `DEPS-03`, and `DEPS-04`.

## No Change Boundary

- D-01: Phase 10 creates a conservative matrix only. It documents latest compatible stable targets, explicitly holds React 16.x and BlueprintJS 4.x, and makes no dependency, package manager, lockfile, or build-runner changes.
- D-02: Later phases own implementation: Phase 11 pnpm migration, Phase 12 Vitest/Vite feasibility, Phase 13 Flow removal and TypeScript/JSDoc foundation, Phase 14 Ruby dependency modernization, Phase 15 JavaScript dependency/build modernization, Phase 16 frontend test runner modernization, and Phase 17 Playwright visual regression coverage.
- D-06: Shakapacker/Webpack production behavior remains the default unless Phase 12 proves Vite replacement safe.

## Registry/Documentation Recheck Policy

DEPS-01 requires later implementation phases to re-check official sources immediately before editing manifests or lockfiles. The `Latest checked` column is evidence captured for planning, not permission to upgrade.

Recommended recheck commands:

```bash
npm view pnpm typescript vitest vite @playwright/test playwright shakapacker webpack webpack-cli webpack-dev-server react react-dom @blueprintjs/core @blueprintjs/datetime @blueprintjs/select version time.modified peerDependencies engines --json
curl -fsSL https://rubygems.org/api/v1/gems/rails.json
curl -fsSL https://rubygems.org/api/v1/gems/shakapacker.json
curl -fsSL https://rubygems.org/api/v1/gems/puma.json
curl -fsSL https://rubygems.org/api/v1/gems/sidekiq.json
curl -fsSL https://rubygems.org/api/v1/gems/pg.json
curl -fsSL https://rubygems.org/api/v1/gems/redis.json
curl -fsSL https://rubygems.org/api/v1/gems/devise.json
curl -fsSL https://rubygems.org/api/v1/gems/rspec-rails.json
curl -fsSL https://rubygems.org/api/v1/gems/capybara.json
curl -fsSL https://rubygems.org/api/v1/gems/selenium-webdriver.json
curl -fsSL https://www.ruby-lang.org/en/downloads/
```

## Matrix Schema

| Column | Meaning |
|--------|---------|
| Requirement | Requirement IDs this row supports. |
| Dependency family | Runtime, package manager, frontend framework, test runner, build tool, or support gem family. |
| Package | Package, gem, or runtime identifier. |
| Current | Current manifest/lock/runtime value. |
| Latest checked | Latest official registry/doc value checked on 2026-05-12. |
| v1.1 target | The target or hold policy for v1.1. |
| Decision | `hold`, `candidate`, `spike`, `current`, or `defer`. |
| Holdback reason | Compatibility reason when the target is below latest or gated. |
| Owner phase | Phase responsible for any later manifest/lock/runtime edit. |
| Source | Official source used for the latest/current evidence. |
| Recheck | Exact source command or URL to re-run before implementation. |

## Dependency Target Matrix

| Requirement | Dependency family | Package | Current | Latest checked | v1.1 target | Decision | Holdback reason | Owner phase | Source | Recheck |
|-------------|-------------------|---------|---------|----------------|-------------|----------|-----------------|-------------|--------|---------|
| DEPS-01, DEPS-04 | Ruby runtime | Ruby | `.ruby-version` 4.0.3 | 4.0.4 stable download | Keep 4.0.3 in Phase 10; Ruby 4.0.4 candidate | candidate | Runtime patch requires Rails boot, targeted RSpec, Dockerfile/runtime image review, and deployment parity checks before changing `.ruby-version`. | Phase 14 | ruby-lang.org downloads, `.ruby-version` | `curl -fsSL https://www.ruby-lang.org/en/downloads/` |
| DEPS-01 | Rails framework | rails | Gemfile.lock 8.1.3 | 8.1.3 | Keep 8.1.3 unless Phase 14 finds a compatibility issue | current | Already current on RubyGems at check time. | Phase 14 | RubyGems API, `Gemfile.lock` | `curl -fsSL https://rubygems.org/api/v1/gems/rails.json` |
| DEPS-01, DEPS-04 | Package manager | pnpm | Not active; `packageManager` uses Yarn 1.22.22 | 11.1.0 | Target `pnpm@11.1.0` unless Phase 11 recheck changes it | candidate | Package-manager migration needs lockfile parity and install/build/test verification. | Phase 11 | npm registry, `package.json` | `npm view pnpm version engines --json` |
| DEPS-01, DEPS-04 | Typing/tooling | typescript | Not active in package manifest; codebase map references TypeScript 6.0.2 infra | 6.0.3 | Use latest stable TypeScript during Flow removal foundation | candidate | Flow removal must establish incremental JS/JSDoc checks without destabilizing frontend builds. | Phase 13 | npm registry, `.planning/codebase/STACK.md` | `npm view typescript version engines --json` |
| DEPS-01, DEPS-04 | Frontend test runner | vitest | Absent | 4.1.6 | Preferred Phase 12/16 feasibility candidate | spike | Existing Jest 24 transform failures require a spike before replacing test runner commands. | Phase 12, Phase 16 | npm registry, ROADMAP | `npm view vitest version engines peerDependencies --json` |
| DEPS-01, DEPS-04 | Frontend build/test tooling | vite | Absent | 8.0.12 | Spike only; not production bundler default in Phase 10 | spike | Vite production replacement is gated by Rails/Shakapacker integration proof; Vitest can be evaluated separately. | Phase 12 | npm registry, Vite docs | `npm view vite version engines peerDependencies --json` |
| DEPS-01, DEPS-04 | Visual regression | @playwright/test | Absent; `playwright` devDependency is `^1.59.1` | 1.60.0 | Target latest `@playwright/test` in Phase 17 | candidate | Visual regression harness needs deterministic route selection and snapshot config. | Phase 17 | npm registry, Playwright docs | `npm view @playwright/test playwright version engines --json` |
| DEPS-01 | Build integration | shakapacker gem/npm | Gem 10.0.0; npm 10.0.0 | 10.0.0 | Keep gem/npm aligned at 10.0.0 | current | Already current and aligned at check time. | Phase 15 | RubyGems API, npm registry, `Gemfile.lock`, `package.json` | `curl -fsSL https://rubygems.org/api/v1/gems/shakapacker.json && npm view shakapacker version peerDependencies --json` |
| DEPS-01, DEPS-04 | Build integration | webpack | package 5.106.1 | 5.106.2 | Phase 15 patch candidate under Shakapacker 10 | candidate | Patch movement must preserve Shakapacker/Webpack production behavior and route assets. | Phase 15 | npm registry, `package.json`, `yarn.lock` | `npm view webpack version peerDependencies engines --json` |
| DEPS-02, DEPS-04 | Frontend framework | react | package `^16.8.6`; lock 16.12.0 | latest major 19.2.6; latest 16.x 16.14.0 | Hold existing React 16 baseline; 16.14.0 candidate only after Phase 15 verification | hold | D-04 keeps React on the current 16.8-compatible line for v1.1; React 19 is outside v1.1 and would require a future major upgrade phase. | Phase 15 | npm registry, `package.json`, `yarn.lock` | `npm view react@16 version --json && npm view react version peerDependencies engines --json` |
| DEPS-02, DEPS-04 | Frontend framework | react-dom | package `^16.8.6`; lock 16.12.0 | latest major 19.2.6; latest 16.x 16.14.0 | Hold with React 16 baseline; 16.14.0 candidate only after Phase 15 verification | hold | Must remain in lockstep with React and preserve React 16 route/component behavior. | Phase 15 | npm registry, `package.json`, `yarn.lock` | `npm view react-dom@16 version --json && npm view react-dom version peerDependencies engines --json` |
| DEPS-03, DEPS-04 | UI framework | @blueprintjs/core | 4.20.2 | 6.12.1 | Hold BlueprintJS 4.x | hold | D-05 keeps BlueprintJS on 4.x for v1.1; BlueprintJS 6 requires React 18 and is outside v1.1. | Phase 15 | npm registry, `package.json`, `yarn.lock` | `npm view @blueprintjs/core version peerDependencies engines --json` |
| DEPS-03, DEPS-04 | UI framework | @blueprintjs/datetime | 4.4.37 | 6.0.25 | Hold BlueprintJS 4.x | hold | Major upgrade belongs with React/Blueprint major compatibility work, not v1.1. | Phase 15 | npm registry, `package.json`, `yarn.lock` | `npm view @blueprintjs/datetime version peerDependencies engines --json` |
| DEPS-03, DEPS-04 | UI framework | @blueprintjs/select | 4.3.1 | latest major 6.1.10; latest 4.x 4.9.24 | Hold current in Phase 10; 4.9.24 candidate only with visual QA | hold | `@blueprintjs/select@4.9.24` peers on React 16.8/17/18, but Gala targets a BlueprintJS 2.3.1-era visual experience; any 4.x movement requires route visual QA. BlueprintJS 6 requires React 18 and is outside v1.1. | Phase 15 | npm registry, `package.json`, `yarn.lock`, AGENTS.md | `npm view @blueprintjs/select@4 version --json && npm view @blueprintjs/select version peerDependencies --json` |
| DEPS-01, DEPS-04 | Rails server | puma | 7.1.0 | 8.0.1 | Phase 14 candidate | candidate | Major runtime server jump requires boot, request, deployment, and concurrency checks. | Phase 14 | RubyGems API, `Gemfile.lock` | `curl -fsSL https://rubygems.org/api/v1/gems/puma.json` |
| DEPS-01, DEPS-04 | Jobs | sidekiq | 7.3.6 | 8.1.4 | Phase 14 candidate | candidate | Major worker jump needs job processing and Redis compatibility verification. | Phase 14 | RubyGems API, `Gemfile.lock` | `curl -fsSL https://rubygems.org/api/v1/gems/sidekiq.json` |
| DEPS-01 | Database adapter | pg | 1.5.9 | 1.6.3 | Phase 14 patch/minor candidate | candidate | DB adapter movement needs Rails DB test coverage. | Phase 14 | RubyGems API, `Gemfile.lock` | `curl -fsSL https://rubygems.org/api/v1/gems/pg.json` |
| DEPS-01 | Redis client | redis | 5.3.0 | 5.4.1 | Phase 14 patch/minor candidate | candidate | Redis client movement should be verified with Sidekiq/session/cache usage. | Phase 14 | RubyGems API, `Gemfile.lock` | `curl -fsSL https://rubygems.org/api/v1/gems/redis.json` |
| DEPS-01, DEPS-04 | Monitoring | sentry-ruby, sentry-rails, sentry-sidekiq | 5.28.1 | 6.5.0 | Phase 14 candidate | candidate | Major monitoring SDK jump needs request params and Sidekiq integration verification. | Phase 14 | RubyGems API, `Gemfile.lock` | `curl -fsSL https://rubygems.org/api/v1/gems/sentry-ruby.json` |
| DEPS-01, DEPS-04 | Authentication | devise | 4.9.4 | 5.0.4 | Phase 14 candidate, gated by auth route/spec checks | candidate | Auth major upgrade must preserve login/session/protected-route behavior. | Phase 14 | RubyGems API, `Gemfile.lock` | `curl -fsSL https://rubygems.org/api/v1/gems/devise.json` |
| DEPS-01, DEPS-04 | Ruby test stack | rspec-rails | 7.1.0 | 8.0.4 | Phase 14 candidate after Rails compatibility check | candidate | Test framework major movement should not be mixed into runtime gem updates without targeted suite verification. | Phase 14 | RubyGems API, `Gemfile.lock` | `curl -fsSL https://rubygems.org/api/v1/gems/rspec-rails.json` |
| DEPS-01 | Browser/spec support | capybara | 3.40.0 | 3.40.0 | Keep current | current | Already current on RubyGems at check time. | Phase 14 | RubyGems API, `Gemfile.lock` | `curl -fsSL https://rubygems.org/api/v1/gems/capybara.json` |
| DEPS-01, DEPS-04 | Browser/spec support | selenium-webdriver | 4.10.0 | 4.43.0 | Phase 14 candidate | candidate | Local Selenium setup has known noise; browser-spec tooling should move with focused verification. | Phase 14 | RubyGems API, `Gemfile.lock`, STATE.md | `curl -fsSL https://rubygems.org/api/v1/gems/selenium-webdriver.json` |

## Compatibility Holds

- DEPS-02: React remains on the existing React 16 baseline for v1.1. React 16.14.0 is a later Phase 15 candidate, not a Phase 10 target. React 19 is deferred to v1.2+.
- DEPS-03: BlueprintJS remains on 4.x for v1.1. `@blueprintjs/select@4.9.24` is a Phase 15 candidate requiring visual QA; BlueprintJS 6 is deferred because current 6.x packages require React 18.
- DEPS-04: Every row whose `Decision` is `hold`, `candidate`, or `spike` includes a compatibility reason and owner phase.

## Verification Checklist

Run these documentation audits after editing this matrix:

```bash
rg -n "npm view|rubygems.org|ruby-lang.org|Latest checked|Recheck" .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md
rg -n "DEPS-02|React.*16|React.*19|16.12.0|16.14.0" .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md
rg -n "DEPS-03|BlueprintJS.*4|4.9.24|BlueprintJS.*6|React 18|visual QA" .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md
rg -n "DEPS-04|Holdback reason|Owner phase|candidate|spike|hold" .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md
git diff -- Gemfile Gemfile.lock package.json yarn.lock pnpm-lock.yaml config/webpack config/shakapacker.yml jest.config.js
```

The final `git diff` command is a no-change audit. The executor for this phase may only modify `10-DEPENDENCY-MATRIX.md` and summary/planning closeout artifacts. Any manifest or lockfile diffs present during Phase 10 execution are pre-existing and must be reported, not normalized, edited, or reverted.
