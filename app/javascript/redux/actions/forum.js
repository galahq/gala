/**
 * @flow
 */

import { addComment, addCommentThread } from 'redux/actions'

import { Orchard } from 'shared/orchard'

import type { ThunkAction, Dispatch } from 'redux/actions'
import type { Forum } from 'redux/state'

export function fetchForums (caseSlug: string): ThunkAction {
  return async (dispatch: Dispatch) => {
    const forums = await Orchard.harvest(`cases/${caseSlug}/forums`)
    dispatch(setForums(forums))
  }
}

export type SetForumsAction = {
  type: 'SET_FORUMS',
  forums: Forum[],
}
export function setForums (forums: Forum[]): SetForumsAction {
  return { type: 'SET_FORUMS', forums }
}

export function subscribeToActiveForumChannel (caseSlug: string): ThunkAction {
  return (dispatch: Dispatch) => {
    if (!('WebSocket' in window)) return

    if (
      App.forum != null &&
      typeof App.forum.unsubscribe === 'function'
    ) {
      App.forum.unsubscribe()
      delete App.forum
    }

    App.forum = App.cable.subscriptions.create(
      {
        channel: 'ForumChannel',
        case_slug: caseSlug,
        timestamp: Date.now(), // Timestamp needed for cachebusting
      },
      {
        received: data => {
          if (data.comment) {
            dispatch(addComment(JSON.parse(data.comment)))
          }
          if (data.comment_thread) {
            dispatch(addCommentThread(JSON.parse(data.comment_thread)))
          }
        },
      }
    )
  }
}

export function resubscribeToActiveForumChannel (caseSlug: string): ThunkAction {
  return (dispatch: Dispatch) => {
    if (App.forum == null) return
    App.forum.unsubscribe()
    delete App.forum
    dispatch(subscribeToActiveForumChannel(caseSlug))
  }
}
