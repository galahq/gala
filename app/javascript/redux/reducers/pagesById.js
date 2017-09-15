/**
 * @providesModule pagesById
 * @flow
 */

import { map, without, insert } from 'ramda'

import type { PagesState } from 'redux/state'
import type {
  UpdatePageAction,
  AddPageAction,
  RemoveCardAction,
  AddCardAction,
} from 'redux/actions'

export default function pagesById (
  state: PagesState = ({ ...window.caseData.pages }: PagesState),
  action: UpdatePageAction | AddPageAction | RemoveCardAction | AddCardAction
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

    case 'ADD_CARD': {
      const { pageId, data } = action
      const { id, position } = data
      const oldPage = state[pageId]
      return {
        ...state,
        [pageId]: {
          ...oldPage,
          cards: insert(position - 1, id, oldPage.cards),
        },
      }
    }

    case 'REMOVE_CARD': {
      const { id } = action
      return map(page => ({ ...page, cards: without([id], page.cards) }), state)
    }

    default:
      return state
  }
}
