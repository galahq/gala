import React from 'react'
import { connect } from 'react-redux'
import { openCommentThreads, selectCommentThread } from 'redux/actions.js'

function mapStateToProps(state, { contentState, children }) {
  let commentThreadId = getFirstThreadId(contentState, children[0])
  return {
    cardId: state.commentThreadsById[commentThreadId].cardId,
    disabled: state.ui.acceptingSelection,
    commentThreadId,
  }
}

function mergeProps(
  {cardId, commentThreadId, disabled},
  {openCommentThreads, selectCommentThread},
  {children}
) {
  return {
    onClick: () => {
      disabled ||
      ( openCommentThreads(cardId) &&
        selectCommentThread(parseInt(commentThreadId, 10)) )
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

export default connect(
  mapStateToProps,
  { openCommentThreads, selectCommentThread },
  mergeProps,
)(CommentThreadEntity)

function getFirstThreadId(contentState, leaf) {
  const styles = contentState.getBlockForKey(leaf.props.blockKey)
    .getInlineStyleAt(leaf.props.start)
  const ids = styles.map(s => s.match(/thread--([0-9]+)/))
    .filter(s => s && s[1])
    .map(s => s[1])
  return ids.count() > 0 ? ids.toJS()[0] : null
}
