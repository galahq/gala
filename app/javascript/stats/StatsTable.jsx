/* @flow */
import React, { useMemo, useState } from 'react'
import { FormattedMessage, injectIntl } from 'react-intl'

import { formatDate as formatDateValue } from './dateHelpers'
import type {
  StatsCountryRow,
  StatsSortDirection,
  StatsSortField,
} from './state/types'

type Props = {
  data: StatsCountryRow[],
  intl: any,
}

function StatsTable ({ data, intl }: Props) {
  const [sortField, setSortField] = useState<StatsSortField>('unique_visits')
  const [sortDirection, setSortDirection] = useState<StatsSortDirection>('desc')

  const handleSort = (field: StatsSortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aIsUnknown =
        !a.iso2 || a.name === 'Unknown' || a.name.trim() === ''
      const bIsUnknown =
        !b.iso2 || b.name === 'Unknown' || b.name.trim() === ''

      if (aIsUnknown && !bIsUnknown) return 1
      if (!aIsUnknown && bIsUnknown) return -1
      if (aIsUnknown && bIsUnknown) return 0

      if (sortField === 'name') {
        const aName = a.name || ''
        const bName = b.name || ''
        return sortDirection === 'asc'
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName)
      }

      return sortDirection === 'asc'
        ? a.unique_visits - b.unique_visits
        : b.unique_visits - a.unique_visits
    })
  }, [data, sortField, sortDirection])

  const { knownCountries, unknownCountries } = useMemo(() => {
    const known = sortedData.filter(
      row => row.iso2 && row.name.trim() !== '' && row.name !== 'Unknown'
    )
    const unknown = sortedData.filter(
      row => !row.iso2 || row.name.trim() === '' || row.name === 'Unknown'
    )
    return { knownCountries: known, unknownCountries: unknown }
  }, [sortedData])

  const totalVisits = useMemo(() => {
    return data.reduce((sum, r) => sum + r.unique_visits, 0)
  }, [data])

  const isActiveSortField = (field: StatsSortField): boolean => {
    return field === sortField
  }

  const formatDate = (dateStr: ?string): string => {
    if (!dateStr) return '-'
    return formatDateValue(dateStr, 'en-US')
  }

  const unknownLabel = intl.formatMessage({
    id: 'cases.stats.show.tableUnknownCountry',
  })

  const SortIcon = ({ field }: { field: StatsSortField }) => {
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

  const ariaSortFor = (field: StatsSortField): 'ascending' | 'descending' | 'none' => {
    if (!isActiveSortField(field)) return 'none'
    return sortDirection === 'asc' ? 'ascending' : 'descending'
  }

  const SortableHeaderCell = ({
    field,
    messageId,
  }: {
    field: StatsSortField,
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

  const renderRow = (row: StatsCountryRow, index: number) => {
    const hasKnownName = row.name.trim() !== '' && row.name !== 'Unknown'
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
