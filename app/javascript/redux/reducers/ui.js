/**
 * @providesModule ui
 * @flow
 */

import { without } from 'ramda'

import type { UIState } from 'redux/state'
import type {
  HighlightEdgenoteAction,
  ActivateEdgenoteAction,
  OpenCitationAction,
  HoverCommentThreadAction,
  AcceptSelectionAction,
  SetMostRecentCommentThreadsAction,
  AddCommentThreadAction,
  RemoveCommentThreadAction,
  ChangeCommentInProgressAction,
  RegisterToasterAction,
  DisplayToastAction,
  GoOnlineAction,
  GoOfflineAction,
} from 'redux/actions'

type Action =
  | HighlightEdgenoteAction
  | ActivateEdgenoteAction
  | OpenCitationAction
  | HoverCommentThreadAction
  | AcceptSelectionAction
  | SetMostRecentCommentThreadsAction
  | AddCommentThreadAction
  | RemoveCommentThreadAction
  | ChangeCommentInProgressAction
  | RegisterToasterAction
  | DisplayToastAction
  | GoOnlineAction
  | GoOfflineAction

export default function ui (state: ?UIState, action: Action): UIState {
  if (state == null) {
    return {
      openedCitation: { key: null, labelRef: null },
      activeEdgenote: null,
      highlightedEdgenote: null,
      hoveredCommentThread: null,
      acceptingSelection: false,
      commentInProgress: {},
      offline: !navigator.onLine,
      timestamp: new Date(window.caseData.timestamp),
      toaster: null,
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

    case 'REGISTER_TOASTER':
      return {
        ...state,
        toaster: action.toaster,
      }

    case 'DISPLAY_TOAST':
      state.toaster.show(action.options)
      return state

    case 'GO_ONLINE':
      return { ...state, offline: false }

    case 'GO_OFFLINE':
      return { ...state, offline: true }

    default:
      return state
  }
}
