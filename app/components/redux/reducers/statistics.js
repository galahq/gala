import type { StatisticsState } from 'redux/state'
import type { SetStatisticsAction } from 'redux/actions'

export default function statistics (
  state: StatisticsState = {},
  action: SetStatisticsAction,
): StatisticsState {
  switch (action.type) {
    case 'SET_STATISTICS':
      return {
        ...state,
        [action.uri]: action.data,
      }

    default: return state
  }
}
