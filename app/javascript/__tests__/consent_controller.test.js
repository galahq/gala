import ConsentController from 'controllers/consent_controller'

// Stimulus's constructor wants a context this test has no use for, so the
// methods are exercised against the real prototype with a stand-in element.
// `element` is a getter on Stimulus's Controller, so it has to be defined on
// the instance rather than assigned.
const build = () => {
  const controller = Object.create(ConsentController.prototype)
  Object.defineProperty(controller, 'element', {
    value: { remove: vi.fn() },
    configurable: true,
  })
  return controller
}

const cookie = () =>
  document.cookie
    .split('; ')
    .find(pair => pair.startsWith('gala_consent='))

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
  })

  afterEach(() => {
    delete window.ahoy
  })

  it('remembers a yes and reloads so the server renders the consented page', () => {
    build().accept()

    expect(cookie()).toBe('gala_consent=granted')
    expect(reload).toHaveBeenCalled()
  })

  it('remembers a no and takes the banner away', () => {
    const controller = build()
    controller.decline()

    expect(cookie()).toBe('gala_consent=denied')
    expect(controller.element.remove).toHaveBeenCalled()
    expect(reload).not.toHaveBeenCalled()
  })

  // Withdrawing has to remove what was already stored, not only stop more
  // being stored. This is the whole reason decline touches ahoy at all.
  it('clears the cookies Ahoy already set when the visitor withdraws', () => {
    const reset = vi.fn()
    window.ahoy = { reset }

    build().decline()

    expect(reset).toHaveBeenCalled()
  })

  it('does not throw when ahoy is not on the page', () => {
    expect(() => build().decline()).not.toThrow()
  })

  it('forgets the decision when the visitor reopens the question', () => {
    const preventDefault = vi.fn()

    build().reopen({ preventDefault })

    expect(preventDefault).toHaveBeenCalled()
    expect(cookie()).toBeUndefined()
    expect(reload).toHaveBeenCalled()
  })
})
