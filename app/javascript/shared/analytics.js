export function identifyReader (reader) {
  if (typeof window === 'undefined' || !reader || reader.id == null) return
  if (!window.Sentry || typeof window.Sentry.setUser !== 'function') return

  const user = { id: String(reader.id) }
  if (reader.email) user.email = reader.email
  if (reader.name) user.username = reader.name
  if (reader.persona) user.persona = reader.persona
  if (reader.roles) user.roles = reader.roles

  window.Sentry.setUser(user)
}

export function trackEvent (name, properties = {}) {
  if (typeof window !== 'undefined' && window.ahoy && typeof window.ahoy.track === 'function') {
    window.ahoy.track(name, properties)
  }

  if (typeof window !== 'undefined' && typeof window.sentryLog === 'function') {
    window.sentryLog('info', `analytics.${name}`, properties)
  }
}
