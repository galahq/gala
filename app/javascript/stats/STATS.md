# Stats Feature Architecture

## Scope

This document covers the stats feature across:

- Rails controller/service data pipeline
- React stats UI and map/table rendering
- API JSON contract used by the frontend

## High-Level Flow

1. `Cases::StatsController#show` handles `html`, `json`, and `csv`.
2. HTML response loads overview-only data (`@all_time_summary`, `@stats_locales`, `@min_date`).
3. JSON response returns filtered country stats as `{ data: [...] }`.
4. React (`app/javascript/stats`) fetches JSON via Orchard, normalizes rows, computes bins, and renders:
   - date picker
   - summary
   - map + tooltip + legend
   - country table

## Backend Data Path

### Controller

- File: `app/controllers/cases/stats_controller.rb`
- Responsibilities:
  - auth + authorization
  - request date-range normalization
  - SQL execution
  - response format selection (`html`, `json`, `csv`)

### Service

- File: `app/services/case_stats_service.rb`
- Responsibilities:
  - country normalization + merge (`CountryReference`)
  - summary totals
  - explicit API response shaping via `api_data`

### Country Resolution

- File: `app/services/country_reference.rb`
- Responsibilities:
  - load + cache ISO reference map
  - resolve ISO2/ISO3/name aliases
  - normalize unknown/missing values

## JSON Contract

The frontend consumes:

```json
{
  "data": [
    {
      "country": {
        "iso2": "US",
        "iso3": "USA",
        "name": "United States"
      },
      "metrics": {
        "unique_visits": 10,
        "unique_users": 7,
        "events_count": 32,
        "visit_podcast_count": 11
      },
      "first_event": "2024-02-27T10:21:07Z",
      "last_event": "2025-07-13T05:39:05Z"
    }
  ]
}
```

## What Is Working Well

- API shape is explicit and stable from controller/service to frontend.
- All-time overview query now runs only for HTML overview render, not JSON/CSV.
- Date-range logic is centralized and easier to reason about.
- Date picker shortcut selection now relies on component state (`selectedShortcutIndex`) without DOM observers.
- Frontend Flow types now live close to state in `app/javascript/stats/state/types.js`.
- Tooltip/legend behavior aligns with current requirements (visitors-focused, equal split bins).
- Accessibility labels and semantic table/map regions are present.

## Current Snapshot (February 16, 2026)

- Frontend stats module size: **27 files**, **~3,286 LOC**.
- Largest files:
  - `map/MapView.jsx` (396 LOC)
  - `map/MapContainer.jsx` (309 LOC)
  - `StatsPage.jsx` (248 LOC)
  - `state/statsStore.js` (211 LOC)
- Complexity concentration:
  - Map orchestration + map rendering concerns are the heaviest.
  - Page orchestration is much better than before, but still has fetch + URL + UI mode coordination.
  - HTTP/response and reducer boundaries are clear and comparatively low complexity.

## Naming And Responsibility Map

This is the current intent-first naming model.

| Path | Responsibility |
| --- | --- |
| `StatsPage.jsx` | Page orchestrator: coordinates date range, URL sync, data fetching, and top-level render states. |
| `DatePicker.jsx` | Date picker UI + date shortcut behavior. |
| `StatsTable.jsx` | Country table rendering and sorting behavior. |
| `urlParams.js` | URL parsing and serialization. |
| `http/statsHttp.js` | HTTP request lifecycle: endpoint normalization, timeout, abort, cache, Orchard call. |
| `http/statsResponse.js` | API response parsing + normalization from transport payload to frontend model. |
| `bins.js` | Binning math and bin assignment logic. |
| `state/statsStore.js` | Actions, reducer, selectors, and page-level state transitions. |
| `state/types.js` | Shared Flow types for state/data contracts and consumers. |
| `map/MapContainer.jsx` | Mapbox stateful container (imperative lifecycle, hover, errors, viewport, tooltip positioning). |
| `map/MapView.jsx` | Map render view with inlined legend/tooltip/error/empty presentation. |
| `map/mapContainerState.js` | Map container reducer/state slices and action transitions. |
| `map/mapEngine.js` | Imperative Mapbox operations (`applyMapLoadPresentation`, fill color application, map instance resolution). |
| `map/mapColors.js` | Map and bin color palette + text contrast helpers. |

## Complexity Ranking (Current)

Scores are 1 (low) to 5 (high).

| Area | Score | Why It Is Complex Now |
| --- | --- | --- |
| Map subsystem (`MapContainer` + `MapView` + map helpers) | **3.7 / 5** | State slices and imperative boundaries are now explicit, but `MapView` is still a large mixed-responsibility render module. |
| Page orchestration (`StatsPage` + `state/statsStore`) | **3.4 / 5** | Centralized reducer is good, but one component still coordinates URL sync, fetch lifecycle, retries, loading/error overlays, and section rendering. |
| Date picker integration (`DatePicker`) | **2.3 / 5** | Uses value-derived shortcut selection with no DOM mutation side effects. |
| Table behavior (`StatsTable`) | **2.6 / 5** | Sort + known/unknown partitioning is straightforward but still mixed with rendering concerns. |
| Data boundary (`http/statsResponse.js` + `http/statsHttp.js`) | **2.2 / 5** | Mostly clean; complexity comes from caching + abort/timeout plumbing. |
| Backend controller/service path | **3.3 / 5** | Controller remains multi-responsibility, and test coverage still needs strengthening for long-term confidence. |

**Overall complexity rank:** **2.9 / 5 (Medium, trending down)**.

## Best Opportunities To Cut More Complexity

Ordered by impact-to-risk.

