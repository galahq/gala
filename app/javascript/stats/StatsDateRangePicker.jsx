/* @flow */

import React, { useEffect, useMemo } from 'react'
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
    const initialMonth = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1)

    // Clamp initialMonth to be within minDate and maxDate bounds
    const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
    const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)

    if (initialMonth < minMonth) return minMonth
    if (initialMonth > maxMonth) return maxMonth
    return initialMonth
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

  useEffect(() => {
    const syncShortcutActiveClass = () => {
      const items = document.querySelectorAll('.pt-daterangepicker-shortcuts .pt-menu-item')
      if (!items || items.length === 0) return

      items.forEach((item, index) => {
        if (index === selectedShortcutIndex) {
          item.classList.add('active')
        } else {
          item.classList.remove('active')
        }
      })
    }

    syncShortcutActiveClass()
    const timeoutId = window.setTimeout(syncShortcutActiveClass, 0)
    const observer = typeof window.MutationObserver === 'function'
      ? new window.MutationObserver(syncShortcutActiveClass)
      : null

    if (observer) {
      observer.observe(document.body, { childList: true, subtree: true })
    }

    return () => {
      window.clearTimeout(timeoutId)
      if (observer) observer.disconnect()
    }
  }, [selectedShortcutIndex, translatedShortcuts.length, value])

  function handleChange (nextRange) {
    if (onRangeChange) {
      onRangeChange(nextRange[0], nextRange[1])
    }
  }

  return (
    <DateRangePicker
      className={className}
      value={value}
      minDate={minDate}
      maxDate={maxDate}
      allowSingleDayRange={true}
      contiguousCalendarMonths={false}
      shortcuts={translatedShortcuts}
      selectedShortcutIndex={
        selectedShortcutIndex >= 0 ? selectedShortcutIndex : undefined
      }
      initialMonth={getInitialMonth(value)}
      onChange={handleChange}
    />
  )
}

export default injectIntl(StatsDateRangePicker)
