/* @flow */
import React, { useState, useEffect } from 'react'
import { Colors } from '@blueprintjs/core'
import { FormattedMessage, injectIntl } from 'react-intl'

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
  caseSlug: string,
  onRowClick?: (country: CountryData) => void,
  intl: any,
}

function StatsTable ({ data, caseSlug, onRowClick, intl }: Props) {
  const [sortField, setSortField] = useState('unique_visits')
  const [sortDirection, setSortDirection] = useState('desc')

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    // Always put unknown countries at the bottom
    const aIsUnknown =
      !a.iso2 || a.name === 'Unknown' || !a.name || a.name.trim() === ''
    const bIsUnknown =
      !b.iso2 || b.name === 'Unknown' || !b.name || b.name.trim() === ''

    if (aIsUnknown && !bIsUnknown) return 1
    if (!aIsUnknown && bIsUnknown) return -1
    if (aIsUnknown && bIsUnknown) return 0

    // Sort known countries normally
    const aVal = a[sortField] || 0
    const bVal = b[sortField] || 0

    if (typeof aVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }

    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
  })

  const formatDate = (dateStr: ?string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const exportCSV = () => {
    const params = new URLSearchParams(window.location.search)
    const from = params.get('from') || ''
    const to = params.get('to') || ''

    let url = `/cases/${caseSlug}/stats.csv`
    if (from || to) {
      url += `?from=${from}&to=${to}`
    }

    window.location.href = url
  }

  // Set up export button handler
  useEffect(() => {
    const exportBtn = document.getElementById('stats-table-export-btn')
    if (exportBtn) {
      const handleClick = () => {
        exportCSV()
      }
      exportBtn.addEventListener('click', handleClick)
      return () => {
        exportBtn.removeEventListener('click', handleClick)
      }
    }
  }, [caseSlug])

  const SortIcon = ({ field }: { field: string }) => {
    if (field !== sortField) {
      return <span style={{ opacity: 0.3, fontSize: '12px' }}>↕</span>
    }
    return (
      <span
        style={{
          color: Colors.INDIGO5,
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  // Set up export button handler
  useEffect(() => {
    const exportBtn = document.getElementById('stats-table-export-btn')
    if (exportBtn) {
      const handleClick = () => {
        exportCSV()
      }
      exportBtn.addEventListener('click', handleClick)
      return () => {
        exportBtn.removeEventListener('click', handleClick)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseSlug])

  return (
    <div style={{ overflowX: 'auto' }}>
        <table
          className="pt-html-table pt-html-table-striped"
          style={{ width: '600px' }}
        >
          <thead>
            <tr>
              <th style={{ width: '50px', textAlign: 'center' }}>
                <FormattedMessage id="cases.stats.show.tableRank" />
              </th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('name')}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <FormattedMessage id="cases.stats.show.tableCountry" />
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('unique_visits')}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <FormattedMessage id="cases.stats.show.tableUniqueVisitors" />
                  <SortIcon field="unique_visits" />
                </div>
              </th>
              <th>
                <FormattedMessage id="cases.stats.show.tableFirstVisit" />
              </th>
              <th>
                <FormattedMessage id="cases.stats.show.tableLastVisit" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={row.iso2 || index}>
                <td
                  style={{
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    color: Colors.GRAY3,
                  }}
                >
                  {index + 1}
                </td>
                <td>
                  {row.name ||
                    intl.formatMessage({
                      id: 'cases.stats.show.tableUnknownCountry',
                    })}
                </td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                  {row.unique_visits.toLocaleString()}
                </td>
                <td>{formatDate(row.first_event)}</td>
                <td>{formatDate(row.last_event)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 'bold' }}>
              <td></td>
              <td>
                <FormattedMessage id="cases.stats.show.tableTotal" />
              </td>
              <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                {data
                  .reduce((sum, r) => sum + r.unique_visits, 0)
                  .toLocaleString()}
              </td>
              <td>-</td>
              <td>-</td>
            </tr>
          </tfoot>
        </table>
      </div>
  )
}

export default injectIntl(StatsTable)
