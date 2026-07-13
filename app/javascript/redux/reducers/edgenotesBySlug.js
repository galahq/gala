/**
 * @providesModule edgenotesBySlug
 * 
 */

import produce from 'immer'


export default function edgenotesBySlug (
  state = ({
    ...window.caseData.edgenotes,
  }),
  action
) {
  switch (action.type) {
    case 'ADD_EDGENOTE':
      return {
        ...state,
        [action.slug]: action.data,
      }

    case 'UPDATE_EDGENOTE':
      return {
        ...state,
        [action.slug]: {
          ...state[action.slug],
          ...action.data,
        },
      }

    case 'REMOVE_EDGENOTE':
      return produce(state, state => {
        delete state[action.slug]
      })

    default:
      return state
  }
}
