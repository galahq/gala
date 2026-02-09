/* @flow */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactMapGL, { Layer, NavigationControl, Source } from 'react-map-gl'

import { NonIdealState, Popover, Position } from '@blueprintjs/core'

import 'mapbox-gl/dist/mapbox-gl.css'

import { Colors } from './colors'

import {
  DEFAULT_VIEWPORT,
  MAPBOX_COUNTRY_ISO3_PROPERTY,
  MAPBOX_COUNTRY_SOURCE_LAYER,
  buildCountryColorMap,
  calculateTooltipPosition,
  createFillColorExpression,
  createFillLayer,
  createLineLayer,
  getLegendColors,
  getMapboxData,
  getMapboxStyle,
  getMapboxToken,
  normalizeIso3,
  parseMapError,
} from './map'

import type { StatsBin, StatsCountryRow } from './map'

type Props = {
  rows: Array<StatsCountryRow>,
  bins: Array<StatsBin>,
  t: (key: string) => string,
}

const INITIAL_VIEWPORT = {
  ...DEFAULT_VIEWPORT,
  latitude: 0,
  longitude: 0,
  zoom: 0,
}

type HoveredCountry = {
  countryName: string,
  flagUrl: ?string,
  row: StatsCountryRow,
}

function normalizeIso2 (value: mixed): ?string {
  if (typeof value !== 'string') return null
  const trimmed = value.trim().toUpperCase()
  return trimmed.length === 2 ? trimmed : null
}

function buildFlagUrl (iso2: ?string): ?string {
  if (!iso2) return null
  return `https://flagcdn.com/${iso2.toLowerCase()}.svg`
}

function featureCountryName (feature: any): string {
  const props = feature && feature.properties ? feature.properties : null
  if (!props) return 'Unknown'

  return props.name_en || props.name || props.name_long || 'Unknown'
}

function MapTooltip ({
  hovered,
  binColors,
  binTextColors,
  tooltipRef,
  position,
  t,
}: {
  hovered: HoveredCountry,
  binColors: string[],
  binTextColors: string[],
  tooltipRef: { current: HTMLDivElement | null },
  position: { left: number, top: number },
  t: (key: string) => string,
}): React$Node {
  const { row, countryName, flagUrl } = hovered
  const colorIndex =
    row.bin != null && binColors.length > 0
      ? Math.min(row.bin, binColors.length - 1)
      : -1
  const color =
    colorIndex >= 0 ? binColors[colorIndex] : binColors[0] || Colors.PAPER
  const chipTextColor =
    colorIndex >= 0 && binTextColors.length > 0
      ? binTextColors[Math.min(colorIndex, binTextColors.length - 1)]
      : binTextColors[0] || Colors.BLACK

  return (
    <div
      ref={tooltipRef}
      className="c-stats-map-tooltip pt-typography"
      style={{ left: position.left, top: position.top }}
    >
      <div className="c-stats-map-tooltip__country-row">
        {flagUrl && (
          <img
            className="c-stats-map-tooltip__flag"
            src={flagUrl || undefined}
            width="28"
            height="20"
            loading="lazy"
            alt={`${countryName} flag`}
            onError={event => {
              event.currentTarget.style.display = 'none'
            }}
          />
        )}
        <div className="c-stats-map-tooltip__country">{countryName}</div>
      </div>
      <div className="c-stats-map-tooltip__metric-row">
        <span className="c-stats-map-tooltip__metric-label">
          {t('table_unique_visitors')}
        </span>
        <span
          className="c-stats-map-tooltip__metric-pill"
          style={{ backgroundColor: color, color: chipTextColor }}
        >
          {row.unique_visits.toLocaleString()}
        </span>
      </div>
      <div className="c-stats-map-tooltip__details">
        {row.unique_users.toLocaleString()} {t('map_tooltip_users')} •{' '}
        {row.events_count.toLocaleString()} {t('map_tooltip_events')}
      </div>
    </div>
  )
}

