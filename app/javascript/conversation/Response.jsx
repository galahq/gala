/**
 * @providesModule Response
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import styled from 'styled-components'

import { StyledComment } from 'conversation/shared'

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
  return (
    <Container>
      <SpeechBubble>
        <StyledComment markdown={comment.content} />
      </SpeechBubble>

      {readerCanEditComment && (
        <EditButton
          aria-label={intl.formatMessage({
            id: 'comments.edit.editComment',
          })}
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
