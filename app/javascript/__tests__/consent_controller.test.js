import ConsentController from 'controllers/consent_controller'

// Stimulus's constructor wants a context this test has no use for, so the
// methods are exercised against the real prototype.
const build = () => Object.create(ConsentController.prototype)

const cookie = name =>
  document.cookie
    .split('; ')
    .find(pair => pair.startsWith(`${name}=`))

describe('the consent controller', () => {
  let reload

  beforeEach(() => {
    reload = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { protocol: 'https:', reload },
      writable: true,
      configurable: true,
    })
    document.cookie = 'gala_consent=; path=/; max-age=0'
    document.cookie = 'gala_consent_reopen=; path=/; max-age=0'
  })

  afterEach(() => {
    delete window.ahoy
  })

  it('remembers a yes and reloads so the server renders the consented page', () => {
    build().accept()

    expect(cookie('gala_consent')).toBe('gala_consent=granted')
    expect(reload).toHaveBeenCalled()
  })

  // Someone who had accepted may have maps mounted and Ahoy running, and only
  // a fresh render takes the Mapbox token away and adds the footer link.
  it('remembers a no and reloads', () => {
    build().decline()

    expect(cookie('gala_consent')).toBe('gala_consent=denied')
    expect(reload).toHaveBeenCalled()
  })

  // Withdrawing has to remove what was already stored, not only stop more
  // being stored.
  it('clears the cookies Ahoy already set when the visitor withdraws', () => {
    const reset = vi.fn()
    window.ahoy = { reset }

    build().decline()

    expect(reset).toHaveBeenCalled()
  })

  it('does not throw when ahoy is not on the page', () => {
    expect(() => build().decline()).not.toThrow()
  })

  // The bug this replaced: reopen used to delete the decision, so clicking
  // "Cookie Choices" merely to look silently un-consented you, and navigating
  // away left you unanswered.
  it('reopens the question without withdrawing the answer', () => {
    document.cookie = 'gala_consent=granted; path=/'
    const preventDefault = vi.fn()

    build().reopen({ preventDefault })

    expect(preventDefault).toHaveBeenCalled()
    expect(cookie('gala_consent')).toBe('gala_consent=granted')
    expect(cookie('gala_consent_reopen')).toBe('gala_consent_reopen=1')
    expect(reload).toHaveBeenCalled()
  })

  it('stops reopening once the visitor answers again', () => {
    document.cookie = 'gala_consent_reopen=1; path=/'

    build().accept()

    expect(cookie('gala_consent_reopen')).toBeUndefined()
  })
})
