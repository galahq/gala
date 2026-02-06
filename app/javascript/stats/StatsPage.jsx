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
  publishedAt: ?string,
  messages: { [string]: string },
  locale: string,
}

function StatsPage ({ dataUrl, publishedAt, messages, locale }: Props): React$Node {
  const { range: dateRange, setFromDates } = useDateRange({ publishedAt })
  const {
    data,
    allTimeStats,
    caseSummary,
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

  const formatted = data?.formatted || []
  const summary = data?.summary || {}
  const hasData = formatted.length > 0
  const dateRangeText = formatDateRange(dateRange.from, dateRange.to)
  const caseInfo = summary.case_locales ? summary : caseSummary || {}
  const statsForInfo = allTimeStats || { total_visits: 0, country_count: 0 }

  const minDate = publishedAt ? parseLocalDate(publishedAt) : new Date(2000, 0, 1)
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
                minDate={minDate}
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
                  <StatsMap countries={formatted} bins={summary.bins || []} />
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
                  <StatsTable data={formatted} />
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
