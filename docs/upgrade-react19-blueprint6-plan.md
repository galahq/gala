# Upgrade Plan: React 19 + BlueprintJS 6

**Status:** Phase 1 + Phase 4 done on `redesign/catalog-home` — React 19 + Blueprint 6 + react-router 5
+ react-redux 9 + react-intl 5 + draft-js 0.11.7, build green, app runtime-verified in-browser, and the
frontend test suite migrated to Vitest (103 passing). Remaining: Playwright visual baselines + optional modernizations.
**Author:** Michael Li · **Created:** 2026-06-08 · **Revised:** 2026-06-09
**Scope:** Frontend major upgrade. React 16.8 → 19, BlueprintJS 4 → 6, and the minimum
supporting-library changes required to get there.

This is a milestone-sized effort, not a trivial bump, but it is **smaller than first assumed.**
A teammate (Nathan Papes) already produced a working-draft version of this upgrade in
**galahq/gala [PR #785](https://github.com/galahq/gala/pull/785)** (the React/Blueprint upgrade is
bundled into the large AWS/SST branch, despite that PR's "infra POC" title). That PR is our
reference implementation. This plan adopts its **compatibility-first** strategy as the baseline and
treats deeper modernization as optional follow-up.

---

## Goal

Run the latest React and BlueprintJS while keeping every route working and looking
recognizably like today's Gala. No regression in the case reader, editor, comments, catalog,
maps, or admin surfaces.

## Strategy: compatibility-first, then optional modernization

Two philosophies were considered:

| | **Compatibility-first (chosen)** | Modernize-the-stack (deferred) |
|---|---|---|
| React + Blueprint | latest (19 / 6) | latest (19 / 6) |
| Supporting libs | **hold**, bump only what must move | upgrade/replace everything |
| draft-js | **bump 0.10.5 → 0.11.7, keep** | replace with Lexical |
| react-router | **4 → 5** (near drop-in) | 4 → 7 (rewrite) |
| react-redux / styled-components / react-spring / maps / dnd | **hold** (lifecycle shim) | 9 / 6 / 10 / 7 / @hello-pangea |
| Effort | weeks | months |
| Risk | held libs may break at runtime → must verify | larger diff, more rewrites |

We take compatibility-first because a reference implementation exists and it dramatically shrinks
scope. The modernization items are real tech-debt paydown but are **not prerequisites for React 19**
and are split into a separate, later effort (see "Optional follow-ups").

### Why draft-js does **not** need replacing (corrects an earlier assumption)

An early spike concluded draft-js had to be replaced with Lexical because it uses the
React-19-removed `findDOMNode`. **That was measured against the held 0.10.5.** Direct comparison:

| | draft-js 0.10.5 | draft-js 0.11.7 |
|---|---|---|
| `findDOMNode` | 12 lib files | **0** |
| `createFactory` | — | **0** |
| legacy context / `ReactDOM.render` | — | **0** |

The one-line bump to 0.11.7 removes the exact blocker. So the multi-week editor migration is **out
of the critical path**; keep draft-js for now. (If Gala later wants off the abandoned draft-js, that
work is scoped under "Optional follow-ups" and a headless PoC already proved a lossless
draft-raw ⇄ Lexical converter is feasible — see spike artifacts.)

## Guiding principles

1. **One concern per phase, verified before the next.** Smaller blast radius, bisectable failures.
2. **React + Blueprint are the destination; hold the rest** unless a lib genuinely breaks on React 19.
3. **Verify held libs at runtime, not just at build.** The risky failures here compile fine and
   break in the browser (e.g. react-redux 5, styled-components 4 on React 19).
4. **Production safety is non-negotiable.** Live app on Heroku; AWS is a parallel candidate. No
   upgrade work touches deployment, DNS, the database, or the `msc-gala` S3 bucket. Validate on a
   preview before any cutover.
5. **Each phase ends green:** install + production webpack build + frontend tests + targeted
   manual/visual check of the affected routes.

## Target versions (compatibility-first — mirrors PR #785)

| Package | From | To | Note |
|---|---|---|---|
| react / react-dom | 16.8.6 | **19.2.x** | |
| @blueprintjs/core (+ icons/select/datetime/colors) | 4.20.x | **6.x** | |
| @floating-ui/react(-dom) + react-day-picker | — | **add** | Blueprint 6 ecosystem (replaces popover2/popper) |
| react-router / react-router-dom | 4.3 | **5.3.4** | near drop-in; keeps `Switch`/`withRouter` |
| react-intl | 2.x | **5.x** | required for React 19 |
| react-transition-group | 2.5 | **4.x** | |
| react-lifecycles-compat | — | **add** | bridges legacy lifecycle methods |
| draft-js | 0.10.5 | **0.11.7** | bump, not replace — ✅ verified core works on React 19 |
| react-beautiful-dnd | 10.x | **10.1.1** | held — ⚠️ runtime-unverified (needs browser) |
| **react-redux** | 5.1 | **9.x** | ⛔ **MUST upgrade — v5 is a hard runtime break on React 19** (see Phase 0) |
| styled-components | 4.1 | **4.4.x** | held — ✅ verified renders on React 19 |
| react-spring | 8.0 | **8.0.27** | held — ⚠️ runtime-unverified |
| react-map-gl / mapbox-gl | 4.1 / 0.54 | **4.1.16 / 0.54.1** | held — ⚠️ runtime-unverified |
| recompose | 0.30 | **kept** | only non-`createFactory` fns are used |

> **PR #785 holds react-redux at 5.1.2 — this does not work.** We diverge here on purpose; v9 is required (see Phase 0 results).

> **Env note:** the repo `engines` wants Node `>=24 <25`. Match the dev/CI Node version before
> starting; the spike ran on Node 22 with only an engine warning.

---

## Phase 0 — Validate the reference (PR #785) — ✅ DONE 2026-06-08

PR #785's branch (`infra/sst-aws-poc`) was checked out into a worktree, installed, and built.
Results:

| Check | Result |
|---|---|
| Vite production build (all chunks) | ✅ clean — no errors (PR #785 also swapped Shakapacker/webpack → **Vite**, and Jest → **Vitest**) |
| styled-components 4.4.1 render | ✅ works on React 19 |
| draft-js 0.11.7 core (EditorState/convertToRaw) | ✅ works; **0** `findDOMNode` (vs 12 in 0.10.5) |
| **react-redux 5.1.2 `connect()`** | ⛔ **HARD BREAK** — `Provider` uses `childContextTypes`, removed in React 19. `connect()` can't find the store; every connected component throws. **52 files** use `connect`. |

**Conclusion:** PR #785 *builds* but was never runtime-verified — its held **react-redux 5 would
crash essentially the whole app** on React 19. The rest of the held set checks out at the level we
could test headlessly. So adopt PR #785's approach **with one mandatory deviation: upgrade
react-redux to v9** (still exports `connect`, so the 52 sites largely keep working).

**Still runtime-unverified** (need a browser + the running app, which requires Ruby 4.0.3 locally):
react-beautiful-dnd 10, react-map-gl 4, react-spring 8, and the full draft-js *editor* (DOM). Verify
these on a preview deploy during Phase 1.

## Phase 1 — React 19 + Blueprint 6 core

**Goal:** land React 19 and Blueprint 6 with the minimum supporting changes.

- Bump react/react-dom → 19; convert the 6 `ReactDOM.render` entry points to `createRoot()`
  (`app/javascript/packs/*.entry.jsx`, `controllers/case_stats_controller.js`).
- Bump Blueprint (core/icons/select/datetime/colors) → 6; add `@floating-ui/*` and
  `react-day-picker`; migrate imports off `@blueprintjs/popover2`; apply v5/v6 prop/class/icon
  renames. 69 files import `@blueprintjs/*`.
- Add `react-lifecycles-compat` and pin `react-is` as the legacy-lifecycle bridge.
- Bump `react-intl` 2 → 5, `react-transition-group` 2 → 4, `draft-js` 0.10.5 → 0.11.7.
- ⛔ **Upgrade react-redux 5 → 9** (required — v5 is a hard break on React 19, proven in Phase 0).
  `connect` is still exported in v9, so most of the 52 `connect` sites work unchanged; check for
  removed v6+ options (`withRef` → `forwardRef`, custom `storeKey`, `pure`). `redux` is already 4.x.
- **Resolve the pre-existing brand-color regression** carried over from the last Blueprint jump
  (2→4): brand colors lost on bp4-only elements. Verify against the Heroku reference.

**Verify:** webpack production build clean; frontend tests; visual-regression pass; explicit
brand-color check vs. production; **smoke a redux-connected route, the editor, dnd, and maps on a
preview** (the runtime-unverified items); smoke all major routes.

> **Bundler:** Phase 1 stays on **Shakapacker/webpack**. PR #785 also migrated to Vite — that is
> deliberately *out of scope* here to keep the upgrade reviewable. Vite is a candidate follow-up.

### Phase 1 commit breakdown

Lands on the **`redesign/catalog-home`** branch (per decision 2026-06-08), not a fresh branch off
`main`. Each commit keeps the *build* green; the app is expected to be runtime-broken mid-sequence
(React 19 breaks redux 5 until commit 2) and is validated green at the phase exit gate. Commits are
scoped to upgrade files only — unrelated working-tree changes (`.env.dev`, wireframe PNGs) are left
untouched.

All commits below build green (`pnpm exec webpack --config config/webpack/webpack.config.js`,
0 errors). Headless runtime checks noted where done; full browser/runtime verification is the exit gate.

| # | Commit | Status |
|---|---|---|
| 1 | `build(deps): React 16→19 + createRoot entrypoints` | ✅ done (`7e8f5967`) — 6 render sites; no app-code `findDOMNode` after all |
| 1b | `build(deps): convert remaining react-dom render() controllers to createRoot` | ✅ done (`9af94b5a`) — 3 controllers (`spotlight`/`identicon`/`reading_list`) used a named `render` import, missed by commit 1 |
| 2 | `build(deps): react-redux 5→9` | ✅ done (`70dc7b59`) — runtime-verified `connect()` works on React 19 |
| 3 | `build(deps): draft-js 0.10.5→0.11.7` | ✅ done (`707c0a3a`) — the bump that drops `findDOMNode` |
| 4 | `build(deps): react-intl 2→5` | ✅ done (`b40c4514`) — removed `addLocaleData`/locale-data from 7 sites; `FormattedRelative` shim; runtime-verified |
| 5 | `build(deps): BlueprintJS 4→6` | ✅ done (`1ea0ef0f`) — clean drop-in; only change was `Toaster`→`OverlayToaster` (async-wrapped, fixing a PR #785 latent bug) |
| 5b | `fix(blueprint): drop removed popover2 CSS require (v6)` | ✅ done (`c3fae47d`) — found via Docker run (home page 500); popover2 CSS merged into core |
| — | `build(deps): react-router 4→5` | ✅ done (`3b1d258b`) — **pulled forward from Phase 2**: found via Docker run that react-router 4's legacy context breaks `<Router>` on React 19 (same as redux 5). Required for runtime. |
| 7 | `chore(react19): drop function-component defaultProps` | ✅ done (`c69eba46`) — only 3 were function components; class `static defaultProps` kept |
| — | `build(deps): react-beautiful-dnd → @hello-pangea/dnd` | ✅ done (`2fc04121`) — **pulled forward**: rbd 10 legacy context crashed the case reader on React 19. Drop-in fork; needed `String(draggableId)`. |
| — | `build(deps): remove recompose` | ✅ done (`f009a9cb`) — **pulled forward**: recompose's `createFactory` *crashes* at runtime (not benign). `compose`→redux, `withStateHandlers`→useState HOC. |
| 7 | `chore(react19): drop function-component defaultProps` | ✅ done (`c69eba46`) |
| 6 | `fix(ui): restore brand colors lost in Blueprint upgrade` | ✅ effectively no-op — brand purple intact across home/reader/editor/stats (runtime-verified); a final Heroku side-by-side on the previously-affected elements is still advisable |

**Remaining build warnings:** 2, both benign (entrypoint/asset size limits). All React-19 / Blueprint /
recompose warnings are gone.

**Three "optional follow-ups" turned out to be runtime-REQUIRED** (legacy-context or removed-API
crashes that a green build hides): react-router 4→5, react-beautiful-dnd→@hello-pangea/dnd, and removing
recompose. Lesson: on React 19, any library using legacy context (childContextTypes) or `createFactory`
crashes only at runtime.

**Exit gate:** ✅ met. Build green; runtime smoke done (see below); frontend tests migrated to Vitest
and passing on React 19 (Phase 4). Remaining: capture Playwright visual baselines on a preview, and
the optional modernizations below.

### Running the app locally (for runtime + brand-color verification)

Local Ruby is unavailable (`.ruby-version` pins `4.0.3`; rbenv only has 2.7.6/3.2.9), so use Docker:

```
docker compose up --build           # start web + db + redis  → http://localhost:3000
docker compose run web pnpm install --frozen-lockfile   # sync JS deps into the web container
docker compose run web bash         # shell in the web container
docker compose down                 # stop
```

The stack was already running locally; syncing the container's `node_modules` to the lockfile
(`docker compose exec web pnpm install --frozen-lockfile`) + `docker compose restart web` recompiles
webpack-dev-server with the upgraded deps.

### Runtime verification (Docker, 2026-06-08/09)

Ran the full Phase 1 stack at `localhost:3000` and smoked the key routes in a real browser (Playwright),
signed in via the dev mock Google auth (`config/initializers/mock_omniauth.rb`; granted the dev user an
Editorship to reach edit mode). The green build hid **four** runtime breaks that only a running app
surfaces — all now fixed:

1. **Home 500** — obsolete `@blueprintjs/popover2` CSS require (`c3fae47d`).
2. **`<Router>` invariant** — react-router 4 legacy context (`3b1d258b`, router 5).
3. **Case reader crash** — react-beautiful-dnd 10 legacy context (`2fc04121`, @hello-pangea/dnd + string ids).
4. **`createFactory is not a function`** — recompose on the edgenotes editor (removed; `compose`→redux, `withStateHandlers`→useState HOC).

Routes verified rendering correctly on React 19 + Blueprint 6 + react-router 5 + react-redux 9 +
react-intl 5 + draft-js 0.11.7 + @hello-pangea/dnd:

| Route | Result |
|---|---|
| `/` catalog home | ✅ header, "How Gala works" card, Featured Cases, footer; brand purple intact |
| `/cases/:slug` reader | ✅ draft-js content (read), Table of Contents (@hello-pangea/dnd), react-map-gl marker, Blueprint icons |
| `/cases/:slug/1` + Edit mode | ✅ **draft-js editing** + per-card **FormattingToolbar**; edgenotes editor loads (no recompose crash) |
| `/cases/:slug/stats` | ✅ Blueprint **DatePicker (react-day-picker 8)** dual-calendar with working range selection; 0 errors |
| auth (mock Google) | ✅ sign-in, avatar, "My Cases" |

**react-map-gl 4** mounts and renders markers (blank tiles are the pre-existing dead Mapbox style 404).
**react-spring** animations run via edit-mode transitions without error. **Toaster** was fixed correctly
(async `OverlayToaster.create()` wrapper) but only appears on specific actions — not yet explicitly
triggered; low risk.

Remaining console output is non-blocking: an `isDragging` styled-components-v4 DOM-prop warning (clears
with the optional sc→v6 follow-up's transient props), a "setState during render" warning, the react-intl
`FormattedMessage` list-`key` warning, and the pre-existing Mapbox 404.

## Phase 2 — react-router 5 → 7 *(optional follow-up)*

react-router 4 → 5 was **done in Phase 1** (runtime-required; see above). The further 5 → 7 jump
(`withRouter`→hooks, `Switch`→`Routes`, `Redirect`→`Navigate`) remains an optional modernization, not
a blocker.

## Phase 3 — Close the loop on held libraries

**Goal:** address only the libs Phase 0 proved broken on React 19 (if any).

For each lib that failed verification, take the smallest fix that restores it — a minor bump, a
targeted shim, or (last resort) the modernization upgrade from the follow-up list. If everything
held green in Phase 0, this phase is a no-op.

**Likely candidates to watch:** react-redux 5 (peer range stops at React 16), styled-components 4.

## Phase 4 — Test runner — ✅ DONE 2026-06-09

Migrated Jest 24 → **Vitest** (`f0a8e8e8`); `pnpm test` = `vitest run`. **103 passed, 3 skipped
(pre-existing `xdescribe`), 0 failures.**

- `vitest.config.mjs` — jsdom env; `vite-plugin-babel` with the project `.babelrc.js` (crucially, it
  transforms JSX in `.js` files, which `@vitejs/plugin-react` does not); `@rollup/plugin-yaml`; and
  alias generation replicating webpack's `modulePaths:['app/javascript']` (guarding the `redux` dir
  vs npm `redux` collision).
- `spec/support/vitest-setup.js` — `@testing-library/jest-dom` matchers, RTL cleanup, `jest`→`vi`
  global alias, `jest-fetch-mock`, `xdescribe`/`xit` shims.
- jsdom 11 → 29; `@testing-library/react` 16; dropped jest/babel-jest/react-testing-library/jest-dom/
  yaml-jest + jest.config.js/jest-setup.js.
- Test files: RTL→`@testing-library/react`; `waitForElement`→`waitFor`; `jest.mock`→`vi.mock`;
  updated the popover2 asset-contract test; rewrote the legacy-namespace test's `require`+reset to
  dynamic import.

**⚠️ Forced an extra dependency bump: ramda 0.26 → 0.30.** ramda 0.26's source ESM mis-evaluates
under **Vite 8 / rolldown** (every ramda-importing test file failed to collect with "`then` expected
a Promise"). Tried inline / optimizeDeps exclude+include / both Vite plugins / a Vite 7 pin (blocked
by pnpm's esbuild build-script gate) before bumping ramda, which fixes it. The app uses **no**
functions removed in 0.27–0.30 (all `contains` hits are DOM `classList.contains`), and the webpack
build + in-browser case reader were re-verified — so it's safe app-wide.

**Visual-regression gates** (Playwright baselines per route) remain as a follow-up — the runner
exists (`test:visual`); baselines should be captured/reviewed once the branch is deployed to a preview.

---

## Optional follow-ups (separate later effort — NOT required for React 19)

Tech-debt paydown, each independently shippable once the upgrade above is stable:

- **react-router 5 → 7** — `withRouter`→hooks (~15 files), `Switch`→`Routes`, `Redirect`→`Navigate`.
- **styled-components 4 → 6** — also clears the `isDragging`/`isDraggingOver` DOM-prop console warnings
  (via transient `$`-props); plus **react-spring 8 → 10**, **react-popper → 2**.
- **react-map-gl 4 → 7 + mapbox-gl 0.54 → 3** (new token model; verify both map surfaces). NB the
  current Mapbox *style* URL 404s in dev regardless — a separate, pre-existing data issue.
- **draft-js → Lexical** — migrate the editor off the abandoned draft-js. Keep
  `RawDraftContentState` as the canonical storage format (`cards.raw_content` jsonb) and convert at
  the editor boundary, so the DB, the Ruby `ContentState::Type`, and the Postgres full-text search
  index (`cases_search_index`) are untouched — no production data migration. A headless PoC proved
  the draft-raw ⇄ Lexical round-trip lossless, including comment anchoring via Lexical's `MarkNode`.

---

## Cross-cutting risks

- **Held libraries on React 19** are the main risk — they compile but may break at runtime. Phase 0
  exists to flush this out early. react-redux 5 is the prime suspect.
- **PR #785 is an open POC** — don't assume its choices are proven; that's what Phase 0 confirms.
- **The Blueprint brand-color regression** is a known-open bug; don't let the 4→6 jump bury it.
- **Production safety:** none of this touches Heroku, AWS deploy, DNS, the DB, or the media bucket.

## Rollback

Each phase is a self-contained branch that ends green; revert a phase without losing earlier ones.
Holding draft-js (vs. a Lexical migration) means no data-format change and nothing to roll back there.

## Reference & spike artifacts

- **galahq/gala PR #785** — the teammate's reference implementation (compatibility-first).
- Worktree `../gala-spike-react19`, branch `spike/react-19` — the modernize-path spike (aggressive
  dep bumps + builds).
- `spike-lexical/roundtrip.mjs` — headless draft⇄Lexical round-trip PoC (for the optional editor work).
- Discard the worktree when done: `git worktree remove --force ../gala-spike-react19`.
