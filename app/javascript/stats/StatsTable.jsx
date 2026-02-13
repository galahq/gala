/* @flow */
import React from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'

import { useStatsTable } from './hooks/useStatsTable'

type CountryData = {
  iso2?: ?string,
  iso3?: ?string,
  name?: ?string,
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
    knownCountries,
    unknownCountries,
    totalVisits,
    formatDate,
    isActiveSortField,
  } = useStatsTable(data)
  const unknownLabel = intl.formatMessage({
    id: 'cases.stats.show.tableUnknownCountry',
  })

  const SortIcon = ({ field }: { field: string }) => {
    if (!isActiveSortField(field)) {
      return (
        <span
          className="c-stats-table__sort-icon c-stats-table__sort-icon--inactive"
          aria-hidden="true"
        >
          ↕
        </span>
      )
    }
    return (
      <span
        className="c-stats-table__sort-icon c-stats-table__sort-icon--active"
        aria-hidden="true"
      >
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  const ariaSortFor = (field: string): 'ascending' | 'descending' | 'none' => {
    if (!isActiveSortField(field)) return 'none'
    return sortDirection === 'asc' ? 'ascending' : 'descending'
  }

  const SortableHeaderCell = ({
    field,
    messageId,
  }: {
    field: string,
    messageId: string,
  }) => (
    <th scope="col" className="c-stats-table__sortable" aria-sort={ariaSortFor(field)}>
      <button
        type="button"
        className="c-stats-table__sortable-button"
        onClick={() => handleSort(field)}
      >
        <FormattedMessage id={messageId} />
        <SortIcon field={field} />
      </button>
    </th>
  )

  const renderRow = (row: CountryData, index: number) => {
    const hasKnownName = !!(row.name && row.name.trim() !== '' && row.name !== 'Unknown')
    const displayName = hasKnownName ? row.name : unknownLabel

    return (
      <tr key={row.iso2 || row.iso3 || `unknown-${index}`}>
        <td className="c-stats-table__rank">
          {index + 1}
        </td>
        <td>{displayName}</td>
        <td className="c-stats-table__number">
          {row.unique_visits.toLocaleString()}
        </td>
        <td>{formatDate(row.first_event)}</td>
        <td>{formatDate(row.last_event)}</td>
      </tr>
    )
  }

  return (
    <div className="c-stats-table__wrapper">
      <table
        className="pt-html-table pt-html-table-striped c-stats-table"
        role="table"
        aria-label={intl.formatMessage({
          id: 'cases.stats.show.tableTitle',
          defaultMessage: 'Filtered Case Visitors By Country',
        })}
      >
        <thead>
          <tr>
            <th scope="col" className="c-stats-table__rank-header">
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
            <th scope="col">
              <FormattedMessage id="cases.stats.show.tableFirstVisit" />
            </th>
            <th scope="col">
              <FormattedMessage id="cases.stats.show.tableLastVisit" />
            </th>
          </tr>
        </thead>
        <tbody>
          {knownCountries.map((row, index) => renderRow(row, index))}
          {unknownCountries.map((row, index) =>
            renderRow(row, knownCountries.length + index)
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
