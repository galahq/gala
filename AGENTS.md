# Repository Guidance

This repository uses GSD planning artifacts in `.planning/`.

## Current Work

The active milestone is **v1.0 Upgrade Stabilization**. The goal is to finish the Ruby, Node.js, Shakapacker/Webpacker, and BlueprintJS upgrade by checking route groups from `config/routes.rb` against the approximate BlueprintJS 2.3.1-era Gala UI.

Start with:
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/codebase/`

## Execution Rules

- Work phases sequentially from `.planning/ROADMAP.md`.
- Use `config/routes.rb` as the source of truth for route coverage.
- Use `localhost:3000` for browser QA.
- Treat the local dev environment as vanilla Ghostty + tmux + Codex + Neovim.
- Use `bin/dev` for repo-owned tmux sessions and `bin/dev stack` for the local Docker stack.
- Do not add or depend on CMUX hooks, CMUX workspaces, or `CMUX_*` environment propagation.
- Check browser console and network errors before marking a route group complete.
- Run targeted tests for touched files. Relevant commands include `pnpm test`, `bundle exec rspec`, `./run-rspec.sh`, and `bundle exec rake test:unit`.
- Commit after each phase QA gate passes.
- Keep fixes narrow and route-driven. Avoid broad redesigns or unrelated dependency upgrades.

## Frontend Upgrade Notes

- Current BlueprintJS packages are 4.x, but the visual compatibility target is the prior BlueprintJS 2.3.1-era Gala experience.
- Be careful around global asset loading in `app/views/layouts/application.html.erb`, `app/assets/stylesheets/application.css`, `app/javascript/packs/styles.js`, and `app/javascript/shared/blueprintLegacyNamespace.js`.
- Avoid duplicating Blueprint CSS or adding route-specific shims before confirming the route group actually needs them.

## Planning Commands

- Next step: `$gsd-discuss-phase 1`
- Plan directly: `$gsd-plan-phase 1`
- Review progress: `$gsd-progress`
