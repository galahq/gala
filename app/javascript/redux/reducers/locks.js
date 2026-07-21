/**
 * @providesModule locks
 * 
 */

import { reject } from 'ramda'


export default function locks (state = {}, action) {
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
      return reject((lock) => lock.param === param, state)
    }

    default:
      return state
  }
}

export function lockableGID (lockable) {
  return `${lockable.type}/${lockable.param}`
}
