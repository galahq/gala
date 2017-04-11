import type { UIState } from 'redux/state'
import type {
  HighlightEdgenoteAction,
  ActivateEdgenoteAction,
  OpenCitationAction,
  HoverCommentThreadAction,
  AcceptSelectionAction,
  AddCommentThreadAction,
  ChangeCommentInProgressAction,
  RegisterToasterAction,
  DisplayToastAction,
} from 'redux/actions'

type Action =
  | HighlightEdgenoteAction
  | ActivateEdgenoteAction
  | OpenCitationAction
  | HoverCommentThreadAction
  | AcceptSelectionAction
  | AddCommentThreadAction
  | ChangeCommentInProgressAction
  | RegisterToasterAction
  | DisplayToastAction

export default function ui (state: ?UIState, action: Action): UIState {
  if (typeof state === 'undefined') {
    return {
      openedCitation: {},
      acceptingSelection: false,
      hoveredCommentThread: null,
      commentInProgress: {},
      toaster: null,
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
    case 'ADD_COMMENT_THREAD':
      return { ...state, acceptingSelection: false }

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

    case 'REGISTER_TOASTER':
      return {
        ...state,
        toaster: action.toaster,
      }

    case 'DISPLAY_TOAST':
      state.toaster.show(action.options)
      return state

    default:
      return state
  }
}
