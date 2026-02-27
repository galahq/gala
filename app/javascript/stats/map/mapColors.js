/* @flow */

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
