/**
 * @providesModule CommentThread
 * @flow
 */
import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import Truncate from 'react-truncate'
import { FormattedMessage } from 'react-intl'

import { hoverCommentThread, deleteCommentThread } from 'redux/actions'
import { Link, matchPath } from 'react-router-dom'
import { commentThreadsOpen, commentsOpen } from 'shared/routes'

import Icon from 'utility/Icon'

import type { Location, RouterHistory, Match } from 'react-router-dom'
import type { Dispatch } from 'redux/actions'
import type { State, Comment } from 'redux/state'

type OwnProps = {
  threadId: string,
  location: Location,
  cardId: string,
  history: RouterHistory,
  last: boolean,
}

function mapStateToProps (state: State, ownProps: OwnProps) {
  const { threadId, location } = ownProps
  const thread = state.commentThreadsById[threadId]
  const comments = thread.commentIds.map(x => state.commentsById[x])
  const firstComment = comments.length > 0 ? comments[0] : {}
  const { reader } = state.caseData

  return {
    hovered: threadId === state.ui.hoveredCommentThread,
    selected: !!matchPath(location.pathname, commentsOpen(threadId)),
    lead: {
      placeholder: !firstComment.content,
      author: firstComment.reader
        ? firstComment.reader.name
        : reader ? reader.name : '',
      content: firstComment.content || (
        <FormattedMessage
          id="comments.placeholderContent"
          defaultMessage="New comment..."
        />
      ),
    },
    responses: comments.splice(1),
    canBeDeleted:
      reader &&
      ((reader.canUpdateCase && comments.length === 0) ||
        (!firstComment.content && reader.id === thread.readerId)),
  }
}

function mapDispatchToProps (dispatch: Dispatch, ownProps: OwnProps) {
  const { threadId, cardId, history, location } = ownProps
  return {
    handleMouseEnter: () => dispatch(hoverCommentThread(threadId)),
    handleMouseLeave: () => dispatch(hoverCommentThread(null)),
    handleDeleteThread: () => {
      const promise = dispatch(deleteCommentThread(threadId, cardId))

      const commentsMatch = matchPath(location.pathname, commentsOpen())
      if (
        commentsMatch &&
        `${threadId}` === commentsMatch.params.commentThreadId
      ) {
        const threadsMatch = matchPath(location.pathname, commentThreadsOpen())
        threadsMatch && history.replace(threadsMatch.url)
      }
      return promise
    },
  }
}

type LeadProps = { placeholder: boolean, author: string, content: React.Node }
type Props = {
  lead: LeadProps,
  responses: Comment[],
  hovered: boolean,
  selected: boolean,
  last: boolean,
  match: Match,
  threadId: string,
  canBeDeleted: boolean,
  handleMouseEnter: () => Promise<any>,
  handleMouseLeave: () => Promise<any>,
  handleDeleteThread: () => Promise<any>,
}

const CommentThread = ({
  lead,
  responses,
  hovered,
  selected,
  last,
  match,
  threadId,
  handleMouseEnter,
  handleMouseLeave,
  handleDeleteThread,
  canBeDeleted,
}: Props) => (
  <div className="pt-dark" style={{ position: 'relative' }}>
    <Link replace to={`${match.url}/${threadId}`} style={styles.linkReset}>
      <li
        style={styles.getCommentListItemStyle({ last, selected, hovered })}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <h4 style={styles.author}>{lead.author}</h4>
        <LeadSnippet lead={lead} />
        {responses.map((r, i) => {
          const numOthers = responses.length - 2
          switch (i) {
            case 0:
            case 1:
              return (
                <p
                  key={i}
                  style={{
                    ...styles.getCommentSnippetStyle({}),
                    ...styles.oneLineSnippet,
                  }}
                >
                  <span style={styles.initials}>{r.reader.initials}:</span>
                  <span>{r.content}</span>
                </p>
              )
            case 2:
              return (
                <p key="2" style={styles.getCommentSnippetStyle({})}>
                  <FormattedMessage
                    id="comments.otherComments"
                    defaultMessage={`{count, number} other {count, plural,
                    one {response}
                    other {responses}
                  }`}
                    values={{ count: numOthers }}
                  />
                </p>
              )
            default:
              return null
          }
        })}
      </li>
    </Link>
    {canBeDeleted && <DeleteThreadButton onClick={handleDeleteThread} />}
  </div>
)

// Truncate is slow so let's extend PureComponent
class LeadSnippet extends React.PureComponent<{ lead: LeadProps }> {
  render () {
    const { placeholder, content } = this.props.lead
    return (
      <p style={styles.getCommentSnippetStyle({ placeholder })}>
        <Truncate lines={3}>{content}</Truncate>
      </p>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CommentThread)

type Flags = { [string]: boolean }

const styles = {
  linkReset: {
    color: 'white',
    textDecoration: 'none',
  },

  getCommentListItemStyle: ({ last, selected, hovered }: Flags) => ({
    padding: '0.65em 0.5em 0.65em 1em',
    listStylePosition: 'inside',
    cursor: 'pointer',
    borderBottom: last || '1px solid #513992',
    ...(hovered ? { backgroundColor: '#6543c5' } : {}),
    ...(selected ? { backgroundColor: '#493092' } : {}),
  }),

  author: {
    display: 'inline',
    margin: 0,
    fontFamily: 'tenso',
    fontSize: 'inherit',
    fontStyle: 'normal',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: 'inherit',
  },

  getCommentSnippetStyle: ({ placeholder }: Flags) => ({
    margin: '0 0 0 1em',
    fontWeight: 400,
    lineHeight: 1.4,
    ...(placeholder ? { opacity: 0.5 } : {}),
  }),

  initials: {
    fontWeight: 600,
    marginRight: '0.5em',
  },

  oneLineSnippet: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}

const DeleteThreadButton = styled.button.attrs({
  className: 'pt-button pt-minimal pt-small pt-icon-trash pt-intent-danger',
})`
  position: absolute;
  top: calc(50% - 12px);
  right: 0.5em;
`
