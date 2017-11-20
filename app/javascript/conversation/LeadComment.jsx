/**
 * @providesModule LeadComment
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'

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

import type { Comment } from 'redux/state'

type Props = {
  cardPosition: number,
  inSituPath: string,
  leadComment: Comment,
  originalHighlightText: string,
  pageTitle: string,
  reader: { imageUrl: ?string, hashKey: string, name: string },
}
const LeadComment = ({
  cardPosition,
  inSituPath,
  leadComment,
  originalHighlightText,
  pageTitle,
  reader,
}: Props) => [
  <LeadCommenter key="1">
    <Identicon width={32} reader={reader} />
    <cite>{reader.name}</cite>
  </LeadCommenter>,

  <CommentThreadLocation key="2">
    <CommentThreadBreadcrumbs>
      <CommentThreadBreadcrumb>
        <FormattedMessage
          id="conversation.commentsOnPage"
          defaultMessage="Comments on “{pageTitle}”"
          values={{ pageTitle }}
        />
      </CommentThreadBreadcrumb>
      <CommentThreadBreadcrumb>
        <FormattedMessage
          id="conversation.cardN"
          defaultMessage="Card {cardPosition}"
          values={{ cardPosition }}
        />
      </CommentThreadBreadcrumb>
    </CommentThreadBreadcrumbs>
    <HighlightedText>
      <Link
        to={inSituPath}
        className="CommentThread__metadata__text"
        style={styles.purpleHighlight}
      >
        {originalHighlightText}
      </Link>
    </HighlightedText>
    {/* http://localhost:3000/en/cases/ethiopia-napa/4/cards/77/comments/53 */}
  </CommentThreadLocation>,

  <LeadCommentContents key="3">
    <SmallGreyText>
      <ConversationTimestamp value={leadComment.timestamp} />
    </SmallGreyText>
    <blockquote>{leadComment.content}</blockquote>
  </LeadCommentContents>,
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
`

const LeadCommentContents = styled.div`
  margin: 20px 0 50px;

  &:last-child {
    margin-bottom: 0;
  }

  & > blockquote {
    padding: 0;
    border: none;
    font-size: 17px;
    line-height: 1.3;
  }
`
