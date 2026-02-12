/* @flow */
import React from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'

import { useStatsTable } from './hooks/useStatsTable'

type CountryData = {
  iso2: string,
  iso3: string,
  name: string,
  unique_visits: number,
  unique_users: number,
  events_count: number,
  first_event: ?string,
  last_event: ?string,
}

type Props = {
  data: CountryData[],
  intl: any,
}

function StatsTable ({ data, intl }: Props) {
  const {
    sortDirection,
    handleSort,
    countries,
    uncountries,
    totalVisits,
    formatDate,
    isActiveSortField,
  } = useStatsTable(data)

  const SortIcon = ({ field }: { field: string }) => {
    if (!isActiveSortField(field)) {
      return <span className="c-stats-table__sort-icon c-stats-table__sort-icon--inactive">↕</span>
    }
    return (
      <span className="c-stats-table__sort-icon c-stats-table__sort-icon--active">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  const SortableHeaderCell = ({
    field,
    messageId,
  }: {
    field: string,
    messageId: string,
  }) => (
    <th className="c-stats-table__sortable" onClick={() => handleSort(field)}>
      <span className="c-stats-table__header">
        <FormattedMessage id={messageId} />
        <SortIcon field={field} />
      </span>
    </th>
  )

  const renderRow = (row: CountryData, index: number) => (
    <tr key={row.iso2 || `unknown-${index}`}>
      <td className="c-stats-table__rank">
        {index + 1}
      </td>
      <td>
        {row.name && row.name.trim() !== '' && row.name !== 'Unknown'
          ? row.name
          : intl.formatMessage({
              id: 'cases.stats.show.tableUnknownCountry',
            })}
      </td>
      <td className="c-stats-table__number">
        {row.unique_visits.toLocaleString()}
      </td>
      <td>{formatDate(row.first_event)}</td>
      <td>{formatDate(row.last_event)}</td>
    </tr>
  )

  return (
    <div className="c-stats-table__wrapper">
      <table className="pt-html-table pt-html-table-striped c-stats-table">
        <thead>
          <tr>
            <th className="c-stats-table__rank-header">
              <FormattedMessage id="cases.stats.show.tableRank" />
            </th>
            <SortableHeaderCell
              field="name"
              messageId="cases.stats.show.tableCountry"
            />
            <SortableHeaderCell
              field="unique_visits"
              messageId="cases.stats.show.tableUniqueVisitors"
            />
            <th>
              <FormattedMessage id="cases.stats.show.tableFirstVisit" />
            </th>
            <th>
              <FormattedMessage id="cases.stats.show.tableLastVisit" />
            </th>
          </tr>
        </thead>
        <tbody>
          {countries.map((row, index) => renderRow(row, index))}
          {uncountries.map((row, index) =>
            renderRow(row, countries.length + index)
          )}
        </tbody>
        <tfoot>
          <tr className="c-stats-table__total-row">
            <td></td>
            <td>
              <FormattedMessage id="cases.stats.show.tableTotal" />
            </td>
            <td className="c-stats-table__total-number">
              {totalVisits.toLocaleString()}
            </td>
            <td></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default injectIntl(StatsTable)
