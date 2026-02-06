/* @flow */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import ReactMapGL, { Source, Layer, NavigationControl } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { injectIntl } from 'react-intl'

import MapErrorBoundary from './map/MapErrorBoundary'
import {
  MapLegend,
  MapTooltip,
  MapErrorState,
  MapEmptyState,
  useTooltipPosition,
  parseMapError,
  getBinColors,
  getBinTextColors,
  getMapboxData,
  getMapboxToken,
  getMapboxStyle,
  getMapboxDefaultColor,
  getMapboxCountrySourceLayer,
  getMapboxCountryIso3Property,
  createFillLayer,
  createLineLayer,
  createFillColorExpression,
  DEFAULT_VIEWPORT,
  MAX_COUNTRIES,
  MAP_LOAD_TIMEOUT,
} from './map'
import { normalizeIsoCode, toIso3 } from './map/isoCodes'

const MAPBOX_DATA_URL = getMapboxData()
const MAPBOX_TOKEN = getMapboxToken()
const MAPBOX_STYLE = getMapboxStyle()
const MAPBOX_COUNTRY_SOURCE_LAYER = getMapboxCountrySourceLayer()
const MAPBOX_COUNTRY_ISO3_PROPERTY = getMapboxCountryIso3Property()
const MAP_WATER_COLOR = '#FFFFFF'

