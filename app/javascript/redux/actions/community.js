/**
 * 
 */

import {
  fetchCommentThreads,
  fetchForums,
  resubscribeToActiveForumChannel,
  setMostRecentCommentThreads,
} from 'redux/actions'

import { Orchard } from 'shared/orchard'


export function updateActiveCommunity (
  caseSlug,
  param
) {
  return async (dispatch, getState) => {
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
