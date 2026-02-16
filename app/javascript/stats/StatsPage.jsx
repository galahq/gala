/** @jsx React.createElement */
/* @flow */

import React from 'react'
import { injectIntl } from 'react-intl'
import ErrorBoundary from 'utility/ErrorBoundary'
import { formatDateRange, parseLocalDate } from './dateHelpers'
import { useDateRange } from './hooks/useDateRange'
import { useStatsData } from './hooks/useStatsData'

import StatsDateRangePicker from './StatsDateRangePicker'
import StatsMap from './StatsMap'
import StatsTable from './StatsTable'
import StatsSummary from './components/StatsSummary'
import {
  MapLoadingOverlay,
  SummaryLoadingSkeleton,
  TableLoadingSkeleton,
  PageLoadingSkeleton,
} from './components/StatsLoading'
import { StatsErrorState } from './components/StatsError'
import type {
  StatsCountryRow,
  StatsSummary as StatsSummaryData,
} from './types'

type Props = {
  dataUrl: string,
  minDate: ?string,
  intl: any,
}

function StatsPage ({ dataUrl, minDate, intl }: Props): React$Node {
  const { range: dateRange, setFromDates } = useDateRange({ minDate })
  const {
    data,
    isLoading,
    isInitialLoad,
    error,
    retry,
  } = useStatsData({ dataUrl, dateRange })

  const formatted: StatsCountryRow[] = data ? data.formatted : []
  const summary: StatsSummaryData = data
    ? data.summary
    : {
        total_visits: 0,
        country_count: 0,
        total_podcast_listens: 0,
        bins: [],
        bin_count: 0,
      }
  const hasData = formatted.length > 0
  const dateRangeText = formatDateRange(dateRange.from, dateRange.to)

  const pickerMinDate = minDate ? parseLocalDate(minDate) : new Date(2000, 0, 1)
  const maxDate = new Date()

  // Parse and clamp dates to be within valid bounds
  const parsedFrom = dateRange.from ? parseLocalDate(dateRange.from) : null
  const parsedTo = dateRange.to ? parseLocalDate(dateRange.to) : null
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
          <StatsDateRangePicker
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
              <StatsMap countries={formatted} bins={summary.bins} />
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
                href={`${dataUrl}.csv?from=${dateRange.from || ''}&to=${dateRange.to || ''}`}
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
