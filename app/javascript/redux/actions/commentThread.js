/**
 * @flow
 */

import { setCommentsById, setCards, parseAllCards } from 'redux/actions'

import { batchActions } from 'redux-batched-actions'
import { EditorState } from 'draft-js'
import { Orchard } from 'shared/orchard'
import { getSelectionText } from 'shared/draftHelpers'

import type { ThunkAction, Dispatch, GetState } from 'redux/actions'
import type { CommentThreadsState, CommentThread } from 'redux/state'

export function fetchCommentThreads (slug: string): ThunkAction {
  return async (dispatch: Dispatch) => {
    const {
      commentThreads,
      comments,
      cards,
      mostRecentCommentThreads,
    } = await Orchard.harvest(`cases/${slug}/comment_threads`)
    dispatch(
      batchActions([
        setCommentsById(comments),
        setCommentThreadsById(commentThreads),
        setCards(cards),
        setMostRecentCommentThreads(mostRecentCommentThreads.map(String)),
      ])
    )
    dispatch(parseAllCards())
  }
}

export type SetCommentThreadsByIdAction = {
  type: 'SET_COMMENT_THREADS_BY_ID',
  commentThreadsById: CommentThreadsState,
}
export function setCommentThreadsById (
  commentThreadsById: CommentThreadsState
): SetCommentThreadsByIdAction {
  return { type: 'SET_COMMENT_THREADS_BY_ID', commentThreadsById }
}

export type SetMostRecentCommentThreadsAction = {
  type: 'SET_MOST_RECENT_COMMENT_THREADS',
  mostRecentCommentThreads: ?(string[]),
}
export function setMostRecentCommentThreads (
  mostRecentCommentThreads: ?(string[])
) {
  return { type: 'SET_MOST_RECENT_COMMENT_THREADS', mostRecentCommentThreads }
}

export function createCommentThread (
  cardId: string,
  editorState: EditorState
): ThunkAction {
  return async (dispatch: Dispatch) => {
    const originalHighlightText = getSelectionText(editorState)

    const newCommentThread = (await Orchard.graft(
      `cards/${cardId}/comment_threads`,
      { commentThread: { originalHighlightText }}
    ): CommentThread)

    dispatch(addCommentThread(newCommentThread))
    return newCommentThread.id
  }
}

export function createUnattachedCommentThread (): ThunkAction {
  return async (dispatch: Dispatch, getState: GetState) => {
    const { slug } = getState().caseData
    const newCommentThread = (await Orchard.graft(
      `cases/${slug}/comment_threads`,
      { commentThread: {}}
    ): CommentThread)

    dispatch(addCommentThread(newCommentThread))
    return newCommentThread.id
  }
}

export type AddCommentThreadAction = {
  type: 'ADD_COMMENT_THREAD',
  data: CommentThread,
}
export function addCommentThread (data: CommentThread): AddCommentThreadAction {
  return { type: 'ADD_COMMENT_THREAD', data }
}

export function deleteCommentThread (threadId: string): ThunkAction {
  return async (dispatch: Dispatch, getState: GetState) => {
    const { cardId } = getState().commentThreadsById[threadId]
    await Orchard.prune(`comment_threads/${threadId}`)
    dispatch(removeCommentThread(threadId, cardId))
  }
}

export type RemoveCommentThreadAction = {
  type: 'REMOVE_COMMENT_THREAD',
  threadId: string,
  cardId: ?string,
}
function removeCommentThread (
  threadId: string,
  cardId: ?string
): RemoveCommentThreadAction {
  return { type: 'REMOVE_COMMENT_THREAD', threadId, cardId }
}

export type HoverCommentThreadAction = {
  type: 'HOVER_COMMENT_THREAD',
  id: ?string,
}
export function hoverCommentThread (id: ?string): HoverCommentThreadAction {
  return { type: 'HOVER_COMMENT_THREAD', id }
}
