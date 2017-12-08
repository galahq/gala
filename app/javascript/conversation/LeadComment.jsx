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
import { StyledComment } from 'conversation/shared'
import Identicon from 'shared/Identicon'
import {
  ConversationTimestamp,
  CommentThreadBreadcrumbs,
  CommentThreadBreadcrumb,
  SmallGreyText,
} from 'conversation/shared'
import { styles } from 'card/draftConfig'

import type { IntlShape } from 'react-intl'
import type { Dispatch } from 'redux/actions'
import type { Page, Comment } from 'redux/state'

type OwnProps = {
  cardPosition: number,
  inSitu: boolean,
  inSituPath: string,
  intl: IntlShape,
  leadComment: ?Comment,
  originalHighlightText: string,
  page: Page,
  reader: { imageUrl: ?string, hashKey: string, name: string },
  responseCount: number,
  threadId: string,
  onCancel: (SyntheticMouseEvent<*>) => Promise<any>,
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

type Props = OwnProps & { handleDeleteThread: () => Promise<any> }

const LeadComment = ({
  cardPosition,
  handleDeleteThread,
  inSitu,
  inSituPath,
  intl,
  leadComment,
  originalHighlightText,
  page,
  reader,
  responseCount,
  threadId,
  onCancel,
}: Props) => [
  <LeadCommenter key="1">
    <Identicon presentational width={32} reader={reader} />
    <cite>{reader.name}</cite>
  </LeadCommenter>,

  <CommentThreadLocation key="2">
    <CommentThreadBreadcrumbs>
      <CommentThreadBreadcrumb>
        {inSitu ? (
          <FormattedMessage
            id="conversation.commentsOnPageNumber"
            defaultMessage="Comments on Page {position, number}"
            values={{ position: page.position }}
          />
        ) : (
          <FormattedMessage
            id="conversation.commentsOnPage"
            defaultMessage="Comments on “{title}”"
            values={{ title: page.title }}
          />
        )}
      </CommentThreadBreadcrumb>
      <CommentThreadBreadcrumb>
        <FormattedMessage
          id="conversation.cardN"
          defaultMessage="Card {cardPosition}"
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
  </CommentThreadLocation>,

  leadComment ? (
    <LeadCommentContents key="3">
      <Row>
        <SmallGreyText>
          <ConversationTimestamp value={leadComment.timestamp} />
        </SmallGreyText>
        {responseCount === 0 && (
          <DeleteButton
            aria-label={intl.formatMessage({
              id: 'comments.deleteCommentThread',
              defaultMessage: 'Delete comment thread',
            })}
            onClick={handleDeleteThread}
          />
        )}
      </Row>
      <blockquote>
        <StyledComment markdown={leadComment.content} />
      </blockquote>
    </LeadCommentContents>
  ) : (
    <FirstPostForm key="3" threadId={threadId} onCancel={onCancel} />
  ),
]
export default injectIntl(connect(null, mapDispatchToProps)(LeadComment))

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

const DeleteButton = styled.button.attrs({
  className: 'pt-button pt-intent-danger pt-icon-trash pt-minimal',
})`
  transition: opacity 0.2s;
  opacity: 0;
  ${LeadCommentContents}:hover & {
    opacity: 1;
  }
`
