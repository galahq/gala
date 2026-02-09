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

function compactParams (params: { from?: ?string, to?: ?string }): {
  [string]: string,
} {
  const result = {}
  if (params.from != null && params.from !== '') {
    result.from = params.from
  }
  if (params.to != null && params.to !== '') {
    result.to = params.to
  }
  return result
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
