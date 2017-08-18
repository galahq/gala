/**
 * @providesModule communities
 * @flow
 */

import type { Community } from 'redux/state'
import type { SetCommunitiesAction } from 'redux/actions'

type Action = SetCommunitiesAction
export default function communities (
  state: Community[] = [],
  action: Action
): Community[] {
  switch (action.type) {
    case 'SET_COMMUNITIES':
      return action.communities

    default:
      return state
  }
}
