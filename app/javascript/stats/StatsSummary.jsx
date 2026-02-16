/** @jsx React.createElement */
/* @flow */

import React from 'react'
import { injectIntl } from 'react-intl'
import type { StatsSummary as StatsSummaryData } from './state/types'

type Props = {
  summary: StatsSummaryData,
  dateRangeText: string,
  hasData: boolean,
  intl: any,
}

function NoDataState ({ intl }: { intl: any }): React$Node {
  return (
    <div className="c-stats-summary__no-data">
      {intl.formatMessage({ id: 'cases.stats.show.noData' })}
    </div>
  )
}

export function StatsSummary ({
  summary,
  dateRangeText,
  hasData,
  intl,
}: Props): React$Node {
  if (!hasData) {
    return <NoDataState intl={intl} />
  }

  const rows = [
    {
      label: intl.formatMessage({ id: 'cases.stats.show.tableUniqueVisitors' }),
      value: summary.total_visits.toLocaleString(),
    },
    {
      label: intl.formatMessage({ id: 'cases.stats.show.countries' }),
      value: summary.country_count,
    },
    {
      label: intl.formatMessage({ id: 'cases.stats.show.podcastListensShort' }),
      value: summary.total_podcast_listens.toLocaleString(),
    },
  ]

  const header = dateRangeText ? (
    <div className="c-stats-summary__header">
      <h3>{intl.formatMessage({ id: 'cases.stats.show.filteredStats' })}</h3>
      <span className="c-stats-summary__date-range">{dateRangeText}</span>
    </div>
  ) : null

  return (
    <div className="c-stats-summary__content">
      {header}
      {rows.map((row, index) => (
        <div className="c-stats-summary__row" key={index}>
          <span className="c-stats-summary__label">{row.label}</span>
          <span className="c-stats-summary__value">{row.value}</span>
        </div>
      ))}
    </div>
  )
}

export default injectIntl(StatsSummary)
