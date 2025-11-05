/* @flow */

import React, { useEffect, useState } from 'react'
import { DateRangePicker } from '@blueprintjs/datetime'
import { injectIntl } from 'react-intl'

// We rely on Blueprint v2 <DateRangePicker>. The page already loads Blueprint
// styles via the main styles pack.

// Props:
// - minDate: Date for earliest selectable day (case published_at)
// - maxDate: Date for latest selectable day (usually today)
// - fromInputId / toInputId: ids of hidden inputs that control the Stimulus map
//   controller. We update their ISO8601 (YYYY-MM-DD) value on each change.
function StatsDateRangePicker ({
  minDate: minDateProp,
  maxDate: maxDateProp,
  fromInputId = 'stats-from',
  toInputId = 'stats-to',
  shortcuts,
  initialRange,
  initialShortcutIndex,
  className,
  intl,
}) {
  const minDate = minDateProp || new Date(2000, 0, 1)
  const maxDate = maxDateProp || new Date()

  // Create shortcuts with translated labels
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

  // Determine which shortcut matches the current range
  const getSelectedShortcutIndex = (currentRange, shortcutsList) => {
    if (!currentRange || !shortcutsList || !Array.isArray(shortcutsList)) {
      return -1
    }

    const [currentFrom, currentTo] = currentRange
    const toIso = d => (d ? d.toISOString().slice(0, 10) : '')

    for (let i = 0; i < shortcutsList.length; i++) {
      const [shortcutFrom, shortcutTo] = shortcutsList[i].dateRange
      if (
        toIso(shortcutFrom) === toIso(currentFrom) &&
        toIso(shortcutTo) === toIso(currentTo)
      ) {
        return i
      }
    }
    return -1
  }

  // Calculate which shortcut matches the current range (-1 if none match)
  const selectedShortcutIndex = getSelectedShortcutIndex(range, translatedShortcuts)

  function updateHiddenInputs (nextRange) {
    const [from, to] = nextRange
    const fromIso = from ? from.toISOString().slice(0, 10) : ''
    const toIso = to ? to.toISOString().slice(0, 10) : ''

    const fromInput = document.getElementById(fromInputId)
    const toInput = document.getElementById(toInputId)
    if (fromInput) fromInput.value = fromIso
    if (toInput) toInput.value = toIso
  }

  function handleChange (nextRange) {
    // If nextRange matches one of our shortcuts by day, use the exact
    // Date objects from the shortcut so Blueprint can keep it highlighted.
    let applied = nextRange
    const toIso = d => (d ? d.toISOString().slice(0, 10) : '')
    const [nf, nt] = nextRange
    const nfIso = toIso(nf)
    const ntIso = toIso(nt)
    for (let i = 0; i < translatedShortcuts.length; i++) {
      const [sf, st] = translatedShortcuts[i].dateRange
      if (toIso(sf) === nfIso && toIso(st) === ntIso) {
        applied = translatedShortcuts[i].dateRange
        break
      }
    }
    setRange(applied)
    updateHiddenInputs(applied)
    document.dispatchEvent(new CustomEvent('stats-range-changed'))
  }

  // Initialize hidden inputs on first mount so initial fetch works
  useEffect(() => {
    updateHiddenInputs(range)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Manually apply pt-active class to the selected shortcut since BlueprintJS v2 doesn't do it
  // Only applies when a shortcut is actually selected (not custom date range)
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
      contiguousCalendarMonths={true}
      shortcuts={translatedShortcuts}
      selectedShortcutIndex={
        selectedShortcutIndex >= 0 ? selectedShortcutIndex : undefined
      }
      dayPickerProps={{ numberOfMonths: 2 }}
      onChange={handleChange}
    />
  )
}

export default injectIntl(StatsDateRangePicker)
