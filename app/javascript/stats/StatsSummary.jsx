/* @flow */

import React from 'react'

import StatsKeyValueList from './StatsKeyValueList'

type Props = {
  summary: {
    total_visits: number,
    country_count: number,
    total_podcast_listens: number,
  },
  t: (key: string) => string,
}

function StatsSummary ({ summary, t }: Props): React$Node {
  const rows = [
    {
      label: t('table_unique_visitors'),
      value: (summary.total_visits || 0).toLocaleString(),
    },
    {
      label: t('countries'),
      value: summary.country_count || 0,
    },
    {
      label: t('podcast_listens_short'),
      value: (summary.total_podcast_listens || 0).toLocaleString(),
    },
  ]

  const header = (
    <div className="c-stats-summary__header">
      <h3>{t('filtered_stats')}</h3>
    </div>
  )

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
