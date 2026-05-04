# Gala

## What This Is

Gala is a Rails application for the collaborative study of media-rich teaching cases. It combines Rails-rendered pages, React islands, catalog search, case reading/editing workflows, admin dashboards, deployments, quizzes, statistics, comments, reading lists, and authentication flows.

The current project work is a brownfield upgrade stabilization effort: finish the major Ruby, Node.js, Shakapacker/Webpacker, and BlueprintJS migration while preserving the approximate visual and behavioral shape of the previous BlueprintJS 2.3.1-era application.

## Core Value

Every important route must keep working and looking recognizably like the pre-upgrade Gala experience while the Ruby, Node.js, and BlueprintJS stack is modernized.

## Current Milestone: v1.0 Upgrade Stabilization

**Goal:** Finish the Ruby, Node.js, and BlueprintJS upgrade by iterating through route groups from `config/routes.rb`, fixing style and behavior regressions, and committing after each QA gate.

**Target features:**
- Restore BlueprintJS styling compatibility after moving JavaScript and CSS loading into the application layout.
- Verify each route group from `config/routes.rb` on `localhost:3000` with pragmatic visual and functional QA.
- Preserve Rails, React, Shakapacker, authentication, admin, catalog, case, deployment, stats, search, and reading-list behavior while upgrading.
- Establish repeatable route-by-route QA gates before moving to the next phase.
- Finish with a cleanup/deslopification pass to remove dead compatibility code, duplicated styling, and upgrade leftovers.

## Requirements

### Validated

- Gala serves a Rails application with public catalog, case, authentication, admin, deployment, statistics, reading-list, search, and utility routes - existing.
- Gala uses Rails controllers and views with React islands mounted through Shakapacker packs in `app/javascript/packs` - existing.
- Gala currently loads BlueprintJS CSS globally through `app/assets/stylesheets/application.css` and JavaScript support through `app/javascript/packs/styles.js` - existing.
- Gala has a fresh codebase map in `.planning/codebase/` describing the current stack, architecture, conventions, tests, integrations, and concerns - existing.

### Active

- [ ] Stabilize global BlueprintJS CSS and namespace behavior after application-layout loading.
- [ ] Audit public catalog and search routes for visual and behavioral regressions.
- [ ] Audit case reader/editor routes and React Router subroutes for visual and behavioral regressions.
- [ ] Audit case management, library, reading-list, profile, enrollment, and reader routes for visual and behavioral regressions.
- [ ] Audit comments, quizzes, podcasts, edgenotes, pages, cards, stats, and deployment route groups for visual and behavioral regressions.
- [ ] Audit admin and operational routes without regressing authentication or authorization.
- [ ] Run route-level QA gates on `localhost:3000` before committing each phase.
- [ ] Clean up upgrade leftovers once route verification is complete.

### Out of Scope

- Full redesign of Gala UI - the goal is compatibility with the prior BlueprintJS-era experience, not a new visual system.
- Rewriting React 16/Flow/Redux architecture - only change it where required to stabilize the upgrade.
- Replacing BlueprintJS with a different component library - this milestone is about making the current BlueprintJS upgrade work.
- Large product feature changes - route behavior should remain stable unless a fix requires a narrow compatibility adjustment.
- Production deployment automation changes - this milestone focuses on local route QA and code stabilization.

## Context

The repository is a Rails 8.1.3 application running Ruby 4.0.3 and Node 24.15.0 with Shakapacker 10 and Webpack 5. The frontend is a legacy React 16.8, Flow, Redux, Stimulus, styled-components, and BlueprintJS application.

BlueprintJS packages are currently `@blueprintjs/core` 4.20.2, `@blueprintjs/datetime` 4.4.37, and `@blueprintjs/select` 4.3.1 in `package.json`. The prior app behavior should be judged against the approximate BlueprintJS 2.3.1-era visual shape, especially where old `.pt-*` class expectations or page-specific Webpacker bundles no longer line up with globally loaded application layout assets.

The main layout `app/views/layouts/application.html.erb` now loads collected Shakapacker packs `styles`, `controllers`, and `onboarding`, then the collected stylesheet pack `styles`, then the Sprockets `application` stylesheet. The Sprockets stylesheet imports BlueprintJS core, icons, datetime, popover2, and select CSS from `node_modules`.

Route QA should be driven from `config/routes.rb`, not by guessing only the most visible pages. The route groups include public error and health pages, catalog root/search libraries/languages catch-alls, case routes and nested React Router paths, admin resources, comments, deployments, edgenotes, libraries, profile/readers, quizzes, reading lists, search, tags, Devise reader routes, LTI/auth strategy routes, Sidekiq, and runtime stats.

QA should use tools and best judgment as gates. At minimum, each phase should run the local app on port 3000 or verify it is already running, visit representative routes with Playwright/browser tooling where possible, inspect console and network errors, verify Blueprint controls have expected spacing/sizing/icons/popovers/forms, run targeted Jest/RSpec tests where practical, and commit the phase before moving on.

## Constraints

- **Runtime:** Local Rails app is expected on `localhost:3000` - route QA should use that server.
- **Upgrade compatibility:** Ruby 4.0.3, Node 24.x, Rails 8.1.3, Shakapacker 10, Webpack 5, React 16.8, and BlueprintJS 4.x must coexist during this milestone.
- **Visual target:** Use the approximate BlueprintJS 2.3.1-era Gala appearance as the compatibility baseline, not a new BlueprintJS 4 visual redesign.
- **Route scope:** Route groups must be derived from `config/routes.rb`; phases should not skip hidden/admin/utility routes just because they are less visible.
- **QA gate:** Do not advance to the next route group until the current route group has a documented QA pass, targeted tests where practical, and a commit.
- **Regression control:** Keep fixes narrow and route-driven; avoid broad styling changes unless they are required by multiple verified regressions.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Initialize this as the first GSD project/milestone | `$gsd-new-milestone` was requested before `.planning/PROJECT.md` existed, and the user approved initializing from the milestone | - Pending |
| Use route groups from `config/routes.rb` as phase boundaries | The regression risk is route/page-specific after the asset-loading change | - Pending |
| Require QA and commit before moving to the next route group | The user explicitly asked to prevent regressions and commit after each route/phase gate | - Pending |
| Treat BlueprintJS 2.3.1-era visuals as the approximation baseline | The current packages are BlueprintJS 4.x, but the desired outcome is compatibility with the prior app look | - Pending |
| End with deslopification | Upgrade work often leaves compatibility shims and duplicated styles; cleanup should happen after behavior is stable | - Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? Move to Out of Scope with reason
2. Requirements validated? Move to Validated with phase reference
3. New requirements emerged? Add to Active
4. Decisions to log? Add to Key Decisions
5. "What This Is" still accurate? Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-03 after initialization*
