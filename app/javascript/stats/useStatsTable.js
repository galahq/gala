/* @flow */

import { useMemo, useState } from 'react'

import type { StatsCountryRow } from './map'

type SortField = 'name' | 'unique_visits' | 'first_event' | 'last_event'
type SortDirection = 'asc' | 'desc'

function isUnknown (row: StatsCountryRow): boolean {
  return !row.iso2 || !row.name || row.name.trim() === '' || row.name === 'Unknown'
}

function compareDate (a: ?string, b: ?string): number {
  const left = a ? new Date(a).getTime() : 0
  const right = b ? new Date(b).getTime() : 0
  return left - right
}

function compareByField (a: StatsCountryRow, b: StatsCountryRow, field: SortField): number {
  if (field === 'name') {
    return (a.name || '').localeCompare(b.name || '')
  }

  if (field === 'first_event') {
    return compareDate(a.first_event, b.first_event)
  }

  if (field === 'last_event') {
    return compareDate(a.last_event, b.last_event)
  }

  return (a.unique_visits || 0) - (b.unique_visits || 0)
}

export function useStatsTable (
  rows: Array<StatsCountryRow>,
  locale: string = 'en-US',
  formatDate: (?string, string) => string
) {
  const [sortField, setSortField] = useState<SortField>('unique_visits')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
      return
    }

    setSortField(field)
    setSortDirection(field === 'name' ? 'asc' : 'desc')
  }

  const sortedRows = useMemo(() => {
    const nextRows = [...rows]

    nextRows.sort((a, b) => {
      const aUnknown = isUnknown(a)
      const bUnknown = isUnknown(b)

      if (aUnknown && !bUnknown) return 1
      if (!aUnknown && bUnknown) return -1

      const diff = compareByField(a, b, sortField)
      return sortDirection === 'asc' ? diff : -diff
    })

    return nextRows
  }, [rows, sortField, sortDirection])

  const totalVisits = useMemo(() => {
    return rows.reduce((sum, row) => sum + (row.unique_visits || 0), 0)
  }, [rows])

  const formatTableDate = (value: ?string): string => {
    if (!value) return '-'
    return formatDate(value, locale) || '-'
  }

  return {
    sortField,
    sortDirection,
    sortedRows,
    totalVisits,
    handleSort,
    formatTableDate,
  }
}

export default useStatsTable
