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

export function createSuggestedQuiz (quiz: SuggestedQuiz): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    const { slug } = getState().caseData
    // Wrap the quiz data in a 'quiz' key as expected by Rails
    const quizData = {
      quiz: {
        title: quiz.title,
        questions: quiz.questions,
      },
    }
    return Orchard.graft(`cases/${slug}/quizzes`, quizData).then(
      (newQuiz: SuggestedQuiz) => {
        dispatch(addSuggestedQuiz(newQuiz.param, { ...newQuiz }))
        dispatch(
          displayToast({
            intent: Intent.SUCCESS,
            icon: 'tick-circle',
            message: 'Quiz successfully created',
          })
        )
        return newQuiz.param
      }
    )
  }
}

export function newSuggestedQuiz (quiz: SuggestedQuiz): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    dispatch(addSuggestedQuiz("new", { ...quiz, param: "new" }))
    return Promise.resolve("new")
  }
}

export type AddSuggestedQuizAction = {
  type: 'ADD_SUGGESTED_QUIZ',
  param: string,
  data: SuggestedQuiz,
}
export function addSuggestedQuiz (
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
): ThunkAction {
  return (dispatch: Dispatch) => {
    // Update Redux state immediately for optimistic UI
    dispatch({ type: 'UPDATE_SUGGESTED_QUIZ', param, data })

    // Wrap the quiz data in a 'quiz' key as expected by Rails
    const quizData = {
      quiz: {
        title: data.title,
        questions: data.questions,
      },
    }

    // Persist to backend
    return Orchard.espalier(`quizzes/${param}`, quizData).then(
      (updatedQuiz: SuggestedQuiz) => {
        // Update with server response
        dispatch({ type: 'UPDATE_SUGGESTED_QUIZ', param: updatedQuiz.param, data: updatedQuiz })
        dispatch(
          displayToast({
            intent: Intent.SUCCESS,
            icon: 'tick-circle',
            message: 'Quiz successfully updated',
          })
        )
      }
    ).catch((error) => {
      // Revert on error
      dispatch(fetchSuggestedQuizzes())
      throw error
    })
  }
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
export function removeSuggestedQuiz (param: string): RemoveSuggestedQuizAction {
  return { type: 'REMOVE_SUGGESTED_QUIZ', param }
}
