/* @flow */
import { useState, useEffect } from 'react'

type Position = { left: number, top: number }
type MousePosition = { x: number, y: number }

export function useTooltipPosition (
  hoveredCountry: any,
  mousePosition: MousePosition,
  tooltipRef: { current: HTMLDivElement | null },
  mapRef: { current: { getMap: () => any } | null }
): Position {
  const [tooltipPosition, setTooltipPosition] = useState<Position>({
    left: -1000,
    top: -1000,
  })

  useEffect(() => {
    if (!hoveredCountry || mousePosition.x === 0 || mousePosition.y === 0) {
      return
    }
    if (!tooltipRef.current || !mapRef.current) {
      return
    }

    const tooltip = tooltipRef.current
    const mapInstance = mapRef.current.getMap()
    const mapContainer = mapInstance.getContainer()
    const mapRect = mapContainer.getBoundingClientRect()
    const tooltipRect = tooltip.getBoundingClientRect()

    const offset = 15
    const tooltipWidth = tooltipRect.width
    const wouldOverflowRight = mousePosition.x + offset + tooltipWidth > mapRect.width

    const left = wouldOverflowRight
      ? mousePosition.x - offset - tooltipWidth
      : mousePosition.x + offset

    setTooltipPosition({
      left,
      top: mousePosition.y - offset,
    })
  }, [hoveredCountry, mousePosition, tooltipRef, mapRef])

  return tooltipPosition
}

export default useTooltipPosition
