/**
 * @flow
 */

import { Orchard } from 'shared/orchard'

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

export function createLock (
  lockableType: string,
  lockableParam: string
): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    const extantLock = getState().locks[`${lockableType}/${lockableParam}`]
    if (extantLock) {
      dispatch(removeLockFromDeletionQueue(lockableType, lockableParam))
      return
    }

    Orchard.graft(`locks`, { lock: { lockableType, lockableParam }}).then(
      (lock: Lock) => dispatch(addLock(lock))
    )
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
  lockableType: string,
  lockableParam: string
): EnqueueLockForDeletionAction {
  return {
    type: 'ENQUEUE_LOCK_FOR_DELETION',
    gid: `${lockableType}/${lockableParam}`,
  }
}

export function deleteLock (
  lockableType: string,
  lockableParam: string
): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    const lock = getState().locks[`${lockableType}/${lockableParam}`]
    if (!lock) return

    const { param } = lock
    Orchard.prune(`locks/${param}`).then(() => dispatch(removeLock(param)))
  }
}

export type RemoveLockAction = { type: 'REMOVE_LOCK', param: string }
export function removeLock (param: string): RemoveLockAction {
  return { type: 'REMOVE_LOCK', param }
}

export type RemoveLockFromDeletionQueueAction = {
  type: 'REMOVE_LOCK_FROM_DELETION_QUEUE',
  gid: string,
}
export function removeLockFromDeletionQueue (
  lockableType: string,
  lockableParam: string
): RemoveLockFromDeletionQueueAction {
  return {
    type: 'REMOVE_LOCK_FROM_DELETION_QUEUE',
    gid: `${lockableType}/${lockableParam}`,
  }
}
