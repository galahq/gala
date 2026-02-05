/** @jsx React.createElement */
/* @flow */

import React from 'react'

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

/**
 * Information row component
 */
function InformationRow ({
  label,
  value,
}: {
  label: string,
  value: string | number,
}): React$Node {
  return (
    <div className="c-stats-information__row">
      <span className="c-stats-information__label">{label}</span>
      <span className="c-stats-information__value">{value}</span>
    </div>
  )
}

/**
 * Format date for display
 */
function formatPublishedDate (dateString: ?string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Stats information section component
 * Displays case metadata and all-time statistics
 */
export function StatsInformation ({
  caseInfo,
  allTimeStats,
  msg,
}: Props): React$Node {
  return (
    <div className="c-stats-information__content">
      {caseInfo.case_published_at && (
        <InformationRow
          label={msg('date_published')}
          value={formatPublishedDate(caseInfo.case_published_at)}
        />
      )}
      {caseInfo.case_locales != null && (
        <InformationRow
          label={msg('available_translations')}
          value={caseInfo.case_locales || ''}
        />
      )}
      <InformationRow
        label={msg('total_deployments')}
        value={(caseInfo.total_deployments || 0).toLocaleString()}
      />
      <InformationRow
        label={msg('table_unique_visitors')}
        value={(allTimeStats.total_visits || 0).toLocaleString()}
      />
      <InformationRow
        label={msg('countries')}
        value={allTimeStats.country_count || 0}
      />
    </div>
  )
}

export default StatsInformation
