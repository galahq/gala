/**
 * @providesModule statistics
 *
 */


export default function statistics (
  state = window.caseData.statistics,
  action
) {
  if (!state) return false

  switch (action.type) {
    case 'SET_STATISTICS':
      return {
        ...state,
        [action.uri]: action.data,
      }

    default:
      return state
  }
}
