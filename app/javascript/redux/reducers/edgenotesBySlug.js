/**
 * @providesModule edgenotesBySlug
 * @flow
 */

import type { EdgenotesState } from 'redux/state'
import type { AddEdgenoteAction, UpdateEdgenoteAction } from 'redux/actions'

export default function edgenotesBySlug (
  state: EdgenotesState = ({ ...window.caseData.edgenotes }: EdgenotesState),
  action: AddEdgenoteAction | UpdateEdgenoteAction
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

    default:
      return state
  }
}
