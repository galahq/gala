# Major Dependency Upgrade Analysis

_Last updated: 2026-05-03_

This document captures the current repository state for Gala's recent major dependency upgrades, with emphasis on what appears fully landed versus what still depends on compatibility layers or follow-up cleanup.

Primary evidence sources:

- `package.json`
- `Gemfile`
- `Gemfile.lock`
- `app/assets/`
- `docs/asset-pipeline.md`
- `.omx/context/*upgrade*`
- `.omx/plans/*rails8*`
- `.planning/codebase/*`

## Executive summary

The runtime and asset-tooling upgrades are mostly landed:

- `node-sass` has been replaced by Dart Sass on the webpack side.
- Webpacker has been replaced by Shakapacker 10.
- Rails is now locked on `8.1.x`.
- Ruby is now locked on `4.0.3`.
- Node is now locked on `24.15.0`.

The highest-risk and least-complete migration is **BlueprintJS 2.3.1 -> 4.x**.

Blueprint 4 package versions are installed and active, but the application still carries a large amount of legacy `pt-*` markup and styling. The current implementation depends on a compatibility bridge, mixed `pt-*` and `bp4-*` class usage, and route-specific regressions fixes rather than a clean namespace migration.

## Current dependency state

### Rails / Ruby / Node

Current runtime pins:

- Ruby: `.ruby-version` -> `4.0.3`
- Node: `.node-version` -> `24.15.0`
- Rails: `Gemfile` -> `~> 8.1`
- Rails resolved version: `Gemfile.lock` -> `8.1.3`
- Bundler: `Gemfile.lock` -> `2.4.19`

Notable Ruby 4 follow-up:

- `Gemfile` explicitly adds `benchmark` and `csv` because they are no longer default stdlib gems in Ruby 4.

### Asset pipeline and bundling

Current split:

- **Sprockets remains active** for `app/assets`, global styles, icons, and legacy assets.
- **Shakapacker remains active** for `app/javascript` packs compiled to `public/packs`.

This means the app is still a dual-pipeline asset system, not a single-pipeline migration.

### Sass

Webpack-side Sass is now Dart Sass:

- `package.json` includes `sass`
- `package.json` includes `sass-loader`
- `config/webpack/environment.js` explicitly sets `implementation = require('sass')`

However, Sprockets-side Sass is still present:

- `Gemfile` still includes `sassc-rails`
- `app/assets/stylesheets/` still contains a substantial Sass/SCSS tree

Conclusion: the `node-sass` removal is real, but only for the webpack/tooling side. The app still uses Sass in both pipelines.

## Upgrade-by-upgrade analysis

## 1. `node-sass` -> Dart Sass

### Status

**Mostly landed**

### Evidence

- Historical baseline in `.omx/reference/main-readonly/package.json` shows `node-sass: 4.12.0`.
- Current `package.json` removes `node-sass` and adds `sass: 1.92.1`.
- Current `config/webpack/environment.js` sets the Sass loader implementation to `require('sass')`.

### Implication

This upgrade appears to have accomplished its main goal: remove the old native `node-sass` dependency that constrained Node upgrades and caused ABI compatibility issues.

### Remaining caveat

The repo still depends on `sassc-rails` for Sprockets, so Sass remains part of the Ruby asset path even though `node-sass` is gone.

## 2. Webpacker -> Shakapacker

### Status

**Landed and internally consistent**

### Evidence

- Historical baseline in `.omx/reference/main-readonly/Gemfile` used `webpacker`.
- Historical baseline in `.omx/reference/main-readonly/package.json` used `@rails/webpacker`.
- Current `Gemfile` uses `shakapacker 10.0.0`.
- Current `package.json` uses `shakapacker 10.0.0`.
- `config/webpacker.yml` is gone.
- `config/shakapacker.yml` is present.
- `Procfile.dev` now starts `./bin/shakapacker-dev-server`.
- `bin/shakapacker` and `bin/shakapacker-dev-server` are present.
- `config/webpack/environment.js` now imports from `shakapacker`.

### Implication

This migration appears to be structurally complete. The app has moved to the Shakapacker naming, config, and binstub model.

### Important architectural note

The migration preserved existing custom webpack behavior instead of simplifying it:

- custom manifest handling
- raw SVG loading
- YAML loading
- path fallback shims
- split chunks
- runtime chunk handling
- webpack 5 `process` compatibility shim

So this is a successful compatibility-preserving migration, not a bundler simplification.

## 3. Rails 7.0 -> Rails 8.1

### Status

**Landed in dependency state**

### Evidence

- Historical baseline in `.omx/reference/main-readonly/Gemfile` used `rails '~> 7.0'`.
- Current `Gemfile` uses `rails '~> 8.1'`.
- `Gemfile.lock` resolves `rails 8.1.3`.
- `.omx/plans/test-spec-rails8-shakapacker-ruby-node-upgrade.md` records successful asset precompile and test runs after the upgrade work.

### Implication

The repo is no longer merely "Rails 8 planned"; the locked dependency state is already on Rails 8.1.3.

### Caveat

The `.planning` GSD materials are stale and still describe this repo as Rails 7-era in several places, so they should not be treated as current truth for dependency state.

## 4. Ruby 3.2.x -> Ruby 4.x

### Status

**Landed in runtime pins and lockfile**

### Evidence

- Historical baseline in `.omx/reference/main-readonly/.ruby-version` was `3.2.9`.
- Current `.ruby-version` is `4.0.3`.
- `Gemfile.lock` records `ruby 4.0.3p0`.
- `Dockerfile` uses `ARG RUBY_VERSION=4.0.3`.
- `README.md` and `.omx` plan artifacts both describe Ruby 4 as the target runtime.

### Implication

