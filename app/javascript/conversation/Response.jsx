/**
 * @providesModule Response
 * @flow
 */

import React, { useState } from 'react'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage, FormattedRelative } from 'react-intl'
import styled from 'styled-components'

import { StyledComment } from 'conversation/shared'
import EditCommentForm from 'conversation/EditCommentForm'

import { deleteComment } from 'redux/actions'

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
}

type Props = StateProps & DispatchProps & OwnProps

function Response ({
  comment,
  deleteComment,
  intl,
  readerCanDeleteComments,
  readerCanEditComment,
}: Props) {
  const [editing, setEditing] = useState(false)

  return (
    <Container>
      {editing ? (
        <EditCommentForm comment={comment} setEditing={setEditing} />
      ) : (
        <>
          <SpeechBubble>
            <StyledComment markdown={comment.content} />
            {comment.edited && (
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
              onClick={() => setEditing(true)}
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

const Edited = styled.span`
  font-size: 13px;
  opacity: 0.7;
`

const EditButton = styled.button.attrs({
  className: 'bp3-button bp3-icon-edit bp3-minimal',
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
  className: 'bp3-button bp3-intent-danger bp3-icon-trash bp3-minimal',
})`
  transition: opacity 0.2s;

  opacity: 0;
  ${Container}:hover &,
  ${Container}:focus-within & {
    opacity: 1;
  }
`
