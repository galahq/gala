/**
 * @providesModule communities
 * @flow
 */

import type { CommunitiesState } from 'redux/state'
import type { SetCommunitiesAction } from 'redux/actions'

type Action = SetCommunitiesAction
export default function communities (
  state: CommunitiesState = [],
  action: Action
): CommunitiesState {
  switch (action.type) {
    case 'SET_COMMUNITIES':
      return action.communities

    default:
      return state
  }
}
