/**
 * @providesModule suggestedQuizzes
 * @flow
 */

import type { SuggestedQuizzesState } from 'redux/state'

import type {
  SetSuggestedQuizzesAction,
  AddSuggestedQuizAction,
  UpdateSuggestedQuizAction,
} from 'redux/actions'

type Action =
  | SetSuggestedQuizzesAction
  | AddSuggestedQuizAction
  | UpdateSuggestedQuizAction

export default function suggestedQuizzes (
  state: SuggestedQuizzesState = {},
  action: Action
) {
  switch (action.type) {
    case 'SET_SUGGESTED_QUIZZES':
      return action.quizzes.reduce((obj, quiz) => {
        obj[quiz.param] = quiz
        return obj
      }, {})

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
