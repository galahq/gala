/* @flow */
import { Colors } from './mapColors'

function readWindowString (key: string, fallback: string): string {
  const value = (window: any)[key]
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed || fallback
}

function readMapboxToken (): ?string {
  const token = readWindowString('MAPBOX_ACCESS_TOKEN', '')
  if (!token || token === 'MAPBOX_TOKEN_REMOVED' || token === 'CHANGEME') {
    return null
  }
  return token
}

export const MAPBOX_DATA_URL = readWindowString(
  'MAPBOX_DATA',
  'mapbox://mapbox.country-boundaries-v1'
)

export const MAPBOX_TOKEN = readMapboxToken() || 'MAPBOX_TOKEN_REMOVED'
export const MAPBOX_STYLE = readWindowString(
  'MAPBOX_STYLE_STATS',
  'mapbox://styles/mapbox/dark-v11'
)
export const MAPBOX_DEFAULT_COLOR = readWindowString(
  'MAPBOX_DEFAULT_COLOR',
  Colors.DARK_GRAY3
)

export const MAP_LOAD_TIMEOUT = 20000

export const DEFAULT_VIEWPORT = {
  latitude: 20,
  longitude: 15,
  zoom: 0.9,
}

export const MAP_BOUNDS = [
  [-180, -10],
  [180, 10],
]
