/* @flow */
import React, { useState, useEffect, useRef } from 'react'
import ReactMapGL, { Source, Layer } from 'react-map-gl'
import { Button } from '@blueprintjs/core'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getAccessibleTextColor } from '../utility/colors'

// Import mapbox credentials - try window first, then use fallback
const getMapboxToken = () => {
  // If there's a token in the window that's not the gala-developer one, use it
  if (
    window.MAPBOX_ACCESS_TOKEN &&
    !window.MAPBOX_ACCESS_TOKEN.includes('gala-developer')
  ) {
    return window.MAPBOX_ACCESS_TOKEN
  }
  // Otherwise use the fallback token
  // return "pk.eyJ1IjoiY2JvdGhuZXIiLCJhIjoiY2oyOWZ2bGNuMDI1MDMybzVoc2Ntb3kwYiJ9.QA8nck8XiK5dxF6R7M_HAg"
  return 'pk.eyJ1IjoiZ2FsYS1kZXZlbG9wZXIiLCJhIjoiY21nNWZoODJwMDQ2NzJxb29zZDR5cGViayJ9.87zkTM932fb12m4NiKNbEw'
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

export default function StatsMapWithLegend ({ countries, percentiles }: Props) {
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
    zoom: 1.5,
  })
  const mapRef = useRef(null)
  const tooltipRef = useRef(null)

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

  const onClick = event => {
    const feature = event.features && event.features[0]
    if (feature && mapRef.current) {
      const countryName = feature.properties.name
      const countryData = countries.find(c => c.name === countryName)
      if (countryData) {
        // Calculate centroid from the clicked point or use bbox if available
        let centerLng, centerLat

        if (feature.bbox) {
          // Use bounding box center if available
          const [minLng, minLat, maxLng, maxLat] = feature.bbox
          centerLng = (minLng + maxLng) / 2
          centerLat = (minLat + maxLat) / 2
        } else {
          // Fallback to clicked coordinates
          centerLng = event.lngLat[0]
          centerLat = event.lngLat[1]
        }

        // Fly to the country center with appropriate zoom
        mapRef.current.flyTo({
          center: [centerLng, centerLat],
          zoom: 4,
          duration: 2000,
        })
      }
    }
  }

  const handleZoomIn = () => {
    setViewport(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom + 1, 20), // Max zoom level
    }))
  }

  const handleZoomOut = () => {
    setViewport(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom - 1, 1), // Min zoom level
    }))
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
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <ReactMapGL
        ref={mapRef}
        mapStyle={MAPBOX_STYLE}
        width="100%"
        height="100%"
        latitude={viewport.latitude}
        longitude={viewport.longitude}
        zoom={viewport.zoom}
        scrollZoom={false}
        mapboxApiAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={mapLoaded ? ['country-fills'] : []}
        onViewportChange={setViewport}
        onLoad={() => {
          console.log('Map loaded successfully')
          setMapLoaded(true)
          setMapError(false)
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
        onClick={mapLoaded ? onClick : undefined}
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

        {/* Zoom Controls */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            zIndex: 1,
          }}
        >
          <Button
            minimal
            small
            icon="zoom-in"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
            }}
            title="Zoom In"
            onClick={handleZoomIn}
          />
          <Button
            minimal
            small
            icon="zoom-out"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
            }}
            title="Zoom Out"
            onClick={handleZoomOut}
          />
        </div>
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

      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          background: 'rgba(42, 42, 42, 0.9)',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          fontSize: '12px',
        }}
      >
        <div
          style={{
            fontWeight: 'bold',
            marginBottom: '8px',
            color: getAccessibleTextColor('#2a2a2a'),
          }}
        >
          Unique Visitors
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {percentiles.map((p, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <div
                style={{
                  width: '30px',
                  height: '20px',
                  background: p.color,
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 'bold',
                    color: getAccessibleTextColor(p.color),
                    lineHeight: '1',
                  }}
                >
                  {p.value}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '10px',
            marginTop: '4px',
            color: getAccessibleTextColor('#2a2a2a'),
          }}
        >
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

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
