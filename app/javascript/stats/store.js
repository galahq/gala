/* @flow */

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'

import { fetchCaseStats } from './https'
import { attachBinsToRows } from './map'

import type { StatsEventRow } from './https'
import type { StatsBin, StatsCountryRow } from './map'

const FLAGCDN_BASE_URL = 'https://flagcdn.com'

const TRANSLATION_KEYS = [
  'overview',
  'overview_stats',
  'filter_by_date',
  'about_visitors',
  'tips_description',
  'filtered_stats',
  'date_published',
  'available_translations',
  'total_deployments',
  'table_unique_visitors',
  'countries',
  'podcast_listens_short',
  'table_title',
  'table_export_csv',
  'table_rank',
  'table_country',
  'table_first_visit',
  'table_last_visit',
  'table_total',
  'table_unknown_country',
  'no_data',
  'loading_map_data',
  'loading_map',
  'error_title',
  'error_description',
  'error_try_again',
  'error_map_title',
  'error_map_description',
  'error_map_retry',
  'error_no_data_title',
  'error_no_data_description',
  'map_legend_title',
  'map_legend_help_title',
  'map_legend_help_description',
  'map_tooltip_visitors',
  'map_tooltip_users',
  'map_tooltip_events',
  'date_range_all_time',
  'date_range_past_7_days',
  'date_range_past_30_days',
  'date_range_past_year',
  'date_range_past_2_years',
]

const EMPTY_SUMMARY = {
  total_visits: 0,
  country_count: 0,
  total_podcast_listens: 0,
}

type CaseInfo = {
  link: string,
  published_at: ?string,
  min_date: ?string,
  max_date: ?string,
  deployments_count: number,
  locales: string[],
}

type DateRange = {
  from: string,
  to: ?string,
}

type StatsSummary = {
  total_visits: number,
  country_count: number,
  total_podcast_listens: number,
}

type State = {
  endpoint: string,
  locale: string,
  translations: { [string]: string },
  caseInfo: CaseInfo,
  dateRange: DateRange,
  allTimeLoaded: boolean,
  rangeLoaded: boolean,
  allTimeSummary: StatsSummary,
  rangeSummary: StatsSummary,
  allTimeRows: Array<StatsCountryRow>,
  rangeRows: ?Array<StatsCountryRow>,
  bins: Array<StatsBin>,
  flagsByIso2: { [string]: string },
  isRangeLoading: boolean,
  error: ?Error,
}

type Action =
  | {
      type: 'SET_TRANSLATIONS',
      payload: { [string]: string },
    }
  | {
      type: 'SET_DATE_RANGE',
      payload: DateRange,
    }
  | {
      type: 'SET_FLAGS',
      payload: { [string]: string },
    }
  | { type: 'FETCH_ALL_TIME_START' }
  | {
      type: 'FETCH_ALL_TIME_SUCCESS',
      payload: {
        rows: Array<StatsCountryRow>,
        summary: StatsSummary,
      },
    }
  | {
      type: 'FETCH_ALL_TIME_FAILURE',
      payload: Error,
    }
  | { type: 'FETCH_RANGE_START' }
  | {
      type: 'FETCH_RANGE_SUCCESS',
      payload: {
        rows: Array<StatsCountryRow>,
        bins: Array<StatsBin>,
      },
    }
  | {
      type: 'FETCH_RANGE_FAILURE',
      payload: Error,
    }

