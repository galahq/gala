import { combineReducers } from 'redux'

import {
  UPDATE_CARD_CONTENTS,
  HIGHLIGHT_EDGENOTE,
  ACTIVATE_EDGENOTE,
  OPEN_CITATION,
} from './actions.js'



function edgenotesBySlug(state = window.caseData.edgenotes) {
  return state
}


//function pagesById(state = window.caseData.pages) {
  //return state
//}

import { EditorState, convertFromRaw } from 'draft-js'
import convertFromOldStyleCardSerialization from 'concerns/convertFromOldStyleCardSerialization.js'
import { decorator } from 'concerns/draftConfig.js'

function cardsById(state, action) {
  if (typeof state === 'undefined') {
    state = window.caseData.cards
    Object.values(state).forEach( card => {
      let content = card.rawContent || convertFromOldStyleCardSerialization(card.content)
      let contentState = convertFromRaw(content)
      state[card.id].editorState = EditorState.createWithContent(contentState, decorator)
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


function ui(state = {}, action) {
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
      openCitation: action.key,
    }

  default: return state
  }
}


export default combineReducers({
  edgenotesBySlug,
  //pagesById,
  cardsById,
  ui,
})
