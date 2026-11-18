import { Orchard, OrchardError } from 'shared/orchard'
import { deleteLock } from '../lock'

describe('deleteLock', () => {
  const state = { locks: { 'Card/7': { param: '42', reader: { param: '1' }}}}
  const failure = status =>
    new OrchardError({ status, statusText: 'Nope', url: '/locks/42' })

  async function release (prune) {
    vi.spyOn(Orchard, 'prune').mockImplementation(prune)
    const dispatch = vi.fn()
    deleteLock('Card', '7')(dispatch, () => state)
    await new Promise(resolve => setTimeout(resolve, 0))
    return dispatch.mock.calls.map(([action]) => action.type)
  }

  afterEach(() => vi.restoreAllMocks())

  it('forgets the lock once the server releases it', async () => {
    const types = await release(() => Promise.resolve())

    expect(Orchard.prune).toHaveBeenCalledWith('locks/42')
    expect(types).toEqual(['REMOVE_LOCK', 'REMOVE_LOCK_FROM_DELETION_QUEUE'])
  })

  it('forgets a lock the server has already removed, so it is not retried', async () => {
    const types = await release(() => Promise.reject(failure(404)))

    expect(types).toEqual(['REMOVE_LOCK', 'REMOVE_LOCK_FROM_DELETION_QUEUE'])
  })

  it('keeps the lock queued when releasing it fails for another reason', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    const types = await release(() => Promise.reject(failure(500)))

    expect(types).toEqual([])
    expect(error).toHaveBeenCalled()
  })
})
