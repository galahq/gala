/**
 * @providesModule cardsById
 * @flow
 */

import { EditorState, convertFromRaw } from 'draft-js'
import convertFromOldStyleCardSerialization from 'card/convertFromOldStyleCardSerialization'
import { decorator } from 'card/draftConfig'

import { omit } from 'ramda'

import type { RawDraftContentState } from 'draft-js/lib/RawDraftContentState'

import type { CardsState, Card, CommentThread } from 'redux/state'
import type {
  SetCardsAction,
  UpdateCardContentsAction,
  ApplySelectionAction,
  ReplaceCardAction,
  AddCardAction,
  RemoveCardAction,
  ParseAllCardsAction,
  AddCommentThreadAction,
  RemoveCommentThreadAction,
  AddPodcastAction,
  AddActivityAction,
} from 'redux/actions'

const { forceSelection } = EditorState

type Action =
  | SetCardsAction
  | UpdateCardContentsAction
  | ApplySelectionAction
  | ReplaceCardAction
  | AddCardAction
  | RemoveCardAction
  | ParseAllCardsAction
  | AddCommentThreadAction
  | RemoveCommentThreadAction
  | AddPodcastAction
  | AddActivityAction

function cardsById (
  state: CardsState = ({ ...window.caseData.cards }: CardsState),
  action: Action
): CardsState {
  switch (action.type) {
    case 'SET_CARDS':
      return {
        ...state,
        ...action.cards,
      }

    case 'UPDATE_CARD_CONTENTS':
      return {
        ...state,
        [action.id]: {
          ...state[action.id],
          editorState: action.editorState,
        },
      }

    case 'APPLY_SELECTION': {
      const editorState =
        state[action.cardId].editorState || EditorState.createEmpty()

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

    case 'REMOVE_CARD':
      return omit([action.id], state)

    case 'ADD_CARD':
      return {
        ...state,
        [action.data.id]: action.data,
      }

    case 'PARSE_ALL_CARDS':
      return Object.keys(state)
        .map(key => state[key])
        .reduce(
          (all, card) => ({
            ...all,
            [card.id]: {
              ...card,
              commentThreads:
                card.commentThreads &&
                card.commentThreads.sort(sortCommentThreads),
              editorState: parseEditorStateFromPersistedCard(card),
            },
          }),
          {}
        )

    case 'ADD_COMMENT_THREAD': {
      const { data } = action
      const card = state[data.cardId]
      const commentThreads = card.commentThreads || []

      if (commentThreads.find(x => x.id === data.id)) return state

      const newCard = {
        ...card,
        commentThreads: [...commentThreads, data].sort(sortCommentThreads),
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
      const commentThreads = state[cardId].commentThreads || []
      const newCard = {
        ...state[cardId],
        commentThreads: commentThreads.filter(x => x.id !== threadId),
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

    default:
      return state
  }
}

export default cardsById

function sortCommentThreads (a: CommentThread, b: CommentThread): number {
  // Always sort detached threads last
  if (a.start == null) return 1
  if (b.start == null) return -1

  if (a.blockIndex !== b.blockIndex) return a.blockIndex - b.blockIndex
  return a.start - b.start
}

function parseEditorStateFromPersistedCard (card: Card) {
  const content =
    card.rawContent || convertFromOldStyleCardSerialization(card.content)
  if (content == null) return EditorState.createEmpty()

  const contentWithCommentThreads = addCommentThreads(content, card)

  const contentState = convertFromRaw(contentWithCommentThreads)

  return EditorState.createWithContent(contentState, decorator)
}

function addCommentThreads (content: RawDraftContentState, card: Card) {
  let newContent = { ...content }

  const commentThreads = card.commentThreads || []

  commentThreads.forEach(thread => {
    const { id, blockIndex, length, start: offset } = thread
    if (offset == null || blockIndex == null) return

    const key = `thread--${id}`

    const inlineStyleRanges = newContent.blocks[blockIndex].inlineStyleRanges
    inlineStyleRanges &&
      inlineStyleRanges.push({
        length,
        offset,
        style: 'THREAD',
      })
    inlineStyleRanges &&
      inlineStyleRanges.push({
        length,
        offset,
        style: key,
      })
  })

  return newContent
}
