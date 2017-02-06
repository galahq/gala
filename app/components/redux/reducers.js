import { combineReducers } from 'redux'

import {
  UPDATE_CASE,
  UPDATE_PAGE,
  CREATE_EDGENOTE,
  UPDATE_EDGENOTE,
  HIGHLIGHT_EDGENOTE,
  ACTIVATE_EDGENOTE,
  OPEN_CITATION,
} from './actions.js'

import cardsById from './reducers/cards.js'
import edit from './reducers/edit.js'
import statistics from './reducers/statistics.js'

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
  statistics,
  edit,
  ui,
})
