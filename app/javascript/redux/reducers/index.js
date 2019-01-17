/**
 * @providesModule reducers
 * @flow
 */

import { combineReducers } from 'redux'

import cardsById from './cards'
import caseData from './caseData'
import commentsById from './commentsById'
import commentThreadsById from './commentThreadsById'
import edgenotesBySlug from './edgenotesBySlug'
import edit from './edit'
import forums from './forums'
import locks from './locks'
import pagesById from './pagesById'
import podcastsById from './podcastsById'
import quiz from './quiz'
import statistics from './statistics'
import suggestedQuizzes from './suggestedQuizzes'
import ui from './ui'

const state = {
  cardsById,
  caseData,
  commentsById,
  commentThreadsById,
  edgenotesBySlug,
  edit,
  forums,
  locks,
  pagesById,
  podcastsById,
  quiz,
  statistics,
  suggestedQuizzes,
  ui,
}

// $FlowFixMe
const reducer = combineReducers(state)

export default reducer
