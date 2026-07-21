/*  */

import {
  formatLocalDate,
  getTodayIso,
  validateDateRange,
} from '../dateHelpers'
import { getUrlParams } from '../urlParams'










const EMPTY_SUMMARY = {
  total_visits: 0,
  country_count: 0,
  total_podcast_listens: 0,
  bins: [],
  bin_count: 0,
}

function getInitialRange (minDate) {
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

function rangesAreEqual (left, right) {
  return left.from === right.from && left.to === right.to
}

export function buildValidatedRange (
  from,
  to,
  minDate
) {
  const fromStr = from ? formatLocalDate(from) : null
  const toStr = to ? formatLocalDate(to) : null
  const today = getTodayIso()

  return validateDateRange(fromStr, toStr, minDate, today)
}

export function createInitialState (minDate) {
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

export function statsReducer (state, action) {
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

export function selectDateRangeParams (state) {
  const params = {}

  if (state.range.from) {
    params.from = state.range.from
  }

  if (state.range.to) {
    params.to = state.range.to
  }

  return params
}

export function selectCountries (state) {
  return state.fetch.data ? state.fetch.data.formatted : []
}

export function selectSummary (state) {
  return state.fetch.data ? state.fetch.data.summary : EMPTY_SUMMARY
}

export function selectError (state) {
  return state.fetch.error
}

export function selectIsLoading (state) {
  return state.fetch.status === 'loading'
}

export function selectIsInitialLoad (state) {
  return !state.fetch.hasFetched
}

export function selectHasData (state) {
  return selectCountries(state).length > 0
}
