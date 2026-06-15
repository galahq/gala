/**
 * @providesModule caseData
 *
 */

import update from 'immutability-helper'
import produce from 'immer'




// TODO this is how the inital caseData state is set
export default function caseData (
  state = ({ ...window.caseData }),
  action
) {
  switch (action.type) {
    case 'UPDATE_CASE':
    case 'UPDATE_CASE_ELEMENTS':
      return {
        ...state,
        ...action.data,
      }

    case 'SET_READER_ENROLLMENT':
      return {
        ...state,
        reader: {
          ...state.reader,
          enrollment: action.enrollment ? { status: 'student' } : null,
        },
      }

    case 'UPDATE_CASE_ELEMENT': {
      const { id } = action
      const originalIndex = state.caseElements.findIndex(x => x.id === id)

      return update(state, {
        caseElements: {
          $splice: [
            [originalIndex, 1],
            [action.index, 0, state.caseElements[originalIndex]],
          ],
        },
      })
    }

    case 'ADD_PAGE':
    case 'ADD_PODCAST': {
      const { caseElement } = action.data
      return {
        ...state,
        caseElements: [...state.caseElements, caseElement],
      }
    }

    case 'REMOVE_ELEMENT':
      return {
        ...state,
        caseElements: [
          ...state.caseElements.slice(0, action.position),
          ...state.caseElements.slice(action.position + 1),
        ],
      }

    case 'SET_FORUMS': {
      const activeCommunity = action.forums
        .map(forum => forum.community)
        .find(community => community.active)

      return produce(state, draft => {
        if (activeCommunity && draft.reader) {
          draft.reader.activeCommunity = activeCommunity
        }
      })
    }

    case 'TOGGLE_EDITING':
      return { ...state, commentable: false }

    default:
      return state
  }
}
