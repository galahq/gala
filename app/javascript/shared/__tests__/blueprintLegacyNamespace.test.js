/* @noflow */

const bridgePath = '../blueprintLegacyNamespace'

const loadBridge = () => {
  jest.resetModules()
  require(bridgePath)
}

const nextMutationTick = () =>
  new Promise(resolve => {
    setTimeout(resolve, 0)
  })

describe('blueprintLegacyNamespace', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('mirrors legacy classes on existing DOM nodes without removing them', () => {
    document.body.innerHTML =
      '<button class="pt-button pt-intent-primary">Save</button>'

    loadBridge()

    const button = document.querySelector('button')
    expect(button.classList.contains('pt-button')).toBe(true)
    expect(button.classList.contains('pt-intent-primary')).toBe(true)
    expect(button.classList.contains('bp4-button')).toBe(true)
    expect(button.classList.contains('bp4-intent-primary')).toBe(true)
  })

  it('does not duplicate matching Blueprint 4 classes', () => {
    document.body.innerHTML =
      '<button class="pt-button bp4-button">Save</button>'

    loadBridge()

    const button = document.querySelector('button')
    expect(
      Array.from(button.classList).filter(className => className === 'bp4-button')
    ).toHaveLength(1)
  })

  it('does not mirror classes inside Rails-rendered legacy exclusions', () => {
    document.body.innerHTML = `
      <div class="Toolbar__bar"><button class="pt-button"></button></div>
      <div class="window-admin"><button class="pt-button"></button></div>
      <div class="window admin"><button class="pt-button"></button></div>
    `

    loadBridge()

    document.querySelectorAll('button').forEach(button => {
      expect(button.classList.contains('pt-button')).toBe(true)
      expect(button.classList.contains('bp4-button')).toBe(false)
    })
  })

  it('mirrors legacy classes on nodes appended after startup', async () => {
    loadBridge()

    const button = document.createElement('button')
    button.className = 'pt-button'
    document.body.appendChild(button)

    await nextMutationTick()

    expect(button.classList.contains('pt-button')).toBe(true)
    expect(button.classList.contains('bp4-button')).toBe(true)
  })

  it('mirrors legacy classes added after startup', async () => {
    document.body.innerHTML = '<button>Save</button>'
    loadBridge()

    const button = document.querySelector('button')
    button.classList.add('pt-intent-primary')

    await nextMutationTick()

    expect(button.classList.contains('pt-intent-primary')).toBe(true)
    expect(button.classList.contains('bp4-intent-primary')).toBe(true)
  })
})
