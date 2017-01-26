import { Orchard } from 'concerns/orchard.js'
import { convertToRaw } from 'draft-js'

// Models
export const UPDATE_CASE = "UPDATE_CASE"
export function updateCase(slug, data) {
  return {type: UPDATE_CASE, data}
}

export const UPDATE_CARD_CONTENTS = "UPDATE_CARD_CONTENTS"
export function updateCardContents(id, editorState) {
  return {type: UPDATE_CARD_CONTENTS, id, editorState}
}

export const CREATE_EDGENOTE = "CREATE_EDGENOTE"
export function createEdgenote(slug, data) {
  return {type: CREATE_EDGENOTE, slug, data}
}

export const UPDATE_EDGENOTE = "UPDATE_EDGENOTE"
export function updateEdgenote(slug, data) {
  return {type: UPDATE_EDGENOTE, slug, data}
}

// Edit
export const TOGGLE_EDITING = "TOGGLE_EDITING"
export function toggleEditing() {
  return {type: TOGGLE_EDITING}
}

export function saveChanges() {
  return (dispatch, getState) => {
    const state = {...getState()}

    dispatch(clearUnsaved())

    Object.keys(state.edit.unsavedChanges).forEach(
      endpoint => {
        saveModel(
          endpoint === 'caseData' ? `cases/${state.caseData.slug}` : endpoint,
          state)
      }
    )
  }
}

async function saveModel(endpoint, state) {
  const [model, id] = endpoint.split('/')

  let data
  switch (model) {
    case 'cases':
      let {published, kicker, title, dek, slug, photoCredit, summary,
        coverUrl} = state.caseData
      data = {
        case: {
          published, kicker, title, dek, slug, photoCredit, summary, coverUrl,
        },
      }
      break

    case 'cards':
      let {editorState} = state.cardsById[id]
      data = {
        card: {
          rawContent:
            JSON.stringify(convertToRaw(editorState.getCurrentContent())),
        },
      }
      break

    case 'pages':
      data = state.pagesById[id]
      break

    case 'edgenotes':
      data = { edgenote: state.edgenotesBySlug[id] }
      break

    default:
      throw "Bad model."
  }

  return await Orchard.espalier(endpoint, data)
}

export const CLEAR_UNSAVED = "CLEAR_UNSAVED"
function clearUnsaved() {
  return { type: CLEAR_UNSAVED }
}


// UI
export const HIGHLIGHT_EDGENOTE = "HIGHLIGHT_EDGENOTE"
export function highlightEdgenote(slug) {
  return {type: HIGHLIGHT_EDGENOTE, slug}
}

export const ACTIVATE_EDGENOTE = "ACTIVATE_EDGENOTE"
export function activateEdgenote(slug) {
  return {type: ACTIVATE_EDGENOTE, slug}
}

export const OPEN_CITATION = "OPEN_CITATION"
export function openCitation(key, labelRef) {
  return {type: OPEN_CITATION, data: {key, labelRef}}
}
