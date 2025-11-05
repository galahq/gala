/* @flow */
import React, { useState, useEffect, useRef } from 'react'
import ReactMapGL, { Source, Layer } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
  Colors,
  Popover,
  Position,
  Icon,
  NonIdealState,
} from '@blueprintjs/core'
import { FormattedMessage, injectIntl } from 'react-intl'

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
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f9fafb',
            flexDirection: 'column',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              color: '#ef4444',
              marginBottom: '10px',
              fontWeight: 'bold',
            }}
          >
            Map Component Error
          </p>
          <p
            style={{ color: '#6b7280', fontSize: '14px', marginBottom: '15px' }}
          >
            Something went wrong with the map component. Please try refreshing
            the page.
          </p>
          <button
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '15px',
            }}
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
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
        </div>
      )
    }

    return this.props.children
  }
}

// Helper functions that read from window at runtime for easier testing, using:
// document.dispatchEvent(new CustomEvent('stats-range-changed'))
const getMapboxData = () => window.MAPBOX_DATA || '/countries.geojson'
const getMapboxToken = () =>
  window.MAPBOX_ACCESS_TOKEN ||
  'pk.eyJ1IjoiY2JvdGhuZXIiLCJhIjoiY21nNTNlOWM2MDBnazJqcHI3NGtlNjJ5diJ9.NSLz94UIqonNQKbD030jow'
const getMapboxStyle = () =>
  window.MAPBOX_STYLE_STATS || 'mapbox://styles/mapbox/dark-v10'
const getMapboxDefaultColor = () => window.MAPBOX_DEFAULT_COLOR || Colors.BLACK

// Generate colors for bins using BlueprintJS indigo shades
const getBinColors = binCount => {
  if (binCount === 0) return []
  if (binCount === 1) return [Colors.INDIGO5]

  // BlueprintJS has INDIGO1 (lightest) through INDIGO5 (darkest)
  // For more than 5 bins, we'll cycle through available shades
  const indigoShades = [
    Colors.INDIGO1,
    Colors.INDIGO2,
    Colors.INDIGO3,
    Colors.INDIGO4,
    Colors.INDIGO5,
  ]

  const colors = []
  for (let i = 0; i < binCount; i++) {
    // Map bin index to indigo shade, cycling if needed
    const shadeIndex = Math.min(i, indigoShades.length - 1)
    colors.push(indigoShades[shadeIndex])
  }
  return colors
}

window.updateMapboxSettings = settings => {
  if (!settings) {
    console.info(
      '%cMapbox Settings Helper',
      'color: #7c3aed; font-weight: bold; font-size: 14px'
    )
    console.info(
      'Usage: window.updateMapboxSettings({ style, data, token, defaultColor })'
    )
    console.info('\nAvailable options:')
    console.table({
      style: 'Mapbox style URL (e.g., "mapbox://styles/mapbox/light-v10")',
      data: 'GeoJSON data URL for country boundaries',
      token: 'Mapbox access token',
      defaultColor: 'Hex color for countries with no data',
    })
    console.info('\nExamples:')
    console.info(
      '  window.updateMapboxSettings({ style: "mapbox://styles/mapbox/light-v10" })'
    )
    console.info(
      '  window.updateMapboxSettings({ data: "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson" })'
    )
    return
  }

  const updates = []
  if (settings.style) {
    window.MAPBOX_STYLE_STATS = settings.style
    updates.push(`style -> ${settings.style}`)
  }
  if (settings.data) {
    window.MAPBOX_DATA = settings.data
    updates.push(`data -> ${settings.data}`)
  }
  if (settings.token) {
    window.MAPBOX_ACCESS_TOKEN = settings.token
    updates.push(`token -> ${settings.token.substring(0, 20)}...`)
  }
  if (settings.defaultColor) {
    window.MAPBOX_DEFAULT_COLOR = settings.defaultColor
    updates.push(`defaultColor -> ${settings.defaultColor}`)
  }

  if (updates.length === 0) {
    console.warn(
      'No valid settings provided. Use window.updateMapboxSettings() to see options.'
    )
    return
  }

  console.log('%cMapbox Settings Updated', 'color: #7c3aed; font-weight: bold')
  updates.forEach(update => console.log(`  - ${update}`))
  console.log('%cTriggering map refresh...', 'color: #10b981')

  document.dispatchEvent(new CustomEvent('stats-range-changed'))
}

// Helper to show stats settings (bin_count is now hard-coded to 5)
window.updateStatsSettings = settings => {
  console.info(
    '%cStats Settings',
    'color: #7c3aed; font-weight: bold; font-size: 14px'
  )
  console.info(
    'Bin count is now hard-coded to 5 for performance and simplicity.'
  )
  console.info('No settings can be changed at runtime.')
}

// Initialization happens with self-hosted GeoJSON and Mapbox config

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
 * @param {CountryData[]} countries - Array of country statistics
 * @param {Bin[]} bins - Color bins for visitor distribution
 * @param {Object} intl - react-intl internationalization object
 */
