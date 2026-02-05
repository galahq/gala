/**
 * @flow
 * Pure utility functions for stats feature
 */

/**
 * Parse a date string (YYYY-MM-DD) as local date to avoid timezone issues
 * new Date("2026-01-30") parses as UTC midnight, which can display as the wrong day in western timezones
 */
export function parseLocalDate (dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Format a Date object as YYYY-MM-DD using local time components
 * Avoids timezone issues that occur with toISOString() which converts to UTC
 */
export function formatLocalDate (date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Sync date range to URL query parameters
 * Updates the URL without reloading the page
 */
export function syncUrlParams (from: ?string, to: ?string): void {
  const url = new URL(window.location.href)
  const params = url.searchParams

  if (from) {
    params.set('from', from)
  } else {
    params.delete('from')
  }

  if (to) {
    params.set('to', to)
  } else {
    params.delete('to')
  }

  window.history.replaceState({}, '', `${url.pathname}?${params.toString()}`)
}

/**
 * Get current date range from URL query parameters
 */
export function getUrlParams (): { from: ?string, to: ?string } {
  const params = new URLSearchParams(window.location.search)
  return {
    from: params.get('from'),
    to: params.get('to'),
  }
}

/**
 * Format a date string for display
 */
export function formatDate (dateStr: ?string, locale: string = 'en-US'): string {
  if (!dateStr) return ''
  // Use parseLocalDate to avoid timezone issues with new Date(string)
  return parseLocalDate(dateStr).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format a date range for display
 * Returns empty string if both dates are missing
 */
export function formatDateRange (
  from: ?string,
  to: ?string,
  locale: string = 'en-US'
): string {
  if (!from && !to) return ''
  const fromFormatted = formatDate(from, locale)
  const toFormatted = formatDate(to, locale)
  if (fromFormatted && toFormatted) {
    return `${fromFormatted} - ${toFormatted}`
  }
  return fromFormatted || toFormatted || ''
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayIso (): string {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Validate and constrain date range values
 * Returns corrected from/to values based on constraints:
 * - from >= publishedAt
 * - from <= to
 * - to <= today
 */
export function validateDateRange (
  from: ?string,
  to: ?string,
  publishedAt: ?string,
  today: string
): { from: ?string, to: ?string } {
  let validFrom = from
  let validTo = to

  // Constrain from date to be >= publishedAt
  if (validFrom && publishedAt && validFrom < publishedAt) {
    validFrom = publishedAt
  }

  // Constrain from date to be <= to date
  if (validFrom && validTo && validFrom > validTo) {
    validTo = validFrom
  }

  // Constrain to date to be <= today
  if (validTo && validTo > today) {
    validTo = today
  }

  return { from: validFrom, to: validTo }
}
