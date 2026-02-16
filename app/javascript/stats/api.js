/* @flow */
import { Orchard } from 'shared/orchard'

import {
  binForValue,
  calculateBins,
  sortedUniqueVisits,
} from './colors'

import type {
  ApiStatsPayload,
  ApiStatsRow,
  StatsBin,
  StatsCountryRow,
  StatsData,
  StatsDateRangeParams,
  StatsSummary,
} from './types'

type AbortSignalLike = {
  aborted: boolean,
  addEventListener?: (event: 'abort', callback: () => mixed) => mixed,
  removeEventListener?: (event: 'abort', callback: () => mixed) => mixed,
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

function normalizeEndpoint (endpoint: string): string {
  const trimmed = endpoint.replace(/\/$/, '')
  if (trimmed.endsWith('.json')) return trimmed
  return `${trimmed}.json`
}

function compactParams (params: StatsDateRangeParams): { [string]: string } {
  const result = {}
  if (params.from) {
    result.from = params.from
  }
  if (params.to) {
    result.to = params.to
  }
  return result
}

function createAbortError (): Error {
  const error = new Error('The operation was aborted.')
  error.name = 'AbortError'
  return error
}

function withAbortSignal<T> (
  promise: Promise<T>,
  signal: ?AbortSignalLike = null
): Promise<T> {
  if (signal == null) return promise
  if (signal.aborted) return Promise.reject(createAbortError())
  const activeSignal: AbortSignalLike = signal

  return new Promise((resolve, reject) => {
    const onAbort = () => reject(createAbortError())

    if (activeSignal.addEventListener) {
      activeSignal.addEventListener('abort', onAbort)
    }

    promise
      .then(resolve, reject)
      .finally(() => {
        if (activeSignal.removeEventListener) {
          activeSignal.removeEventListener('abort', onAbort)
        }
      })
  })
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

function parseCountryName (value: mixed): string {
  return parseStringOrNull(value) || 'Unknown'
}

function normalizeApiRow (row: ApiStatsRow): StatsCountryRow {
  const country = row && row.country ? row.country : {}
  const metrics = row && row.metrics ? row.metrics : {}

  return {
    iso2: parseStringOrNull(country.iso2),
    iso3: parseStringOrNull(country.iso3),
    name: parseCountryName(country.name),
    unique_visits: parseNumber(metrics.unique_visits),
    unique_users: parseNumber(metrics.unique_users),
    events_count: parseNumber(metrics.events_count),
    visit_podcast_count: parseNumber(metrics.visit_podcast_count),
    first_event: parseStringOrNull(row.first_event),
    last_event: parseStringOrNull(row.last_event),
    bin: 0,
  }
}

function buildBins (rows: StatsCountryRow[]): StatsBin[] {
  const values = sortedUniqueVisits(
    rows.map(row => ({ unique_visits: row.unique_visits }))
  )
  return calculateBins(values)
}

function buildSummary (rows: StatsCountryRow[], bins: StatsBin[]): StatsSummary {
  return {
    total_visits: rows.reduce((sum, row) => sum + row.unique_visits, 0),
    country_count: rows.length,
    total_podcast_listens: rows.reduce(
      (sum, row) => sum + row.visit_podcast_count,
      0
    ),
    bins,
    bin_count: bins.length,
  }
}

function normalizeStatsPayload (payload: ApiStatsPayload): StatsData {
  if (payload && payload.error) {
    throw new Error(payload.error || 'Invalid response')
  }

  const rows = payload.data.map(normalizeApiRow)

  const bins = buildBins(rows)
  const formatted = rows.map(row => ({
    ...row,
    bin: binForValue(row.unique_visits, bins),
  }))

  return {
    formatted,
    summary: buildSummary(formatted, bins),
  }
}

export async function fetchStats (
  dataUrl: string,
  params: StatsDateRangeParams = {},
  signal?: AbortSignalLike
): Promise<StatsData> {
  const payload = await withAbortSignal(
    Orchard.harvest(normalizeEndpoint(dataUrl), compactParams(params)),
    signal
  )

  if (
    !payload ||
    typeof payload !== 'object' ||
    !Array.isArray(payload.data)
  ) {
    throw new Error('Invalid response')
  }

  return normalizeStatsPayload((payload: any))
}
