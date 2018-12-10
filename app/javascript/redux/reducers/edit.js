/**
 * @providesModule edit
 * @flow
 */

import produce from 'immer'

import type { EditState, ReaderState } from 'redux/state'
import type {
  ClearUnsavedAction,
  ToggleEditingAction,
  UpdateCaseAction,
  ReorderCardAction,
  UpdateCardContentsAction,
  RemoveCardAction,
  UpdatePageAction,
  UpdatePodcastAction,
  UpdateEdgenoteAction,
  RemoveEdgenoteAction,
  UpdateSuggestedQuizAction,
  RemoveSuggestedQuizAction,
  EnqueueLockForDeletionAction,
  RemoveLockFromDeletionQueueAction,
} from 'redux/actions'

type Action =
  | ClearUnsavedAction
  | ToggleEditingAction
  | UpdateCaseAction
  | ReorderCardAction
  | UpdateCardContentsAction
  | RemoveCardAction
  | UpdatePageAction
  | UpdatePodcastAction
  | UpdateEdgenoteAction
  | RemoveEdgenoteAction
  | UpdateSuggestedQuizAction
  | RemoveSuggestedQuizAction
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

  return produce(state, draft => {
    switch (action.type) {
      case 'CLEAR_UNSAVED':
        draft.changed = false
        draft.unsavedChanges = {}
        break

      case 'TOGGLE_EDITING':
        draft.inProgress = !draft.inProgress
        break

      case 'UPDATE_CASE':
        if (action.needsSaving === false) break
        draft.changed = true
        draft.unsavedChanges.caseData = true
        break

      case 'REORDER_CARD':
      case 'UPDATE_CARD_CONTENTS':
        draft.changed = true
        draft.unsavedChanges[`cards/${action.id}`] = true
        break

      case 'REMOVE_CARD':
        delete draft.unsavedChanges[`cards/${action.id}`]
        break

      case 'UPDATE_PAGE':
        if (action.needsSaving === false) break
        draft.changed = true
        draft.unsavedChanges[`pages/${action.id}`] = true
        break

      case 'UPDATE_PODCAST':
        if (action.needsSaving === false) break
        draft.changed = true
        draft.unsavedChanges[`podcasts/${action.id}`] = true
        break

      case 'UPDATE_EDGENOTE':
        if (action.needsSaving === false) break
        draft.changed = true
        draft.unsavedChanges[`edgenotes/${action.slug}`] = true
        break

      case 'REMOVE_EDGENOTE':
        delete draft.unsavedChanges[`edgenotes/${action.slug}`]
        break

      case 'UPDATE_SUGGESTED_QUIZ':
        draft.changed = true
        draft.unsavedChanges[`quizzes/${action.param}`] = true
        break

      case 'REMOVE_SUGGESTED_QUIZ':
        delete draft.unsavedChanges[`quizzes/${action.param}`]
        break

      case 'ENQUEUE_LOCK_FOR_DELETION':
        draft.locksToDelete.push(action.gid)
        break

      case 'REMOVE_LOCK_FROM_DELETION_QUEUE': {
        draft.locksToDelete.splice(draft.locksToDelete.indexOf(action.gid), 1)
        break
      }
    }
  })
}

export default edit
