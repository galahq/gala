# Upgrade Plan: React 19 + BlueprintJS 6

**Status:** Planned — not started
**Author:** Michael Li · **Created:** 2026-06-08 · **Revised:** 2026-06-08 (after cross-check vs PR #785)
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

| # | Commit | Scope |
|---|---|---|
| 1 | `build(deps): React 16→19 + createRoot entrypoints` | react/react-dom→^19.2.7; add `react-lifecycles-compat`, pin `react-is`. 6 `ReactDOM.render`→`createRoot` (5 `packs/*.entry.jsx` + `case_stats_controller.js`); `unmountComponentAtNode`→`root.unmount()`. Remove 3 `findDOMNode` imports → refs. |
| 2 | `build(deps): react-redux 5→9` | `react-redux`→^9. 52 `connect` sites (no deprecated options found). Fixes the Phase 0 hard break. |
| 3 | `build(deps): draft-js 0.10.5→0.11.7` | + linkify/markdown minors. Deep import path intact. |
| 4 | `build(deps): react-intl 2→5` ⚠️ largest | +`@formatjs/*`/`intl-messageformat`; remove 14 `addLocaleData` + `react-intl/locale-data/*`; `FormattedRelative`→`FormattedRelativeTime` (6). Splittable 4a/4b. |
| 5 | `build(deps): BlueprintJS 4→6` ⚠️ large | core/select/datetime/icons→6 + `@blueprintjs/colors`, `@floating-ui/react(-dom)`, `react-day-picker@8`, `react-transition-group`→4. Merge 1 popover2 import; icon/prop/class renames across 70 files; datetime. Splittable 5a/5b/5c. |
| 6 | `fix(ui): restore brand colors lost in Blueprint upgrade` | known-open regression; SASS/`Colors`. |
| 7 | `chore(react19): drop function-component defaultProps` | 7 files → default params. |

**Exit gate:** full webpack build + frontend tests + visual-regression + preview-deploy smoke of the
runtime-unverified libs (react-beautiful-dnd, react-map-gl, react-spring, full draft-js editor DOM).

## Phase 2 — react-router 4 → 5

**Goal:** the one router move that's actually needed.

- v5 keeps `Switch` and `withRouter`, so this is close to a drop-in from v4 — no mass hook rewrite.
- Bump `react-router`/`react-router-dom` → 5.3.4 and fix the small set of v4→v5 deltas.

**Verify:** navigation across nested case routes, redirects, and deep links work.

## Phase 3 — Close the loop on held libraries

**Goal:** address only the libs Phase 0 proved broken on React 19 (if any).

For each lib that failed verification, take the smallest fix that restores it — a minor bump, a
targeted shim, or (last resort) the modernization upgrade from the follow-up list. If everything
held green in Phase 0, this phase is a no-op.

**Likely candidates to watch:** react-redux 5 (peer range stops at React 16), styled-components 4.

## Phase 4 — Test runner + visual-regression gates

- `react-testing-library@6` / `jest@24` are too old for React 19 — move to
  `@testing-library/react` 16 with Vitest (or modern Jest).
- Refresh Playwright visual baselines for each affected route as you go (reviewed diffs, not blind
  updates).

---

## Optional follow-ups (separate later effort — NOT required for React 19)

Tech-debt paydown, each independently shippable once the upgrade above is stable:

- **react-router 5 → 7** — `withRouter`→hooks (~15 files), `Switch`→`Routes`, `Redirect`→`Navigate`.
- **styled-components 4 → 6**, **react-spring 8 → 10**, **react-popper → 2**. (react-redux 5 → 9 is
  *not* here — it's a required Phase 1 item, not optional.)
- **react-beautiful-dnd → @hello-pangea/dnd** (maintained fork, drop-in).
- **react-map-gl 4 → 7 + mapbox-gl 0.54 → 3** (new token model; verify both map surfaces).
- **Remove recompose** (replace the 2 edgenote-editor usages with hooks).
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
