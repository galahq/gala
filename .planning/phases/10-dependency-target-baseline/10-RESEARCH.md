# Phase 10: Dependency Target Baseline - Research

**Researched:** 2026-05-12
**Domain:** Ruby/Rails and Node dependency target policy
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use a conservative matrix: document latest compatible stable targets, explicitly hold React 16.8 and BlueprintJS 4.x, and make no dependency, package manager, lockfile, or build-runner changes in this phase.
- **D-02:** Treat Phase 10 as policy and target selection only. Later phases perform pnpm migration, Flow removal, Vitest/Vite spikes, Ruby updates, JavaScript updates, and visual regression setup.
- **D-03:** Dependency target selection should use current official registry or documentation data at implementation time. The matrix may include current checked values, but downstream implementation phases must re-check official sources before editing manifests or lockfiles.
- **D-04:** React remains on the current 16.8 line for v1.1. React major upgrades are deferred to v1.2+.
- **D-05:** BlueprintJS remains on the current 4.x line for v1.1. BlueprintJS major upgrades are deferred to v1.2+.
- **D-06:** Shakapacker/Webpack production behavior remains the default unless the Vite feasibility phase later proves replacement is safe.

### the agent's Discretion
The planner may choose the exact matrix file shape and columns, but it must keep the deliverable documentation-only and must not stage manifest or lockfile edits during this phase.

### Deferred Ideas (OUT OF SCOPE)
None - discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DEPS-01 | Dependency target selection uses current official registry/doc data at implementation time. | Use the registry verification command set and source URLs below; later phases must re-run them before edits. [VERIFIED: .planning/REQUIREMENTS.md, npm registry, RubyGems API, ruby-lang.org] |
| DEPS-02 | React remains on the current 16.8 line during v1.1. | React latest is 19.2.6, but v1.1 holds React to the 16.x line; latest React 16 registry release is 16.14.0. [VERIFIED: npm registry, .planning/phases/10-dependency-target-baseline/10-CONTEXT.md] |
| DEPS-03 | BlueprintJS remains on the current 4.x line during v1.1. | BlueprintJS latest majors are 6.x and require React 18, while BlueprintJS 4.x peers on React 16.8/17/18 depending on package/version. [VERIFIED: npm registry] |
| DEPS-04 | Any dependency intentionally held below latest is documented with the compatibility reason. | The matrix must include a holdback reason column and explicitly classify React, BlueprintJS, Shakapacker/Webpack production replacement, Flow removal, and major gem jumps. [VERIFIED: .planning/REQUIREMENTS.md, .planning/ROADMAP.md, .planning/phases/10-dependency-target-baseline/10-CONTEXT.md] |
</phase_requirements>

## Summary

Phase 10 should produce documentation only: a dependency target matrix plus verification policy, with no edits to `Gemfile`, `Gemfile.lock`, `package.json`, `yarn.lock`, pnpm config, test-runner config, or build tooling. [VERIFIED: .planning/phases/10-dependency-target-baseline/10-CONTEXT.md] The matrix should separate current resolved versions, latest registry/doc versions, v1.1 target versions, holdback reasons, downstream phase owner, and mandatory recheck command. [VERIFIED: .planning/ROADMAP.md, npm registry, RubyGems API]

