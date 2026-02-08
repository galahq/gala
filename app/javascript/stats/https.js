/* @flow */

import { Orchard } from 'shared/orchard'

export type StatsEventRow = {
  country?: {
    iso2?: ?string,
    iso3?: ?string,
    name?: ?string,
  },
  metrics?: {
    unique_visits?: number,
    unique_users?: number,
    events_count?: number,
    visit_podcast_count?: number,
  },
  first_event?: ?string,
  last_event?: ?string,
}

export type StatsPayload = {
  data?: Array<StatsEventRow>,
}

function normalizeEndpoint (endpoint: string): string {
  const trimmed = endpoint.replace(/\/$/, '')
  if (trimmed.endsWith('.json')) return trimmed
  return `${trimmed}.json`
}

function compactParams (params: { [string]: mixed }): { [string]: mixed } {
  return Object.keys(params).reduce((result, key) => {
    const value = params[key]
    if (value === null || value === undefined || value === '') return result
    return { ...result, [key]: value }
  }, {})
}

export async function fetchCaseStats (
  endpoint: string,
  params: { from?: ?string, to?: ?string } = {}
): Promise<StatsPayload> {
  const normalizedParams = compactParams(params)
  const payload = await Orchard.harvest(
    normalizeEndpoint(endpoint),
    normalizedParams
  )

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid stats response payload')
  }

  return payload
}
