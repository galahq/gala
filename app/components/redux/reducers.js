import { combineReducers } from 'redux'

import update from 'react/lib/update'

import {
  UPDATE_CASE,
  SET_READER_ENROLLMENT,
  UPDATE_CASE_ELEMENT,
  UPDATE_CASE_ELEMENTS,
  UPDATE_PAGE,
  UPDATE_PODCAST,
  UPDATE_ACTIVITY,
  CREATE_EDGENOTE,
  UPDATE_EDGENOTE,
  ADD_COMMENT_THREAD,
  REMOVE_COMMENT_THREAD,
  ADD_COMMENT,
  ADD_PAGE,
  ADD_PODCAST,
  ADD_ACTIVITY,
} from './actions.js'

import cardsById from './reducers/cards.js'
import edit from './reducers/edit.js'
import statistics from './reducers/statistics.js'
import ui from './reducers/ui.js'

function caseData(state, action) {
  if (typeof state === 'undefined') {
    return {...window.caseData}
  }

  switch (action.type) {

    case UPDATE_CASE:
    case UPDATE_CASE_ELEMENTS:
      return {
        ...state,
        ...action.data,
      }

    case SET_READER_ENROLLMENT:
      return {
        ...state,
        reader: {
          ...state.reader,
          enrollment: action.enrollment,
        },
      }

    case UPDATE_CASE_ELEMENT:
      const originalIndex = state.caseElements.findIndex( x => x.id === action.id )

      return update(state, {
        caseElements: {
          $splice: [
            [originalIndex, 1],
            [action.index, 0, state.caseElements[originalIndex]],
          ],
        },
      })

    case ADD_PAGE:
    case ADD_PODCAST:
    case ADD_ACTIVITY:
      const {caseElement} = action.data
      return {
        ...state,
        caseElements: [
          ...state.caseElements,
          caseElement,
        ],
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

    case ADD_PAGE:
      return {
        ...state,
        [action.data.id]: action.data,
      }

    default: return state
  }
}

function podcastsById(state = {...window.caseData.podcasts}, action) {
  switch (action.type) {
    case UPDATE_PODCAST:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...action.data,
        },
      }

    case ADD_PODCAST:
      return {
        ...state,
        [action.data.id]: action.data,
      }

    default: return state
  }
}

function activitiesById(state = {...window.caseData.activities}, action) {
  switch (action.type) {
    case UPDATE_ACTIVITY:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...action.data,
        },
      }

    case ADD_ACTIVITY:
      return {
        ...state,
        [action.data.id]: action.data,
      }

    default: return state
  }
}

function commentThreadsById(
  state = {...window.caseData.commentThreads},
  action,
) {
  switch (action.type) {
    case ADD_COMMENT_THREAD:
      return {
        ...state,
        [action.data.id]: action.data,
      }

    case REMOVE_COMMENT_THREAD:
      return {
        ...state,
        [action.threadId]: undefined,
      }

    default: return state
  }
}

function commentsById(state = {...window.caseData.comments}, action) {
  switch (action.type) {
    case ADD_COMMENT:
      return {
        ...state,
        [action.data.id]: action.data,
      }

    default: return state
  }
}


export default combineReducers({
  caseData,
  edgenotesBySlug,
  pagesById,
  podcastsById,
  activitiesById,
  cardsById,
  commentThreadsById,
  commentsById,
  statistics,
  edit,
  ui,
})
