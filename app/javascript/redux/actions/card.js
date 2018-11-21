/**
 * @flow
 */

import { setUnsaved, displayToast } from 'redux/actions'

import { Orchard } from 'shared/orchard'
import { Intent } from '@blueprintjs/core'
import { EditorState } from 'draft-js'

import type { ThunkAction, Dispatch } from 'redux/actions'
import type { CardsState, Card, Citation } from 'redux/state'

export type SetCardsAction = { type: 'SET_CARDS', cards: CardsState }
export function setCards (cards: CardsState): SetCardsAction {
  return { type: 'SET_CARDS', cards }
}

export type ParseAllCardsAction = { type: 'PARSE_ALL_CARDS' }
export function parseAllCards (): ParseAllCardsAction {
  return { type: 'PARSE_ALL_CARDS' }
}

export type AddCardAction = {
  type: 'ADD_CARD',
  pageId: string,
  data: Card,
}
export function addCard (pageId: string, data: Card): AddCardAction {
  return { type: 'ADD_CARD', pageId, data }
}

export function createCard (pageId: string): ThunkAction {
  return async (dispatch: Dispatch) => {
    const data: Card = await Orchard.graft(`pages/${pageId}/cards`, {
      card: { solid: true },
    })
    dispatch(addCard(pageId, data))
  }
}

export type UpdateCardContentsAction = {
  type: 'UPDATE_CARD_CONTENTS',
  id: string,
  editorState: EditorState,
}
export function updateCardContents (
  id: string,
  editorState: EditorState
): UpdateCardContentsAction {
  setUnsaved()
  return { type: 'UPDATE_CARD_CONTENTS', id, editorState }
}

export type ReplaceCardAction = {
  type: 'REPLACE_CARD',
  cardId: string,
  newCard: Card,
}
export function replaceCard (cardId: string, newCard: Card): ReplaceCardAction {
  return { type: 'REPLACE_CARD', cardId, newCard }
}

export type ReorderCardAction = {
  type: 'REORDER_CARD',
  id: string,
  destination: number,
}
export function reorderCard (
  id: string,
  destination: number
): ReorderCardAction {
  setUnsaved()
  return { type: 'REORDER_CARD', id, destination }
}

export type RemoveCardAction = {
  type: 'REMOVE_CARD',
  id: string,
}
export function removeCard (id: string): RemoveCardAction {
  return { type: 'REMOVE_CARD', id }
}

export function deleteCard (id: string) {
  return async (dispatch: Dispatch) => {
    if (
      window.confirm(
        'Are you sure you want to delete this card and its associated comments?'
      )
    ) {
      try {
        await Orchard.prune(`cards/${id}`)
        dispatch(removeCard(id))
      } catch (error) {
        dispatch(
          displayToast({
            message: `Error saving: ${error.message}`,
            intent: Intent.WARNING,
          })
        )
      }
    }
  }
}

export type OpenCitationAction = {
  type: 'OPEN_CITATION',
  data: Citation,
}
export function openCitation (
  key: string | null,
  labelRef?: HTMLElement
): OpenCitationAction {
  if (key != null && labelRef != null) {
    return {
      type: 'OPEN_CITATION',
      data: ({ key, labelRef }: {| key: string, labelRef: HTMLElement |}),
    }
  } else if (key == null) {
    return { type: 'OPEN_CITATION', data: { key, labelRef: null }}
  } else {
    throw new Error('Should never happen')
  }
}
