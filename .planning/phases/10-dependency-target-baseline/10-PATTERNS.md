# Phase 10: Dependency Target Baseline - Pattern Map

**Mapped:** 2026-05-12
**Files analyzed:** 1
**Analogs found:** 1 / 1

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `.planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` | config | transform | `.planning/phases/10-dependency-target-baseline/10-VALIDATION.md` + `.planning/phases/10-dependency-target-baseline/10-RESEARCH.md` | exact |

No source files, manifests, lockfiles, package-manager files, build config, or test-runner config should be modified in this phase.

## Pattern Assignments

### `.planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` (config, transform)

**Analog:** `.planning/phases/10-dependency-target-baseline/10-VALIDATION.md`

**Artifact scope pattern** (lines 20-23):

```markdown
| **Framework** | Documentation audit with `rg`; no Ruby or JavaScript runtime changes in this phase |
| **Config file** | none — Phase 10 creates planning documentation only |
| **Quick run command** | `rg -n "DEPS-01|React|Blueprint|pnpm|Ruby|Rails|Shakapacker|Recheck|holdback" .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` |
| **Full suite command** | `git diff -- Gemfile Gemfile.lock package.json yarn.lock pnpm-lock.yaml config/webpack config/shakapacker.yml jest.config.js` |
```

Copy this pattern by making the matrix self-auditable with searchable requirement markers and by keeping the negative diff audit focused on files Phase 10 must not touch.

**Verification row pattern** (lines 41-45):

```markdown
| 10-01-01 | 01 | 1 | DEPS-01 | T-10-01 | Matrix uses official registry/doc source fields and recheck commands before later edits | documentation audit | `rg -n "Latest checked|Source|Recheck|npm view|rubygems.org|ruby-lang.org" .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` | no W0 | pending |
| 10-01-02 | 01 | 1 | DEPS-02 | T-10-02 | React 16.x hold prevents accidental React major upgrade during v1.1 | documentation audit | `rg -n "React.*16|react.*16|React.*19|React major upgrade" .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` | no W0 | pending |
| 10-01-03 | 01 | 1 | DEPS-03 | T-10-03 | BlueprintJS 4.x hold prevents accidental BlueprintJS 6/React 18 upgrade during v1.1 | documentation audit | `rg -n "BlueprintJS.*4|@blueprintjs.*4|BlueprintJS.*6|React 18" .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` | no W0 | pending |
| 10-01-04 | 01 | 1 | DEPS-04 | T-10-04 | Holdbacks include compatibility reasons and downstream owner phases | documentation audit | `rg -n "Holdback reason|Compatibility reason|Owner phase|v1.2" .planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` | no W0 | pending |
| 10-01-05 | 01 | 1 | DEPS-01..04 | T-10-05 | No manifest, lockfile, package manager, build, or test-runner config changes are introduced by the baseline phase | diff audit | `git diff -- Gemfile Gemfile.lock package.json yarn.lock pnpm-lock.yaml config/webpack config/shakapacker.yml jest.config.js` | yes | pending |
```

Use these as acceptance rows or as the checklist basis for the matrix. The matrix must include official-source fields, React and Blueprint holds, holdback reasons, owner phases, and recheck commands.

**Wave 0 deliverable pattern** (line 51):

```markdown
- [ ] `.planning/phases/10-dependency-target-baseline/10-DEPENDENCY-MATRIX.md` — create the documentation artifact that covers DEPS-01 through DEPS-04.
```

This is the only file the planner should ask implementers to create for Phase 10.

**Secondary analog:** `.planning/phases/10-dependency-target-baseline/10-RESEARCH.md`

**Recommended structure pattern** (lines 148-152):

```text
.planning/phases/10-dependency-target-baseline/
├── 10-CONTEXT.md              # existing locked decisions
├── 10-RESEARCH.md             # this research
└── 10-DEPENDENCY-MATRIX.md    # Phase 10 planner should create this
```

**Matrix row schema pattern** (lines 163-165):

