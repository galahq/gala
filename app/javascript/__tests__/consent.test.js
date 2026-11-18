import { trackingAllowed } from 'shared/consent'

describe('trackingAllowed', () => {
  afterEach(() => {
    delete window.GALA_CONSENT
  })

  it('allows a visitor who was never asked', () => {
    window.GALA_CONSENT = { required: false, granted: true }

    expect(trackingAllowed()).toBe(true)
  })

  it('allows a visitor who accepted', () => {
    window.GALA_CONSENT = { required: true, granted: true }

    expect(trackingAllowed()).toBe(true)
  })

  it('refuses a visitor who has not answered', () => {
    window.GALA_CONSENT = { required: true, granted: false }

    expect(trackingAllowed()).toBe(false)
  })

  // Only the print layout renders no flag, and it loads no JavaScript, so
  // there is nothing to gate there. Defaulting the other way would blank the
  // maps on any page that ever lost the flag.
  it('allows when no flag was rendered at all', () => {
    expect(trackingAllowed()).toBe(true)
  })
})
