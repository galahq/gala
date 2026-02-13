/* @flow */

import { Colors } from '../colors'

export const getMapboxData = (): string =>
  window.MAPBOX_DATA || 'mapbox://mapbox.country-boundaries-v1'

export const MAPBOX_VECTOR_COUNTRY_SOURCE_LAYER = 'country_boundaries'

export const getMapboxToken = (): string =>
  window.MAPBOX_ACCESS_TOKEN ||
  'MAPBOX_TOKEN_REMOVED'

export const getMapboxStyle = (): string =>
  window.MAPBOX_STYLE_STATS || 'mapbox://styles/mapbox/dark-v10'

export const getMapboxDefaultColor = (): string =>
  window.MAPBOX_DEFAULT_COLOR || Colors.DARK_GRAY3

export const DEFAULT_VIEWPORT = {
  latitude: 20,
  longitude: 0,
  zoom: 0.9,
}

export const MAP_LOAD_TIMEOUT = 20000
