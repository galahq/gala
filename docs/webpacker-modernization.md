# Webpacker Modernization Rollout

This document defines an incremental path to replace the retired Webpacker stack
without a big-bang frontend rewrite.

## Scope

- Replace `webpacker` gem and `@rails/webpacker` npm package
- Preserve current React entrypoints in `app/javascript/packs`
- Keep deploy behavior stable while migrating helpers in Rails views

## Recommended Target

Use `jsbundling-rails` with `webpack` as the first landing target.

Why:

- Lowest migration risk for an app already built around Webpack packs
- Keeps Babel + loader behavior familiar while removing the retired gem
- Leaves room to move to `esbuild` or `vite_ruby` later if desired

## Current Touchpoints

- Pack entry files: `app/javascript/packs`
- Webpacker config: `config/webpacker.yml`, `config/webpack/*.js`
- Dev process: `Procfile.dev` (`webpack` process)
- View helpers: `javascript_pack_tag` and `stylesheet_pack_tag` in:
  - `app/views/layouts/application.html.erb`
  - `app/views/layouts/with_header.html.erb`
  - `app/views/cases/show.html.erb`
  - `app/views/catalog/home.html.haml`
  - `app/views/deployments/edit.html.haml`
  - `app/views/libraries/_form.html.haml`
  - `app/views/readers/_form.html.haml`
  - `app/views/magic_links/show.html.haml`

## Rollout Plan

### Step 1: Prepare build scripts

1. Add `jsbundling-rails` gem and install `webpack` mode.
2. Add explicit scripts in `package.json`:
   - `build` for production compile
   - `build:watch` for development
3. Ensure output path is `app/assets/builds` and include that path in asset config.

### Step 2: Preserve entrypoint naming

1. Mirror current pack names (`case`, `catalog`, `billboard`, etc.) in the new build config.
2. Keep runtime/vendor split only if required by current caching strategy.
3. Validate output filenames are stable for helper migration.

### Step 3: Migrate helpers in views

1. Replace `javascript_pack_tag` with `javascript_include_tag` (or helper wrappers) against built assets.
2. Replace `stylesheet_pack_tag` with `stylesheet_link_tag` where applicable.
3. Keep migration in small PRs to simplify rollback.

### Step 4: Update dev and deploy process

1. Replace `Procfile.dev` webpack command with `yarn build:watch`.
2. Ensure release/precompile runs JS build before `assets:precompile`.
3. Remove Webpacker-specific binstubs and config once parity is confirmed.

### Step 5: Remove retired dependencies

1. Remove `webpacker` gem from `Gemfile`.
2. Remove `@rails/webpacker` from `package.json`.
3. Delete `config/webpacker.yml` and unused `config/webpack/*` files.

## Validation Checklist

- `yarn build` succeeds
- `bundle exec rails assets:precompile` succeeds
- Key pages load JS correctly:
  - Case show
  - Catalog home
  - Deployment edit
  - Magic links show
- No remaining `javascript_pack_tag` or `stylesheet_pack_tag` references

