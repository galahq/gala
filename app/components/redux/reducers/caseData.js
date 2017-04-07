// @flow
import update from 'react/lib/update'

import type {
  UpdateCaseAction,
  SetReaderEnrollmentAction,
  UpdateCaseElementAction,
  UpdateCaseElementsAction,
  RemoveElementAction,
  AddPageAction,
  AddPodcastAction,
  AddActivityAction,
} from 'redux/actions'

import type { CaseDataState } from 'redux/state'

type Action = UpdateCaseAction
  | SetReaderEnrollmentAction
  | UpdateCaseElementAction
  | UpdateCaseElementsAction
  | RemoveElementAction
  | AddPageAction
  | AddPodcastAction
  | AddActivityAction

export default function caseData (
  state: CaseDataState = ({ ...window.caseData }: CaseDataState),
  action: Action,
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
          enrollment: action.enrollment,
        },
      }

    case 'UPDATE_CASE_ELEMENT': {
      const { id } = action
      const originalIndex = state.caseElements.findIndex(x => (x.id === id))

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
    case 'ADD_PODCAST':
    case 'ADD_ACTIVITY': {
      const { caseElement } = action.data
      return {
        ...state,
        caseElements: [
          ...state.caseElements,
          caseElement,
        ],
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

    default: return state
  }
}
