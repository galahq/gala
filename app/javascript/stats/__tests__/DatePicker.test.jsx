/* @noflow */

import React from 'react'
import { render } from 'react-testing-library'
import { IntlProvider } from 'react-intl'

jest.mock('@blueprintjs/datetime', () => ({
  DateRangePicker: jest.fn(() => null),
}))

import { DateRangePicker } from '@blueprintjs/datetime'
import DatePicker from '../DatePicker'

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

function todayStart (): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

describe('DatePicker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sets selected shortcut index when range matches all-time shortcut', () => {
    const minDate = new Date(2020, 0, 1)
    const end = todayStart()

    renderPicker({
      minDate,
      maxDate: end,
      value: [minDate, end],
    })

    expect(DateRangePicker).toHaveBeenCalled()
    expect(DateRangePicker.mock.calls[0][0]).toMatchObject({
      selectedShortcutIndex: 0,
      value: [minDate, end],
    })
  })

  it('passes undefined selected shortcut index for custom ranges', () => {
    const from = new Date(2021, 0, 3)
    const to = new Date(2021, 0, 9)

    renderPicker({
      minDate: new Date(2020, 0, 1),
      maxDate: todayStart(),
      value: [from, to],
    })

    expect(DateRangePicker).toHaveBeenCalled()
    expect(DateRangePicker.mock.calls[0][0].selectedShortcutIndex).toBe(undefined)
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
})
