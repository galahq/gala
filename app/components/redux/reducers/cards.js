import { EditorState, convertFromRaw } from 'draft-js'
import convertFromOldStyleCardSerialization
  from 'concerns/convertFromOldStyleCardSerialization.js'
import { addCommentThreads } from 'concerns/commentThreads.js'
import { decorator } from 'concerns/draftConfig.js'

import {
  UPDATE_CARD_CONTENTS,
  APPLY_SELECTION,
  REPLACE_CARD,
  PARSE_ALL_CARDS,
  ADD_COMMENT_THREAD,
  REMOVE_COMMENT_THREAD,
} from '../actions.js'

let { forceSelection } = EditorState

function cardsById(state = getInitialEmptyCards(), action) {
  let newCard

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

    case PARSE_ALL_CARDS:
      return Object.values(state).reduce( (all, card) => ({
        ...all,
        [card.id]: {
          ...card,
          editorState: parseEditorStateFromPersistedCard(card),
        },
      }), {})

    case ADD_COMMENT_THREAD:
      const card = state[action.data.cardId]
      if (card.commentThreads.find(x => x.id === action.data.id))  return state

      newCard = {
        ...card,
        commentThreads: [
          ...card.commentThreads,
          action.data,
        ].sort(sortCommentThreads),
      }
      return {
        ...state,
        [action.data.cardId]: {
          ...newCard,
          editorState: parseEditorStateFromPersistedCard(newCard),
        },
      }

    case REMOVE_COMMENT_THREAD:
      newCard = {
        ...state[action.cardId],
        commentThreads: state[action.cardId].commentThreads.filter(
          x => x.id !== action.threadId
        ),
      }
      return {
        ...state,
        [action.cardId]: {
          ...newCard,
          editorState: parseEditorStateFromPersistedCard(newCard),
        },
      }

    default: return state
  }
}

export default cardsById



function sortCommentThreads(a, b) {
  if (a.blockIndex !== b.blockIndex)  return a.blockIndex > b.blockIndex
  return a.start > b.start
}

function getInitialEmptyCards() {
  let state = {...window.caseData.cards}

  Object.values(state).forEach( card => {
    state[card.id].editorState = EditorState.createEmpty()
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
