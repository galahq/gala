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
  const [selectedRow, setSelectedRow] = useState(null)

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const handleRowClick = row => {
    setSelectedRow(row)
    if (onRowClick) {
      onRowClick(row)
    }
  }

  const clearSelection = () => {
    setSelectedRow(null)
  }

  // Expose clearSelection function globally
  React.useEffect(() => {
    window.clearTableSelection = clearSelection
    return () => {
      delete window.clearTableSelection
    }
  }, [])

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

  const getPercentileRange = (percentile: number): string => {
    if (percentiles.length === 0) return `${percentile}%`

    // Find the index of this percentile in the percentiles array
    const percentileIndex = percentiles.findIndex(
      p => p.percentile === percentile
    )
    if (percentileIndex === -1) return `${percentile}%`

    // Get the next percentile for the range, or 100 if it's the last one
    const nextPercentile = percentiles[percentileIndex + 1]?.percentile || 100
    return `${percentile}-${nextPercentile}%`
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
      <span style={{ color: '#2d72d2', fontSize: '12px', fontWeight: 'bold' }}>
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
              <th>ISO Code</th>
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
              <th>Percentile</th>
              <th>First Visit</th>
              <th>Last Visit</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => {
              const isSelected = selectedRow && selectedRow.iso2 === row.iso2
              const isUnknown = !row.iso2 || row.name === 'Unknown'
              const isSelectable = onRowClick && !isUnknown

              return (
                <tr
                  key={row.iso2 || index}
                  style={{
                    cursor: isSelectable ? 'pointer' : 'not-allowed',
                    backgroundColor: isSelected ? '#7c3aed' : undefined, // Dark purple for selected
                    color: isSelected ? 'white' : undefined, // White text for selected rows
                  }}
                  onClick={() => isSelectable && handleRowClick(row)}
                  onMouseEnter={e => {
                    if (!isSelected && isSelectable) {
                      e.currentTarget.style.backgroundColor = '#e9d5ff' // Light purple for hover
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected && isSelectable) {
                      e.currentTarget.style.backgroundColor = ''
                    }
                  }}
                >
                  <td style={{ color: isSelected ? 'white' : undefined }}>
                    {row.name}
                  </td>
                  <td style={{ color: isSelected ? 'white' : undefined }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                      {row.iso3 || ''}
                    </span>
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      color: isSelected ? 'white' : undefined,
                      fontFamily: 'monospace',
                    }}
                  >
                    {row.unique_visits.toLocaleString()}
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      color: isSelected ? 'white' : undefined,
                      fontFamily: 'monospace',
                    }}
                  >
                    {row.unique_users.toLocaleString()}
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      color: isSelected ? 'white' : undefined,
                      fontFamily: 'monospace',
                    }}
                  >
                    {row.events_count.toLocaleString()}
                  </td>
                  <td
                    style={{
                      textAlign: 'center',
                      color: isSelected ? 'white' : undefined,
                      fontFamily: 'monospace',
                    }}
                  >
                    {getPercentileRange(row.percentile)}
                  </td>
                  <td style={{ color: isSelected ? 'white' : undefined }}>
                    {formatDate(row.first_event)}
                  </td>
                  <td style={{ color: isSelected ? 'white' : undefined }}>
                    {formatDate(row.last_event)}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 'bold' }}>
              <td>Total</td>
              <td>-</td>
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
              <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                -
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
