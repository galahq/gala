/* @noflow */

import React from 'react'
import { render, waitForElement } from 'react-testing-library'
import { IntlProvider } from 'react-intl'

import { DateRangePicker } from '@blueprintjs/datetime'
import DatePicker from '../DatePicker'

jest.mock('@blueprintjs/datetime', () => {
  const React = require('react')

  return {
    DateRangePicker: jest.fn((props) => (
      <div className="pt-daterangepicker">
        <div className="pt-daterangepicker-shortcuts">
          {(props.shortcuts || []).map((shortcut, index) => (
            <button
              type="button"
              className="pt-menu-item"
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

function todayStart (): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

describe('DatePicker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

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
    await waitForElement(() => {
      const shortcut = getByTestId('shortcut-0')
      if (!shortcut.classList.contains('pt-active')) {
        throw new Error('shortcut is not active yet')
      }
      return shortcut
    })
    expect(getByTestId('shortcut-1').classList.contains('pt-active')).toBe(false)
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
    expect(getByTestId('shortcut-0').classList.contains('pt-active')).toBe(false)
    expect(getByTestId('shortcut-1').classList.contains('pt-active')).toBe(false)
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
