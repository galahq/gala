/**
 * @providesModule CommentThreadEntity
 * @flow
 */
import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

import type DraftEditorLeaf from 'draft-js/lib/DraftEditorLeaf.react'
import type { State } from 'redux/state'

function mapStateToProps (state: State, { children }) {
  let commentThreadId = getFirstThreadId(children[0]) || ''
  let commentThread = state.commentThreadsById[commentThreadId]
  return {
    cardId: commentThread?.cardId,
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

// $FlowFixMe
export default withRouter(
  connect(
    mapStateToProps,
    null,
    mergeProps
  )(CommentThreadEntity)
)

function getFirstThreadId (leaf: DraftEditorLeaf): ?string {
  const styles = leaf.props.block.getInlineStyleAt(leaf.props.start)
  const ids = styles
    .map(s => s.match(/thread--([0-9]+)/))
    .map(s => s && s[1])
    .filter(x => !!x)
  return ids.count() > 0 ? ids.toJS()[0] : null
}