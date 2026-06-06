import posthog from 'posthog-js'
import * as analytics from '../analytics'

const posthogMock = vi.hoisted(() => ({
  init: vi.fn(),
  identify: vi.fn(),
  capture: vi.fn(),
}))

vi.mock('posthog-js', () => ({
  default: posthogMock,
  ...posthogMock,
}))

describe('analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete window.POSTHOG_CONFIG
    delete window.posthog
    delete window.ahoy
  })

  it('does not initialize PostHog without an enabled config and API key', () => {
    window.POSTHOG_CONFIG = { enabled: true, apiKey: '' }

    expect(analytics.initPosthogAnalytics()).toBe(false)
    expect(posthog.init).not.toHaveBeenCalled()
    expect(window.posthog).toBeUndefined()
  })

  it('initializes PostHog from window config', () => {
    window.POSTHOG_CONFIG = {
      enabled: true,
      apiKey: 'ph_project_key',
      apiHost: 'https://posthog.example',
    }

    expect(analytics.initPosthogAnalytics()).toBe(true)

    expect(posthog.init).toHaveBeenCalledWith('ph_project_key', {
      api_host: 'https://posthog.example',
      defaults: '2026-01-30',
      persistence: 'memory',
    })
    expect(window.posthog).toBe(posthog)
  })

  it('dual-writes tracked events to Ahoy and PostHog when enabled', () => {
    window.POSTHOG_CONFIG = {
      enabled: true,
      apiKey: 'ph_project_key',
      stage: 'dev',
      eventNamespace: 'dev->> ',
    }
    window.ahoy = { track: vi.fn() }
    analytics.initPosthogAnalytics()

    analytics.trackEvent('read_overview', { duration: 3000 })

    expect(window.ahoy.track).toHaveBeenCalledWith('read_overview', {
      duration: 3000,
    })
    expect(posthog.capture).toHaveBeenCalledWith('dev->> read_overview', {
      duration: 3000,
      sst_stage: 'dev',
    })
  })

  it('preserves Ahoy tracking when PostHog is disabled', () => {
    window.POSTHOG_CONFIG = { enabled: false, apiKey: 'ph_project_key' }
    window.ahoy = { track: vi.fn() }

    analytics.trackEvent('read_card', { card_id: 12 })

    expect(window.ahoy.track).toHaveBeenCalledWith('read_card', {
      card_id: 12,
    })
    expect(posthog.capture).not.toHaveBeenCalled()
  })

  it('identifies signed-in readers with stable traits', () => {
    window.POSTHOG_CONFIG = { enabled: true, apiKey: 'ph_project_key' }
    analytics.initPosthogAnalytics()

    analytics.identifyReader({
      id: 42,
      email: 'reader@example.test',
      name: 'Reader Example',
      imageUrl: '/reader.png',
      hashKey: 'reader-hash',
      persona: 'teacher',
      roles: { editor: false },
    })

    expect(posthog.identify).toHaveBeenCalledWith('42', {
      email: 'reader@example.test',
      name: 'Reader Example',
      image_url: '/reader.png',
      hash_key: 'reader-hash',
      persona: 'teacher',
      roles: { editor: false },
    })
  })
})
