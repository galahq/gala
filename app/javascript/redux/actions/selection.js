/**
 * @flow
 */

import type { SelectionState } from 'draft-js'

export type AcceptSelectionAction = {
  type: 'ACCEPT_SELECTION',
  enabled: boolean,
}

export function acceptSelection (
  enabled: boolean = true
): AcceptSelectionAction {
  clearSelection()
  return { type: 'ACCEPT_SELECTION', enabled }
}

type OldDocument = { selection: { empty: () => void } }
function clearSelection (): void {
  if (document.selection) {
    ;((document: any): OldDocument).selection.empty()
  } else if (window.getSelection) {
    window.getSelection().removeAllRanges()
  }
}

export type ApplySelectionAction = {
  type: 'APPLY_SELECTION',
  cardId: string,
  selectionState: SelectionState,
}
export function applySelection (
  cardId: string,
  selectionState: SelectionState
): ApplySelectionAction {
  return { type: 'APPLY_SELECTION', cardId, selectionState }
}
