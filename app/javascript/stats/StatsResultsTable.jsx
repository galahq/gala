/* @flow */
import React from 'react'
import { NonIdealState } from '@blueprintjs/core'

export default function StatsResultsTable ({ rows /* array of objects */ }) {
  if (!rows) {
    return (
      <div className="pt-card pt-elevation-1" style={{ marginTop: '12px', padding: '12px' }}>
        <div className="pt-skeleton" style={{ height: '16px', width: '30%', marginBottom: '12px' }} />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="pt-skeleton" style={{ height: '12px', marginBottom: '8px' }} />
        ))}
      </div>
    )
  }

  const cols = Object.keys(rows[0])

  function formatCell (value) {
    if (value == null) return ''
    if (typeof value === 'string') {
      // Trim ISO timestamps to YYYY-MM-DD for readability
      const isoDate = value.match(/^(\d{4}-\d{2}-\d{2})/) // yyyy-mm-dd
      if (isoDate) return isoDate[1]
    }
    return String(value)
  }

  return (
    <div className="pt-card pt-elevation-1" style={{ marginTop: '12px' }}>
      <table className="pt-html-table pt-html-table-striped pt-small" role="table">
        <thead>
          <tr>
            {cols.map(key => (
              <th key={key}>{key.replace(/_/g, ' ')}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {cols.map(key => (
                <td key={key}>{formatCell(row[key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
