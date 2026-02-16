/* @flow */

export type StatsBin = {
  bin: number,
  min: number,
  max: number,
  label: string,
}

export type ApiStatsCountry = {
  iso2?: ?string,
  iso3?: ?string,
  name?: ?string,
}

export type ApiStatsMetrics = {
  unique_visits?: ?number,
  unique_users?: ?number,
  events_count?: ?number,
  visit_podcast_count?: ?number,
}

export type ApiStatsRow = {
  country?: ?ApiStatsCountry,
  metrics?: ?ApiStatsMetrics,
  first_event?: ?string,
  last_event?: ?string,
}

export type ApiStatsPayload = {
  data: ApiStatsRow[],
  error?: ?string,
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
  bin: number,
}

export type StatsSummary = {
  total_visits: number,
  country_count: number,
  total_podcast_listens: number,
  bins: StatsBin[],
  bin_count: number,
}

export type StatsData = {
  formatted: StatsCountryRow[],
  summary: StatsSummary,
}

export type StatsDateRange = {
  from: ?string,
  to: ?string,
}

export type StatsDateRangeParams = {
  from?: string,
  to?: string,
}

export type StatsSortField = 'name' | 'unique_visits'
export type StatsSortDirection = 'asc' | 'desc'
