/**
 * @flow
 */

import { displayToast } from 'redux/actions'

import { Intent } from '@blueprintjs/core'
import { EditorState, convertToRaw } from 'draft-js'
import { Orchard } from 'shared/orchard'

import type { ThunkAction, GetState } from 'redux/actions'
import type { State } from 'redux/state'

export type ToggleEditingAction = { type: 'TOGGLE_EDITING' }
export function toggleEditing (): ToggleEditingAction {
  return { type: 'TOGGLE_EDITING' }
}

export function saveChanges (): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    const state = getState()

    dispatch(clearUnsaved())
    dispatch(
      displayToast({
        message: 'Saved successfully',
        intent: Intent.SUCCESS,
      })
    )

    Object.keys(state.edit.unsavedChanges).forEach(endpoint => {
      saveModel(
        endpoint === 'caseData' ? `cases/${state.caseData.slug}` : endpoint,
        state
      )
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
            coverUrl: baseCoverUrl,
          },
        }
      }
      break

    case 'cards':
      {
        const editorState =
          state.cardsById[id].editorState || EditorState.createEmpty()
        data = {
          card: {
            rawContent: convertToRaw(editorState.getCurrentContent()),
          },
        }
      }
      break

    case 'pages':
      {
        const { title, position } = state.pagesById[id]
        data = {
          page: {
            title,
            position,
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

    case 'activities':
      {
        const { title, pdfUrl, iconSlug } = state.activitiesById[id]
        data = {
          activity: {
            title,
            pdfUrl,
            iconSlug,
          },
        }
      }
      break

    case 'edgenotes':
      data = { edgenote: state.edgenotesBySlug[id] }

      break

    default:
      throw Error('Bad model.')
  }

  return Orchard.espalier(endpoint, data)
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
