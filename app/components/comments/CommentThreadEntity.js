import React from 'react'

const CommentThreadEntity = ({ contentState, children }) => {
  const threadIds = getThreadIds(contentState, children[0])
  return <span onClick={() => window.alert(`Open comment thread id: ${JSON.stringify(threadIds)}`)}>
    {children}
  </span>
}

export default CommentThreadEntity

function getThreadIds(contentState, leaf) {
  const styles = contentState.getBlockForKey(leaf.props.blockKey)
    .getInlineStyleAt(leaf.props.start)
  return styles.map(s => s.match(/thread--([0-9]+)/))
    .filter(s => s && s[1])
    .map(s => s[1])
}
