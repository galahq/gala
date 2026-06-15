/**
 * @providesModule ui
 *
 */

import { without } from 'ramda'
import Toaster from 'shared/Toaster'



export default function ui (state, action) {
  if (state == null) {
    return {
      openedCitation: { key: null, labelRef: null },
      activeEdgenote: null,
      highlightedEdgenote: null,
      hoveredCommentThread: null,
      acceptingSelection: false,
      commentInProgress: {},
      mostRecentCommentThreads: [],
    }
  }

  switch (action.type) {
    case 'HIGHLIGHT_EDGENOTE':
      return { ...state, highlightedEdgenote: action.slug }

    case 'ACTIVATE_EDGENOTE':
      return { ...state, activeEdgenote: action.slug }

    case 'OPEN_CITATION':
      return { ...state, openedCitation: action.data }

    case 'ACCEPT_SELECTION':
      return { ...state, acceptingSelection: action.enabled }

    case 'SET_MOST_RECENT_COMMENT_THREADS':
      return {
        ...state,
        mostRecentCommentThreads: action.mostRecentCommentThreads,
      }

    case 'ADD_COMMENT_THREAD': {
      const id = `${action.data.id}`
      return {
        ...state,
        acceptingSelection: false,
        mostRecentCommentThreads: [
          id,
          ...(state.mostRecentCommentThreads || []).filter(x => x !== id),
        ],
      }
    }

    case 'REMOVE_COMMENT_THREAD':
      return {
        ...state,
        mostRecentCommentThreads:
          state.mostRecentCommentThreads &&
          without([action.threadId], state.mostRecentCommentThreads),
      }

    case 'HOVER_COMMENT_THREAD':
      return { ...state, hoveredCommentThread: action.id }

    case 'CHANGE_COMMENT_IN_PROGRESS':
      return {
        ...state,
        commentInProgress: {
          ...state.commentInProgress,
          [action.threadId]: action.content,
        },
      }

    case 'DISPLAY_TOAST': {
      Toaster.show(action.options, action.key)

      return state
    }

    case 'DISMISS_TOAST':
      Toaster.dismiss(action.key)
      return state

    default:
      return state
  }
}
