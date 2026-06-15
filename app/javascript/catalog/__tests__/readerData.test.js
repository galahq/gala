import { hasSerializedReader } from 'catalog/readerData'

describe('hasSerializedReader', () => {
  afterEach(() => {
    delete window.reader
  })

  it('returns false for anonymous catalog pages', () => {
    window.reader = undefined

    expect(hasSerializedReader()).toBe(false)
  })

  it('returns true when the layout serialized a signed-in reader', () => {
    window.reader = { id: 1 }

    expect(hasSerializedReader()).toBe(true)
  })
})
