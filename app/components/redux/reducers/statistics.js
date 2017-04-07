import type { StatisticsState } from 'redux/state'
import type { Action } from 'redux/actions'

export default function statistics (
  state: ?StatisticsState,
  action: Action,
): StatisticsState {
  if (typeof state === 'undefined') {
    return (window.caseData.statistics: StatisticsState) || {}
  }

  return state
}
