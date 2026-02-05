/* @flow */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import ReactMapGL, { Source, Layer } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { injectIntl } from 'react-intl'

import MapErrorBoundary from './map/MapErrorBoundary'
import {
  MapLegend,
  MapTooltip,
  MapErrorState,
  MapEmptyState,
  MapTooMuchDataState,
  useGeoJsonData,
  useTooltipPosition,
  parseMapError,
  getBinColors,
  getBinTextColors,
  getMapboxData,
  getMapboxToken,
  getMapboxStyle,
  getMapboxDefaultColor,
  createFillLayer,
  createLineLayer,
  createFillColorExpression,
  DEFAULT_VIEWPORT,
  MAX_COUNTRIES,
  MAX_COUNTRIES_HARD_LIMIT,
  MAP_LOAD_TIMEOUT,
} from './map'

// Config constants (initialized once)
const MAPBOX_DATA_URL = getMapboxData()
const MAPBOX_TOKEN = getMapboxToken()
const MAPBOX_STYLE = getMapboxStyle()

type CountryData = {
  iso2: string,
  iso3: string,
  name: string,
  unique_visits: number,
  unique_users: number,
  events_count: number,
  bin: number,
}

type Bin = {
  bin: number,
  min: number,
  max: number,
  label: string,
}

type Props = {
  countries: CountryData[],
  bins: Bin[],
  intl: any,
}

/**
 * StatsMap component displays country-level visitor statistics on an interactive map
 */
