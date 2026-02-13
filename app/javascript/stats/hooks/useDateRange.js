/* @flow */
import { useState, useRef, useCallback, useEffect } from 'react'
import { validateDateRange, formatLocalDate, getTodayIso } from '../dateHelpers'
import { getUrlParams, syncUrlParams } from '../urlParams'

type DateRange = {
  from: ?string,
  to: ?string,
}

type Params = {
  minDate: ?string,
}

type UseDateRangeResult = {
  range: DateRange,
  setFromDates: (from: ?Date, to: ?Date) => void,
}

export function useDateRange ({ minDate }: Params): UseDateRangeResult {
  const [range, setRange] = useState<DateRange>(() => {
    const urlParams = getUrlParams()
    if (urlParams.from || urlParams.to) {
      return {
        from: urlParams.from || null,
        to: urlParams.to || null,
      }
    }
    if (minDate) {
      return { from: minDate, to: getTodayIso() }
    }
    return { from: null, to: null }
  })

  const debounceRef = useRef(null)

  const setFromDates = useCallback((from: ?Date, to: ?Date) => {
    const fromStr = from ? formatLocalDate(from) : null
    const toStr = to ? formatLocalDate(to) : null
    const today = getTodayIso()
    const validated = validateDateRange(fromStr, toStr, minDate, today)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      setRange(validated)
      syncUrlParams(validated.from, validated.to)
    }, 150)
  }, [minDate])

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return { range, setFromDates }
}

export default useDateRange
