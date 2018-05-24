/**
 * @flow
 */

import { Orchard } from 'shared/orchard'

import type { ThunkAction, Dispatch } from 'redux/actions'
import type { CaseElement } from 'redux/state'

export type UpdateCaseElementAction = {
  type: 'UPDATE_CASE_ELEMENT',
  id: number,
  index: number,
}

export function updateCaseElement (
  id: number,
  index: number
): UpdateCaseElementAction {
  return { type: 'UPDATE_CASE_ELEMENT', id, index }
}

export type UpdateCaseElementsAction = {
  type: 'UPDATE_CASE_ELEMENTS',
  data: { caseElements: CaseElement[] },
}

export function updateCaseElements (data: {
  caseElements: CaseElement[],
}): UpdateCaseElementsAction {
  return { type: 'UPDATE_CASE_ELEMENTS', data }
}

export function persistCaseElementReordering (
  id: string,
  index: number
): ThunkAction {
  return async (dispatch: Dispatch) => {
    const caseElements = (await Orchard.espalier(`case_elements/${id}`, {
      case_element: { position: index + 1 },
    }): CaseElement[])
    dispatch(updateCaseElements({ caseElements }))
  }
}

export type RemoveElementAction = { type: 'REMOVE_ELEMENT', position: number }

export function removeElement (position: number): RemoveElementAction {
  return { type: 'REMOVE_ELEMENT', position }
}

export function deleteElement (
  elementUrl: string,
  position: number
): ThunkAction {
  return async (dispatch: Dispatch) => {
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
