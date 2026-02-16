/* @flow */

import {
  formatLocalDate,
  getTodayIso,
  validateDateRange,
} from '../dateHelpers'
import { getUrlParams } from '../urlParams'

import type {
  StatsCountryRow,
  StatsData,
  StatsDateRange,
  StatsDateRangeParams,
  StatsSummary,
} from './types'

export type StatsFetchStatus = 'idle' | 'loading' | 'success' | 'error'

export type StatsState = {
  range: StatsDateRange,
  fetch: {
    status: StatsFetchStatus,
    data: ?StatsData,
    error: ?Error,
    hasFetched: boolean,
  },
  refreshKey: number,
}

type SetRangeAction = {
  type: 'range/set',
  range: StatsDateRange,
}

type FetchStartedAction = {
  type: 'fetch/started',
}

type FetchSucceededAction = {
  type: 'fetch/succeeded',
  data: StatsData,
}

type FetchFailedAction = {
  type: 'fetch/failed',
  error: Error,
}

type RetryRequestedAction = {
  type: 'fetch/retry_requested',
}

export type StatsAction =
  | SetRangeAction
  | FetchStartedAction
  | FetchSucceededAction
  | FetchFailedAction
  | RetryRequestedAction

const EMPTY_SUMMARY: StatsSummary = {
  total_visits: 0,
  country_count: 0,
  total_podcast_listens: 0,
  bins: [],
  bin_count: 0,
}

function getInitialRange (minDate: ?string): StatsDateRange {
  const urlParams = getUrlParams()

  if (urlParams.from || urlParams.to) {
    return {
      from: urlParams.from || null,
      to: urlParams.to || null,
    }
  }

  if (minDate) {
    return { from: minDate, to: getTodayIso() }
  }

  return { from: null, to: null }
}

function rangesAreEqual (left: StatsDateRange, right: StatsDateRange): boolean {
  return left.from === right.from && left.to === right.to
}

export function buildValidatedRange (
  from: ?Date,
  to: ?Date,
  minDate: ?string
): StatsDateRange {
  const fromStr = from ? formatLocalDate(from) : null
  const toStr = to ? formatLocalDate(to) : null
  const today = getTodayIso()

  return validateDateRange(fromStr, toStr, minDate, today)
}

export function createInitialState (minDate: ?string): StatsState {
  return {
    range: getInitialRange(minDate),
    fetch: {
      status: 'idle',
      data: null,
      error: null,
      hasFetched: false,
    },
    refreshKey: 0,
  }
}

export function statsReducer (state: StatsState, action: StatsAction): StatsState {
  switch (action.type) {
    case 'range/set': {
      if (rangesAreEqual(state.range, action.range)) {
        return state
      }

      return {
        ...state,
        range: action.range,
      }
    }

    case 'fetch/started': {
      return {
        ...state,
        fetch: {
          ...state.fetch,
          status: 'loading',
          error: null,
        },
      }
    }

    case 'fetch/succeeded': {
      return {
        ...state,
        fetch: {
          status: 'success',
          data: action.data,
          error: null,
          hasFetched: true,
        },
      }
    }

    case 'fetch/failed': {
      return {
        ...state,
        fetch: {
          status: 'error',
          data: null,
          error: action.error,
          hasFetched: true,
        },
      }
    }

    case 'fetch/retry_requested': {
      return {
        ...state,
        refreshKey: state.refreshKey + 1,
      }
    }

    default:
      return state
  }
}

export function selectDateRangeParams (state: StatsState): StatsDateRangeParams {
  const params: StatsDateRangeParams = {}

  if (state.range.from) {
    params.from = state.range.from
  }

  if (state.range.to) {
    params.to = state.range.to
  }

  return params
}

export function selectCountries (state: StatsState): StatsCountryRow[] {
  return state.fetch.data ? state.fetch.data.formatted : []
}

export function selectSummary (state: StatsState): StatsSummary {
  return state.fetch.data ? state.fetch.data.summary : EMPTY_SUMMARY
}

export function selectError (state: StatsState): ?Error {
  return state.fetch.error
}

export function selectIsLoading (state: StatsState): boolean {
  return state.fetch.status === 'loading'
}

export function selectIsInitialLoad (state: StatsState): boolean {
  return !state.fetch.hasFetched
}

export function selectHasData (state: StatsState): boolean {
  return selectCountries(state).length > 0
}
