/**
 * @flow
 * API module for stats data fetching
 */

export type StatsPayload = {
  formatted: Array<Object>,
  summary: {
    total_visits?: number,
    country_count?: number,
    total_podcast_listens?: number,
    bins?: Array<Object>,
    case_locales?: string,
    case_published_at?: string,
    total_deployments?: number,
  },
  error?: string,
}

export type AllTimeStats = {
  total_visits: number,
  country_count: number,
}

export type CaseSummary = {
  case_locales?: string,
  case_published_at?: string,
  total_deployments?: number,
}

/**
 * Create a timeout promise that rejects after specified milliseconds
 */
function createTimeoutPromise (timeoutMs: number): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(
      () => reject(new Error(`Request timed out after ${timeoutMs / 1000} seconds`)),
      timeoutMs
    )
  })
}

/**
 * Wrap a promise with a timeout
 */
export function fetchWithTimeout<T> (
  promise: Promise<T>,
  timeoutMs: number = 15000
): Promise<T> {
  return Promise.race([promise, createTimeoutPromise(timeoutMs)])
}

/**
 * Parse JSON response or throw error with status
 */
async function parseResponse (response: Response): Promise<any> {
  if (response.ok) {
    return response.json()
  }
  const text = await response.text()
  throw new Error(`HTTP ${response.status}: ${text}`)
}

/**
 * Fetch stats data with optional date range parameters
 * @param signal - Optional AbortController signal to cancel the request
 */
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

/**
 * Fetch all-time stats (no date parameters)
 */
export async function fetchAllTimeStats (dataUrl: string): Promise<StatsPayload> {
  const url = `${dataUrl}.json`

  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  return parseResponse(response)
}

/**
 * Extract all-time stats from payload
 */
export function extractAllTimeStats (payload: StatsPayload): AllTimeStats {
  const summary = payload?.summary || {}
  return {
    total_visits: summary.total_visits || 0,
    country_count: summary.country_count || 0,
  }
}

/**
 * Extract case summary from payload
 */
export function extractCaseSummary (payload: StatsPayload): CaseSummary {
  const summary = payload?.summary || {}
  return {
    case_locales: summary.case_locales,
    case_published_at: summary.case_published_at,
    total_deployments: summary.total_deployments,
  }
}

/**
 * Validate payload and extract formatted data
 */
export function validatePayload (payload: StatsPayload): {
  valid: boolean,
  error?: string,
  formatted: Array<Object>,
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

  const formatted = Array.isArray(payload?.formatted) ? payload.formatted : []
  const summary =
    payload?.summary && typeof payload.summary === 'object'
      ? payload.summary
      : {}

  // Safety check: limit data size to prevent freezing
  if (formatted.length > 10000) {
    return {
      valid: false,
      error: `Too much data received (${formatted.length} countries). Please choose a smaller date range.`,
      formatted: [],
      summary: {},
    }
  }

  return {
    valid: true,
    formatted,
    summary,
  }
}
