/**
 * @providesModule commentThreadsById
 * @flow
 */

import type { CommentThreadsState } from 'redux/state'
import type {
  SetCommentThreadsByIdAction,
  AddCommentThreadAction,
  RemoveCommentThreadAction,
} from 'redux/actions'

type Action =
  | SetCommentThreadsByIdAction
  | AddCommentThreadAction
  | RemoveCommentThreadAction

export default function commentThreadsById (
  state: CommentThreadsState = ({
    ...window.caseData.commentThreads,
  }: CommentThreadsState),
  action: Action
): CommentThreadsState {
  switch (action.type) {
    case 'SET_COMMENT_THREADS_BY_ID':
      return action.commentThreadsById || {}

    case 'ADD_COMMENT_THREAD':
      return {
        ...state,
        [action.data.id]: action.data,
      }

    case 'REMOVE_COMMENT_THREAD':
      return {
        ...state,
        [action.threadId]: undefined,
      }

    default:
      return state
  }
}
