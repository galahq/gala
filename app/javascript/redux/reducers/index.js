/**
 * @providesModule reducers
 * @flow
 */

import { combineReducers } from 'redux'

import activitiesById from './activitiesById'
import cardsById from './cards'
import caseData from './caseData'
import commentsById from './commentsById'
import commentThreadsById from './commentThreadsById'
import communities from './communities'
import edgenotesBySlug from './edgenotesBySlug'
import edit from './edit'
import locks from './locks'
import pagesById from './pagesById'
import podcastsById from './podcastsById'
import quiz from './quiz'
import statistics from './statistics'
import ui from './ui'

const state = {
  activitiesById,
  cardsById,
  caseData,
  commentsById,
  commentThreadsById,
  communities,
  edgenotesBySlug,
  edit,
  locks,
  pagesById,
  podcastsById,
  quiz,
  statistics,
  ui,
}

const reducer = combineReducers(state)

export default reducer
