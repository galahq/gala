/**
 * 
 */

import { setUnsaved, removeElement } from 'redux/actions'

import { Orchard } from 'shared/orchard'


export function addPodcast (data) {
  return { type: 'ADD_PODCAST', data }
}

export function createPodcast (caseSlug) {
  return async (dispatch) => {
    const data = (await Orchard.graft(
      `cases/${caseSlug}/podcasts`,
      {}
    ))
    dispatch(addPodcast(data))
  }
}

export function updatePodcast (
  id,
  data,
  needsSaving = true
) {
  if (needsSaving) setUnsaved()
  return { type: 'UPDATE_PODCAST', id, data, needsSaving }
}

export function removePodcast (id) {
  return (dispatch, getState) => {
    const { position } = getState().podcastsById[id].caseElement
    dispatch(removeElement(position - 1))
  }
}
