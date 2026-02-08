/* @flow */

import React from 'react'

import StatsKeyValueList from './StatsKeyValueList'

type Props = {
  caseInfo: {
    link: string,
    published_at: ?string,
    min_date: ?string,
    max_date: ?string,
    deployments_count: number,
    locales: string[],
  },
  allTimeSummary: {
    total_visits: number,
    country_count: number,
  },
  formatDate: (?string, string) => string,
  locale: string,
  t: (key: string) => string,
}

function StatsInformation ({
  caseInfo,
  allTimeSummary,
  formatDate,
  locale,
  t,
}: Props): React$Node {
  const rows = []

  if (caseInfo.published_at) {
    rows.push({
      label: t('date_published'),
      value: formatDate(caseInfo.published_at, locale),
    })
  }

  const localeList = Array.isArray(caseInfo.locales)
    ? caseInfo.locales.filter(Boolean)
    : []
  const translationsLabel = t('available_translations')
  const displayTranslationsLabel =
    translationsLabel === 'available_translations'
      ? 'Locales'
      : translationsLabel

  if (localeList.length > 0) {
    rows.push({
      label: displayTranslationsLabel,
      value: localeList.join(', '),
    })
  }

  rows.push(
    {
      label: t('total_deployments'),
      value: (caseInfo.deployments_count || 0).toLocaleString(),
    },
    {
      label: t('table_unique_visitors'),
      value: (allTimeSummary.total_visits || 0).toLocaleString(),
    },
    {
      label: t('countries'),
      value: allTimeSummary.country_count || 0,
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
