/**
 * @providesModule edit
 * @flow
 */

import type { EditState, ReaderState } from 'redux/state'
import type {
  ClearUnsavedAction,
  ToggleEditingAction,
  UpdateCaseAction,
  ReorderCardAction,
  UpdateCardContentsAction,
  UpdatePageAction,
  UpdatePodcastAction,
  UpdateEdgenoteAction,
  UpdateSuggestedQuizAction,
  EnqueueLockForDeletionAction,
  RemoveLockFromDeletionQueueAction,
} from 'redux/actions'

type Action =
  | ClearUnsavedAction
  | ToggleEditingAction
  | UpdateCaseAction
  | ReorderCardAction
  | UpdateCardContentsAction
  | UpdatePageAction
  | UpdatePodcastAction
  | UpdateEdgenoteAction
  | UpdateSuggestedQuizAction
  | EnqueueLockForDeletionAction
  | RemoveLockFromDeletionQueueAction

function edit (state: ?EditState, action: Action): EditState {
  if (state == null) {
    const reader = (window.caseData.reader: ReaderState) || {}
    return {
      possible: !!reader.canUpdateCase,
      inProgress: false,
      changed: false,
      locksToDelete: [],
      unsavedChanges: {
        // Using this like a Set
        // [`${modelName}/${modelId}` || "caseData"]: true,
      },
    }
  }

  switch (action.type) {
    case 'CLEAR_UNSAVED':
      return {
        ...state,
        changed: false,
        unsavedChanges: {},
      }

    case 'TOGGLE_EDITING':
      return {
        ...state,
        inProgress: !state.inProgress,
      }

    case 'UPDATE_CASE':
      if (action.needsSaving === false) return state
      return {
        ...state,
        changed: true,
        unsavedChanges: {
          ...state.unsavedChanges,
          caseData: true,
        },
      }

    case 'REORDER_CARD':
    case 'UPDATE_CARD_CONTENTS':
      return {
        ...state,
        changed: true,
        unsavedChanges: {
          ...state.unsavedChanges,
          [`cards/${action.id}`]: true,
        },
      }

    case 'UPDATE_PAGE':
      if (action.needsSaving === false) return state
      return {
        ...state,
        changed: true,
        unsavedChanges: {
          ...state.unsavedChanges,
          [`pages/${action.id}`]: true,
        },
      }

    case 'UPDATE_PODCAST':
      if (action.needsSaving === false) return state
      return {
        ...state,
        changed: true,
        unsavedChanges: {
          ...state.unsavedChanges,
          [`podcasts/${action.id}`]: true,
        },
      }

    case 'UPDATE_EDGENOTE':
      if (action.needsSaving === false) return state
      return {
        ...state,
        changed: true,
        unsavedChanges: {
          ...state.unsavedChanges,
          [`edgenotes/${action.slug}`]: true,
        },
      }

    case 'UPDATE_SUGGESTED_QUIZ':
      return {
        ...state,
        changed: true,
        unsavedChanges: {
          ...state.unsavedChanges,
          [`quizzes/${action.param}`]: true,
        },
      }

    case 'ENQUEUE_LOCK_FOR_DELETION':
      return {
        ...state,
        locksToDelete: [...state.locksToDelete, action.gid],
      }

    case 'REMOVE_LOCK_FROM_DELETION_QUEUE': {
      const { gid } = action
      return {
        ...state,
        locksToDelete: state.locksToDelete.filter(toDelete => toDelete !== gid),
      }
    }

    default:
      return state
  }
}

export default edit
