// @flow
import type { CommentThreadsState } from 'redux/state'
import type {
  AddCommentThreadAction,
  RemoveCommentThreadAction,
} from 'redux/actions'

export default function commentThreadsById (
  state: CommentThreadsState = ({ ...window.caseData.commentThreads }: CommentThreadsState),
  action: AddCommentThreadAction | RemoveCommentThreadAction,
): CommentThreadsState {
  switch (action.type) {
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

    default: return state
  }
}
