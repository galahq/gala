/**
 * @providesModule commentThreadsById
 * 
 */

import { without } from 'ramda'



export default function commentThreadsById (
  state = ({
    ...window.caseData.commentThreads,
  }),
  action
) {
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

    case 'REMOVE_COMMENT':
      return {
        ...state,
        [action.threadId]: {
          ...state[action.threadId],
          commentIds: without([action.id], state[action.threadId].commentIds),
        },
      }

    default:
      return state
  }
}
