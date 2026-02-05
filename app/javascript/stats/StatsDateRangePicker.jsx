/* @flow */

import React, { useEffect, useState } from 'react'
import { DateRangePicker } from '@blueprintjs/datetime'
import { injectIntl } from 'react-intl'
import { formatLocalDate } from './utils'

function StatsDateRangePicker ({
  minDate: minDateProp,
  maxDate: maxDateProp,
  shortcuts,
  initialRange,
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

  const translatedShortcuts = [

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
  ]

  const [range, setRange] = useState(initialRange || translatedShortcuts[0].dateRange)

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

  const selectedShortcutIndex = getSelectedShortcutIndex(range, translatedShortcuts)

  function handleChange (nextRange) {
    let applied = nextRange
    const toDateStr = d => (d ? formatLocalDate(d) : '')
    const [nf, nt] = nextRange
    const nfStr = toDateStr(nf)
    const ntStr = toDateStr(nt)
    for (let i = 0; i < translatedShortcuts.length; i++) {
      const [sf, st] = translatedShortcuts[i].dateRange
      if (toDateStr(sf) === nfStr && toDateStr(st) === ntStr) {
        applied = translatedShortcuts[i].dateRange
        break
      }
    }
    setRange(applied)

    if (onRangeChange) {
      onRangeChange(applied[0], applied[1])
    }
  }

  useEffect(() => {
    if (onRangeChange) {
      onRangeChange(range[0], range[1])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const shortcuts = document.querySelectorAll(
      '.pt-daterangepicker-shortcuts .pt-menu-item'
    )
    shortcuts.forEach((shortcut, index) => {
      if (selectedShortcutIndex >= 0 && index === selectedShortcutIndex) {
        shortcut.classList.add('pt-active')
      } else {
        shortcut.classList.remove('pt-active')
      }
    })
  }, [selectedShortcutIndex])

  return (
    <DateRangePicker
      className={className}
      value={range}
      minDate={minDate}
      maxDate={maxDate}
      allowSingleDayRange={true}
      contiguousCalendarMonths={false}
      shortcuts={translatedShortcuts}
      selectedShortcutIndex={
        selectedShortcutIndex >= 0 ? selectedShortcutIndex : undefined
      }
      initialMonth={getInitialMonth(range)}
      onChange={handleChange}
    />
  )
}

export default injectIntl(StatsDateRangePicker)
