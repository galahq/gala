/**
 * @providesModule suggestedQuizzes
 * @flow
 */

import type { SuggestedQuizzesState } from 'redux/state'

import type {
  AddSuggestedQuizAction,
  UpdateSuggestedQuizAction,
} from 'redux/actions'

type Action = AddSuggestedQuizAction | UpdateSuggestedQuizAction

export default function suggestedQuizzes (
  state: SuggestedQuizzesState = {},
  action: Action
) {
  switch (action.type) {
    case 'ADD_SUGGESTED_QUIZ':
    case 'UPDATE_SUGGESTED_QUIZ':
      return {
        ...state,
        [action.param]: action.data,
      }

    default:
      return state
  }
}