type CountryData = {
  iso2?: string,
  iso3?: string,
  name?: string,
  unique_visits: number,
  unique_users: number,
  events_count: number,
  bin?: number,
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

function getCountryJoinCode (country: CountryData): ?string {
  const iso2 = normalizeIsoCode(country.iso2)
  const iso3 = normalizeIsoCode(country.iso3)
  return iso3 || toIso3(iso2)
}

function applyWaterColor (map: any, color: string): void {
  if (!map) return
  const style = map.getStyle()
  const layers = style && Array.isArray(style.layers) ? style.layers : []
  layers.forEach(layer => {
    if (!layer || !layer.id) return
    try {
      if (layer.type === 'background') {
        map.setPaintProperty(layer.id, 'background-color', color)
        return
      }
      if (!layer.id.includes('water')) return
      if (layer.type === 'fill') {
        map.setPaintProperty(layer.id, 'fill-color', color)
      } else if (layer.type === 'line') {
        map.setPaintProperty(layer.id, 'line-color', color)
      }
    } catch (error) {
      console.warn('Failed to update map water color:', error)
    }
  })
}

function StatsMap ({ countries, bins, intl }: Props) {
  const [hoveredCountry, setHoveredCountry] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT)
  const [mapKey, setMapKey] = useState(0)
  const mapRef = useRef(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const tooltipPosition = useTooltipPosition(hoveredCountry, mousePosition, tooltipRef, mapRef)

  const binColors = useMemo(() => getBinColors(bins.length), [bins.length])
  const binTextColors = useMemo(() => getBinTextColors(bins.length), [bins.length])
  const joinProperty = MAPBOX_COUNTRY_ISO3_PROPERTY
  const countryFilter = useMemo(() => ['has', MAPBOX_COUNTRY_ISO3_PROPERTY], [])

  const limitedCountries = useMemo(() => {
    if (countries.length > MAX_COUNTRIES) {
      console.warn(
        `Limiting countries from ${countries.length} to ${MAX_COUNTRIES} for performance`
      )
    }
    return countries.slice(0, MAX_COUNTRIES)
  }, [countries])

  const countriesByCode = useMemo(() => {
    const index = {}
    limitedCountries.forEach(country => {
      const code = getCountryJoinCode(country)
      if (code) {
        index[code] = country
      }
    })
    return index
  }, [limitedCountries])

  const countryColors = useMemo(() => {
    const colors = {}
    limitedCountries.forEach(country => {
      const code = getCountryJoinCode(country)
      if (!code) return
      if (typeof country.bin !== 'number') return
      const binIndex = Math.min(country.bin, binColors.length - 1)
      const color = binColors[binIndex] || binColors[0]
      if (color) {
        colors[code] = color
      }
    })
    return colors
  }, [limitedCountries, binColors])

  const fillColorExpression = useMemo(() => {
    if (Object.keys(countryColors).length === 0) {
      return null
    }
    return createFillColorExpression(countryColors, getMapboxDefaultColor(), joinProperty)
  }, [countryColors, joinProperty])
  const fillColorValue = fillColorExpression || getMapboxDefaultColor()

  const fillLayer = useMemo(() => createFillLayer({
    sourceLayer: MAPBOX_COUNTRY_SOURCE_LAYER,
    filter: countryFilter,
    fillColor: fillColorValue,
  }), [countryFilter, fillColorValue])
  const lineLayer = useMemo(() => createLineLayer({
    sourceLayer: MAPBOX_COUNTRY_SOURCE_LAYER,
    filter: countryFilter,
  }), [countryFilter])

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
    setMapReady(false)
    const map = mapRef.current.getMap()
    if (!map) return

    const handleIdle = () => {
      if (map.getLayer('country-fills')) {
        setMapReady(true)
      }
    }

    map.on('idle', handleIdle)
    handleIdle()

    return () => {
      map.off('idle', handleIdle)
    }
  }, [mapLoaded, mapKey])

  useEffect(() => {
    if (!mapRef.current || !mapReady) return
    const map = mapRef.current.getMap()
    if (!map) return
    try {
      if (map.getLayer('country-fills')) {
        const nextColor = fillColorExpression || getMapboxDefaultColor()
        map.setPaintProperty('country-fills', 'fill-color', nextColor)
      }
    } catch (error) {
      console.error('Error updating map styles:', error)
    }
  }, [mapReady, fillColorExpression])

  const onHover = useCallback((event: any) => {
    const feature = event.features && event.features[0]
    if (feature) {
      const rawCode = feature.properties ? feature.properties[joinProperty] : null
      const code = normalizeIsoCode(rawCode)
      const countryData = code ? countriesByCode[code] : null
      setHoveredCountry(countryData || null)
      setMousePosition({ x: event.point[0], y: event.point[1] })
    } else {
      setHoveredCountry(null)
      setMousePosition({ x: 0, y: 0 })
    }
  }, [joinProperty, countriesByCode])

  const retryMapLoad = useCallback(() => {
    setMapError(false)
    setErrorMessage('')
    setMapLoaded(false)
    setMapKey(prevKey => prevKey + 1)
  }, [])

  const handleMapLoad = useCallback(() => {
    setMapReady(false)
    if (!mapRef.current) return

    const map = mapRef.current.getMap()
    setMapLoaded(true)
    setMapError(false)

    ;(map.getStyle().layers || []).forEach(layer => {
      if (layer.type === 'symbol' || layer.id.includes('label')) {
        map.setLayoutProperty(layer.id, 'visibility', 'none')
      }
    })

    applyWaterColor(map, MAP_WATER_COLOR)

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

  const hasData = limitedCountries.length > 0
  const hasMapData = Object.keys(countryColors).length > 0
  const showLegend = bins.length > 0 && !mapError
  const binShares = useMemo(() => {
    if (!bins.length) return []
    const totals = new Array(bins.length).fill(0)
    let totalVisits = 0
    limitedCountries.forEach(country => {
      if (typeof country.bin !== 'number') return
      const visits = country.unique_visits || 0
      const index = Math.min(country.bin, bins.length - 1)
      totals[index] += visits
      totalVisits += visits
    })
    if (totalVisits === 0) {
      return totals.map(() => 0)
    }
    return totals.map(value => (value / totalVisits) * 100)
  }, [bins, limitedCountries])

  return (
    <div className="c-stats-map-root pt-typography">
      <ReactMapGL
        key={mapKey}
        ref={mapRef}
        mapStyle={MAPBOX_STYLE}
        width="100%"
        height="100%"
        latitude={viewport.latitude}
        longitude={viewport.longitude}
        zoom={viewport.zoom}
        maxBounds={[
          [-180, -85],
          [180, 85],
        ]}
        maxZoom={5}
        scrollZoom={true}
        touchZoom={true}
        doubleClickZoom={true}
        dragPan={true}
        dragRotate={true}
        touchRotate={false}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={mapReady && hasMapData ? ['country-fills'] : []}
        onViewportChange={setViewport}
        onLoad={handleMapLoad}
        onHover={mapReady && hasMapData ? onHover : undefined}
        onError={handleMapError}
      >
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
          <NavigationControl
            showCompass={false}
            onViewportChange={setViewport}
          />
        </div>
        {mapLoaded && (
          <Source
            key="countries-source"
            id="countries"
            type="vector"
            url={MAPBOX_DATA_URL}
          >
            <Layer key="country-fills" {...fillLayer} />
            <Layer key="country-borders" {...lineLayer} />
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

      {showLegend && (
        <MapLegend
          bins={bins}
          binColors={binColors}
          binTextColors={binTextColors}
          binShares={binShares}
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
    <MapErrorBoundary>
      <StatsMapWithIntl {...props} />
    </MapErrorBoundary>
  )
}
