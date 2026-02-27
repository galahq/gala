/** @jsx React.createElement */
/* @flow */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useReducer,
} from 'react'
import { injectIntl } from 'react-intl'
import ErrorBoundary from 'utility/ErrorBoundary'
import { formatDateRange, parseLocalDate } from './dateHelpers'
import { syncUrlParams } from './urlParams'
import { fetchStats, fetchWithTimeout } from './http/statsHttp'
import {
  buildValidatedRange,
  createInitialState,
  selectCountries,
  selectDateRangeParams,
  selectError,
  selectHasData,
  selectIsInitialLoad,
  selectIsLoading,
  selectSummary,
  statsReducer,
} from './state/statsStore'

import DatePicker from './DatePicker'
import MapContainer from './map/MapContainer'
import StatsTable from './StatsTable'
import StatsSummary from './StatsSummary'
import {
  MapLoadingOverlay,
  SummaryLoadingSkeleton,
  TableLoadingSkeleton,
  PageLoadingSkeleton,
} from './StatsLoading'
import { StatsErrorState } from './StatsError'

declare class AbortController {
  signal: {
    aborted: boolean,
    addEventListener?: (event: 'abort', callback: () => mixed) => mixed,
    removeEventListener?: (event: 'abort', callback: () => mixed) => mixed,
    ...
  };
  abort(): void;
}

type Props = {
  dataUrl: string,
  minDate: ?string,
  intl: any,
}

function StatsPage ({ dataUrl, minDate, intl }: Props): React$Node {
  const initialState = useMemo(() => createInitialState(minDate), [minDate])
  const [state, dispatch] = useReducer(statsReducer, initialState)
  const hasMountedRef = useRef(false)

  const setFromDates = useCallback((from: ?Date, to: ?Date) => {
    dispatch({
      type: 'range/set',
      range: buildValidatedRange(from, to, minDate),
    })
  }, [minDate])

  const retry = useCallback(() => {
    dispatch({ type: 'fetch/retry_requested' })
  }, [])

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      syncUrlParams(state.range.from, state.range.to)
    }, 150)

    return () => window.clearTimeout(timeoutId)
  }, [state.range.from, state.range.to])

  useEffect(() => {
    const abortController = new AbortController()

    const fetchData = async () => {
      dispatch({ type: 'fetch/started' })

      try {
        const nextData = await fetchWithTimeout(
          fetchStats({
            dataUrl,
            params: selectDateRangeParams(state),
            signal: abortController.signal,
          }),
          15000
        )

        dispatch({
          type: 'fetch/succeeded',
          data: nextData,
        })
      } catch (err) {
        if (err && err.name === 'AbortError') {
          return
        }

        console.error('Error fetching stats:', err)
        const error = err instanceof Error ? err : new Error('Unexpected stats fetch error')

        dispatch({
          type: 'fetch/failed',
          error,
        })
      }
    }

    fetchData()

    return () => abortController.abort()
  }, [
    dataUrl,
    state.range.from,
    state.range.to,
    state.refreshKey,
  ])

  const formatted = selectCountries(state)
  const summary = selectSummary(state)
  const hasData = selectHasData(state)
  const isLoading = selectIsLoading(state)
  const isInitialLoad = selectIsInitialLoad(state)
  const error = selectError(state)

  const dateRangeText = formatDateRange(state.range.from, state.range.to)

  const pickerMinDate = minDate ? parseLocalDate(minDate) : new Date(2000, 0, 1)
  const maxDate = new Date()

  // Parse and clamp dates to be within valid bounds.
  const parsedFrom = state.range.from ? parseLocalDate(state.range.from) : null
  const parsedTo = state.range.to ? parseLocalDate(state.range.to) : null
  const clampedFrom = parsedFrom && parsedFrom < pickerMinDate ? pickerMinDate : parsedFrom
  const clampedTo = parsedTo && parsedTo > maxDate ? maxDate : parsedTo

  const dateRangeValue = [clampedFrom, clampedTo]

  if (isInitialLoad) {
    return <PageLoadingSkeleton />
  }

  const showMinHeightMap = !hasData && !isLoading
  const mapContainerClass = showMinHeightMap
    ? 'c-stats-map-container c-stats-map-container--min'
    : 'c-stats-map-container'

  return (
    <ErrorBoundary>
      <h2 className="c-stats-filter-card__heading">
        {intl.formatMessage({ id: 'cases.stats.show.filterByDate' })}
      </h2>
      <div className="c-stats-layout">
        <div className="c-stats-picker pt-card pt-elevation-1">
          <DatePicker
            className="pt"
            minDate={pickerMinDate}
            maxDate={maxDate}
            value={dateRangeValue}
            onRangeChange={setFromDates}
          />
        </div>
        <div className="c-stats-summary pt-card pt-elevation-1">
          {isLoading ? (
            <SummaryLoadingSkeleton />
          ) : (
            <StatsSummary
              summary={summary}
              dateRangeText={dateRangeText}
              hasData={hasData}
            />
          )}
        </div>
      </div>

      <div className="c-stats-map-table-card pt-card pt-elevation-1">
        <div className="c-stats-map-table__header">
          <h3 className="c-stats-map-table__heading">
            {intl.formatMessage({ id: 'cases.stats.show.tableTitle' })}
          </h3>
          {dateRangeText && (
            <span className="c-stats-map-table__date-range">{dateRangeText}</span>
          )}
        </div>

        <div className={mapContainerClass}>
          <div className="c-stats-map">
            <div className="c-stats-map__inner">
              <MapContainer countries={formatted} bins={summary.bins} intl={intl} />
            </div>
            {error && (
              <div className="c-stats-map__overlay c-stats-map__overlay--error">
                <StatsErrorState
                  error={error}
                  isRetrying={isLoading}
                  onRetry={retry}
                />
              </div>
            )}
            {isLoading && (
              <div className="c-stats-map__loading-wrapper">
                <MapLoadingOverlay />
              </div>
            )}
          </div>
        </div>

        {hasData && !isLoading && (
          <div className="c-stats-table-export-layout">
            <div className="c-stats-export-button-container">
              <a
                download
                href={`${dataUrl}.csv?from=${state.range.from || ''}&to=${state.range.to || ''}`}
                className="pt-button pt-intent-primary pt-icon-export"
              >
                {intl.formatMessage({ id: 'cases.stats.show.tableExportCsv' })}
              </a>
            </div>

            <div className="c-stats-table-container">
              <StatsTable data={formatted} />
            </div>
          </div>
        )}

        {isLoading && !hasData && (
          <div className="c-stats-table-container">
            <TableLoadingSkeleton />
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

export default injectIntl(StatsPage)
