/* @flow */
import * as React from 'react'

import { getBinColors, getBinTextColors } from './mapColors'
import {
  createFillLayer,
  createFillColorExpression,
  createLineLayer,
} from './layers'
import { parseMapError } from './mapErrors'
import {
  MAPBOX_DEFAULT_COLOR,
  MAP_LOAD_TIMEOUT,
} from './config'
import {
  applyCountryFillColor,
  applyMapLoadPresentation,
  getMapInstance,
} from './mapEngine'
import {
  createInitialMapContainerState,
  mapContainerReducer,
} from './mapContainerState'
import MapView from './MapView'
import type { MapViewport, MousePosition } from './mapContainerState'
import type { StatsBin, StatsCountryRow } from '../state/types'

type Props = {
  countries: StatsCountryRow[],
  bins: StatsBin[],
  intl: any,
}

type CountryLookup = {
  byIso3: Map<string, StatsCountryRow>,
  byName: Map<string, StatsCountryRow>,
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

function buildCountryLookup (countries: StatsCountryRow[]): CountryLookup {
  const byIso3 = new Map()
  const byName = new Map()

  countries.forEach(country => {
    const iso3 = typeof country.iso3 === 'string'
      ? country.iso3.trim().toUpperCase()
      : ''
    if (iso3 && !byIso3.has(iso3)) {
      byIso3.set(iso3, country)
    }

    const normalizedName = normalizeCountryName(country.name)
    if (normalizedName && !byName.has(normalizedName)) {
      byName.set(normalizedName, country)
    }
  })

  return { byIso3, byName }
}

function findCountry (
  lookup: CountryLookup,
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
    const countryByIso = lookup.byIso3.get(featureIso3)
    if (countryByIso) return countryByIso
  }

  if (!normalizedFeatureName) return null

  return lookup.byName.get(normalizedFeatureName) || null
}

