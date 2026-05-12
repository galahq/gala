/**
 * 
 */

import { Orchard } from 'shared/orchard'


function setStatistics (uri, data) {
  return { type: 'SET_STATISTICS', uri, data }
}

export function loadStatistics (uri) {
  return async (dispatch) => {
    const data = (await Orchard.harvest(`${uri}/statistics`))
    dispatch(setStatistics(uri, data))
  }
}
