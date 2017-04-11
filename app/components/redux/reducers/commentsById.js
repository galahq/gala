// @flow
import type { CommentsState } from 'redux/state'
import type { AddCommentAction } from 'redux/actions'

export default function commentsById (
  state: CommentsState = ({ ...window.caseData.comments }: CommentsState),
  action: AddCommentAction,
): CommentsState {
  switch (action.type) {
    case 'ADD_COMMENT':
      return {
        ...state,
        [action.data.id]: action.data,
      }

    default:
      return state
  }
}
