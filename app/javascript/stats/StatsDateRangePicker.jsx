/* @flow */

import React, { useMemo } from 'react'
import { DateRangePicker } from '@blueprintjs/datetime'

type Props = {
  minDate: Date,
  maxDate: Date,
  value: [Date | null, Date | null],
  onRangeChange: (from: ?Date, to: ?Date) => void,
  formatLocalDate: (date: Date) => string,
  t: (key: string) => string,
  className?: string,
}

function StatsDateRangePicker ({
  minDate,
  maxDate,
  value,
  onRangeChange,
  formatLocalDate,
  t,
  className,
}: Props): React$Node {
  const today = new Date(maxDate)
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const startFromDays = (days: number): Date => {
    return new Date(
      endOfDay.getFullYear(),
      endOfDay.getMonth(),
      endOfDay.getDate() - days + 1
    )
  }

  const shortcuts = useMemo(() => ([
    {
      label: t('date_range_all_time'),
      dateRange: [minDate, endOfDay],
    },
    {
      label: t('date_range_past_7_days'),
      dateRange: [startFromDays(7), endOfDay],
    },
    {
      label: t('date_range_past_30_days'),
      dateRange: [startFromDays(30), endOfDay],
    },
    {
      label: t('date_range_past_year'),
      dateRange: [startFromDays(365), endOfDay],
    },
    {
      label: t('date_range_past_2_years'),
      dateRange: [startFromDays(730), endOfDay],
    },
  ]), [t, minDate, endOfDay])

  const selectedShortcutIndex = useMemo(() => {
    const [currentFrom, currentTo] = value
    if (!currentFrom || !currentTo) return -1

    const currentFromIso = formatLocalDate(currentFrom)
    const currentToIso = formatLocalDate(currentTo)

    return shortcuts.findIndex(shortcut => {
      const [shortcutFrom, shortcutTo] = shortcut.dateRange
      return (
        formatLocalDate(shortcutFrom) === currentFromIso &&
        formatLocalDate(shortcutTo) === currentToIso
      )
    })
  }, [value, shortcuts])

  const activeShortcutClass =
    selectedShortcutIndex >= 0
      ? `c-stats-date-shortcut-active-${selectedShortcutIndex}`
      : ''

  const pickerClassName = [className, activeShortcutClass].filter(Boolean).join(' ')

  return (
    <DateRangePicker
      className={pickerClassName}
      value={value}
      minDate={minDate}
      maxDate={maxDate}
      allowSingleDayRange={true}
      singleMonthOnly={false}
      contiguousCalendarMonths={false}
      shortcuts={shortcuts}
      onChange={nextRange => onRangeChange(nextRange[0], nextRange[1])}
    />
  )
}

export default StatsDateRangePicker
