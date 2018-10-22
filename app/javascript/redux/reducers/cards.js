/**
 * @providesModule cardsById
 * @flow
 */

import { EditorState, convertFromRaw } from 'draft-js'
import { decorator } from 'draft/config'

// $FlowFixMe
import {
  complement,
  isNil,
  filter,
  where,
  omit,
  lensPath,
  view,
  set,
  reduce,
} from 'ramda'

import type { RawDraftContentState } from 'draft-js/lib/RawDraftContentState'

import type { CardsState, Card } from 'redux/state'
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
        [action.data.id]: {
          ...action.data,
          editorState: parseEditorStateFromPersistedCard(action.data),
        },
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
      const { cardId } = data
      if (cardId == null) return state

      const card = state[cardId]
      const commentThreads = card.commentThreads || []

      if (commentThreads.find(x => x.id === data.id)) return state

      const cardWithThread = {
        ...card,
        commentThreads: [...commentThreads, data].sort(sortCommentThreads),
      }
      return {
        ...state,
        [cardId]: {
          ...cardWithThread,
          editorState: parseEditorStateFromPersistedCard(cardWithThread),
        },
      }
    }

    case 'REMOVE_COMMENT_THREAD': {
      const { cardId, threadId } = action
      if (cardId == null) return state

      const card = state[cardId]
      const commentThreads = card.commentThreads || []

      const cardWithoutThread = {
        ...card,
        commentThreads: commentThreads.filter(
          thread => `${thread.id}` !== threadId
        ),
      }

      return {
        ...state,
        [cardId]: {
          ...cardWithoutThread,
          editorState: parseEditorStateFromPersistedCard(cardWithoutThread),
        },
      }
    }

    case 'ADD_PODCAST':
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

// Comment Threads that are attached to a card should be displayed in the order
// that their highlighted text appears on the card. Threads that have had their
// text changed out from under them should appear last.
function sortCommentThreads<T: { start: ?number, blockIndex: ?number }> (
  a: T,
  b: T
): number {
  if (a.start == null || a.blockIndex == null) return 1
  if (b.start == null || b.blockIndex == null) return -1

  if (a.blockIndex !== b.blockIndex) return a.blockIndex - b.blockIndex
  return a.start - b.start
}

function parseEditorStateFromPersistedCard (card: Card) {
  const content = card.rawContent
  if (content == null) return EditorState.createEmpty(decorator)

  const contentWithCommentThreads = addCommentThreads(content, card)

  const contentState = convertFromRaw(contentWithCommentThreads)

  // $FlowFixMe
  return EditorState.createWithContent(contentState, decorator)
}

function addCommentThreads (content: RawDraftContentState, card: Card) {
  const commentThreads = card.commentThreads || []

  const styleRangesForComment = ({ id, length, start: offset }) => [
    { length, offset, style: 'THREAD' },
    { length, offset, style: `thread--${id}` },
  ]

  const inlineStylesLensForBlock = blockIndex =>
    lensPath(['blocks', blockIndex, 'inlineStyleRanges'])

  const inlineStylesWithComment = (content, comment) => [
    ...view(inlineStylesLensForBlock(comment.blockIndex), content),
    ...styleRangesForComment(comment),
  ]

  const setInlineStylesForComment = (content, comment) =>
    set(
      inlineStylesLensForBlock(comment.blockIndex),
      inlineStylesWithComment(content, comment),
      content
    )

  const attached = filter(
    where({ blockIndex: complement(isNil), start: complement(isNil) })
  )

  return reduce(setInlineStylesForComment, content, attached(commentThreads))
}
