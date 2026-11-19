/**
 * 
 */

import {
  Orchard,
  OrchardRedirectError,
  isExpectedClientError,
} from 'shared/orchard'
import { lockableGID } from 'redux/reducers/locks'


export function reloadLocks () {
  return (dispatch, getState) => {
    Orchard.harvest(`cases/${getState().caseData.slug}/locks`).then(locks =>
      dispatch(setLocks(locks))
    )
  }
}

function setLocks (data) {
  return { type: 'SET_LOCKS', data }
}

export function createLock (type, param) {
  return (dispatch, getState) => {
    const extantLock = getState().locks[lockableGID({ type, param })]
    if (extantLock) {
      dispatch(removeLockFromDeletionQueue(type, param))
      return
    }

    Orchard.graft(`locks`, {
      lock: { lockableType: type, lockableParam: param },
    })
      .then((lock) => dispatch(addLock(lock)))
      .catch((error) => {
        // 409 = the lockable is already locked server-side (our own lock from a prior
        // edit session, or a race when editing re-triggers before the store syncs). The
        // redux store didn't know about it, so re-sync from the server rather than
        // leaving the rejection unhandled — React 19 now surfaces those as an overlay.
        // reloadLocks brings in the extant lock; if it's ours, `locked` stays false and
        // editing proceeds; if it's someone else's, the lock overlay renders.
        if (error && error.status === 409) {
          dispatch(reloadLocks())
        } else {
          console.error('Failed to create lock:', error)
        }
      })
  }
}

export function addLock (data) {
  return { type: 'ADD_LOCK', data }
}

export function enqueueLockForDeletion (
  type,
  param
) {
  return (dispatch, getState) => {
    const gid = lockableGID({ type, param })
    const state = getState()
    state.locks[gid] &&
      state.caseData.reader &&
      state.locks[gid].reader.param === `${state.caseData.reader.id}` &&
      dispatch({
        type: 'ENQUEUE_LOCK_FOR_DELETION',
        gid,
      })
  }
}

export function deleteLock (type, param) {
  return (dispatch, getState) => {
    const gid = lockableGID({ type, param })
    const lock = getState().locks[gid]
    if (!lock) {
      // Already gone from this tab (the hourly cleanup's broadcast, another
      // editor, a reload of the locks): nothing to release, so stop queueing it.
      dispatch(removeLockFromDeletionQueue(type, param))
      return Promise.resolve()
    }

    const { param: lockParam } = lock
    const forget = () => {
      dispatch(removeLock(lockParam))
      dispatch(removeLockFromDeletionQueue(type, param))
    }

    return Orchard.prune(`locks/${lockParam}`).then(forget, (error) => {
      // An expected client error won't succeed on a retry: 404 (already gone —
      // expired by the hourly cleanup, or released elsewhere), 401 (signed out),
      // 403 (no longer allowed) and so on. Nor will a redirect to the sign-in or
      // terms page. Forget the lock rather than retrying it after every save for
      // as long as the tab is open; the server's hourly cleanup removes any lock
      // left behind.
      if (isExpectedClientError(error) || error instanceof OrchardRedirectError) {
        forget()
      } else {
        console.error('Failed to release lock:', error)
      }
    })
  }
}

export function removeLock (param) {
  return { type: 'REMOVE_LOCK', param }
}

export function deleteEnqueuedLocks () {
  return (dispatch, getState) => {
    const state = getState()
    const { locksToDelete } = state.edit

    const { reader } = state.caseData
    if (reader == null) return Promise.resolve()

    return Promise.all(locksToDelete.map(gid => {
      const lock = state.locks[gid]
      const [type, param] = gid.split('/')
      if (!lock) {
        dispatch(removeLockFromDeletionQueue(type, param))
      } else if (lock.reader.param === `${reader.id}`) {
        return dispatch(deleteLock(type, param))
      }
    }))
  }
}

export function removeLockFromDeletionQueue (
  type,
  param
) {
  return {
    type: 'REMOVE_LOCK_FROM_DELETION_QUEUE',
    gid: lockableGID({ type, param }),
  }
}
