/* @flow */
import React, { useState } from 'react'
import { Icon } from '@blueprintjs/core'

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
}

export default function StatsTable ({ data, caseSlug, onRowClick }: Props) {
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
      return <Icon icon="sort" size={12} style={{ opacity: 0.3 }} />
    }
    return (
      <Icon
        icon={sortDirection === 'asc' ? 'sort-asc' : 'sort-desc'}
        size={12}
        style={{ color: '#2d72d2' }}
      />
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
        <h3 style={{ margin: 0 }}>Country Statistics</h3>
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
              <th>ISO Codes</th>
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
              <tr
                key={row.iso2 || index}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                onClick={() => onRowClick && onRowClick(row)}
              >
                <td>{row.name}</td>
                <td>
                  <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    {row.iso2} / {row.iso3}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  {row.unique_visits.toLocaleString()}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {row.unique_users.toLocaleString()}
                </td>
                <td style={{ textAlign: 'right' }}>
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
              <td>-</td>
              <td style={{ textAlign: 'right' }}>
                {data
                  .reduce((sum, r) => sum + r.unique_visits, 0)
                  .toLocaleString()}
              </td>
              <td style={{ textAlign: 'right' }}>
                {data
                  .reduce((sum, r) => sum + r.unique_users, 0)
                  .toLocaleString()}
              </td>
              <td style={{ textAlign: 'right' }}>
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
