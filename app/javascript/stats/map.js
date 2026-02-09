/* @flow */

import { Colors, getBinColors, getBinTextColors } from './colors'

export type StatsBin = {
  bin: number,
  min: number,
  max: number,
  label: string,
}

export type StatsCountryRow = {
  iso2: ?string,
  iso3: ?string,
  name: string,
  unique_visits: number,
  unique_users: number,
  events_count: number,
  visit_podcast_count: number,
  first_event: ?string,
  last_event: ?string,
  bin?: number,
  flag_url?: ?string,
}

export const DEFAULT_VIEWPORT = {
  latitude: 20,
  longitude: 0,
  zoom: 0.9,
}

export const MAPBOX_COUNTRY_SOURCE_LAYER = 'country_boundaries'
export const MAPBOX_COUNTRY_ISO3_PROPERTY = 'iso_3166_1_alpha_3'

export const getMapboxData = (): string =>
  window.MAPBOX_DATA || 'mapbox://mapbox.country-boundaries-v1'

export const getMapboxToken = (): string =>
  window.MAPBOX_ACCESS_TOKEN ||
  'pk.eyJ1IjoiY2JvdGhuZXIiLCJhIjoiY21nNTNlOWM2MDBnazJqcHI3NGtlNjJ5diJ9.NSLz94UIqonNQKbD030jow'

export const getMapboxStyle = (): string =>
  window.MAPBOX_STYLE_STATS || 'mapbox://styles/mapbox/dark-v11'

export function normalizeIso3 (value: ?string): ?string {
  if (!value || typeof value !== 'string') return null
  const normalized = value.trim().toUpperCase()
  return normalized || null
}

function clampInt (value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function uniqueSortedVisits (rows: StatsCountryRow[]): number[] {
  const seen = new Set()
  rows.forEach(row => {
    const visits = Number.isFinite(row.unique_visits) ? row.unique_visits : 0
    seen.add(Math.max(0, visits))
  })
  return Array.from(seen).sort((a, b) => a - b)
}

function percentileBoundary (values: number[], percentile: number): number {
  if (values.length === 0) return 0
  const index = Math.round((percentile / 100) * (values.length - 1))
  return values[clampInt(index, 0, values.length - 1)]
}

export function buildBinsFromRows (
  rows: StatsCountryRow[],
  maxBins: number = 5
): StatsBin[] {
  const values = uniqueSortedVisits(rows)
  if (values.length === 0) return []

  const requestedBins = Math.max(1, Math.min(maxBins, values.length))
  if (requestedBins === 1) {
    const maxValue = values[values.length - 1] || 0
    return [{ bin: 0, min: 0, max: maxValue, label: '0-' + maxValue }]
  }

  const boundaries = []
  for (let i = 0; i < requestedBins; i += 1) {
    const percentile = Math.round((i * 100) / (requestedBins - 1))
    boundaries.push(percentileBoundary(values, percentile))
  }

  const dedupedBoundaries = Array.from(new Set(boundaries))

  return dedupedBoundaries.map((boundary, index) => {
    const min = index === 0 ? 0 : dedupedBoundaries[index - 1]
    const max = boundary
    const isLast = index === dedupedBoundaries.length - 1

    return {
      bin: index,
      min,
      max,
      label: isLast ? String(min) + '+' : String(min) + '-' + String(max),
    }
  })
}

export function getBinIndexForVisits (visits: number, bins: StatsBin[]): number {
  if (!bins.length) return 0

  const value = Math.max(0, Number.isFinite(visits) ? visits : 0)

  for (let i = 0; i < bins.length; i += 1) {
    const current = bins[i]
    if (value >= current.min && value <= current.max) return current.bin
  }

  return bins[bins.length - 1].bin
}

export function attachBinsToRows (
  rows: StatsCountryRow[],
  maxBins: number = 5
): { rows: StatsCountryRow[], bins: StatsBin[] } {
  const bins = buildBinsFromRows(rows, maxBins)

  const nextRows = rows.map(row => ({
    ...row,
    bin: getBinIndexForVisits(row.unique_visits, bins),
  }))

  return { rows: nextRows, bins }
}

export function createFillColorExpression (
  countryColors: { [string]: string },
  defaultColor: string,
  matchProperty: string = MAPBOX_COUNTRY_ISO3_PROPERTY
): mixed[] {
  const expression = ['match', ['get', matchProperty]]

  Object.entries(countryColors).forEach(([iso3, color]) => {
    expression.push(iso3, color)
  })

  expression.push(defaultColor)
  return expression
}

export function createFillLayer ({
  sourceLayer,
  filter,
  fillColor,
}: {
  sourceLayer: string,
  filter?: mixed,
  fillColor: mixed,
}) {
  const layer: any = {
    id: 'country-fills',
    type: 'fill',
    source: 'countries',
    'source-layer': sourceLayer,
    paint: {
      'fill-color': fillColor,
      'fill-opacity': 1,
    },
  }

  if (filter != null) {
    layer.filter = filter
  }

  return layer
}

export function createLineLayer ({
  sourceLayer,
  filter,
}: {
  sourceLayer: string,
  filter?: mixed,
}) {
  const layer: any = {
    id: 'country-borders',
    type: 'line',
    source: 'countries',
    'source-layer': sourceLayer,
    paint: {
      'line-color': Colors.GRAY3,
      'line-width': 0.2,
    },
  }

  if (filter != null) {
    layer.filter = filter
  }

  return layer
}

export function buildCountryColorMap (
  rows: StatsCountryRow[],
  binCount: number
): { [string]: string } {
  const binColors = getBinColors(binCount)
  const colorsByIso3 = {}

  if (!binColors.length) {
    return colorsByIso3
  }

  rows.forEach(row => {
    const iso3 = normalizeIso3(row.iso3)
    if (!iso3) return

    const bin =
      typeof row.bin === 'number' && Number.isFinite(row.bin) ? row.bin : 0
    const maxIndex = Math.max(0, binColors.length - 1)
    const color = binColors[Math.min(bin, maxIndex)]
    if (color) {
      colorsByIso3[iso3] = color
    }
  })

  return colorsByIso3
}

export function getLegendColors (
  binCount: number
): {
  binColors: string[],
  binTextColors: string[],
} {
  return {
    binColors: getBinColors(binCount),
    binTextColors: getBinTextColors(binCount),
  }
}

const TRANSIENT_PATTERNS = [
  'source',
  'layer',
  'cannot be removed',
  'does not exist',
  'style is not done loading',
]

export function parseMapError (
  error: any
): { message: string, isTransient: boolean } {
  let message = 'Unknown error'

  if (typeof error === 'string') {
    message = error
  } else if (error && typeof error.error === 'string') {
    message = error.error
  } else if (error && typeof error.message === 'string') {
    message = error.message
  } else if (error && error.error && typeof error.error.message === 'string') {
    message = error.error.message
  }

  const lower = message.toLowerCase()
  const isTransient = TRANSIENT_PATTERNS.some(pattern =>
    lower.includes(pattern)
  )

  return { message, isTransient }
}

export function calculateTooltipPosition ({
  mouse,
  tooltipRect,
  mapRect,
}: {
  mouse: { x: number, y: number },
  tooltipRect: ClientRect,
  mapRect: ClientRect,
}): { left: number, top: number } {
  const offset = 15
  const wouldOverflowRight =
    mouse.x + offset + tooltipRect.width > mapRect.width
  const left = wouldOverflowRight
    ? mouse.x - offset - tooltipRect.width
    : mouse.x + offset

  const top = Math.max(10, mouse.y - offset)
  return { left, top }
}
