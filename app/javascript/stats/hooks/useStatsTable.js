/* @flow */
import { useState, useMemo } from 'react'
import { formatDate as formatDateValue } from '../dateHelpers'
import type {
  StatsCountryRow,
  StatsSortDirection,
  StatsSortField,
} from '../types'

type UseStatsTableResult = {
  sortDirection: StatsSortDirection,
  handleSort: (field: StatsSortField) => void,
  knownCountries: StatsCountryRow[],
  unknownCountries: StatsCountryRow[],
  totalVisits: number,
  formatDate: (dateStr: ?string) => string,
  isActiveSortField: (field: StatsSortField) => boolean,
}

export function useStatsTable (data: StatsCountryRow[]): UseStatsTableResult {
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

  const formatDate = (dateStr: ?string): string => {
    if (!dateStr) return '-'
    return formatDateValue(dateStr, 'en-US')
  }

  const isActiveSortField = (field: StatsSortField): boolean => {
    return field === sortField
  }

  return {
    sortDirection,
    handleSort,
    knownCountries,
    unknownCountries,
    totalVisits,
    formatDate,
    isActiveSortField,
  }
}

export default useStatsTable
