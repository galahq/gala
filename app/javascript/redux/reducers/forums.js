/**
 * @providesModule forums
 * @flow
 */

import type { ForumsState } from 'redux/state'
import type { SetForumsAction } from 'redux/actions'

type Action = SetForumsAction
export default function forums (
  state: ForumsState = [],
  action: Action
): ForumsState {
  switch (action.type) {
    case 'SET_FORUMS':
      return action.forums

    default:
      return state
  }
}
