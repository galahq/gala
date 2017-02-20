import { combineReducers } from 'redux'

import {
  UPDATE_CASE,
  UPDATE_PAGE,
  CREATE_EDGENOTE,
  UPDATE_EDGENOTE,
  REPLACE_CARD,
  REMOVE_COMMENT_THREAD,
  ADD_COMMENT,
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

function commentThreadsById(
  state = {...window.caseData.commentThreads},
  action,
) {
  switch (action.type) {
    case REPLACE_CARD:
      const newCommentThreads = action.newCard.commentThreads.reduce(
      (obj, el) => ({
        ...obj,
        [el.id]: el,
      }), {})
      return {
        ...state,
        ...newCommentThreads,
      }

    case ADD_COMMENT:
      return {
        ...state,
        [action.data.commentThreadId]: {
          ...state[action.data.commentThreadId],
          commentIds: [
            ...state[action.data.commentThreadId].commentIds,
            action.data.id,
          ],
        },
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
  cardsById,
  commentThreadsById,
  commentsById,
  statistics,
  edit,
  ui,
})
