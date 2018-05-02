/**
 * @flow
 */

import { setUnsaved } from 'redux/actions'

import { Orchard } from 'shared/orchard'

import type { Dispatch } from 'redux/actions'
import type { Podcast } from 'redux/state'

export type AddPodcastAction = { type: 'ADD_PODCAST', data: Podcast }
function addPodcast (data: Podcast): AddPodcastAction {
  return { type: 'ADD_PODCAST', data }
}

export function createPodcast (caseSlug: string) {
  return async (dispatch: Dispatch) => {
    const data = (await Orchard.graft(
      `cases/${caseSlug}/podcasts`,
      {}
    ): Podcast)
    dispatch(addPodcast(data))
  }
}

export type UpdatePodcastAction = {
  type: 'UPDATE_PODCAST',
  id: string,
  data: $Shape<Podcast>,
  needsSaving: boolean,
}
export function updatePodcast (
  id: string,
  data: $Shape<Podcast>,
  needsSaving?: boolean = true
): UpdatePodcastAction {
  if (needsSaving) setUnsaved()
  return { type: 'UPDATE_PODCAST', id, data, needsSaving }
}
