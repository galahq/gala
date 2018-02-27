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
import type { State, Page, Comment } from 'redux/state'

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

function mapStateToProps ({ caseData }: State) {
  const { reader } = caseData
  return {
    readerCanDeleteComments: reader && reader.canUpdateCase,
  }
}
type StateProps = { readerCanDeleteComments: boolean }

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
  onCancel,
}: Props) => (
  <React.Fragment>
    <LeadCommenter>
      <Identicon presentational width={32} reader={reader} />
      <cite>{reader.name}</cite>
    </LeadCommenter>

    {page != null &&
      inSituPath != null && (
        <CommentThreadLocation>
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
          <SmallGreyText>
            <ConversationTimestamp value={leadComment.timestamp} />
          </SmallGreyText>
          {readerCanDeleteComments &&
            responseCount === 0 && (
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
      </LeadCommentContents>
    ) : (
      <FirstPostForm key="3" threadId={threadId} onCancel={onCancel} />
    )}
  </React.Fragment>
)

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(LeadComment)
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
