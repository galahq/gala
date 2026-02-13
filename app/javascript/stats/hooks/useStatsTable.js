/* @flow */
import { useState, useMemo } from 'react'
import { formatDate as formatDateValue } from '../dateHelpers'

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

type SortDirection = 'asc' | 'desc'

type UseStatsTableResult = {
  sortField: string,
  sortDirection: SortDirection,
  handleSort: (field: string) => void,
  knownCountries: CountryData[],
  unknownCountries: CountryData[],
  totalVisits: number,
  formatDate: (dateStr: ?string) => string,
  isActiveSortField: (field: string) => boolean,
}

export function useStatsTable (data: CountryData[]): UseStatsTableResult {
  const [sortField, setSortField] = useState<string>('unique_visits')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (field: string) => {
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
        !a.iso2 || a.name === 'Unknown' || !a.name || a.name.trim() === ''
      const bIsUnknown =
        !b.iso2 || b.name === 'Unknown' || !b.name || b.name.trim() === ''

      if (aIsUnknown && !bIsUnknown) return 1
      if (!aIsUnknown && bIsUnknown) return -1
      if (aIsUnknown && bIsUnknown) return 0

      const aVal = a[sortField] || 0
      const bVal = b[sortField] || 0

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
    })
  }, [data, sortField, sortDirection])

  const { knownCountries, unknownCountries } = useMemo(() => {
    const known = sortedData.filter(
      row => row.iso2 && row.name && row.name.trim() !== '' && row.name !== 'Unknown'
    )
    const unknown = sortedData.filter(
      row => !row.iso2 || !row.name || row.name.trim() === '' || row.name === 'Unknown'
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

  const isActiveSortField = (field: string): boolean => {
    return field === sortField
  }

  return {
    sortField,
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
