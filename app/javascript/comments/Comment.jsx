/**
 * @providesModule Comment
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import { deleteComment } from 'redux/actions'

import type { State, Comment as CommentT } from 'redux/state'

type Props = {
  readerIsModerator: boolean,
  deleteComment: string => Promise<any>,
} & CommentT

const Comment = ({
  id,
  reader,
  timestamp,
  content,
  readerIsModerator,
  deleteComment,
}: Props) => (
  <div className="Comment">
    <cite>{reader.name}</cite>
    <i>{timestamp}</i>
    <blockquote>{content}</blockquote>
    {readerIsModerator && (
      <DeleteCommentButton onClick={() => deleteComment(id)} />
    )}
  </div>
)

export default connect(
  ({ caseData }: State) => ({
    readerIsModerator: caseData.reader && caseData.reader.canUpdateCase,
  }),
  { deleteComment }
)(Comment)

const DeleteCommentButton = styled.button.attrs({
  className: 'pt-button pt-minimal pt-small pt-icon-trash pt-intent-danger',
})`
  position: absolute;
  top: calc(50% - 12px);
  right: 0;

  transition: opacity ease-out 0.3s;
  opacity: 0;

  .Comment:hover & {
    opacity: 1;
  }
`
