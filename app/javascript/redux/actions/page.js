/**
 * 
 */

import { setUnsaved, createCard, removeElement } from 'redux/actions'

import { Orchard, ignoreClientError } from 'shared/orchard'


export function addPage (data) {
  return { type: 'ADD_PAGE', data }
}

export function createPage (caseSlug) {
  return async (dispatch) => {
    try {
      const data = await Orchard.graft(`cases/${caseSlug}/pages`, {})
      dispatch(addPage(data))
      dispatch(createCard(data.id))
    } catch (e) {
      ignoreClientError(e) // 403 (lost edit rights) / 404 (stale slug)
    }
  }
}

export function updatePage (
  id,
  data,
  needsSaving = true
) {
  if (needsSaving) setUnsaved()
  return { type: 'UPDATE_PAGE', id, data, needsSaving }
}

export function removePage (id) {
  return (dispatch, getState) => {
    const { position } = getState().pagesById[id].caseElement
    dispatch(removeElement(position - 1))
  }
}
