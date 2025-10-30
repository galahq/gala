/* @flow */
import React, { useState } from 'react'

type CountryData = {
  iso2: string,
  iso3: string,
  name: string,
  unique_visits: number,
  unique_users: number,
  events_count: number,
  first_event: ?string,
  last_event: ?string,
  percentile: number,
}

type PercentileData = {
  percentile: number,
  value: number,
  color: string,
}

type Props = {
  data: CountryData[],
  caseSlug: string,
  percentiles?: PercentileData[],
  onRowClick?: (country: CountryData) => void,
  onClearSelection?: () => void,
}

export default function StatsTable ({
  data,
  caseSlug,
  percentiles = [],
  onRowClick,
  onClearSelection,
}: Props) {
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
    const aIsUnknown = !a.iso2 || a.name === 'Unknown'
    const bIsUnknown = !b.iso2 || b.name === 'Unknown'

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

  const SortIcon = ({ field }: { field: string }) => {
    if (field !== sortField) {
      return <span style={{ opacity: 0.3, fontSize: '12px' }}>↕</span>
    }
    return (
      <span style={{ color: 'rgb(100, 68, 187)', fontSize: '12px', fontWeight: 'bold' }}>
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ margin: 0, font: "monospace" }}>Traffic</h3>
        <button
          className="pt-button pt-intent-primary pt-icon-export"
          onClick={exportCSV}
        >
          Export CSV
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          className="pt-html-table pt-html-table-striped"
          style={{ width: '100%' }}
        >
          <thead>
            <tr>
              <th
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('name')}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Country
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
                  Unique Visitors
                  <SortIcon field="unique_visits" />
                </div>
              </th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('unique_users')}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Unique Users
                  <SortIcon field="unique_users" />
                </div>
              </th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('events_count')}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Total Events
                  <SortIcon field="events_count" />
                </div>
              </th>
              <th>First Visit</th>
              <th>Last Visit</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={row.iso2 || index}>
                <td>{row.name}</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                  {row.unique_visits.toLocaleString()}
                </td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                  {row.unique_users.toLocaleString()}
                </td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                  {row.events_count.toLocaleString()}
                </td>
                <td>{formatDate(row.first_event)}</td>
                <td>{formatDate(row.last_event)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 'bold' }}>
              <td>Total</td>
              <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                {data
                  .reduce((sum, r) => sum + r.unique_visits, 0)
                  .toLocaleString()}
              </td>
              <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                {data
                  .reduce((sum, r) => sum + r.unique_users, 0)
                  .toLocaleString()}
              </td>
              <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                {data
                  .reduce((sum, r) => sum + r.events_count, 0)
                  .toLocaleString()}
              </td>
              <td>-</td>
              <td>-</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
