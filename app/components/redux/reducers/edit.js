import {
  CLEAR_UNSAVED,
  TOGGLE_EDITING,
  UPDATE_CASE,
  UPDATE_CARD_CONTENTS,
  UPDATE_PAGE,
  UPDATE_PODCAST,
  UPDATE_ACTIVITY,
  UPDATE_EDGENOTE,
} from '../actions'

function edit(state, action) {
  if (typeof state === 'undefined') {
    const reader = window.caseData.reader || {}
    return {
      possible: !!reader.canUpdateCase,
      inProgress: false,
      changed: false,
      unsavedChanges: {
        // Using this like a Set
        // [`${modelName}/${modelId}` || "caseData"]: true,
      },
    }
  }

  switch (action.type) {
    case CLEAR_UNSAVED:
      return {
        ...state,
        changed: false,
        unsavedChanges: {},
      }

    case TOGGLE_EDITING:
      return {
        ...state,
        inProgress: !state.inProgress,
      }

    case UPDATE_CASE:
      return {
        ...state,
        changed: true,
        unsavedChanges: {
          ...state.unsavedChanges,
          caseData: true,
        },
      }

    case UPDATE_CARD_CONTENTS:
      return {
        ...state,
        changed: true,
        unsavedChanges: {
          ...state.unsavedChanges,
          [`cards/${action.id}`]: true,
        },
      }

    case UPDATE_PAGE:
      return {
        ...state,
        changed: true,
        unsavedChanges: {
          ...state.unsavedChanges,
          [`pages/${action.id}`]: true,
        },
      }

    case UPDATE_PODCAST:
      return {
        ...state,
        changed: true,
        unsavedChanges: {
          ...state.unsavedChanges,
          [`podcasts/${action.id}`]: true,
        },
      }

    case UPDATE_ACTIVITY:
      return {
        ...state,
        changed: true,
        unsavedChanges: {
          ...state.unsavedChanges,
          [`activities/${action.id}`]: true,
        },
      }

    case UPDATE_EDGENOTE:
      return {
        ...state,
        changed: true,
        unsavedChanges: {
          ...state.unsavedChanges,
          [`edgenotes/${action.slug}`]: true,
        },
      }

    default: return state
  }
}

export default edit
