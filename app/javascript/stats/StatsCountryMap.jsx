/* @flow */
import React from 'react'
import ReactMapGL, { Marker } from 'react-map-gl'
import { MAPBOX_TOKEN, MAPBOX_STYLE } from 'map_view'

// Minimal ISO2 country centroids suitable for a first-pass visualization.
// Extend as needed.
const CENTROIDS: { [iso2: string]: [number, number] } = {
  US: [-98.5795, 39.8283],
  CA: [-106.3468, 56.1304],
  GB: [-3.435973, 55.378051],
  MX: [-102.5528, 23.6345],
  BR: [-51.9253, -14.235],
  AR: [-63.6167, -38.4161],
  FR: [2.2137, 46.2276],
  DE: [10.4515, 51.1657],
  IN: [78.9629, 20.5937],
  CN: [104.1954, 35.8617],
  AU: [133.7751, -25.2744],
  TW: [120.9605, 23.6978],
  SG: [103.8198, 1.3521],
  CH: [8.2275, 46.8182],
  ID: [113.9213, -0.7893],
  NG: [8.6753, 9.0820],
}
type Row = {
  country: ?string,
  unique_visits: ?number,
}
type Props = { rows: Row[] }

export default function StatsCountryMap ({ rows }: Props) {
  const markers = (rows || []).map(r => {
    const iso = (r.country || '').toUpperCase()
    const coord = CENTROIDS[iso]
    if (!coord) return null
    const size = Math.max(6, Math.min(28, (r.unique_visits || 0) ** 0.5 * 6))
    return { iso, coord, size, value: r.unique_visits || 0 }
  }).filter(Boolean)

  const viewport = {
    latitude: 20,
    longitude: 0,
    zoom: 1.3,
  }

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactMapGL
        mapStyle={MAPBOX_STYLE}
        width="100%"
        height="100%"
        latitude={viewport.latitude}
        longitude={viewport.longitude}
        zoom={viewport.zoom}
        scrollZoom={false}
        mapboxApiAccessToken={MAPBOX_TOKEN}
      >
        {markers.map(m => (
          <Marker key={m.iso} latitude={m.coord[1]} longitude={m.coord[0]}>
            <div
              title={`${m.iso}: ${m.value}`}
              style={{
                width: m.size,
                height: m.size,
                borderRadius: '50%',
                background: 'rgba(45, 114, 210, 0.8)',
                border: '2px solid rgba(255,255,255,0.9)',
              }}
            />
          </Marker>
        ))}
      </ReactMapGL>
    </div>
  )
}
