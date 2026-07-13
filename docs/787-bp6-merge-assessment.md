# Merge assessment: PR #787 (AWS/SST infra) + the React 19 / Blueprint 6 upgrade

_Generated 2026-06-18. Compares `origin/infra/aws-migration` (PR #787) against branch
`redesign/catalog-home` (the React 19 + Blueprint 6 upgrade)._

## TL;DR

The two efforts are **orthogonal** and the merge is **smaller than it looks**. Recommended
path — **land #787 first, then replay our branch on top** — is ~**1–2 focused days**, almost
all of it in (a) a mechanical "take ours" pass over the Blueprint/app layer, (b) reconciling a
**handful** of analytics files, and (c) verification against #787's AWS asset/font pipeline.

## Branch relationship (measured)

| | value |
|---|---|
| merge-base | `65b74254` ("fix missing translation in account settings form") — the React 16 / Blueprint 4 *compatibility* state, **no AWS infra** |
| #787 ahead of base | **1 commit** (the entire AWS/SST migration, ~570 files — mostly *new* infra files) |
| our branch ahead of base | **295 commits** (React 19 + Blueprint 6 + catalog-home redesign + styling fixes) |

So: our branch does **not** contain #787's infra, and #787 does **not** contain our React19/BP6
upgrade. They diverged from the same BP4 base in different directions.

## Version targets (incompatible — pick ours)

| dep | #787 | ours |
|---|---|---|
| react / react-dom | 16.8.6 | 19.2.7 |
| @blueprintjs/core | 4.20.2 (`bp4-`) | 6.15.0 (`bp6-`) |
| namespace strategy | keep `pt-`, runtime shim mirrors `pt-→bp4-` | codemod `pt-/bp4-→bp6-`, **shim deleted** |
| form builder map | `pt-→bp4-` | `pt-→bp6-` (+ checkbox `control-input`, submit-intent, `bp6-heading`) |
| dnd | react-sortable-hoc | @hello-pangea/dnd |
| draft-js | 0.10.5 | 0.11.7 |
| popover2 | separate pkg | merged into core |
| BP6-only files | — | `blueprint-theme.scss`, `blueprint-icons-font.scss` (don't exist in #787) |

These are mutually exclusive; the BP6 set wins (it's forward). #787's BP4 app-layer churn
(Flow-removal + `bp4-` dual-classing) is **throwaway** once BP6 lands.

## Conflict reality

A raw file-overlap is **498 files**, but that number is misleading:

- **~280 JS + 7 CSS + form builder** — Blueprint-namespace churn only. #787 turned `pt-X` →
  `pt-X bp4-X`; we turned it → `bp6-X`. Git flags both as "same line changed," but the
  resolution is **uniformly "take ours."** Both branches also already removed Flow, so that
  churn *converges* (same end state). → **mechanical, not judgment.**
- **Identical-or-trivial** — many backend/data/config files have **byte-identical or
  whitespace-only** diffs across the two (shared upgrade lineage). Examples verified:
  `catalogData.js` (whitespace-only), `cases_controller.rb` (+187/−3 both), `catalog_controller.rb`,
  `config/webpack/environment.js` (whitespace-only). → **auto-merge.**
- **#787-only, clean-land (72 files)** — SST/AWS (`infra/sst.config.ts`, `bin/sst-db`,
  `bin/ecs-web-repl`, dockerfiles), initializers (`posthog.rb`, `lograge.rb`, `sidekiq.rb`,
  `active_storage_cors.rb`), `application_controller.rb`, `reader_serializer.rb`, rspec
  feature specs, ops docs. Our branch doesn't touch these. → **take #787.**

### The genuinely-manual zone (small)

Files where #787 added **functional** changes a blanket "take ours" would destroy:

| file | why | action |
|---|---|---|
| `package.json` | #787 adds `posthog-js` (and confirm `mapbox-gl` version) | take ours, **add `posthog-js`** |
| `app/javascript/utility/Tracker.jsx` | #787 +52/−45 (analytics) vs ours +10/−40 | merge: keep #787 analytics + our edits |
| `app/javascript/packs/onboarding.js` | #787 wires analytics | merge |
| `app/models/reader.rb` | #787 +20/−1 (SMTP delivery resilience) vs ours +1/−1 | merge (both small) |
| analytics wiring views (`_reader_javascript_tag`, `_footer`) | 787-only, but verify our layout changes don't drop them | spot-check |

That's the real work — roughly **5–10 files** needing eyes, not ~36.

## Recommended execution ("#787 first, replay ours")

1. **Land #787 → `main`** (its own PR; the infra is its purpose).
2. Branch from the new `main`.
3. **Replace the app/Blueprint layer with ours** (avoids hundreds of line-by-line
   `bp4-`-vs-`bp6-` conflicts — BP6 supersedes BP4 wholesale):
   ```
   git checkout redesign/catalog-home -- \
     package.json pnpm-lock.yaml \
     app/javascript app/assets/stylesheets \
     app/helpers/blueprint_form_builder.rb tests/visual
   # then re-add posthog-js to package.json; re-add #787 analytics in Tracker.jsx/onboarding.js
   ```
   (`blueprint-theme.scss` + `blueprint-icons-font.scss` come along automatically — they're ours-only.)
4. **Keep #787's infra** — it's untouched by step 3 (different files).
5. **Manually reconcile** the ~5–10 analytics/deps/`reader.rb` files above.
6. `pnpm install` (React19/BP6), build, `pnpm test` (vitest), `pnpm test:invariants`, and the
   visual checks.

If #787's single squashed commit can't be cleanly cherry-picked apart from its BP4 bump,
that's fine here — step 3 discards the BP4 app churn anyway; you only need #787's infra files,
which are additive.

## Effort estimate: ~1–2 focused days

| bucket | effort |
|---|---|
| app-layer "take ours" + build green | ~half day |
| analytics/deps/`reader.rb` reconcile (~5–10 files) | ~half day |
| verification (build, vitest, invariants, **visual sweep on AWS asset/font pipeline**) | ~half–1 day |

**Risk: low for the app layer** (BP6 is the clear target), **moderate only around analytics**
(don't lose #787's posthog wiring) **and asset/font delivery** (#787's whole point is serving
Blueprint fonts + ActiveStorage from AWS — re-confirm the BP6 icon font + theme load correctly
on that pipeline, since our `blueprint-icons-font.scss` depends on the shipped font files).

## Why this order over "ours first + cherry-pick infra"

- Infra ships cleanly as its own PR; no extraction needed.
- App layer becomes **replace, not merge** (BP6 over BP4).
- Flow-removal converges instead of fighting.
- The ~5–10-file manual zone exists in *either* direction, so this order doesn't add cost.

## Note

#787 is **not a spec to match** — it's a parallel infra track. The compatibility-first
reference for the upgrade itself was PR #785; we intentionally went past it to Blueprint 6.
See `docs/blueprint-migration-styling-audit.md` for the BP6 styling work and the 9 BP2→BP6
regressions fixed so far.
