/* @flow */
import * as React from 'react'
import ReactMapGL, { Source, Layer } from 'react-map-gl'
import { Button, Intent, NonIdealState, Popover, Position } from '@blueprintjs/core'
import { FormattedMessage } from 'react-intl'
import 'mapbox-gl/dist/mapbox-gl.css'

import { Colors } from './mapColors'
import {
  MAP_BOUNDS,
  MAPBOX_DATA_URL,
  MAPBOX_STYLE,
  MAPBOX_TOKEN,
} from './config'
import type { StatsBin, StatsCountryRow } from '../state/types'

const shouldShowDebugMapErrorDetails = process.env.NODE_ENV !== 'production'

type Viewport = {
  latitude: number,
  longitude: number,
  zoom: number,
}

type MapViewProps = {
  viewport: Viewport,
  mapRef: { current: any },
  tooltipRef: { current: HTMLDivElement | null },
  mapLoaded: boolean,
  mapError: boolean,
  hasData: boolean,
  fillLayer: any,
  lineLayer: any,
  hoveredCountry: ?StatsCountryRow,
  tooltipPosition: { left: number, top: number },
  binColors: string[],
  binTextColors: string[],
  bins: StatsBin[],
  errorMessage: string,
  onRetry: () => void,
  onViewportChange: (viewport: Viewport) => void,
  onLoad: () => void,
  onHover: (event: any) => void,
  onError: (error: any) => void,
  intl: any,
}

type MapErrorStateProps = {
  errorMessage: string,
  mapboxToken: string,
  mapboxStyle: string,
  mapboxDataUrl: string,
  onRetry: () => void,
}

function MapErrorState ({
  errorMessage,
  mapboxToken,
  mapboxStyle,
  mapboxDataUrl,
  onRetry,
}: MapErrorStateProps): React.Node {
  return (
    <div className="c-stats-map-error" role="alert" aria-live="assertive">
      <p className="c-stats-map-error__title">
        <FormattedMessage id="cases.stats.show.errorMapTitle" />
      </p>
      <p className="c-stats-map-error__message">
        {errorMessage || (
          <FormattedMessage id="cases.stats.show.errorMapDescription" />
        )}
      </p>
      <Button
        className="c-stats-map-error__retry"
        intent={Intent.PRIMARY}
        onClick={onRetry}
      >
        <FormattedMessage id="cases.stats.show.errorMapRetry" />
      </Button>
      {shouldShowDebugMapErrorDetails && (
        <div className="c-stats-map-error__debug">
          <p>Debug info:</p>
          <p>Token: {mapboxToken ? `${mapboxToken.substring(0, 20)}...` : 'none'}</p>
          <p>Style: {mapboxStyle}</p>
          <p>Data: {mapboxDataUrl}</p>
        </div>
      )}
    </div>
  )
}

type MapEmptyStateProps = {
  intl: any,
}

function MapEmptyState ({ intl }: MapEmptyStateProps): React.Node {
  return (
    <NonIdealState
      title={intl.formatMessage({ id: 'cases.stats.show.errorNoDataTitle' })}
      description={intl.formatMessage({ id: 'cases.stats.show.errorNoDataDescription' })}
      visual="geosearch"
    />
  )
}

type MapLegendProps = {
  bins: StatsBin[],
  binColors: string[],
  binTextColors: string[],
  intl: any,
}

