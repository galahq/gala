# Phase 11: pnpm Package Manager Migration - Research

**Researched:** 2026-05-12 [VERIFIED: gsd init.phase-op]
**Domain:** Rails/Shakapacker JavaScript package-manager migration from Yarn 1 to pnpm 11 [VERIFIED: .planning/ROADMAP.md, package.json, Dockerfile]
**Confidence:** HIGH [VERIFIED: npm registry, pnpm docs, Node/Corepack docs, codebase grep]

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

No explicit locked decisions section beyond the implementation discretion and deferred scope below. [VERIFIED: .planning/phases/11-pnpm-package-manager-migration/11-CONTEXT.md]

### the agent's Discretion
- All implementation choices are at the agent's discretion because this is a pure infrastructure phase.
- Preserve the v1.1 compatibility holds from Phase 10: React remains on the existing React 16 baseline and BlueprintJS remains on 4.x.
- Use the Phase 10 matrix as the source for pnpm target policy: target `pnpm@11.1.0` unless official registry recheck during implementation changes the recommended compatible version.
- Do not combine pnpm migration with unrelated dependency upgrades, Flow removal, Vitest/Vite implementation, or Playwright visual regression setup.
- Treat any pre-existing `package.json` or `yarn.lock` diffs as user work unless the Phase 11 plan explicitly adopts them after reading the current diff.

