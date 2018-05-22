/**
 * @flow
 */

import type { Lock } from 'redux/state'

export type AddLockAction = { type: 'ADD_LOCK', data: Lock }
export function addLock (data: Lock): AddLockAction {
  return { type: 'ADD_LOCK', data }
}

export type RemoveLockAction = { type: 'REMOVE_LOCK', param: string }
export function removeLock (param: string): RemoveLockAction {
  return { type: 'REMOVE_LOCK', param }
}
