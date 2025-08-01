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
  // fix 404 when changing the history
  const basePath = match.url.split('/comments/')[0]
  const url =
    cardId != null && commentThreadId
      ? `${basePath}/comments/${commentThreadId}`
      : ''

  return {
    onClick: () => {
      if (!cardId || disabled || url === '') return
      history.replace(url)
    },
    children:
      children.length > 0 &&
      React.cloneElement(children[0], { forceSelection: true }),
  }
}

const CommentThreadEntity = ({ onClick, children }) => {
  const handleKeyDown = (e: SyntheticKeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  return (
    <span
      className="c-comment-thread-entity"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
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
