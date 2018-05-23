/**
 * @providesModule locks
 * @flow
 */

import { reject } from 'ramda'

import type { LocksState, Lock } from 'redux/state'
import type {
  SetLocksAction,
  AddLockAction,
  RemoveLockAction,
} from 'redux/actions'
type Action = SetLocksAction | AddLockAction | RemoveLockAction

export default function locks (state: LocksState = {}, action: Action) {
  switch (action.type) {
    case 'SET_LOCKS': {
      const { data } = action
      return data.reduce((object, lock) => {
        object[lockableGID(lock.lockable)] = lock
        return object
      }, {})
    }

    case 'ADD_LOCK':
      return {
        ...state,
        [lockableGID(action.data.lockable)]: action.data,
      }

    case 'REMOVE_LOCK': {
      const { param } = action
      return reject((lock: Lock) => lock.param === param, state)
    }

    default:
      return state
  }
}

export function lockableGID (lockable: { type: string, param: string }) {
  return `${lockable.type}/${lockable.param}`
}
