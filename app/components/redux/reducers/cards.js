// @flow
import { EditorState, convertFromRaw } from 'draft-js'
import convertFromOldStyleCardSerialization
  from 'card/convertFromOldStyleCardSerialization'
import { addCommentThreads } from 'comments/commentThreads'
import { decorator } from 'card/draftConfig'

import type { CardsState, Card, CommentThread } from 'redux/state'
import type {
  UpdateCardContentsAction,
  ApplySelectionAction,
  ReplaceCardAction,
  ParseAllCardsAction,
  AddCommentThreadAction,
  RemoveCommentThreadAction,
  AddPodcastAction,
  AddActivityAction,
} from 'redux/actions'

const { forceSelection } = EditorState

type Action = UpdateCardContentsAction
  | ApplySelectionAction
  | ReplaceCardAction
  | ParseAllCardsAction
  | AddCommentThreadAction
  | RemoveCommentThreadAction
  | AddPodcastAction
  | AddActivityAction

function cardsById (
  state: CardsState = getInitialEmptyCards(),
  action: Action,
): CardsState {
  switch (action.type) {
    case 'UPDATE_CARD_CONTENTS':
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          editorState: action.editorState,
        },
      }

    case 'APPLY_SELECTION': {
      const editorState = state[action.cardId].editorState

      return {
        ...state,
        [action.cardId]: {
          ...state[action.cardId],
          editorState: forceSelection(editorState, action.selectionState),
        },
      }
    }

    case 'REPLACE_CARD':
      return {
        ...state,
        [action.cardId]: {
          ...action.newCard,
          editorState: parseEditorStateFromPersistedCard(action.newCard),
        },
      }

    case 'PARSE_ALL_CARDS':
      return Object.keys(state).map(key => state[key]).reduce((all, card) => ({
        ...all,
        [card.id]: {
          ...card,
          editorState: parseEditorStateFromPersistedCard(card),
        },
      }), {})

    case 'ADD_COMMENT_THREAD': {
      const { data } = action
      const card = state[data.cardId]
      if (card.commentThreads.find(x => x.id === data.id)) return state

      const newCard = {
        ...card,
        commentThreads: [
          ...card.commentThreads,
          data,
        ].sort(sortCommentThreads),
      }
      return {
        ...state,
        [data.cardId]: {
          ...newCard,
          editorState: parseEditorStateFromPersistedCard(newCard),
        },
      }
    }

    case 'REMOVE_COMMENT_THREAD': {
      const { cardId, threadId } = action
      const newCard = {
        ...state[cardId],
        commentThreads: state[cardId].commentThreads.filter(
          x => x.id !== threadId,
        ),
      }
      return {
        ...state,
        [action.cardId]: {
          ...newCard,
          editorState: parseEditorStateFromPersistedCard(newCard),
        },
      }
    }

    case 'ADD_PODCAST':
    case 'ADD_ACTIVITY':
      return {
        ...state,
        [action.data.cardId]: {
          solid: true,
          editorState: EditorState.createEmpty(),
        },
      }

    default: return state
  }
}

export default cardsById

function sortCommentThreads (a: CommentThread, b: CommentThread): number {
  if (a.blockIndex !== b.blockIndex) return a.blockIndex - b.blockIndex
  return a.start - b.start
}

function getInitialEmptyCards (): CardsState {
  const state = ({ ...window.caseData.cards }: CardsState)

  return Object.keys(state).map(key => state[key]).reduce((all, card) => {
    return {
      ...all,
      [card.id]: {
        ...card,
        editorState: EditorState.createEmpty(),
      },
    }
  }, {})
}

function parseEditorStateFromPersistedCard (card: Card) {
  const content = card.rawContent
    ? JSON.parse(card.rawContent)
    : convertFromOldStyleCardSerialization(card.content)

  const contentWithCommentThreads = addCommentThreads(content, card)

  const contentState = convertFromRaw(contentWithCommentThreads)

  return EditorState.createWithContent(contentState, decorator)
}
