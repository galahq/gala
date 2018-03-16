/**
 * @flow
 */

import { setUnsaved } from 'redux/actions'

import { Orchard } from 'shared/orchard'

import type { ThunkAction, Dispatch } from 'redux/actions'
import type { Page } from 'redux/state'

export type AddPageAction = { type: 'ADD_PAGE', data: Page }
function addPage (data: Page): AddPageAction {
  return { type: 'ADD_PAGE', data }
}

export function createPage (caseSlug: string): ThunkAction {
  return async (dispatch: Dispatch) => {
    const data: Page = await Orchard.graft(`cases/${caseSlug}/pages`, {})
    dispatch(addPage(data))
  }
}

export type UpdatePageAction = {
  type: 'UPDATE_PAGE',
  id: string,
  data: $Shape<Page>,
}
export function updatePage (id: string, data: $Shape<Page>): UpdatePageAction {
  setUnsaved()
  return { type: 'UPDATE_PAGE', id, data }
}
