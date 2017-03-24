import React from 'react'
import { connect } from 'react-redux'
import { openCommentThreads, selectCommentThread } from 'redux/actions.js'
import { withRouter } from 'react-router-dom'

function mapStateToProps(state, { contentState, children }) {
  let commentThreadId = getFirstThreadId(contentState, children[0])
  let commentThread = state.commentThreadsById[commentThreadId]
  return {
    cardId: commentThread && commentThread.cardId,
    disabled: state.ui.acceptingSelection,
    commentThreadId,
  }
}

function mergeProps(
  {cardId, commentThreadId, disabled},
  {},
  {children, history, match}
) {
  return {
    onClick: () => {
      !cardId || disabled ||
        (history.replace(`${match.url}/cards/${cardId}/comments/${commentThreadId}`))
    },
    children: children.length > 0
      && React.cloneElement(children[0], {forceSelection: true}),
  }
}

const CommentThreadEntity = ({ onClick, children }) => {
  return <span onClick={onClick}>
    {children}
  </span>
}

export default withRouter(connect(
  mapStateToProps,
  {},
  mergeProps,
)(CommentThreadEntity))

function getFirstThreadId(contentState, leaf) {
  const styles = contentState.getBlockForKey(leaf.props.blockKey)
    .getInlineStyleAt(leaf.props.start)
  const ids = styles.map(s => s.match(/thread--([0-9]+)/))
    .filter(s => s && s[1])
    .map(s => s[1])
  return ids.count() > 0 ? ids.toJS()[0] : null
}
