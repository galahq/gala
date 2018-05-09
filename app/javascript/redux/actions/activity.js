/**
 * @flow
 */

import { setUnsaved } from 'redux/actions'

import { Orchard } from 'shared/orchard'

import type { Dispatch } from 'redux/actions'
import type { Activity } from 'redux/state'

export type AddActivityAction = { type: "ADD_ACTIVITY", data: Activity }
function addActivity (data: Activity): AddActivityAction {
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
  type: "UPDATE_ACTIVITY",
  id: string,
  data: $Shape<Activity>,
}
export function updateActivity (
  id: string,
  data: $Shape<Activity>,
  needsSaving?: boolean = true
): UpdateActivityAction {
  if (needsSaving) setUnsaved()
  return { type: 'UPDATE_ACTIVITY', id, data }
}
