/** @jsx React.createElement */
/* @flow */

import React from 'react'
import { injectIntl } from 'react-intl'
import StatsKeyValueList from './StatsKeyValueList'
import type { StatsSummary as StatsSummaryData } from '../types'

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
    <StatsKeyValueList
      baseClassName="c-stats-summary"
      rows={rows}
      className="c-stats-summary__content"
      header={header}
    />
  )
}

export default injectIntl(StatsSummary)