function MapLegend ({
  bins,
  binColors,
  binTextColors,
  intl,
}: MapLegendProps): React.Node {
  if (!bins || bins.length === 0) {
    return null
  }

  return (
    <div className="c-stats-map-legend pt-typography">
      <div className="c-stats-map-legend__title">
        <FormattedMessage id="cases.stats.show.mapLegendTitle" />
        <Popover
          position={Position.TOP_LEFT}
          hoverOpenDelay={100}
          content={
            <div className="c-stats-map-legend__popover">
              <h6 className="c-stats-map-legend__popover-heading">
                <FormattedMessage id="cases.stats.show.mapLegendHelpTitle" />
              </h6>
              <p className="c-stats-map-legend__popover-text">
                <FormattedMessage id="cases.stats.show.mapLegendHelpDescription" />
              </p>
            </div>
          }
        >
          <button
            type="button"
            className="pt-button pt-minimal pt-small pt-icon-info-sign c-stats-map-legend__help-icon"
            aria-label={intl.formatMessage({
              id: 'cases.stats.show.mapLegendHelpTitle',
            })}
          />
        </Popover>
      </div>

      <div className="c-stats-map-legend__stack">
        {bins.map((b, i) => {
          const width = `${100 / bins.length}%`

          let borderRadius = '0'
          if (bins.length === 1) {
            borderRadius = '4px'
          } else if (i === 0) {
            borderRadius = '4px 0 0 4px'
          } else if (i === bins.length - 1) {
            borderRadius = '0 4px 4px 0'
          }

          return (
            <div
              key={i}
              className="c-stats-map-legend__segment"
              style={{
                background: binColors[i],
                borderRadius,
                width,
              }}
              title={b.label}
            >
              <span
                className="c-stats-map-legend__label"
                style={{ color: binTextColors[i] }}
              >
                {b.label}
              </span>
            </div>
          )
        })}
      </div>

      <div className="c-stats-map-legend__footer">
        <span className="c-stats-map-legend__footer-label">
          <FormattedMessage id="cases.stats.show.mapLegendLow" />
        </span>
        <span className="c-stats-map-legend__footer-label">
          <FormattedMessage id="cases.stats.show.mapLegendHigh" />
        </span>
      </div>
    </div>
  )
}

type MapTooltipProps = {
  country: StatsCountryRow,
  position: { left: number, top: number },
  binColors: string[],
  binTextColors: string[],
  intl: any,
  tooltipRef: { current: HTMLDivElement | null },
}

function normalizeIso2 (value: mixed): ?string {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toUpperCase()
  return normalized.length === 2 ? normalized : null
}

function buildFlagUrl (iso2: ?string): ?string {
  if (!iso2) return null
  return `https://flagcdn.com/${iso2.toLowerCase()}.svg`
}

function MapTooltip ({
  country,
  position,
  binColors,
  binTextColors,
  intl,
  tooltipRef,
}: MapTooltipProps): React.Node {
  const colorIndex =
    binColors.length > 0
      ? Math.min(country.bin || 0, binColors.length - 1)
      : -1

  const binColor =
    colorIndex >= 0
      ? binColors[colorIndex] || binColors[0]
      : Colors.GRAY1
  const binTextColor =
    colorIndex >= 0
      ? binTextColors[colorIndex] || Colors.WHITE
      : Colors.WHITE

  const countryName = country.name || 'Unknown'
  const flagUrl = buildFlagUrl(normalizeIso2(country.iso2))
  const visitors = Number.isFinite(country.unique_visits)
    ? country.unique_visits
    : 0

  return (
    <div
      ref={tooltipRef}
      className="c-stats-map-tooltip pt-typography"
      style={{ left: position.left, top: position.top }}
      role="tooltip"
    >
      <div className="c-stats-map-tooltip__country-row">
        {flagUrl && (
          <img
            className="c-stats-map-tooltip__flag"
            src={flagUrl || undefined}
            width="20"
            height="14"
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
          {intl.formatMessage({ id: 'cases.stats.show.tableUniqueVisitors' })}
        </span>
        <span
          className="c-stats-map-tooltip__metric-pill"
          style={{ backgroundColor: binColor, color: binTextColor }}
        >
          {visitors.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

export default function MapView ({
  viewport,
  mapRef,
  tooltipRef,
  mapLoaded,
  mapError,
  hasData,
  fillLayer,
  lineLayer,
  hoveredCountry,
  tooltipPosition,
  binColors,
  binTextColors,
  bins,
  errorMessage,
  onRetry,
  onViewportChange,
  onLoad,
  onHover,
  onError,
  intl,
}: MapViewProps): React.Node {
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
        onViewportChange={onViewportChange}
        onLoad={onLoad}
        onHover={mapLoaded && hasData && !mapError ? onHover : undefined}
        onError={onError}
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
            onRetry={onRetry}
          />
        </div>
      )}

      {hasData && !mapError && (
        <MapLegend
          bins={bins}
          binColors={binColors}
          binTextColors={binTextColors}
          intl={intl}
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
