/* @flow */
import React, { useState, useEffect, useRef } from 'react'
import ReactMapGL, { Source, Layer } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Colors, NonIdealState } from '@blueprintjs/core'
import { FormattedMessage, injectIntl } from 'react-intl'
import styled from 'styled-components'
import { theme } from '../utility/styledComponents'

// Styled Components
const MapContainer = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  cursor: default;
`

const ErrorContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f8fa;
  flex-direction: column;
  padding: 40px 20px;
  text-align: center;
`

const ErrorTitle = styled.p`
  color: #db3737;
  margin: 0 0 12px 0;
  font-weight: 600;
  font-size: 18px;
  font-family: ${theme.sansFont};
`

const ErrorMessage = styled.p`
  color: #5c7080;
  font-size: 14px;
  margin: 0 0 20px 0;
  line-height: 1.5;
  max-width: 400px;
  font-family: ${theme.sansFont};
`

const RetryButton = styled.button`
  padding: 10px 20px;
  background-color: #2965cc;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 500;
  font-family: ${theme.sansFont};
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #215db0;
  }

  &:active {
    background-color: #1f5199;
  }
`

const Legend = styled.div`
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: rgba(11, 11, 15, 0.85);
  padding: 8px 10px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  z-index: 1;
  min-width: 140px;
  max-width: 160px;
`

const LegendTitle = styled.div`
  margin-bottom: 7px;
  font-size: 16px;
  color: #aaa;
  font-weight: 500;
  font-family: ${theme.sansFont};
`

const GradientBar = styled.div`
  width: 100%;
  height: 12px;
  border-radius: 5px;
  background: linear-gradient(to right, #0072ff, #6a00ff, #d400ff, #ff0080);
  margin-bottom: 6px;
`

const LegendValues = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  color: #aaa;
  font-family: ${theme.sansFont};
`

const Tooltip = styled.div`
  position: absolute;
  left: ${props => props.left}px;
  top: ${props => props.top}px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  font-size: 12px;
  font-family: monospace;
  pointer-events: none;
  white-space: nowrap;
  z-index: 1000;
`

const TooltipTitle = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
  font-size: 13px;
`

const TooltipContent = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

const ColorDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 1px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
`

const LoadingText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #6b7280;
  font-size: 14px;
  font-family: ${theme.sansFont};
`

const DebugInfo = styled.div`
  font-size: 12px;
  color: #738694;
  background: white;
  padding: 12px 16px;
  border-radius: 4px;
  border: 1px solid #d8e1e8;
  margin-top: 8px;
  font-family: monospace;
  text-align: left;
  max-width: 500px;

  p {
    margin: 4px 0;
  }

  p:first-child {
    font-weight: 600;
    color: #5c7080;
    margin-bottom: 8px;
  }
`

// Error Boundary Component
class MapErrorBoundary extends React.Component {
  constructor (props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError (_error) {
    return { hasError: true }
  }

  componentDidCatch (error, errorInfo) {
    console.error('Map component error:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  render () {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorTitle>Map Component Error</ErrorTitle>
          <ErrorMessage>
            Something went wrong with the map component. Please try refreshing
            the page.
          </ErrorMessage>
          <RetryButton onClick={() => window.location.reload()}>
            Refresh Page
          </RetryButton>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details
              style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'left' }}
            >
              <summary style={{ cursor: 'pointer', marginBottom: '5px' }}>
                Error Details
              </summary>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '10px' }}>
                {this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </ErrorContainer>
      )
    }

    return this.props.children
  }
}

// Helper functions that read from window at runtime for easier testing, using:
// document.dispatchEvent(new CustomEvent('stats-range-changed'))
const getMapboxToken = () =>
  window.MAPBOX_ACCESS_TOKEN ||
  'pk.eyJ1IjoiY2JvdGhuZXIiLCJhIjoiY21nNTNlOWM2MDBnazJqcHI3NGtlNjJ5diJ9.NSLz94UIqonNQKbD030jow'
const getMapboxStyle = () =>
  window.MAPBOX_STYLE_STATS || 'mapbox://styles/mapbox/dark-v11'
const getMapboxDefaultColor = () => window.MAPBOX_DEFAULT_COLOR || Colors.DARK_GRAY3

