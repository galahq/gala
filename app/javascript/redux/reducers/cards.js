/**
 * @providesModule cardsById
 * @flow
 */

import { EditorState, convertFromRaw } from 'draft-js'
import { decorator } from 'card/draftConfig'

// $FlowFixMe
import { omit, lensPath, view, set, reduce } from 'ramda'

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

      const cardWithThread = {
        ...card,
        commentThreads: [...commentThreads, data].sort(sortCommentThreads),
      }
      return {
        ...state,
        [data.cardId]: {
          ...cardWithThread,
          editorState: parseEditorStateFromPersistedCard(cardWithThread),
        },
      }
    }

    case 'REMOVE_COMMENT_THREAD': {
      const { cardId, threadId } = action
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
        [action.cardId]: {
          ...cardWithoutThread,
          editorState: parseEditorStateFromPersistedCard(cardWithoutThread),
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
  const content = card.rawContent
  if (content == null) return EditorState.createEmpty()

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

  return reduce(setInlineStylesForComment, content, commentThreads)
}
