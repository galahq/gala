// @flow
import type { ActivitiesState } from 'redux/state'
import type { UpdateActivityAction, AddActivityAction } from 'redux/actions'

type Action = UpdateActivityAction | AddActivityAction

export default function activitiesById (
  state: ActivitiesState = ({ ...window.caseData.activities }: ActivitiesState),
  action: Action,
): ActivitiesState {
  switch (action.type) {
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...action.data,
        },
      }

    case 'ADD_ACTIVITY':
      return {
        ...state,
        [action.data.id]: action.data,
      }

    default:
      return state
  }
}
