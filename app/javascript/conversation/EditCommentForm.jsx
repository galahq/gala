/**
 * @providesModule EditCommentForm
 * @flow
 */

import React, { useState } from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'
import styled from 'styled-components'
import { Button, Intent } from '@blueprintjs/core'
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js'
import { markdownToDraft, draftToMarkdown } from 'markdown-draft-js'

import CommentEditor from 'conversation/CommentEditor'

import { updateComment } from 'redux/actions'
import { useEffectOnSubsequentRender } from 'utility/hooks'

import type { IntlShape } from 'react-intl'
import type { Comment } from 'redux/state'

type OwnProps = {
  comment: Comment,
  intl: IntlShape,
  setEditing: boolean => void,
}

type DispatchProps = {
  updateComment: typeof updateComment,
}

type Props = OwnProps & DispatchProps

function editorStateFromMarkdown (md: string) {
  return EditorState.createWithContent(convertFromRaw(markdownToDraft(md)))
}

function markdownFromEditorState (eS: EditorState) {
  return draftToMarkdown(convertToRaw(eS.getCurrentContent()))
}

function EditCommentForm ({ comment, intl, setEditing, updateComment }: Props) {
  const [editorState, setEditorState] = useState(
    editorStateFromMarkdown(comment.content)
  )

  // Leave editing mode in response to a change to comment.content
  // which will be triggered by a broadcast on ForumChannel after we
  // save changes.
  useEffectOnSubsequentRender(
    () => {
      setEditing(false)
    },
    [comment.content]
  )

  function handleCancel () {
    setEditing(false)
    setEditorState(editorStateFromMarkdown(comment.content))
  }

  const newContent = markdownFromEditorState(editorState)
  const saveDisabled =
    comment.content === newContent || newContent.trim() === ''

  return (
    <InputGroup>
      <Input>
        <CommentEditor editorState={editorState} onChange={setEditorState} />
      </Input>

      <Button
        aria-label={intl.formatMessage({
          id: 'helpers.cancel',
        })}
        onClick={handleCancel}
      >
        <FormattedMessage id="helpers.cancel" />
      </Button>

      <EditButton
        aria-label={intl.formatMessage({
          id: 'comments.edit.saveComment',
        })}
        disabled={saveDisabled}
        onClick={() => updateComment(comment.id, editorState)}
      >
        <FormattedMessage id="helpers.save" />
      </EditButton>
    </InputGroup>
  )
}

export default injectIntl(
  connect(
    null,
    { updateComment }
  )(EditCommentForm)
)

const InputGroup = styled.div`
  flex-grow: 1;
  margin: 6px 0 0 44px;
`

const Input = styled.div.attrs({ className: 'bp3-input' })`
  height: auto;
  margin-bottom: 6px;
  padding: 5px 10px;
  width: 100%;

  &:focus-within {
    outline: none;
    box-shadow: 0 0 0 1px #7351d4, 0 0 0 3px rgba(115, 81, 212, 0.3),
      inset 0 1px 1px rgba(16, 22, 26, 0.2);
  }

  & .public-DraftEditorPlaceholder-root {
    margin-bottom: -18px;
    pointer-events: none;
    opacity: 0.6;
    &.public-DraftEditorPlaceholder-hasFocus {
      opacity: 0.3;
    }
  }
`

const EditButton = styled(Button).attrs({ intent: Intent.PRIMARY })`
  margin-left: 0.25em;
`
