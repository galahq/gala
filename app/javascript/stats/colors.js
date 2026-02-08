/* @flow */

export const Colors = {
  BLACK: '#10161A',
  WHITE: '#FFFFFF',
  PAPER: '#EBEAE4',
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

const MAP_BIN_GRADIENT_STOPS = [
  Colors.INDIGO5,
  Colors.INDIGO4,
  Colors.INDIGO3,
  Colors.INDIGO2,
  Colors.INDIGO1,
]

function isHexColor (value: string): boolean {
  return /^#([0-9a-fA-F]{6})$/.test(value)
}

function hexToRgb (hex: string): [number, number, number] {
  const normalized = hex.replace('#', '').toLowerCase()
  const intValue = parseInt(normalized, 16)
  return [
    (intValue >> 16) & 255,
    (intValue >> 8) & 255,
    intValue & 255,
  ]
}

function rgbToHex (r: number, g: number, b: number): string {
  const toHex = value => value.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function interpolateColor (start: string, end: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(start)
  const [r2, g2, b2] = hexToRgb(end)
  const lerp = (a, b) => Math.round(a + (b - a) * t)
  return rgbToHex(lerp(r1, r2), lerp(g1, g2), lerp(b1, b2))
}

function getGradientColor (stops: string[], t: number): string {
  if (stops.length === 1) return stops[0]
  const clamped = Math.max(0, Math.min(1, t))
  const scaled = clamped * (stops.length - 1)
  const index = Math.floor(scaled)
  const localT = scaled - index
  const start = stops[index]
  const end = stops[Math.min(index + 1, stops.length - 1)]
  return interpolateColor(start, end, localT)
}

function getReadableTextColor (value: string): string {
  if (!isHexColor(value)) return Colors.DARK_GRAY3
  const [r, g, b] = hexToRgb(value).map(channel => channel / 255)
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.62 ? Colors.BLACK : Colors.WHITE
}

export function getBinColors (binCount: number): string[] {
  if (binCount === 0) return []
  if (binCount === 1) {
    return [getGradientColor(MAP_BIN_GRADIENT_STOPS, 0.6)]
  }
  return Array.from({ length: binCount }, (_, i) => (
    getGradientColor(MAP_BIN_GRADIENT_STOPS, i / (binCount - 1))
  ))
}

export function getBinTextColors (binCount: number): string[] {
  const colors = getBinColors(binCount)
  return colors.map(getReadableTextColor)
}
