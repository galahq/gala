/**
 * @flow
 */

import { setUnsaved, createCard, removeElement } from 'redux/actions'

import { Orchard } from 'shared/orchard'

import type { ThunkAction, Dispatch, GetState } from 'redux/actions'
import type { Page } from 'redux/state'

export type AddPageAction = { type: 'ADD_PAGE', data: Page }
export function addPage (data: Page): AddPageAction {
  return { type: 'ADD_PAGE', data }
}

export function createPage (caseSlug: string): ThunkAction {
  return async (dispatch: Dispatch) => {
    const data: Page = await Orchard.graft(`cases/${caseSlug}/pages`, {})
    dispatch(addPage(data))
    dispatch(createCard(data.id))
  }
}

export type UpdatePageAction = {
  type: 'UPDATE_PAGE',
  id: string,
  data: $Shape<Page>,
  needsSaving: boolean,
}
export function updatePage (
  id: string,
  data: $Shape<Page>,
  needsSaving?: boolean = true
): UpdatePageAction {
  if (needsSaving) setUnsaved()
  return { type: 'UPDATE_PAGE', id, data, needsSaving }
}

export function removePage (id: string): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    const { position } = getState().pagesById[id].caseElement
    dispatch(removeElement(position - 1))
  }
}
