/**
 * @flow
 */

import { Intent } from '@blueprintjs/core'

import { Orchard } from 'shared/orchard'
import { displayToast } from 'redux/actions'

import type { ThunkAction, GetState, Dispatch } from 'redux/actions'
import type { SuggestedQuiz } from 'redux/state'

export function fetchSuggestedQuizzes (): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    const {
      caseData: { slug },
      edit: { unsavedChanges },
    } = getState()

    if (includesUnsavedQuiz(unsavedChanges)) return

    return Orchard.harvest(`cases/${slug}/quizzes`).then(
      (quizzes: SuggestedQuiz[]) => {
        dispatch(setSuggestedQuizzes(quizzes))
      }
    )
  }
}

function includesUnsavedQuiz (unsavedChanges) {
  return Object.keys(unsavedChanges).some(
    key => key.startsWith('quizzes') && unsavedChanges[key]
  )
}

export type SetSuggestedQuizzesAction = {
  type: 'SET_SUGGESTED_QUIZZES',
  quizzes: SuggestedQuiz[],
}
function setSuggestedQuizzes (
  quizzes: SuggestedQuiz[]
): SetSuggestedQuizzesAction {
  return { type: 'SET_SUGGESTED_QUIZZES', quizzes }
}

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

export function deleteSuggestedQuiz (param: string): ThunkAction {
  return (dispatch: Dispatch) => {
    return Orchard.prune(`quizzes/${param}`).then(() => {
      dispatch(removeSuggestedQuiz(param))
      dispatch(
        displayToast({
          intent: Intent.SUCCESS,
          icon: 'tick-circle',
          message: 'Quiz successfully deleted',
        })
      )
    })
  }
}

export type RemoveSuggestedQuizAction = {
  type: 'REMOVE_SUGGESTED_QUIZ',
  param: string,
}
function removeSuggestedQuiz (param: string): RemoveSuggestedQuizAction {
  return { type: 'REMOVE_SUGGESTED_QUIZ', param }
}
