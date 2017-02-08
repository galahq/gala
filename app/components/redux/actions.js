import { Orchard } from 'concerns/orchard.js'
import { convertToRaw } from 'draft-js'

const setUnsaved = () => window.onbeforeunload = () =>
  "You have unsaved changes. Are you sure you want to leave?"

// Models
export const UPDATE_CASE = "UPDATE_CASE"
export function updateCase(slug, data) {
  setUnsaved()
  return {type: UPDATE_CASE, data}
}

export const UPDATE_PAGE = "UPDATE_PAGE"
export function updatePage(id, data) {
  setUnsaved()
  return {type: UPDATE_PAGE, id, data}
}

export const UPDATE_CARD_CONTENTS = "UPDATE_CARD_CONTENTS"
export function updateCardContents(id, editorState) {
  setUnsaved()
  return {type: UPDATE_CARD_CONTENTS, id, editorState}
}

export const CREATE_EDGENOTE = "CREATE_EDGENOTE"
export function createEdgenote(slug, data) {
  return {type: CREATE_EDGENOTE, slug, data}
}

export const UPDATE_EDGENOTE = "UPDATE_EDGENOTE"
export function updateEdgenote(slug, data) {
  setUnsaved()
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
    window.onbeforeunload = null

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
    case 'cases': {
      let {published, kicker, title, dek, slug, photoCredit, summary,
        baseCoverUrl} = state.caseData
      data = {
        case: {
          published, kicker, title, dek, slug, photoCredit, summary,
          coverUrl: baseCoverUrl,
        },
      }
    }
      break

    case 'cards': {
      let {editorState} = state.cardsById[id]
      data = {
        card: {
          rawContent:
            JSON.stringify(convertToRaw(editorState.getCurrentContent())),
        },
      }
    }
      break

    case 'pages': {
      const { title, position } = state.pagesById[id]
      data = {
        page: {
          title,
          position,
        },
      }
    }
      break

    case 'edgenotes': {
      data = { edgenote: state.edgenotesBySlug[id] }
    }
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


// Comment Threads
export const APPLY_SELECTION = "APPLY_SELECTION"
export function applySelection(cardId, selectionState) {
  return { type: APPLY_SELECTION, cardId, selectionState }
}

export function createCommentThread(cardId, editorState) {
  return async (dispatch) => {
    const selection = editorState.getSelection()
    const start = selection.getStartOffset()
    const end = selection.getEndOffset()
    const length = end - start

    const blocks = editorState.getCurrentContent().getBlocksAsArray()
    const blockKey = selection.getStartKey()
    const blockIndex = blocks.findIndex(b => b.getKey() === blockKey)

    const originalHighlightText = blocks[blockIndex].getText().slice(start, end)

    let newCard = await Orchard.graft(`cards/${cardId}/comment_threads`, {
      commentThread: { blockIndex, start, length, originalHighlightText },
    })

    dispatch(replaceCard(cardId, newCard))
  }
}

export const REPLACE_CARD = "REPLACE_CARD"
function replaceCard(cardId, newCard) {
  return { type: REPLACE_CARD, cardId, newCard }
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

export const OPEN_COMMENTS = "OPEN_COMMENTS"
export function openComments(cardId) {
  return {type: OPEN_COMMENTS, cardId}
}
