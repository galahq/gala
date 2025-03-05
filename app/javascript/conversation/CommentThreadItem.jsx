/**
 * @providesModule CommentThreadItem
 * @flow
 */

import * as React from 'react'
import styled, { css } from 'styled-components'
import { connect } from 'react-redux'
import { injectIntl, FormattedMessage } from 'react-intl'
import Truncate from 'react-truncate'
import { matchPath, Link, withRouter } from 'react-router-dom'
import { EditorState } from 'draft-js'

import {
  CommentThreadBreadcrumbs,
  CommentThreadBreadcrumb,
} from 'conversation/shared'
import Identicon from 'shared/Identicon'
import { ScrollIntoView } from 'utility/ScrollView'

import { commentsOpen, commentThreadsOpen } from 'shared/routes'
import { hoverCommentThread, deleteCommentThread } from 'redux/actions'

import type { ContextRouter } from 'react-router-dom'

import type { Dispatch } from 'redux/actions'
import type { State } from 'redux/state'

type OwnProps = { id: string, ...ContextRouter }
function mapStateToProps (
  { commentThreadsById, cardsById, pagesById, commentsById, ui }: State,
  { id, location, match }: OwnProps
) {
  const {
    cardId,
    commentsCount,
    commentIds,
    originalHighlightText,
    readers,
  } = commentThreadsById[id]
  const { position: pageNumber } =
    cardId != null ? pagesById[cardsById[cardId].pageId] : {}

  const mostRecentComment =
    commentsById[commentIds[commentIds.length - 1]] || {}
  const mostRecentCommentContent =
    mostRecentComment.content ||
    EditorState.createEmpty()
      .getCurrentContent()
      .getPlainText()

  const open =
    !!matchPath(location.pathname, { path: `/conversation/${id}` }) ||
    !!matchPath(location.pathname, commentsOpen(id))

  return {
    open,
    commentsCount,
    mostRecentCommentContent,
    originalHighlightText,
    pageNumber,
    readers,
    threadId: id,
    basename: location.pathname.replace(/\/[0-9]+$/, ''),
  }
}

function mapDispatchToProps (
  dispatch: Dispatch,
  { id, history, location }: OwnProps
) {
  const inSitu = /cards/.test(location.pathname)
  const hoverHandlers = inSitu
    ? {
        handleMouseEnter: () => dispatch(hoverCommentThread(id)),
        handleMouseLeave: () => dispatch(hoverCommentThread(null)),
      }
    : {}
  return {
    ...hoverHandlers,
    handleDeleteThread: (e: SyntheticMouseEvent<*>) => {
      e.preventDefault()
      const promise = dispatch(deleteCommentThread(id))

      const commentsMatch = matchPath(location.pathname, commentsOpen())
      if (commentsMatch && `${id}` === commentsMatch.params.threadId) {
        const threadsMatch = matchPath(location.pathname, commentThreadsOpen())
        threadsMatch && history.replace(threadsMatch.url)
      }
      return promise
    },
  }
}

const CommentThreadItem = ({
  basename,
  commentsCount,
  handleMouseEnter,
  handleMouseLeave,
  handleDeleteThread,
  intl,
  mostRecentCommentContent,
  open,
  originalHighlightText,
  pageNumber,
  readers,
  threadId,
}) => (
  <CommentThreadLink
    to={`${basename}/${threadId}`}
    open={open}
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
  >
    {originalHighlightText && (
      <CommentThreadBreadcrumbs>
        <CommentThreadBreadcrumb>
          <FormattedMessage
            id="commentThreads.show.pageN"
            values={{ pageNumber }}
          />
        </CommentThreadBreadcrumb>
        <CommentThreadBreadcrumb quotation>
          {originalHighlightText}
        </CommentThreadBreadcrumb>
      </CommentThreadBreadcrumbs>
    )}

    <MostRecentComment>
      {mostRecentCommentContent ? (
        <PureTruncate lines={5} content={mostRecentCommentContent} />
      ) : (
        <Grey>
          <FormattedMessage id="commentThreads.new.newCommentThread" />
        </Grey>
      )}
    </MostRecentComment>

    {open && <ScrollIntoView />}

    <ConversationMetadata>
      <Indenticons>
        {readers.length > 0 &&
          readers.map(reader => (
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
          id="comments.index.nResponses.js"
          values={{ count: commentsCount }}
        />
      </CommentCount>
    </ConversationMetadata>
  </CommentThreadLink>
)
// $FlowFixMe
export default withRouter(
  injectIntl(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(CommentThreadItem)
  )
)

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

  .bp3-focus-disabled & {
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

const Grey = styled.span`
  color: #5c7080;
`

// eslint-disable-next-line react/prefer-stateless-function
class PureTruncate extends React.PureComponent<{
  lines: number,
  content: string,
}> {
  render () {
    const { lines, content } = this.props
    return (
      <Truncate lines={lines}>
        {content.split(/\n+/).map((line, i, arr) => {
          line = <span key={i}>{line}</span>

          if (i === arr.length - 1) {
            return line
          } else {
            return [line, <br key={i + 'br'} />]
          }
        })}
      </Truncate>
    )
  }
}
