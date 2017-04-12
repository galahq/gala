// @flow
import { combineReducers } from 'redux'

import caseData from './caseData'
import edgenotesBySlug from './edgenotesBySlug'
import pagesById from './pagesById'
import podcastsById from './podcastsById'
import activitiesById from './activitiesById'
import commentThreadsById from './commentThreadsById'
import commentsById from './commentsById'
import cardsById from './cards'
import edit from './edit'
import statistics from './statistics'
import ui from './ui'

const reducer = combineReducers({
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

export default reducer
