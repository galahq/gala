import React from 'react'
import { connect } from 'react-redux'
import { selectCommentThread } from 'redux/actions.js'
import Truncate from 'react-truncate'

function mapStateToProps(state, ownProps) {
  const thread = state.commentThreadsById[ownProps.threadId]
  const firstCommentId = thread.commentIds[0]
  const firstComment = firstCommentId ? state.commentsById[firstCommentId] : {}

  return {
    selected: ownProps.threadId === state.ui.selectedCommentThread,
    author: firstComment.reader
      ? firstComment.reader.name
      : state.caseData.reader.name,
    snippet: firstComment.content || "New comment...",
  }
}

const CommentThread = ({author, snippet, threadId, selected, selectCommentThread,
                       last}) =>
  <li key={threadId} style={{
    ...styles.commentListItem,
    borderBottom: last || '1px solid #513992',
    ...(selected ? {backgroundColor: "#493092"} : {}),
  }} onClick={() => selectCommentThread(threadId)}>
  <h4 style={styles.author}>{author}</h4>
  <p style={styles.commentSnippet}><Truncate lines={3}>{snippet}</Truncate></p>
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
}
