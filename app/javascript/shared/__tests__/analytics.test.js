import { beforeEach, describe, expect, it, vi } from 'vitest'

import { identifyReader, trackEvent } from '../analytics'

describe('Sentry analytics adapter', () => {
  beforeEach(() => {
    window.Sentry = {
      setUser: vi.fn(),
    }
    window.ahoy = {
      track: vi.fn(),
    }
    window.sentryLog = vi.fn()
  })

  it('identifies the signed-in reader in Sentry', () => {
    identifyReader({
      id: 42,
      email: 'reader@example.test',
      name: 'Reader Example',
      persona: 'teacher',
      roles: { editor: false },
    })

    expect(window.Sentry.setUser).toHaveBeenCalledWith({
      id: '42',
      email: 'reader@example.test',
      username: 'Reader Example',
      persona: 'teacher',
      roles: { editor: false },
    })
  })

  it('records product events in Ahoy and Sentry', () => {
    trackEvent('read_card', { card_id: 12 })

    expect(window.ahoy.track).toHaveBeenCalledWith('read_card', {
      card_id: 12,
    })
    expect(window.sentryLog).toHaveBeenCalledWith(
      'info',
      'analytics.read_card',
      { card_id: 12 }
    )
  })
})
