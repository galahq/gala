/* @flow */

import React, { useEffect, useState } from 'react'
import { DateRangePicker } from '@blueprintjs/datetime'

// We rely on Blueprint v2 <DateRangePicker>. The page already loads Blueprint
// styles via the main styles pack.

// Props:
// - minDate: Date for earliest selectable day (case published_at)
// - maxDate: Date for latest selectable day (usually today)
// - fromInputId / toInputId: ids of hidden inputs that control the Stimulus map
//   controller. We update their ISO8601 (YYYY-MM-DD) value on each change.
export default function StatsDateRangePicker ({
  minDate: minDateProp,
  maxDate: maxDateProp,
  fromInputId = 'stats-from',
  toInputId = 'stats-to',
  shortcuts,
  initialRange,
}) {
  const minDate = minDateProp || new Date(2000, 0, 1)
  const maxDate = maxDateProp || new Date()

  const [range, setRange] = useState(initialRange || [minDate, maxDate])

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
    if (Array.isArray(shortcuts)) {
      const toIso = d => (d ? d.toISOString().slice(0, 10) : '')
      const [nf, nt] = nextRange
      const nfIso = toIso(nf)
      const ntIso = toIso(nt)
      for (let i = 0; i < shortcuts.length; i++) {
        const [sf, st] = shortcuts[i].dateRange
        if (toIso(sf) === nfIso && toIso(st) === ntIso) {
          applied = shortcuts[i].dateRange
          break
        }
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

  return (
    <DateRangePicker
      value={range}
      minDate={minDate}
      maxDate={maxDate}
      allowSingleDayRange={true}
      contiguousCalendarMonths={true}
      shortcuts={shortcuts || true}
      dayPickerProps={{ numberOfMonths: 2 }}
      onChange={handleChange}
    />
  )
}
