# Stats Feature Architecture

## Purpose

The stats page shows visitor analytics for a case:

- date range filtering
- summary metrics
- map visualization
- country table
- CSV export

## Entry Points

- `app/javascript/controllers/case_stats_controller.js`
  - Thin Stimulus wrapper that mounts the React app.
- `app/javascript/stats/StatsPage.jsx`
  - Orchestrates data hooks and renders the UI.

## File Structure

```
app/javascript/stats/
├── StatsPage.jsx             - Page composition + layout
├── StatsMap.jsx              - Mapbox map and overlays (always mounted)
├── StatsTable.jsx            - Country table
├── StatsDateRangePicker.jsx  - Controlled Blueprint picker
├── api.js                    - API fetching + payload validation
├── colors.js                 - Bin palette for the map
├── dateHelpers.js            - Date parsing/formatting/range validation
├── urlParams.js              - URL query param sync for date range
│
├── hooks/
│   ├── useDateRange.js       - URL-synced range state + debounce
│   ├── useStatsData.js       - Fetching, loading, error, retry
│   └── useStatsTable.js      - Sorting and formatting
│
├── components/
│   ├── StatsKeyValueList.jsx - Shared row list for summary + info
│   ├── StatsLoading.jsx      - Skeleton + loading UI
│   ├── StatsInformation.jsx  - Case metadata + all-time stats
│   ├── StatsSummary.jsx      - Filtered stats summary
│   └── StatsError.jsx        - Non-ideal state with retry
│
	└── map/
	    ├── index.js              - Barrel exports
	    ├── mapConfig.js          - Mapbox runtime config
	    ├── mapLayers.js          - Layer definitions
	    ├── mapErrors.js          - Map error parsing
	    ├── useTooltipPosition.js - Tooltip positioning
	    ├── MapLegend.jsx         - Legend UI
	    ├── MapTooltip.jsx        - Tooltip UI
	    └── MapErrorBoundary.jsx  - Error boundary + map states
```

## Data Flow

1. `case_stats_controller.js` mounts `StatsPage` with `dataUrl`, `minDate`, and i18n messages.
2. `useDateRange` initializes the range from URL params.
   - If URL params are missing, it defaults to `minDate → today`.
3. `useStatsData` fetches filtered stats whenever the range changes.
4. `StatsPage` renders the map, summary, and table using loading/error state.
5. `StatsMap` fetches GeoJSON for the country boundaries and applies bin colors.

## Mapbox Constraints

- The map must remain mounted to avoid Mapbox initialization errors.
- Empty and error states are overlays, not replacements.
- Layer colors update via `setPaintProperty` after the map loads.

## Styling

- Stats-specific styles live in `app/assets/stylesheets/Statistics.sass`.
- Styled-components are not used in this feature.
- Small shared layout rules are expressed with SASS mixins.

## Key Helpers

- `dateHelpers.formatDate` handles date-only strings and timestamps.
- `urlParams.syncUrlParams` keeps the URL in sync with the picker.
- `useStatsTable` keeps unknown countries sorted to the bottom.
