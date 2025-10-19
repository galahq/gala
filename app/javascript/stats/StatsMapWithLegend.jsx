/* @flow */
import React, { useState, useEffect, useRef } from 'react'
import ReactMapGL, { Source, Layer } from 'react-map-gl'
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
const MAPBOX_STYLE = 'mapbox://styles/mapbox/light-v10'

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
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [viewport, setViewport] = useState({
    latitude: 20,
    longitude: 0,
    zoom: 1.5,
  })
  const mapRef = useRef(null)

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
  fillColorExpression.push('#f9fafb')

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
    } else {
      setHoveredCountry(null)
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

      {/* Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          fontSize: '12px',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
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
            color: '#6b7280',
          }}
        >
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredCountry && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '12px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            minWidth: '200px',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {hoveredCountry.name}
          </div>
          <div style={{ fontSize: '12px', color: '#4b5563' }}>
            <div>
              Unique Visitors: {hoveredCountry.unique_visits.toLocaleString()}
            </div>
            <div>
              Unique Users: {hoveredCountry.unique_users.toLocaleString()}
            </div>
            <div>
              Total Events: {hoveredCountry.events_count.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
