/*  */

import { Colors } from './mapColors'


export const createFillLayer = () => ({
  id: 'country-fills',
  type: 'fill',
  source: 'countries',
  paint: {
    'fill-color': Colors.GRAY1,
    'fill-opacity': [
      'case',
      ['boolean', ['get', 'hover'], false],
      0.95,
      0.85,
    ],
  },
})

export const createLineLayer = () => ({
  id: 'country-borders',
  type: 'line',
  source: 'countries',
  paint: {
    'line-color': Colors.BLACK,
    'line-width': 0.2,
  },
})

export function createFillColorExpression (
  countryColors,
  defaultColor,
  featureProperty = 'name'
) {
  const expression = ['match', ['get', featureProperty]]

  Object.entries(countryColors).forEach(([name, color]) => {
    expression.push(name, color)
  })

  expression.push(defaultColor)
  return expression
}
