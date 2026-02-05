/** @jsx React.createElement */
/* @flow */

import React from 'react'

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

/**
 * Summary row component
 */
function SummaryRow ({
  label,
  value,
}: {
  label: string,
  value: string | number,
}): React$Node {
  return (
    <div className="c-stats-summary__row">
      <span className="c-stats-summary__label">{label}</span>
      <span className="c-stats-summary__value">{value}</span>
    </div>
  )
}

/**
 * No data state for summary
 */
function NoDataState ({ msg }: { msg: (key: string) => string }): React$Node {
  return (
    <div
      className="c-stats-summary__no-data"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '120px',
        textAlign: 'center',
        color: '#5c7080',
      }}
    >
      {msg('no_data')}
    </div>
  )
}

/**
 * Stats summary section component
 * Displays filtered statistics for the selected date range
 */
export function StatsSummary ({
  summary,
  dateRangeText,
  msg,
  hasData,
}: Props): React$Node {
  if (!hasData) {
    return <NoDataState msg={msg} />
  }

  return (
    <div className="c-stats-summary__content">
      {dateRangeText && (
        <div className="c-stats-summary__header">
          <h3>{msg('filtered_stats')}</h3>
          <span className="c-stats-summary__date-range">{dateRangeText}</span>
        </div>
      )}
      <SummaryRow
        label={msg('table_unique_visitors')}
        value={(summary.total_visits || 0).toLocaleString()}
      />
      <SummaryRow
        label={msg('countries')}
        value={summary.country_count || 0}
      />
      <SummaryRow
        label={msg('podcast_listens_short')}
        value={(summary.total_podcast_listens || 0).toLocaleString()}
      />
    </div>
  )
}

export default StatsSummary
