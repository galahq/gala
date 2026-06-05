/* eslint-disable no-console */
import posthog from 'posthog-js'

const DEFAULT_API_HOST = 'https://us.i.posthog.com'

function parseConfig () {
  const hasWindow = typeof window !== 'undefined'
  const config = hasWindow && window.POSTHOG_CONFIG ? window.POSTHOG_CONFIG : {}
  const enabled = config.enabled === true || config.enabled === 'true'
  const apiKey = config.apiKey
  const apiHost = config.apiHost || DEFAULT_API_HOST

  return {
    enabled,
    apiKey,
    apiHost,
  }
}

function setWindowPosthogClient (client) {
  if (typeof window !== 'undefined') {
    window.posthog = client
  }
}

function getWindowPosthogClient () {
  if (typeof window === 'undefined') return null
  return window.posthog || null
}

export function isPosthogEnabled () {
  const config = parseConfig()
  const client = getWindowPosthogClient()

  return (
    config.enabled &&
    client != null &&
    typeof client.capture === 'function'
  )
}

export function initPosthogAnalytics () {
  const config = parseConfig()

  if (!config.enabled) return false
  if (typeof config.apiKey !== 'string' || config.apiKey.length === 0) return false

  try {
    posthog.init(config.apiKey, {
      api_host: config.apiHost || DEFAULT_API_HOST,
      defaults: '2026-01-30',
      persistence: 'memory',
    })
    setWindowPosthogClient(posthog)
    return true
  } catch (error) {
    console.error('PostHog initialization failed', error)
    return false
  }
}

function currentReaderTraits (reader = {}) {
  const traits = {}
  if (reader.email) traits.email = reader.email
  if (reader.name) traits.name = reader.name
  if (reader.image_url || reader.imageUrl) traits.image_url = reader.image_url || reader.imageUrl
  if (reader.hash_key || reader.hashKey) traits.hash_key = reader.hash_key || reader.hashKey
  if (reader.persona) traits.persona = reader.persona
  if (reader.roles) traits.roles = reader.roles

  return traits
}

export function identifyReader (reader) {
  if (!isPosthogEnabled() || !reader) return
  if (reader.id == null) return

  const posthogClient = getWindowPosthogClient()
  posthogClient.identify(String(reader.id), currentReaderTraits(reader))
}

export function trackEvent (name, properties = {}) {
  if (typeof window !== 'undefined' && window.ahoy && typeof window.ahoy.track === 'function') {
    window.ahoy.track(name, properties)
  }

  if (!isPosthogEnabled()) return

  const posthogClient = getWindowPosthogClient()
  if (!posthogClient || typeof posthogClient.capture !== 'function') return

  posthogClient.capture(name, properties)
}
