/* @flow */
import { useCallback, useState } from 'react'
import type { StatsCountryRow } from '../types'

type MousePosition = {
  x: number,
  y: number,
}

type Params = {
  countries: StatsCountryRow[],
}

type Result = {
  hoveredCountry: ?StatsCountryRow,
  mousePosition: MousePosition,
  handleHover: (event: any) => void,
}

function normalizeCountryName (value: mixed): string {
  if (typeof value !== 'string') return ''
  return value.trim().toLowerCase()
}

function getEventPoint (event: any): MousePosition {
  const point = event && event.point
  if (!Array.isArray(point) || point.length < 2) {
    return { x: 0, y: 0 }
  }
  return { x: point[0], y: point[1] }
}

function findCountry (
  countries: StatsCountryRow[],
  feature: Object
): ?StatsCountryRow {
  const properties = feature.properties || {}
  const featureIso3 = String(properties.iso_3166_1_alpha_3 || '').toUpperCase()
  const featureName = (
    properties.name ||
    properties.name_en ||
    properties.admin
  )
  const normalizedFeatureName = normalizeCountryName(featureName)

  if (featureIso3) {
    const countryByIso = countries.find(
      country => String(country.iso3 || '').toUpperCase() === featureIso3
    )
    if (countryByIso) return countryByIso
  }

  if (!normalizedFeatureName) return null

  return countries.find(
    country => normalizeCountryName(country.name) === normalizedFeatureName
  )
}

export function useMapHover ({
  countries,
}: Params): Result {
  const [hoveredCountry, setHoveredCountry] = useState<?StatsCountryRow>(null)
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 })

  const handleHover = useCallback((event: any) => {
    const feature = event && event.features && event.features[0]
    if (!feature) {
      setHoveredCountry(null)
      setMousePosition({ x: 0, y: 0 })
      return
    }

    setHoveredCountry(findCountry(countries, feature))
    setMousePosition(getEventPoint(event))
  }, [countries])

  return {
    hoveredCountry,
    mousePosition,
    handleHover,
  }
}

export default useMapHover
