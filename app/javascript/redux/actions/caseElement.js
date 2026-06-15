/**
 *
 */

import { Orchard } from 'shared/orchard'
import { reorder } from 'shared/functions'



export function updateCaseElement (
  id,
  index
) {
  return { type: 'UPDATE_CASE_ELEMENT', id, index }
}


export function updateCaseElements (data) {
  return { type: 'UPDATE_CASE_ELEMENTS', data }
}

export function reorderCaseElements (
  sourceIndex,
  destinationIndex
) {
  return (dispatch, getState) => {
    const {
      caseData: { caseElements },
    } = getState()

    const element = caseElements[sourceIndex]

    dispatch(
      updateCaseElements({
        caseElements: reorder(sourceIndex, destinationIndex, caseElements),
      })
    )

    dispatch(persistCaseElementReordering(element, destinationIndex))
  }
}

export function persistCaseElementReordering (
  caseElement,
  destinationIndex
) {
  return async (dispatch) => {
    const caseElements = await Orchard.espalier(
      `case_elements/${caseElement.id}`,
      { case_element: { position: destinationIndex + 1 }}
    )

    dispatch(updateCaseElements({ caseElements }))
  }
}


export function removeElement (position) {
  return { type: 'REMOVE_ELEMENT', position }
}

export function deleteElement (
  elementUrl,
  position
) {
  return async (dispatch) => {
    if (
      window.confirm(
        'Are you sure you want to delete this element? This action cannot be undone.'
      )
    ) {
      await Orchard.prune(`${elementUrl}`)
      return dispatch(removeElement(position))
    }
  }
}
