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

export function getUrlParams (): { from: ?string, to: ?string } {
  const params = new URLSearchParams(window.location.search)
  return {
    from: params.get('from'),
    to: params.get('to'),
  }
}
