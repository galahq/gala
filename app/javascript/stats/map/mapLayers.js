/* @flow */

import { Colors } from '../colors'

type LayerConfig = {
  id: string,
  type: string,
  source: string,
  paint: { [string]: mixed },
  layout?: { [string]: mixed },
  filter?: mixed,
  'source-layer'?: string,
}

type CountryLayerOptions = {
  sourceLayer: string,
  filter: mixed,
  fillColor?: mixed,
}

export const createFillLayer = (options: CountryLayerOptions): LayerConfig => ({
  id: 'country-fills',
  type: 'fill',
  source: 'countries',
  'source-layer': options.sourceLayer,
  filter: options.filter,
  paint: {
    'fill-color': options.fillColor || Colors.LIGHT_GRAY4,
    'fill-opacity': [
      'case',
      ['boolean', ['get', 'hover'], false],
      0.98,
      0.92,
    ],
  },
})

export const createLineLayer = (options: CountryLayerOptions): LayerConfig => ({
  id: 'country-borders',
  type: 'line',
  source: 'countries',
  'source-layer': options.sourceLayer,
  filter: options.filter,
  paint: {
    'line-color': Colors.GRAY3,
    'line-width': 0.2,
  },
})

export function createFillColorExpression (
  countryColors: { [string]: string },
  defaultColor: string,
  matchProperty: string = 'name'
): mixed[] {
  const expression = ['match', ['get', matchProperty]]

  Object.entries(countryColors).forEach(([name, color]) => {
    expression.push(name, color)
  })

  expression.push(defaultColor)
  return expression
}
