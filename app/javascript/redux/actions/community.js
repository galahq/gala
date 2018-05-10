/**
 * @flow
 */

import {
  setMostRecentCommentThreads,
  fetchCommentThreads,
  addComment,
  addCommentThread,
} from 'redux/actions'

import { Orchard } from 'shared/orchard'

import type { ThunkAction, Dispatch } from 'redux/actions'
import type { State, Community } from 'redux/state'

export function fetchCommunities (slug: string): ThunkAction {
  return async (dispatch: Dispatch) => {
    const { communities } = await Orchard.harvest(`cases/${slug}/communities`)
    dispatch(setCommunities(communities))
  }
}

export function updateActiveCommunity (
  slug: string,
  id: string | null
): ThunkAction {
  return async (dispatch: Dispatch, getState: () => State) => {
    if (getState().edit.changed) {
      if (
        !window.confirm(
          'Changing the active community while you have unsaved changes will reset all cards resulting in the loss of your changes. Continue?'
        )
      ) {
        return
      }
    }
    dispatch(setMostRecentCommentThreads(null))
    await Orchard.espalier(`profile`, { reader: { activeCommunityId: id }})
    dispatch(fetchCommunities(slug))
    dispatch(fetchCommentThreads(slug))
    dispatch(resubscribeToActiveForumChannel(slug))
  }
}

export type SetCommunitiesAction = {
  type: 'SET_COMMUNITIES',
  communities: Community[],
}
export function setCommunities (communities: Community[]): SetCommunitiesAction {
  return { type: 'SET_COMMUNITIES', communities }
}

export function subscribeToActiveForumChannel (slug: string): ThunkAction {
  return (dispatch: Dispatch) => {
    if (!('WebSocket' in window)) return

    App.forum = App.cable.subscriptions.create(
      {
        channel: 'ForumChannel',
        case_slug: slug,
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

export function resubscribeToActiveForumChannel (slug: string): ThunkAction {
  return (dispatch: Dispatch) => {
    if (App.forum == null) return
    App.forum.unsubscribe()
    delete App.forum
    dispatch(subscribeToActiveForumChannel(slug))
  }
}
