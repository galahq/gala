/**
 * @providesModule suggestedQuizzes
 *
 */

import produce from 'immer'




export default function suggestedQuizzes (
  state = {},
  action
) {
  switch (action.type) {
    case 'SET_SUGGESTED_QUIZZES':
      return action.quizzes.reduce((obj, quiz) => {
        obj[quiz.param] = quiz
        return obj
      }, {})

    case 'ADD_SUGGESTED_QUIZ':
      return {
        ...state,
        [action.param]: action.data,
      }
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
