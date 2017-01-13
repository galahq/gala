// Models
export const UPDATE_CARD_CONTENTS = "UPDATE_CARD_CONTENTS"
export function updateCardContents(id, editorState) {
  return {type: UPDATE_CARD_CONTENTS, id, editorState}
}

export const CREATE_EDGENOTE = "CREATE_EDGENOTE"
export function createEdgenote(slug, data) {
  return {type: CREATE_EDGENOTE, slug, data}
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
