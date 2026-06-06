/*  */

let bridgeLoadCount = 0

const loadBridge = async () => {
  vi.resetModules()
  bridgeLoadCount += 1
  await import(/* @vite-ignore */ `../blueprintLegacyNamespace.js?test=${bridgeLoadCount}`)
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
    expect(button.classList.contains('bp6-button')).toBe(true)
    expect(button.classList.contains('bp6-intent-primary')).toBe(true)
  })

  it('does not duplicate matching Blueprint 6 classes', async () => {
    document.body.innerHTML =
      '<button class="pt-button bp6-button">Save</button>'

    await loadBridge()

    const button = document.querySelector('button')
    expect(
      Array.from(button.classList).filter(className => className === 'bp6-button')
    ).toHaveLength(1)
  })

  it('mirrors Rails-rendered legacy classes to Blueprint 6', async () => {
    document.body.innerHTML = `
      <div class="Toolbar__bar"><button class="pt-button"></button></div>
      <div class="window-admin"><button class="pt-button"></button></div>
      <div class="window admin"><button class="pt-button"></button></div>
    `

    await loadBridge()

    document.querySelectorAll('button').forEach(button => {
      expect(button.classList.contains('pt-button')).toBe(true)
      expect(button.classList.contains('bp6-button')).toBe(true)
    })
  })

  it('mirrors Blueprint 4 classes to Blueprint 6', async () => {
    document.body.innerHTML =
      '<button class="bp4-button bp4-intent-primary">Save</button>'

    await loadBridge()

    const button = document.querySelector('button')
    expect(button.classList.contains('bp4-button')).toBe(true)
    expect(button.classList.contains('bp4-intent-primary')).toBe(true)
    expect(button.classList.contains('bp6-button')).toBe(true)
    expect(button.classList.contains('bp6-intent-primary')).toBe(true)
  })

  it('mirrors legacy classes on nodes appended after startup', async () => {
    const notifyMutation = installMutationObserverMock()
    await loadBridge()

    const button = document.createElement('button')
    button.className = 'pt-button'
    document.body.appendChild(button)

    notifyMutation([{ type: 'childList', addedNodes: [button] }])

    expect(button.classList.contains('pt-button')).toBe(true)
    expect(button.classList.contains('bp6-button')).toBe(true)
  })

  it('mirrors legacy classes added after startup', async () => {
    const notifyMutation = installMutationObserverMock()
    document.body.innerHTML = '<button>Save</button>'
    await loadBridge()

    const button = document.querySelector('button')
    button.classList.add('pt-intent-primary')

    notifyMutation([{ type: 'attributes', target: button }])

    expect(button.classList.contains('pt-intent-primary')).toBe(true)
    expect(button.classList.contains('bp6-intent-primary')).toBe(true)
  })
})
