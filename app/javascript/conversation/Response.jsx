/**
 * @providesModule Response
 * @flow
 */

import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, FormattedRelative } from 'react-intl'
import styled from 'styled-components'
import { EditorState, convertFromRaw } from 'draft-js'
import { markdownToDraft } from 'markdown-draft-js'

import { Button } from '@blueprintjs/core'
import CommentEditor from 'conversation/CommentEditor'
import { StyledComment } from 'conversation/shared'

import { useToggle } from 'utility/hooks'
import { deleteComment, updateComment } from 'redux/actions'

import type { IntlShape } from 'react-intl'
import type { State, Comment } from 'redux/state'

type OwnProps = {
  comment: Comment,
  intl: IntlShape,
}

type StateProps = {
  readerCanDeleteComments: ?boolean,
  readerCanEditComment: boolean,
}

function mapStateToProps (
  { caseData: { reader }, forums }: State,
  { comment }: OwnProps
): StateProps {
  return {
    readerCanDeleteComments: forums.find(forum => forum.community.active)
      ?.moderateable,
    readerCanEditComment: reader?.id === comment.reader.id,
  }
}

type DispatchProps = {
  deleteComment: typeof deleteComment,
  updateComment: typeof updateComment,
}

type Props = StateProps & DispatchProps & OwnProps

function Response ({
  comment,
  deleteComment,
  intl,
  readerCanDeleteComments,
  readerCanEditComment,
  updateComment,
}: Props) {
  const [editing, toggleEditing] = useToggle()
  const [editorState, setEditorState] = useState(
    EditorState.createWithContent(
      convertFromRaw(markdownToDraft(comment.content))
    )
  )

  // Leave editing mode in response to a change to comment.content
  // which will be triggered by a broadcast on ForumChannel after we
  // save changes.
  useEffect(
    () => {
      if (editing) toggleEditing()
    },
    [comment.content]
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

          <Button
            aria-label={intl.formatMessage({
              id: 'helpers.cancel',
            })}
            onClick={() => {
              toggleEditing()
              setEditorState(
                EditorState.createWithContent(
                  convertFromRaw(markdownToDraft(comment.content))
                )
              )
            }}
          >
            <FormattedMessage id="helpers.cancel" />
          </Button>

          <Button
            aria-label={intl.formatMessage({
              id: 'comments.edit.saveComment',
            })}
            onClick={() => updateComment(comment.id, editorState)}
          >
            <FormattedMessage id="helpers.save" />
          </Button>
        </InputGroup>
      ) : (
        <>
          <SpeechBubble>
            <StyledComment markdown={comment.content} />
            {comment.timestamp !== comment.updatedAt && (
              <Edited>
                <FormattedMessage
                  id="comments.comment.edited"
                  values={{
                    someTimeAgo: (
                      <FormattedRelative value={comment.updatedAt} />
                    ),
                  }}
                />
              </Edited>
            )}
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
    { deleteComment, updateComment }
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

const Edited = styled.span`
  font-size: 13px;
  opacity: 0.7;
`

const InputGroup = styled.div`
  flex-grow: 1;
  margin: 6px 0 0 44px;
`

const Input = styled.div.attrs({ className: 'pt-input' })`
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
