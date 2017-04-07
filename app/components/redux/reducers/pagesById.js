import type { PagesState } from 'redux/state'
import type { UpdatePageAction, AddPageAction } from 'redux/actions'

export default function pagesById (
  state: PagesState = ({ ...window.caseData.pages }: PagesState),
  action: UpdatePageAction | AddPageAction,
): PagesState {
  switch (action.type) {
    case 'UPDATE_PAGE':
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          ...action.data,
        },
      }

    case 'ADD_PAGE':
      return {
        ...state,
        [action.data.id]: action.data,
      }

    default: return state
  }
}
