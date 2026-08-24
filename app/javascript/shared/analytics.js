export function trackEvent (name, properties = {}) {
  if (typeof window !== 'undefined' && window.ahoy && typeof window.ahoy.track === 'function') {
    window.ahoy.track(name, properties)
  }
}
