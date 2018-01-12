/**
 * @providesModule edgenotesBySlug
 * @flow
 */

import produce from 'immer'

import type { EdgenotesState } from 'redux/state'
import type {
  AddEdgenoteAction,
  UpdateEdgenoteAction,
  RemoveEdgenoteAction,
} from 'redux/actions'

export default function edgenotesBySlug (
  state: EdgenotesState = ({ ...window.caseData.edgenotes }: EdgenotesState),
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
