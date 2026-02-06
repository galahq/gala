/* @flow */

export type MetaPayload = {
  case?: {
    id?: number,
    slug?: string,
    published_at?: string,
    locales?: Array<string>,
    total_deployments?: number,
  },
  generated_at?: string,
}

export type BinsPayload = {
  metric?: string,
  bin_count?: number,
  bins?: Array<Object>,
}

export type RangePayload = {
  from?: string,
  to?: string,
  timezone?: string,
}

export type CountryPayload = {
  country?: {
    iso2?: string,
    iso3?: string,
    name?: string,
  },
  metrics?: {
    unique_visits?: number,
    unique_users?: number,
    events_count?: number,
    visit_podcast_count?: number,
  },
  first_event?: string,
  last_event?: string,
  bin?: number,
}

export type StatsPayload = {
  summary?: {
    total_visits?: number,
    country_count?: number,
    total_podcast_listens?: number,
  },
  countries?: Array<CountryPayload>,
  bins?: BinsPayload,
  meta?: MetaPayload,
  range?: RangePayload,
  error?: string,
}

export type AllTimeStats = {
  total_visits: number,
  country_count: number,
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

export async function fetchAllTimeStats (dataUrl: string): Promise<StatsPayload> {
  return fetchStats(dataUrl, {})
}

export function extractAllTimeStats (payload: StatsPayload): AllTimeStats {
  const summary = payload?.summary || {}
  return {
    total_visits: summary.total_visits || 0,
    country_count: summary.country_count || 0,
  }
}

export function extractMeta (payload: StatsPayload): MetaPayload {
  return payload?.meta && typeof payload.meta === 'object' ? payload.meta : {}
}

export function validatePayload (payload: StatsPayload): {
  valid: boolean,
  error?: string,
  countries: Array<Object>,
  summary: Object,
  bins: Object,
  meta: Object,
  range: Object,
} {
  if (!payload || payload.error) {
    return {
      valid: false,
      error: payload?.error || 'Invalid response',
      countries: [],
      summary: {},
      bins: {},
      meta: {},
      range: {},
    }
  }

  const rawCountries = payload && payload.countries
  const countries: Array<CountryPayload> =
    Array.isArray(rawCountries)
      ? ((rawCountries: any): Array<CountryPayload>)
      : []
  const summary =
    payload?.summary && typeof payload.summary === 'object'
      ? payload.summary
      : {}
  const bins =
    payload?.bins && typeof payload.bins === 'object'
      ? payload.bins
      : {}
  const meta =
    payload?.meta && typeof payload.meta === 'object'
      ? payload.meta
      : {}
  const range =
    payload?.range && typeof payload.range === 'object'
      ? payload.range
      : {}
  if (countries.length > 10000) {
    return {
      valid: false,
      error: `Too much data received (${countries.length} countries). Please choose a smaller date range.`,
      countries: [],
      summary: {},
      bins: {},
      meta: {},
      range: {},
    }
  }

  return {
    valid: true,
    countries,
    summary,
    bins,
    meta,
    range,
  }
}
