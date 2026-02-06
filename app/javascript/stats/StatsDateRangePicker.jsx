/* @flow */

import React, { useMemo } from 'react'
import { DateRangePicker } from '@blueprintjs/datetime'
import { injectIntl } from 'react-intl'
import { formatLocalDate } from './dateHelpers'

function StatsDateRangePicker ({
  minDate: minDateProp,
  maxDate: maxDateProp,
  value,
  onRangeChange,
  className,
  intl,
}) {
  const minDate = minDateProp || new Date(2000, 0, 1)
  const maxDate = maxDateProp || new Date()

  const today = new Date()
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startFromDays = d =>
    new Date(end.getFullYear(), end.getMonth(), end.getDate() - d + 1)

  const translatedShortcuts = useMemo(() => ([
    {
      label: intl.formatMessage({ id: 'cases.stats.show.dateRangeAllTime' }),
      dateRange: [minDate, end],
    },
    {
      label: intl.formatMessage({
        id: 'cases.stats.show.dateRangePast7Days',
      }),
      dateRange: [startFromDays(7), end],
    },
    {
      label: intl.formatMessage({
        id: 'cases.stats.show.dateRangePast30Days',
      }),
      dateRange: [startFromDays(30), end],
    },
    {
      label: intl.formatMessage({
        id: 'cases.stats.show.dateRangePastYear',
      }),
      dateRange: [startFromDays(365), end],
    },
    {
      label: intl.formatMessage({
        id: 'cases.stats.show.dateRangePast2Years',
      }),
      dateRange: [startFromDays(730), end],
    },
  ]), [intl, minDate, end])

  const getInitialMonth = (dateRange) => {
    if (!dateRange || !dateRange[0]) return undefined
    const fromDate = dateRange[0]
    return new Date(fromDate.getFullYear(), fromDate.getMonth(), 1)
  }

  const getSelectedShortcutIndex = (currentRange, shortcutsList) => {
    if (!currentRange || !shortcutsList || !Array.isArray(shortcutsList)) {
      return -1
    }

    const [currentFrom, currentTo] = currentRange
    const toDateStr = d => (d ? formatLocalDate(d) : '')

    for (let i = 0; i < shortcutsList.length; i++) {
      const [shortcutFrom, shortcutTo] = shortcutsList[i].dateRange
      if (
        toDateStr(shortcutFrom) === toDateStr(currentFrom) &&
        toDateStr(shortcutTo) === toDateStr(currentTo)
      ) {
        return i
      }
    }
    return -1
  }

  const selectedShortcutIndex = getSelectedShortcutIndex(value, translatedShortcuts)
  const activeShortcutClass =
    selectedShortcutIndex >= 0
      ? `c-stats-date-shortcut-active-${selectedShortcutIndex}`
      : ''
  const pickerClassName = [className, activeShortcutClass].filter(Boolean).join(' ')

  function handleChange (nextRange) {
    if (onRangeChange) {
      onRangeChange(nextRange[0], nextRange[1])
    }
  }

  return (
    <DateRangePicker
      className={pickerClassName}
      value={value}
      minDate={minDate}
      maxDate={maxDate}
      allowSingleDayRange={true}
      contiguousCalendarMonths={false}
      shortcuts={translatedShortcuts}
      initialMonth={getInitialMonth(value)}
      onChange={handleChange}
    />
  )
}

export default injectIntl(StatsDateRangePicker)
