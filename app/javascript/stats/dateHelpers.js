/*  */

export function parseLocalDate (dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatLocalDate (date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDate (dateStr, locale = 'en-US') {
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
  from,
  to,
  locale = 'en-US'
) {
  if (!from && !to) return ''
  const fromFormatted = formatDate(from, locale)
  const toFormatted = formatDate(to, locale)
  if (fromFormatted && toFormatted) {
    return `${fromFormatted} - ${toFormatted}`
  }
  return fromFormatted || toFormatted || ''
}

export function getTodayIso () {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function validateDateRange (
  from,
  to,
  minDate,
  today
) {
  let validFrom = from
  let validTo = to

  if (validFrom && minDate && validFrom < minDate) {
    validFrom = minDate
  }

  if (validFrom && validTo && validFrom > validTo) {
    validTo = validFrom
  }

  if (validTo && validTo > today) {
    validTo = today
  }

  return { from: validFrom, to: validTo }
}
