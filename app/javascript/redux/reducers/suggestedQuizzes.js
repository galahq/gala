/**
 * @providesModule suggestedQuizzes
 * @flow
 */

import produce from 'immer'

import type { SuggestedQuizzesState } from 'redux/state'

import type {
  SetSuggestedQuizzesAction,
  AddSuggestedQuizAction,
  UpdateSuggestedQuizAction,
  RemoveSuggestedQuizAction,
} from 'redux/actions'

type Action =
  | SetSuggestedQuizzesAction
  | AddSuggestedQuizAction
  | UpdateSuggestedQuizAction
  | RemoveSuggestedQuizAction

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

    case 'REMOVE_SUGGESTED_QUIZ': {
      const { param } = action
      return produce(state, draft => {
        delete draft[param]
      })
    }

    default:
      return state
  }
}
