/** @jsx React.createElement */
/* @flow */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { IntlProvider } from 'react-intl'
import ErrorBoundary from 'utility/ErrorBoundary'
import {
  fetchStats,
  fetchAllTimeStats,
  fetchWithTimeout,
  extractAllTimeStats,
  extractCaseSummary,
  validatePayload,
} from './api'
import { formatDateRange, getTodayIso, validateDateRange, syncUrlParams, getUrlParams, parseLocalDate, formatLocalDate } from './utils'

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

import type { AllTimeStats, CaseSummary } from './api'

// Flow type declaration for AbortController (not built into Flow)
declare class AbortController {
  signal: { aborted: boolean, ... };
  abort(): void;
}

type StatsData = {
  formatted: Array<Object>,
  summary: Object,
}

type DateRange = {
  from: ?string,
  to: ?string,
}

type Props = {
  dataUrl: string,
  publishedAt: ?string,
  messages: { [string]: string },
  locale: string,
}

/**
 * Main Stats Page component
 * Manages all state and renders the complete stats dashboard
 */
function StatsPage ({ dataUrl, publishedAt, messages, locale }: Props): React$Node {
  const [data, setData] = useState<?StatsData>(null)
  const [allTimeStats, setAllTimeStats] = useState<?AllTimeStats>(null)
  const [caseSummary, setCaseSummary] = useState<?CaseSummary>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true)
  const isInitialLoadRef = useRef<boolean>(true)
  const [error, setError] = useState<?Error>(null)
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const urlParams = getUrlParams()
    return {
      from: urlParams.from || null,
      to: urlParams.to || null,
    }
  })

  // Message lookup helper
  function msg (key: string): string {
    if (!messages) return key
    // Convert snake_case to camelCase for i18n key lookup
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    const fullKey = `cases.stats.show.${camelKey}`
    return messages[fullKey] != null ? messages[fullKey] : key
  }

  // Track if allTimeStats has been fetched
  const allTimeStatsFetched = useRef(false)

  // Fetch all-time stats once on mount
  useEffect(() => {
    fetchAllTimeStats(dataUrl)
      .then(payload => {
        setAllTimeStats(extractAllTimeStats(payload))
        setCaseSummary(extractCaseSummary(payload))
        allTimeStatsFetched.current = true
      })
      .catch(err => {
        console.error('Error fetching all-time stats:', err)
        setAllTimeStats({ total_visits: 0, country_count: 0 })
        allTimeStatsFetched.current = true
      })
  }, [dataUrl])

  // Fetch filtered data when date range changes
  // AbortController automatically cancels in-flight requests when deps change
  useEffect(() => {
    const abortController = new AbortController()

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = {}
        if (dateRange.from) params.from = dateRange.from
        if (dateRange.to) params.to = dateRange.to

        const payload = await fetchWithTimeout(
          fetchStats(dataUrl, params, abortController.signal),
          15000
        )

        const validation = validatePayload(payload)

        if (!validation.valid) {
          throw new Error(validation.error)
        }

        setData({
          formatted: validation.formatted,
          summary: validation.summary,
        })

        // Update case summary if available
        if (validation.summary.case_locales) {
          setCaseSummary(extractCaseSummary(payload))
        }
      } catch (err) {
        // Ignore abort errors - they're expected when canceling stale requests
        if (err.name === 'AbortError') {
          return
        }
        console.error('Error fetching stats:', err)
        setError(err)
        setData(null)
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
          if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false
            setIsInitialLoad(false)
          }
        }
      }
    }

    fetchData()

    // Cleanup: abort request when deps change or component unmounts
    return () => abortController.abort()
  }, [dataUrl, dateRange.from, dateRange.to])

  // Handle date range changes from picker with debouncing to prevent rapid updates
  const debounceRef = useRef(null)

  const handleDateRangeChange = useCallback((from: ?Date, to: ?Date) => {
    const fromStr = from ? formatLocalDate(from) : null
    const toStr = to ? formatLocalDate(to) : null
    const today = getTodayIso()

    const validated = validateDateRange(fromStr, toStr, publishedAt, today)

    // Clear any pending debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce the state update to prevent rapid-fire map updates
    debounceRef.current = setTimeout(() => {
      setDateRange({ from: validated.from, to: validated.to })
      syncUrlParams(validated.from, validated.to)
    }, 150)
  }, [publishedAt])

  // Clean up debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const handleRetry = useCallback(() => {
    // Trigger re-fetch by updating a dependency
    setDateRange(prev => ({ ...prev }))
  }, [])

  const formatted = data?.formatted || []
  const summary = data?.summary || {}
  const hasData = formatted.length > 0
  const dateRangeText = formatDateRange(dateRange.from, dateRange.to)
  const caseInfo = summary.case_locales ? summary : caseSummary || {}
  const statsForInfo = allTimeStats || { total_visits: 0, country_count: 0 }

  const minDate = publishedAt ? parseLocalDate(publishedAt) : new Date(2000, 0, 1)
  const maxDate = new Date()

  // Show unified loading skeleton during initial page load
  if (isInitialLoad) {
    return (
      <IntlProvider locale={locale} messages={messages}>
        <ErrorBoundary>
          <PageLoadingSkeleton />
        </ErrorBoundary>
      </IntlProvider>
    )
  }

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
                initialRange={(() => {
                  const f = dateRange.from
                  const t = dateRange.to
                  return f && t ? [parseLocalDate(f), parseLocalDate(t)] : undefined
                })()}
                onRangeChange={handleDateRangeChange}
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

            <div
              className="c-stats-map-container"
              style={!hasData && !isLoading ? { minHeight: '250px', height: '250px' } : undefined}
            >
              <div
                className="c-stats-map"
                style={!hasData && !isLoading ? { minHeight: '250px', height: '250px' } : undefined}
              >
                {error ? (
                  <StatsErrorState
                    error={error}
                    isRetrying={isLoading}
                    onRetry={handleRetry}
                  />
                ) : (
                  <>
                    <div style={{ height: '100%' }}>
                      <StatsMap countries={formatted} bins={summary.bins || []} />
                    </div>
                    {isLoading && (
                      <div className="c-stats-map__loading-wrapper">
                        <MapLoadingOverlay />
                      </div>
                    )}
                  </>
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
