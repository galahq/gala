/**
 * @providesModule caseData
 * @flow
 */

import update from 'immutability-helper'
import { insert } from 'ramda'

import type {
  UpdateCaseAction,
  SetReaderEnrollmentAction,
  UpdateCaseElementAction,
  UpdateCaseElementsAction,
  RemoveElementAction,
  AddPageAction,
  AddPodcastAction,
  SetCommunitiesAction,
  ToggleEditingAction,
} from 'redux/actions'

import type { CaseDataState } from 'redux/state'

type Action =
  | UpdateCaseAction
  | SetReaderEnrollmentAction
  | UpdateCaseElementAction
  | UpdateCaseElementsAction
  | RemoveElementAction
  | AddPageAction
  | AddPodcastAction
  | SetCommunitiesAction
  | ToggleEditingAction

export default function caseData (
  state: CaseDataState = ({ ...window.caseData }: CaseDataState),
  action: Action
): CaseDataState {
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
        caseElements: insert(
          caseElement.position - 1,
          caseElement,
          state.caseElements
        ),
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

    case 'SET_COMMUNITIES': {
      return {
        ...state,
        reader: {
          ...state.reader,
          activeCommunity:
            action.communities.find(x => x.active) ||
            (state.reader ? state.reader.activeCommunity : null),
        },
      }
    }

    case 'TOGGLE_EDITING':
      return { ...state, commentable: false }

    default:
      return state
  }
}
