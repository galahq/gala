/* @flow */
import React, { useState, useRef, useMemo, useCallback } from 'react'
import ReactMapGL, { Source, Layer } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { injectIntl } from 'react-intl'

import ErrorBoundary from 'utility/ErrorBoundary'
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
import { useMapLoadTimeout } from './hooks/useMapLoadTimeout'
import { useMapFillColorSync } from './hooks/useMapFillColorSync'
import { useMapHover } from './hooks/useMapHover'
import {
  DEFAULT_VIEWPORT,
  MAP_BOUNDS,
  MAPBOX_DATA_URL,
  MAPBOX_DEFAULT_COLOR,
  MAPBOX_STYLE,
  MAPBOX_TOKEN,
  MAP_LOAD_TIMEOUT,
} from './map/config'
import type { StatsBin, StatsCountryRow } from './types'

type Props = {
  countries: StatsCountryRow[],
  bins: StatsBin[],
  intl: any,
}

function StatsMap ({ countries, bins, intl }: Props) {
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT)
  const mapRef = useRef(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  const {
    hoveredCountry,
    mousePosition,
    handleHover,
  } = useMapHover({
    countries,
  })

  const tooltipPosition = useTooltipPosition(hoveredCountry, mousePosition, tooltipRef, mapRef)

  const binColors = useMemo(() => getBinColors(bins.length), [bins.length])
  const binTextColors = useMemo(() => getBinTextColors(bins.length), [bins.length])
  const featureMatchProperty = 'iso_3166_1_alpha_3'

  const countryColors = useMemo(() => {
    const colors = {}
    countries.forEach(country => {
      const iso3 = typeof country.iso3 === 'string'
        ? country.iso3.toUpperCase()
        : null
      const matchValue = iso3

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
      MAPBOX_DEFAULT_COLOR,
      featureMatchProperty
    )
  }, [countryColors, binColors, featureMatchProperty])

  const fillLayer = useMemo(() => createFillLayer(), [])
  const lineLayer = useMemo(() => createLineLayer(), [])

  const handleMapTimeout = useCallback(() => {
    console.error('Map loading timeout - map failed to load within expected time')
    setErrorMessage(
      'Map loading timed out. This may be due to network issues, ad blockers, or invalid Mapbox configuration.'
    )
    setMapError(true)
  }, [])

  useMapLoadTimeout({
    mapLoaded,
    mapError,
    timeoutMs: MAP_LOAD_TIMEOUT,
    onTimeout: handleMapTimeout,
  })

  useMapFillColorSync({
    mapRef,
    mapLoaded,
    fillColorExpression,
    defaultColor: MAPBOX_DEFAULT_COLOR,
  })

  const retryMapLoad = useCallback(() => {
    setMapError(false)
    setErrorMessage('')
    setMapLoaded(false)
  }, [])

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
        maxBounds={MAP_BOUNDS}
        maxZoom={5}
        scrollZoom={false}
        touchZoom={false}
        doubleClickZoom={true}
        dragPan={true}
        dragRotate={true}
        touchRotate={false}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={mapLoaded && hasData && !mapError ? ['country-fills'] : []}
        onViewportChange={setViewport}
        onLoad={handleMapLoad}
        onHover={mapLoaded && hasData && !mapError ? handleHover : undefined}
        onError={handleMapError}
      >
        {mapLoaded && (
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
            {intl.formatMessage({ id: 'cases.stats.show.loadingMap' })}
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
  countries: StatsCountryRow[],
  bins: StatsBin[],
}

export default function StatsMapWithErrorBoundary (props: ExternalProps) {
  return (
    <ErrorBoundary>
      <StatsMapWithIntl {...props} />
    </ErrorBoundary>
  )
}
