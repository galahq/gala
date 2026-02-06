/* @flow */

import { Colors } from '../colors'

export const getMapboxData = (): string =>
  window.MAPBOX_DATA || '/countries.geojson'

export const getMapboxToken = (): string =>
  window.MAPBOX_ACCESS_TOKEN ||
  'pk.eyJ1IjoiY2JvdGhuZXIiLCJhIjoiY21nNTNlOWM2MDBnazJqcHI3NGtlNjJ5diJ9.NSLz94UIqonNQKbD030jow'

export const getMapboxStyle = (): string =>
  window.MAPBOX_STYLE_STATS || 'mapbox://styles/mapbox/dark-v10'

export const getMapboxDefaultColor = (): string =>
  window.MAPBOX_DEFAULT_COLOR || Colors.DARK_GRAY3

export const DEFAULT_VIEWPORT = {
  latitude: 20,
  longitude: 0,
  zoom: 0.9,
}

export const MAX_COUNTRIES = 200
export const GEOJSON_CACHE_KEY = 'stats-map-geojson'

export const MAP_LOAD_TIMEOUT = 20000