function MapLegend ({
  bins,
  binShares,
  binColors,
  binTextColors,
  t,
}: {
  bins: Array<StatsBin>,
  binShares: number[],
  binColors: string[],
  binTextColors: string[],
  t: (key: string) => string,
}): React$Node {
  if (!bins.length) return null

  return (
    <div className="c-stats-map-legend pt-typography">
      <div className="c-stats-map-legend__title">
        {t('map_legend_title')}
        <Popover
          position={Position.TOP_LEFT}
          hoverOpenDelay={100}
          content={
            <div className="c-stats-map-legend__popover">
              <h6 className="c-stats-map-legend__popover-heading">
                {t('map_legend_help_title')}
              </h6>
              <p className="c-stats-map-legend__popover-text">
                {t('map_legend_help_description')}
              </p>
            </div>
          }
        >
          <button
            type="button"
            className="pt-button pt-minimal pt-small pt-icon-info-sign c-stats-map-legend__help-icon"
            aria-label={t('map_legend_help_title')}
          />
        </Popover>
      </div>
      <div className="c-stats-map-legend__stack">
        {bins.map((bin, index) => {
          const share = binShares[index] || 0
          const width = `${Math.max(share, 7.14)}%`
          const borderRadius =
            bins.length === 1
              ? '4px'
              : index === 0
              ? '4px 0 0 4px'
              : index === bins.length - 1
              ? '0 4px 4px 0'
              : '0'

          return (
            <div
              key={`bin-${bin.bin}`}
              className="c-stats-map-legend__segment"
              style={{
                width,
                borderRadius,
                background: binColors[index],
              }}
            >
              <span
                className="c-stats-map-legend__label"
                style={{ color: binTextColors[index] }}
              >
                {share.toFixed(0)}%
              </span>
            </div>
          )
        })}
      </div>
      <div className="c-stats-map-legend__ranges">
        {bins.map((bin, index) => {
          const share = binShares[index] || 0
          const width = `${Math.max(share, 7.14)}%`
          return (
            <div
              key={`label-${bin.bin}`}
              className="c-stats-map-legend__range"
              style={{ width }}
            >
              {index > 0 ? bin.label : '-'}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MapErrorState ({
  message,
  t,
  onRetry,
}: {
  message: string,
  t: (key: string) => string,
  onRetry: () => void,
}): React$Node {
  return (
    <NonIdealState
      visual="error"
      title={t('error_map_title')}
      description={message || t('error_map_description')}
      action={
        <button className="pt-button pt-intent-primary" onClick={onRetry}>
          {t('error_map_retry')}
        </button>
      }
    />
  )
}

function StatsMap ({ rows, bins, t }: Props): React$Node {
  const mapRef = useRef(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  const [viewport, setViewport] = useState(INITIAL_VIEWPORT)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [mapErrorMessage, setMapErrorMessage] = useState('')
  const [mapKey, setMapKey] = useState(0)

  const [hovered, setHovered] = useState<?HoveredCountry>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [tooltipPosition, setTooltipPosition] = useState({
    left: -1000,
    top: -1000,
  })

  const defaultCountryColor = Colors.PAPER

  const hasKnownCountryStats = useMemo(() => {
    return rows.some(row => {
      const iso3 = normalizeIso3(row.iso3)
      return iso3 != null && row.name && row.name !== 'Unknown'
    })
  }, [rows])

  const { binColors, binTextColors } = useMemo(() => {
    const legendColors = getLegendColors(bins.length)

    if (!hasKnownCountryStats) {
      return {
        binColors: bins.map(() => defaultCountryColor),
        binTextColors: bins.map(() => Colors.BLACK),
      }
    }

    return legendColors
  }, [bins, defaultCountryColor, hasKnownCountryStats])

  const rowsByIso3 = useMemo(() => {
    const index = {}

    rows.forEach(row => {
      const iso3 = normalizeIso3(row.iso3)
      if (iso3) index[iso3] = row
    })

    return index
  }, [rows])

  const countryColors = useMemo(() => {
    return buildCountryColorMap(rows, bins.length)
  }, [rows, bins.length])

  const fillColorExpression = useMemo(() => {
    if (Object.keys(countryColors).length === 0) return null

    return createFillColorExpression(
      countryColors,
      defaultCountryColor,
      MAPBOX_COUNTRY_ISO3_PROPERTY
    )
  }, [countryColors, defaultCountryColor])

  const fillLayer = useMemo(() => {
    return createFillLayer({
      sourceLayer: MAPBOX_COUNTRY_SOURCE_LAYER,
      fillColor: fillColorExpression || defaultCountryColor,
    })
  }, [defaultCountryColor, fillColorExpression])

  const lineLayer = useMemo(() => {
    return createLineLayer({
      sourceLayer: MAPBOX_COUNTRY_SOURCE_LAYER,
    })
  }, [])

  const binShares = useMemo(() => {
    if (!bins.length || !rows.length) return []

    const totals = new Array(bins.length).fill(0)
    let totalVisits = 0

    rows.forEach(row => {
      if (!Number.isFinite(row.bin)) return
      const index = Math.max(0, Math.min(row.bin || 0, bins.length - 1))
      const visits = row.unique_visits || 0
      totals[index] += visits
      totalVisits += visits
    })

    if (totalVisits === 0) return totals.map(() => 0)
    return totals.map(value => (value / totalVisits) * 100)
  }, [bins, rows])

  useEffect(() => {
    if (!mapRef.current || !hovered) return

    const map = mapRef.current.getMap()
    const tooltipEl = tooltipRef.current
    if (!map || !tooltipEl) return

    const mapRect = map.getContainer().getBoundingClientRect()
    const tipRect = tooltipEl.getBoundingClientRect()

    setTooltipPosition(
      calculateTooltipPosition({
        mouse: mousePosition,
        tooltipRect: tipRect,
        mapRect,
      })
    )
  }, [hovered, mousePosition])

  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    const map = mapRef.current.getMap()
    if (!map) return

    const onIdle = () => {
      if (map.getLayer('country-fills')) {
        setMapReady(true)
      }
    }

    map.on('idle', onIdle)
    onIdle()

    return () => {
      map.off('idle', onIdle)
    }
  }, [mapLoaded, mapKey])

  useEffect(() => {
    if (!mapRef.current || !mapReady) return

    const map = mapRef.current.getMap()
    if (!map) return

    try {
      if (map.getLayer('country-fills')) {
        map.setPaintProperty(
          'country-fills',
          'fill-color',
          fillColorExpression || defaultCountryColor
        )
      }
    } catch (_error) {
      // Mapbox can throw while style transitions; ignore and keep map mounted.
    }
  }, [defaultCountryColor, fillColorExpression, mapReady])

  const handleViewportChange = useCallback((nextViewport: any) => {
    setViewport(nextViewport)
  }, [])

  const handleMapLoad = useCallback(() => {
    if (!mapRef.current) return

    const map = mapRef.current.getMap()

    setMapLoaded(true)
    setMapReady(false)
    setMapError(false)
    setMapErrorMessage('')
    ;(map.getStyle().layers || []).forEach(layer => {
      if (layer.type === 'symbol' || layer.id.includes('label')) {
        map.setLayoutProperty(layer.id, 'visibility', 'none')
      }

      if (
        layer.type === 'fill' &&
        (layer.id === 'land' ||
          layer.id.startsWith('land-') ||
          layer.id.includes('landcover'))
      ) {
        try {
          map.setPaintProperty(layer.id, 'fill-color', defaultCountryColor)
        } catch (_error) {
          // Ignore style-specific layer paint incompatibilities.
        }
      }
    })
  }, [defaultCountryColor])

  const handleMapError = useCallback(
    (error: any) => {
      console.error('Map error:', error)
      if (mapLoaded) return

      const parsed = parseMapError(error)
      if (parsed.isTransient) return

      setMapError(true)
      setMapErrorMessage(parsed.message)
    },
    [mapLoaded]
  )

  const handleHover = useCallback(
    (event: any) => {
      const feature = event && event.features && event.features[0]
      if (!feature) {
        setHovered(null)
        return
      }

      const code = normalizeIso3(
        feature.properties
          ? feature.properties[MAPBOX_COUNTRY_ISO3_PROPERTY]
          : null
      )

      if (!code || !rowsByIso3[code]) {
        const name = featureCountryName(feature)
        const iso2 = normalizeIso2(
          feature && feature.properties
            ? feature.properties.iso_3166_1 ||
                feature.properties.iso_3166_1_alpha_2
            : null
        )

        setHovered({
          countryName: name,
          flagUrl: buildFlagUrl(iso2),
          row: {
            iso2,
            iso3: code,
            name,
            unique_visits: 0,
            unique_users: 0,
            events_count: 0,
            visit_podcast_count: 0,
            first_event: null,
            last_event: null,
          },
        })
        setMousePosition({ x: event.point[0], y: event.point[1] })
        return
      }

      const row = rowsByIso3[code]
      setHovered({
        countryName: row.name,
        flagUrl: row.flag_url || buildFlagUrl(row.iso2),
        row,
      })
      setMousePosition({ x: event.point[0], y: event.point[1] })
    },
    [rowsByIso3]
  )

  const retryMap = useCallback(() => {
    setMapError(false)
    setMapErrorMessage('')
    setMapLoaded(false)
    setMapReady(false)
    setMapKey(prev => prev + 1)
  }, [])

  return (
    <div className="c-stats-map-root pt-typography">
      <ReactMapGL
        key={mapKey}
        ref={mapRef}
        width="100%"
        height="100%"
        latitude={viewport.latitude}
        longitude={viewport.longitude}
        zoom={viewport.zoom}
        mapStyle={getMapboxStyle()}
        mapboxApiAccessToken={getMapboxToken()}
        interactiveLayerIds={mapReady ? ['country-fills'] : []}
        logoPosition="bottom-left"
        fadeDuration={100}
        trackResize={true}
        bearingSnap={360}
        pitchWithRotate={false}
        dragRotate={false}
        dragPan={true}
        touchPitch={false}
        doubleClickZoom={false}
        antialias={true}
        optimizeForTerrain={false}
        onViewportChange={handleViewportChange}
        onLoad={handleMapLoad}
        onError={handleMapError}
        onHover={mapReady ? handleHover : undefined}
      >
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
          <NavigationControl
            showCompass={false}
            onViewportChange={handleViewportChange}
          />
        </div>

        {mapLoaded && (
          <Source id="countries" type="vector" url={getMapboxData()}>
            <Layer {...fillLayer} />
            <Layer {...lineLayer} />
          </Source>
        )}

        {!mapLoaded && (
          <div className="c-stats-map__loading-text c-stats-map__loading-text--center">
            <span>{t('loading_map')}</span>
          </div>
        )}
      </ReactMapGL>

      {mapError && (
        <div className="c-stats-map__overlay c-stats-map__overlay--error">
          <MapErrorState message={mapErrorMessage} t={t} onRetry={retryMap} />
        </div>
      )}

      {hovered && !mapError && (
        <MapTooltip
          hovered={hovered}
          binColors={binColors}
          binTextColors={binTextColors}
          tooltipRef={tooltipRef}
          position={tooltipPosition}
          t={t}
        />
      )}

      {!mapError && bins.length > 0 && (
        <MapLegend
          bins={bins}
          binShares={binShares}
          binColors={binColors}
          binTextColors={binTextColors}
          t={t}
        />
      )}
    </div>
  )
}
export default React.memo<Props>(StatsMap)
