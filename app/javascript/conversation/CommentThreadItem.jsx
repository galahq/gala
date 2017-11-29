/**
 * @providesModule CommentThreadItem
 * @flow
 */

import * as React from 'react'
import styled, { css } from 'styled-components'
import { connect } from 'react-redux'

import { FormattedMessage } from 'react-intl'
import Truncate from 'react-truncate'
import { matchPath, Link, withRouter } from 'react-router-dom'

import {
  CommentThreadBreadcrumbs,
  CommentThreadBreadcrumb,
} from 'conversation/shared'
import Identicon from 'shared/Identicon'

import type { ContextRouter } from 'react-router-dom'

import type { State } from 'redux/state'

function mapStateToProps (
  { commentThreadsById, cardsById, pagesById, commentsById }: State,
  { id, location }: { id: string, ...ContextRouter }
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
  const open = !!matchPath(location.pathname, { path: `/conversation/${id}` })

  return {
    open,
    commentsCount,
    mostRecentComment,
    originalHighlightText,
    pageNumber,
    readers,
    threadId: id,
  }
}

const CommentThreadItem = ({
  open,
  commentsCount,
  mostRecentComment,
  originalHighlightText,
  pageNumber,
  readers,
  threadId,
}) => (
  <CommentThreadLink to={`/conversation/${threadId}`} open={open}>
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
      <PureTruncate lines={5} content={mostRecentComment} />
    </MostRecentComment>

    <ConversationMetadata>
      <Indenticons>
        {readers.map(reader => (
          <Identicon
            presentational
            key={reader.hashKey}
            width={22}
            reader={reader}
          />
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
  </CommentThreadLink>
)
export default withRouter(connect(mapStateToProps)(CommentThreadItem))

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

const CommentThreadLink = styled(Link)`
  display: block;
  color: inherit;
  padding: 14px 18px;

  &:hover {
    color: inherit;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #bfbdac;
  }

  &:focus {
    outline: none;
    & ${CommentCount} {
      border: 3px rgb(210, 201, 239) solid;
      margin: -5px -10px;
      padding: 2px 7px;
    }
  }

  .pt-focus-disabled & {
    border: none;
    padding: 14px 18px;
    border-bottom: 1px solid #bfbdac;
  }

  ${({ open }) =>
    open &&
    css`
      background-color: #d2c9ef;

      & .has-text-shadow {
        text-shadow: #d2c9ef 0.03em 0px, #d2c9ef -0.03em 0px, #d2c9ef 0px 0.03em,
          #d2c9ef 0px -0.03em, #d2c9ef 0.06em 0px, #d2c9ef -0.06em 0px,
          #d2c9ef 0.09em 0px, #d2c9ef -0.09em 0px, #d2c9ef 0.12em 0px,
          #d2c9ef -0.12em 0px, #d2c9ef 0.15em 0px, #d2c9ef -0.15em 0px;
      }
    `};
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

// eslint-disable-next-line react/prefer-stateless-function
class PureTruncate extends React.PureComponent<{
  lines: number,
  content: string,
}> {
  render () {
    const { lines, content } = this.props
    return <Truncate lines={lines}>{content}</Truncate>
  }
}
