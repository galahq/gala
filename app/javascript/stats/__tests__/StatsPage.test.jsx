/* @noflow */

import React from 'react'
import { act } from 'react-dom/test-utils'
import { fireEvent, render, waitForElement } from 'react-testing-library'
import { IntlProvider } from 'react-intl'

const mockFetchStats = jest.fn()
const mockFetchWithTimeout = jest.fn((promise) => promise)

jest.mock('../http/statsHttp', () => ({
  fetchStats: (...args) => mockFetchStats(...args),
  fetchWithTimeout: (...args) => mockFetchWithTimeout(...args),
}))

jest.mock('../DatePicker', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: jest.fn(({ onRangeChange }) => (
      <button
        data-testid="set-range-button"
        onClick={() => onRangeChange(new Date(2024, 0, 1), new Date(2024, 0, 10))}
      >
        set range
      </button>
    )),
  }
})

jest.mock('../map/MapContainer', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: jest.fn(() => <div data-testid="stats-map" />),
  }
})

jest.mock('../StatsTable', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: jest.fn(() => <div data-testid="stats-table" />),
  }
})

jest.mock('../StatsSummary', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: jest.fn(() => <div data-testid="stats-summary" />),
  }
})

jest.mock('../StatsLoading', () => {
  const React = require('react')
  return {
    MapLoadingOverlay: () => <div data-testid="map-loading" />,
    SummaryLoadingSkeleton: () => <div data-testid="summary-loading" />,
    TableLoadingSkeleton: () => <div data-testid="table-loading" />,
    PageLoadingSkeleton: () => <div data-testid="page-loading" />,
  }
})

jest.mock('../StatsError', () => {
  const React = require('react')
  return {
    StatsErrorState: ({ error, onRetry }) => (
      <div data-testid="stats-error">
        <span data-testid="stats-error-message">{error && error.message}</span>
        <button data-testid="retry-button" onClick={onRetry}>retry</button>
      </div>
    ),
  }
})

import DatePicker from '../DatePicker'
import MapContainer from '../map/MapContainer'
import StatsPage from '../StatsPage'
import StatsSummary from '../StatsSummary'
import StatsTable from '../StatsTable'

const messages = {
  'cases.stats.show.filterByDate': 'Filter by Date',
  'cases.stats.show.tableTitle': 'Visitors by Country',
  'cases.stats.show.tableExportCsv': 'Export CSV',
}

const sampleData = {
  formatted: [
    {
      iso2: 'US',
      iso3: 'USA',
      name: 'United States',
      unique_visits: 10,
      unique_users: 8,
      events_count: 15,
      visit_podcast_count: 4,
      first_event: '2024-01-01T00:00:00Z',
      last_event: '2024-01-10T00:00:00Z',
      bin: 0,
    },
  ],
  summary: {
    total_visits: 10,
    country_count: 1,
    total_podcast_listens: 4,
    bins: [{ bin: 0, min: 0, max: 10, label: '0-10' }],
    bin_count: 1,
  },
}

function renderPage (props = {}) {
  return render(
    <IntlProvider locale="en" messages={messages}>
      <StatsPage
        dataUrl="/cases/demo/stats"
        minDate="2020-01-01"
        {...props}
      />
    </IntlProvider>
  )
}

async function flushPromises () {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

describe('StatsPage', () => {
  let consoleErrorSpy

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.clearAllMocks()
    window.history.replaceState({}, '', '/cases/demo/stats')
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('renders initial loading then successful map/table/summary content', async () => {
    mockFetchStats.mockResolvedValueOnce(sampleData)

    const view = renderPage()

    expect(view.getByTestId('page-loading')).toBeTruthy()
    await waitForElement(() => view.getByTestId('stats-summary'))

    expect(view.queryByTestId('page-loading')).toBeNull()
    expect(view.getByTestId('stats-summary')).toBeTruthy()
    expect(view.getByTestId('stats-map')).toBeTruthy()
    expect(view.getByTestId('stats-table')).toBeTruthy()

    expect(StatsSummary).toHaveBeenCalled()
    expect(MapContainer.mock.calls[0][0]).toMatchObject({
      countries: sampleData.formatted,
      bins: sampleData.summary.bins,
    })
    expect(StatsTable.mock.calls[0][0]).toMatchObject({ data: sampleData.formatted })

    expect(mockFetchWithTimeout).toHaveBeenCalled()
    expect(mockFetchStats).toHaveBeenCalledTimes(1)
    const args = mockFetchStats.mock.calls[0][0]
    expect(args.dataUrl).toEqual('/cases/demo/stats')
    expect(args.params.from).toEqual('2020-01-01')
    expect(args.params.to).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('shows fetch errors and retries successfully', async () => {
    mockFetchStats
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(sampleData)

    const view = renderPage()

    await waitForElement(() => view.getByTestId('stats-error'))
    expect(view.getByTestId('stats-error')).toBeTruthy()
    expect(view.getByTestId('stats-error-message')).toHaveTextContent('network down')

    fireEvent.click(view.getByTestId('retry-button'))
    await waitForElement(() => {
      if (mockFetchStats.mock.calls.length < 2) {
        throw new Error('retry request has not run yet')
      }
      return view.getByTestId('stats-summary')
    })

    expect(mockFetchStats).toHaveBeenCalledTimes(2)
    expect(view.getByTestId('stats-summary')).toBeTruthy()
    expect(view.queryByTestId('stats-error')).toBeNull()
  })

  it('updates URL params after changing date range', async () => {
    mockFetchStats.mockResolvedValue(sampleData)

    const view = renderPage()
    await waitForElement(() => view.getByTestId('set-range-button'))

    fireEvent.click(view.getByTestId('set-range-button'))

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 220))
    })
    await flushPromises()

    expect(mockFetchStats).toHaveBeenCalledTimes(2)
    expect(window.location.search).toContain('from=2024-01-01')
    expect(window.location.search).toContain('to=2024-01-10')
    expect(DatePicker).toHaveBeenCalled()
  })
})
