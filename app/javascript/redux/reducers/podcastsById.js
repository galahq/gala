/**
 * @providesModule podcastsById
 * 
 */


export default function podcastsById (
  state = ({ ...window.caseData.podcasts }),
  action
) {
  switch (action.type) {
    case 'UPDATE_PODCAST':
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...action.data,
        },
      }

    case 'ADD_PODCAST':
      return {
        ...state,
        [action.data.id]: action.data,
      }

    default:
      return state
  }
}
