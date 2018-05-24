/**
 * @flow
 */

import { Orchard } from 'shared/orchard'
import { lockableGID } from 'redux/reducers/locks'

import type { Lock } from 'redux/state'
import type { Dispatch, GetState, ThunkAction } from 'redux/actions'

export function reloadLocks (): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    Orchard.harvest(`cases/${getState().caseData.slug}/locks`).then(locks =>
      dispatch(setLocks(locks))
    )
  }
}

export type SetLocksAction = { type: 'SET_LOCKS', data: Lock[] }
function setLocks (data: Lock[]): SetLocksAction {
  return { type: 'SET_LOCKS', data }
}

export function createLock (type: string, param: string): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    const extantLock = getState().locks[lockableGID({ type, param })]
    if (extantLock) {
      dispatch(removeLockFromDeletionQueue(type, param))
      return
    }

    Orchard.graft(`locks`, {
      lock: { lockableType: type, lockableParam: param },
    }).then((lock: Lock) => dispatch(addLock(lock)))
  }
}

export type AddLockAction = { type: 'ADD_LOCK', data: Lock }
export function addLock (data: Lock): AddLockAction {
  return { type: 'ADD_LOCK', data }
}

export type EnqueueLockForDeletionAction = {
  type: 'ENQUEUE_LOCK_FOR_DELETION',
  gid: string,
}
export function enqueueLockForDeletion (
  type: string,
  param: string
): EnqueueLockForDeletionAction {
  return {
    type: 'ENQUEUE_LOCK_FOR_DELETION',
    gid: lockableGID({ type, param }),
  }
}

export function deleteLock (type: string, param: string): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    const gid = lockableGID({ type, param })
    const lock = getState().locks[gid]
    if (!lock) return

    const { param: lockParam } = lock
    Orchard.prune(`locks/${lockParam}`).then(() => {
      dispatch(removeLock(lockParam))
      dispatch(removeLockFromDeletionQueue(type, param))
    })
  }
}

export type RemoveLockAction = { type: 'REMOVE_LOCK', param: string }
export function removeLock (param: string): RemoveLockAction {
  return { type: 'REMOVE_LOCK', param }
}

export function deleteEnqueuedLocks (): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    const state = getState()
    const { locksToDelete } = state.edit

    const { reader } = state.caseData
    if (reader == null) return

    locksToDelete.forEach(gid => {
      const lock = state.locks[gid]
      if (lock.reader.param === `${reader.id}`) {
        const [type, param] = gid.split('/')
        dispatch(deleteLock(type, param))
      }
    })
  }
}

export type RemoveLockFromDeletionQueueAction = {
  type: 'REMOVE_LOCK_FROM_DELETION_QUEUE',
  gid: string,
}
export function removeLockFromDeletionQueue (
  type: string,
  param: string
): RemoveLockFromDeletionQueueAction {
  return {
    type: 'REMOVE_LOCK_FROM_DELETION_QUEUE',
    gid: lockableGID({ type, param }),
  }
}
