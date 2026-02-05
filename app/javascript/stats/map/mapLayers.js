/* @flow */

import { Colors } from '../colors'

type LayerConfig = {
  id: string,
  type: string,
  source: string,
  paint: { [string]: mixed },
}

// Fill layer for country polygons
export const createFillLayer = (): LayerConfig => ({
  id: 'country-fills',
  type: 'fill',
  source: 'countries',
  paint: {
    'fill-color': Colors.GRAY1,
    'fill-opacity': [
      'case',
      ['boolean', ['get', 'hover'], false],
      0.9,
      0.7,
    ],
  },
})

// Border layer for country outlines
export const createLineLayer = (): LayerConfig => ({
  id: 'country-borders',
  type: 'line',
  source: 'countries',
  paint: {
    'line-color': Colors.BLACK,
    'line-width': 0.2,
  },
})

// Generate mapbox expression for country fill colors
export function createFillColorExpression (
  countryColors: { [string]: string },
  defaultColor: string
): mixed[] {
  const expression = ['match', ['get', 'name']]

  Object.entries(countryColors).forEach(([name, color]) => {
    expression.push(name, color)
  })

  // Default color for countries with no data
  expression.push(defaultColor)
  return expression
}
