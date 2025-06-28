/**
 * @flow
 */

import {
  deleteEnqueuedLocks,
  displayToast,
  displayErrorToast,
  reloadLocks,
} from 'redux/actions'

import { Intent } from '@blueprintjs/core'
import { EditorState, convertToRaw } from 'draft-js'
import { Orchard, OrchardError, OrchardInputError } from 'shared/orchard'

import type {
  Dispatch,
  ThunkAction,
  GetState,
  DisplayErrorToastOptions,
} from 'redux/actions'
import type { State } from 'redux/state'

export type ToggleEditingAction = { type: 'TOGGLE_EDITING' }
export function toggleEditing (): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    if (window.autosaveInterval) {
      window.clearInterval(window.autosaveInterval)
      delete window.autosaveInterval
    } else {
      window.autosaveInterval = window.setInterval(
        () => dispatch(silentlySave()),
        5000 // 5 sec
      )
    }

    dispatch(reloadLocks())
    dispatch({ type: 'TOGGLE_EDITING' })
  }
}

export function saveChanges (): ThunkAction {
  return (dispatch: Dispatch) => {
    dispatch(silentlySave()).then(() =>
      dispatch(
        displayToast({
          message: 'Saved successfully',
          icon: 'tick',
          intent: Intent.SUCCESS,
        })
      )
    )
  }
}

function silentlySave (): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    const state = getState()
    const unsavedChanges = Object.keys(state.edit.unsavedChanges)

    return Promise.all(
      unsavedChanges.map(endpoint =>
        saveModel(
          endpoint === 'caseData' ? `cases/${state.caseData.slug}` : endpoint,
          state
        ).catch(e => {
          handleError(e, (...args) => {
            dispatch(displayErrorToast(...args))
          })
        })
      )
    ).then(() => {
      if (unsavedChanges.length > 0) dispatch(clearUnsaved())
      dispatch(deleteEnqueuedLocks())
    })
  }
}

async function saveModel (endpoint: string, state: State): Promise<Object> {
  const [model, id] = endpoint.split('/')

  let data
  switch (model) {
    case 'cases':
      {
        const {
          kicker,
          title,
          dek,
          slug,
          photoCredit,
          summary,
          baseCoverUrl,
          learningObjectives,
          authors,
          translators,
          acknowledgements,
          latitude,
          longitude,
          zoom,
          wikidataLinks,
        } = state.caseData
        data = {
          case: {
            kicker,
            title,
            dek,
            slug,
            photoCredit,
            summary,
            learningObjectives,
            authors,
            translators,
            acknowledgements,
            latitude,
            longitude,
            zoom,
            wikidataLinks,
            coverUrl: baseCoverUrl,
          },
        }
      }
      break

    case 'cards':
      {
        const card = state.cardsById[id]
        const editorState = card.editorState || EditorState.createEmpty()
        data = {
          card: {
            position: card.position,
            rawContent: convertToRaw(editorState.getCurrentContent()),
          },
        }
      }
      break

    case 'pages':
      {
        const { title, position, iconSlug } = state.pagesById[id]
        data = {
          page: {
            title,
            position,
            iconSlug,
          },
        }
      }
      break

    case 'podcasts':
      {
        const {
          creditsList,
          title,
          artworkUrl,
          audioUrl,
          photoCredit,
        } = state.podcastsById[id]
        data = {
          podcast: {
            creditsList,
            title,
            artworkUrl,
            audioUrl,
            photoCredit,
          },
        }
      }
      break

    case 'edgenotes':
      data = { edgenote: state.edgenotesBySlug[id] }

      break

    case 'quizzes':
      {
        const { title, questions } = state.suggestedQuizzes[id]
        data = { quiz: { title, questions }}
      }
      break

    default:
      throw Error('Bad model.')
  }

  return Orchard.espalier(endpoint, data)
}

function handleError (
  e: Error,
  displayErrorMessage: (string, ?DisplayErrorToastOptions) => any
) {
  if (e instanceof OrchardInputError) {
    displayErrorMessage(e.message)
    return
  } else if (e instanceof OrchardError) {
    switch (e.status) {
      case 404:
        return
      case 409:
      case 423:
        displayErrorMessage(e.message)
        return
    }
  }
  displayErrorMessage(e.message, { suggestReload: true })
  throw e
}

export function setUnsaved () {
  window.onbeforeunload = () =>
    'You have unsaved changes. Are you sure you ' + 'want to leave?'
}

export type ClearUnsavedAction = { type: 'CLEAR_UNSAVED' }

export function clearUnsaved (): ClearUnsavedAction {
  window.onbeforeunload = null
  return { type: 'CLEAR_UNSAVED' }
}
