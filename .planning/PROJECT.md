# Gala

## What This Is

Gala is a Rails application for the collaborative study of media-rich teaching cases. It combines Rails-rendered pages, React islands, catalog search, case reading/editing workflows, admin dashboards, deployments, quizzes, statistics, comments, reading lists, and authentication flows.

## Core Value

Every important route must keep working and looking recognizably like the pre-upgrade Gala experience while the Ruby, Node.js, and BlueprintJS stack is modernized.

## Current State

**Shipped:** v1.0 Upgrade Stabilization on 2026-05-12.
**Active:** v1.1 Dependency Modernization and Test Coverage.

The v1.0 milestone completed the route-driven Ruby, Node.js, Shakapacker/Webpacker, and BlueprintJS upgrade stabilization. Route groups from `config/routes.rb` were checked through focused browser QA, console/network triage, and targeted RSpec/Jest gates. Detailed records are archived in `.planning/milestones/`.

The v1.1 milestone will modernize Ruby and JavaScript dependencies using current recommended stable releases, migrate Node package management from Yarn 1 to pnpm, remove Flow from the frontend dependency/tooling surface, restore reliable frontend test execution, and add Playwright visual regression coverage for high-value route groups.

## Requirements

### Validated

- Gala serves a Rails application with public catalog, case, authentication, admin, deployment, statistics, reading-list, search, and utility routes — existing.
- Gala uses Rails controllers and views with React islands mounted through Shakapacker packs in `app/javascript/packs` — existing.
- Gala loads BlueprintJS CSS globally through `app/assets/stylesheets/application.css` and JavaScript support through `app/javascript/packs/styles.js` — validated in v1.0.
- Global BlueprintJS CSS and namespace behavior are stable enough for the upgraded stack — v1.0.
- Public catalog, search, public utility, case shell, nested case, reader, library, reading-list, deployment, integration, admin, and operational route groups passed route-driven stabilization — v1.0.
- Route-level QA gates on `localhost:3000` or browser-container `host.docker.internal:3000` were recorded with console/network classification — v1.0.
- Upgrade cleanup removed or consolidated dead compatibility assumptions without introducing route-specific regressions — v1.0.

### Active

- [ ] Define v1.1 requirements for dependency modernization, pnpm migration, Flow removal, frontend tests, and Playwright visual regression coverage.

### Out of Scope

- Full redesign of Gala UI — compatibility with the prior BlueprintJS-era experience remains the goal unless a future milestone explicitly changes that.
- Rewriting React 16/Flow/Redux architecture — only change it where required to unblock dependency modernization or reliable frontend tests.
- Upgrading React or BlueprintJS major versions — v1.1 must keep current React 16.8 and BlueprintJS 4.x package lines unless a patch-level compatibility fix is required.
- Replacing BlueprintJS with a different component library — this requires a separate product/technical milestone.
- Large product feature changes — route behavior should remain stable unless a future milestone deliberately expands scope.
- Production deployment automation changes — v1.0 focused on local route QA and code stabilization.

## Context

The repository is a Rails 8.1.3 application running Ruby 4.0.3 and Node 24.15.0 with Shakapacker 10 and Webpack 5. The frontend is a legacy React 16.8, Flow, Redux, Stimulus, styled-components, and BlueprintJS application.

BlueprintJS packages are currently `@blueprintjs/core` 4.20.2, `@blueprintjs/datetime` 4.4.37, and `@blueprintjs/select` 4.3.1 in `package.json`. The v1.0 work preserved the approximate BlueprintJS 2.3.1-era Gala appearance using shared compatibility layers and route-level evidence.

Known remaining technical debt:
- Full `yarn test --runInBand` is blocked by existing Jest transform configuration failures on ES module imports; targeted Jest gates passed.
- Package management still uses Yarn 1 and `yarn.lock`; v1.1 will replace that workflow with pnpm and `pnpm-lock.yaml`.
- Flow remains present in Node dependencies and many frontend source annotations; v1.1 will remove Flow tooling and migrate source typing toward TypeScript-oriented checks with JSDoc allowed as a bridge.
- Playwright is present as a dependency but no durable visual regression harness is established for route coverage.
- Browser QA may report existing styled-components/React warnings and local Mapbox style `404` noise. These were classified as non-blocking where visible route behavior was unaffected.
- Nyquist validation artifacts are not uniform across the archived milestone; see `.planning/milestones/v1.0-MILESTONE-AUDIT.md`.

## Constraints

- **Runtime:** Local Rails app is expected on `localhost:3000`; browser-container QA may use `host.docker.internal:3000`.
- **Upgrade compatibility:** Ruby 4.0.3, Node 24.x, Rails 8.1.3, Shakapacker 10, Webpack 5, React 16.8, and BlueprintJS 4.x must coexist until a future modernization milestone changes them.
- **Visual target:** Use the approximate BlueprintJS 2.3.1-era Gala appearance as the compatibility baseline unless explicitly changed.
- **Route scope:** Route groups should be derived from `config/routes.rb`.
- **Regression control:** Keep fixes narrow and route-driven; avoid broad styling or dependency changes without a scoped milestone.
- **Package manager:** Use pnpm for Node dependency installation and lockfile management during v1.1.
- **Frontend type direction:** Remove Flow tooling and annotations; prefer TypeScript configuration and types, using JSDoc in plain JavaScript where a full file conversion would add unnecessary risk.
- **Compatibility hold:** Keep current React and BlueprintJS major versions during v1.1.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Initialize this as the first GSD project/milestone | `$gsd-new-milestone` was requested before `.planning/PROJECT.md` existed, and the user approved initializing from the milestone | Good — v1.0 shipped and archived |
| Use route groups from `config/routes.rb` as phase boundaries | The regression risk was route/page-specific after the asset-loading change | Good — route coverage drove all v1.0 phases |
| Require QA and commit before moving to the next route group | The user explicitly asked to prevent regressions and commit after each route/phase gate | Good — phase artifacts record QA gates and commits |
| Treat BlueprintJS 2.3.1-era visuals as the approximation baseline | Current packages are BlueprintJS 4.x, but desired outcome was compatibility with the prior app look | Good — shared compatibility layers were preserved and tested |
| End with deslopification | Upgrade work left compatibility shims and duplicated assumptions that needed cleanup after behavior was stable | Good — Phase 9 cleaned shared assumptions and ran final regression gates |
| Start v1.1 with dependency and test research | Latest package guidance changes over time, and this milestone touches multiple toolchains | Pending — research is being captured before requirements are finalized |

## Evolution

This document evolves at milestone boundaries.

**v1.1 milestone setup** should:
1. Capture current Ruby, Rails gem, pnpm, Jest/frontend-test, and Playwright visual regression guidance.
2. Define fresh requirements from that research.
3. Preserve route-driven QA expectations for route-affecting dependency changes.
4. Avoid product/UI redesign while modernizing the underlying toolchain.

---
*Last updated: 2026-05-12 for v1.1 milestone planning*
