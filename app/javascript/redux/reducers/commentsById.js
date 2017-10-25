/**
 * @providesModule commentsById
 * @flow
 */

import { omit } from 'ramda'

import type { CommentsState } from 'redux/state'
import type {
  SetCommentsByIdAction,
  AddCommentAction,
  RemoveCommentAction,
} from 'redux/actions'

export default function commentsById (
  state: CommentsState = ({ ...window.caseData.comments }: CommentsState),
  action: SetCommentsByIdAction | AddCommentAction | RemoveCommentAction
): CommentsState {
  switch (action.type) {
    case 'SET_COMMENTS_BY_ID':
      return action.commentsById || {}

    case 'ADD_COMMENT':
      return {
        ...state,
        [action.data.id]: action.data,
      }

    case 'REMOVE_COMMENT':
      return omit([`${action.id}`], state)

    default:
      return state
  }
}
