/**
 * @flow
 */

import {
  fetchCommentThreads,
  fetchForums,
  resubscribeToActiveForumChannel,
  setMostRecentCommentThreads,
} from 'redux/actions'

import { Orchard } from 'shared/orchard'

import type { ThunkAction, Dispatch } from 'redux/actions'
import type { State } from 'redux/state'

export function updateActiveCommunity (
  caseSlug: string,
  param: string | null
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
    await Orchard.espalier(`profile`, { reader: { activeCommunityId: param }})
    dispatch(fetchForums(caseSlug))
    dispatch(fetchCommentThreads(caseSlug))
    dispatch(resubscribeToActiveForumChannel(caseSlug))
  }
}
