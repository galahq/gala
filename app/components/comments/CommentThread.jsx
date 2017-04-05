import React from 'react'
import { connect } from 'react-redux'
import { selectCommentThread, hoverCommentThread,
  deleteCommentThread } from 'redux/actions.js'
import Truncate from 'react-truncate'
import { FormattedMessage } from 'react-intl'
import Icon from 'Icon.js'
import { Link, matchPath } from 'react-router-dom'
import { commentThreadsOpen, commentsOpen } from 'concerns/routes'

function mapStateToProps(state, {threadId, location}) {
  const thread = state.commentThreadsById[threadId]
  const comments = thread.commentIds.map( x => state.commentsById[x] )
  const firstComment = comments.length > 0 ? comments[0] : {}

  return {
    hovered: threadId === state.ui.hoveredCommentThread,
    selected: matchPath(location.pathname, commentsOpen(threadId)),
    lead: {
      placeholder: !firstComment.content,
      author: firstComment.reader
        ? firstComment.reader.name
        : state.caseData.reader.name,
      content: firstComment.content || <FormattedMessage
        id="comments.placeholderContent"
        defaultMessage="New comment..." />,
    },
    responses: comments.splice(1),
    canBeDeleted: !firstComment.content &&
      state.caseData.reader.id === thread.readerId,
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const {threadId, cardId, history, location} = ownProps
  return {
    handleMouseEnter: () => dispatch(hoverCommentThread(threadId)),
    handleMouseLeave: () => dispatch(hoverCommentThread(null)),
    handleDeleteThread: () => {
      dispatch(deleteCommentThread(threadId, cardId))

      const commentsMatch = matchPath(location.pathname, commentsOpen())
      if (commentsMatch && threadId === parseInt(commentsMatch.params.commentThreadId, 10))
        history.replace(matchPath(location.pathname, commentThreadsOpen()).url)
    },
  }
}

const CommentThread = ({lead, responses, hovered, selected, last,
  match, threadId, handleMouseEnter, handleMouseLeave, handleDeleteThread,
  canBeDeleted}) =>
<div style={{position: 'relative'}}>
  <Link to={`${match.url}/${threadId}`} replace style={styles.linkReset}>
    <li
      style={styles.getCommentListItemStyle({last, selected, hovered})}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <h4 style={styles.author}>{lead.author}</h4>
      <LeadSnippet lead={lead} />
      {
        responses.map((r, i) => {
          const numOthers = responses.length - 2
          switch(i) {
            case 0:
            case 1:
              return <p
                key={i}
                style={{
                  ...styles.getCommentSnippetStyle({}),
                  ...styles.oneLineSnippet,
                }}>
                <span style={styles.initials}>{r.reader.initials}:</span>
                <span>{r.content}</span>
              </p>
            case 2:
              return <p key="2" style={styles.getCommentSnippetStyle({})}>
                <FormattedMessage id="comments.otherComments"
                  defaultMessage={`{count, number} other {count, plural,
                    one {response}
                    other {responses}
                  }`}
                  values={{count: numOthers}} />
              </p>
            default: return null
          }
        })
      }

    </li>
  </Link>
  {canBeDeleted &&
    <a>
      <Icon className="CommentThread__icon-button" filename="trash"
        onClick={handleDeleteThread}
        style={styles.deleteCommentThread} />
    </a>}
</div>

// Truncate is slow so let's extend PureComponent
class LeadSnippet extends React.PureComponent {
  render() {
    const {placeholder, content} = this.props.lead
    return <p style={styles.getCommentSnippetStyle({placeholder: placeholder})}>
      <Truncate lines={3}>{content}</Truncate>
    </p>
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CommentThread)

const styles = {
  linkReset: {
    color: 'white',
    textDecoration: 'none',
  },

  getCommentListItemStyle: ({last, selected, hovered}) => ({
    padding: '0.65em 0.5em 0.65em 1em',
    listStylePosition: 'inside',
    cursor: 'pointer',
    borderBottom: last || '1px solid #513992',
    ...(hovered ? {backgroundColor: '#6543c5'} : {}),
    ...(selected ? {backgroundColor: '#493092'} : {}),
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

  getCommentSnippetStyle: ({placeholder}) => ({
    margin: '0 0 0 1em',
    fontWeight: 400,
    lineHeight: 1.4,
    ...(placeholder && {opacity: 0.5}),
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

  deleteCommentThread: {
    position: 'absolute',
    top: 22,
    right: '0.5em',
    width: 26,
    height: 26,
  },
}
