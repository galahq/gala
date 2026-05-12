# Phase 4: Core Case Shell - Context

**Gathered:** 2026-05-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 stabilizes the primary case reader/editor shell before deeper nested case interactions. It covers the case index JSON route, case show shell, edit-mode redirect, settings, archive, translations, copy, delete confirmation, and React Router shell suffix routes under `/cases/:case_slug/...`.

This phase is not the full nested interaction audit. Comments, cards, pages, edgenotes, podcasts, quizzes, stats, forums, locks, tags, Wikidata, and other high-risk nested feature workflows remain Phase 5 unless a shell-level regression blocks Phase 4 QA.

</domain>

<decisions>
## Implementation Decisions

### Case Route QA Sample
- **D-01:** Use a full core route sample for Phase 4 rather than a minimal smoke pass.
- **D-02:** The route sample must include one representative URL or request for each scoped route family: case index JSON, case show shell, edit redirect, settings, archive, translations, copy, delete confirmation, and React Router suffix routes.
- **D-03:** Use existing local data first. Find usable local case slugs from the running app or database, preferring a published case plus an editable/editor-accessible case when available.
- **D-04:** If existing local data cannot cover a route family, document the substitution or skipped family in phase QA evidence instead of broadening the phase into seed-data work.
- **D-05:** Phase 4 should include editor-authenticated browser coverage for routes and controls that require it, using existing credentials or session setup if available.
- **D-06:** Restricted routes are not considered fully covered by unauthenticated redirect behavior alone when editor behavior is central to the shell. Request/controller specs may supplement browser QA where authentication setup is impractical.
- **D-07:** Sample the React shell with the overview plus known suffixes: `/cases/:slug`, a content-position route such as `/cases/:slug/1`, and `/cases/:slug/conversation` when local data and auth allow.

### Prior Decisions Carried Forward
- **D-08:** Keep the Phase 1 compatibility-first Blueprint strategy: preserve `.pt-*` classes, add `.bp4-*` companions only where verified route surfaces need them, and defer cleanup to Phase 9.
- **D-09:** Browser QA must inspect console and network failures before marking the route group complete.
- **D-10:** Browser-container HMR `Invalid Host/Origin header` messages are tooling noise unless reproduced in a normal `localhost:3000` browser session.
- **D-11:** Commit only after the Phase 4 route group passes QA or has documented, non-blocking exceptions.

### the agent's Discretion
- The agent may choose the exact existing case slug(s) after inspecting local data, but must record the chosen slugs and why they cover the route sample.
- The agent may choose targeted request/controller/Jest specs based on touched files and reachable local data, as long as the QA evidence explains what browser coverage and automated coverage each route family received.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning
- `.planning/PROJECT.md` — milestone goal, current constraints, and route-driven upgrade rules.
- `.planning/REQUIREMENTS.md` — `CASE-01`, `CASE-02`, `CASE-03`, and shared QA requirements.
- `.planning/ROADMAP.md` — Phase 4 scope, route list, representative UI areas, and success criteria.
- `.planning/STATE.md` — current milestone and phase position.
- `.planning/phases/01-baseline-asset-gate/01-CONTEXT.md` — locked Blueprint compatibility and QA gate decisions.
- `.planning/phases/02-public-and-utility-routes/02-CONTEXT.md` — public-route handling decisions and HMR-noise treatment.
- `.planning/phases/03-catalog-routes/03-CONTEXT.md` — route-driven compatibility decisions from the previous route group.

### Codebase Map
- `.planning/codebase/STRUCTURE.md` — case controller, case React pack, Redux, serializers, and test locations.
- `.planning/codebase/CONVENTIONS.md` — Rails, React, Flow, import, error-handling, and test conventions.
- `.planning/codebase/STACK.md` — Rails, Shakapacker, React 16, Redux, BlueprintJS, RSpec, and Jest stack constraints.

### Source Files
- `config/routes.rb` — source of truth for Phase 4 case routes and React Router catch-all.
- `app/controllers/cases_controller.rb` — main case index/show/create/edit/update/destroy/copy behavior.
- `app/views/cases/show.html.erb` — case shell mount point, `window.caseData` serialization, and case pack inclusion.
- `app/javascript/packs/case.entry.jsx` — case React/Redux/Intl/ThemeProvider entrypoint.
- `app/javascript/Case.jsx` — React Router shell and route suffix handling.
- `app/javascript/overview/StatusBar.jsx` — primary case toolbar and edit/settings/copy/translate/publish controls.
- `app/javascript/utility/Toolbar.jsx` — shared Blueprint toolbar component used by the case shell.
- `app/javascript/overview/CaseOverview.jsx` — case overview shell and right-column composition.
- `app/views/cases/settings/edit.html.haml` — Rails-rendered case settings surface.
- `app/views/cases/deletions/new.html.haml` — Rails-rendered delete confirmation surface.
- `app/views/cases/_case.html.haml` — case card/list partial for case index-adjacent surfaces.
- `app/javascript/shared/blueprint.scss` — shared Blueprint compatibility overrides.
- `app/javascript/shared/blueprintLegacyNamespace.js` — runtime `.pt-*` to `.bp4-*` bridge.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/javascript/utility/Toolbar.jsx`: shared case toolbar built on Blueprint `Button`, `Popover`, `Menu`, and `MenuItem`; already mirrors `pt-*` class names to `bp4-*` for toolbar items.
- `app/javascript/shared/blueprintLegacyNamespace.js`: runtime compatibility bridge for legacy Blueprint classes.
- `app/javascript/shared/blueprint.scss`: existing compatibility style layer for legacy `.pt-*` selectors and Gala overrides.
- `app/views/cases/show.html.erb`: stable Rails-to-React shell bridge using `window.caseData` and `append_javascript_pack "case"`.

### Established Patterns
- Case show HTML renders through the `with_header` layout and mounts the React app into `#container`.
- Case frontend state flows through Redux, Flow-annotated React 16 components, `react-router-dom`, `react-intl`, and styled-components.
- Editor-only controls live in the case toolbar and depend on serialized `caseData.reader` permissions and links.
- Rails-rendered case settings/delete surfaces still use legacy Blueprint class strings, often with `.bp4-*` companions added where already verified.
- Route QA must derive coverage from `config/routes.rb` and record console/network observations.

### Integration Points
- Browser QA should exercise the running app at `localhost:3000`, using editor-authenticated state where available.
- Backend route behavior can be protected with request/controller specs where browser auth or local data is insufficient.
- React suffix routes should verify Rails hands off to the case shell and the client router renders without new runtime errors.

</code_context>

<specifics>
## Specific Ideas

- Prefer one published local case for public shell coverage and one editor-accessible case for settings/edit/copy/delete/translation behavior if local data allows.
- The final QA evidence should name the slug(s), route families covered, browser result, console/network findings, tests run, and any substitutions.
- Do not turn Phase 4 into deterministic seed-data engineering unless the planner finds no practical existing-data path.

</specifics>

<deferred>
## Deferred Ideas

- Full nested case interactions remain Phase 5: cards, case elements, pages, podcasts, edgenotes, comment threads, comments, activities, forums, locks, quizzes, stats, taggings, Wikidata links, and SPARQL-linked interactions.
- Broad `.pt-*` cleanup and compatibility shim removal remain Phase 9.

</deferred>

---

*Phase: 4-Core Case Shell*
*Context gathered: 2026-05-04*
