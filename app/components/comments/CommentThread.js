import React from 'react'
import { connect } from 'react-redux'
import { selectCommentThread } from 'redux/actions.js'
import Truncate from 'react-truncate'

function mapStateToProps(state, ownProps) {
  const thread = state.commentThreadsById[ownProps.threadId]
  const comments = thread.commentIds.map( x => state.commentsById[x] )
  const firstComment = comments.length > 0 ? comments[0] : {}

  return {
    selected: ownProps.threadId === state.ui.selectedCommentThread,
    lead: {
      author: firstComment.reader
        ? firstComment.reader.name
        : state.caseData.reader.name,
      content: firstComment.content || "New comment...",
    },
    responses: comments.splice(1),
  }
}

const CommentThread = ({lead, responses, threadId, selected, selectCommentThread,
                       last}) =>
  <li key={threadId} style={{
    ...styles.commentListItem,
    borderBottom: last || '1px solid #513992',
    ...(selected ? {backgroundColor: "#493092"} : {}),
  }} onClick={() => selectCommentThread(threadId)}>
  <h4 style={styles.author}>{lead.author}</h4>
  <p style={styles.commentSnippet}>
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
            {numOthers} other response{numOthers === 1 ? '' : 's'}
          </p>
        default: return null
      }
    })
  }
</li>

export default connect(
  mapStateToProps,
  {selectCommentThread},
)(CommentThread)

const styles = {
  commentListItem: {
    padding: '0.65em 0.5em 0.65em 1em',
    listStylePosition: 'inside',
    cursor: 'pointer',
  },

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

  commentSnippet: {
    margin: '0 0 0 1em',
    fontWeight: 400,
    lineHeight: 1.4,
  },

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
