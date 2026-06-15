/**
 *
 */

import { addComment, addCommentThread } from 'redux/actions'

import { Orchard } from 'shared/orchard'


export function fetchForums (caseSlug) {
  return async (dispatch) => {
    const forums = await Orchard.harvest(`cases/${caseSlug}/forums`)
    dispatch(setForums(forums))
  }
}

export function setForums (forums) {
  return { type: 'SET_FORUMS', forums }
}

export function subscribeToActiveForumChannel (caseSlug) {
  return (dispatch) => {
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

export function resubscribeToActiveForumChannel (caseSlug) {
  return (dispatch) => {
    if (App.forum == null) return
    App.forum.unsubscribe()
    delete App.forum
    dispatch(subscribeToActiveForumChannel(caseSlug))
  }
}
