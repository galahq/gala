/* @flow */
import {
  binForValue,
  calculateBins,
  sortedUniqueVisits,
} from '../bins'

import type {
  ApiStatsPayload,
  ApiStatsRow,
  StatsBin,
  StatsCountryRow,
  StatsData,
  StatsSummary,
} from '../state/types'

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

export function parseApiStatsPayload (payload: mixed): ApiStatsPayload {
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.data)) {
    throw new Error('Invalid response')
  }

  return (payload: any)
}

export function normalizeStatsPayload (payload: ApiStatsPayload): StatsData {
  if (payload.error) {
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
