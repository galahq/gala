/* @flow */

import { Colors } from '../colors'

export const getMapboxData = (): string =>
  window.MAPBOX_DATA || 'mapbox://mapbox.country-boundaries-v1'

export const getMapboxToken = (): string =>
  window.MAPBOX_ACCESS_TOKEN ||
  'pk.eyJ1IjoiY2JvdGhuZXIiLCJhIjoiY21nNTNlOWM2MDBnazJqcHI3NGtlNjJ5diJ9.NSLz94UIqonNQKbD030jow'

  window.MAPBOX_COUNTRY_SOURCE_LAYER = 'country_boundaries'
  window.MAPBOX_COUNTRY_ISO2_PROPERTY = 'iso_3166_1'
  window.MAPBOX_COUNTRY_ISO3_PROPERTY = 'iso_3166_1_alpha_3'
  
export const getMapboxStyle = (): string =>
  window.MAPBOX_STYLE_STATS || 'mapbox://styles/mapbox/light-v11'

export const getMapboxDefaultColor = (): string =>
  window.MAPBOX_DEFAULT_COLOR || Colors.PAPER

export const getMapboxWorldview = (): string =>
  window.MAPBOX_WORLDVIEW || 'US'

export const MAPBOX_COUNTRY_SOURCE_LAYER = 'country_boundaries'
export const MAPBOX_COUNTRY_ISO2_PROPERTY = 'iso_3166_1'
export const MAPBOX_COUNTRY_ISO3_PROPERTY = 'iso_3166_1_alpha_3'

export const getMapboxCountrySourceLayer = (): string =>
  window.MAPBOX_COUNTRY_SOURCE_LAYER || MAPBOX_COUNTRY_SOURCE_LAYER

export const getMapboxCountryIso2Property = (): string =>
  window.MAPBOX_COUNTRY_ISO2_PROPERTY || MAPBOX_COUNTRY_ISO2_PROPERTY

export const getMapboxCountryIso3Property = (): string =>
  window.MAPBOX_COUNTRY_ISO3_PROPERTY || MAPBOX_COUNTRY_ISO3_PROPERTY

export const DEFAULT_VIEWPORT = {
  latitude: 20,
  longitude: 0,
  zoom: 0.9,
}

export const MAX_COUNTRIES = 200
export const GEOJSON_CACHE_KEY = 'stats-map-geojson'

export const MAP_LOAD_TIMEOUT = 20000
