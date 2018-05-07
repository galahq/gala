/**
 * @providesModule edgenotesBySlug
 * @flow
 */

import * as R from 'ramda'
import produce from 'immer'
import { paramCase } from 'change-case'

import type { EdgenotesState } from 'redux/state'
import type {
  AddEdgenoteAction,
  UpdateEdgenoteAction,
  RemoveEdgenoteAction,
} from 'redux/actions'

export default function edgenotesBySlug (
  state: EdgenotesState = ({
    ...dasherizeKeys(window.caseData.edgenotes),
  }: EdgenotesState),
  action: AddEdgenoteAction | UpdateEdgenoteAction | RemoveEdgenoteAction
): EdgenotesState {
  switch (action.type) {
    case 'ADD_EDGENOTE':
      return {
        ...state,
        [action.slug]: action.data,
      }

    case 'UPDATE_EDGENOTE':
      return {
        ...state,
        [action.slug]: {
          ...state[action.slug],
          ...action.data,
        },
      }

    case 'REMOVE_EDGENOTE':
      return produce(state, state => {
        delete state[action.slug]
      })

    default:
      return state
  }
}

const renameBy = R.curry((fn, obj) =>
  R.pipe(R.toPairs, R.map(R.adjust(fn, 0)), R.fromPairs)(obj)
)
const dasherizeKeys = renameBy(paramCase)
