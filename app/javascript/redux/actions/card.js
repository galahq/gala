/**
 *
 */

import { setUnsaved, displayToast } from 'redux/actions'

import { Orchard } from 'shared/orchard'
import { Intent } from '@blueprintjs/core'
import { EditorState } from 'draft-js'


export function setCards (cards) {
  return { type: 'SET_CARDS', cards }
}

export function parseAllCards () {
  return { type: 'PARSE_ALL_CARDS' }
}

export function addCard (pageId, data) {
  return { type: 'ADD_CARD', pageId, data }
}

export function createCard (pageId) {
  return async (dispatch) => {
    const data = await Orchard.graft(`pages/${pageId}/cards`, {
      card: { solid: true },
    })
    dispatch(addCard(pageId, data))
  }
}

export function updateCardContents (
  id,
  editorState
) {
  setUnsaved()
  return { type: 'UPDATE_CARD_CONTENTS', id, editorState }
}

export function replaceCard (cardId, newCard) {
  return { type: 'REPLACE_CARD', cardId, newCard }
}

export function reorderCard (
  id,
  destination
) {
  setUnsaved()
  return { type: 'REORDER_CARD', id, destination }
}

export function removeCard (id) {
  return { type: 'REMOVE_CARD', id }
}

export function deleteCard (id) {
  return async (dispatch) => {
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

export function openCitation (
  key,
  labelRef
) {
  if (key != null && labelRef != null) {
    return {
      type: 'OPEN_CITATION',
      data: ({ key, labelRef }),
    }
  } else if (key == null) {
    return { type: 'OPEN_CITATION', data: { key, labelRef: null }}
  } else {
    throw new Error('Should never happen')
  }
}
