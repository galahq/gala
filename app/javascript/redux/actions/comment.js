/**
 *
 */

import { displayToast } from 'redux/actions'

import { EditorState, convertToRaw } from 'draft-js'
import { draftToMarkdown } from 'markdown-draft-js'
import { Intent } from '@blueprintjs/core'
import { Orchard, ignoreClientError } from 'shared/orchard'
import { clearEditorContent } from 'draft/helpers'


// COMMENT
//
export function setCommentsById (
  commentsById
) {
  return { type: 'SET_COMMENTS_BY_ID', commentsById }
}

export function changeCommentInProgress (
  threadId,
  content
) {
  return { type: 'CHANGE_COMMENT_IN_PROGRESS', threadId, content }
}

export function addComment (data) {
  return { type: 'ADD_COMMENT', data }
}

export function createComment (
  threadId,
  editorState,
  attachmentIds
) {
  return (dispatch) => {
    const content = draftToMarkdown(
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
      .catch((error) => {
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
  id,
  editorState
) {
  return (dispatch, getState) => {
    const content = draftToMarkdown(
      convertToRaw(editorState.getCurrentContent())
    )

    const originalContent = getState().commentsById[id].content

    if (content.trim() === '' || content === originalContent) return

    Orchard.espalier(`comments/${id}`, { comment: { content }}).catch(
      (error) => {
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

function removeComment (id, threadId) {
  return { type: 'REMOVE_COMMENT', id, threadId }
}

export function deleteComment (id) {
  return (dispatch, getState) => {
    if (
      window.confirm(
        'Are you sure you want to delete this comment? This action cannot be undone.'
      )
    ) {
      const threadId = `${getState().commentsById[id].commentThreadId}`
      return Orchard.prune(`comments/${id}`)
        .then(() => {
          dispatch(removeComment(id, threadId))
        })
        .catch(ignoreClientError) // 403 (not a moderator) / 404 (already gone)
    }
  }
}
