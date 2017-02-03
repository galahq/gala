import { EditorState, convertFromRaw } from 'draft-js'
import convertFromOldStyleCardSerialization
  from 'concerns/convertFromOldStyleCardSerialization.js'
import { addCommentThreads } from 'concerns/commentThreads.js'
import { decorator } from 'concerns/draftConfig.js'

import {
  UPDATE_CARD_CONTENTS,
  APPLY_SELECTION,
  REPLACE_CARD,
} from '../actions.js'

let { forceSelection } = EditorState

function cardsById(state = getInitialState(), action) {
  switch (action.type) {
    case UPDATE_CARD_CONTENTS:
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          editorState: action.editorState,
        },
      }

    case APPLY_SELECTION:
      let editorState = state[action.cardId].editorState

      return {
        ...state,
        [action.cardId]: {
          ...state[action.cardId],
          editorState: forceSelection(editorState, action.selectionState),
        },
      }

    case REPLACE_CARD:
      return {
        ...state,
        [action.cardId]: {
          ...action.newCard,
          editorState: parseEditorStateFromPersistedCard(action.newCard),
        },
      }

    default: return state
  }
}

export default cardsById




function getInitialState() {
  let state = {...window.caseData.cards}

  Object.values(state).forEach( card => {
    state[card.id].editorState = parseEditorStateFromPersistedCard(card)
  } )

  return state
}

function parseEditorStateFromPersistedCard(card) {
  const content = card.rawContent
    ? JSON.parse(card.rawContent)
    : convertFromOldStyleCardSerialization(card.content)

  const contentWithCommentThreads = addCommentThreads(content, card)

  const contentState = convertFromRaw(contentWithCommentThreads)

  return EditorState.createWithContent(contentState, decorator)
}