// Generate color based on visitor count using logarithmic scale
// Cloudflare-style gradient: blue → purple → magenta → pink
const getColorFromValue = (value, minVal, maxVal) => {
  if (value === 0 || minVal === maxVal) return '#0072ff'

  // Logarithmic scale for better distribution across wide ranges
  const logMin = Math.log10(Math.max(1, minVal))
  const logMax = Math.log10(Math.max(1, maxVal))
  const logValue = Math.log10(Math.max(1, value))
  const normalizedValue = Math.max(
    0,
    Math.min(1, (logValue - logMin) / (logMax - logMin))
  )

  // Cloudflare-style color ramp
  const colorStops = [
    '#0072ff', // Blue (lowest)
    '#6a00ff', // Purple
    '#d400ff', // Magenta
    '#ff0080', // Pink (highest)
  ]

  // Interpolate through gradient
  const scaledPosition = normalizedValue * (colorStops.length - 1)
  const lowerIndex = Math.floor(scaledPosition)
  const upperIndex = Math.min(lowerIndex + 1, colorStops.length - 1)

  if (lowerIndex === upperIndex) {
    return colorStops[lowerIndex]
  }

  // Linear interpolation between two color stops
  const fraction = scaledPosition - lowerIndex
  const lower = colorStops[lowerIndex]
  const upper = colorStops[upperIndex]

  // Parse hex colors
  const r1 = parseInt(lower.slice(1, 3), 16)
  const g1 = parseInt(lower.slice(3, 5), 16)
  const b1 = parseInt(lower.slice(5, 7), 16)
  const r2 = parseInt(upper.slice(1, 3), 16)
  const g2 = parseInt(upper.slice(3, 5), 16)
  const b2 = parseInt(upper.slice(5, 7), 16)

  // Interpolate
  const r = Math.round(r1 + (r2 - r1) * fraction)
  const g = Math.round(g1 + (g2 - g1) * fraction)
  const b = Math.round(b1 + (b2 - b1) * fraction)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

type CountryData = {
  iso2: string,
  iso3: string,
  name: string,
  unique_visits: number,
  unique_users: number,
  events_count: number,
}

type Props = {
  countries: CountryData[],
  minVisits: number,
  maxVisits: number,
  intl: any,
}

/**
 * StatsMap component displays country-level visitor statistics on an interactive map
 * @param {CountryData[]} countries - Array of country statistics
 * @param {number} minVisits - Minimum visitor count across all countries
 * @param {number} maxVisits - Maximum visitor count across all countries
 * @param {Object} intl - react-intl internationalization object
 */
function StatsMap ({ countries, minVisits, maxVisits, intl }: Props) {
  // Safety check: ensure countries is always an array
  const countriesArray = countries || []
  const minVisitsValue = typeof minVisits === 'number' ? minVisits : 0
  const maxVisitsValue = typeof maxVisits === 'number' ? maxVisits : 0

  const [hoveredCountry, setHoveredCountry] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [tooltipPosition, setTooltipPosition] = useState({
    left: -1000,
    top: -1000,
  })
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [viewport, setViewport] = useState({
    latitude: 20,
    longitude: 0,
    zoom: 0.9,
  })
  const [mapboxToken] = useState(getMapboxToken())
  const [mapboxStyle] = useState(getMapboxStyle())
  const [countriesGeoJSON, setCountriesGeoJSON] = useState(null)
  const mapRef = useRef(null)
  const tooltipRef = useRef(null)

  // Fetch country GeoJSON data from public source
  useEffect(() => {
    // Use Natural Earth data from a reliable CDN
    const geojsonUrl = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson'

    fetch(geojsonUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        return response.json()
      })
      .then(data => {
        console.log('GeoJSON loaded successfully, features:', data.features.length)
        setCountriesGeoJSON(data)
      })
      .catch(error => {
        console.error('Failed to load countries GeoJSON:', error)
        setErrorMessage(`Failed to load map data: ${error.message}`)
        setMapError(true)
      })
  }, [])

  // Add timeout fallback to detect if map is stuck loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!mapLoaded && !mapError) {
        console.error('Map loading timeout - map failed to load within 10 seconds')
        setErrorMessage(
          'Map loading timed out. This may be due to network issues, ad blockers, or invalid Mapbox configuration.'
        )
        setMapError(true)
      }
    }, 20000)

    return () => clearTimeout(timeout)
  }, [mapLoaded, mapError, mapboxToken, mapboxStyle])

  // Handle empty data gracefully
  if (countriesArray.length === 0 || (minVisitsValue === 0 && maxVisitsValue === 0)) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f9fafb',
        }}
      >
        <NonIdealState
          title={intl.formatMessage({
            id: 'cases.stats.show.errorNoDataTitle',
          })}
          description={intl.formatMessage({
            id: 'cases.stats.show.errorNoDataDescription',
          })}
          visual="geosearch"
        />
      </div>
    )
  }

  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      const map = mapRef.current.getMap()
      if (!map) return

      const handleMove = () => {
        const center = map.getCenter()
        if (Math.abs(center.lat) > 10) {
          map.setCenter([center.lng, Math.max(-10, Math.min(10, center.lat))])
        }
      }
      map.on('move', handleMove)
      return () => {
        if (map) {
          map.off('move', handleMove)
        }
      }
    }
  }, [mapLoaded])

  // Position tooltip to follow mouse cursor, avoiding right edge overflow
  useEffect(() => {
    if (
      hoveredCountry &&
      mousePosition.x !== 0 &&
      mousePosition.y !== 0 &&
      tooltipRef.current &&
      mapRef.current
    ) {
      const tooltip = tooltipRef.current
      const mapInstance = mapRef.current.getMap()
      const mapContainer = mapInstance.getContainer()
      const mapRect = mapContainer.getBoundingClientRect()
      const tooltipRect = tooltip.getBoundingClientRect()

      const offset = 15
      const tooltipWidth = tooltipRect.width

      // Check if tooltip would overflow to the right
      const wouldOverflowRight =
        mousePosition.x + offset + tooltipWidth > mapRect.width

      const left = wouldOverflowRight
        ? mousePosition.x - offset - tooltipWidth // Position to the left
        : mousePosition.x + offset // Position to the right

      const newPosition = {
        left,
        top: mousePosition.y - offset,
      }
      setTooltipPosition(newPosition)
    }
  }, [hoveredCountry, mousePosition])

  // Update map layer colors when countries change
  useEffect(() => {
    if (mapRef.current && mapLoaded && countriesGeoJSON) {
      const map = mapRef.current.getMap()
      if (!map) return

      try {
        const layer = map.getLayer('country-fills')
        // Update the fill layer paint properties
        if (layer && fillColorExpression) {
          map.setPaintProperty(
            'country-fills',
            'fill-color',
            fillColorExpression
          )
        }
      } catch (error) {
        console.error('Error updating map colors:', error)
        // Don't set map error here as this might be a temporary issue
      }
    }
  }, [countriesArray, mapLoaded, fillColorExpression, countriesGeoJSON])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      setMapLoaded(false)
      setMapError(false)
    }
  }, [])

  // Create a map of country names to colors
  // Limit to prevent performance issues with large datasets
  const maxCountries = 200
  const limitedCountries = countriesArray.slice(0, maxCountries)

  if (countriesArray.length > maxCountries) {
    console.warn(
      `Limiting countries from ${countriesArray.length} to ${maxCountries} for performance`
    )
  }

  // Safety check: if too many countries, show error instead of freezing
  if (countriesArray.length > 1000) {
    console.error(
      `Too many countries (${countriesArray.length}), refusing to render for performance`
    )
    return (
      <ErrorContainer>
        <ErrorTitle>Too Much Data</ErrorTitle>
        <ErrorMessage>
          The selected date range contains too much data to display efficiently.
          Please choose a smaller date range.
        </ErrorMessage>
        <p style={{ color: Colors.GRAY5, fontSize: '12px' }}>
          Countries: {countriesArray.length}
        </p>
      </ErrorContainer>
    )
  }

  // Create a map of ISO2 codes to colors (Mapbox uses ISO 3166-1 alpha-2)
  const countryColors = React.useMemo(() => {
    const colors = {}
    limitedCountries.forEach(country => {
      if (country.iso2 && typeof country.unique_visits === 'number') {
        const color = getColorFromValue(
          country.unique_visits,
          minVisitsValue,
          maxVisitsValue
        )
        if (color) {
          colors[country.iso2] = color
        }
      }
    })
    return colors
  }, [limitedCountries, minVisitsValue, maxVisitsValue])

  // Create a map for hover lookups (ISO2 -> country data)
  const countryDataByIso2 = React.useMemo(() => {
    const map = {}
    limitedCountries.forEach(country => {
      if (country.iso2) {
        map[country.iso2] = country
      }
    })
    return map
  }, [limitedCountries])

  // Create mapbox expression for country fills using ISO2 codes
  // Natural Earth GeoJSON uses 'iso_a2' property (2-letter codes)
  const fillColorExpression = React.useMemo(() => {
    const expression = ['match', ['get', 'iso_a2']]
    const hasCountryData = Object.keys(countryColors).length > 0

    if (hasCountryData) {
      Object.entries(countryColors).forEach(([iso2, color]) => {
        expression.push(iso2, color)
      })
    }
    // Default color for countries with no data
    expression.push(getMapboxDefaultColor())
    return expression
  }, [countryColors])

  const fillLayer = React.useMemo(
    () => ({
      id: 'country-fills',
      type: 'fill',
      source: 'countries', // Use our GeoJSON source
      paint: {
        'fill-color': Colors.GRAY1, // Default color, will be updated by useEffect
        'fill-opacity': [
          'case',
          ['boolean', ['get', 'hover'], false],
          0.9,
          0.7,
        ],
      },
    }),
    [] // No dependencies - layer config is stable
  )

  const lineLayer = React.useMemo(
    () => ({
      id: 'country-borders',
      type: 'line',
      source: 'countries', // Use our GeoJSON source
      paint: {
        'line-color': Colors.BLACK,
        'line-width': 0.2,
      },
    }),
    []
  )

  const onHover = event => {
    const feature = event.features && event.features[0]
    if (feature) {
      // Natural Earth GeoJSON uses iso_a2 for ISO 2-letter codes
      const iso2 = feature.properties.iso_a2 || feature.properties.ISO_A2

      const countryData = countryDataByIso2[iso2]
      if (countryData) {
        setHoveredCountry(countryData)
        setMousePosition({ x: event.point[0], y: event.point[1] })
      } else {
        setHoveredCountry(null)
        setMousePosition({ x: 0, y: 0 })
      }
    } else {
      setHoveredCountry(null)
      setMousePosition({ x: 0, y: 0 })
    }
  }

  const retryMapLoad = () => {
    setMapError(false)
    setErrorMessage('')
    setMapLoaded(false)
    // Map will automatically re-initialize on next render
  }

  if (mapError) {
    return (
      <ErrorContainer>
        <ErrorTitle>Unable to load map</ErrorTitle>
        <ErrorMessage>
          {errorMessage ||
            'Please check your internet connection or disable ad blockers'}
        </ErrorMessage>
        <RetryButton onClick={retryMapLoad}>Retry Loading Map</RetryButton>
        <DebugInfo>
          <p>Debug info:</p>
          <p>
            Token: {mapboxToken ? `${mapboxToken.substring(0, 20)}...` : 'none'}
          </p>
          <p>Style: {mapboxStyle}</p>
          <p>Using Mapbox built-in country boundaries</p>
        </DebugInfo>
      </ErrorContainer>
    )
  }

  return (
    <MapContainer>
      <ReactMapGL
        ref={mapRef}
        mapStyle={mapboxStyle}
        width="100%"
        height="100%"
        latitude={viewport.latitude}
        longitude={viewport.longitude}
        zoom={viewport.zoom}
        maxBounds={[
          [-180, -10], // limit north/south movement
          [180, 10],
        ]}
        maxZoom={5}
        scrollZoom={false}
        touchZoom={false}
        doubleClickZoom={false}
        dragPan={false}
        dragRotate={false}
        touchRotate={false}
        mapboxApiAccessToken={mapboxToken}
        interactiveLayerIds={mapLoaded ? ['country-fills'] : []}
        onViewportChange={setViewport}
        onLoad={() => {
          setMapLoaded(true)
          setMapError(false)

          // Hide all labels and text from the base map
          if (mapRef.current) {
            const map = mapRef.current.getMap()
            const style = map.getStyle()
            const layers = style.layers || []

            // Hide all symbol layers (which contain all text and labels)
            layers.forEach(layer => {
              // Symbol layers contain all text/labels including continents, countries, cities, etc.
              if (layer.type === 'symbol') {
                map.setLayoutProperty(layer.id, 'visibility', 'none')
              }
            })

            // Make Mapbox logo darker/less visible
            const mapContainer = map.getContainer()
            const mapboxLogo = mapContainer.querySelector('.mapboxgl-ctrl-logo')
            if (mapboxLogo) {
              mapboxLogo.style.opacity = '0.2'
              mapboxLogo.style.filter = 'brightness(0.3)'
            }
          }
        }}
        onHover={mapLoaded ? onHover : undefined}
        onError={error => {
          console.error('Map loading error:', error)
          let errorMessage = 'Unknown error'
          if (error.error) {
            errorMessage = String(error.error)
          } else if (error.message) {
            errorMessage = String(error.message)
          } else if (typeof error === 'string') {
            errorMessage = error
          } else {
            errorMessage = String(error)
          }

          // Handle specific Mapbox source/layer errors
          if (
            typeof errorMessage === 'string' &&
            errorMessage.includes('Source') &&
            errorMessage.includes('cannot be removed')
          ) {
            errorMessage = 'Map data update conflict. Please refresh the page.'
          }

          setErrorMessage(
            `Mapbox error: ${errorMessage}. Check your Mapbox token and internet connection.`
          )
          setMapError(true)
        }}
      >
        {mapLoaded && countriesGeoJSON && (
          <Source
            id="countries"
            type="geojson"
            data={countriesGeoJSON}
          >
            <Layer key="country-fills" {...fillLayer} />
            <Layer key="country-borders" {...lineLayer} />
          </Source>
        )}

        {!mapLoaded && <LoadingText>Loading map...</LoadingText>}
      </ReactMapGL>

      {/* Legend - Visitor Distribution (Cloudflare style) */}
      {minVisitsValue !== undefined && maxVisitsValue !== undefined && (
        <Legend>
          <LegendTitle>
            <FormattedMessage id="cases.stats.show.mapLegendTitle" />
          </LegendTitle>
          <GradientBar />
          <LegendValues>
            <span>{minVisitsValue.toLocaleString()}</span>
            <span>{maxVisitsValue.toLocaleString()}</span>
          </LegendValues>
        </Legend>
      )}

      {/* Hover tooltip */}
      {hoveredCountry && (
        <Tooltip
          ref={tooltipRef}
          left={tooltipPosition.left}
          top={tooltipPosition.top}
        >
          <TooltipTitle>{hoveredCountry.name}</TooltipTitle>
          <TooltipContent>
            <ColorDot
              color={getColorFromValue(
                hoveredCountry.unique_visits,
                minVisitsValue,
                maxVisitsValue
              )}
            />
            <div>
              <div style={{ fontWeight: '500' }}>
                {hoveredCountry.unique_visits.toLocaleString()}{' '}
                {intl.formatMessage({
                  id: 'cases.stats.show.mapTooltipVisitors',
                })}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>
                {hoveredCountry.unique_users.toLocaleString()}{' '}
                {intl.formatMessage({ id: 'cases.stats.show.mapTooltipUsers' })}{' '}
                •{' '}
                {hoveredCountry.events_count.toLocaleString()}{' '}
                {intl.formatMessage({
                  id: 'cases.stats.show.mapTooltipEvents',
                })}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </MapContainer>
  )
}

// Memoize the component to prevent unnecessary re-renders
const MemoizedStatsMap = React.memo(StatsMap)

// Wrap with injectIntl and ErrorBoundary
const StatsMapWithIntl = injectIntl(MemoizedStatsMap)

// Wrap with ErrorBoundary and export
export default function StatsMapWithErrorBoundary (props) {
  return (
    <MapErrorBoundary>
      <StatsMapWithIntl {...props} />
    </MapErrorBoundary>
  )
}
