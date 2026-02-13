/* @flow */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import ReactMapGL, { Source, Layer } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { injectIntl } from 'react-intl'

import ErrorBoundary from 'utility/ErrorBoundary'
import { Colors } from './colors'
import {
  MapLegend,
  MapTooltip,
  MapErrorState,
  MapEmptyState,
  useTooltipPosition,
  parseMapError,
  getBinColors,
  getBinTextColors,
  createFillLayer,
  createLineLayer,
  createFillColorExpression,
} from './map'

function getMapboxData (): string {
  return window.MAPBOX_DATA || 'mapbox://mapbox.country-boundaries-v1'
}

function readMapboxToken (): ?string {
  const value = window.MAPBOX_ACCESS_TOKEN
  if (typeof value !== 'string') return null
  const token = value.trim()
  if (!token || token === 'MAPBOX_TOKEN_REMOVED' || token === 'CHANGEME') {
    return null
  }
  return token
}

function getMapboxToken (): string {
  return readMapboxToken() || 'MAPBOX_TOKEN_REMOVED'
}

function getMapboxStyle (): string {
  return window.MAPBOX_STYLE_STATS || 'mapbox://styles/mapbox/dark-v11'
}

function getMapboxDefaultColor (): string {
  return window.MAPBOX_DEFAULT_COLOR || Colors.DARK_GRAY3
}

const MAPBOX_DATA_URL = getMapboxData()
const MAPBOX_TOKEN = getMapboxToken()
const MAPBOX_STYLE = getMapboxStyle()
const IS_VECTOR_SOURCE = MAPBOX_DATA_URL.startsWith('mapbox://')

const DEFAULT_VIEWPORT = {
  latitude: 20,
  longitude: 0,
  zoom: 0.9,
}

const MAP_LOAD_TIMEOUT = 20000

