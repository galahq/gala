/* @flow */
import { useEffect } from 'react'

type MapRef = {
  current: {
    getMap: () => any,
  } | null,
}

type Params = {
  mapRef: MapRef,
  mapLoaded: boolean,
  fillColorExpression: mixed,
  defaultColor: string,
}

export function useMapFillColorSync ({
  mapRef,
  mapLoaded,
  fillColorExpression,
  defaultColor,
}: Params): void {
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    const map = mapRef.current.getMap()
    if (!map) return

    try {
      if (map.getLayer('country-fills')) {
        const nextColor = fillColorExpression || defaultColor
        map.setPaintProperty('country-fills', 'fill-color', nextColor)
      }
    } catch (error) {
      console.error('Error updating map colors:', error)
    }
  }, [defaultColor, fillColorExpression, mapLoaded, mapRef])
}

export default useMapFillColorSync
