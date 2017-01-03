import { combineReducers } from 'redux'

import {
  HIGHLIGHT_EDGENOTE,
  ACTIVATE_EDGENOTE,
  OPEN_CITATION,
} from './actions.js'



function edgenotesBySlug(state = window.caseData.edgenotes,
                         action) {
  return state
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
  ui,
})