type CountryData = {
  iso2: string,
  iso3: string,
  name: string,
  unique_visits: number,
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

function StatsMap ({ countries, bins, intl }: Props) {
  const [hoveredCountry, setHoveredCountry] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT)
  const [mapboxData, setMapboxData] = useState(null)
  const [geoJsonError, setGeoJsonError] = useState<?string>(null)
  const [geoJsonReloadKey, setGeoJsonReloadKey] = useState(0)
  const mapRef = useRef(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  const tooltipPosition = useTooltipPosition(hoveredCountry, mousePosition, tooltipRef, mapRef)

  const binColors = useMemo(() => getBinColors(bins.length), [bins.length])
  const binTextColors = useMemo(() => getBinTextColors(bins.length), [bins.length])
  const featureMatchProperty = IS_VECTOR_SOURCE ? 'iso_3166_1_alpha_3' : 'name'

  const countryColors = useMemo(() => {
    const colors = {}
    countries.forEach(country => {
      const iso3 = typeof country.iso3 === 'string'
        ? country.iso3.toUpperCase()
        : null
      const matchValue = IS_VECTOR_SOURCE
        ? iso3
        : country.name

      if (matchValue && typeof country.bin === 'number') {
        const binIndex = Math.min(country.bin, binColors.length - 1)
        const color = binColors[binIndex] || binColors[0]
        if (color) {
          colors[matchValue] = color
        }
      }
    })
    return colors
  }, [countries, binColors])

  const fillColorExpression = useMemo(() => {
    if (Object.keys(countryColors).length === 0 || binColors.length === 0) {
      return null
    }
    return createFillColorExpression(
      countryColors,
      getMapboxDefaultColor(),
      featureMatchProperty
    )
  }, [countryColors, binColors, featureMatchProperty])

  const fillLayer = useMemo(() => createFillLayer(), [])
  const lineLayer = useMemo(() => createLineLayer(), [])

  useEffect(() => {
    if (IS_VECTOR_SOURCE) {
      setGeoJsonError(null)
      setMapboxData(null)
      return undefined
    }

    let cancelled = false
    setGeoJsonError(null)
    if (geoJsonReloadKey > 0) {
      setMapboxData(null)
    }

    fetch(MAPBOX_DATA_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return response.json()
      })
      .then(data => {
        if (cancelled) return
        setMapboxData(data)
      })
      .catch(error => {
        if (cancelled) return
        console.error('Failed to fetch geojson data:', error)
        setGeoJsonError(`Failed to load map data: ${error.message}`)
      })

    return () => {
      cancelled = true
    }
  }, [geoJsonReloadKey])

  useEffect(() => {
    if (geoJsonError) {
      setErrorMessage(geoJsonError)
      setMapError(true)
    }
  }, [geoJsonError])

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

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return
    const map = mapRef.current.getMap()
    if (!map) return
    try {
      if (map.getLayer('country-fills')) {
        const nextColor = fillColorExpression || getMapboxDefaultColor()
        map.setPaintProperty('country-fills', 'fill-color', nextColor)
      }
    } catch (error) {
      console.error('Error updating map colors:', error)
    }
  }, [mapLoaded, fillColorExpression])

  const onHover = useCallback(
    (event: any) => {
      const feature = event.features && event.features[0]
      if (feature) {
        const properties = feature.properties || {}
        const featureIso3 = String(properties.iso_3166_1_alpha_3 || '').toUpperCase()
        const featureName = (
          properties.name ||
          properties.name_en ||
          properties.admin
        )
        const normalizedFeatureName = String(featureName || '').trim().toLowerCase()

        let countryData = null

        if (IS_VECTOR_SOURCE && featureIso3) {
          countryData = countries.find(
            c => String(c.iso3 || '').toUpperCase() === featureIso3
          )
        }

        if (!countryData && normalizedFeatureName) {
          countryData = countries.find(
            c => String(c.name || '').trim().toLowerCase() === normalizedFeatureName
          )
        }

        setHoveredCountry(countryData)
        setMousePosition({ x: event.point[0], y: event.point[1] })
      } else {
        setHoveredCountry(null)
        setMousePosition({ x: 0, y: 0 })
      }
    },
    [countries]
  )

  const retryGeoJson = useCallback(() => {
    if (IS_VECTOR_SOURCE) return
    setGeoJsonReloadKey(prev => prev + 1)
  }, [])

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
    ;(map.getStyle().layers || []).forEach(layer => {
      if (layer.type === 'symbol') {
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

  const hasData = bins.length > 0 && countries.length > 0

  return (
    <div className="c-stats-map-root">
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
        {mapLoaded && IS_VECTOR_SOURCE && (
          <Source
            key="countries-source-vector"
            id="countries"
            type="vector"
            url={MAPBOX_DATA_URL}
          >
            <Layer
              key="country-fills-vector"
              {...fillLayer}
              {...{ 'source-layer': 'country_boundaries' }}
            />
            <Layer
              key="country-borders-vector"
              {...lineLayer}
              {...{ 'source-layer': 'country_boundaries' }}
            />
          </Source>
        )}

        {!mapLoaded && (
          <div className="c-stats-map__loading-text c-stats-map__loading-text--center">
            Loading map...
          </div>
        )}
      </ReactMapGL>

      {mapError && (
        <div className="c-stats-map__overlay c-stats-map__overlay--error">
          <MapErrorState
            errorMessage={errorMessage}
            mapboxToken={MAPBOX_TOKEN}
            mapboxStyle={MAPBOX_STYLE}
            mapboxDataUrl={MAPBOX_DATA_URL}
            onRetry={retryMapLoad}
          />
        </div>
      )}

      {hasData && !mapError && (
        <MapLegend
          bins={bins}
          binColors={binColors}
          binTextColors={binTextColors}
        />
      )}

      {!hasData && mapLoaded && !mapError && (
        <div className="c-stats-map__overlay c-stats-map__overlay--empty">
          <MapEmptyState intl={intl} />
        </div>
      )}

      {hoveredCountry && hasData && !mapError && (
        <MapTooltip
          country={hoveredCountry}
          position={tooltipPosition}
          binColors={binColors}
          binTextColors={binTextColors}
          intl={intl}
          tooltipRef={tooltipRef}
        />
      )}
    </div>
  )
}

const MemoizedStatsMap = React.memo(StatsMap)
const StatsMapWithIntl = injectIntl(MemoizedStatsMap)

type ExternalProps = {
  countries: CountryData[],
  bins: Bin[],
}

export default function StatsMapWithErrorBoundary (props: ExternalProps) {
  return (
    <ErrorBoundary>
      <StatsMapWithIntl {...props} />
    </ErrorBoundary>
  )
}
