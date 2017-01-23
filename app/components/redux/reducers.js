import { combineReducers } from 'redux'

import {
  UPDATE_CASE,
  UPDATE_CARD_CONTENTS,
  CREATE_EDGENOTE,
  TOGGLE_EDITING,
  HIGHLIGHT_EDGENOTE,
  ACTIVATE_EDGENOTE,
  OPEN_CITATION,
} from './actions.js'

function caseData(state, action) {
  if (typeof state === 'undefined') {
    return window.caseData
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

function edgenotesBySlug(state = window.caseData.edgenotes, action) {
  switch (action.type) {
  case CREATE_EDGENOTE:
    return {
      ...state,
      [action.slug]: action.data,
    }

  default: return state
  }
}


//function pagesById(state = window.caseData.pages) {
  //return state
//}

import { EditorState, convertFromRaw } from 'draft-js'
import convertFromOldStyleCardSerialization
  from 'concerns/convertFromOldStyleCardSerialization.js'
import { decorator } from 'concerns/draftConfig.js'

function cardsById(state, action) {
  if (typeof state === 'undefined') {
    state = window.caseData.cards
    Object.values(state).forEach( card => {
      let content = card.rawContent
        || convertFromOldStyleCardSerialization(card.content)
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
      possible: window.caseData.canUpdateCase,
      inProgress: false,
    }
  }

  switch (action.type) {
  case TOGGLE_EDITING:
    return {
      ...state,
      inProgress: !state.inProgress,
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
  //pagesById,
  cardsById,
  edit,
  ui,
})
