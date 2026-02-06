/** @jsx React.createElement */
/* @flow */

import React from 'react'
import { formatDate } from '../dateHelpers'
import StatsKeyValueList from './StatsKeyValueList'

type CaseInfo = {
  case_published_at?: string,
  case_locales?: string,
  total_deployments?: number,
}

type AllTimeStats = {
  total_visits: number,
  country_count: number,
}

type Props = {
  caseInfo: CaseInfo,
  allTimeStats: AllTimeStats,
  msg: (key: string) => string,
}

export function StatsInformation ({
  caseInfo,
  allTimeStats,
  msg,
}: Props): React$Node {
  const rows = []

  if (caseInfo.case_published_at) {
    rows.push({
      label: msg('date_published'),
      value: formatDate(caseInfo.case_published_at, 'en-US'),
    })
  }

  if (caseInfo.case_locales != null) {
    rows.push({
      label: msg('available_translations'),
      value: caseInfo.case_locales || '',
    })
  }

  rows.push(
    {
      label: msg('total_deployments'),
      value: (caseInfo.total_deployments || 0).toLocaleString(),
    },
    {
      label: msg('table_unique_visitors'),
      value: (allTimeStats.total_visits || 0).toLocaleString(),
    },
    {
      label: msg('countries'),
      value: allTimeStats.country_count || 0,
    }
  )

  return (
    <StatsKeyValueList
      baseClassName="c-stats-information"
      rows={rows}
      className="c-stats-information__content"
    />
  )
}

export default StatsInformation
