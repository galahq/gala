/**
 * @flow
 */

import { setUnsaved, removeElement } from 'redux/actions'

import { Orchard } from 'shared/orchard'

import type { Dispatch, GetState, ThunkAction } from 'redux/actions'
import type { Activity } from 'redux/state'

export type AddActivityAction = { type: 'ADD_ACTIVITY', data: Activity }
export function addActivity (data: Activity): AddActivityAction {
  return { type: 'ADD_ACTIVITY', data }
}

export function createActivity (caseSlug: string) {
  return async (dispatch: Dispatch) => {
    const data = (await Orchard.graft(
      `cases/${caseSlug}/activities`,
      {}
    ): Activity)
    dispatch(addActivity(data))
  }
}

export type UpdateActivityAction = {
  type: 'UPDATE_ACTIVITY',
  id: string,
  data: $Shape<Activity>,
  needsSaving: boolean,
}
export function updateActivity (
  id: string,
  data: $Shape<Activity>,
  needsSaving?: boolean = true
): UpdateActivityAction {
  if (needsSaving) setUnsaved()
  return { type: 'UPDATE_ACTIVITY', id, data, needsSaving }
}

export function removeActivity (id: string): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    const { position } = getState().activitiesById[id].caseElement
    dispatch(removeElement(position - 1))
  }
}
