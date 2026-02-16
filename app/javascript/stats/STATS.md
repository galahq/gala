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
- Frontend Flow types are consolidated in `app/javascript/stats/types.js`.
- Tooltip/legend behavior aligns with current requirements (visitors-focused, equal split bins).
- Accessibility labels and semantic table/map regions are present.

## What Can Be Improved

- `Cases::StatsController` is still large and could be split (query object + CSV presenter).
- Stats controller specs are stale and need cleanup/rewrites for current behavior.
- `CountryReference` remains near class-length thresholds; a small extractor can reduce this.
- End-to-end tests (JSON contract + CSV output + date filtering) should be expanded.
- Map data UX for very small/empty datasets can be simplified further.

## Complexity Assessment

- Overall complexity: **Medium**
- Backend query/merge logic: **Medium**
- Frontend map/table rendering + bins: **Medium**
- Most complexity comes from:
  - normalization of real-world country data
  - date filtering guarantees
  - map rendering edge cases

## Tradeoffs Made

- Kept raw SQL for performance and explicitness vs. more abstract ActiveRecord query chains.
- Kept one service (`CaseStatsService`) for merge + API shaping to reduce controller branching.
- Used frontend normalization (defensive parsing) to handle API safety without extra backend branching.
- Prioritized fewer primary hooks/components over deep component fragmentation.

## Final Cleanup Pass

- Removed a dead React prop path (`messages`) from the Stimulus mount.
- Removed redundant `useStatsTable` return data that was not consumed.
- Replaced remaining hardcoded stats error/loading strings with existing i18n keys.
- Kept tooltip and legend behavior focused on unique visitors with higher-visibility bin labels.

## Recommended Next Steps

1. Extract stats SQL/range binding into `CaseStatsQuery` service object.
2. Add focused request specs for JSON contract and date clamping semantics.
3. Add service specs for `CaseStatsService` + `CountryReference` alias/unknown cases.
4. Move CSV row/header generation into a small presenter for controller size reduction.
5. Add a small frontend integration test for map tooltip + legend rendering from API payload.