function StatsMap ({ countries, bins, intl }: Props) {
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
  const [mapboxDataUrl] = useState(getMapboxData())
  const [mapboxData, setMapboxData] = useState(null)
  const [mapboxToken] = useState(getMapboxToken())
  const [mapboxStyle] = useState(getMapboxStyle())
  const mapRef = useRef(null)
  const tooltipRef = useRef(null)

  // Fetch geojson data once with caching
  useEffect(() => {
    const cacheKey = `mapbox-geojson-${mapboxDataUrl}`
    const cachedData = localStorage.getItem(cacheKey)
    const cacheExpiry = localStorage.getItem(`${cacheKey}-expiry`)
    const isExpired = cacheExpiry && Date.now() > parseInt(cacheExpiry)

    // Use cached data if available and not expired (24 hours)
    if (cachedData && !isExpired) {
      try {
        const parsedData = JSON.parse(cachedData)
        setMapboxData(parsedData)
        return
      } catch (error) {
        console.warn('Failed to parse cached GeoJSON data:', error)
        localStorage.removeItem(cacheKey)
        localStorage.removeItem(`${cacheKey}-expiry`)
      }
    }

    fetch(mapboxDataUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return response.json()
      })
      .then(data => {
        setMapboxData(data)
        // Cache the data for 24 hours
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data))
          localStorage.setItem(
            `${cacheKey}-expiry`,
            (Date.now() + 24 * 60 * 60 * 1000).toString()
          )
        } catch (error) {
          console.warn('Failed to cache GeoJSON data:', error)
        }
      })
      .catch(error => {
        console.error('Failed to fetch geojson data:', error)
        setErrorMessage(`Failed to load map data: ${error.message}`)
        setMapError(true)
      })
  }, [mapboxDataUrl])

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
  }, [mapLoaded, mapError, mapboxToken, mapboxStyle, mapboxDataUrl])

  // Generate colors based on bin count using indigo shades
  const binColors = getBinColors(bins.length)

  // Use white text for indigo colors on dark background
  const binTextColors =
    bins.length > 0 ? new Array(bins.length).fill(Colors.WHITE) : []

  // Handle empty bins gracefully
  if (bins.length === 0) {
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

  // Update map layer colors when countries or bins change
  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      const map = mapRef.current.getMap()
      if (!map) return

      try {
        // Update the fill layer paint properties
        if (map.getLayer('country-fills') && fillColorExpression) {
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
  }, [countries, bins, mapLoaded, fillColorExpression, countryColors])

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
  const limitedCountries = countries.slice(0, maxCountries)

  if (countries.length > maxCountries) {
    console.warn(
      `Limiting countries from ${countries.length} to ${maxCountries} for performance`
    )
  }

  // Safety check: if too many countries, show error instead of freezing
  if (countries.length > 1000) {
    console.error(
      `Too many countries (${countries.length}), refusing to render for performance`
    )
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f9fafb',
          flexDirection: 'column',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <p
          style={{ color: '#ef4444', marginBottom: '10px', fontWeight: 'bold' }}
        >
          Too Much Data
        </p>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '15px' }}>
          The selected date range contains too much data to display efficiently.
          Please choose a smaller date range.
        </p>
        <p style={{ color: '#9ca3af', fontSize: '12px' }}>
          Countries: {countries.length}
        </p>
      </div>
    )
  }

  const countryColors = React.useMemo(() => {
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

  // Create mapbox expression for country fills using 'name' property
  const fillColorExpression = React.useMemo(() => {
    const expression = ['match', ['get', 'name']]
    const hasCountryData = Object.keys(countryColors).length > 0

    if (hasCountryData && binColors.length > 0) {
      Object.entries(countryColors).forEach(([name, color]) => {
        expression.push(name, color)
      })
    }
    // Default color for countries with no data (call the function to get the color string)
    expression.push(getMapboxDefaultColor())
    return expression
  }, [countryColors, binColors])

  const fillLayer = React.useMemo(
    () => ({
      id: 'country-fills',
      type: 'fill',
      source: 'countries',
      paint: {
        'fill-color': '#cccccc', // Default color, will be updated by useEffect
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
      source: 'countries',
      paint: {
        'line-color': Colors.WHITE,
        'line-width': 0.2,
      },
    }),
    []
  )

  const onHover = event => {
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
  }

  const retryMapLoad = () => {
    setMapError(false)
    setErrorMessage('')
    setMapLoaded(false)
    // Clear cache and force re-fetch of data
    const cacheKey = `mapbox-geojson-${mapboxDataUrl}`
    localStorage.removeItem(cacheKey)
    localStorage.removeItem(`${cacheKey}-expiry`)

    fetch(mapboxDataUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return response.json()
      })
      .then(data => {
        setMapboxData(data)
        // Re-cache the data
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data))
          localStorage.setItem(
            `${cacheKey}-expiry`,
            (Date.now() + 24 * 60 * 60 * 1000).toString()
          )
        } catch (error) {
          console.warn('Failed to re-cache GeoJSON data:', error)
        }
      })
      .catch(error => {
        console.error('Failed to fetch geojson data:', error)
        setErrorMessage(`Failed to load map data: ${error.message}`)
        setMapError(true)
      })
  }

  if (mapError) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f9fafb',
          flexDirection: 'column',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <p
          style={{ color: '#ef4444', marginBottom: '10px', fontWeight: 'bold' }}
        >
          Unable to load map
        </p>
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '15px' }}>
          {errorMessage ||
            'Please check your internet connection or disable ad blockers'}
        </p>
        <button
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '15px',
          }}
          onClick={retryMapLoad}
        >
          Retry Loading Map
        </button>
        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
          <p>Debug info:</p>
          <p>
            Token: {mapboxToken ? `${mapboxToken.substring(0, 20)}...` : 'none'}
          </p>
          <p>Style: {mapboxStyle}</p>
          <p>Data: {mapboxDataUrl}</p>
        </div>
      </div>
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

          // Hide place name layers and customize Mapbox branding
          if (mapRef.current) {
            const map = mapRef.current.getMap()
            const style = map.getStyle()
            const layers = style.layers || []

            // Hide layers that contain place names but keep country fills working
            layers.forEach(layer => {
              const layerId = layer.id.toLowerCase()
              // Hide text/symbol layers for places and water bodies, but keep fill layers
              if (
                (layerId.includes('place') ||
                  layerId.includes('poi') ||
                  layerId.includes('country-label') ||
                  layerId.includes('state-label') ||
                  layerId.includes('city') ||
                  layerId.includes('town') ||
                  layerId.includes('village') ||
                  layerId.includes('settlement') ||
                  layerId.includes('marine') ||
                  layerId.includes('water') ||
                  layerId.includes('ocean') ||
                  layerId.includes('sea') ||
                  layerId.includes('bay') ||
                  layerId.includes('gulf') ||
                  layerId.includes('lake') ||
                  layerId.includes('river')) &&
                (layer.type === 'symbol' || layerId.includes('label'))
              ) {
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
            errorMessage = error.error
          } else if (error.message) {
            errorMessage = error.message
          } else if (typeof error === 'string') {
            errorMessage = error
          }

          // Handle specific Mapbox source/layer errors
          if (
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

      {/* Legend - Visitor Distribution */}
      {bins && bins.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            background: 'rgba(42, 42, 42, 1.0)',
            padding: '12px',
            borderRadius: '0 6px 0 0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            zIndex: 1,
            minWidth: '200px',
          }}
        >
          <div
            style={{
              fontWeight: 'bold',
              marginBottom: '8px',
              fontSize: '12px',
              color: Colors.WHITE,
              fontFamily: 'monospace',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FormattedMessage id="cases.stats.show.mapLegendTitle" />
            <Popover
              position={Position.TOP}
              content={
                <div style={{ padding: '12px', maxWidth: '300px' }}>
                  <h6 style={{ marginTop: 0, marginBottom: '8px' }}>
                    <FormattedMessage id="cases.stats.show.mapLegendHelpTitle" />
                  </h6>
                  <p style={{ fontSize: '12px' }}>
                    <FormattedMessage id="cases.stats.show.mapLegendHelpDescription" />
                  </p>
                </div>
              }
            >
              <Icon
                icon="info-sign"
                style={{
                  cursor: 'pointer',
                  opacity: 0.8,
                  fontSize: '10px',
                }}
              />
            </Popover>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            {bins.map((b, i) => {
              // Calculate border-radius for each bar to fill the rounded container
              let borderRadius = '0'
              if (bins.length === 1) {
                borderRadius = '4px'
              } else if (i === 0) {
                borderRadius = '4px 0 0 4px'
              } else if (i === bins.length - 1) {
                borderRadius = '0 4px 4px 0'
              }

              return (
                <div key={i} style={{ position: 'relative', flex: 1 }}>
                  <div
                    style={{
                      height: '24px',
                      background: binColors[i],
                      border: 'none',
                      borderRadius,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title={`${b.label} visitors`}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: binTextColors[i],
                        lineHeight: '1',
                        fontFamily: 'monospace',
                      }}
                    >
                      {b.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              marginTop: '6px',
              color: '#ffffff',
              fontFamily: 'monospace',
            }}
          >
          <span style={{ fontWeight: 'bold' }}>
            <FormattedMessage id="cases.stats.show.mapLegendLow" />
          </span>
          <span style={{ fontWeight: 'bold' }}>
            <FormattedMessage id="cases.stats.show.mapLegendHigh" />
          </span>
          </div>
      </div>
      )}

      {/* Hover tooltip */}
      {hoveredCountry && (
        <div
          ref={tooltipRef}
          style={{
            position: 'absolute',
            left: tooltipPosition.left,
            top: tooltipPosition.top,
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            fontSize: '12px',
            fontFamily: 'monospace',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              fontWeight: 'bold',
              marginBottom: '4px',
              fontSize: '13px',
            }}
          >
            {hoveredCountry.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor:
                  binColors.length > 0
                    ? binColors[Math.min(hoveredCountry.bin || 0, binColors.length - 1)] || binColors[0]
                    : '#f9fafb',
                border: '1px solid rgba(255,255,255,0.3)',
                flexShrink: 0,
              }}
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
          </div>
        </div>
      )}
    </div>
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
