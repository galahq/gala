/** @jsx React.createElement */
/* @flow */

import React from 'react'
import { IntlProvider, addLocaleData } from 'react-intl'

import ErrorBoundary from 'utility/ErrorBoundary'
import loadMessages from '../../../config/locales'

import StatsDateRangePicker from './StatsDateRangePicker'

import {
  InformationLoadingSkeleton,
  MapLoadingSkeleton,
  SummaryLoadingSkeleton,
  TableLoadingSkeleton,
} from './StatsLoading'

import {
  formatDate,
  formatDateRange,
  formatLocalDate,
  getTodayIso,
  parseLocalDate,
  useStatsStore,
} from './store'

// $FlowFixMe
const StatsInformation = React.lazy(() => import('./StatsInformation'))
// $FlowFixMe
const StatsMap = React.lazy(() => import('./StatsMap'))
// $FlowFixMe
const StatsSummary = React.lazy(() => import('./StatsSummary'))
// $FlowFixMe
const StatsTable = React.lazy(() => import('./StatsTable'))

type Props = {
  endpoint: string,
  initialCase: {
    link: string,
    published_at: ?string,
    min_date: ?string,
    max_date: ?string,
    deployments_count: number,
    locales: string[],
  },
  locale?: string,
}

async function loadIntlData (
  targetLocale: string
): Promise<{ [string]: string }> {
  const intlData = [
    import(`react-intl/locale-data/${targetLocale.substring(0, 2)}`),
    loadMessages(targetLocale),
  ]

  const [localeData, messages] = await Promise.all(intlData)
  addLocaleData(localeData.default)
  return messages
}

function Stats ({ endpoint, initialCase, locale }: Props): React$Node {
  const currentLocale = locale || 'en'
  const [messages, setMessages] = React.useState({})

  React.useEffect(() => {
    let active = true

    loadIntlData(currentLocale)
      .then(nextMessages => {
        if (!active) return
        setMessages(nextMessages || {})
      })
      .catch(error => {
        if (!active) return
        console.warn('Failed to initialize case stats locale data:', error)
      })

    return () => {
      active = false
    }
  }, [currentLocale])

  const { state, actions, t } = useStatsStore({
    endpoint,
    initialCase,
    messages,
    locale: currentLocale,
  })

  const minDateIso = state.caseInfo.min_date || getTodayIso()
  const maxDateIso = state.caseInfo.max_date || getTodayIso()

  const minDate = parseLocalDate(minDateIso)
  const maxDate = parseLocalDate(maxDateIso)

  const fromDate = state.dateRange.from
    ? parseLocalDate(state.dateRange.from)
    : null
  const toDate = state.dateRange.to ? parseLocalDate(state.dateRange.to) : null
  const dateRangeValue = [fromDate, toDate]

  const dateRangeText = formatDateRange(
    state.dateRange.from,
    state.dateRange.to,
    currentLocale
  )

  const csvParams = new URLSearchParams()
  csvParams.set('from', state.dateRange.from)
  if (state.dateRange.to) {
    csvParams.set('to', state.dateRange.to)
  }

  const rows = state.rangeRows || []
  const showMapSkeleton = !state.rangeLoaded
  const showSummarySkeleton = !state.rangeLoaded || state.isRangeLoading
  const showTableSkeleton = state.isRangeLoading
  const handleRangeChange = actions.setDateRange

  return (
    <IntlProvider locale={currentLocale} messages={messages}>
      <ErrorBoundary>
        <div className="c-stats-page">
          <h2 className="c-stats-information__heading">{t('overview')}</h2>
          <div className="c-stats-information-container">
            <div className="c-stats-overview-layout">
              <div className="c-stats-information pt-card pt-elevation-1">
                <h3 className="c-stats-information__card-heading">
                  {t('overview_stats')}
                </h3>
                {!state.allTimeLoaded ? (
                  <InformationLoadingSkeleton />
                ) : (
                  <React.Suspense fallback={<InformationLoadingSkeleton />}>
                    <StatsInformation
                      caseInfo={state.caseInfo}
                      allTimeSummary={state.allTimeSummary}
                      formatDate={formatDate}
                      locale={currentLocale}
                      t={t}
                    />
                  </React.Suspense>
                )}
              </div>

              <div className="c-stats-tips pt-callout pt-icon-info-sign">
                <h5 className="pt-callout-title">{t('about_visitors')}</h5>
                <div className="pt-callout-content">
                  <p>{t('tips_description')}</p>
                </div>
              </div>
            </div>
          </div>

          <h2 className="c-stats-filter-card__heading">
            {t('filter_by_date')}
          </h2>
          <div className="c-stats-layout">
            <div className="c-stats-picker pt-card pt-elevation-1">
              <StatsDateRangePicker
                className="pt"
                minDate={minDate}
                maxDate={maxDate}
                value={dateRangeValue}
                formatLocalDate={formatLocalDate}
                t={t}
                onRangeChange={handleRangeChange}
              />
            </div>

            <div className="c-stats-summary pt-card pt-elevation-1">
              {showSummarySkeleton ? (
                <SummaryLoadingSkeleton />
              ) : (
                <React.Suspense fallback={<SummaryLoadingSkeleton />}>
                  <StatsSummary summary={state.rangeSummary} t={t} />
                </React.Suspense>
              )}
            </div>
          </div>

          <div className="c-stats-map-table-card pt-card pt-elevation-1">
            <div className="c-stats-map-table-header">
              <h3 className="c-stats-map-table__heading">
                {t('table_title')}
                {dateRangeText && (
                  <span className="c-stats-map-table__date-range">
                    {' '}
                    {dateRangeText}
                  </span>
                )}
              </h3>
            </div>

            <div className="c-stats-map-container">
              <div className="c-stats-map">
                <div className="c-stats-map__inner">
                  {showMapSkeleton ? (
                    <MapLoadingSkeleton />
                  ) : (
                    <React.Suspense fallback={<MapLoadingSkeleton />}>
                      <StatsMap
                        rows={rows}
                        bins={state.bins}
                        t={t}
                      />
                    </React.Suspense>
                  )}
                </div>
              </div>
            </div>

            {showTableSkeleton && (
              <div className="c-stats-table-container">
                <TableLoadingSkeleton />
              </div>
            )}

            {!showTableSkeleton && (
              <div className="c-stats-table-export-layout">
                <div className="c-stats-export-button-container">
                  <a
                    download
                    href={`${endpoint}.csv?${csvParams.toString()}`}
                    className="pt-button pt-intent-primary pt-icon-export"
                  >
                    {t('table_export_csv')}
                  </a>
                </div>
                <div className="c-stats-table-container">
                  <React.Suspense fallback={<TableLoadingSkeleton />}>
                    <StatsTable
                      rows={rows}
                      t={t}
                      locale={currentLocale}
                      formatDate={formatDate}
                    />
                  </React.Suspense>
                </div>
              </div>
            )}

          </div>
        </div>
      </ErrorBoundary>
    </IntlProvider>
  )
}

export default Stats
