/**
 *
 */

import {
  fetchCommentThreads,
  fetchForums,
  resubscribeToActiveForumChannel,
  setMostRecentCommentThreads,
} from 'redux/actions'

import { Orchard, ignoreClientError } from 'shared/orchard'


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
    try {
      await Orchard.espalier(`profile`, {
        reader: { activeCommunityId: param },
      })
      dispatch(fetchForums(caseSlug))
      dispatch(fetchCommentThreads(caseSlug))
      dispatch(resubscribeToActiveForumChannel(caseSlug))
    } catch (e) {
      ignoreClientError(e) // 403/404 for a community you were removed from
    }
  }
}
