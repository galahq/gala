/**
 * @providesModule CommentThreadItem
 * @flow
 */

import * as React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'

import { FormattedMessage } from 'react-intl'
import Truncate from 'react-truncate'

import {
  CommentThreadBreadcrumbs,
  CommentThreadBreadcrumb,
} from 'conversation/shared'
import Identicon from 'shared/Identicon'

import type { State } from 'redux/state'

function mapStateToProps (
  { commentThreadsById, cardsById, pagesById, commentsById }: State,
  { id }: { id: string }
) {
  const {
    cardId,
    commentsCount,
    commentIds,
    originalHighlightText,
    readers,
  } = commentThreadsById[id]
  const { position: pageNumber } = pagesById[cardsById[cardId].pageId]
  const mostRecentComment =
    commentsById[commentIds[commentIds.length - 1]].content

  return {
    pageNumber,
    originalHighlightText,
    mostRecentComment,
    commentsCount,
    readers,
  }
}

const CommentThreadItem = ({
  pageNumber,
  originalHighlightText,
  mostRecentComment,
  commentsCount,
  readers,
}) => (
  <CommentThreadContainer>
    <CommentThreadBreadcrumbs>
      <CommentThreadBreadcrumb>
        <FormattedMessage
          id="case.pageN"
          defaultMessage={`Page {pageNumber, number}`}
          values={{ pageNumber }}
        />
      </CommentThreadBreadcrumb>
      <CommentThreadBreadcrumb quotation>
        {originalHighlightText}
      </CommentThreadBreadcrumb>
    </CommentThreadBreadcrumbs>

    <MostRecentComment>
      <Truncate lines={5}>{mostRecentComment}</Truncate>
    </MostRecentComment>

    <ConversationMetadata>
      <Indenticons>
        {readers.map(reader => (
          <Identicon key={reader.email} width={22} reader={reader} />
        ))}
      </Indenticons>
      <CommentCount>
        <FormattedMessage
          id="comments.nResponses"
          defaultMessage={`{count, number} {count, plural,
          one {response}
          other {responses}
        }`}
          values={{ count: commentsCount }}
        />
      </CommentCount>
    </ConversationMetadata>
  </CommentThreadContainer>
)
export default connect(mapStateToProps)(CommentThreadItem)

const CommentThreadContainer = styled.div`
  padding: 14px 18px;

  &:not(:last-child) {
    border-bottom: 1px solid #bfbdac;
  }
`

const MostRecentComment = styled.blockquote`
  padding: 0;
  border: none;
  font-size: 16px;
  line-height: 1.3;
  margin: 0.25em 0;

  &:first-child {
    margin-top: 7px;
  }
`

const ConversationMetadata = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 14px 0 0.5em;
`
const Indenticons = styled.div`
  display: flex;
  justify-content: flex-start;

  & .Identicon {
    margin-right: 5px;
  }
`
const CommentCount = styled.div`
  color: #5c7080;
  font-size: 13px;
`
