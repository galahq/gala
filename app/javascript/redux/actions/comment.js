/**
 * @flow
 */

import { displayToast } from 'redux/actions'

import { EditorState, convertToRaw } from 'draft-js'
import { draftToMarkdown } from 'markdown-draft-js'
import { Intent } from '@blueprintjs/core'
import { Orchard } from 'shared/orchard'
import { clearEditorContent } from 'draft/helpers'

import type { ThunkAction, GetState, Dispatch } from 'redux/actions'
import type { CommentsState, Comment } from 'redux/state'

// COMMENT
//
export type SetCommentsByIdAction = {
  type: 'SET_COMMENTS_BY_ID',
  commentsById: CommentsState,
}
export function setCommentsById (
  commentsById: CommentsState
): SetCommentsByIdAction {
  return { type: 'SET_COMMENTS_BY_ID', commentsById }
}

export type ChangeCommentInProgressAction = {
  type: 'CHANGE_COMMENT_IN_PROGRESS',
  threadId: string,
  content: EditorState,
}
export function changeCommentInProgress (
  threadId: string,
  content: EditorState
): ChangeCommentInProgressAction {
  return { type: 'CHANGE_COMMENT_IN_PROGRESS', threadId, content }
}

export type AddCommentAction = { type: 'ADD_COMMENT', data: Comment }
export function addComment (data: Comment): AddCommentAction {
  return { type: 'ADD_COMMENT', data }
}

export function createComment (
  threadId: string,
  editorState: EditorState,
  attachmentIds: string[]
): ThunkAction {
  return (dispatch: Dispatch) => {
    const content: string = draftToMarkdown(
      convertToRaw(editorState.getCurrentContent())
    )

    if (content.trim() === '') return

    Orchard.graft(`comment_threads/${threadId}/comments`, {
      comment: { content, attachments: attachmentIds },
    })
      .then(() => {
        // Clear the comment in progress with proper SelectionState management
        const emptyState = clearEditorContent(EditorState.createEmpty())
        dispatch(changeCommentInProgress(threadId, emptyState))
      })
      .catch((error: Error) => {
        dispatch(
          displayToast({
            message: `Error saving: ${error.message}`,
            intent: Intent.WARNING,
          })
        )
      })
  }
}

export function updateComment (
  id: string,
  editorState: EditorState
): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    const content: string = draftToMarkdown(
      convertToRaw(editorState.getCurrentContent())
    )

    const originalContent = getState().commentsById[id].content

    if (content.trim() === '' || content === originalContent) return

    Orchard.espalier(`comments/${id}`, { comment: { content }}).catch(
      (error: Error) => {
        dispatch(
          displayToast({
            message: `Error saving: ${error.message}`,
            intent: Intent.WARNING,
          })
        )
      }
    )
  }
}

export type RemoveCommentAction = {
  type: 'REMOVE_COMMENT',
  id: string,
  threadId: string,
}
function removeComment (id: string, threadId: string): RemoveCommentAction {
  return { type: 'REMOVE_COMMENT', id, threadId }
}

export function deleteComment (id: string): ThunkAction {
  return (dispatch: Dispatch, getState: GetState) => {
    if (
      window.confirm(
        'Are you sure you want to delete this comment? This action cannot be undone.'
      )
    ) {
      const threadId = `${getState().commentsById[id].commentThreadId}`
      return Orchard.prune(`comments/${id}`).then(() => {
        dispatch(removeComment(id, threadId))
      })
    }
  }
}