function toCamelCase (key: string): string {
  return key
    .split('_')
    .filter(Boolean)
    .map((part, index) => {
      if (index === 0) return part
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join('')
}

function buildTranslations (messages: {
  [string]: string,
}): { [string]: string } {
  return TRANSLATION_KEYS.reduce((acc, key) => {
    const messageId = `cases.stats.show.${toCamelCase(key)}`
    const translated = messages && messages[messageId]
    return {
      ...acc,
      [key]: translated || key,
    }
  }, {})
}

function normalizeIsoDateString (value: ?string): ?string {
  if (!value || typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null
}

function clampDateString (
  value: string,
  minDate: string,
  maxDate: string
): string {
  if (value < minDate) return minDate
  if (value > maxDate) return maxDate
  return value
}

function normalizeCountryCode (value: ?string): ?string {
  if (!value || typeof value !== 'string') return null
  const trimmed = value.trim().toUpperCase()
  return trimmed || null
}

function buildFlagUrl (iso2: ?string): ?string {
  if (!iso2) return null
  return `${FLAGCDN_BASE_URL}/${iso2.toLowerCase()}.svg`
}

function normalizeEventRow (row: StatsEventRow): StatsCountryRow {
  const country = row && row.country ? row.country : {}
  const metrics = row && row.metrics ? row.metrics : {}

  const iso2 = normalizeCountryCode(country.iso2)
  const iso3 = normalizeCountryCode(country.iso3)

  const rawName =
    typeof country.name === 'string' && country.name.trim().length > 0
      ? country.name.trim()
      : null

  return {
    iso2,
    iso3,
    name: rawName || 'Unknown',
    unique_visits: Number(metrics.unique_visits) || 0,
    unique_users: Number(metrics.unique_users) || 0,
    events_count: Number(metrics.events_count) || 0,
    visit_podcast_count: Number(metrics.visit_podcast_count) || 0,
    first_event: row.first_event || null,
    last_event: row.last_event || null,
  }
}

function normalizeRows (
  payload: ?{ data?: Array<StatsEventRow> }
): Array<StatsCountryRow> {
  const rows = payload && Array.isArray(payload.data) ? payload.data : []
  return rows.map(normalizeEventRow)
}

function buildSummary (rows: Array<StatsCountryRow>): StatsSummary {
  const totalVisits = rows.reduce(
    (sum, row) => sum + (row.unique_visits || 0),
    0
  )
  const totalPodcastListens = rows.reduce(
    (sum, row) => sum + (row.visit_podcast_count || 0),
    0
  )

  const knownCountryCount = rows.filter(
    row => row.iso2 && row.name !== 'Unknown'
  ).length

  return {
    total_visits: totalVisits,
    country_count: knownCountryCount,
    total_podcast_listens: totalPodcastListens,
  }
}

function hydrateFlags (
  rows: ?Array<StatsCountryRow>,
  namesByIso2: { [string]: string }
): ?Array<StatsCountryRow> {
  if (!rows) return null

  return rows.map(row => {
    const lower = row.iso2 ? row.iso2.toLowerCase() : null
    const localizedName = lower ? namesByIso2[lower] : null

    return {
      ...row,
      name: localizedName || row.name || 'Unknown',
      flag_url: buildFlagUrl(row.iso2),
    }
  })
}

function reducer (state: State, action: Action): State {
  switch (action.type) {
    case 'SET_TRANSLATIONS':
      return {
        ...state,
        translations: action.payload,
      }

    case 'SET_DATE_RANGE':
      return {
        ...state,
        dateRange: action.payload,
      }

    case 'SET_FLAGS':
      return {
        ...state,
        flagsByIso2: action.payload,
      }

    case 'FETCH_ALL_TIME_START':
      return {
        ...state,
        error: null,
      }

    case 'FETCH_ALL_TIME_SUCCESS':
      return {
        ...state,
        allTimeLoaded: true,
        allTimeRows: action.payload.rows,
        allTimeSummary: action.payload.summary,
      }

    case 'FETCH_ALL_TIME_FAILURE':
      return {
        ...state,
        allTimeLoaded: true,
        allTimeRows: [],
        allTimeSummary: EMPTY_SUMMARY,
        error: action.payload,
      }

    case 'FETCH_RANGE_START':
      return {
        ...state,
        isRangeLoading: true,
        error: null,
      }

    case 'FETCH_RANGE_SUCCESS':
      return {
        ...state,
        rangeLoaded: true,
        isRangeLoading: false,
        rangeRows: action.payload.rows,
        rangeSummary: buildSummary(action.payload.rows),
        bins: action.payload.bins,
      }

    case 'FETCH_RANGE_FAILURE':
      return {
        ...state,
        rangeLoaded: true,
        isRangeLoading: false,
        rangeRows: [],
        rangeSummary: EMPTY_SUMMARY,
        bins: [],
        error: action.payload,
      }

    default:
      return state
  }
}

export function parseLocalDate (dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatLocalDate (date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getTodayIso (): string {
  return formatLocalDate(new Date())
}

export function formatDate (dateStr: ?string, locale: string = 'en-US'): string {
  if (!dateStr) return ''

  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
  const date = isDateOnly ? parseLocalDate(dateStr) : new Date(dateStr)

  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateRange (
  from: ?string,
  to: ?string,
  locale: string = 'en-US'
): string {
  if (!from && !to) return ''

  const fromFormatted = formatDate(from, locale)
  const toFormatted = formatDate(to, locale)

  if (fromFormatted && toFormatted) {
    return `${fromFormatted} - ${toFormatted}`
  }

  return fromFormatted || toFormatted || ''
}

export function sanitizeRange ({
  from,
  to,
  minDate,
  maxDate,
}: {
  from: ?string,
  to: ?string,
  minDate: string,
  maxDate: string,
}): DateRange {
  const normalizedFrom = normalizeIsoDateString(from) || minDate
  const normalizedTo = normalizeIsoDateString(to)

  const safeFrom = clampDateString(normalizedFrom, minDate, maxDate)

  if (!normalizedTo) {
    return { from: safeFrom, to: null }
  }

  const safeTo = clampDateString(normalizedTo, minDate, maxDate)
  return {
    from: safeFrom,
    to: safeTo < safeFrom ? safeFrom : safeTo,
  }
}

function initialRange (minDate: string, maxDate: string): DateRange {
  const params = new URLSearchParams(window.location.search)

  return sanitizeRange({
    from: params.get('from') || minDate,
    to: params.get('to') || maxDate,
    minDate,
    maxDate,
  })
}

function syncUrlParams (range: DateRange): void {
  const url = new URL(window.location.href)
  const params = url.searchParams

  params.set('from', range.from)
  if (range.to) {
    params.set('to', range.to)
  } else {
    params.delete('to')
  }

  window.history.replaceState({}, '', `${url.pathname}?${params.toString()}`)
}

async function fetchFlagsByLocale (
  locale: string
): Promise<{ [string]: string }> {
  const language = (locale || 'en').split(/[-_]/)[0].toLowerCase()
  if (language === 'en') return {}

  const tryFetch = async targetLanguage => {
    const response = await fetch(
      `${FLAGCDN_BASE_URL}/${targetLanguage}/codes.json`
    )
    if (!response.ok) {
      throw new Error(`Failed loading flags (${response.status})`)
    }

    const payload = await response.json()
    return payload && typeof payload === 'object' ? payload : {}
  }

  try {
    return await tryFetch(language)
  } catch (_error) {
    try {
      return await tryFetch('en')
    } catch (__error) {
      return {}
    }
  }
}

function createInitialState ({
  endpoint,
  locale,
  messages,
  initialCase,
}: {
  endpoint: string,
  locale: string,
  messages: { [string]: string },
  initialCase: CaseInfo,
}): State {
  const minDate = normalizeIsoDateString(initialCase.min_date) || getTodayIso()
  const maxDate = normalizeIsoDateString(initialCase.max_date) || getTodayIso()
  const locales = Array.isArray(initialCase.locales)
    ? initialCase.locales
        .map(localeValue =>
          typeof localeValue === 'string' ? localeValue.trim() : ''
        )
        .filter(Boolean)
    : []

  return {
    endpoint,
    locale,
    translations: buildTranslations(messages),
    caseInfo: {
      ...initialCase,
      locales,
      min_date: minDate,
      max_date: maxDate,
    },
    dateRange: initialRange(minDate, maxDate),
    allTimeLoaded: false,
    rangeLoaded: false,
    allTimeSummary: EMPTY_SUMMARY,
    rangeSummary: EMPTY_SUMMARY,
    allTimeRows: [],
    rangeRows: null,
    bins: [],
    flagsByIso2: {},
    isRangeLoading: true,
    error: null,
  }
}

export function useStatsStore ({
  endpoint,
  locale,
  messages,
  initialCase,
}: {
  endpoint: string,
  locale: string,
  messages: { [string]: string },
  initialCase: CaseInfo,
}) {
  const [state, dispatch] = useReducer(
    reducer,
    {
      endpoint,
      locale,
      messages,
      initialCase,
    },
    createInitialState
  )
  const hasFetchedAllTime = useRef(false)

  useEffect(() => {
    dispatch({
      type: 'SET_TRANSLATIONS',
      payload: buildTranslations(messages || {}),
    })
  }, [messages])

  useEffect(() => {
    syncUrlParams(state.dateRange)
  }, [state.dateRange.from, state.dateRange.to])

  useEffect(() => {
    let active = true

    fetchFlagsByLocale(state.locale)
      .then(namesByIso2 => {
        if (!active) return
        dispatch({ type: 'SET_FLAGS', payload: namesByIso2 })
      })
      .catch(() => {
        if (!active) return
        dispatch({ type: 'SET_FLAGS', payload: {}})
      })

    return () => {
      active = false
    }
  }, [state.locale])

  useEffect(() => {
    let active = true
    if (hasFetchedAllTime.current) return undefined

    hasFetchedAllTime.current = true

    dispatch({ type: 'FETCH_ALL_TIME_START' })

    fetchCaseStats(state.endpoint, {
      from: state.caseInfo.min_date,
    })
      .then(payload => {
        if (!active) return

        const rows = normalizeRows(payload)
        dispatch({
          type: 'FETCH_ALL_TIME_SUCCESS',
          payload: {
            rows,
            summary: buildSummary(rows),
          },
        })
      })
      .catch(error => {
        if (!active) return
        dispatch({ type: 'FETCH_ALL_TIME_FAILURE', payload: error })
      })

    return () => {
      active = false
    }
  }, [state.endpoint, state.caseInfo.min_date])

  useEffect(() => {
    let active = true

    dispatch({ type: 'FETCH_RANGE_START' })

    fetchCaseStats(state.endpoint, {
      from: state.dateRange.from,
      to: state.dateRange.to,
    })
      .then(payload => {
        if (!active) return

        const normalized = normalizeRows(payload)
        const { rows, bins } = attachBinsToRows(normalized, 5)

        dispatch({
          type: 'FETCH_RANGE_SUCCESS',
          payload: {
            rows,
            bins,
          },
        })
      })
      .catch(error => {
        if (!active) return
        dispatch({ type: 'FETCH_RANGE_FAILURE', payload: error })
      })

    return () => {
      active = false
    }
  }, [
    state.endpoint,
    state.dateRange.from,
    state.dateRange.to,
  ])

  const setDateRange = useCallback(
    (from: ?Date, to: ?Date) => {
      const minDate = state.caseInfo.min_date || getTodayIso()
      const maxDate = state.caseInfo.max_date || getTodayIso()

      dispatch({
        type: 'SET_DATE_RANGE',
        payload: sanitizeRange({
          from: from ? formatLocalDate(from) : minDate,
          to: to ? formatLocalDate(to) : null,
          minDate,
          maxDate,
        }),
      })
    },
    [state.caseInfo.min_date, state.caseInfo.max_date]
  )

  const t = useCallback(
    (key: string): string => {
      return state.translations[key] || key
    },
    [state.translations]
  )

  const rangeRowsWithFlags = useMemo(() => {
    return hydrateFlags(state.rangeRows, state.flagsByIso2)
  }, [state.rangeRows, state.flagsByIso2])

  const allTimeRowsWithFlags = useMemo(() => {
    return hydrateFlags(state.allTimeRows, state.flagsByIso2) || []
  }, [state.allTimeRows, state.flagsByIso2])

  return {
    state: {
      ...state,
      isInitialLoading: !state.allTimeLoaded || !state.rangeLoaded,
      rangeRows: rangeRowsWithFlags,
      allTimeRows: allTimeRowsWithFlags,
    },
    actions: {
      setDateRange,
    },
    t,
  }
}

export default useStatsStore
