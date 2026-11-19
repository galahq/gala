import { Orchard, OrchardError } from 'shared/orchard'
import edit from 'redux/reducers/edit'
import { deleteLock, deleteEnqueuedLocks } from '../lock'

const failure = status =>
  new OrchardError({ status, statusText: 'Nope', url: '/locks/42' })

const ours = { param: '42', reader: { param: '1' }}

function storeWith ({ locks, queue }) {
  let state = {
    locks,
    caseData: { reader: { id: 1 }},
    edit: { locksToDelete: queue },
  }
  const dispatched = []
  const dispatch = action => {
    if (typeof action === 'function') return action(dispatch, () => state)
    dispatched.push(action.type)
    if (action.type === 'REMOVE_LOCK') {
      const locks = { ...state.locks }
      Object.keys(locks).forEach(gid => {
        if (locks[gid].param === action.param) delete locks[gid]
      })
      state = { ...state, locks }
    }
    state = { ...state, edit: edit(state.edit, action) }
  }
  return { dispatch, getState: () => state, dispatched }
}

describe('deleteLock', () => {
  afterEach(() => vi.restoreAllMocks())

  it('forgets the lock once the server releases it', async () => {
    vi.spyOn(Orchard, 'prune').mockResolvedValue()
    const store = storeWith({ locks: { 'Card/7': ours }, queue: ['Card/7'] })

    await deleteLock('Card', '7')(store.dispatch, store.getState)

    expect(Orchard.prune).toHaveBeenCalledWith('locks/42')
    expect(store.getState().locks).toEqual({})
    expect(store.getState().edit.locksToDelete).toEqual([])
  })

  it.each([404, 401, 403])('stops retrying after an expected %i', async status => {
    vi.spyOn(Orchard, 'prune').mockRejectedValue(failure(status))
    const store = storeWith({ locks: { 'Card/7': ours }, queue: ['Card/7'] })

    await deleteLock('Card', '7')(store.dispatch, store.getState)

    expect(store.getState().edit.locksToDelete).toEqual([])
  })

  it('keeps the lock queued when releasing fails unexpectedly', async () => {
    vi.spyOn(Orchard, 'prune').mockRejectedValue(failure(500))
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const store = storeWith({ locks: { 'Card/7': ours }, queue: ['Card/7'] })

    await deleteLock('Card', '7')(store.dispatch, store.getState)

    expect(store.getState().edit.locksToDelete).toEqual(['Card/7'])
    expect(error).toHaveBeenCalled()
  })

  it('never dequeues another lock when this one was not queued', async () => {
    vi.spyOn(Orchard, 'prune').mockRejectedValue(failure(404))
    const store = storeWith({
      locks: { 'Card/7': ours, 'Page/3': { param: '43', reader: { param: '1' }}},
      queue: ['Page/3'],
    })

    await deleteLock('Card', '7')(store.dispatch, store.getState)

    expect(store.getState().edit.locksToDelete).toEqual(['Page/3'])
  })

  it('dequeues a lock this tab no longer has, without asking the server', async () => {
    vi.spyOn(Orchard, 'prune')
    const store = storeWith({ locks: {}, queue: ['Card/7'] })

    await deleteLock('Card', '7')(store.dispatch, store.getState)

    expect(Orchard.prune).not.toHaveBeenCalled()
    expect(store.getState().edit.locksToDelete).toEqual([])
  })
})

describe('deleteEnqueuedLocks', () => {
  afterEach(() => vi.restoreAllMocks())

  it('drops queued locks that have vanished and releases the rest', async () => {
    vi.spyOn(Orchard, 'prune').mockResolvedValue()
    const store = storeWith({ locks: { 'Page/3': ours }, queue: ['Card/7', 'Page/3'] })

    expect(() => deleteEnqueuedLocks()(store.dispatch, store.getState)).not.toThrow()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(Orchard.prune).toHaveBeenCalledTimes(1)
    expect(store.getState().edit.locksToDelete).toEqual([])
  })
})
