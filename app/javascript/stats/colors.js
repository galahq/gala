/* @flow */

import type { StatsBin } from './types'

export const Colors = {
  BLACK: '#10161A',
  WHITE: '#FFFFFF',
  DARK_GRAY3: '#394B59',
  GRAY1: '#394B59',
  GRAY3: '#8A9BA8',
  GRAY5: '#5C7080',
  LIGHT_GRAY4: '#DCE0E5',
  INDIGO1: '#5642A6',
  INDIGO2: '#634DBF',
  INDIGO3: '#7157D9',
  INDIGO4: '#9179F2',
  INDIGO5: '#AD99FF',
  DANGER: '#DB3737',
  PRIMARY: '#137CBD',
}

export function getBinColors (binCount: number): string[] {
  if (binCount === 0) return []
  if (binCount === 1) return [Colors.INDIGO5]

  const indigoShades = [
    Colors.INDIGO1,
    Colors.INDIGO2,
    Colors.INDIGO3,
    Colors.INDIGO4,
    Colors.INDIGO5,
  ]

  const colors = []
  for (let i = 0; i < binCount; i++) {
    const shadeIndex = Math.min(i, indigoShades.length - 1)
    colors.push(indigoShades[shadeIndex])
  }
  return colors
}

export function getBinTextColors (binCount: number): string[] {
  if (binCount === 0) return []
  return getBinColors(binCount).map(color => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
    return luminance > 0.62 ? Colors.BLACK : Colors.WHITE
  })
}

type RowWithUniqueVisits = {
  unique_visits: number,
  ...
}

export function sortedUniqueVisits (rows: RowWithUniqueVisits[]): number[] {
  const uniq = Array.from(new Set(rows.map(row => Math.max(0, row.unique_visits))))
  return uniq.sort((a, b) => a - b)
}

export function calculateBins (
  values: number[],
  requestedBinCount: number = 5
): StatsBin[] {
  if (!values.length) return []

  const binCount = Math.max(1, Math.min(requestedBinCount, values.length))
  if (binCount === 1) {
    const max = values[values.length - 1] || 0
    return [{ bin: 0, min: 0, max, label: `0-${max}` }]
  }

  const minValue = values[0]
  const maxValue = values[values.length - 1]
  const boundaries = Array.from({ length: binCount }, (_, i) => {
    if (i === 0) return minValue
    if (i === binCount - 1) return maxValue
    const percentile = (i * 100) / (binCount - 1)
    const index = Math.round((percentile / 100) * (values.length - 1))
    return values[index]
  })

  const deduped = Array.from(new Set(boundaries))

  return deduped.map((boundary, index) => {
    const min = index === 0 ? 0 : deduped[index - 1]
    const max = boundary
    const isLast = index === deduped.length - 1

    return {
      bin: index,
      min,
      max,
      label: isLast ? `${min}+` : `${min}-${max}`,
    }
  })
}

export function binForValue (value: number, bins: StatsBin[]): number {
  if (!bins.length || value === 0) return 0

  for (let i = 0; i < bins.length; i++) {
    const bin = bins[i]
    if (value >= bin.min && value <= bin.max) {
      return bin.bin
    }
  }

  return bins[bins.length - 1].bin
}
