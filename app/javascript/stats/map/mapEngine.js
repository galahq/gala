/* @flow */

type MapRefLike = { current: any }

export function getMapInstance (mapRef: MapRefLike): ?any {
  if (!mapRef || !mapRef.current || typeof mapRef.current.getMap !== 'function') {
    return null
  }

  return mapRef.current.getMap()
}

export function applyCountryFillColor (
  map: any,
  fillColorExpression: ?mixed,
  defaultColor: string
): void {
  if (!map || typeof map.getLayer !== 'function' || typeof map.setPaintProperty !== 'function') {
    return
  }

  if (!map.getLayer('country-fills')) {
    return
  }

  const nextColor = fillColorExpression || defaultColor
  map.setPaintProperty('country-fills', 'fill-color', nextColor)
}

export function applyMapLoadPresentation (map: any): void {
  if (!map) return

  const style = typeof map.getStyle === 'function'
    ? map.getStyle()
    : null

  ;((style && style.layers) || []).forEach(layer => {
    if (layer && layer.type === 'symbol' && typeof map.setLayoutProperty === 'function') {
      map.setLayoutProperty(layer.id, 'visibility', 'none')
    }
  })

  const container = typeof map.getContainer === 'function'
    ? map.getContainer()
    : null
  const logo = container && typeof container.querySelector === 'function'
    ? container.querySelector('.mapboxgl-ctrl-logo')
    : null

  if (logo && logo.style) {
    logo.style.opacity = '0.2'
    logo.style.filter = 'brightness(0.3)'
  }
}
