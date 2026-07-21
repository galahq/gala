/**
 * 
 */



export function acceptSelection (
  enabled = true
) {
  clearSelection()
  return { type: 'ACCEPT_SELECTION', enabled }
}

function clearSelection () {
  if ((document).selection) {
    ;((document)).selection.empty()
  } else if (window.getSelection) {
    window.getSelection().removeAllRanges()
  }
}

export function applySelection (
  cardId,
  selectionState
) {
  return { type: 'APPLY_SELECTION', cardId, selectionState }
}
