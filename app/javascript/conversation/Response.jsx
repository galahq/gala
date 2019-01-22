/**
 * @providesModule Response
 * @flow
 */

import React, { useState } from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'
import styled from 'styled-components'
import { EditorState, convertFromRaw } from 'draft-js'
import { markdownToDraft } from 'markdown-draft-js'

import CommentEditor from 'conversation/CommentEditor'
import { StyledComment } from 'conversation/shared'

import { useToggle } from 'utility/hooks'
import { deleteComment } from 'redux/actions'

import type { IntlShape } from 'react-intl'
import type { State, Comment } from 'redux/state'

type Props = {
  comment: Comment,
  intl: IntlShape,
  readerCanDeleteComments: boolean,
  readerCanEditComment: boolean,
}

function mapStateToProps (
  { caseData: { reader }, forums }: State,
  { comment }: Props
) {
  return {
    readerCanDeleteComments: forums.find(forum => forum.community.active)
      ?.moderateable,
    readerCanEditComment: reader?.id === comment.reader.id,
  }
}

function Response ({
  comment,
  intl,
  readerCanDeleteComments,
  readerCanEditComment,
}: Props) {
  const [editing, toggleEditing] = useToggle()
  const [editorState, setEditorState] = useState(
    EditorState.createWithContent(
      convertFromRaw(markdownToDraft(comment.content))
    )
  )

  return (
    <Container>
      {editing ? (
        <InputGroup>
          <Input>
            <CommentEditor
              editorState={editorState}
              onChange={setEditorState}
            />
          </Input>

          <SaveButton
            aria-label={intl.formatMessage({
              id: 'comments.edit.saveComment',
            })}
          >
            <FormattedMessage id="helpers.save" />
          </SaveButton>
        </InputGroup>
      ) : (
        <>
          <SpeechBubble>
            <StyledComment markdown={comment.content} />
          </SpeechBubble>

          {readerCanEditComment && (
            <EditButton
              aria-label={intl.formatMessage({
                id: 'comments.edit.editComment',
              })}
              onClick={toggleEditing}
            />
          )}

          <Spacer />

          {readerCanDeleteComments && (
            <DeleteButton
              aria-label={intl.formatMessage({
                id: 'comments.destroy.deleteComment',
              })}
              onClick={() => deleteComment(comment.id)}
            />
          )}
        </>
      )}
    </Container>
  )
}

export default injectIntl(
  connect(
    mapStateToProps,
    { deleteComment }
  )(Response)
)

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  width: 100%;
`

const SpeechBubble = styled.blockquote`
  margin: 6px 0 0 44px;
  border: none;
  background-color: #d9d8d3;
  border-radius: 16px;
  /*max-width: 500px;*/
  padding: 7px 16px;
  line-height: 1.3;
  display: inline-block;
`

const InputGroup = styled.div`
  flex-grow: 1;
  margin: 6px 0 0 44px;
`

const Input = styled.div.attrs({ className: 'pt-input' })`
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

const EditButton = styled.button.attrs({
  className: 'pt-button pt-icon-edit pt-minimal',
})`
  margin-left: 4px;
  transition: opacity 0.2s;

  opacity: 0;
  ${Container}:hover &,
  ${Container}:focus-within & {
    opacity: 1;
  }
`

const SaveButton = styled.button.attrs({ className: 'pt-button' })``

const Spacer = styled.div`
  flex: 999;
`
const DeleteButton = styled.button.attrs({
  className: 'pt-button pt-intent-danger pt-icon-trash pt-minimal',
})`
  transition: opacity 0.2s;

  opacity: 0;
  ${Container}:hover &,
  ${Container}:focus-within & {
    opacity: 1;
  }
`
