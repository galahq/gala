import { combineReducers } from 'redux'

import { EditorState, convertFromRaw } from 'draft-js'
import convertFromOldStyleCardSerialization
  from 'concerns/convertFromOldStyleCardSerialization.js'
import { decorator } from 'concerns/draftConfig.js'

import {
  UPDATE_CASE,
  UPDATE_CARD_CONTENTS,
  UPDATE_PAGE,
  CREATE_EDGENOTE,
  UPDATE_EDGENOTE,
  CLEAR_UNSAVED,
  TOGGLE_EDITING,
  HIGHLIGHT_EDGENOTE,
  ACTIVATE_EDGENOTE,
  OPEN_CITATION,
} from './actions.js'

function caseData(state, action) {
  if (typeof state === 'undefined') {
    return {...window.caseData}
  }

  switch (action.type) {

    case UPDATE_CASE:
      return {
        ...state,
        ...action.data,
      }

    default: return state

  }
}

function edgenotesBySlug(state = {...window.caseData.edgenotes}, action) {
  switch (action.type) {
    case CREATE_EDGENOTE:
      return {
        ...state,
        [action.slug]: action.data,
      }

    case UPDATE_EDGENOTE:
      return {
        ...state,
        [action.slug]: {
          ...state[action.slug],
          ...action.data,
        },
      }

    default: return state
  }
}


function pagesById(state = {...window.caseData.pages}, action) {
  switch (action.type) {
    case UPDATE_PAGE:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...action.data,
        },
      }
    default: return state
  }
}

function cardsById(state, action) {
  if (typeof state === 'undefined') {
    state = {...window.caseData.cards}
    Object.values(state).forEach( card => {
      let content = card.rawContent
        ? JSON.parse(card.rawContent)
        : convertFromOldStyleCardSerialization(card.content)
      let contentState = convertFromRaw(content)
      state[card.id].editorState = EditorState.createWithContent(contentState,
                                                                 decorator)
    } )
    return state
  }

  switch (action.type) {
    case UPDATE_CARD_CONTENTS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          editorState: action.editorState,
        },
      }

    default: return state
  }
}

function edit(state, action) {
  if (typeof state === 'undefined') {
    return {
      possible: window.caseData.reader.canUpdateCase,
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


function ui(state, action) {
  if (typeof state === 'undefined') {
    return {
      openedCitation: {},
    }
  }

  switch (action.type) {
    case HIGHLIGHT_EDGENOTE:
      return {
        ...state,
        highlightedEdgenote: action.slug,
      }

    case ACTIVATE_EDGENOTE:
      return {
        ...state,
        activeEdgenote: action.slug,
      }

    case OPEN_CITATION:
      return {
        ...state,
        openedCitation: action.data,
      }

    default: return state
  }
}


export default combineReducers({
  caseData,
  edgenotesBySlug,
  pagesById,
  cardsById,
  edit,
  ui,
})
