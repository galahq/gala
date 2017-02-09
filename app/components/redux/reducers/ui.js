import {
  HIGHLIGHT_EDGENOTE,
  ACTIVATE_EDGENOTE,
  OPEN_CITATION,
  OPEN_COMMENT_THREADS,
  SELECT_COMMENT_THREAD,
  ACCEPT_SELECTION,
  REPLACE_CARD,
} from '../actions.js'

export default function ui(state, action) {
  if (typeof state === 'undefined') {
    return {
      openedCitation: {},
      acceptingSelection: false,
      commentThreadsOpenForCard: null,
      selectedCommentThread: null,
    }
  }

  switch (action.type) {
    case HIGHLIGHT_EDGENOTE:
      return { ...state, highlightedEdgenote: action.slug }

    case ACTIVATE_EDGENOTE: return { ...state, activeEdgenote: action.slug }

    case OPEN_CITATION: return { ...state, openedCitation: action.data }

    case ACCEPT_SELECTION: return { ...state, acceptingSelection: true }
    case REPLACE_CARD: return { ...state, acceptingSelection: false }

    case OPEN_COMMENT_THREADS:
      return {
        ...state,
        commentThreadsOpenForCard: action.cardId,
        acceptingSelection: false,
      }

    case SELECT_COMMENT_THREAD:
      return { ...state, selectedCommentThread: action.id }

    default: return state
  }
}
