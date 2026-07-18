/**
 *
 */

import { Orchard, ignoreClientError } from 'shared/orchard'


function setStatistics (uri, data) {
  return { type: 'SET_STATISTICS', uri, data }
}

export function loadStatistics (uri) {
  return async (dispatch) => {
    try {
      const data = await Orchard.harvest(`${uri}/statistics`)
      dispatch(setStatistics(uri, data))
    } catch (e) {
      ignoreClientError(e) // 401/403 (auth) or 404 (missing trackable)
    }
  }
}
