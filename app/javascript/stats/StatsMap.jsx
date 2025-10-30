/* @flow */
import React, { useState, useEffect, useRef } from 'react'
import ReactMapGL, { Source, Layer } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getAccessibleTextColor } from '../utility/colors'

// Helper functions that read from window at runtime for easier testing, using:
// document.dispatchEvent(new CustomEvent('stats-range-changed'))
const getMapboxData = () => window.MAPBOX_DATA || 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json'
const getMapboxToken = () => window.MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiY2JvdGhuZXIiLCJhIjoiY21nNTNlOWM2MDBnazJqcHI3NGtlNjJ5diJ9.NSLz94UIqonNQKbD030jow'
const getMapboxStyle = () => window.MAPBOX_STYLE_STATS || 'mapbox://styles/mapbox/dark-v10'
const getMapboxDefaultColor = () => window.MAPBOX_DEFAULT_COLOR || '#2a2a2a'
const getMapboxBaseColor = () => window.MAPBOX_BASE_COLOR || '#7c3aed'

// Generate colors for bins based on base color and bin count
const generateBinColors = (binCount, baseColor) => {
  if (binCount === 0) return []
  const rgb = hexToRgb(baseColor || '#7c3aed')
  const colors = []
  for (let i = 0; i < binCount; i++) {
    // Prevent division by zero for single bin
    const alpha = binCount === 1 ? 1.0 : 0.2 + (i / (binCount - 1)) * 0.8
    colors.push(`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha.toFixed(2)})`)
  }
  return colors
}

// Convert hex color to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 124, g: 58, b: 237 } // Default purple
}