```markdown
| Package | Current | Latest checked | v1.1 target | Decision | Reason | Owner phase | Recheck |
|---------|---------|----------------|-------------|----------|--------|-------------|---------|
| @blueprintjs/core | 4.20.2 | 6.12.1 | 4.20.2 | hold | 6.x peers require React 18; v1.1 holds React 16.x | 15 | npm view @blueprintjs/core version peerDependencies --json |
```

Copy this table shape, but add columns where useful for source URL/date and requirement marker. Keep "latest checked" distinct from "v1.1 target"; latest evidence is not automatically the target.

**Registry verification command pattern** (lines 225-233):

```bash
# Source: npm registry and RubyGems API
for p in pnpm typescript vitest vite @vitejs/plugin-react @playwright/test playwright shakapacker webpack webpack-cli webpack-dev-server react react-dom @blueprintjs/core @blueprintjs/datetime @blueprintjs/select; do
  npm view "$p" version time.modified peerDependencies engines --json
done

for g in rails shakapacker puma sidekiq pg redis sentry-ruby sentry-rails sentry-sidekiq devise pundit rspec-rails capybara selenium-webdriver; do
  curl -fsSL "https://rubygems.org/api/v1/gems/${g}.json"
done
```

The matrix should include these commands or package-specific equivalents in a `Recheck` column so later implementation phases repeat official checks before touching manifests.

## Source Inventory Patterns

### JavaScript Manifest Current-State Rows

**Source:** `package.json`

**Package manager and Node engine pattern** (lines 12-18):

```json
"packageManager": "yarn@1.22.22",
"scripts": {
  "test": "NODE_ENV=test jest app/javascript"
},
"engines": {
  "node": ">=24 <25",
  "yarn": "1.x"
}
```

Use this to document current Yarn 1 state and Node 24 compatibility constraints. Do not edit this file in Phase 10; Phase 11 owns pnpm migration.

**Blueprint and React hold source pattern** (lines 31-33, 68-75):

```json
"@blueprintjs/core": "4.20.2",
"@blueprintjs/datetime": "4.4.37",
"@blueprintjs/select": "4.3.1",
"react": "^16.8.6",
"react-dom": "^16.8.6",
```

Use these as current manifest constraints for DEPS-02 and DEPS-03 rows. The matrix should explicitly state that React major upgrades and BlueprintJS major upgrades are v1.2+.

**Build/test tooling source pattern** (lines 99-105, 131-136, 143):

```json
"shakapacker": "10.0.0",
"webpack": "5.106.1",
"flow-bin": "0.87.0",
"jest": "^24.5.0",
"playwright": "^1.59.1",
"webpack-dev-server": "^5.2.2"
```

Use these for Phase 12, 13, 15, 16, and 17 owner-phase rows. Keep Vitest/Vite/TypeScript/Playwright Test as documented targets or candidates, not installs.

### Ruby Manifest Current-State Rows

**Source:** `Gemfile`

**Ruby and Rails source pattern** (lines 3-7):

```ruby
source 'https://rubygems.org'

ruby file: '.ruby-version' # 4.0.3

gem 'rails', '~> 8.1'
```

Use this to document Ruby and Rails targets. `.ruby-version` line 1 pins `4.0.3`; record Ruby 4.0.4 only as a Phase 14 candidate unless rechecked policy changes.

**Runtime gem grouping pattern** (lines 13-24):

```ruby
# Infrastructure
gem 'aws-sdk-s3'
gem 'bootsnap'
gem 'connection_pool'
gem 'image_processing'
gem 'pg', '~> 1.5.4'
gem 'puma', '~> 7.1'
gem 'rack-attack'
gem 'rack-canonical-host'
gem 'rack-timeout'
gem 'redis', '~> 5.0'
gem 'sidekiq', '~> 7.0'
```

Follow this grouping in the matrix by separating runtime candidates from test/development gems and marking major jumps such as Puma 8 or Sidekiq 8 with separate verification notes.

**Shakapacker alignment pattern** (lines 75-78):

