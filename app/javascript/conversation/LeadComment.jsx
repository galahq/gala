/**
 * @providesModule LeadComment
 * @flow
 */

import * as React from 'react'
import { connect } from 'react-redux'
import styled, { css } from 'styled-components'

import { injectIntl, FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import { deleteComment } from 'redux/actions'

import FirstPostForm from 'conversation/FirstPostForm'
import Identicon from 'shared/Identicon'
import {
  StyledComment,
  ConversationTimestamp,
  CommentThreadBreadcrumbs,
  CommentThreadBreadcrumb,
  SmallGreyText,
} from 'conversation/shared'
import { styles } from 'draft/config'

import type { IntlShape } from 'react-intl'
import type { Dispatch } from 'redux/actions'
import type { State, ReaderState, Page, Comment } from 'redux/state'

type OwnProps = {
  cardPosition: ?number,
  inSitu: boolean,
  inSituPath: ?string,
  intl: IntlShape,
  leadComment: ?Comment,
  originalHighlightText: ?string,
  page: ?Page,
  reader: { imageUrl: ?string, hashKey: string, name: string },
  responseCount: number,
  threadId: string,
  onCancel: (SyntheticMouseEvent<*>) => Promise<any>,
}

function mapStateToProps (
  { commentThreadsById, forums, caseData }: State,
  { threadId }: OwnProps
) {
  const thread = commentThreadsById[threadId]
  return {
    readerCanDeleteComments: forums.find(forum => forum.community.active)
      ?.moderateable,
    threadDetached: thread.start == null || thread.blockIndex == null,
    currentReader: caseData.reader,
  }
}
type StateProps = {
  readerCanDeleteComments: boolean,
  threadDetached: boolean,
  currentReader: ?ReaderState,
}

function mapDispatchToProps (
  dispatch: Dispatch,
  { leadComment, onCancel }: OwnProps
) {
  let handleDeleteThread
  if (leadComment != null) {
    const { id: commentId } = leadComment
    handleDeleteThread = (e: SyntheticMouseEvent<*>) =>
      dispatch(deleteComment(commentId)).then(() => onCancel(e))
  }

  return {
    handleDeleteThread,
  }
}
type DispatchProps = {
  handleDeleteThread: (SyntheticMouseEvent<*>) => Promise<any>,
}

type Props = OwnProps & StateProps & DispatchProps

const LeadComment = ({
  cardPosition,
  currentReader,
  handleDeleteThread,
  inSitu,
  inSituPath,
  intl,
  leadComment,
  originalHighlightText,
  page,
  reader,
  readerCanDeleteComments,
  responseCount,
  threadId,
  threadDetached,
  onCancel,
}: Props) => (
  <>
    <LeadCommenter>
      <Identicon presentational width={32} reader={reader} />
      <cite>{reader.name}</cite>
    </LeadCommenter>

    {page != null && inSituPath != null && (
      <CommentThreadLocation>
        {threadDetached && (
          <Callout>
            <FormattedMessage id="commentThreads.show.textChanged" />
          </Callout>
        )}

        <CommentThreadBreadcrumbs>
          <CommentThreadBreadcrumb>
            {inSitu ? (
              <FormattedMessage
                id="commentThreads.show.commentsOnPageNumber"
                values={{ position: page.position }}
              />
            ) : (
              <FormattedMessage
                id="commentThreads.show.commentsOnPage"
                values={{ title: page.title }}
              />
            )}
          </CommentThreadBreadcrumb>
          <CommentThreadBreadcrumb>
            <FormattedMessage
              id="commentThreads.show.cardN"
              values={{ cardPosition }}
            />
          </CommentThreadBreadcrumb>
        </CommentThreadBreadcrumbs>

        <HighlightedText disabled={inSitu}>
          <Link
            to={inSituPath}
            className="CommentThread__metadata__text"
            style={styles.purpleHighlight}
          >
            {originalHighlightText}
          </Link>
        </HighlightedText>
      </CommentThreadLocation>
    )}

    {leadComment ? (
      <LeadCommentContents>
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
          <StyledComment markdown={leadComment.content} />
        </blockquote>
        {leadComment.attachments?.length > 0 && (
          <AttachmentsSection>
            <SmallGreyText>
              <FormattedMessage id="activerecord.attributes.comment.attachments" />
            </SmallGreyText>
            <ul>
              {leadComment.attachments.map((attachment, i) => (
                <li className="pt-tag pt-minimal pt-interactive" key={i}>
                  <a href={attachment.url}>{attachment.name}</a>
                </li>
              ))}
            </ul>
          </AttachmentsSection>
        )}
      </LeadCommentContents>
    ) : (
      <FirstPostForm key="3" threadId={threadId} onCancel={onCancel} />
    )}
  </>
)

export default injectIntl(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(LeadComment)
)

const LeadCommenter = styled.div`
  display: flex;
  align-items: baseline;

  & > cite {
    font-style: normal;
    margin-left: 12px;
  }
`

const CommentThreadLocation = styled.div`
  margin: 18px 0 28px;
`

const Callout = styled.div.attrs({ className: 'pt-callout pt-icon-error' })`
  line-height: 1.3;
  font-weight: 400;
  margin-bottom: 1em;
`

const HighlightedText = styled.div`
  font-size: 17px;
  line-height: 1.6;
  margin-top: -2px;
  ${({ disabled }: { disabled: boolean }) =>
    disabled &&
    css`
      pointer-events: none;
    `};
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
  className: 'pt-button pt-minimal pt-intent-primary',
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
  className: 'pt-button pt-intent-danger pt-icon-trash pt-minimal',
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