// Convert RGB to hex color
const rgbToHex = (r, g, b) => {
  const toHex = (n) => {
    const hex = Math.round(n).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

window.updateMapboxSettings = (settings) => {
  if (!settings) {
    console.info('%cMapbox Settings Helper', 'color: #7c3aed; font-weight: bold; font-size: 14px')
    console.info('Usage: window.updateMapboxSettings({ style, data, token, defaultColor, baseColor })')
    console.info('\nAvailable options:')
    console.table({
      style: 'Mapbox style URL (e.g., "mapbox://styles/mapbox/light-v10")',
      data: 'GeoJSON data URL for country boundaries',
      token: 'Mapbox access token',
      defaultColor: 'Hex color for countries with no data',
      baseColor: 'Base hex color for visitor distribution gradient (e.g., "#7c3aed")',
    })
    console.info('\nExamples:')
    console.info('  window.updateMapboxSettings({ style: "mapbox://styles/mapbox/light-v10" })')
    console.info('  window.updateMapboxSettings({ data: "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson" })')
    console.info('  window.updateMapboxSettings({ baseColor: "#ef4444" })')
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
  if (settings.baseColor) {
    window.MAPBOX_BASE_COLOR = settings.baseColor
    updates.push(`baseColor -> ${settings.baseColor}`)
  }

  if (updates.length === 0) {
    console.warn('No valid settings provided. Use window.updateMapboxSettings() to see options.')
    return
  }

  console.log('%cMapbox Settings Updated', 'color: #7c3aed; font-weight: bold')
  updates.forEach(update => console.log(`  - ${update}`))
  console.log('%cTriggering map refresh...', 'color: #10b981')

  document.dispatchEvent(new CustomEvent('stats-range-changed'))
}

// Helper to update stats settings
window.updateStatsSettings = (settings) => {
  if (!settings) {
    console.info('%cStats Settings Helper', 'color: #7c3aed; font-weight: bold; font-size: 14px')
    console.info('Usage: window.updateStatsSettings({ binCount })')
    console.info('\nAvailable options:')
    console.table({
      binCount: 'Number of color bins/buckets for visitor distribution (2-10, default: 5)',
    })
    console.info('\nExample:')
    console.info('  window.updateStatsSettings({ binCount: 7 })')
    return
  }

  const updates = []
  if (settings.binCount !== undefined) {
    const clamped = Math.max(2, Math.min(10, settings.binCount))
    window.STATS_BIN_COUNT = clamped
    updates.push(`binCount -> ${clamped}`)
  }

  if (updates.length === 0) {
    console.warn('No valid settings provided. Use window.updateStatsSettings() to see options.')
    return
  }

  console.log('%cStats Settings Updated', 'color: #7c3aed; font-weight: bold')
  updates.forEach(update => console.log(`  - ${update}`))
  console.log('%cTriggering data refresh...', 'color: #10b981')

  document.dispatchEvent(new CustomEvent('stats-range-changed'))
}

// Log initialization info
console.log('StatsMap initializing with:', {
  token: getMapboxToken() ? `${getMapboxToken().substring(0, 20)}...` : 'none',
  style: getMapboxStyle(),
  data: getMapboxData(),
  baseColor: getMapboxBaseColor(),
  binCount: window.STATS_BIN_COUNT || 5,
})

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
  percentile: number,
  value: number,
}

type Props = {
  countries: CountryData[],
  bins: Bin[],
}

export default function StatsMap ({ countries, bins }: Props) {
  const [hoveredCountry, setHoveredCountry] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [tooltipPosition, setTooltipPosition] = useState({
    left: -1000,
    top: -1000,
  })
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [viewport, setViewport] = useState({
    latitude: 20,
    longitude: 0,
    zoom: 0.9,
  })
  const [mapboxData] = useState(getMapboxData())
  const [mapboxToken] = useState(getMapboxToken())
  const [mapboxStyle] = useState(getMapboxStyle())
  const [baseColor] = useState(getMapboxBaseColor())
  const mapRef = useRef(null)
  const tooltipRef = useRef(null)

  // Add timeout fallback to detect if map is stuck loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!mapLoaded && !mapError) {
        console.error('Map loading timeout - map failed to load within 10 seconds')
        console.log('Debug info:', {
          token: mapboxToken ? `${mapboxToken.substring(0, 20)}...` : 'none',
          style: mapboxStyle,
          data: mapboxData,
        })
        setMapError(true)
      }
    }, 10000)

    return () => clearTimeout(timeout)
  }, [mapLoaded, mapError, mapboxToken, mapboxStyle, mapboxData])

  // Generate colors based on bin count and base color
  const binColors = generateBinColors(bins.length, baseColor)

  // Calculate text colors for each bin based on background brightness
  const rgb = hexToRgb(baseColor || '#7c3aed')
  const binTextColors = bins.length > 0 ? binColors.map((_, i) => {
    // Prevent division by zero for single bin
    const alpha = bins.length === 1 ? 1.0 : 0.2 + (i / (bins.length - 1)) * 0.8
    // For accessibility calculation, we simulate the color as if it were on a dark background
    // Since our legend background is dark (#2a2a2a), we blend the color
    const bgRgb = { r: 42, g: 42, b: 42 }
    const blendedR = rgb.r * alpha + bgRgb.r * (1 - alpha)
    const blendedG = rgb.g * alpha + bgRgb.g * (1 - alpha)
    const blendedB = rgb.b * alpha + bgRgb.b * (1 - alpha)
    const blendedHex = rgbToHex(blendedR, blendedG, blendedB)
    return getAccessibleTextColor(blendedHex)
  }) : []

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
      console.log('Setting tooltip position:', newPosition)
      setTooltipPosition(newPosition)
    }
  }, [hoveredCountry, mousePosition])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      try {
        if (mapRef.current) {
          const map = mapRef.current.getMap()
          if (map && map.remove) {
            map.remove()
          }
        }
      } catch (error) {
        console.warn('Error cleaning up map:', error)
      }
      setMapLoaded(false)
      setMapError(false)
    }
  }, [])

  // Create a map of country names to colors
  const countryColors = {}
  countries.forEach(country => {
    if (country.name && typeof country.bin === 'number') {
      countryColors[country.name] = binColors[country.bin] || binColors[0]
    }
  })
  // Create mapbox expression for country fills
  const fillColorExpression = ['match', ['get', 'name']]
  const hasCountryData = Object.keys(countryColors).length > 0

  if (hasCountryData) {
    Object.entries(countryColors).forEach(([name, color]) => {
      fillColorExpression.push(name, color)
    })
  }
  // Default color for countries with no data (call the function to get the color string)
  fillColorExpression.push(getMapboxDefaultColor())

  const fillLayer = {
    id: 'country-fills',
    type: 'fill',
    source: 'countries',
    paint: {
      'fill-color': fillColorExpression,
      'fill-opacity': ['case', ['boolean', ['get', 'hover'], false], 0.9, 0.7],
    },
  }
  const lineLayer = {
    id: 'country-borders',
    type: 'line',
    source: 'countries',
    paint: {
      'line-color': '#94a3b8',
      'line-width': 0.5,
    },
  }

  const onHover = event => {
    const feature = event.features && event.features[0]
    if (feature) {
      const countryName = feature.properties.name
      const countryData = countries.find(c => c.name === countryName)
      setHoveredCountry(countryData)
      setMousePosition({ x: event.point[0], y: event.point[1] })
    } else {
      setHoveredCountry(null)
      setMousePosition({ x: 0, y: 0 })
    }
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
        }}
      >
        <p style={{ color: '#ef4444', marginBottom: '10px' }}>
          Unable to load map
        </p>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Please check your internet connection or disable ad blockers
        </p>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', cursor: 'default' }}>
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
          console.log('Map loaded successfully')
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
        onError={error => {
          console.error('Map loading error:', error)
          setMapError(true)
        }}
        onSourceData={event => {
          console.log('Source data event:', event)
          if (event.sourceId === 'countries') {
            console.log('Countries source loaded:', event.isSourceLoaded)
          }
        }}
        onHover={mapLoaded ? onHover : undefined}
      >
        {mapLoaded && (
          <Source
            id="countries"
            type="geojson"
            data={mapboxData}
          >
            <Layer {...fillLayer} />
            <Layer {...lineLayer} />
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
              color: '#ffffff',
              fontFamily: 'monospace',
            }}
          >
            Visitor Distribution
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            {bins.map((b, i) => (
              <div key={i} style={{ position: 'relative', flex: 1 }}>
                <div
                  style={{
                    height: '24px',
                    background: binColors[i],
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={`${b.percentile}th percentile: ${b.value} visitors`}
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
                    {b.percentile}%
                  </span>
                </div>
              </div>
            ))}
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
            <span style={{ fontWeight: 'bold' }}>low</span>
            <span style={{ fontWeight: 'bold' }}>high</span>
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
            {hoveredCountry.iso3}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor:
                  binColors[hoveredCountry.bin] || binColors[0] || '#f9fafb',
                border: '1px solid rgba(255,255,255,0.3)',
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ fontWeight: '500' }}>
                {hoveredCountry.unique_visits.toLocaleString()} visitors
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>
                {hoveredCountry.unique_users.toLocaleString()} users •{' '}
                {hoveredCountry.events_count.toLocaleString()} events
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
