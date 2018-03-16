/**
 * @flow
 */

import { Orchard } from 'shared/orchard'

import type { ThunkAction, Dispatch } from 'redux/actions'
import type { StatisticsData } from 'redux/state'

export type SetStatisticsAction = {
  type: 'SET_STATISTICS',
  uri: string,
  data: StatisticsData,
}
function setStatistics (uri: string, data: StatisticsData): SetStatisticsAction {
  return { type: 'SET_STATISTICS', uri, data }
}

export function loadStatistics (uri: string): ThunkAction {
  return async (dispatch: Dispatch) => {
    const data = (await Orchard.harvest(`${uri}/statistics`): StatisticsData)
    dispatch(setStatistics(uri, data))
  }
}
