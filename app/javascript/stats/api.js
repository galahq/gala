/* @flow */

export type StatsRow = {
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
}

export type StatsBin = {
  bin: number,
  min: number,
  max: number,
  label: string,
}

export type StatsPayload = {
  formatted?: Array<Object>,
  data?: Array<Object>,
  summary?: {
    total_visits?: number,
    country_count?: number,
    total_podcast_listens?: number,
    bins?: Array<StatsBin>,
    bin_count?: number,
  },
  error?: string,
}

type NormalizedStats = {
  formatted: StatsRow[],
  summary: {
    total_visits: number,
    country_count: number,
    total_podcast_listens: number,
    bins: StatsBin[],
    bin_count: number,
  },
}

function createTimeoutPromise (timeoutMs: number): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(
      () => reject(new Error(`Request timed out after ${timeoutMs / 1000} seconds`)),
      timeoutMs
    )
  })
}

export function fetchWithTimeout<T> (
  promise: Promise<T>,
  timeoutMs: number = 15000
): Promise<T> {
  return Promise.race([promise, createTimeoutPromise(timeoutMs)])
}

async function parseResponse (response: Response): Promise<any> {
  if (response.ok) {
    return response.json()
  }
  const text = await response.text()
  throw new Error(`HTTP ${response.status}: ${text}`)
}

export async function fetchStats (
  dataUrl: string,
  params: { from?: string, to?: string } = {},
  signal?: any
): Promise<StatsPayload> {
  const searchParams = new URLSearchParams()
  if (params.from) searchParams.set('from', params.from)
  if (params.to) searchParams.set('to', params.to)

  const queryString = searchParams.toString()
  const url = `${dataUrl}.json${queryString ? `?${queryString}` : ''}`

  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
    signal,
    cache: 'no-store',
  })

  return parseResponse(response)
}

function parseNumber (value: mixed): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function parseStringOrNull (value: mixed): ?string {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

function mapApiRow (row: Object): StatsRow {
  const country = row && row.country ? row.country : {}
  const metrics = row && row.metrics ? row.metrics : {}

  const iso2 = parseStringOrNull(country.iso2)
  const iso3 = parseStringOrNull(country.iso3)
  const name = parseStringOrNull(country.name) || 'Unknown'

  return {
    iso2,
    iso3,
    name,
    unique_visits: parseNumber(metrics.unique_visits),
    unique_users: parseNumber(metrics.unique_users),
    events_count: parseNumber(metrics.events_count),
    visit_podcast_count: parseNumber(metrics.visit_podcast_count),
    first_event: parseStringOrNull(row.first_event),
    last_event: parseStringOrNull(row.last_event),
  }
}

function sortedUniqueVisits (rows: StatsRow[]): number[] {
  const uniq = Array.from(new Set(rows.map(row => Math.max(0, row.unique_visits))))
  return uniq.sort((a, b) => a - b)
}

function calculateBins (values: number[], requestedBinCount: number = 5): StatsBin[] {
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

function binForValue (value: number, bins: StatsBin[]): number {
  if (!bins.length || value === 0) return 0

  for (let i = 0; i < bins.length; i++) {
    const bin = bins[i]
    if (value >= bin.min && value <= bin.max) {
      return bin.bin
    }
  }

  return bins[bins.length - 1].bin
}

function normalizePayload (payload: StatsPayload): NormalizedStats {
  const summary = payload?.summary && typeof payload.summary === 'object'
    ? payload.summary
    : {}

  if (Array.isArray(payload?.formatted)) {
    const formatted = payload.formatted.map(row => ({
      ...row,
      unique_visits: parseNumber(row.unique_visits),
      unique_users: parseNumber(row.unique_users),
      events_count: parseNumber(row.events_count),
      visit_podcast_count: parseNumber(row.visit_podcast_count),
      name: parseStringOrNull(row.name) || 'Unknown',
      iso2: parseStringOrNull(row.iso2),
      iso3: parseStringOrNull(row.iso3),
      first_event: parseStringOrNull(row.first_event),
      last_event: parseStringOrNull(row.last_event),
    }))

    const bins = Array.isArray(summary.bins) ? summary.bins : calculateBins(sortedUniqueVisits(formatted))
    const withBins = formatted.map(row => ({
      ...row,
      bin: typeof row.bin === 'number' ? row.bin : binForValue(row.unique_visits, bins),
    }))

    return {
      formatted: withBins,
      summary: {
        total_visits: parseNumber(summary.total_visits) || withBins.reduce((sum, row) => sum + row.unique_visits, 0),
        country_count: withBins.length,
        total_podcast_listens: parseNumber(summary.total_podcast_listens) || withBins.reduce((sum, row) => (
          sum + row.visit_podcast_count
        ), 0),
        bins,
        bin_count: parseNumber(summary.bin_count) || bins.length,
      },
    }
  }

  const dataRows = Array.isArray(payload?.data) ? payload.data : []
  const formatted = dataRows.map(mapApiRow)
  const bins = calculateBins(sortedUniqueVisits(formatted))
  const withBins = formatted.map(row => ({ ...row, bin: binForValue(row.unique_visits, bins) }))

  return {
    formatted: withBins,
    summary: {
      total_visits: withBins.reduce((sum, row) => sum + row.unique_visits, 0),
      country_count: withBins.length,
      total_podcast_listens: withBins.reduce((sum, row) => sum + row.visit_podcast_count, 0),
      bins,
      bin_count: bins.length,
    },
  }
}

export function validatePayload (payload: StatsPayload): {
  valid: boolean,
  error?: string,
  formatted: StatsRow[],
  summary: Object,
} {
  if (!payload || payload.error) {
    return {
      valid: false,
      error: payload?.error || 'Invalid response',
      formatted: [],
      summary: {},
    }
  }

  const normalized = normalizePayload(payload)
  const formatted = normalized.formatted
  const summary = normalized.summary

  return {
    valid: true,
    formatted,
    summary,
  }
}
