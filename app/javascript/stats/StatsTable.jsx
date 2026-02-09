/* @flow */

import React from 'react'

import { useStatsTable } from './useStatsTable'

import type { StatsCountryRow } from './map'

type Props = {
  rows: Array<StatsCountryRow>,
  locale: string,
  formatDate: (?string, string) => string,
  t: (key: string) => string,
}

function SortIcon ({
  active,
  direction,
}: {
  active: boolean,
  direction: 'asc' | 'desc',
}): React$Node {
  if (!active) {
    return (
      <span className="c-stats-table__sort-icon c-stats-table__sort-icon--inactive">
        ↕
      </span>
    )
  }

  return (
    <span className="c-stats-table__sort-icon c-stats-table__sort-icon--active">
      {direction === 'asc' ? '↑' : '↓'}
    </span>
  )
}

function SortableHeader ({
  field,
  currentField,
  direction,
  onSort,
  label,
  enable = false,
}: {
  field: 'name' | 'unique_visits' | 'first_event' | 'last_event',
  currentField: 'name' | 'unique_visits' | 'first_event' | 'last_event',
  direction: 'asc' | 'desc',
  onSort: ('name' | 'unique_visits' | 'first_event' | 'last_event') => void,
  label: string,
  enable: boolean,
}): React$Node {
  return (
    <th className="c-stats-table__sortable" onClick={() => onSort(field)}>
      <span className="c-stats-table__header">
        {label}
        {enable && <SortIcon active={currentField === field} direction={direction} />}
      </span>
    </th>
  )
}

function StatsTable ({ rows, locale, formatDate, t }: Props): React$Node {
  const {
    sortedRows,
    sortField,
    sortDirection,
    totalVisits,
    handleSort,
    formatTableDate,
  } = useStatsTable(rows, locale, formatDate)

  const unknownLabel = t('table_unknown_country')
  const isEmptyState = sortedRows.length === 0
  const displayRows: Array<StatsCountryRow> = isEmptyState
    ? [
        {
          iso2: null,
          iso3: null,
          name: unknownLabel,
          unique_visits: 0,
          unique_users: 0,
          events_count: 0,
          visit_podcast_count: 0,
          first_event: null,
          last_event: null,
        },
      ]
    : sortedRows

  return (
    <div className="c-stats-table__wrapper">
      <table className="pt-html-table pt-html-table-striped c-stats-table">
        <thead>
          <tr>
            <th className="c-stats-table__rank-header">{t('table_rank')}</th>
            <SortableHeader
              field="name"
              enable={false}
              currentField={sortField}
              direction={sortDirection}
              label={t('table_country')}
              onSort={handleSort}
            />
            <SortableHeader
              field="unique_visits"
              enable={true}
              currentField={sortField}
              direction={sortDirection}
              label={t('table_unique_visitors')}
              onSort={handleSort}
            />
            <SortableHeader
              field="first_event"
              enable={false}
              currentField={sortField}
              direction={sortDirection}
              label={t('table_first_visit')}
              onSort={handleSort}
            />
            <SortableHeader
              field="last_event"
              enable={false}
              currentField={sortField}
              direction={sortDirection}
              label={t('table_last_visit')}
              onSort={handleSort}
            />
          </tr>
        </thead>

        <tbody>
          {displayRows.map((row, index) => {
            const isUnknown = !row.iso2 || row.name === 'Unknown'
            const displayName = isUnknown ? unknownLabel : row.name

            return (
              <tr
                key={
                  isEmptyState
                    ? 'empty-default-row'
                    : row.iso3 || row.iso2 || `unknown-${index}`
                }
              >
                <td className="c-stats-table__rank">
                  {isEmptyState ? '-' : index + 1}
                </td>
                <td className="c-stats-table__country-cell">
                  <div className="c-stats-table__country-content">
                    {row.flag_url && !isUnknown && (
                      <img
                        className="c-stats-table__flag"
                        src={row.flag_url}
                        width="20"
                        height="15"
                        loading="lazy"
                        alt={`${displayName} flag`}
                        onError={event => {
                          event.currentTarget.style.display = 'none'
                        }}
                      />
                    )}
                    <span className="c-stats-table__country-name">
                      {displayName}
                    </span>
                  </div>
                </td>
                <td className="c-stats-table__number">
                  {row.unique_visits.toLocaleString()}
                </td>
                <td>{formatTableDate(row.first_event)}</td>
                <td>{formatTableDate(row.last_event)}</td>
              </tr>
            )
          })}
        </tbody>

        <tfoot>
          <tr className="c-stats-table__total-row">
            <td></td>
            <td>{t('table_total')}</td>
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

export default StatsTable
