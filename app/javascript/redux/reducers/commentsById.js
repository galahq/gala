/**
 * @providesModule commentsById
 * 
 */

import { omit } from 'ramda'


export default function commentsById (
  state = ({ ...window.caseData.comments }),
  action
) {
  switch (action.type) {
    case 'SET_COMMENTS_BY_ID':
      return action.commentsById || {}

    case 'ADD_COMMENT':
      return {
        ...state,
        [action.data.id]: action.data,
      }

    case 'REMOVE_COMMENT':
      return omit([`${action.id}`], state)

    default:
      return state
  }
}