The core framework stack is already near the current line: Rails 8.1.3 and Shakapacker 10.0.0 are current on RubyGems/npm as checked on 2026-05-12. [VERIFIED: RubyGems API, npm registry] Ruby official downloads now list Ruby 4.0.4 among stable releases, while the project pins Ruby 4.0.3 in `.ruby-version`; this should be recorded as a later Ruby update candidate, not changed here. [CITED: https://www.ruby-lang.org/en/downloads/] [VERIFIED: .ruby-version]

The main policy risk is frontend compatibility: React latest is 19.2.6 but v1.1 holds React to 16.x, and BlueprintJS latest 6.x packages require React 18 while the v1.1 hold is BlueprintJS 4.x. [VERIFIED: npm registry] Vitest, Vite, Playwright, TypeScript, and pnpm all have current versions compatible with Node 24 by registry engine data, but their adoption belongs to later phases. [VERIFIED: npm registry, .planning/ROADMAP.md]

**Primary recommendation:** create `.planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` as the phase deliverable, and make every row executable by including `current`, `latest checked`, `v1.1 target`, `holdback reason`, `phase owner`, `source`, and `recheck command`. [VERIFIED: .planning/ROADMAP.md, .planning/phases/10-dependency-target-baseline/10-CONTEXT.md]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Dependency target policy | Planning/docs | Package manifests | Phase 10 owns policy only; later phases edit manifests and lockfiles. [VERIFIED: 10-CONTEXT.md] |
| Ruby/Rails target selection | Backend/Rails | Planning/docs | Ruby, Rails, Puma, Sidekiq, and runtime gems affect Rails boot, requests, jobs, and tests. [VERIFIED: Gemfile, Gemfile.lock, .planning/codebase/ARCHITECTURE.md] |
| Node package manager target | Build tooling | Planning/docs | pnpm migration affects install and lockfile behavior, not runtime routes directly. [VERIFIED: package.json, .planning/ROADMAP.md] |
| Frontend test runner target | Build/test tooling | Browser/client | Vitest/Jest targets affect React component tests and transforms for `app/javascript`. [VERIFIED: jest.config.js, .planning/codebase/TESTING.md] |
| Production bundler policy | Build tooling | Rails views | Shakapacker/Webpack currently owns Rails pack compilation and Vite replacement is gated by a later spike. [VERIFIED: config/shakapacker.yml, package.json, .planning/codebase/ARCHITECTURE.md] |
| Visual regression target | Browser QA | Build/test tooling | Playwright visual tests exercise `localhost:3000` routes derived from `config/routes.rb` in later phases. [VERIFIED: AGENTS.md, .planning/REQUIREMENTS.md] |

## Project Constraints (from AGENTS.md)

- Work phases sequentially from `.planning/ROADMAP.md`. [VERIFIED: AGENTS.md]
- Use `config/routes.rb` as the source of truth for route coverage. [VERIFIED: AGENTS.md]
- Use `localhost:3000` for browser QA. [VERIFIED: AGENTS.md]
- Check browser console and network errors before marking a route group complete. [VERIFIED: AGENTS.md]
- Run targeted tests for touched files; listed commands are `yarn test`, `bundle exec rspec`, `./run-rspec.sh`, and `bundle exec rake test:unit`. [VERIFIED: AGENTS.md]
- Commit after each phase QA gate passes. [VERIFIED: AGENTS.md]
- Keep fixes narrow and route-driven; avoid broad redesigns or unrelated dependency upgrades. [VERIFIED: AGENTS.md]
- Current BlueprintJS packages are 4.x, but the visual compatibility target remains the prior BlueprintJS 2.3.1-era Gala experience. [VERIFIED: AGENTS.md]
- Be careful around global asset loading in `app/views/layouts/application.html.erb`, `app/assets/stylesheets/application.css`, `app/javascript/packs/styles.js`, and `app/javascript/shared/blueprintLegacyNamespace.js`. [VERIFIED: AGENTS.md]
- Avoid duplicating Blueprint CSS or adding route-specific shims before confirming a route group needs them. [VERIFIED: AGENTS.md]

## Standard Stack

### Core

| Library | Current | Latest Checked | v1.1 Target Policy | Why Standard |
|---------|---------|----------------|--------------------|--------------|
| Ruby | 4.0.3 | 4.0.4 stable download | Document 4.0.4 as candidate; no change in Phase 10 | Ruby runtime is pinned by `.ruby-version`; official downloads are the source for stable Ruby releases. [VERIFIED: .ruby-version] [CITED: https://www.ruby-lang.org/en/downloads/] |
| Rails | 8.1.3 | 8.1.3 | Hold current unless later Ruby/gem phase finds issue | Rails is the app framework and current on RubyGems. [VERIFIED: Gemfile.lock, RubyGems API] |
| Shakapacker gem/npm | 10.0.0 / 10.0.0 | 10.0.0 / 10.0.0 | Hold aligned at 10.0.0 | Rails pack integration uses Shakapacker; npm and gem versions are aligned. [VERIFIED: Gemfile.lock, package.json, RubyGems API, npm registry] |
| Webpack | 5.106.1 | 5.106.2 | Patch candidate for later JS phase | Shakapacker 10 peers on Webpack `^5.101.0`. [VERIFIED: npm registry] |
| pnpm | not active; project uses Yarn 1.22.22 | 11.1.0 | Target `pnpm@11.1.0` unless recheck changes it in Phase 11 | Current pnpm requires Node `>=22.13`, compatible with project Node 24.15.0. [VERIFIED: package.json, npm registry, .node-version] |
| TypeScript | infra only: 6.0.2 in codebase map | 6.0.3 | Use latest stable TypeScript for Phase 13 typing foundation | TypeScript supports incremental JS adoption through `allowJs` and `checkJs`. [VERIFIED: .planning/codebase/STACK.md, npm registry] [CITED: https://www.typescriptlang.org/tsconfig/allowJs.html] [CITED: https://www.typescriptlang.org/tsconfig/checkJs.html] |
| Vitest | absent | 4.1.6 | Candidate for Phase 12/16 spike, not installed here | Vitest is Vite-powered, Jest-compatible, and supports ESM/TypeScript/JSX; registry engines include Node 24. [CITED: https://main.vitest.dev/] [VERIFIED: npm registry] |
| Vite | absent | 8.0.12 | Spike only; production replacement gated | Vite requires Node 20.19+ or 22.12+, and official docs support pnpm commands. [CITED: https://vite.dev/guide/] [VERIFIED: npm registry] |
| Playwright Test | `playwright` 1.59.1 only | `@playwright/test` 1.60.0 | Target `@playwright/test` latest in Phase 17 | Playwright Test supports visual comparisons with screenshot snapshots. [VERIFIED: package.json, npm registry] [CITED: https://playwright.dev/docs/api/class-snapshotassertions] |
| React | package constraint `^16.8.6`, lock 16.12.0 | latest major 19.2.6; latest 16.x 16.14.0 | Hold the existing React 16 baseline for v1.1; record 16.14.0 as a Phase 15 candidate only | v1.1 explicitly keeps the current React 16.8-compatible line and defers any 16.x patch movement to Phase 15 route/test verification; React 19 is outside v1.1. [VERIFIED: package.json, yarn.lock, npm registry, 10-CONTEXT.md] |
| BlueprintJS | core 4.20.2, datetime 4.4.37, select 4.3.1 | latest major core 6.12.1/datetime 6.0.25/select 6.1.10 | Hold 4.x; consider `@blueprintjs/select` 4.9.24 only in later JS phase | BlueprintJS 6 peers require React 18, while 4.x packages peer on React 16.8-compatible ranges. [VERIFIED: npm registry, package.json] |

### Supporting

| Library | Current | Latest Checked | When to Use |
|---------|---------|----------------|-------------|
| Puma | 7.1.0 | 8.0.1 | Treat major jump as separate Phase 14 runtime verification item. [VERIFIED: Gemfile.lock, RubyGems API] |
| Sidekiq | 7.3.6 | 8.1.4 | Treat major jump as separate Phase 14 worker verification item. [VERIFIED: Gemfile.lock, RubyGems API] |
| pg | 1.5.9 | 1.6.3 | Patch/minor runtime DB adapter candidate for Phase 14. [VERIFIED: Gemfile.lock, RubyGems API] |
| redis | 5.3.0 | 5.4.1 | Patch/minor Redis client candidate for Phase 14. [VERIFIED: Gemfile.lock, RubyGems API] |
| Sentry gems | 5.28.1 | 6.5.0 | Major monitoring SDK jump; verify Rails request params handling and Sidekiq integration. [VERIFIED: Gemfile.lock, RubyGems API, .planning/codebase/CONCERNS.md] |
| Devise | 4.9.4 | 5.0.4 | Major auth gem jump; defer to focused auth route/spec gate. [VERIFIED: Gemfile.lock, RubyGems API] |
| RSpec Rails | 7.1.0 | 8.0.4 | Test stack update candidate after Rails compatibility check. [VERIFIED: Gemfile.lock, RubyGems API] |
| Capybara | 3.40.0 | 3.40.0 | Already current by RubyGems API. [VERIFIED: Gemfile.lock, RubyGems API] |
| Selenium WebDriver | 4.10.0 | 4.43.0 | Feature/browser spec tooling candidate; local Selenium has existing setup noise. [VERIFIED: Gemfile.lock, RubyGems API, .planning/STATE.md] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vitest | Modernized Jest 30 | Jest latest supports Node 24, but existing Jest 24 transform failures and Vite/Vitest research make Vitest the preferred spike path. [VERIFIED: npm registry, .planning/STATE.md, .planning/ROADMAP.md] |
| Shakapacker/Webpack production bundling | Vite production bundling | Vite is modern and Node-compatible, but Rails pack integration, CSS imports, static assets, and Blueprint compatibility layers require Phase 12 proof before replacement. [VERIFIED: .planning/ROADMAP.md, .planning/codebase/ARCHITECTURE.md] [CITED: https://vite.dev/guide/] |
| React 19 / BlueprintJS 6 | Current majors | Not compatible with v1.1 constraints; BlueprintJS 6 peer data requires React 18. [VERIFIED: npm registry, 10-CONTEXT.md] |

**Installation:** none in Phase 10. The phase must not run `bundle update`, `yarn add`, `pnpm add`, or edit lockfiles. [VERIFIED: 10-CONTEXT.md]

**Version verification commands:**

```bash
npm view pnpm typescript vitest vite @vitejs/plugin-react @playwright/test playwright shakapacker webpack webpack-cli webpack-dev-server react react-dom @blueprintjs/core @blueprintjs/datetime @blueprintjs/select version time.modified peerDependencies engines --json
curl -fsSL https://rubygems.org/api/v1/gems/rails.json
curl -fsSL https://rubygems.org/api/v1/gems/shakapacker.json
curl -fsSL https://rubygems.org/api/v1/gems/puma.json
curl -fsSL https://rubygems.org/api/v1/gems/sidekiq.json
curl -fsSL https://www.ruby-lang.org/en/downloads/
```

## Architecture Patterns

### System Architecture Diagram

```text
Official registries/docs
  | Ruby downloads, RubyGems API, npm registry, official tool docs
  v
Phase 10 evidence capture
  | current version, latest version, engine/peer constraints, source URL/date
  v
Dependency target matrix
  | decision: target / hold / spike / defer
  +--> Ruby Phase 14 update groups
  +--> pnpm Phase 11 migration
  +--> Vitest/Vite Phase 12 and 16 spikes
  +--> JS Phase 15 dependency updates
  +--> Playwright Phase 17 visual harness
  v
Later implementation phases re-run official checks before manifest or lockfile edits
```

### Recommended Project Structure

```text
.planning/phases/10-dependency-target-baseline/
├── 10-CONTEXT.md              # existing locked decisions
├── 10-RESEARCH.md             # this research
└── 10-DEPENDENCY-MATRIX.md    # Phase 10 planner should create this
```

### Pattern 1: Matrix Rows as Executable Policy

**What:** Each matrix row should be specific enough that a later phase can apply or reject it without rediscovering scope. [VERIFIED: .planning/ROADMAP.md]

**When to use:** Use for every dependency family in the success criteria: Ruby, Rails, pnpm, TypeScript, Vitest/Vite, Playwright, Shakapacker/Webpack, and key runtime gems. [VERIFIED: .planning/ROADMAP.md]

**Example:**

```markdown
| Package | Current | Latest checked | v1.1 target | Decision | Reason | Owner phase | Recheck |
|---------|---------|----------------|-------------|----------|--------|-------------|---------|
| @blueprintjs/core | 4.20.2 | 6.12.1 | 4.20.2 | hold | 6.x peers require React 18; v1.1 holds React 16.x | 15 | npm view @blueprintjs/core version peerDependencies --json |
```

### Pattern 2: Separate "Latest" from "Target"

**What:** The latest registry version is evidence, not automatically the target. [VERIFIED: .planning/REQUIREMENTS.md]

**When to use:** Use whenever latest is outside v1.1 compatibility constraints, such as React 19, BlueprintJS 6, Sidekiq 8, Puma 8, Devise 5, and Sentry 6. [VERIFIED: npm registry, RubyGems API, 10-CONTEXT.md]

### Anti-Patterns to Avoid

- **Changing lockfiles during baseline:** Phase 10 success is a documented target matrix, not an install or update. [VERIFIED: 10-CONTEXT.md]
- **Treating latest major as target by default:** Latest React/BlueprintJS versions violate v1.1 holds. [VERIFIED: npm registry, 10-CONTEXT.md]
- **Mixing Vitest and Vite decisions:** Vitest test-runner feasibility can proceed without Vite production bundler replacement. [VERIFIED: .planning/ROADMAP.md] [CITED: https://main.vitest.dev/]
- **Letting Shakapacker gem/npm drift:** The app currently pins both Shakapacker packages at 10.0.0; Phase 15 requires alignment. [VERIFIED: Gemfile.lock, package.json, .planning/REQUIREMENTS.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dependency version freshness | Manual web notes only | `npm view`, RubyGems API, official Ruby downloads | Registries provide machine-readable current versions and timestamps. [VERIFIED: npm registry, RubyGems API] |
| Package-manager pinning | Custom shell wrappers | `packageManager: "pnpm@..."` in later Phase 11 | Shakapacker and Corepack/pnpm workflows use package manager metadata; Phase 10 only documents target. [VERIFIED: package.json] [CITED: https://www.npmjs.com/package/shakapacker] |
| Visual regression comparisons | Custom screenshot diff scripts | Playwright Test `toHaveScreenshot`/snapshots | Playwright provides snapshot comparison APIs and configuration. [CITED: https://playwright.dev/docs/api/class-snapshotassertions] |
| JS incremental typing | Custom Flow replacement comments | TypeScript `allowJs`/`checkJs` plus JSDoc where needed | TypeScript officially supports JS files in TS projects and JS error checking. [CITED: https://www.typescriptlang.org/tsconfig/allowJs.html] [CITED: https://www.typescriptlang.org/tsconfig/checkJs.html] |

**Key insight:** the matrix is a control surface: document current evidence and constraints now, then force later phases to recheck before edits so the plan does not bake stale registry data into lockfile changes. [VERIFIED: 10-CONTEXT.md]

## Common Pitfalls

### Pitfall 1: "Latest" Means "Target"

**What goes wrong:** A later phase upgrades React or BlueprintJS major versions because registry latest is higher. [VERIFIED: npm registry]
**Why it happens:** Registry latest data is confused with milestone compatibility policy. [VERIFIED: 10-CONTEXT.md]
**How to avoid:** Add `decision` and `holdback reason` columns to the matrix. [VERIFIED: .planning/REQUIREMENTS.md]
**Warning signs:** Matrix rows have latest versions but no compatibility explanation. [ASSUMED]

### Pitfall 2: BlueprintJS 6 Requires a React Upgrade

**What goes wrong:** BlueprintJS 6 is selected while React remains 16.x. [VERIFIED: npm registry]
**Why it happens:** The package names are the same, but major peer dependencies changed; current `@blueprintjs/core@6.12.1` peers require React 18. [VERIFIED: npm registry]
**How to avoid:** Keep BlueprintJS at 4.x for v1.1 and record 6.x as v1.2+ only. [VERIFIED: 10-CONTEXT.md]
**Warning signs:** `package.json` diffs include `@blueprintjs/*` 6.x or `@types/react` 18/19 in v1.1. [VERIFIED: npm registry]

### Pitfall 3: Shakapacker/Webpack and Vite Replacement Get Coupled Too Early

**What goes wrong:** Vite test-runner work accidentally becomes production bundler replacement. [VERIFIED: .planning/ROADMAP.md]
**Why it happens:** Vitest reuses Vite pipelines, but Vite production replacement has different Rails integration risks. [CITED: https://main.vitest.dev/] [VERIFIED: .planning/codebase/ARCHITECTURE.md]
**How to avoid:** Matrix should mark Vitest as a Phase 12/16 test-runner candidate and Vite build replacement as Phase 12 spike-only unless proven. [VERIFIED: .planning/ROADMAP.md]
**Warning signs:** Phase 10 or 11 plan edits `config/shakapacker.yml`, `config/webpack/*`, or Rails view pack helpers. [VERIFIED: 10-CONTEXT.md]

### Pitfall 4: Local Tool Availability Is Misread

**What goes wrong:** Planner assumes host Ruby is project Ruby or assumes pnpm is usable before `packageManager` changes. [VERIFIED: local command probe]
**Why it happens:** Host `ruby` is 2.6.10, while project Ruby target is `.ruby-version` 4.0.3; `pnpm --version` currently errors because the project is configured to use Yarn. [VERIFIED: local command probe, .ruby-version, package.json]
**How to avoid:** Use Docker/project Ruby commands for implementation phases and treat pnpm activation as Phase 11 work. [VERIFIED: .planning/codebase/STACK.md, package.json]
**Warning signs:** Host `bundle exec` failures caused by Ruby mismatch, or `pnpm` refusing to run before `packageManager` is changed. [VERIFIED: local command probe]

## Code Examples

### Registry Snapshot Script

```bash
# Source: npm registry and RubyGems API
for p in pnpm typescript vitest vite @vitejs/plugin-react @playwright/test playwright shakapacker webpack webpack-cli webpack-dev-server react react-dom @blueprintjs/core @blueprintjs/datetime @blueprintjs/select; do
  npm view "$p" version time.modified peerDependencies engines --json
done

for g in rails shakapacker puma sidekiq pg redis sentry-ruby sentry-rails sentry-sidekiq devise pundit rspec-rails capybara selenium-webdriver; do
  curl -fsSL "https://rubygems.org/api/v1/gems/${g}.json"
done
```

### Holdback Reason Pattern

```markdown
| react | package ^16.8.6 / lock 16.12.0 | latest 19.2.6; latest 16.x 16.14.0 | hold 16.x | v1.1 keeps React 16.8 line; React major upgrade is v1.2+ |
```

## State of the Art

| Old Approach | Current Approach | When Checked | Impact |
|--------------|------------------|--------------|--------|
| Yarn 1 root package management | pnpm 11.1.0 target for Phase 11 | 2026-05-12 | Requires later `packageManager` and lockfile migration, not Phase 10 edits. [VERIFIED: package.json, npm registry, .planning/ROADMAP.md] |
| Jest 24 frontend tests | Vitest 4.1.6 spike preferred, Jest 30.4.2 fallback available | 2026-05-12 | Existing Jest transform failures should drive a focused runner spike. [VERIFIED: package.json, npm registry, .planning/STATE.md] |
| Flow 0.87 tooling | TypeScript 6.0.3 plus JSDoc/allowJs/checkJs path | 2026-05-12 | Flow removal is Phase 13; Phase 10 only documents TypeScript target. [VERIFIED: package.json, npm registry, .planning/ROADMAP.md] [CITED: https://www.typescriptlang.org/tsconfig/allowJs.html] |
| Playwright package only | `@playwright/test` 1.60.0 as visual regression runner target | 2026-05-12 | Phase 17 should add canonical Playwright Test config and snapshots. [VERIFIED: package.json, npm registry, .planning/REQUIREMENTS.md] [CITED: https://playwright.dev/docs/api/class-snapshotassertions] |
| Ruby 4.0.3 pin | Ruby 4.0.4 current stable listed by Ruby downloads | 2026-05-12 | Phase 14 should decide whether to move patch runtime. [VERIFIED: .ruby-version] [CITED: https://www.ruby-lang.org/en/downloads/] |

**Deprecated/outdated:**
- Flow tooling remains in `package.json`; v1.1 requires removal rather than upgrading Flow. [VERIFIED: package.json, .planning/REQUIREMENTS.md]
- Yarn 1 remains in `packageManager`; v1.1 requires pnpm migration. [VERIFIED: package.json, .planning/REQUIREMENTS.md]
- Jest 24 is active and full `yarn test --runInBand` is blocked by transform configuration failures. [VERIFIED: package.json, .planning/STATE.md]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Matrix rows without compatibility explanations are an early warning sign. | Common Pitfalls | Low; planner can still enforce holdback reason column from verified requirements. |

## Open Questions (RESOLVED)

1. **Should React patch target be 16.8.6, current lock 16.12.0, or latest 16.x 16.14.0?**
   - What we know: v1.1 must keep React on the 16.8 line, `package.json` allows `^16.8.6`, `yarn.lock` resolves React 16.12.0, and npm lists React 16.14.0 as latest 16.x. [VERIFIED: 10-CONTEXT.md, package.json, yarn.lock, npm registry]
   - RESOLVED: Phase 10 should not target a React manifest or lockfile change. The matrix should record the v1.1 target as the existing React 16 baseline (`package.json` `^16.8.6`, current lock 16.12.0) and list React 16.14.0 only as a Phase 15 candidate that requires route/component/visual verification before any later lockfile edit. React 19 remains outside v1.1. [VERIFIED: .planning/ROADMAP.md, npm registry]

2. **Should BlueprintJS `@blueprintjs/select` move from 4.3.1 to 4.9.24?**
   - What we know: `@blueprintjs/select@4.9.24` exists and peers on React 16.8/17/18, while latest select 6.1.10 is outside the 4.x hold. [VERIFIED: npm registry]
   - RESOLVED: Phase 10 should not target a BlueprintJS package change. The matrix should record `@blueprintjs/select@4.9.24` as a Phase 15 candidate within the 4.x hold, with visual QA against the BlueprintJS 2.3.1-era Gala target required before any later manifest/lockfile edit. BlueprintJS 6 remains outside v1.1 because its current peer dependencies require React 18. [VERIFIED: AGENTS.md, .planning/ROADMAP.md, npm registry]

3. **Should Ruby 4.0.4 be in v1.1?**
   - What we know: official Ruby downloads list Ruby 4.0.4, and the project pins Ruby 4.0.3. [CITED: https://www.ruby-lang.org/en/downloads/] [VERIFIED: .ruby-version]
   - RESOLVED: Phase 10 should not target a Ruby runtime change. The matrix should mark Ruby 4.0.4 as a Phase 14 candidate requiring Rails boot, targeted RSpec, Dockerfile/runtime image review, and deployment parity checks before changing `.ruby-version` or runtime images. [VERIFIED: .planning/ROADMAP.md, .planning/codebase/STACK.md]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node | npm registry checks and later JS phases | yes | 24.15.0 | Docker/project Node if host drifts. [VERIFIED: local command probe, .node-version] |
| npm | registry checks | yes | 11.12.1 | `curl` to npm registry JSON. [VERIFIED: local command probe] |
| Ruby host | RubyGems JSON parsing | yes, wrong for app | 2.6.10 | Use Docker/project Ruby for app commands. [VERIFIED: local command probe, .ruby-version] |
| Bundler | Ruby dependency inspection | yes | 2.4.19 | Docker `bundle` for app execution. [VERIFIED: local command probe, .planning/codebase/STACK.md] |
| Yarn | current JS workflow | yes | 1.22.22 | Phase 11 replaces with pnpm. [VERIFIED: local command probe, package.json] |
| pnpm | later package-manager migration | present but blocked by current manifest | command errors: project configured to use Yarn | Phase 11 changes `packageManager` before pnpm install. [VERIFIED: local command probe, package.json] |
| Corepack | package-manager dispatch | yes | 0.34.6 | Use explicit package manager install if needed later. [VERIFIED: local command probe] |
| Playwright CLI | later browser/visual checks | yes | 1.59.1 | Phase 17 should add `@playwright/test`. [VERIFIED: local command probe, package.json] |

**Missing dependencies with no fallback:** none for Phase 10 documentation work. [VERIFIED: local command probe]

**Missing dependencies with fallback:** project Ruby is not active on host; use Docker/project Ruby in implementation phases. [VERIFIED: local command probe, .planning/codebase/STACK.md]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | RSpec via `.rspec`; Jest 24 via `jest.config.js`; Phase 10 itself is documentation-only. [VERIFIED: .rspec, jest.config.js, .planning/codebase/TESTING.md] |
| Config file | `.rspec`, `jest.config.js` [VERIFIED: local file scan] |
| Quick run command | `rg -n "DEPS-01|React|Blueprint|pnpm|Ruby|Rails|Shakapacker" .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` [ASSUMED] |
| Full suite command | Not required for Phase 10 unless planner touches executable files; if touched accidentally, run targeted command for that file type. [VERIFIED: 10-CONTEXT.md, AGENTS.md] |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| DEPS-01 | Matrix includes current registry/doc checks and recheck commands. | documentation audit | `rg -n "npm view|rubygems.org|ruby-lang.org|Latest checked|Recheck" .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` | no, Wave 0 |
| DEPS-02 | React 16 hold is documented. | documentation audit | `rg -n "React.*16|react.*hold|React.*19" .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` | no, Wave 0 |
| DEPS-03 | BlueprintJS 4.x hold is documented. | documentation audit | `rg -n "BlueprintJS.*4|@blueprintjs.*hold|React 18" .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` | no, Wave 0 |
| DEPS-04 | Holdbacks include compatibility reasons. | documentation audit | `rg -n "holdback reason|compatibility reason|v1.2" .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` | no, Wave 0 |

### Sampling Rate

- **Per task commit:** documentation audit commands above. [ASSUMED]
- **Per wave merge:** no code suite required unless a plan violates documentation-only scope. [VERIFIED: 10-CONTEXT.md]
- **Phase gate:** `git diff -- Gemfile Gemfile.lock package.json yarn.lock pnpm-lock.yaml config/webpack config/shakapacker.yml jest.config.js` must show no manifest, lockfile, or build/test config edits. [VERIFIED: 10-CONTEXT.md]

### Wave 0 Gaps

- [ ] `.planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` - covers DEPS-01 through DEPS-04. [VERIFIED: .planning/ROADMAP.md]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes, indirectly | Devise target changes must be deferred to Phase 14 and gated by auth route/request specs. [VERIFIED: Gemfile.lock, RubyGems API, .planning/codebase/STACK.md] |
| V3 Session Management | yes, indirectly | Do not alter session/auth gems in Phase 10; document Devise 5 as a major candidate only. [VERIFIED: 10-CONTEXT.md, RubyGems API] |
| V4 Access Control | yes, indirectly | Pundit is current target family; no policy behavior changes in Phase 10. [VERIFIED: Gemfile.lock, RubyGems API] |
| V5 Input Validation | yes, indirectly | Dependency updates can change parser/request behavior; Phase 10 should flag runtime gems for later targeted tests. [VERIFIED: .planning/codebase/CONCERNS.md] |
| V6 Cryptography | yes, indirectly | Do not hand-roll crypto or auth changes; dependency updates should preserve framework/gem controls. [ASSUMED] |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Major auth gem jump changes login/session behavior | Spoofing/Elevation of Privilege | Treat Devise 5 as a focused Phase 14 candidate with reader route specs. [VERIFIED: RubyGems API, .planning/codebase/STACK.md] |
| Sentry captures unsafe request params | Information Disclosure | Keep Sentry major upgrade separate and verify filtered parameter behavior. [VERIFIED: .planning/codebase/CONCERNS.md, RubyGems API] |
| Dependency lockfile churn hides unrelated upgrades | Tampering | Phase 10 must not edit lockfiles; later phases use small groups and recheck commands. [VERIFIED: 10-CONTEXT.md, .planning/ROADMAP.md] |

## Sources

### Primary (HIGH confidence)

- npm registry via `npm view` - current versions, modified timestamps, engines, and peer dependencies for pnpm, TypeScript, Vitest, Vite, Playwright, Shakapacker, Webpack, Jest, React, and BlueprintJS. [VERIFIED: npm registry]
- RubyGems API - current gem versions and release timestamps for Rails, Shakapacker, Puma, Sidekiq, pg, redis, Sentry, Devise, Pundit, RSpec Rails, Capybara, Selenium WebDriver, and Administrate. [VERIFIED: RubyGems API]
- Ruby downloads page - stable Ruby releases including Ruby 4.0.4. [CITED: https://www.ruby-lang.org/en/downloads/]
- Vite guide - Node version requirement and pnpm command support. [CITED: https://vite.dev/guide/]
- Vitest home/docs - Vite-powered, Jest-compatible, ESM/TypeScript/JSX support. [CITED: https://main.vitest.dev/]
- TypeScript TSConfig docs - `allowJs` and `checkJs`. [CITED: https://www.typescriptlang.org/tsconfig/allowJs.html] [CITED: https://www.typescriptlang.org/tsconfig/checkJs.html]
- Playwright API docs - snapshot and screenshot comparison APIs. [CITED: https://playwright.dev/docs/api/class-snapshotassertions]
- Local project files: `AGENTS.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`, `.planning/codebase/STACK.md`, `.planning/codebase/TESTING.md`, `.planning/codebase/CONCERNS.md`, `.planning/codebase/ARCHITECTURE.md`, `Gemfile`, `Gemfile.lock`, `package.json`, `yarn.lock`, `.ruby-version`, `.node-version`. [VERIFIED: local files]

### Secondary (MEDIUM confidence)

- npm package page for Shakapacker package-manager behavior. [CITED: https://www.npmjs.com/package/shakapacker]

### Tertiary (LOW confidence)

- None. [VERIFIED: source list]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - versions were checked against npm registry, RubyGems API, Ruby official downloads, and local manifests. [VERIFIED: npm registry, RubyGems API, local files]
- Architecture: HIGH - phase is documentation-only and architecture constraints come from local planning/codebase docs. [VERIFIED: 10-CONTEXT.md, .planning/codebase/ARCHITECTURE.md]
- Pitfalls: MEDIUM - core compatibility pitfalls are verified; warning-sign heuristics include one assumption. [VERIFIED: npm registry, RubyGems API] [ASSUMED]

**Research date:** 2026-05-12
**Valid until:** 2026-05-19 for registry versions; recheck before any manifest or lockfile edit. [VERIFIED: 10-CONTEXT.md]
