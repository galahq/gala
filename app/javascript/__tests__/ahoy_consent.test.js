import fs from 'node:fs'
import path from 'node:path'

// The gate ships as a Sprockets file concatenated after ahoy, not as an ES
// module, so it is executed here the way the browser executes it instead of
// being imported. Reading the real file is the point: a copy of the logic
// would keep passing while the shipped one broke.
const source = fs.readFileSync(
  path.join(process.cwd(), 'app/assets/javascripts/ahoy_consent.js'),
  'utf8'
)

const runGate = ({ consent, ahoy = {}}) => {
  const configure = vi.fn()
  window.GALA_CONSENT = consent
  window.ahoy = 'configure' in ahoy ? ahoy : { ...ahoy, configure }
  // Running the real Sprockets artifact the way the browser runs it is the
  // point of this file, so the Function constructor is deliberate here.
  // eslint-disable-next-line no-new-func
  new Function(source)()
  return configure
}

describe('the Ahoy consent gate', () => {
  afterEach(() => {
    delete window.GALA_CONSENT
    delete window.ahoy
  })

  // startOnReady: false stops createVisit, so no visit is posted and no
  // country is recorded -- that is the whole point. cookies: false stops
  // ahoy_events as well.
  it('takes Ahoy out of the way for a visitor who has not answered', () => {
    const configure = runGate({ consent: { required: true, granted: false }})

    expect(configure).toHaveBeenCalledWith({
      cookies: false,
      startOnReady: false,
    })
  })

  // Defensive, not cleanup: the server has deleted these cookies on every
  // request since ae67f1a2 (May 2018), so there is normally nothing to clear.
  it('resets Ahoy, in case the server is ever set to keep cookies', () => {
    const reset = vi.fn()
    runGate({ consent: { required: true, granted: false }, ahoy: { reset }})

    expect(reset).toHaveBeenCalled()
  })

  it('does not clear them for a visitor who accepted', () => {
    const reset = vi.fn()
    runGate({ consent: { required: true, granted: true }, ahoy: { reset }})

    expect(reset).not.toHaveBeenCalled()
  })

  it('leaves Ahoy alone outside the EU, EEA and UK', () => {
    const configure = runGate({ consent: { required: false, granted: true }})

    expect(configure).not.toHaveBeenCalled()
  })

  it('leaves Ahoy alone once the visitor has accepted', () => {
    const configure = runGate({ consent: { required: true, granted: true }})

    expect(configure).not.toHaveBeenCalled()
  })

  // Belt and braces: a layout that forgot the flag, or a page where ahoy is
  // absent, must not throw and take the rest of the bundle down with it.
  it('does nothing and does not throw when the flag is missing', () => {
    const configure = runGate({ consent: undefined })

    expect(configure).not.toHaveBeenCalled()
  })

  it('does not throw when ahoy is not on the page', () => {
    window.GALA_CONSENT = { required: true, granted: false }
    window.ahoy = undefined

    // eslint-disable-next-line no-new-func
    expect(() => new Function(source)()).not.toThrow()
  })
})
