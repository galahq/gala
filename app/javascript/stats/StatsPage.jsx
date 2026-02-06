/** @jsx React.createElement */
/* @flow */

import React from 'react'
import { IntlProvider } from 'react-intl'
import ErrorBoundary from 'utility/ErrorBoundary'
import { formatDateRange, parseLocalDate } from './dateHelpers'
import { useDateRange } from './hooks/useDateRange'
import { useStatsData } from './hooks/useStatsData'

import StatsDateRangePicker from './StatsDateRangePicker'
import StatsMap from './StatsMap'
import StatsTable from './StatsTable'
import { StatsSummary } from './components/StatsSummary'
import { StatsInformation } from './components/StatsInformation'
import {
  MapLoadingOverlay,
  SummaryLoadingSkeleton,
  TableLoadingSkeleton,
  PageLoadingSkeleton,
} from './components/StatsLoading'
import { StatsErrorState } from './components/StatsError'

type Props = {
  dataUrl: string,
  minDate: ?string,
  messages: { [string]: string },
  locale: string,
}

function StatsPage ({
  dataUrl,
  minDate,
  messages,
  locale,
}: Props): React$Node {
  const { range: dateRange, setFromDates } = useDateRange({ minDate })
  const {
    data,
    allTimeStats,
    meta,
    isLoading,
    isInitialLoad,
    error,
    retry,
  } = useStatsData({ dataUrl, dateRange })

  function msg (key: string): string {
    if (!messages) return key
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    const fullKey = `cases.stats.show.${camelKey}`
    return messages[fullKey] != null ? messages[fullKey] : key
  }

  const summary = data?.summary || {}
  const bins = data?.bins?.bins || []
  const rawCountries = data?.countries || []
  const countries = rawCountries.map(row => ({
    iso2: row?.country?.iso2 || row?.iso2,
    iso3: row?.country?.iso3 || row?.iso3,
    name: row?.country?.name || row?.name,
    unique_visits: row?.metrics?.unique_visits || 0,
    unique_users: row?.metrics?.unique_users || 0,
    events_count: row?.metrics?.events_count || 0,
    visit_podcast_count: row?.metrics?.visit_podcast_count || 0,
    first_event: row?.first_event,
    last_event: row?.last_event,
    bin: row?.bin,
  }))
  const hasData = countries.length > 0
  const dateRangeText = formatDateRange(dateRange.from, dateRange.to)
  const caseInfo = (meta && meta.case) ? meta.case : {}
  const statsForInfo = allTimeStats || { total_visits: 0, country_count: 0 }

  const minDateValue = minDate ? parseLocalDate(minDate) : new Date(2000, 0, 1)
  const maxDate = new Date()
  const dateRangeValue = [
    dateRange.from ? parseLocalDate(dateRange.from) : null,
    dateRange.to ? parseLocalDate(dateRange.to) : null,
  ]

  if (isInitialLoad) {
    return (
      <IntlProvider locale={locale} messages={messages}>
        <ErrorBoundary>
          <PageLoadingSkeleton />
        </ErrorBoundary>
      </IntlProvider>
    )
  }

  const showMinHeightMap = !hasData && !isLoading
  const mapContainerClass = showMinHeightMap
    ? 'c-stats-map-container c-stats-map-container--min'
    : 'c-stats-map-container'

  return (
    <IntlProvider locale={locale} messages={messages}>
      <ErrorBoundary>
        <div className="c-stats-page">
          <h2 className="c-stats-information__heading">{msg('overview')}</h2>
          <div className="c-stats-information-container">
            <div className="c-stats-overview-layout">
              <div className="c-stats-information pt-card pt-elevation-1">
                <h3 className="c-stats-information__card-heading">{msg('overview_stats')}</h3>
                <StatsInformation
                  caseInfo={caseInfo}
                  allTimeStats={statsForInfo}
                  msg={msg}
                />
              </div>
              <div className="c-stats-tips pt-callout pt-icon-info-sign">
                <h5 className="pt-callout-title">{msg('about_visitors')}</h5>
                <div className="pt-callout-content">
                  <p>{msg('tips_description')}</p>
                </div>
              </div>
            </div>
          </div>

          <h2 className="c-stats-filter-card__heading">{msg('filter_by_date')}</h2>
          <div className="c-stats-layout">
            <div className="c-stats-picker pt-card pt-elevation-1">
              <StatsDateRangePicker
                className="pt"
                minDate={minDateValue}
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
                  msg={msg}
                  hasData={hasData}
                />
              )}
            </div>
          </div>

          <div className="c-stats-map-table-card pt-card pt-elevation-1">
            <div className="c-stats-map-table-header">
              <h3 className="c-stats-map-table__heading">
                {msg('table_title')}
                {dateRangeText && (
                  <span className="c-stats-map-table__date-range"> {dateRangeText}</span>
                )}
              </h3>
            </div>

            <div className={mapContainerClass}>
              <div className="c-stats-map">
                <div className="c-stats-map__inner">
                  <StatsMap
                    countries={countries}
                    bins={bins}
                  />
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
              <>
                <div className="c-stats-export-button-container">
                  <a
                    download
                    href={`${dataUrl}.csv?from=${dateRange.from || ''}&to=${dateRange.to || ''}`}
                    className="pt-button pt-intent-primary pt-icon-export"
                  >
                    {msg('table_export_csv')}
                  </a>
                </div>

                <div className="c-stats-table-container">
                  <StatsTable data={countries} />
                </div>
              </>
            )}

            {isLoading && !hasData && (
              <div className="c-stats-table-container">
                <TableLoadingSkeleton />
              </div>
            )}
          </div>
        </div>
      </ErrorBoundary>
    </IntlProvider>
  )
}

export default StatsPage
