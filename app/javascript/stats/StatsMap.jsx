/* @flow */
import React, { useState, useEffect, useRef } from 'react'
import ReactMapGL, { Source, Layer } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Import mapbox credentials - try window first, then use fallback
const getMapboxToken = () => {
  // If there's a token in the window that's not the gala-developer one, use it
  if (window.MAPBOX_ACCESS_TOKEN) {
    return window.MAPBOX_ACCESS_TOKEN
  }
  console.error('No MAPBOX_ACCESS_TOKEN found')
  return null
}

const MAPBOX_TOKEN = getMapboxToken()
const MAPBOX_STYLE = 'mapbox://styles/mapbox/dark-v10'

type CountryData = {
  iso2: string,
  iso3: string,
  name: string,
  unique_visits: number,
  unique_users: number,
  events_count: number,
  percentile: number,
}

type Percentile = {
  percentile: number,
  value: number,
  color: string,
}

type Props = {
  countries: CountryData[],
  percentiles: Percentile[],
}

export default function StatsMap ({ countries, percentiles }: Props) {
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
  const mapRef = useRef(null)
  const tooltipRef = useRef(null)

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

  // Calculate zoom level to fit bbox in viewport
  const calculateZoomForBbox = bbox => {
    const [minLng, minLat, maxLng, maxLat] = bbox

    // Calculate the zoom level that will fit the bbox
    const lngDiff = maxLng - minLng
    const latDiff = maxLat - minLat

    // Use a padding factor to ensure the country isn't right at the edge
    const padding = 0.1

    const lngZoom = Math.log2(360 / (lngDiff * (1 + padding)))
    const latZoom = Math.log2(180 / (latDiff * (1 + padding)))

    // Use the smaller zoom level to ensure the entire country fits
    const calculatedZoom = Math.min(lngZoom, latZoom)

    // Clamp to reasonable bounds (don't zoom in too much, don't zoom out too much)
    return Math.max(0, Math.min(5, calculatedZoom - 2)) // Subtract 2 for more padding/less zoom
  }

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

  // Expose the country selection function globally
  useEffect(() => {
    window.mapFlyToCountry = handleCountrySelect
    return () => {
      delete window.mapFlyToCountry
    }
  }, [countries])

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
    const percentile = percentiles.find(
      p => Number(p.percentile) === Number(country.percentile)
    )
    if (percentile && country.name) {
      countryColors[country.name] = percentile.color
    }
  })

  console.log('Country colors mapping:', countryColors)
  console.log('Countries data:', countries)
  console.log('Percentiles data:', percentiles)

  // Create mapbox expression for country fills
  const fillColorExpression = ['match', ['get', 'name']]

  Object.entries(countryColors).forEach(([name, color]) => {
    fillColorExpression.push(name, color)
  })

  // Default color for countries with no data
  fillColorExpression.push('#2a2a2a')

  console.log('Fill color expression:', fillColorExpression)

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
      console.log('Hovered feature properties:', feature.properties)
      const countryName = feature.properties.name
      console.log('Looking for country name:', countryName)
      const countryData = countries.find(c => c.name === countryName)
      console.log('Found country data:', countryData)
      setHoveredCountry(countryData)
      setMousePosition({ x: event.point[0], y: event.point[1] })
    } else {
      setHoveredCountry(null)
      setMousePosition({ x: 0, y: 0 })
    }
  }

  const handleCountrySelect = (countryName: string) => {
    if (!mapRef.current) return

    console.log('Flying to country:', countryName)

    // Get the map instance
    const map = mapRef.current.getMap()

    // Query for the country's feature to get its bounding box
    const features = map.querySourceFeatures('countries', {
      filter: ['==', 'name', countryName],
    })

    console.log('Found features:', features)

    if (features && features.length > 0) {
      const feature = features[0]
      console.log('Using feature:', feature.properties)
      console.log('Feature geometry:', feature.geometry)
      console.log('Feature bbox:', feature.bbox)

      let centerLng, centerLat

      let calculatedZoom = 4 // default zoom

      if (feature.bbox) {
        let bboxToUse = feature.bbox

        // For MultiPolygon countries like USA, use bbox of largest polygon instead of overall bbox
        if (
          feature.geometry &&
          feature.geometry.type === 'MultiPolygon' &&
          feature.geometry.coordinates.length > 1
        ) {
          console.log('MultiPolygon detected, finding largest polygon bbox')
          let largestBbox = null
          let maxArea = 0

          feature.geometry.coordinates.forEach(polygonCoords => {
            const exteriorRing = polygonCoords[0]
            // Calculate approximate area using shoelace formula
            let area = 0
            for (let i = 0; i < exteriorRing.length - 1; i++) {
              area +=
                exteriorRing[i][0] * exteriorRing[i + 1][1] -
                exteriorRing[i + 1][0] * exteriorRing[i][1]
            }
            area = Math.abs(area) / 2

            // Calculate bbox for this polygon
            let minLng = Infinity
            let minLat = Infinity
            let maxLng = -Infinity
            let maxLat = -Infinity
            exteriorRing.forEach(coord => {
              minLng = Math.min(minLng, coord[0])
              minLat = Math.min(minLat, coord[1])
              maxLng = Math.max(maxLng, coord[0])
              maxLat = Math.max(maxLat, coord[1])
            })

            if (area > maxArea) {
              maxArea = area
              largestBbox = [minLng, minLat, maxLng, maxLat]
            }
          })

          if (largestBbox) {
            bboxToUse = largestBbox
            console.log('Using largest polygon bbox:', largestBbox)
          }
        }

        // Use bounding box center
        const [minLng, minLat, maxLng, maxLat] = bboxToUse
        centerLng = (minLng + maxLng) / 2
        centerLat = (minLat + maxLat) / 2
        console.log('Calculated center from bbox:', centerLng, centerLat)

        // Calculate appropriate zoom to fit the country
        calculatedZoom = calculateZoomForBbox(bboxToUse)
        console.log('Calculated zoom for bbox:', calculatedZoom)
      } else if (feature.geometry && feature.geometry.coordinates) {
        // Try to calculate center from geometry
        console.log('No bbox, trying geometry center')
        try {
          if (feature.geometry.type === 'Polygon') {
            // Calculate centroid of polygon
            const coords = feature.geometry.coordinates[0] // exterior ring
            let totalLng = 0
            let totalLat = 0
            let count = 0
            coords.forEach(coord => {
              totalLng += coord[0]
              totalLat += coord[1]
              count++
            })
            centerLng = totalLng / count
            centerLat = totalLat / count
          } else if (feature.geometry.type === 'MultiPolygon') {
            // For MultiPolygon, use the largest polygon (same logic as bbox calculation)
            let largestPolygon = feature.geometry.coordinates[0] // first polygon
            let maxArea = 0

            feature.geometry.coordinates.forEach(polygonCoords => {
              const exteriorRing = polygonCoords[0]
              // Calculate approximate area using shoelace formula
              let area = 0
              for (let i = 0; i < exteriorRing.length - 1; i++) {
                area +=
                  exteriorRing[i][0] * exteriorRing[i + 1][1] -
                  exteriorRing[i + 1][0] * exteriorRing[i][1]
              }
              area = Math.abs(area) / 2

              if (area > maxArea) {
                maxArea = area
                largestPolygon = polygonCoords
              }
            })

            console.log('Using largest polygon with area:', maxArea)
            const coords = largestPolygon[0] // exterior ring of largest polygon
            let totalLng = 0
            let totalLat = 0
            let count = 0
            coords.forEach(coord => {
              totalLng += coord[0]
              totalLat += coord[1]
              count++
            })
            centerLng = totalLng / count
            centerLat = totalLat / count
          } else {
            centerLng = feature.geometry.coordinates[0][0][0] || 0
            centerLat = feature.geometry.coordinates[0][0][1] || 0
          }
          console.log('Using geometry-based center:', centerLng, centerLat)
        } catch (error) {
          console.error('Error calculating geometry center:', error)
          centerLng = 0
          centerLat = 0
        }
      } else {
        // Fallback to clicked coordinates (this shouldn't happen for countries)
        centerLng = 0
        centerLat = 0
        console.log('No bbox or geometry, using fallback center')
      }

      console.log('Final flyTo params:', {
        center: [centerLng, centerLat],
        zoom: calculatedZoom,
        duration: 2000,
      })

      // Fly to the country center with appropriate zoom
      map.flyTo({
        center: [centerLng, centerLat],
        zoom: calculatedZoom,
        duration: 2000,
      })
    } else {
      console.log('No features found for country:', countryName)
      // Try alternative name matching
      const altFeatures = map.querySourceFeatures('countries')
      const matchingFeatures = altFeatures.filter(
        f =>
          f.properties.name.toLowerCase().includes(countryName.toLowerCase()) ||
          countryName.toLowerCase().includes(f.properties.name.toLowerCase())
      )
      console.log(
        'Alternative matches:',
        matchingFeatures.map(f => f.properties.name)
      )
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
        mapStyle={MAPBOX_STYLE}
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
        mapboxApiAccessToken={MAPBOX_TOKEN}
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
            data="https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json"
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

      {/* Legend - Percentile Map */}
      {percentiles && percentiles.length > 0 && (
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
            {percentiles.map((p, i) => (
              <div key={i} style={{ position: 'relative', flex: 1 }}>
                <div
                  style={{
                    height: '24px',
                    background: p.color,
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={`${p.percentile}th percentile: ${p.value} visitors`}
                >
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: '#ffffff',
                      lineHeight: '1',
                      fontFamily: 'monospace',
                    }}
                  >
                    {p.percentile}%
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
                  percentiles.find(
                    p =>
                      Number(p.percentile) === Number(hoveredCountry.percentile)
                  )?.color || '#f9fafb',
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
