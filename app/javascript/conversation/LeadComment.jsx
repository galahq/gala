/**
 * @providesModule LeadComment
 * @flow
 */

import React, { useState } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { injectIntl, FormattedMessage, FormattedRelative } from 'react-intl'

import { deleteComment } from 'redux/actions'

import EditCommentForm from 'conversation/EditCommentForm'
import AttachmentPreviews from 'conversation/AttachmentPreviews'
import {
  StyledComment,
  ConversationTimestamp,
  SmallGreyText,
} from 'conversation/shared'

import type { IntlShape } from 'react-intl'
import type { Dispatch } from 'redux/actions'
import type { State, ReaderState, Comment } from 'redux/state'

type OwnProps = {
  intl: IntlShape,
  leadComment: Comment,
  responseCount: number,
  onCancel: (SyntheticMouseEvent<*>) => Promise<any>,
}

type StateProps = {
  readerCanDeleteComments: boolean,
  currentReader: ?ReaderState,
}

function mapStateToProps ({
  commentThreadsById,
  forums,
  caseData: { reader },
}: State) {
  return {
    readerCanDeleteComments: forums.find(forum => forum.community.active)
      ?.moderateable,
    currentReader: reader,
  }
}

type DispatchProps = {
  handleDeleteThread: (SyntheticMouseEvent<*>) => Promise<any>,
}

function mapDispatchToProps (
  dispatch: Dispatch,
  { leadComment: { id }, onCancel }: OwnProps
) {
  return {
    handleDeleteThread: (e: SyntheticMouseEvent<*>) =>
      dispatch(deleteComment(id)).then(() => onCancel(e)),
  }
}

type Props = OwnProps & StateProps & DispatchProps

function LeadComment ({
  currentReader,
  handleDeleteThread,
  intl,
  leadComment,
  readerCanDeleteComments,
  responseCount,
}: Props) {
  const [editing, setEditing] = useState(false)

  const previews: any = leadComment.attachments.filter(a => a.representable)
  const attachments = leadComment.attachments.filter(a => !a.representable)

  return editing ? (
    <EditCommentForm comment={leadComment} setEditing={setEditing} />
  ) : (
    <LeadCommentContents className="clearfix">
      <Row>
        <div>
          <SmallGreyText>
            <ConversationTimestamp value={leadComment.timestamp} />
          </SmallGreyText>

          {currentReader && leadComment.reader.id === currentReader.id && (
            <EditButton
              aria-label={intl.formatMessage({
                id: 'comments.edit.editComment',
              })}
              onClick={() => setEditing(true)}
            >
              <FormattedMessage id="helpers.edit" />
            </EditButton>
          )}
        </div>

        {readerCanDeleteComments && responseCount === 0 && (
          <DeleteButton
            aria-label={intl.formatMessage({
              id: 'commentThreads.destroy.deleteCommentThread',
            })}
            onClick={handleDeleteThread}
          />
        )}
      </Row>

      <blockquote>
        <AttachmentPreviews attachments={previews} />

        <StyledComment markdown={leadComment.content} />

        {leadComment.edited && (
          <Edited>
            <FormattedMessage
              id="comments.comment.edited"
              values={{
                someTimeAgo: (
                  <FormattedRelative value={leadComment.updatedAt} />
                ),
              }}
            />
          </Edited>
        )}
      </blockquote>

      {attachments.length > 0 && (
        <AttachmentsSection>
          <SmallGreyText>
            <FormattedMessage id="activerecord.attributes.comment.attachments" />
          </SmallGreyText>

          <ul>
            {attachments.map((attachment, i) => (
              <li className="bp3-tag bp3-minimal bp3-interactive" key={i}>
                <a href={attachment.url}>{attachment.name}</a>
              </li>
            ))}
          </ul>
        </AttachmentsSection>
      )}
    </LeadCommentContents>
  )
}

export default injectIntl(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(LeadComment)
)

const Edited = styled.span`
  font-size: 13px;
  opacity: 0.7;
`

const LeadCommentContents = styled.div`
  margin: 20px 0 50px;

  &:last-child {
    margin-bottom: 0;
  }

  & > blockquote {
    padding: 0;
    margin: 0;
    border: none;
    font-size: 17px;
    line-height: 1.3;
  }
`

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`

const EditButton = styled.button.attrs({
  className: 'bp3-button bp3-minimal bp3-intent-primary',
})`
  &:hover {
    background: none !important;
    text-decoration: underline !important;
  }

  &:focus {
    outline-offset: -3px;
  }
`

const DeleteButton = styled.button.attrs({
  className: 'bp3-button bp3-intent-danger bp3-icon-trash bp3-minimal',
})`
  transition: opacity 0.2s;
  opacity: 0;
  ${LeadCommentContents}:hover & {
    opacity: 1;
  }
`

const AttachmentsSection = styled.div`
  margin-top: 1em;

  ul {
    line-height: 1.6;
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      margin-right: 0.5em;

      a:link {
        color: black;
      }
    }
  }
`
