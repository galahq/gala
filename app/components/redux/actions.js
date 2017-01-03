export const HIGHLIGHT_EDGENOTE = "HIGHLIGHT_EDGENOTE"
export const ACTIVATE_EDGENOTE = "ACTIVATE_EDGENOTE"

export const OPEN_CITATION = "OPEN_CITATION"




export function highlightEdgenote(slug) {
  return {type: HIGHLIGHT_EDGENOTE, slug}
}

export function activateEdgenote(slug) {
  return {type: ACTIVATE_EDGENOTE, slug}
}

export function openCitation(key) {
  return {type: OPEN_CITATION, key}
}
