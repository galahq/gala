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
    if (extantLock) return

    Orchard.graft(`locks`, { lock: { lockableType, lockableParam }}).then(
      (lock: Lock) => dispatch(addLock(lock))
    )
  }
}

export type AddLockAction = { type: 'ADD_LOCK', data: Lock }
export function addLock (data: Lock): AddLockAction {
  return { type: 'ADD_LOCK', data }
}

export type RemoveLockAction = { type: 'REMOVE_LOCK', param: string }
export function removeLock (param: string): RemoveLockAction {
  return { type: 'REMOVE_LOCK', param }
}
