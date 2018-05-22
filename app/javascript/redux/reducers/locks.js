/**
 * @providesModule locks
 * @flow
 */

import { reject } from 'ramda'

import type { LocksState, Lock } from 'redux/state'
import type { AddLockAction, RemoveLockAction } from 'redux/actions'
type Action = AddLockAction | RemoveLockAction

export default function locks (state: LocksState = {}, action: Action) {
  switch (action.type) {
    case 'ADD_LOCK':
      return {
        ...state,
        [gid(action.data.lockable)]: action.data,
      }

    case 'REMOVE_LOCK': {
      const { param } = action
      return reject((lock: Lock) => lock.param === param, state)
    }

    default:
      return state
  }
}

function gid (lockable) {
  return `${lockable.type}/${lockable.param}`
}