1. **Extract `MapView` presentation helpers**
   - Pull out pure helper functions for legend segment style, tooltip visual state, and optional debug details.
   - Keep JSX readable while retaining one view file.
   - Expected effect: lower cognitive load in `MapView.jsx` without adding behavior hooks.

2. **Harden map interaction tests around `MapContainer` behavior**
   - Add tests for hover lookup via ISO3 and name fallback.
   - Add tests for tooltip positioning dispatch and retry lifecycle reset.
   - Expected effect: safer future refactors in the highest-complexity area.

3. **Split `StatsPage.jsx` by layout sections, not behavior hooks**
   - Keep reducer/fetch orchestration in `StatsPage`.
   - Extract tiny presentational sections (picker panel, summary panel, map/table panel) as plain components in the stats root or colocated by section.
   - Expected effect: lower cognitive load without reintroducing distributed state.

4. **Consolidate table derivations**
   - Move sorting/partition functions into pure helpers (same file is fine) to reduce JSX + logic interleaving.
   - Expected effect: simpler render function and easier unit testing for sort behavior.

5. **Backend boundary cleanup for parity with frontend simplification**
   - Extract `CaseStatsQuery` (SQL/date binding) and `StatsCsvPresenter` (CSV serialization) from controller.
   - Expected effect: smaller controller and cleaner responsibilities across formats.

## What Should Stay As-Is (Do Not Re-Complexify)

- Keep `state/statsStore.js` reducer/selectors as the single page state model.
- Keep `http/statsResponse.js` + `http/statsHttp.js` as explicit response/transport boundaries.
- Keep map imperative code behind `MapContainer`; avoid scattering Mapbox logic back into page-level code.
- Keep URL sync centralized in `StatsPage` rather than in multiple child hooks.

## Frontend Refactor Status

- **PR1 (Contracts + Query Boundary)**:
  - Added response normalization and transport boundaries.
  - Current names: `http/statsResponse.js` and `http/statsHttp.js`.
- **PR2 (Page State Model)**:
  - Added page reducer/selectors and moved range/fetch orchestration into `StatsPage`.
  - Current names: `state/statsStore.js` and `state/types.js`.
  - Removed `hooks/useDateRange.js` and `hooks/useStatsData.js`.
- **PR3 (Map Adapter Split)**:
  - Split map into a stateful container and render-only view.
  - Current names: `map/MapContainer.jsx` and `map/MapView.jsx`.
  - Removed map synchronization hooks and deleted `map/index.js`.
- **PR4 (Render Simplification + Hook Cleanup)**:
  - Inlined summary key/value rendering in `StatsSummary.jsx`.
  - Inlined table/date-picker hook behavior into component files.
  - Removed `hooks/useStatsTable.js`, `hooks/useDateRangeShortcutClassSync.js`, and `components/StatsKeyValueList.jsx`.
- **PR5 (Wrapper Removal / Surface Area Reduction)**:
  - Removed wrapper files `api.js`, `statsApi.js`, `StatsMap.jsx`, and `primitives.jsx`.
  - `StatsPage` now depends directly on `map/MapContainer` and `http/statsHttp`.
  - Stats frontend reduced from 29 to 25 files at the end of PR5.
- **PR6 (Intent-First Naming Pass)**:
  - Renamed modules to match responsibilities:
    - `StatsDateRangePicker.jsx` -> `DatePicker.jsx`
    - `boundaries/statsQuery.js` -> `http/statsHttp.js`
    - `contracts.js` -> `http/statsResponse.js`
    - `statsState.js` -> `state/statsStore.js`
    - `types.js` -> `state/types.js`
    - `map/MapAdapter.jsx` -> `map/MapContainer.jsx`
  - Split binning math from palette:
    - Added `bins.js` (bin logic)
    - Added `map/mapColors.js` (map color system)
    - Removed `colors.js`
- **PR7 (Date Picker State Simplification)**:
  - Removed `syncShortcutActiveClass` and `MutationObserver`-based DOM syncing from `DatePicker.jsx`.
  - Retained shortcut highlighting via `selectedShortcutIndex`.
  - Simplified shortcut CSS to style only Blueprint’s `.pt-active` class.
  - Added `DatePicker` unit test coverage.
- **PR8 (Map Presentation Consolidation)**:
  - Inlined map presentation UI into `map/MapView.jsx`:
    - legend
    - tooltip
    - map error/empty states
  - Removed `map/legend.jsx`, `map/tooltip.jsx`, and `map/errorComponents.jsx`.
  - Kept `MapContainer.jsx` as the imperative Mapbox state boundary.
- **PR9 (Map State Machine + Engine Boundary)**:
  - Added `map/mapContainerState.js` with reducer-managed slices:
    - `lifecycle`
    - `interaction`
    - `viewport`
  - Refactored `MapContainer.jsx` to dispatch actions instead of coordinating many `useState` setters.
  - Added `map/mapEngine.js` and moved imperative Mapbox operations there.
  - Added indexed country lookup maps (ISO3 + normalized name) for O(1) hover country resolution.
  - Dev-gated map debug details in `MapView.jsx` (`NODE_ENV !== 'production'`).
  - Added unit coverage for reducer and engine behavior via `__tests__/mapInternals.test.js`.

## Recommended Next Steps

1. Extract small pure helpers from `MapView.jsx` (`legend segment style`, `tooltip color selection`, debug display guard) to reduce file density.
2. Add deeper map interaction tests (ISO3/name fallback hover lookup, tooltip positioning, retry reset behavior).
3. Add table sorting pure-function tests for `StatsTable.jsx`.
4. Split `StatsPage.jsx` into small presentational sections while keeping orchestration centralized.
5. In parallel on backend, extract query and CSV presenter from controller and add request/service specs for date clamping + contract guarantees.
