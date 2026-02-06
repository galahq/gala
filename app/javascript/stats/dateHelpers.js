/* @flow */

export function parseLocalDate (dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatLocalDate (date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDate (dateStr: ?string, locale: string = 'en-US'): string {
  if (!dateStr) return ''
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
  const date = isDateOnly ? parseLocalDate(dateStr) : new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

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

export function getTodayIso (): string {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function validateDateRange (
  from: ?string,
  to: ?string,
  publishedAt: ?string,
  today: string
): { from: ?string, to: ?string } {
  let validFrom = from
  let validTo = to

  if (validFrom && publishedAt && validFrom < publishedAt) {
    validFrom = publishedAt
  }

  if (validFrom && validTo && validFrom > validTo) {
    validTo = validFrom
  }

  if (validTo && validTo > today) {
    validTo = today
  }

  return { from: validFrom, to: validTo }
}
