/**
 * 
 */

import { Intent } from '@blueprintjs/core'

import { Orchard, ignoreClientError } from 'shared/orchard'
import { displayToast } from 'redux/actions'


export function fetchSuggestedQuizzes () {
  return (dispatch, getState) => {
    const {
      caseData: { slug },
      edit: { unsavedChanges },
    } = getState()

    if (includesUnsavedQuiz(unsavedChanges)) return

    return Orchard.harvest(`cases/${slug}/quizzes`)
      .then((quizzes) => {
        dispatch(setSuggestedQuizzes(quizzes))
      })
      .catch(ignoreClientError) // 403 on mount if case-update rights were lost
  }
}

function includesUnsavedQuiz (unsavedChanges) {
  return Object.keys(unsavedChanges).some(
    key => key.startsWith('quizzes') && unsavedChanges[key]
  )
}

function setSuggestedQuizzes (
  quizzes
) {
  return { type: 'SET_SUGGESTED_QUIZZES', quizzes }
}

export function createSuggestedQuiz (quiz) {
  return (dispatch, getState) => {
    const { slug } = getState().caseData
    // Wrap the quiz data in a 'quiz' key as expected by Rails
    const quizData = {
      quiz: {
        title: quiz.title,
        questions: quiz.questions,
      },
    }
    return Orchard.graft(`cases/${slug}/quizzes`, quizData).then(
      (newQuiz) => {
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

export function newSuggestedQuiz (quiz) {
  return (dispatch, getState) => {
    dispatch(addSuggestedQuiz("new", { ...quiz, param: "new" }))
    return Promise.resolve("new")
  }
}

export function addSuggestedQuiz (
  param,
  data
) {
  return { type: 'ADD_SUGGESTED_QUIZ', param, data }
}

export function updateSuggestedQuiz (
  param,
  data
) {
  return (dispatch) => {
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
      (updatedQuiz) => {
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

export function deleteSuggestedQuiz (param) {
  return (dispatch) => {
    return Orchard.prune(`quizzes/${param}`)
      .then(() => {
        dispatch(removeSuggestedQuiz(param))
        dispatch(
          displayToast({
            intent: Intent.SUCCESS,
            icon: 'tick-circle',
            message: 'Quiz successfully deleted',
          })
        )
      })
      .catch(ignoreClientError) // 403 (permission) / 404 (already deleted)
  }
}

export function removeSuggestedQuiz (param) {
  return { type: 'REMOVE_SUGGESTED_QUIZ', param }
}
