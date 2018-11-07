/**
 * @flow
 */

import { Orchard } from 'shared/orchard'

import type { ThunkAction, GetState, Dispatch } from 'redux/actions'
import type { SuggestedQuiz } from 'redux/state'

export function createSuggestedQuiz (): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    const { slug } = getState().caseData
    return Orchard.graft(`cases/${slug}/quizzes`, {}).then(
      (quiz: SuggestedQuiz) => {
        dispatch(addSuggestedQuiz(quiz.param, quiz))
        return quiz.param
      }
    )
  }
}

export type AddSuggestedQuizAction = {
  type: 'ADD_SUGGESTED_QUIZ',
  param: string,
  data: SuggestedQuiz,
}
function addSuggestedQuiz (
  param: string,
  data: SuggestedQuiz
): AddSuggestedQuizAction {
  return { type: 'ADD_SUGGESTED_QUIZ', param, data }
}

export type UpdateSuggestedQuizAction = {
  type: 'UPDATE_SUGGESTED_QUIZ',
  param: string,
  data: SuggestedQuiz,
}
export function updateSuggestedQuiz (
  param: string,
  data: SuggestedQuiz
): UpdateSuggestedQuizAction {
  return { type: 'UPDATE_SUGGESTED_QUIZ', param, data }
}