### Deferred Ideas (OUT OF SCOPE)
- Flow removal and TypeScript/JSDoc foundation belong to Phase 13.
- Vitest/Vite feasibility belongs to Phase 12, with frontend test runner implementation in Phase 16.
- JavaScript dependency modernization belongs to Phase 15.
- Playwright visual regression setup belongs to Phase 17.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PNPM-01 | Node package management uses pnpm instead of Yarn 1. | Replace root Yarn metadata, root lockfile, Docker install command, Semaphore root install/cache commands, README commands, and bin wrapper assumptions with pnpm equivalents. [VERIFIED: .planning/REQUIREMENTS.md, rg yarn] |
| PNPM-02 | `package.json` declares a pinned pnpm package manager version compatible with Node 24. | Use `packageManager: "pnpm@11.1.0"` after rechecking `npm view pnpm version engines --json`; pnpm 11.1.0 declares `node >=22.13`, and pnpm docs list Node 24 support for pnpm 11. [VERIFIED: npm registry, CITED: https://pnpm.io/installation] |
| PNPM-03 | `pnpm-lock.yaml` is generated and committed after install/test parity is proven. | Generate lockfile from `yarn.lock` using `pnpm import`, verify with `pnpm install`, build, and test gates, then commit `pnpm-lock.yaml` and remove `yarn.lock` in the same verified migration commit. [CITED: https://pnpm.io/cli/import, CITED: https://pnpm.io/cli/install] |
| PNPM-04 | Yarn-specific scripts, docs, and lockfile assumptions are removed or replaced. | Known Yarn references are in `package.json`, `Dockerfile`, `README.md`, `.semaphore/semaphore.yml`, `bin/yarn`, commented Rails binstubs, docs, and `yarn.lock`. [VERIFIED: rg yarn] |
| PNPM-05 | Existing JavaScript build and test commands run through pnpm. | Existing test script is `NODE_ENV=test jest app/javascript`; use `pnpm test`, `pnpm exec jest ...`, and Rails/Shakapacker build gates through pnpm-backed `node_modules`. [VERIFIED: package.json, jest.config.js, CITED: https://pnpm.io/cli/run, CITED: https://pnpm.io/cli/exec] |
</phase_requirements>

## Summary

Phase 11 should be a narrow package-manager migration, not a dependency modernization phase. [VERIFIED: .planning/phases/11-pnpm-package-manager-migration/11-CONTEXT.md] The repo currently declares `packageManager: "yarn@1.22.22"` and `engines.yarn: "1.x"`, uses `yarn.lock`, installs Yarn globally in the Docker image, and caches `node_modules` against `yarn.lock` in Semaphore. [VERIFIED: package.json, Dockerfile, .semaphore/semaphore.yml]

The current official registry target is `pnpm@11.1.0`, modified 2026-05-11, with `engines.node >=22.13`; pnpm's current installation docs list pnpm 11 as compatible with Node 24. [VERIFIED: npm registry, CITED: https://pnpm.io/installation] The planner should require a recheck immediately before implementation, then pin `packageManager` to the exact pnpm version and replace `engines.yarn` with an exact or compatible `engines.pnpm` constraint. [VERIFIED: .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md, CITED: https://pnpm.io/package_json]

The highest-risk migration issue is not the lockfile syntax; it is pnpm's non-flat dependency layout exposing undeclared or hoisted dependency assumptions in legacy Webpack/Jest tooling. [CITED: https://pnpm.io/motivation] The plan should first try standard pnpm layout, verify install/build/test parity, and only introduce `.npmrc` settings such as `node-linker=hoisted` if a concrete failing tool requires Yarn-classic-style hoisting. [CITED: https://pnpm.io/motivation, CITED: https://pnpm.io/cli/install]

**Primary recommendation:** Use `pnpm@11.1.0` via `packageManager`, migrate with `pnpm import`, verify `pnpm install`, `bundle exec rails assets:precompile`, and `pnpm test`, then replace Yarn references and commit `pnpm-lock.yaml` with the proven migration. [VERIFIED: npm registry, CITED: https://pnpm.io/cli/import]

## Project Constraints (from AGENTS.md)

- Use GSD artifacts in `.planning/` as planning state. [VERIFIED: AGENTS.md]
- Active milestone is v1.0 Upgrade Stabilization/v1.1 dependency modernization context; start from `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`, and `.planning/codebase/`. [VERIFIED: AGENTS.md, .planning/PROJECT.md]
- Work phases sequentially from `.planning/ROADMAP.md`. [VERIFIED: AGENTS.md]
- Use `config/routes.rb` as source of truth for route coverage when route QA is needed. [VERIFIED: AGENTS.md]
- Use `localhost:3000` for browser QA when route-facing changes are verified. [VERIFIED: AGENTS.md]
- Check browser console and network errors before marking a route group complete. [VERIFIED: AGENTS.md]
- Run targeted tests for touched files; listed commands include `yarn test`, `bundle exec rspec`, `./run-rspec.sh`, and `bundle exec rake test:unit`, with Phase 11 expected to replace the Yarn command with pnpm. [VERIFIED: AGENTS.md, .planning/REQUIREMENTS.md]
- Commit after each phase QA gate passes. [VERIFIED: AGENTS.md]
- Keep fixes narrow and route-driven; avoid broad redesigns or unrelated dependency upgrades. [VERIFIED: AGENTS.md]
- Current BlueprintJS packages are 4.x while the visual compatibility target is the prior BlueprintJS 2.3.1-era Gala experience. [VERIFIED: AGENTS.md]
- Be careful around global asset loading files; avoid duplicate Blueprint CSS or route-specific shims without route evidence. [VERIFIED: AGENTS.md]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Package-manager selection | Build/Tooling | Developer environment | `package.json` `packageManager`, `engines`, and Corepack/pnpm install commands determine how root JavaScript dependencies are installed. [VERIFIED: package.json, CITED: https://nodejs.org/download/rc/v24.0.0-rc.2/docs/api/corepack.html] |
| Lockfile migration | Build/Tooling | CI | `yarn.lock` currently drives installs; `pnpm-lock.yaml` must become the committed root lockfile and CI cache key. [VERIFIED: yarn.lock, .semaphore/semaphore.yml] |
| JavaScript build parity | Frontend build pipeline | Rails server | Rails assets use Shakapacker/Webpack and depend on pnpm-backed `node_modules` during `assets:precompile`. [VERIFIED: Dockerfile, config/shakapacker.yml] |
| JavaScript test parity | Test tooling | Build/Tooling | The root `test` script runs Jest against `app/javascript`; pnpm should invoke the same script and binaries. [VERIFIED: package.json, jest.config.js, CITED: https://pnpm.io/cli/run] |
| CI/container install parity | CI/Docker | Build/Tooling | Dockerfile and Semaphore currently install/cache Yarn dependencies and must move to pnpm install semantics. [VERIFIED: Dockerfile, .semaphore/semaphore.yml] |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| pnpm | 11.1.0, modified 2026-05-11 | Root JavaScript package manager and lockfile owner | Latest registry version at research time; declares Node `>=22.13`; pnpm docs list pnpm 11 as Node 24-compatible. [VERIFIED: npm registry, CITED: https://pnpm.io/installation] |
| Corepack | 0.34.6 locally | Version-aware package-manager shim | Corepack reads nearest `package.json` `packageManager` and runs/downloads the requested supported package manager. [VERIFIED: local command, CITED: https://nodejs.org/download/rc/v24.0.0-rc.2/docs/api/corepack.html] |
| Node.js | 24.15.0 | Runtime for pnpm, Webpack, Jest, Shakapacker npm package | `.node-version`, Dockerfile, and package engines all target Node 24.x. [VERIFIED: .node-version, Dockerfile, package.json] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shakapacker npm package | 10.0.0 | Rails/Webpack JavaScript build integration | Keep unchanged; verify it still resolves binaries/loaders under pnpm. [VERIFIED: package.json, config/shakapacker.yml] |
| webpack | 5.106.1 | Asset bundler | Keep unchanged in Phase 11; build parity should prove pnpm did not change bundle behavior. [VERIFIED: package.json, .planning/phases/11-pnpm-package-manager-migration/11-CONTEXT.md] |
| jest | ^24.5.0 | Existing frontend test runner | Keep unchanged in Phase 11; preserve or document current known transform failures rather than modernizing the runner. [VERIFIED: package.json, .planning/STATE.md] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `packageManager: "pnpm@11.1.0"` | `devEngines.packageManager` range | pnpm 11 supports `devEngines.packageManager`, but PNPM-02 asks for a pinned package manager declaration; use exact `packageManager` now. [CITED: https://pnpm.io/package_json, VERIFIED: .planning/REQUIREMENTS.md] |
| Standard pnpm symlink layout | `.npmrc` `node-linker=hoisted` | Hoisted layout mimics npm/Yarn Classic for tooling that fails with symlinks, but pnpm docs frame it as a fallback when tooling has symlink problems. [CITED: https://pnpm.io/motivation] |
| Fresh `pnpm install` resolution | `pnpm import` from `yarn.lock` | `pnpm import` is better for parity because it generates `pnpm-lock.yaml` from the existing Yarn lockfile. [CITED: https://pnpm.io/cli/import] |

**Installation:**
```bash
npm view pnpm version time.modified engines --json
corepack enable pnpm
corepack use pnpm@11.1.0
pnpm import
pnpm install
```
[VERIFIED: npm registry, CITED: https://pnpm.io/installation, CITED: https://pnpm.io/cli/import]

**Version verification:** `npm view pnpm version time.modified engines dist-tags --json` returned version `11.1.0`, modified `2026-05-11T18:47:59.229Z`, with `engines.node: ">=22.13"`. [VERIFIED: npm registry]

## Architecture Patterns

### System Architecture Diagram

```text
Developer / CI / Docker build
        |
        v
package.json packageManager + engines
        |
        v
Corepack/pnpm 11.1.0 selected
        |
        v
pnpm import reads yarn.lock  --->  pnpm-lock.yaml generated
        |
        v
pnpm install creates pnpm node_modules layout
        |
        +--> Rails/Shakapacker assets:precompile
        |
        +--> pnpm test / pnpm exec jest
        |
        +--> Semaphore cache/install and Docker image build
        |
        v
If parity passes: remove yarn.lock/Yarn docs/bin assumptions and commit
If parity fails: diagnose undeclared dependency/hoist issue before lockfile commit
```
[VERIFIED: package.json, Dockerfile, .semaphore/semaphore.yml, CITED: https://pnpm.io/cli/import]

### Recommended Project Structure

```text
.
├── package.json          # packageManager pnpm pin, engines.node, engines.pnpm, scripts
├── pnpm-lock.yaml        # committed after parity, replaces yarn.lock
├── Dockerfile            # installs/enables pnpm and copies pnpm-lock.yaml
├── .semaphore/
│   └── semaphore.yml     # pnpm install/cache keys for root JavaScript deps
├── README.md             # pnpm developer commands
├── docs/                 # Yarn references replaced where root package manager is discussed
└── bin/                  # remove or replace Yarn binstub assumptions
```
[VERIFIED: rg yarn, ls]

### Pattern 1: Pin Package Manager via Corepack

**What:** Declare exact `packageManager: "pnpm@11.1.0"` and replace `engines.yarn` with `engines.pnpm` after rechecking the registry. [VERIFIED: npm registry, package.json]

**When to use:** Use for the root app package because PNPM-02 requires a pinned package manager compatible with Node 24. [VERIFIED: .planning/REQUIREMENTS.md]

**Example:**
```json
{
  "packageManager": "pnpm@11.1.0",
  "engines": {
    "node": ">=24 <25",
    "pnpm": "11.1.0"
  }
}
```
[CITED: https://pnpm.io/package_json, CITED: https://nodejs.org/download/rc/v24.0.0-rc.2/docs/api/corepack.html]

### Pattern 2: Import Then Verify

**What:** Generate `pnpm-lock.yaml` from the current `yarn.lock`, then install and run parity gates before finalizing lockfile replacement. [CITED: https://pnpm.io/cli/import]

**When to use:** Use when migrating an existing Yarn-locked application where minimizing dependency drift matters. [VERIFIED: .planning/phases/11-pnpm-package-manager-migration/11-CONTEXT.md]

**Example:**
```bash
pnpm import
pnpm install
pnpm test -- --runInBand
bundle exec rails assets:precompile
```
[CITED: https://pnpm.io/cli/import, CITED: https://pnpm.io/cli/install, VERIFIED: package.json]

### Pattern 3: CI Uses Frozen Lockfile

**What:** After `pnpm-lock.yaml` exists, CI install should use `pnpm install --frozen-lockfile`; pnpm defaults frozen lockfile to true in CI when a lockfile is present. [CITED: https://pnpm.io/cli/install]

**When to use:** Use in Semaphore and Docker/CI verification after lockfile parity is proven. [VERIFIED: .semaphore/semaphore.yml]

**Example:**
```bash
corepack enable pnpm
pnpm install --frozen-lockfile
pnpm test
```
[CITED: https://pnpm.io/installation, CITED: https://pnpm.io/cli/install]

### Anti-Patterns to Avoid

- **Mixing dependency upgrades into lockfile migration:** React, BlueprintJS, Flow, Vitest, Vite, and Playwright setup changes are explicitly deferred or held outside Phase 11. [VERIFIED: .planning/phases/11-pnpm-package-manager-migration/11-CONTEXT.md]
- **Deleting `yarn.lock` before parity:** PNPM-03 requires `pnpm-lock.yaml` to be committed only after install/test parity is proven. [VERIFIED: .planning/REQUIREMENTS.md]
- **Adding `node-linker=hoisted` preemptively:** Use the default pnpm layout first; hoisting should be justified by a concrete failing tool. [CITED: https://pnpm.io/motivation]
- **Leaving CI cache keyed to `yarn.lock`:** Semaphore currently restores/stores `node_modules` with `checksum yarn.lock`, which will be stale after migration. [VERIFIED: .semaphore/semaphore.yml]
- **Using global Yarn install in Docker:** Dockerfile currently runs `npm install -g yarn@1.22.22`; replace with Corepack/pnpm setup. [VERIFIED: Dockerfile]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Lockfile conversion | Manual YAML lockfile editing | `pnpm import` | Official command reads `yarn.lock` and generates `pnpm-lock.yaml`. [CITED: https://pnpm.io/cli/import] |
| Package-manager version dispatch | Custom `bin/pnpm` shim | Corepack + `packageManager` | Corepack already selects the requested package manager from `package.json`. [CITED: https://nodejs.org/download/rc/v24.0.0-rc.2/docs/api/corepack.html] |
| Running local dependency binaries | Hard-coded `node_modules/.bin/...` paths | `pnpm run` or `pnpm exec` | pnpm adds `node_modules/.bin` to script/exec PATH. [CITED: https://pnpm.io/cli/run, CITED: https://pnpm.io/cli/exec] |
| Yarn-like hoist emulation | Manual symlinks or copied packages | `.npmrc` `node-linker=hoisted` only if needed | pnpm documents hoisted node linker as the compatibility fallback for symlink-hostile tooling. [CITED: https://pnpm.io/motivation] |

**Key insight:** The planner should preserve the existing dependency graph first and fix only migration-caused resolution/install problems; Phase 15 owns dependency modernization. [VERIFIED: .planning/ROADMAP.md]

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Stored data | None found; package-manager state is file/build-tool state, not app database state. [VERIFIED: phase scope, rg yarn] | None. [VERIFIED: phase scope] |
| Live service config | Semaphore CI references Yarn install/cache commands and `checksum yarn.lock`; GitHub deploy workflow uses npm only under `infra/` and is not root package-manager state. [VERIFIED: .semaphore/semaphore.yml, .github/workflows/deploy.yml] | Update Semaphore root JavaScript install/cache to pnpm and keep `infra/` npm workflow unchanged. [VERIFIED: infra/package-lock.json, infra/package.json] |
| OS-registered state | No systemd/launchd/pm2 registrations found in repo; local `node_modules` currently exists and was created under Yarn-era layout. [VERIFIED: ls, rg pm2/systemd/launchd] | Planner should include reinstall/clean step for `node_modules` when switching package manager. [CITED: https://pnpm.io/cli/install] |
| Secrets/env vars | No root npm auth file found; pnpm auth docs warn auth files contain sensitive credentials and should not be committed. [VERIFIED: find .npmrc, CITED: https://pnpm.io/npmrc] | Do not add committed auth tokens; if private registry config appears, keep credentials outside git. [CITED: https://pnpm.io/npmrc] |
| Build artifacts | Root `node_modules/` exists; Docker layers and Semaphore caches are keyed to Yarn assumptions; `yarn.lock` is the committed lockfile. [VERIFIED: ls, Dockerfile, .semaphore/semaphore.yml] | Regenerate install with pnpm, update cache keys to `pnpm-lock.yaml`, and replace `yarn.lock` only after gates pass. [VERIFIED: .planning/REQUIREMENTS.md] |

## Common Pitfalls

### Pitfall 1: Hidden Hoisted Dependencies

**What goes wrong:** Legacy Webpack/Jest loaders may import transitive packages that Yarn Classic hoisted but pnpm does not expose as direct dependencies. [CITED: https://pnpm.io/motivation]

**Why it happens:** pnpm only links direct dependencies to the project root by default, while Yarn Classic hoists packages to root `node_modules`. [CITED: https://pnpm.io/motivation]

**How to avoid:** Run standard pnpm first, use `pnpm why <package>` to trace dependency ownership, add missing direct dependencies only if imports are legitimate, and use `node-linker=hoisted` only for concrete tooling incompatibility. [CITED: https://pnpm.io/cli/why, CITED: https://pnpm.io/motivation]

**Warning signs:** `MODULE_NOT_FOUND`, loader resolution failures, Jest transform failures that differ from the known pre-existing ESM transform issue, or Shakapacker missing loader/plugin errors. [VERIFIED: .planning/STATE.md, package.json]

### Pitfall 2: CI Frozen Lockfile Failure

**What goes wrong:** CI install fails if `pnpm-lock.yaml` does not match `package.json`. [CITED: https://pnpm.io/cli/install]

**Why it happens:** pnpm uses frozen lockfile behavior by default in CI when a lockfile is present. [CITED: https://pnpm.io/cli/install]

**How to avoid:** Generate/update the lockfile before CI config changes land and verify with `pnpm install --frozen-lockfile`. [CITED: https://pnpm.io/cli/install]

**Warning signs:** CI errors saying the lockfile is out of sync or needs an update. [CITED: https://pnpm.io/cli/install]

### Pitfall 3: Docker Still Installing Yarn

**What goes wrong:** The image build keeps global Yarn and runs `yarn install --check-files`, so local host migration passes while container builds still use Yarn. [VERIFIED: Dockerfile]

**Why it happens:** Dockerfile copies `yarn.lock` and installs Yarn in the base layer. [VERIFIED: Dockerfile]

**How to avoid:** Replace global Yarn install with Corepack/pnpm setup, copy `pnpm-lock.yaml`, and run `pnpm install --frozen-lockfile`. [CITED: https://pnpm.io/installation, CITED: https://pnpm.io/cli/install]

**Warning signs:** Docker build logs show `yarn`, or Docker cache keys still include `yarn.lock`. [VERIFIED: Dockerfile]

### Pitfall 4: Treating Infra npm as Root Yarn Cleanup

**What goes wrong:** The planner might convert `infra/package-lock.json` or GitHub SST deploy workflow unnecessarily. [VERIFIED: infra/package.json, .github/workflows/deploy.yml]

**Why it happens:** Repo-wide searches show npm commands under `infra/`, but Phase 11 targets the root Rails/Shakapacker app package manager. [VERIFIED: .planning/phases/11-pnpm-package-manager-migration/11-CONTEXT.md]

**How to avoid:** Leave `infra/` npm workflow untouched unless a root package-manager command actually crosses into it. [VERIFIED: infra/package-lock.json]

**Warning signs:** Diffs under `infra/package-lock.json` or `.github/workflows/deploy.yml` unrelated to root pnpm migration. [VERIFIED: git status, .github/workflows/deploy.yml]

## Code Examples

### Manifest Pin

```json
{
  "packageManager": "pnpm@11.1.0",
  "engines": {
    "node": ">=24 <25",
    "pnpm": "11.1.0"
  },
  "scripts": {
    "test": "NODE_ENV=test jest app/javascript"
  }
}
```
[VERIFIED: package.json, npm registry, CITED: https://pnpm.io/package_json]

### Migration Command Sequence

```bash
npm view pnpm version time.modified engines --json
corepack enable pnpm
corepack use pnpm@11.1.0
pnpm import
pnpm install
pnpm test -- --runInBand
bundle exec rails assets:precompile
pnpm install --frozen-lockfile
```
[VERIFIED: npm registry, CITED: https://pnpm.io/installation, CITED: https://pnpm.io/cli/import, CITED: https://pnpm.io/cli/install]

### Semaphore Shape

```yaml
- sem-version node 24.15.0
- corepack enable pnpm
- cache restore node-modules-$SEMAPHORE_GIT_BRANCH-$(checksum pnpm-lock.yaml)
- pnpm install --frozen-lockfile
- cache store node-modules-$SEMAPHORE_GIT_BRANCH-$(checksum pnpm-lock.yaml) node_modules
```
[VERIFIED: .semaphore/semaphore.yml, CITED: https://pnpm.io/cli/install]

### Docker Shape

```dockerfile
RUN npm install --global corepack@latest \
    && corepack enable pnpm \
    && corepack prepare pnpm@11.1.0 --activate \
    && node --version \
    && npm --version \
    && pnpm --version

COPY .ruby-version Gemfile Gemfile.lock package.json pnpm-lock.yaml ./

RUN bundle install --jobs 20 --retry 2 \
    && pnpm install --frozen-lockfile \
    && rm -rf ~/.bundle/ $BUNDLE_PATH/ruby/*/cache $BUNDLE_PATH/ruby/*/bundler/gems/*/.git
```
[VERIFIED: Dockerfile, CITED: https://pnpm.io/installation, CITED: https://pnpm.io/cli/install]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Yarn 1 declared via `packageManager` and `engines.yarn` | pnpm 11 exact pin via `packageManager` and `engines.pnpm` | Phase 11 planned for 2026-05-12 | Root install, scripts, docs, Docker, and Semaphore move to pnpm. [VERIFIED: package.json, .planning/ROADMAP.md] |
| Yarn lockfile as root install source | `pnpm-lock.yaml` generated from `yarn.lock` with `pnpm import` | pnpm import documented for pnpm 11 | Lockfile migration should preserve dependency resolution as much as possible. [CITED: https://pnpm.io/cli/import] |
| Global Yarn install in Docker | Corepack/pnpm setup in Docker | pnpm docs current for 11.x recommend Corepack or npm install paths | Image no longer depends on Yarn 1. [CITED: https://pnpm.io/installation, VERIFIED: Dockerfile] |
| `yarn test` | `pnpm test` | Phase 11 | Same package script, different runner invocation. [VERIFIED: package.json, CITED: https://pnpm.io/cli/run] |

**Deprecated/outdated:**
- Yarn 1 root workflow: out of scope for v1.1 after PNPM-01; replace root usage with pnpm. [VERIFIED: .planning/REQUIREMENTS.md]
- `npm install yarn` README setup: replace with Corepack/pnpm setup. [VERIFIED: README.md, CITED: https://pnpm.io/installation]
- `bin/yarn`: remove or replace because root scripts should call `pnpm`; Shakapacker binstubs do not require Yarn directly. [VERIFIED: bin/yarn, bin/shakapacker]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Existing Jest failures should be preserved or documented rather than fixed in Phase 11. [ASSUMED] | Standard Stack, Validation Architecture | Planner may under-test if Phase 11 unexpectedly requires repairing Jest to prove parity; mitigate by comparing pnpm failures to the known Yarn baseline. |
| A2 | Standard pnpm node_modules layout will probably work for Shakapacker/Webpack after missing direct dependencies are addressed. [ASSUMED] | Summary, Pitfalls | Planner may need a fallback `.npmrc` `node-linker=hoisted` task if legacy tooling breaks on symlinks. |

## Open Questions (RESOLVED)

1. **Should pre-existing `package.json`/`yarn.lock` diffs be adopted into the pnpm migration commit?**
   - What we know: Current diff changes `test` to set `NODE_ENV=test` and adds `playwright`; Phase 10 summary says these diffs were pre-existing. [VERIFIED: git diff, .planning/phases/10-dependency-target-baseline/10-01-SUMMARY.md]
   - What's unclear: Whether the user intends these diffs to be part of Phase 11 or preserved separately. [ASSUMED]
   - Recommendation: Planner should start with an explicit diff-read task and either include the changes as accepted baseline or keep them untouched while migrating. [VERIFIED: .planning/phases/11-pnpm-package-manager-migration/11-CONTEXT.md]
   - RESOLVED: Preserve pre-existing `package.json`/`yarn.lock` diffs as user work initially. Phase 11 Task 1 must classify them before mutation, then the executor may carry those changes forward only as existing baseline for migration, not expand or revert them. If migration needs to mutate the same files, preserve the `NODE_ENV=test` script adjustment and Playwright additions unless the user later says otherwise, and record that in the summary.

2. **Does `pnpm install` pass with default symlinked layout?**
   - What we know: pnpm default layout differs from Yarn Classic hoisting. [CITED: https://pnpm.io/motivation]
   - What's unclear: Whether Gala's legacy Babel/Jest/Webpack stack imports undeclared transitive dependencies. [ASSUMED]
   - Recommendation: Run default pnpm first, then add direct dependencies or `node-linker=hoisted` only with error evidence. [CITED: https://pnpm.io/cli/why]
   - RESOLVED: Default pnpm symlinked layout is the starting path. Add `.npmrc` or `node-linker=hoisted` only after concrete install/build/test error evidence, and document the reason in the summary.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | pnpm, Webpack, Jest | Yes | 24.15.0 | Use `.node-version`/Docker Node 24.15.0. [VERIFIED: local command, .node-version, Dockerfile] |
| npm | Registry recheck and Corepack install fallback | Yes | 11.12.1 | Use `npm view`; Docker can install `corepack@latest` if needed. [VERIFIED: local command, CITED: https://pnpm.io/installation] |
| Corepack | Package-manager version dispatch | Yes | 0.34.6 | `npm install --global corepack@latest`. [VERIFIED: local command, CITED: https://pnpm.io/installation] |
| pnpm | Migration commands | Present but blocked by current Yarn `packageManager` | Project currently reports configured for Yarn | Change `packageManager` or use Corepack after manifest update. [VERIFIED: local command, package.json] |
| Yarn | Baseline comparison only | Yes | 1.22.22 via `bin/yarn` | Preserve as baseline until parity is proven, then remove root dependency. [VERIFIED: local command, bin/yarn] |
| Docker | Container build parity | Yes | 29.4.1 client; daemon reachable | Host-only gates can run first, but Dockerfile must still be updated. [VERIFIED: local command] |
| Ruby/Bundler host | Rails build/test commands | Host Ruby mismatch; Bundler present | Ruby 2.6.10 host, Bundler 2.4.19 | Use Docker or configured Ruby 4.0.3 for Rails gates. [VERIFIED: local command, .ruby-version] |
| PostgreSQL CLI | Rails DB/test support | Yes | psql 16.13 | Docker compose service if host DB unavailable. [VERIFIED: local command, docker-compose.yml] |
| Redis CLI | Sidekiq/cache support | Yes | redis-cli 8.6.3 | Docker compose service if host Redis unavailable. [VERIFIED: local command, docker-compose.yml] |

**Missing dependencies with no fallback:**
- None for research; implementation must account for host Ruby mismatch by using Docker or a Ruby 4.0.3 environment. [VERIFIED: local command, .ruby-version]

**Missing dependencies with fallback:**
- `pnpm` cannot run in the current project until `packageManager` stops declaring Yarn; fallback is to update manifest first and let Corepack select pnpm. [VERIFIED: local command, CITED: https://nodejs.org/download/rc/v24.0.0-rc.2/docs/api/corepack.html]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 24.5-era frontend tests; Rails/Shakapacker build gate; Semaphore CI root install gate. [VERIFIED: package.json, jest.config.js, .semaphore/semaphore.yml] |
| Config file | `jest.config.js`, `config/shakapacker.yml`, `.semaphore/semaphore.yml`, `Dockerfile`. [VERIFIED: rg --files] |
| Quick run command | `pnpm test -- --runInBand` after migration. [VERIFIED: package.json, CITED: https://pnpm.io/cli/run] |
| Full suite command | `pnpm install --frozen-lockfile && bundle exec rails assets:precompile && pnpm test -- --runInBand`; Docker/Semaphore equivalent should be verified if feasible. [CITED: https://pnpm.io/cli/install, VERIFIED: Dockerfile] |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| PNPM-01 | Root package manager is pnpm, not Yarn | install/config | `node -e "console.log(require('./package.json').packageManager)" && pnpm --version` | Yes: `package.json` [VERIFIED: package.json] |
| PNPM-02 | Pinned pnpm compatible with Node 24 | config/registry | `npm view pnpm version engines --json && node --version && pnpm --version` | Yes: `package.json`, `.node-version` [VERIFIED: npm registry, .node-version] |
| PNPM-03 | Lockfile generated after parity | install/build/test | `pnpm install --frozen-lockfile && pnpm test -- --runInBand && bundle exec rails assets:precompile` | No: `pnpm-lock.yaml` absent pre-migration [VERIFIED: find lockfiles] |
| PNPM-04 | Yarn assumptions removed | static audit | `rg -n "\\byarn\\b|yarn\\.lock" --glob '!node_modules/**' .` | Yes: current references exist [VERIFIED: rg yarn] |
| PNPM-05 | Existing JS commands run through pnpm | test/build | `pnpm test -- --runInBand` and `bundle exec rails assets:precompile` | Yes: `package.json`, `jest.config.js` [VERIFIED: package.json, jest.config.js] |

### Sampling Rate

- **Per task commit:** `pnpm install --frozen-lockfile` plus the narrow command affected by that task. [CITED: https://pnpm.io/cli/install]
- **Per wave merge:** `pnpm test -- --runInBand` and `bundle exec rails assets:precompile`. [VERIFIED: package.json, Dockerfile]
- **Phase gate:** Full install/build/test parity, static Yarn audit, Dockerfile review, and Semaphore config review before `$gsd-verify-work`. [VERIFIED: .planning/REQUIREMENTS.md, .semaphore/semaphore.yml]

### Wave 0 Gaps

- [ ] `pnpm-lock.yaml` does not exist yet; create via `pnpm import` during implementation. [VERIFIED: find lockfiles, CITED: https://pnpm.io/cli/import]
- [ ] No `.npmrc` exists; only add one if a verified pnpm setting is needed. [VERIFIED: find .npmrc]
- [ ] CI still uses Yarn and `checksum yarn.lock`; update `.semaphore/semaphore.yml`. [VERIFIED: .semaphore/semaphore.yml]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | No direct change | No auth behavior change; keep package-manager migration separate. [VERIFIED: phase scope] |
| V3 Session Management | No direct change | No session behavior change. [VERIFIED: phase scope] |
| V4 Access Control | No direct change | No route/controller authorization changes. [VERIFIED: phase scope] |
| V5 Input Validation | Yes, manifest/config validation | Use exact package-manager pin and frozen lockfile verification. [VERIFIED: package.json, CITED: https://pnpm.io/cli/install] |
| V6 Cryptography | No direct implementation | Do not hand-roll integrity/lockfile content; use pnpm lockfile generation. [CITED: https://pnpm.io/cli/import] |

### Known Threat Patterns for pnpm Migration

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Dependency confusion or unreviewed registry drift during migration | Tampering | Import from existing `yarn.lock`, use exact pnpm pin, inspect lockfile diff, and use frozen lockfile in CI. [CITED: https://pnpm.io/cli/import, CITED: https://pnpm.io/cli/install] |
| Committed registry credentials | Information Disclosure | Do not commit `.npmrc` auth tokens; pnpm auth docs state auth files contain sensitive credentials. [CITED: https://pnpm.io/npmrc] |
| Running the wrong package manager version | Tampering | Use `packageManager` with Corepack and verify `pnpm --version`. [CITED: https://nodejs.org/download/rc/v24.0.0-rc.2/docs/api/corepack.html] |

## Sources

### Primary (HIGH confidence)
- npm registry: `npm view pnpm version time.modified engines dist-tags --json` checked `pnpm@11.1.0`, modified 2026-05-11, Node `>=22.13`. [VERIFIED: npm registry]
- pnpm 11 installation docs: Node compatibility, Corepack setup, pnpm install options. [CITED: https://pnpm.io/installation]
- pnpm 11 package.json docs: `engines.pnpm`, `devEngines.packageManager`, and package metadata behavior. [CITED: https://pnpm.io/package_json]
- pnpm 11 import/install/run/exec/why/auth docs: lockfile import, frozen lockfile, script execution, dependency tracing, and auth file handling. [CITED: https://pnpm.io/cli/import, CITED: https://pnpm.io/cli/install, CITED: https://pnpm.io/cli/run, CITED: https://pnpm.io/cli/exec, CITED: https://pnpm.io/cli/why, CITED: https://pnpm.io/npmrc]
- Node Corepack docs for Node 24 RC: `packageManager` lookup and supported pnpm binaries. [CITED: https://nodejs.org/download/rc/v24.0.0-rc.2/docs/api/corepack.html]
- Project files: `package.json`, `Dockerfile`, `.semaphore/semaphore.yml`, `README.md`, `jest.config.js`, `config/shakapacker.yml`, `.planning/*`. [VERIFIED: codebase grep]

### Secondary (MEDIUM confidence)
- pnpm motivation docs: non-flat `node_modules`, symlink layout, and `node-linker=hoisted` fallback. [CITED: https://pnpm.io/motivation]

### Tertiary (LOW confidence)
- None; open implementation unknowns are captured as assumptions rather than unsupported findings. [VERIFIED: research review]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - pnpm version and Node engine were verified through npm registry and pnpm official docs. [VERIFIED: npm registry, CITED: https://pnpm.io/installation]
- Architecture: HIGH - project integration points were verified through repo files and planning artifacts. [VERIFIED: package.json, Dockerfile, .semaphore/semaphore.yml]
- Pitfalls: MEDIUM - pnpm layout behavior is official, but exact Gala failures require implementation-time install/build/test evidence. [CITED: https://pnpm.io/motivation, ASSUMED]

**Research date:** 2026-05-12 [VERIFIED: gsd init.phase-op]
**Valid until:** 2026-05-19 for pnpm target/version evidence; recheck registry immediately before editing manifests. [VERIFIED: .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md]