```ruby
gem 'sassc-rails', '~> 2.1', '>= 2.1.2'
gem 'sprockets', '~> 4.2'
gem 'sprockets-rails', '~> 3.5', '>= 3.5.2'
gem 'shakapacker', '10.0.0'
```

Pair this with `package.json` line 99 so the matrix records Ruby gem and npm package alignment for Shakapacker.

**Monitoring/auth/test gem grouping pattern** (lines 80-88, 124-140):

```ruby
gem 'sentry-ruby', '~> 5.24'
gem 'sentry-rails', '~> 5.24'
gem 'sentry-sidekiq', '~> 5.24'

group :development, :test do
  gem 'rspec'
  gem 'rspec-rails'
  gem 'selenium-webdriver'
end
```

Use these current constraints for rows that later Phase 14 can execute in small groups with targeted test gates.

## Shared Patterns

### Requirement Markers

**Source:** `.planning/REQUIREMENTS.md`
**Apply to:** All matrix sections and verification checks

```markdown
- [ ] **DEPS-01**: Dependency target selection uses current official registry/doc data at implementation time.
- [ ] **DEPS-02**: React remains on the current 16.8 line during v1.1.
- [ ] **DEPS-03**: BlueprintJS remains on the current 4.x line during v1.1.
- [ ] **DEPS-04**: Any dependency intentionally held below latest is documented with the compatibility reason.
```

Source lines: `.planning/REQUIREMENTS.md` lines 10-13.

### Phase Boundary

**Source:** `.planning/ROADMAP.md`
**Apply to:** Matrix introduction and owner-phase mapping

```markdown
**Goal:** Establish exact dependency targets, compatibility holds, and verification policy before changing lockfiles.

**Success Criteria:**
1. Current official registry/doc checks are captured for Ruby, Rails, pnpm, TypeScript, Vitest/Vite, Playwright, Shakapacker/Webpack, and key runtime gems.
2. React 16.8 and BlueprintJS 4.x holds are explicitly documented as v1.1 constraints.
3. Dependency holdbacks below latest are recorded with compatibility reasons.
4. The phase produces a target matrix that later phases can execute against.
```

Source lines: `.planning/ROADMAP.md` lines 12-20.

### Current Stack Baseline

**Source:** `.planning/codebase/STACK.md`
**Apply to:** Matrix `Current` column, stack families, and owner-phase grouping

```markdown
- Ruby 4.0.3, pinned by `.ruby-version` and `Dockerfile`.
- Node 24.15.0, pinned by `.node-version` and `Dockerfile`; `package.json` engines require `>=24 <25`.
- Rails 8.1.3 from `Gemfile.lock`, with `config.load_defaults 7.0` in `config/application.rb`.
- Puma 7.1.0 serves web requests via `Procfile`, `Dockerfile`, and `infra/sst.config.ts`.
- Sidekiq 7.3.6 runs background jobs via `Procfile`, `Procfile.dev`, `config/sidekiq.yml`, and `infra/sst.config.ts`.
```

Source lines: `.planning/codebase/STACK.md` lines 21-25.

### No-Change Validation

**Source:** `.planning/phases/10-dependency-target-baseline/10-VALIDATION.md`
**Apply to:** End of matrix verification section

```markdown
- **After every plan wave:** Run `git diff -- Gemfile Gemfile.lock package.json yarn.lock pnpm-lock.yaml config/webpack config/shakapacker.yml jest.config.js`
- **Before `$gsd-verify-work`:** Documentation audit must find all Phase 10 requirement markers and manifest/config diff must show no Phase 10 edits
```

Source lines: `.planning/phases/10-dependency-target-baseline/10-VALIDATION.md` lines 31-32.

## No Analog Found

All files identified for Phase 10 have a close analog. No source-code analog is needed because the phase creates a planning documentation artifact only.

## Metadata

**Analog search scope:** `.planning/**/*.md`, `.planning/codebase/*.md`, `package.json`, `Gemfile`, `.ruby-version`, `.node-version`, `Gemfile.lock`, `yarn.lock`, `jest.config.js`, `config/shakapacker.yml`
**Files scanned:** 18
**Pattern extraction date:** 2026-05-12
