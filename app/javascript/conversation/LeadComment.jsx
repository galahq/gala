/**
 * @providesModule LeadComment
 * @flow
 */

import * as React from 'react'
import styled, { css } from 'styled-components'

import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import Identicon from 'shared/Identicon'
import {
  ConversationTimestamp,
  CommentThreadBreadcrumbs,
  CommentThreadBreadcrumb,
  SmallGreyText,
} from 'conversation/shared'
import { styles } from 'card/draftConfig'

import type { Page, Comment } from 'redux/state'

type Props = {
  cardPosition: number,
  inSitu: boolean,
  inSituPath: string,
  leadComment: ?Comment,
  originalHighlightText: string,
  page: Page,
  reader: { imageUrl: ?string, hashKey: string, name: string },
}
const LeadComment = ({
  cardPosition,
  inSitu,
  inSituPath,
  leadComment,
  originalHighlightText,
  page,
  reader,
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

  leadComment && (
    <LeadCommentContents key="3">
      <SmallGreyText>
        <ConversationTimestamp value={leadComment.timestamp} />
      </SmallGreyText>
      <blockquote>{leadComment.content}</blockquote>
    </LeadCommentContents>
  ),
]
export default LeadComment

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
