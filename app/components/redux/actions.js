import { Orchard } from 'concerns/orchard.js'

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

// Edit
export const TOGGLE_EDITING = "TOGGLE_EDITING"
export function toggleEditing() {
  return {type: TOGGLE_EDITING}
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