Ruby 4 is not just an intended target; it is reflected in the active repo runtime metadata and lockfile.

### Caveat

The move required explicit stdlib dependency additions (`benchmark`, `csv`), which is a sign that the upgrade included compatibility repair rather than a zero-friction version bump.

## 5. BlueprintJS 2.3.1 -> BlueprintJS 4

### Status

**Partially landed, still migration-fragile**

### Evidence: dependency layer

- Historical baseline in `.omx/reference/main-readonly/package.json` used:
  - `@blueprintjs/core ^2.3.1`
  - `@blueprintjs/select ^2.0.1`
  - `@blueprintjs/datetime ^2.0.3`
- Current `package.json` uses:
  - `@blueprintjs/core 4.20.2`
  - `@blueprintjs/select 4.3.1`
  - `@blueprintjs/datetime 4.4.37`

### Evidence: asset layer

- `app/assets/stylesheets/application.css` now requires package CSS from:
  - `@blueprintjs/icons`
  - `@blueprintjs/core`
  - `@blueprintjs/datetime`
  - `@blueprintjs/popover2`
  - `@blueprintjs/select`
- `config/initializers/assets.rb` adds `node_modules` to the Sprockets asset path and explicitly precompiles Blueprint icon fonts.

### Evidence: compatibility bridge

- `app/javascript/shared/blueprintLegacyNamespace.js` exists specifically to mirror legacy `pt-*` classes onto `bp4-*` classes at runtime.
- The file comments explicitly state that Gala still has many hand-authored legacy `pt-*` class names and that the bridge exists to keep them working with Blueprint 4 CSS.

### Evidence: legacy surface still present

Legacy `pt-*` usage remains widespread in:

- Rails layouts, for example `app/views/layouts/admin.html.erb`
- Rails form helpers, for example `app/helpers/blueprint_form_builder.rb`
- many server-rendered views under `app/views/`
- custom styles under `app/assets/stylesheets/`

Examples:

- `BlueprintFormBuilder` still emits classes like `pt-form-group`, `pt-callout`, `pt-control`, `pt-button`, `pt-input`, and `pt-label`.
- The admin layout still renders `pt-button`, `pt-input-group`, `pt-input`, and `pt-icon-*`.
- Some route views now mix namespaces directly, e.g. both `pt-card` and `bp4-card`.

### Evidence: regression-fix trail

Recent history shows several follow-up fixes after the initial upgrade:

- `6561caa3` Align runtime metadata with approved Rails 8.1 upgrade
- `b2d94914` Make local Docker boot deterministic on Ruby 4 and Node 24
- `045b2219` Keep Blueprint styles available without webpack split chunks
- `6f68cd67` fix: restore stats date picker namespace
- `5739695f` fix: prevent stale stats pack chunks

The `.omx/context/` and `.omx/plans/` artifacts also show repeated route-specific Blueprint 4 investigations for `/my_cases`, `/reading_lists/new`, stats pages, and Rails admin surfaces.

### Implication

Blueprint 4 is installed, but the app has **not** fully migrated off the old Blueprint namespace or assumptions.

The current shape is:

1. install Blueprint 4 packages
2. load Blueprint 4 CSS through Sprockets
3. preserve legacy Rails markup
4. mirror legacy classes to `bp4-*` at runtime where needed
5. patch regressions route by route

That makes Blueprint the most incomplete and highest-maintenance upgrade among the major dependency changes.

## Asset-pipeline-specific conclusion

`docs/asset-pipeline.md` accurately reflects the current Shakapacker-based pack build flow and `public/packs` production output. It also correctly describes the dual Sprockets + pack architecture.

What it does **not** emphasize is that Blueprint styling now spans both systems:

- package CSS and icon fonts are loaded through Sprockets
- Blueprint JS behavior and compatibility helpers are loaded through packs
- route-level regressions can appear when pack chunking or manifest behavior changes

This explains why Blueprint regressions remained the most visible after the bundler/runtime upgrades were otherwise completed.

## Planning-context mismatch

The repository currently has two different planning stories:

### `.omx` context and plans

These are current and aligned with the active repo state. They describe:

- Rails 8.1
- Ruby 4.0.3
- Node 24.15.0
- Shakapacker 10
- webpack 5
- captured verification for install/build/test steps

### `.planning` GSD artifacts

These are stale for dependency/runtime analysis. They still describe:

- Ruby 3.2.9
- Node 12.5.0
- Rails 7.0.x
- Webpacker
- Blueprint 2 / `node-sass` era concerns

### Practical takeaway

For dependency-upgrade analysis, `.omx` is the current source of truth and `.planning` is historical context unless refreshed.

## Recommended interpretation of current state

### Lowest-risk interpretation

The repo has already completed the core runtime and bundler moves:

- Rails 8.1
- Ruby 4
- Node 24
- Shakapacker 10
- webpack 5
- Dart Sass on the JS bundling side

### Highest-risk remaining interpretation

The BlueprintJS 4 migration is still in a stabilization phase because:

- markup remains legacy-heavy
- styling spans two pipelines
- a runtime namespace bridge is required
- recent commits show repeated route-specific regressions

## Bottom line

If these upgrades are ranked by how "done" they appear today:

1. **Webpacker -> Shakapacker**: mostly complete
2. **Rails 7 -> 8.1**: complete in dependency state
3. **Ruby 3.2 -> 4.0.3**: complete in runtime state
4. **`node-sass` -> Dart Sass**: complete for webpack, partial overall because Sprockets Sass remains
5. **BlueprintJS 2.3.1 -> 4**: least complete, highest ongoing regression risk

## Related docs

- `docs/asset-pipeline.md`
- `README.md`
- `docs/agent-playbooks/omx-high-madmax-blueprint4.md`
