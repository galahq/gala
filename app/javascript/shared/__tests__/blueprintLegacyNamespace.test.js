/*  */

const bridgePath = '../blueprintLegacyNamespace'

// Re-execute the bridge's import-time side effects. Under Vitest (ESM) this
// needs vi.resetModules() + dynamic import rather than jest.resetModules() +
// require(), which would return the cached module without re-running it.
const loadBridge = async () => {
  vi.resetModules()
  await import(bridgePath)
}

const installMutationObserverMock = () => {
  let callback

  global.MutationObserver = vi.fn(function MutationObserverMock(observer) {
    callback = observer
    this.observe = vi.fn()
  })

  return mutations => callback(mutations)
}

describe('blueprintLegacyNamespace', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    delete global.MutationObserver
  })

  it('mirrors legacy classes on existing DOM nodes without removing them', async () => {
    document.body.innerHTML =
      '<button class="pt-button pt-intent-primary">Save</button>'

    await loadBridge()

    const button = document.querySelector('button')
    expect(button.classList.contains('pt-button')).toBe(true)
    expect(button.classList.contains('pt-intent-primary')).toBe(true)
    expect(button.classList.contains('bp4-button')).toBe(true)
    expect(button.classList.contains('bp4-intent-primary')).toBe(true)
  })

  it('does not duplicate matching Blueprint 4 classes', async () => {
    document.body.innerHTML =
      '<button class="pt-button bp4-button">Save</button>'

    await loadBridge()

    const button = document.querySelector('button')
    expect(
      Array.from(button.classList).filter(className => className === 'bp4-button')
    ).toHaveLength(1)
  })

  it('does not mirror classes inside Rails-rendered legacy exclusions', async () => {
    document.body.innerHTML = `
      <div class="Toolbar__bar"><button class="pt-button"></button></div>
      <div class="window-admin"><button class="pt-button"></button></div>
      <div class="window admin"><button class="pt-button"></button></div>
    `

    await loadBridge()

    document.querySelectorAll('button').forEach(button => {
      expect(button.classList.contains('pt-button')).toBe(true)
      expect(button.classList.contains('bp4-button')).toBe(false)
    })
  })

  it('mirrors legacy classes on nodes appended after startup', async () => {
    const notifyMutation = installMutationObserverMock()
    await loadBridge()

    const button = document.createElement('button')
    button.className = 'pt-button'
    document.body.appendChild(button)

    notifyMutation([{ type: 'childList', addedNodes: [button] }])

    expect(button.classList.contains('pt-button')).toBe(true)
    expect(button.classList.contains('bp4-button')).toBe(true)
  })

  it('mirrors legacy classes added after startup', async () => {
    const notifyMutation = installMutationObserverMock()
    document.body.innerHTML = '<button>Save</button>'
    await loadBridge()

    const button = document.querySelector('button')
    button.classList.add('pt-intent-primary')

    notifyMutation([{ type: 'attributes', target: button }])

    expect(button.classList.contains('pt-intent-primary')).toBe(true)
    expect(button.classList.contains('bp4-intent-primary')).toBe(true)
  })
})
