# Stats Feature Architecture

## Overview

The case stats page displays visitor analytics for cases, including a world map visualization, date range filtering, summary statistics, and a country-level data table.

## Architecture

The Stimulus controller (`case_stats_controller.js`) serves as a thin wrapper that mounts the React application. All UI logic is handled by `StatsPage.jsx`, which orchestrates the stats dashboard.

### File Structure

```
app/javascript/stats/
├── StatsPage.jsx           (340 lines) - Main orchestrator component
├── StatsMap.jsx            (346 lines) - Interactive Mapbox map
├── StatsTable.jsx          (212 lines) - Country data table with sorting
├── StatsDateRangePicker.jsx (145 lines) - Date range selection
├── api.js                  (167 lines) - API fetching with timeout/abort
├── utils.js                (134 lines) - Date formatting, URL params
├── colors.js               (42 lines)  - Color palette generation
│
├── components/
│   ├── StatsLoading.jsx    (159 lines) - Loading skeletons
│   ├── StatsInformation.jsx (92 lines) - Stats info display
│   ├── StatsSummary.jsx    (97 lines)  - Summary section
│   └── StatsError.jsx      (51 lines)  - Error state component
│
└── map/
    ├── index.js            (24 lines)  - Barrel exports
    ├── mapConfig.js        (34 lines)  - Mapbox configuration
    ├── mapLayers.js        (53 lines)  - Layer definitions
    ├── mapUtils.js         (39 lines)  - Error parsing utility
    ├── useGeoJsonData.js   (73 lines)  - GeoJSON fetching hook
    ├── useTooltipPosition.js (52 lines) - Tooltip positioning hook
    ├── MapLegend.jsx       (152 lines) - Color legend component
    ├── MapTooltip.jsx      (98 lines)  - Hover tooltip
    ├── MapEmptyState.jsx   (37 lines)  - No data overlay
    ├── MapErrorState.jsx   (76 lines)  - Error display
    ├── MapErrorBoundary.jsx (102 lines) - Error boundary
    └── MapTooMuchDataState.jsx (49 lines) - Data limit warning

app/javascript/controllers/
└── case_stats_controller.js (50 lines) - Thin Stimulus wrapper
```

## Key Components

### StatsPage.jsx
- Main orchestrator that fetches and distributes data
- Manages date range state and URL parameter sync
- Handles loading states with unified skeleton during initial load
- Uses `AbortController` for request cancellation

### StatsMap.jsx
- Renders interactive Mapbox GL map with country-level choropleth
- Uses custom hooks for concerns:
  - `useGeoJsonData` - GeoJSON fetching with localStorage caching
  - `useTooltipPosition` - Tooltip positioning calculations
- Handles transient Mapbox errors gracefully
- Always stays mounted to prevent unmount/remount issues

### StatsTable.jsx
- Sortable table of country statistics
- Separates known countries from "Unknown" entries
- Displays totals including unknown visits

### StatsDateRangePicker.jsx
- BlueprintJS DateRangePicker with shortcuts
- Uses local date parsing to avoid timezone issues
- Communicates via React props (not DOM events)

## Custom Hooks

### useGeoJsonData(url)
Returns `{ data, error, isLoading, retry }` for GeoJSON fetching with:
- localStorage caching
- Retry functionality
- Error handling

### useTooltipPosition(hoveredCountry, mousePosition, tooltipRef, mapRef)
Returns calculated `{ left, top }` position for tooltip, handling:
- Viewport overflow detection
- Mouse-relative positioning

## Utilities

### mapUtils.js
- `parseMapError(error)` - Extracts error messages and detects transient errors

### utils.js
- `parseLocalDate(dateStr)` - Parses YYYY-MM-DD as local date (not UTC)
- `formatLocalDate(date)` - Formats Date to YYYY-MM-DD in local time
- `formatDateRange(from, to)` - Human-readable date range
- `syncUrlParams(from, to)` - Updates URL without reload
- `getUrlParams()` - Reads from/to from URL

## Data Flow

1. `case_stats_controller.js` mounts `StatsPage` into the DOM
2. `StatsPage` reads URL params and fetches initial data
3. Data flows down to child components via props
4. Date range changes trigger new fetches with request cancellation
5. Map stays mounted throughout, receiving new data via props
