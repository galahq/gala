import React from 'react'
import { connect } from 'react-redux'
import { selectCommentThread, hoverCommentThread } from 'redux/actions.js'
import Truncate from 'react-truncate'
import { FormattedMessage } from 'react-intl'
import Icon from 'Icon.js'

function mapStateToProps(state, ownProps) {
  const thread = state.commentThreadsById[ownProps.threadId]
  const comments = thread.commentIds.map( x => state.commentsById[x] )
  const firstComment = comments.length > 0 ? comments[0] : {}

  return {
    hovered: ownProps.threadId === state.ui.hoveredCommentThread,
    selected: ownProps.threadId === state.ui.selectedCommentThread,
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
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  const {threadId} = ownProps
  return {
    handleClick: () => dispatch(selectCommentThread(threadId)),
    handleMouseEnter: () => dispatch(hoverCommentThread(threadId)),
    handleMouseLeave: () => dispatch(hoverCommentThread(null)),
    handleDeleteThread: () => {},
  }
}

const CommentThread = ({lead, responses, threadId, hovered, selected, last,
  handleClick, handleMouseEnter, handleMouseLeave, handleDeleteThread}) =>
<a style={styles.linkReset}>
  <li
    key={threadId}
    style={styles.getCommentListItemStyle({last, selected, hovered})}
    onClick={handleClick}
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
  >
    <h4 style={styles.author}>{lead.author}</h4>
    <p style={styles.getCommentSnippetStyle({placeholder: lead.placeholder})}>
      <Truncate lines={3}>{lead.content}</Truncate>
    </p>

    {
      responses.map((r, i) => {
        const numOthers = responses.length - 2
        switch(i) {
          case 0:
          case 1:
            return <p
              key={i}
              style={{...styles.commentSnippet, ...styles.oneLineSnippet}}
            >
              <span style={styles.initials}>{r.reader.initials}:</span>
              <span>{r.content}</span>
            </p>
          case 2:
            return <p key="2" style={styles.commentSnippet}>
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

    {lead.placeholder &&
        <a>
          <Icon className="CommentThread__icon-button" filename="trash"
            onClick={handleDeleteThread}
            style={styles.deleteCommentThread} />
        </a>}
  </li>
</a>

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
    position: 'relative',
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
