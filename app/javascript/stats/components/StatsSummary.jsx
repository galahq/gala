/** @jsx React.createElement */
/* @flow */

import React from 'react'
import StatsKeyValueList from './StatsKeyValueList'

type SummaryData = {
  total_visits?: number,
  country_count?: number,
  total_podcast_listens?: number,
}

type Props = {
  summary: SummaryData,
  dateRangeText: string,
  msg: (key: string) => string,
  hasData: boolean,
}

function NoDataState ({ msg }: { msg: (key: string) => string }): React$Node {
  return (
    <div className="c-stats-summary__no-data">
      {msg('no_data')}
    </div>
  )
}

export function StatsSummary ({
  summary,
  dateRangeText,
  msg,
  hasData,
}: Props): React$Node {
  if (!hasData) {
    return <NoDataState msg={msg} />
  }

  const rows = [
    {
      label: msg('table_unique_visitors'),
      value: (summary.total_visits || 0).toLocaleString(),
    },
    {
      label: msg('countries'),
      value: summary.country_count || 0,
    },
    {
      label: msg('podcast_listens_short'),
      value: (summary.total_podcast_listens || 0).toLocaleString(),
    },
  ]

  const header = dateRangeText ? (
    <div className="c-stats-summary__header">
      <h3>{msg('filtered_stats')}</h3>
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

export default StatsSummary
