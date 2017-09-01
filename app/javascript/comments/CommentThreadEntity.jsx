import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import typeof { ContentState, DraftEditorLeaf } from 'draft-js'
import type { State } from 'redux/state'

function mapStateToProps (state: State, { contentState, children }) {
  let commentThreadId = getFirstThreadId(contentState, children[0])
  let commentThread = state.commentThreadsById[commentThreadId]
  return {
    cardId: commentThread && commentThread.cardId,
    disabled: state.ui.acceptingSelection || !state.caseData.commentable,
    commentThreadId,
  }
}

function mergeProps (
  { cardId, commentThreadId, disabled },
  _,
  { children, history, match }
) {
  return {
    onClick: () => {
      !cardId ||
        disabled ||
        history.replace(
          `${match.url}/cards/${cardId}/comments/${commentThreadId}`
        )
    },
    children:
      children.length > 0 &&
      React.cloneElement(children[0], { forceSelection: true }),
  }
}

const CommentThreadEntity = ({ onClick, children }) => {
  return (
    <span className="c-comment-thread-entity" onClick={onClick}>
      {children}
    </span>
  )
}

export default withRouter(
  connect(mapStateToProps, {}, mergeProps)(CommentThreadEntity)
)

function getFirstThreadId (contentState: ContentState, leaf: DraftEditorLeaf) {
  const styles = contentState
    .getBlockForKey(leaf.props.blockKey)
    .getInlineStyleAt(leaf.props.start)
  const ids = styles
    .map(s => s.match(/thread--([0-9]+)/))
    .filter(s => s && s[1])
    .map(s => s[1])
  return ids.count() > 0 ? ids.toJS()[0] : null
}
