/* @noflow */

import {
  buildValidatedRange,
  createInitialState,
  selectCountries,
  selectDateRangeParams,
  selectError,
  selectHasData,
  selectIsInitialLoad,
  selectIsLoading,
  selectSummary,
  statsReducer,
} from '../state/statsStore'

const sampleData = {
  formatted: [
    {
      iso2: 'US',
      iso3: 'USA',
      name: 'United States',
      unique_visits: 5,
      unique_users: 3,
      events_count: 9,
      visit_podcast_count: 2,
      first_event: '2024-01-01T00:00:00Z',
      last_event: '2024-01-05T00:00:00Z',
      bin: 0,
    },
  ],
  summary: {
    total_visits: 5,
    country_count: 1,
    total_podcast_listens: 2,
    bins: [{ bin: 0, min: 0, max: 5, label: '0-5' }],
    bin_count: 1,
  },
}

describe('stats/state/statsStore', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/cases/demo/stats')
  })

  it('creates initial range from URL params when present', () => {
    window.history.replaceState({}, '', '/cases/demo/stats?from=2024-01-02&to=2024-01-09')

    const state = createInitialState('2020-01-01')

    expect(state.range).toEqual({ from: '2024-01-02', to: '2024-01-09' })
  })

  it('creates initial range from minDate when URL params are absent', () => {
    const state = createInitialState('2020-01-01')

    expect(state.range.from).toEqual('2020-01-01')
    expect(state.range.to).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('validates and clamps date ranges', () => {
    const range = buildValidatedRange(
      new Date(2019, 0, 1),
      new Date(2030, 0, 1),
      '2020-01-01'
    )

    expect(range.from).toEqual('2020-01-01')
    expect(range.to).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('handles fetch lifecycle and selectors', () => {
    const initial = createInitialState(null)

    const loading = statsReducer(initial, { type: 'fetch/started' })
    expect(selectIsLoading(loading)).toBe(true)
    expect(selectIsInitialLoad(loading)).toBe(true)

    const success = statsReducer(loading, {
      type: 'fetch/succeeded',
      data: sampleData,
    })

    expect(selectIsLoading(success)).toBe(false)
    expect(selectIsInitialLoad(success)).toBe(false)
    expect(selectHasData(success)).toBe(true)
    expect(selectCountries(success)).toEqual(sampleData.formatted)
    expect(selectSummary(success)).toEqual(sampleData.summary)
    expect(selectDateRangeParams(success)).toEqual({})

    const failed = statsReducer(success, {
      type: 'fetch/failed',
      error: new Error('boom'),
    })

    expect(selectError(failed)).toBeInstanceOf(Error)
    expect(selectHasData(failed)).toBe(false)
  })

  it('increments refresh key on retry and avoids replacing equal ranges', () => {
    const initial = createInitialState(null)

    const retried = statsReducer(initial, { type: 'fetch/retry_requested' })
    expect(retried.refreshKey).toEqual(initial.refreshKey + 1)

    const sameRange = statsReducer(initial, {
      type: 'range/set',
      range: initial.range,
    })
    expect(sameRange).toBe(initial)
  })
})
