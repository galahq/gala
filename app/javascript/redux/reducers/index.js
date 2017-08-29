/**
 * @providesModule reducers
 * @flow
 */

import { combineReducers } from 'redux'

import caseData from './caseData'
import edgenotesBySlug from './edgenotesBySlug'
import pagesById from './pagesById'
import podcastsById from './podcastsById'
import activitiesById from './activitiesById'
import commentThreadsById from './commentThreadsById'
import commentsById from './commentsById'
import communities from './communities'
import cardsById from './cards'
import quiz from './quiz'
import edit from './edit'
import statistics from './statistics'
import ui from './ui'

const state = {
  caseData,
  edgenotesBySlug,
  pagesById,
  podcastsById,
  activitiesById,
  cardsById,
  commentThreadsById,
  commentsById,
  communities,
  statistics,
  quiz,
  edit,
  ui,
}

const reducer = combineReducers(state)

export default reducer

type ExtractReturnType = <V>((...*) => V) => V
export type State = $ObjMap<typeof state, ExtractReturnType>
