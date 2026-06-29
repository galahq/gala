
import React from 'react'
import { cleanup, render, waitFor } from '@testing-library/react'
import { IntlProvider } from 'react-intl'

import { DateRangePicker } from '@blueprintjs/datetime'
import DatePicker from '../DatePicker'

vi.mock('@blueprintjs/datetime', () => {
  const React = require('react')

  return {
    DateRangePicker: jest.fn((props) => (
      <div className="bp6-daterangepicker">
        <div className="bp6-daterangepicker-shortcuts">
          {(props.shortcuts || []).map((shortcut, index) => (
            <button
              type="button"
              className="bp6-menu-item"
              data-testid={`shortcut-${index}`}
              key={shortcut.label}
            >
              {shortcut.label}
            </button>
          ))}
        </div>
      </div>
    )),
  }
})

const messages = {
  'cases.stats.show.dateRangeAllTime': 'All time',
  'cases.stats.show.dateRangePast7Days': 'Past 7 days',
  'cases.stats.show.dateRangePast30Days': 'Past 30 days',
  'cases.stats.show.dateRangePastYear': 'Past year',
  'cases.stats.show.dateRangePast2Years': 'Past 2 years',
}

function renderPicker (props = {}) {
  return render(
    <IntlProvider locale="en" messages={messages}>
      <DatePicker {...props} />
    </IntlProvider>
  )
}

function todayStart () {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

describe('DatePicker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(cleanup)

  it('highlights all-time shortcut when range matches', async () => {
    const minDate = new Date(2020, 0, 1)
    const end = todayStart()

    const { getByTestId } = renderPicker({
      minDate,
      maxDate: end,
      value: [minDate, end],
    })

    expect(DateRangePicker).toHaveBeenCalled()
    expect(DateRangePicker.mock.calls[0][0]).toMatchObject({ value: [minDate, end] })
    await waitFor(() => {
      const shortcut = getByTestId('shortcut-0')
      if (!shortcut.classList.contains('bp6-active')) {
        throw new Error('shortcut is not active yet')
      }
      return shortcut
    })
    expect(getByTestId('shortcut-0').classList.contains('bp6-active')).toBe(true)
    expect(getByTestId('shortcut-1').classList.contains('bp6-active')).toBe(false)
    expect(getByTestId('shortcut-1').classList.contains('bp6-active')).toBe(false)
  })

  it('does not highlight a shortcut for custom ranges', () => {
    const from = new Date(2021, 0, 3)
    const to = new Date(2021, 0, 9)

    const { getByTestId } = renderPicker({
      minDate: new Date(2020, 0, 1),
      maxDate: todayStart(),
      value: [from, to],
    })

    expect(DateRangePicker).toHaveBeenCalled()
    expect(getByTestId('shortcut-0').classList.contains('bp6-active')).toBe(false)
    expect(getByTestId('shortcut-0').classList.contains('bp6-active')).toBe(false)
    expect(getByTestId('shortcut-1').classList.contains('bp6-active')).toBe(false)
    expect(getByTestId('shortcut-1').classList.contains('bp6-active')).toBe(false)
  })

  it('forwards DateRangePicker changes to onRangeChange', () => {
    const onRangeChange = jest.fn()
    const start = new Date(2024, 0, 1)
    const end = new Date(2024, 0, 5)

    renderPicker({
      minDate: new Date(2020, 0, 1),
      maxDate: todayStart(),
      value: [start, end],
      onRangeChange,
    })

    const pickerProps = DateRangePicker.mock.calls[0][0]
    pickerProps.onChange([start, end])

    expect(onRangeChange).toHaveBeenCalledWith(start, end)
  })

  it('passes a separate calendar min date so the picker can keep two calendars visible', () => {
    const minDate = new Date(2026, 4, 4)
    const calendarMinDate = new Date(2026, 3, 1)
    const maxDate = new Date(2026, 4, 4)

    renderPicker({
      minDate,
      calendarMinDate,
      maxDate,
      value: [minDate, maxDate],
    })

    expect(DateRangePicker.mock.calls[0][0]).toMatchObject({
      minDate: calendarMinDate,
      maxDate,
      singleMonthOnly: false,
      selectedShortcutIndex: 0,
    })
    expect(DateRangePicker.mock.calls[0][0].shortcuts[0].dateRange).toEqual([minDate, maxDate])
  })
})
