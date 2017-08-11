/**
 * @providesModule commentsById
 * @flow
 */

import type { CommentsState } from 'redux/state'
import type { SetCommentsByIdAction, AddCommentAction } from 'redux/actions'

export default function commentsById (
  state: CommentsState = ({ ...window.caseData.comments }: CommentsState),
  action: SetCommentsByIdAction | AddCommentAction
): CommentsState {
  switch (action.type) {
    case 'SET_COMMENTS_BY_ID':
      return action.commentsById

    case 'ADD_COMMENT':
      return {
        ...state,
        [action.data.id]: action.data,
      }

    default:
      return state
  }
}
