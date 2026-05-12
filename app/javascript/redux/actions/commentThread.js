/**
 * 
 */

import { setCommentsById, setCards, parseAllCards } from 'redux/actions'

import { batchActions } from 'redux-batched-actions'
import { EditorState } from 'draft-js'
import { Orchard } from 'shared/orchard'
import { getSelectionText } from 'shared/draftHelpers'


export function fetchCommentThreads (slug) {
  return async (dispatch) => {
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

export function setCommentThreadsById (
  commentThreadsById
) {
  return { type: 'SET_COMMENT_THREADS_BY_ID', commentThreadsById }
}

export function setMostRecentCommentThreads (
  mostRecentCommentThreads
) {
  return { type: 'SET_MOST_RECENT_COMMENT_THREADS', mostRecentCommentThreads }
}

export function createCommentThread (
  cardId,
  editorState
) {
  return async (dispatch) => {
    const originalHighlightText = getSelectionText(editorState)

    const newCommentThread = (await Orchard.graft(
      `cards/${cardId}/comment_threads`,
      { commentThread: { originalHighlightText }}
    ))

    dispatch(addCommentThread(newCommentThread))
    return newCommentThread.id
  }
}

export function createUnattachedCommentThread () {
  return async (dispatch, getState) => {
    const { slug } = getState().caseData
    const newCommentThread = (await Orchard.graft(
      `cases/${slug}/comment_threads`,
      { commentThread: {}}
    ))

    dispatch(addCommentThread(newCommentThread))
    return newCommentThread.id
  }
}

export function addCommentThread (data) {
  return { type: 'ADD_COMMENT_THREAD', data }
}

export function deleteCommentThread (threadId) {
  return async (dispatch, getState) => {
    const { cardId } = getState().commentThreadsById[threadId]
    await Orchard.prune(`comment_threads/${threadId}`)
    dispatch(removeCommentThread(threadId, cardId))
  }
}

function removeCommentThread (
  threadId,
  cardId
) {
  return { type: 'REMOVE_COMMENT_THREAD', threadId, cardId }
}

export function hoverCommentThread (id) {
  return { type: 'HOVER_COMMENT_THREAD', id }
}
