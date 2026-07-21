import React from 'react'
import { FormattedRelativeTime } from 'react-intl'

const unitOrder = ['year', 'month', 'day', 'hour', 'minute', 'second']

function estimateRelativeUnit (seconds) {
  const absSeconds = Math.abs(seconds)

  if (absSeconds < 60) {
    return { unit: 'second', value: seconds }
  }

  if (absSeconds < 3600) {
    return { unit: 'minute', value: Math.round(seconds / 60) }
  }

  if (absSeconds < 3600 * 24) {
    return { unit: 'hour', value: Math.round(seconds / 3600) }
  }

  if (absSeconds < 3600 * 24 * 30) {
    return { unit: 'day', value: Math.round(seconds / (3600 * 24)) }
  }

  if (absSeconds < 3600 * 24 * 365) {
    return { unit: 'month', value: Math.round(seconds / (3600 * 24 * 30)) }
  }

  return { unit: 'year', value: Math.round(seconds / (3600 * 24 * 365)) }
}

function normalizeRelativeDate (dateLike) {
  const dateValue = new Date(dateLike).getTime()
  return Math.round((dateValue - Date.now()) / 1000)
}

/**
 * Compatibility shim for react-intl v2's <FormattedRelative date={...} />, which
 * was removed in v3+. Wraps <FormattedRelativeTime value unit />. Accepts either
 * an explicit { value, unit } pair or a legacy date-like `value` that is
 * converted to a relative (value, unit) estimate.
 */
export function FormattedRelative ({ value, unit, ...props }) {
  if (unit && unitOrder.includes(unit)) {
    return <FormattedRelativeTime value={value} unit={unit} {...props} />
  }

  const rounded = estimateRelativeUnit(normalizeRelativeDate(value))

  return (
    <FormattedRelativeTime
      value={rounded.value}
      unit={rounded.unit}
      {...props}
    />
  )
}