function StatsMap ({ countries, bins, intl }: Props) {
  const [hoveredCountry, setHoveredCountry] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT)
  const mapRef = useRef(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  // Custom hooks
  const { data: mapboxData, error: geoJsonError, retry: retryGeoJson } = useGeoJsonData(MAPBOX_DATA_URL)
  const tooltipPosition = useTooltipPosition(hoveredCountry, mousePosition, tooltipRef, mapRef)

  // Generate colors based on bin count (safe even if bins.length === 0)
  const binColors = useMemo(() => getBinColors(bins.length), [bins.length])
  const binTextColors = useMemo(() => getBinTextColors(bins.length), [bins.length])

  // Limit countries for performance
  const limitedCountries = useMemo(() => {
    if (countries.length > MAX_COUNTRIES) {
      console.warn(
        `Limiting countries from ${countries.length} to ${MAX_COUNTRIES} for performance`
      )
    }
    return countries.slice(0, MAX_COUNTRIES)
  }, [countries])

  // Create country color mapping
  const countryColors = useMemo(() => {
    const colors = {}
    limitedCountries.forEach(country => {
      if (country.name && typeof country.bin === 'number') {
        const binIndex = Math.min(country.bin, binColors.length - 1)
        const color = binColors[binIndex] || binColors[0]
        if (color) {
          colors[country.name] = color
        }
      }
    })
    return colors
  }, [limitedCountries, binColors])

  // Create fill color expression for mapbox
  const fillColorExpression = useMemo(() => {
    if (Object.keys(countryColors).length === 0 || binColors.length === 0) {
      return null
    }
    return createFillColorExpression(countryColors, getMapboxDefaultColor())
  }, [countryColors, binColors])

  // Layer configurations
  const fillLayer = useMemo(() => createFillLayer(), [])
  const lineLayer = useMemo(() => createLineLayer(), [])

  // Handle geoJson loading errors
  useEffect(() => {
    if (geoJsonError) {
      setErrorMessage(geoJsonError)
      setMapError(true)
    }
  }, [geoJsonError])

  // Add timeout fallback to detect if map is stuck loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!mapLoaded && !mapError) {
        console.error('Map loading timeout - map failed to load within expected time')
        setErrorMessage(
          'Map loading timed out. This may be due to network issues, ad blockers, or invalid Mapbox configuration.'
        )
        setMapError(true)
      }
    }, MAP_LOAD_TIMEOUT)

    return () => clearTimeout(timeout)
  }, [mapLoaded, mapError])

  // Update map layer colors when data changes
  useEffect(() => {
    if (mapRef.current && mapLoaded && fillColorExpression) {
      const map = mapRef.current.getMap()
      if (!map) return
      try {
        if (map.getLayer('country-fills')) {
          map.setPaintProperty('country-fills', 'fill-color', fillColorExpression)
        }
      } catch (error) {
        console.error('Error updating map colors:', error)
      }
    }
  }, [mapLoaded, fillColorExpression])

  const onHover = useCallback(
    (event: any) => {
      const feature = event.features && event.features[0]
      if (feature) {
        const countryName = feature.properties.name
        const countryData = limitedCountries.find(c => c.name === countryName)
        setHoveredCountry(countryData)
        setMousePosition({ x: event.point[0], y: event.point[1] })
      } else {
        setHoveredCountry(null)
        setMousePosition({ x: 0, y: 0 })
      }
    },
    [limitedCountries]
  )

  const retryMapLoad = useCallback(() => {
    setMapError(false)
    setErrorMessage('')
    setMapLoaded(false)
    retryGeoJson()
  }, [retryGeoJson])

  const handleMapLoad = useCallback(() => {
    setMapLoaded(true)
    setMapError(false)

    if (!mapRef.current) return

    const map = mapRef.current.getMap()
    const hiddenLabelPattern = /place|poi|label|city|town|village|settlement|marine|water|ocean|sea|bay|gulf|lake|river/i

    ;(map.getStyle().layers || []).forEach(layer => {
      if (hiddenLabelPattern.test(layer.id) && (layer.type === 'symbol' || layer.id.includes('label'))) {
        map.setLayoutProperty(layer.id, 'visibility', 'none')
      }
    })

    const logo = map.getContainer().querySelector('.mapboxgl-ctrl-logo')
    if (logo) {
      logo.style.opacity = '0.2'
      logo.style.filter = 'brightness(0.3)'
    }
  }, [])

  const handleMapError = useCallback((error: any) => {
    console.warn('Map event error (may be transient):', error)

    // Ignore errors after successful load (transient Mapbox errors during updates)
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
    setErrorMessage(`Mapbox error: ${message}. Check your Mapbox token and internet connection.`)
    setMapError(true)
  }, [mapLoaded])

  if (countries.length > MAX_COUNTRIES_HARD_LIMIT) {
    console.error(
      `Too many countries (${countries.length}), refusing to render for performance`
    )
    return <MapTooMuchDataState countryCount={countries.length} />
  }

  const hasData = bins.length > 0 && countries.length > 0

  if (mapError) {
    return (
      <MapErrorState
        errorMessage={errorMessage}
        mapboxToken={MAPBOX_TOKEN}
        mapboxStyle={MAPBOX_STYLE}
        mapboxDataUrl={MAPBOX_DATA_URL}
        onRetry={retryMapLoad}
      />
    )
  }

  return (
    <div
      style={{
        position: 'relative',
        height: '100%',
        width: '100%',
        cursor: 'default',
      }}
    >
      <ReactMapGL
        ref={mapRef}
        mapStyle={MAPBOX_STYLE}
        width="100%"
        height="100%"
        latitude={viewport.latitude}
        longitude={viewport.longitude}
        zoom={viewport.zoom}
        maxBounds={[
          [-180, -10],
          [180, 10],
        ]}
        maxZoom={5}
        scrollZoom={false}
        touchZoom={false}
        doubleClickZoom={true}
        dragPan={true}
        dragRotate={true}
        touchRotate={false}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={mapLoaded && hasData ? ['country-fills'] : []}
        onViewportChange={setViewport}
        onLoad={handleMapLoad}
        onHover={mapLoaded && hasData ? onHover : undefined}
        onError={handleMapError}
      >
        {mapLoaded && mapboxData && (
          <Source
            key="countries-source"
            id="countries"
            type="geojson"
            data={mapboxData}
          >
            <Layer key="country-fills" {...fillLayer} />
            <Layer key="country-borders" {...lineLayer} />
          </Source>
        )}

        {!mapLoaded && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#6b7280',
              fontSize: '14px',
            }}
          >
            Loading map...
          </div>
        )}
      </ReactMapGL>

      {hasData && (
        <MapLegend
          bins={bins}
          binColors={binColors}
          binTextColors={binTextColors}
        />
      )}

      {!hasData && mapLoaded && <MapEmptyState intl={intl} />}

      {hoveredCountry && hasData && (
        <MapTooltip
          country={hoveredCountry}
          position={tooltipPosition}
          binColors={binColors}
          intl={intl}
          tooltipRef={tooltipRef}
        />
      )}
    </div>
  )
}

// Memoize and wrap with injectIntl
const MemoizedStatsMap = React.memo(StatsMap)
const StatsMapWithIntl = injectIntl(MemoizedStatsMap)

// External props type (without intl which is injected)
type ExternalProps = {
  countries: CountryData[],
  bins: Bin[],
}

// Wrap with ErrorBoundary and export
export default function StatsMapWithErrorBoundary (props: ExternalProps) {
  return (
    <MapErrorBoundary>
      <StatsMapWithIntl {...props} />
    </MapErrorBoundary>
  )
}