export default function MapContainer ({
  countries,
  bins,
  intl,
}: Props): React.Node {
  const [state, dispatch] = React.useReducer(
    mapContainerReducer,
    createInitialMapContainerState()
  )

  const mapRef = React.useRef(null)
  const tooltipRef = React.useRef<HTMLDivElement | null>(null)

  const mapLoaded = state.lifecycle.loaded
  const mapError = state.lifecycle.hasError
  const errorMessage = state.lifecycle.errorMessage
  const hoveredCountry = state.interaction.hoveredCountry
  const mousePosition = state.interaction.mousePosition
  const tooltipPosition = state.interaction.tooltipPosition

  const countryLookup = React.useMemo(
    () => buildCountryLookup(countries),
    [countries]
  )

  const binColors = React.useMemo(() => getBinColors(bins.length), [bins.length])
  const binTextColors = React.useMemo(() => getBinTextColors(bins.length), [bins.length])
  const featureMatchProperty = 'iso_3166_1_alpha_3'

  const countryColors = React.useMemo(() => {
    const colors = {}

    countries.forEach(country => {
      const iso3 = typeof country.iso3 === 'string'
        ? country.iso3.toUpperCase()
        : null

      if (iso3 && typeof country.bin === 'number') {
        const binIndex = Math.min(country.bin, binColors.length - 1)
        const color = binColors[binIndex] || binColors[0]

        if (color) {
          colors[iso3] = color
        }
      }
    })

    return colors
  }, [countries, binColors])

  const fillColorExpression = React.useMemo(() => {
    if (Object.keys(countryColors).length === 0 || binColors.length === 0) {
      return null
    }

    return createFillColorExpression(
      countryColors,
      MAPBOX_DEFAULT_COLOR,
      featureMatchProperty
    )
  }, [countryColors, binColors, featureMatchProperty])

  const fillLayer = React.useMemo(() => createFillLayer(), [])
  const lineLayer = React.useMemo(() => createLineLayer(), [])

  const handleMapTimeout = React.useCallback(() => {
    console.error('Map loading timeout - map failed to load within expected time')
    dispatch({
      type: 'lifecycle/error_set',
      message: (
        'Map loading timed out. This may be due to network issues, ad blockers, '
        + 'or invalid Mapbox configuration.'
      ),
    })
  }, [])

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (!mapLoaded && !mapError) {
        handleMapTimeout()
      }
    }, MAP_LOAD_TIMEOUT)

    return () => clearTimeout(timeout)
  }, [mapLoaded, mapError, handleMapTimeout])

  React.useEffect(() => {
    if (!mapLoaded) return

    const map = getMapInstance(mapRef)
    if (!map) return

    try {
      applyCountryFillColor(map, fillColorExpression, MAPBOX_DEFAULT_COLOR)
    } catch (error) {
      console.error('Error updating map colors:', error)
    }
  }, [fillColorExpression, mapLoaded])

  React.useEffect(() => {
    if (!hoveredCountry || mousePosition.x === 0 || mousePosition.y === 0) {
      return
    }
    if (!tooltipRef.current) {
      return
    }

    const tooltip = tooltipRef.current
    const mapInstance = getMapInstance(mapRef)
    if (!mapInstance || typeof mapInstance.getContainer !== 'function') {
      return
    }
    const mapContainer = mapInstance.getContainer()
    const mapRect = mapContainer.getBoundingClientRect()
    const tooltipRect = tooltip.getBoundingClientRect()

    const offset = 15
    const tooltipWidth = tooltipRect.width
    const wouldOverflowRight = mousePosition.x + offset + tooltipWidth > mapRect.width

    const left = wouldOverflowRight
      ? mousePosition.x - offset - tooltipWidth
      : mousePosition.x + offset

    const top = Math.max(10, mousePosition.y - offset)

    dispatch({
      type: 'interaction/tooltip_positioned',
      tooltipPosition: { left, top },
    })
  }, [hoveredCountry, mousePosition])

  const handleHover = React.useCallback((event: any) => {
    const feature = event && event.features && event.features[0]
    if (!feature) {
      dispatch({ type: 'interaction/hover_cleared' })
      return
    }

    dispatch({
      type: 'interaction/hover_changed',
      country: findCountry(countryLookup, feature),
      mousePosition: getEventPoint(event),
    })
  }, [countryLookup])

  const retryMapLoad = React.useCallback(() => {
    dispatch({ type: 'lifecycle/retry_requested' })
  }, [])

  const handleMapLoad = React.useCallback(() => {
    dispatch({ type: 'lifecycle/load_succeeded' })

    const map = getMapInstance(mapRef)
    if (!map) return

    try {
      applyMapLoadPresentation(map)
    } catch (error) {
      console.error('Error applying map presentation:', error)
    }
  }, [])

  const handleMapError = React.useCallback((error: any) => {
    console.warn('Map event error (may be transient):', error)

    if (mapLoaded) {
      console.warn('Ignoring post-load map error (transient)')
      return
    }

    const { message, isTransient } = parseMapError(error)

    if (isTransient) {
      console.warn('Ignoring transient Mapbox error:', message)
      return
    }

    console.error('Map loading error:', message)
    dispatch({
      type: 'lifecycle/error_set',
      message: `Mapbox error: ${message}. Check your Mapbox token and internet connection.`,
    })
  }, [mapLoaded])

  function handleViewportChange (viewport: MapViewport) {
    dispatch({ type: 'viewport/changed', viewport })
  }

  const hasData = bins.length > 0 && countries.length > 0

  return (
    <MapView
      viewport={state.viewport}
      mapRef={mapRef}
      tooltipRef={tooltipRef}
      mapLoaded={mapLoaded}
      mapError={mapError}
      hasData={hasData}
      fillLayer={fillLayer}
      lineLayer={lineLayer}
      hoveredCountry={hoveredCountry}
      tooltipPosition={tooltipPosition}
      binColors={binColors}
      binTextColors={binTextColors}
      bins={bins}
      intl={intl}
      errorMessage={errorMessage}
      onRetry={retryMapLoad}
      onViewportChange={handleViewportChange}
      onLoad={handleMapLoad}
      onHover={handleHover}
      onError={handleMapError}
    />
  )
}
